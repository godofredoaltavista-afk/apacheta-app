/* =============================================
   APACHETA — /api/user
   GET + POST + PATCH del perfil del usuario
   ============================================= */

import { connectDB } from './_lib/db.js';
import { User } from './_lib/models.js';
import { requireUserId } from './_lib/auth.js';

export default async function handler(req, res) {
  await connectDB();

  const userId = requireUserId(req, res);
  if (!userId) return;

  // ─── GET — obtener perfil ──────────────────
  if (req.method === 'GET') {
    let user = await User.findOne({ userId }).lean();
    if (!user) {
      // Primera visita: devolver defaults sin crear todavía
      return res.status(200).json({
        userId,
        nombre: '',
        signo: '',
        nacimiento: '',
        colores: ['#A8E6E0', '#F4C2C2', '#FFE44D'],
        alucinajeActivo: false,
        onboardingCompleto: false,
      });
    }
    return res.status(200).json(user);
  }

  // ─── POST — crear usuario (onboarding) ────
  if (req.method === 'POST') {
    const { nombre, signo, nacimiento, colores } = req.body || {};

    const user = await User.findOneAndUpdate(
      { userId },
      { userId, nombre, signo, nacimiento, colores, onboardingCompleto: true },
      { upsert: true, new: true, runValidators: true }
    ).lean();

    return res.status(201).json(user);
  }

  // ─── PATCH — actualizar campos ─────────────
  if (req.method === 'PATCH') {
    const allowed = ['nombre', 'signo', 'nacimiento', 'colores', 'alucinajeActivo'];
    const patch   = Object.fromEntries(
      Object.entries(req.body || {}).filter(([k]) => allowed.includes(k))
    );

    const user = await User.findOneAndUpdate(
      { userId },
      { $set: patch },
      { new: true, upsert: true }
    ).lean();

    return res.status(200).json(user);
  }

  res.status(405).json({ error: 'Método no permitido' });
}
