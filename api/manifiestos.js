/* =============================================
   APACHETA — /api/manifiestos
   GET todos + POST crear manifiesto
   El supermanifiesto vivo crece en MongoDB
   ============================================= */

import { connectDB } from './_lib/db.js';
import { Manifiesto } from './_lib/models.js';
import { requireUserId } from './_lib/auth.js';

export default async function handler(req, res) {
  await connectDB();

  const userId = requireUserId(req, res);
  if (!userId) return;

  if (req.method === 'GET') {
    const manifiestos = await Manifiesto.find({ userId })
      .sort({ ts: -1 })
      .lean();
    return res.status(200).json(manifiestos);
  }

  if (req.method === 'POST') {
    const { id, titulo, texto, tag, tags, ts } = req.body || {};

    if (!id) return res.status(400).json({ error: 'id requerido' });

    const manifiesto = await Manifiesto.findOneAndUpdate(
      { userId, id },
      { userId, id, titulo, texto, tag, tags, ts: ts || Date.now() },
      { upsert: true, new: true, runValidators: true }
    ).lean();

    return res.status(201).json(manifiesto);
  }

  res.status(405).json({ error: 'Método no permitido' });
}
