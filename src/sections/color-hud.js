/* =============================================
   COLOR HUD — Slider flotante persistente
   Fixed en el borde izquierdo, z-index 250
   Respira con sin wave, guarda en localStorage
   ============================================= */

import { getUser, saveUser, applyUserColors } from '../main.js';

// Gradiente base: from top (tech azul) → mid (cian-sage) → bot (rosa-bordo)
const HUD_GRADIENT = [
  { stop: 0.00, h: 220, s: 60, l: 35 },  // azul-tech profundo
  { stop: 0.12, h: 195, s: 55, l: 60 },  // cian suave
  { stop: 0.25, h: 155, s: 45, l: 65 },  // sage verde
  { stop: 0.40, h: 82,  s: 65, l: 67 },  // lima-verde
  { stop: 0.55, h: 48,  s: 85, l: 70 },  // amarillo-amber
  { stop: 0.70, h: 28,  s: 75, l: 62 },  // terracota
  { stop: 0.85, h: 350, s: 60, l: 70 },  // rosa
  { stop: 1.00, h: 0,   s: 55, l: 35 },  // bordo oscuro
];

function lerpHSL(t) {
  let a = HUD_GRADIENT[0], b = HUD_GRADIENT[HUD_GRADIENT.length - 1];
  for (let i = 0; i < HUD_GRADIENT.length - 1; i++) {
    if (t >= HUD_GRADIENT[i].stop && t <= HUD_GRADIENT[i + 1].stop) {
      a = HUD_GRADIENT[i]; b = HUD_GRADIENT[i + 1]; break;
    }
  }
  const range = b.stop - a.stop || 0.001;
  const f = (t - a.stop) / range;
  const h = a.h + (b.h - a.h) * f;
  const s = a.s + (b.s - a.s) * f;
  const l = a.l + (b.l - a.l) * f;
  return `hsl(${Math.round(h)},${Math.round(s)}%,${Math.round(l)}%)`;
}

function hslToHex(hslStr) {
  const m = hslStr.match(/hsl\((\d+),(\d+)%,(\d+)%\)/);
  if (!m) return '#A8E6E0';
  let h = +m[1] / 360, s = +m[2] / 100, l = +m[3] / 100;
  let r, g, b;
  if (s === 0) { r = g = b = l; }
  else {
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    const hue2rgb = (p, q, t) => {
      if (t < 0) t += 1; if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    };
    r = hue2rgb(p, q, h + 1/3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1/3);
  }
  const toHex = x => Math.round(x * 255).toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

export function initColorHud() {
  const hud = document.getElementById('color-hud');
  if (!hud) return;

  const track    = hud.querySelector('.color-hud__track');
  const knob     = hud.querySelector('.color-hud__knob');
  const preview  = hud.querySelector('.color-hud__preview');
  const dots     = hud.querySelectorAll('.color-hud__dot');

  if (!track || !knob) return;

  const user = getUser();
  // Posiciones iniciales: 3 posiciones en el track (0 = top, 1 = bottom)
  let positions = [0.15, 0.50, 0.82];

  // Intentar reconstruir posiciones desde colores guardados (aproximado)
  // (guardamos las posiciones también para fidelidad)
  if (user.colorHudPositions) {
    positions = user.colorHudPositions;
  }

  let activeDot  = -1;     // cual dot se está arrastrando
  let rafId      = null;
  let breathT    = 0;
  let visible    = false;

  // ─── Iniciar canvas degradé del track ────────
  const canvas = track.querySelector('canvas');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    canvas.width  = 12;
    canvas.height = 200;
    const grad = ctx.createLinearGradient(0, 0, 0, 200);
    HUD_GRADIENT.forEach(s => {
      grad.addColorStop(s.stop, `hsl(${s.h},${s.s}%,${s.l}%)`);
    });
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 12, 200);
  }

  // ─── Aplicar posiciones a los dots ───────────
  function applyPositions() {
    const trackH = track.offsetHeight || 200;
    dots.forEach((dot, i) => {
      const y = positions[i] * trackH;
      dot.style.top = `${y}px`;
      const color = lerpHSL(positions[i]);
      dot.style.background = color;
      dot.style.boxShadow  = `0 0 8px ${color}80`;
    });

    // Actualizar preview con los 3 colores
    if (preview) {
      const cols = positions.map(p => lerpHSL(p));
      preview.style.background = `linear-gradient(160deg, ${cols.join(', ')})`;
    }
  }

  // ─── Aplicar colores al usuario ───────────────
  function pushColors() {
    const hexes = positions.map(p => hslToHex(lerpHSL(p)));
    applyUserColors(hexes);
    saveUser({ colores: hexes, colorHudPositions: [...positions] });
    // Emitir evento para que otras secciones reaccionen
    window.dispatchEvent(new CustomEvent('apacheta:colorsChanged', { detail: { colores: hexes } }));
  }

  // ─── Respiración (sin wave opacity) ──────────
  function breathe(ts) {
    breathT = (ts || 0) * 0.001;
    const opacity = 0.55 + Math.sin(breathT * 0.8) * 0.25;
    if (activeDot < 0) {
      hud.style.opacity = String(opacity);
    }
    rafId = requestAnimationFrame(breathe);
  }

  // ─── Drag handling ────────────────────────────
  function getYFraction(clientY) {
    const rect = track.getBoundingClientRect();
    return Math.max(0, Math.min(1, (clientY - rect.top) / rect.height));
  }

  function onDragStart(dotIndex, e) {
    e.stopPropagation();
    activeDot = dotIndex;
    hud.style.opacity = '1';
    hud.classList.add('dragging');
    dots[dotIndex].classList.add('active');
  }

  function onDragMove(e) {
    if (activeDot < 0) return;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    positions[activeDot] = getYFraction(clientY);
    applyPositions();
    pushColors();
  }

  function onDragEnd() {
    if (activeDot < 0) return;
    dots[activeDot].classList.remove('active');
    activeDot = -1;
    hud.classList.remove('dragging');
  }

  dots.forEach((dot, i) => {
    dot.addEventListener('mousedown',  e => onDragStart(i, e));
    dot.addEventListener('touchstart', e => onDragStart(i, e), { passive: true });
  });

  document.addEventListener('mousemove', onDragMove);
  document.addEventListener('touchmove',  e => {
    if (activeDot >= 0) { e.preventDefault(); onDragMove(e); }
  }, { passive: false });
  document.addEventListener('mouseup',   onDragEnd);
  document.addEventListener('touchend',  onDragEnd);

  // ─── Tap en track (sin dot) = mostrar/ocultar ─
  hud.addEventListener('click', e => {
    if (e.target === hud || e.target === track || e.target === canvas) {
      visible = !visible;
      hud.classList.toggle('expanded', visible);
    }
  });

  // ─── Init ─────────────────────────────────────
  applyPositions();
  rafId = requestAnimationFrame(breathe);

  // Restaurar colores guardados al inicio
  const storedColors = user.colores;
  if (storedColors && storedColors[0]) {
    applyUserColors(storedColors);
  }
}
