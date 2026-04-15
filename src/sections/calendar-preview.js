/* =============================================
   APACHETA — CALENDAR PREVIEW
   Semana actual + notas en localStorage
   ============================================= */

import { getUser, saveUser } from '../main.js';

export function initCalendar() {
  renderWeek();
  renderNotas();
}

function renderWeek() {
  const container = document.getElementById('calendar-days');
  if (!container) return;

  const today   = new Date();
  const dow     = today.getDay(); // 0=Dom
  // Empezar la semana en lunes
  const monday  = new Date(today);
  monday.setDate(today.getDate() - ((dow === 0 ? 7 : dow) - 1));

  container.innerHTML = '';

  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);

    const isToday = d.toDateString() === today.toDateString();
    const key     = d.toISOString().slice(0, 10);
    const user    = getUser();
    const hasNote = user.notas?.[key];

    const el = document.createElement('div');
    el.className = `calendar__day${isToday ? ' today' : ''}${hasNote ? ' has-note' : ''}`;
    el.textContent = d.getDate();
    el.dataset.date = key;

    el.addEventListener('click', () => openDayNote(key, d));
    container.appendChild(el);
  }
}

function renderNotas() {
  const grid = document.getElementById('notas-grid');
  if (!grid) return;

  const user  = getUser();
  const notas = user.notas || {};
  const keys  = Object.keys(notas).sort().reverse().slice(0, 4);

  if (keys.length === 0) return; // Mantener las notas hardcoded del HTML

  const colors = ['nota-card--amarilla', 'nota-card--cyan', 'nota-card--rosa', 'nota-card--lavanda'];

  grid.innerHTML = keys.map((key, i) => {
    const nota = notas[key];
    const d    = new Date(key + 'T00:00:00');
    const label = formatDate(d);
    return `
      <div class="nota-card ${colors[i % colors.length]}">
        <p class="nota-card__date">${label}</p>
        <p class="nota-card__text">${nota.texto?.slice(0, 80) || '...'}</p>
      </div>
    `;
  }).join('');
}

function openDayNote(key, date) {
  // Abre el modal de anotación con fecha
  const fab = document.getElementById('fab-anotacion');
  if (fab) fab.click();

  const title = document.querySelector('.anotacion-sheet__title');
  if (title) title.textContent = `${date.getDate()}/${date.getMonth() + 1} — Nota del día`;

  // Pre-cargar nota existente si hay
  const user = getUser();
  const existing = user.notas?.[key];
  const textarea = document.getElementById('anotacion-text');
  if (textarea && existing) textarea.value = existing.texto || '';
}

function formatDate(d) {
  const today    = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  if (d.toDateString() === today.toDateString())     return 'Hoy';
  if (d.toDateString() === yesterday.toDateString()) return 'Ayer';

  const days = ['Dom','Lun','Mar','Mié','Jue','Vie','Sáb'];
  return days[d.getDay()];
}
