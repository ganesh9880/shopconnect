let apiBaseCache = null;
let apiBasePromise = null;

async function loadApiBase() {
  if (apiBaseCache !== null) return apiBaseCache;

  const fromEnv = (import.meta.env.VITE_API_URL || '').trim().replace(/\/$/, '');
  if (fromEnv) {
    apiBaseCache = fromEnv;
    return apiBaseCache;
  }

  if (import.meta.env.DEV) {
    apiBaseCache = '';
    return apiBaseCache;
  }

  try {
    const res = await fetch('/config.json', { cache: 'no-store' });
    const cfg = await res.json();
    const fromFile = (cfg.apiUrl || '').trim().replace(/\/$/, '');
    if (fromFile) {
      apiBaseCache = fromFile;
      return apiBaseCache;
    }
  } catch {
    /* ignore */
  }

  throw new Error(
    'Shop API URL is not configured. On Render Static Site: set VITE_API_URL to your Web Service URL (where /api/health returns JSON), save, then redeploy the static site.',
  );
}

export function getApiBase() {
  if (!apiBasePromise) apiBasePromise = loadApiBase();
  return apiBasePromise;
}

function apiUrl(path) {
  return getApiBase().then((base) => `${base}/api${path}`);
}

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
    const base = await getApiBase().catch(() => '');
    throw new Error(
      `API returned HTML instead of JSON. VITE_API_URL is wrong or missing. Current API base: "${base || '(not set)'}". Use your Web Service URL (where /api/health shows JSON), not the static shop URL.`,
    );
  }
  try {
    return text ? JSON.parse(text) : {};
  } catch {
    throw new Error('Invalid response from server');
  }
}

export async function api(path, options = {}) {
  const url = await apiUrl(path);
  let res;
  try {
    res = await fetch(url, {
      ...options,
      headers: { ...authHeaders(options.body), ...options.headers },
    });
  } catch (err) {
    throw new Error(
      `Cannot reach API at ${url}. ${err?.message || 'Network error'}. Set VITE_API_URL on the static site and FRONTEND_URL on the API, then redeploy both.`,
    );
  }
  const data = await parseApiResponse(res);
  if (!res.ok) throw new Error(data.error || res.statusText);
  return data;
}

export async function apiForm(path, formData, method = 'POST') {
  const url = await apiUrl(path);
  let res;
  try {
    res = await fetch(url, {
      method,
      headers: authHeaders(formData),
      body: formData,
    });
  } catch (err) {
    throw new Error(`Cannot reach API at ${url}. ${err?.message || 'Network error'}`);
  }
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
