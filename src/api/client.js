/* =============================================
   APACHETA — API CLIENT
   Fetch wrapper con userId header automático.
   Fallback silencioso a localStorage si offline.
   ============================================= */

// Genera/recupera el userId del dispositivo
function getDeviceUserId() {
  let uid = localStorage.getItem('apacheta_uid');
  if (!uid) {
    uid = crypto.randomUUID();
    localStorage.setItem('apacheta_uid', uid);
  }
  return uid;
}

export const deviceUserId = getDeviceUserId();

// Fetch base con userId header siempre incluido
export async function apiFetch(path, options = {}) {
  const url = `/api${path}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'X-Apacheta-User-Id': deviceUserId,
      ...(options.headers || {}),
    },
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`${options.method || 'GET'} ${url} → ${res.status}: ${text}`);
  }
  return res.json();
}

// Helpers por método
export const apiGet    = (path)       => apiFetch(path);
export const apiPost   = (path, body) => apiFetch(path, { method: 'POST',   body: JSON.stringify(body) });
export const apiPatch  = (path, body) => apiFetch(path, { method: 'PATCH',  body: JSON.stringify(body) });
export const apiDelete = (path)       => apiFetch(path, { method: 'DELETE' });

// Ejecuta fn() con fallback si falla (red offline, API error, etc.)
// No bloquea — swallows el error y ejecuta el fallback
export async function withFallback(fn, fallback) {
  try {
    return await fn();
  } catch (err) {
    console.warn('[api] fallback activado:', err.message);
    return typeof fallback === 'function' ? fallback() : fallback;
  }
}
