/* =============================================
   APACHETA — DASHBOARD DEL DÍA
   Stats, challenge rotativo, modo por hora
   ============================================= */

import { getUser, getModoActual, getModoLabel } from '../main.js';

const CHALLENGES = [
  {
    pregunta: '¿Qué hábito mental te limita más?',
    dato: 'El 95% de tus decisiones vienen de patrones inconscientes formados antes de los 7 años.',
    accion: '→ Escribí ese hábito y nombralo por primera vez.',
  },
  {
    pregunta: '¿Qué aprendiste esta semana que no sabías?',
    dato: 'El cerebro consolida aprendizajes principalmente durante el sueño profundo (fase REM).',
    accion: '→ Escribilo ahora antes de que lo olvides.',
  },
  {
    pregunta: '¿A quién te acordaste sin razón aparente?',
    dato: 'Las personas que aparecen en tu mente sin motivo suelen tener algo que resolver con vos.',
    accion: '→ Mandá un mensaje o escribí sobre esa persona.',
  },
  {
    pregunta: '¿Qué conexión inesperada encontraste esta semana?',
    dato: 'La creatividad es el arte de conectar puntos que nadie más conectó. — Steve Jobs',
    accion: '→ Describí esa conexión en una oración.',
  },
  {
    pregunta: '¿De qué te costó soltarte hoy?',
    dato: 'El apego al resultado destruye el proceso. La soltura es una práctica, no un estado.',
    accion: '→ Nombrá lo que querés soltar y escribí por qué lo sostenés.',
  },
  {
    pregunta: '¿Cuándo fue la última vez que hiciste algo por primera vez?',
    dato: 'La novedad activa dopamina y genera nuevas conexiones neuronales. La rutina las consolida.',
    accion: '→ Planeá algo nuevo para esta semana.',
  },
  {
    pregunta: '¿Qué creencia sobre vos mismo está lista para cambiar?',
    dato: 'La neuroplasticidad confirma que el cerebro cambia físicamente con cada pensamiento repetido.',
    accion: '→ Reescribí esa creencia en positivo y en presente.',
  },
];

export function initDashboard() {
  const user  = getUser();
  const modo  = getModoActual();

  // Challenge del día (rotativo por fecha)
  const today     = new Date();
  const idx       = (today.getDate() + today.getMonth()) % CHALLENGES.length;
  const challenge = CHALLENGES[idx];

  const pregEl   = document.getElementById('dash-challenge-pregunta');
  const datoEl   = document.getElementById('dash-challenge-dato');
  const accionEl = document.getElementById('dash-challenge-accion');

  if (pregEl)   pregEl.textContent   = challenge.pregunta;
  if (datoEl)   datoEl.textContent   = challenge.dato;
  if (accionEl) accionEl.textContent = challenge.accion;

  // Stats: obras exploradas (del localStorage)
  const notas     = user.notas || {};
  const totalNotas = Object.keys(notas).length;
  const statEl    = document.getElementById('dash-stat-obras');
  if (statEl) statEl.textContent = String(totalNotas).padStart(2, '0');

  // Actualizar colores de los orbs del dashboard con colores personales
  updateDashboardOrbs(user.colores);
}

function updateDashboardOrbs(colores) {
  const orb1 = document.getElementById('dash-orb-1');
  const orb2 = document.getElementById('dash-orb-2');
  const orb3 = document.getElementById('dash-orb-3');
  if (orb1) orb1.style.background = colores[0] || '#A8E6E0';
  if (orb2) orb2.style.background = colores[1] || '#F4C2C2';
  if (orb3) orb3.style.background = colores[2] || '#FFE44D';
}
