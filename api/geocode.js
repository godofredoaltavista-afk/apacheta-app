/* =============================================
   APACHETA — /api/geocode
   Proxy Nominatim (OpenStreetMap) para evitar CORS
   ============================================= */

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { q = '', limit = '5' } = req.query;
  const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&limit=${limit}&addressdetails=1`;

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Apacheta/1.0 (francoaltavista@gmail.com)',
        'Accept-Language': 'es',
      },
    });

    if (!response.ok) throw new Error(`Nominatim ${response.status}`);
    const data = await response.json();
    res.status(200).json(data);
  } catch (err) {
    console.error('[api/geocode]', err);
    res.status(500).json({ error: 'geocoding failed', detail: err.message });
  }
}
