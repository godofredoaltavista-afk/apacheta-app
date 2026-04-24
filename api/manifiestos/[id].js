/* =============================================
   APACHETA — /api/manifiestos/:id
   PATCH auto-save + DELETE manifiesto
   ============================================= */

import { connectDB } from '../_lib/db.js';
import { Manifiesto } from '../_lib/models.js';
import { requireUserId } from '../_lib/auth.js';

export default async function handler(req, res) {
  await connectDB();

  const userId = requireUserId(req, res);
  if (!userId) return;

  const { id } = req.query;

  if (req.method === 'PATCH') {
    const allowed = ['titulo', 'texto', 'tag', 'tags'];
    const patch   = Object.fromEntries(
      Object.entries(req.body || {}).filter(([k]) => allowed.includes(k))
    );

    const manifiesto = await Manifiesto.findOneAndUpdate(
      { userId, id },
      { $set: patch },
      { new: true }
    ).lean();

    if (!manifiesto) return res.status(404).json({ error: 'Manifiesto no encontrado' });
    return res.status(200).json(manifiesto);
  }

  if (req.method === 'DELETE') {
    await Manifiesto.deleteOne({ userId, id });
    return res.status(200).json({ ok: true });
  }

  res.status(405).json({ error: 'Método no permitido' });
}
