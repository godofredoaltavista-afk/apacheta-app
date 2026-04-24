/* =============================================
   APACHETA — /api/notes/:id
   PATCH actualizar + DELETE eliminar nota
   ============================================= */

import { connectDB } from '../_lib/db.js';
import { Nota } from '../_lib/models.js';
import { requireUserId } from '../_lib/auth.js';

export default async function handler(req, res) {
  await connectDB();

  const userId = requireUserId(req, res);
  if (!userId) return;

  const { id } = req.query;

  // ─── PATCH — actualizar nota ───────────────
  if (req.method === 'PATCH') {
    const allowed = ['titulo', 'texto', 'color', 'tags', 'categoria'];
    const patch   = Object.fromEntries(
      Object.entries(req.body || {}).filter(([k]) => allowed.includes(k))
    );

    const nota = await Nota.findOneAndUpdate(
      { userId, id },
      { $set: patch },
      { new: true }
    ).lean();

    if (!nota) return res.status(404).json({ error: 'Nota no encontrada' });
    return res.status(200).json(nota);
  }

  // ─── DELETE — eliminar nota ────────────────
  if (req.method === 'DELETE') {
    await Nota.deleteOne({ userId, id });
    return res.status(200).json({ ok: true });
  }

  res.status(405).json({ error: 'Método no permitido' });
}
