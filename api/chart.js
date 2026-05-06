/* =============================================
   APACHETA — /api/chart
   Proxy para Swiss Ephemeris (astro.com/cgi/swetest.cgi)
   Evita CORS en producción Vercel
   ============================================= */

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const params = new URLSearchParams(req.query);
  const url = `https://www.astro.com/cgi/swetest.cgi?${params.toString()}`;

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; Apacheta/1.0; francoaltavista@gmail.com)',
        'Accept': 'text/plain, */*',
      },
    });

    if (!response.ok) {
      return res.status(response.status).send(`swetest error: ${response.status}`);
    }

    const text = await response.text();
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.status(200).send(text);
  } catch (err) {
    console.error('[api/chart]', err);
    res.status(500).json({ error: 'swetest unreachable', detail: err.message });
  }
}
