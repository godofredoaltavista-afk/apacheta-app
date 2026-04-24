/* =============================================
   APACHETA — TELEMETRY HUD
   Fixed top-right · tap para toggle
   ALT = scrollY mapeado 0–9999m
   ============================================= */

import { getUser, getModoActual } from '../main.js';

export function initTelemetryHud() {
  const hud     = document.getElementById('telemetry-hud');
  const trigger = document.getElementById('tel-trigger');
  const panel   = document.getElementById('tel-panel');
  if (!hud || !trigger || !panel) return;

  // ─── Toggle open/close ───────────────────────
  trigger.addEventListener('click', () => {
    hud.classList.toggle('is-open');
  });

  // ─── Tint HUD con accent personal ────────────
  function applyHudAccent() {
    const cs = getComputedStyle(document.documentElement);
    const a1 = cs.getPropertyValue('--color-personal-1').trim();
    const a2 = cs.getPropertyValue('--color-personal-2').trim();
    if (a1) {
      hud.style.setProperty('--hud-accent', a1);
      hud.style.setProperty('--hud-border', a1);
    }
    if (a2) hud.style.setProperty('--hud-accent-2', a2);
  }
  applyHudAccent();
  window.addEventListener('apacheta:colorsChanged', applyHudAccent);

  // ─── Datos reales en RAF ─────────────────────
  const modoEl  = document.getElementById('tel-modo');
  const horaEl  = document.getElementById('tel-hora');
  const altEl   = document.getElementById('tel-alt');
  const secEl   = document.getElementById('tel-sec');
  const notasEl = document.getElementById('tel-notas');

  // Sección activa: IntersectionObserver en todas las sections
  let currentSection = 'INICIO';
  document.querySelectorAll('section[id]').forEach(sec => {
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) currentSection = (sec.id || 'INICIO').toUpperCase(); });
    }, { threshold: 0.4 });
    obs.observe(sec);
  });

  // Modo labels
  const MODO_LABELS = { manana: 'MAÑANA', tarde: 'TARDE', noche: 'NOCHE', alucinaje: 'ALUCINAJE' };

  // Scroll height total (aproximado)
  const maxScroll = () => Math.max(document.body.scrollHeight - window.innerHeight, 1);

  function tick() {
    if (!hud.classList.contains('is-open')) {
      requestAnimationFrame(tick);
      return;
    }

    const now  = new Date();
    const h    = String(now.getHours()).padStart(2, '0');
    const m    = String(now.getMinutes()).padStart(2, '0');
    const s    = String(now.getSeconds()).padStart(2, '0');

    const modo     = getModoActual();
    const scrollY  = window.scrollY;
    const altM     = Math.round((scrollY / maxScroll()) * 9999);
    const user     = getUser();
    const notasN   = Object.keys(user.notas || {}).length;

    if (horaEl)  horaEl.textContent  = `${h}:${m}:${s}`;
    if (modoEl)  modoEl.textContent  = MODO_LABELS[modo] || 'MAÑANA';
    if (altEl)   altEl.textContent   = String(altM).padStart(4, '0') + 'm';
    if (secEl)   secEl.textContent   = currentSection.slice(0, 10);
    if (notasEl) notasEl.textContent = String(notasN);

    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}
