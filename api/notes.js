/* =============================================
   APACHETA — /api/notes
   GET todas las notas + POST crear nota
   ============================================= */

import { connectDB } from './_lib/db.js';
import { Nota } from './_lib/models.js';
import { requireUserId } from './_lib/auth.js';

export default async function handler(req, res) {
  await connectDB();

  const userId = requireUserId(req, res);
  if (!userId) return;

  // ─── GET — todas las notas del usuario ─────
  if (req.method === 'GET') {
    const notas = await Nota.find({ userId })
      .sort({ ts: -1 })
      .lean();
    return res.status(200).json(notas);
  }

  // ─── POST — crear nota ─────────────────────
  if (req.method === 'POST') {
    const { id, titulo, texto, color, tags, categoria, ts } = req.body || {};

    if (!id) return res.status(400).json({ error: 'id requerido' });

    const nota = await Nota.findOneAndUpdate(
      { userId, id },
      { userId, id, titulo, texto, color, tags, categoria, ts: ts || Date.now() },
      { upsert: true, new: true, runValidators: true }
    ).lean();

    return res.status(201).json(nota);
  }

  res.status(405).json({ error: 'Método no permitido' });
}
