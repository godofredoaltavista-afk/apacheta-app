/* =============================================
   APACHETA — AUTH MIDDLEWARE
   Fase 1: device fingerprint via header
   Sin OAuth, soberanía digital total
   ============================================= */

export function getUserId(req) {
  return req.headers['x-apacheta-user-id'] || null;
}

export function requireUserId(req, res) {
  const userId = getUserId(req);
  if (!userId) {
    res.status(401).json({ error: 'X-Apacheta-User-Id requerido' });
    return null;
  }
  return userId;
}
