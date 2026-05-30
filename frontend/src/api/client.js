function resolveApiBase() {
  const fromEnv = (import.meta.env.VITE_API_URL || '').trim().replace(/\/$/, '');
  if (fromEnv) return fromEnv;
  // Local dev: Vite proxies /api
  if (import.meta.env.DEV) return '';
  // Combined deploy (API + UI same Web Service): same origin
  if (typeof window !== 'undefined') return window.location.origin;
  return '';
}

export const API_BASE = resolveApiBase();
const API = `${API_BASE}/api`;

function authHeaders(body) {
  const token =
    localStorage.getItem('adminToken') || localStorage.getItem('customerToken');
  const headers = {};
  if (!(body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
}

async function parseApiResponse(res) {
  const type = res.headers.get('content-type') || '';
  const text = await res.text();
  if (text.trimStart().startsWith('<') || type.includes('text/html')) {
    throw new Error(
      'API not reachable (got HTML). On Render Static Site set VITE_API_URL to your Web Service URL (e.g. https://your-api.onrender.com), then redeploy.',
    );
  }
  try {
    return text ? JSON.parse(text) : {};
  } catch {
    throw new Error('Invalid response from server');
  }
}

function networkError(path, err) {
  const target = `${API}${path}`;
  const hint =
    !import.meta.env.VITE_API_URL && import.meta.env.PROD
      ? ' Set VITE_API_URL on the Render Static Site to your API URL and redeploy. On the API, set FRONTEND_URL to this shop URL.'
      : ' On the API service set FRONTEND_URL to this exact shop URL (https://…) and redeploy.';
  return new Error(
    `Cannot reach API at ${target}. ${err?.message || 'Network error'}.${hint}`,
  );
}

export async function api(path, options = {}) {
  let res;
  try {
    res = await fetch(`${API}${path}`, {
      ...options,
      headers: { ...authHeaders(options.body), ...options.headers },
    });
  } catch (err) {
    throw networkError(path, err);
  }
  const data = await parseApiResponse(res);
  if (!res.ok) throw new Error(data.error || res.statusText);
  return data;
}

export async function apiForm(path, formData, method = 'POST') {
  const res = await fetch(`${API}${path}`, {
    method,
    headers: authHeaders(formData),
    body: formData,
  });
  const data = await parseApiResponse(res);
  if (!res.ok) throw new Error(data.error || res.statusText);
  return data;
}

export function shopWhatsapp(message) {
  const phone =
    import.meta.env.VITE_SHOP_WHATSAPP?.replace(/\D/g, '') || '';
  if (!phone) return null;
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}
