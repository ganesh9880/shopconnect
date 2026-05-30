const API_BASE = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');
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

export async function api(path, options = {}) {
  const res = await fetch(`${API}${path}`, {
    ...options,
    headers: { ...authHeaders(options.body), ...options.headers },
  });
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
