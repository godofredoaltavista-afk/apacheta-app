/* =============================================
   APACHETA — /api/aura
   GET historial + POST upsert aura del día
   Telemetría del aura como salud mental predictiva
   ============================================= */

import { connectDB } from './_lib/db.js';
import { AuraHistory } from './_lib/models.js';
import { requireUserId } from './_lib/auth.js';

export default async function handler(req, res) {
  await connectDB();

  const userId = requireUserId(req, res);
  if (!userId) return;

  // ─── GET — últimos 30 días de aura ─────────
  if (req.method === 'GET') {
    const history = await AuraHistory.find({ userId })
      .sort({ fecha: -1 })
      .limit(30)
      .lean();
    return res.status(200).json(history);
  }

  // ─── POST — upsert aura del día ─────────────
  if (req.method === 'POST') {
    const { fecha, calma, foco, creatividad, energia, intuicion, colores, savedAt } = req.body || {};

    if (!fecha) return res.status(400).json({ error: 'fecha requerida (YYYY-MM-DD)' });

    const aura = await AuraHistory.findOneAndUpdate(
      { userId, fecha },
      { userId, fecha, calma, foco, creatividad, energia, intuicion, colores, savedAt: savedAt || Date.now() },
      { upsert: true, new: true, runValidators: true }
    ).lean();

    return res.status(200).json(aura);
  }

  res.status(405).json({ error: 'Método no permitido' });
}
