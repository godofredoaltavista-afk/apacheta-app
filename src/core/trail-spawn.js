/* =============================================
   APACHETA — TRAIL SPAWN
   El dedo dibuja una curva tipo Lissajous.
   Mientras dibuja, spawnea assets (imgs de banners)
   cada ~1s a lo largo del trayecto, semi-transparentes
   ============================================= */

const ASSETS = [
  '/banners/WhatsApp Image 2026-04-17 at 13.00.29.jpeg',
  '/banners/WhatsApp Image 2026-04-17 at 13.00.55.jpeg',
  '/banners/WhatsApp Image 2026-04-17 at 13.01.08.jpeg',
  '/banners/WhatsApp Image 2026-04-17 at 13.02.49.jpeg',
  '/banners/WhatsApp Image 2026-04-17 at 13.05.10.jpeg',
  '/banners/WhatsApp Image 2026-04-17 at 13.07.15.jpeg',
  '/banners/WhatsApp Image 2026-04-17 at 13.07.41.jpeg',
  '/banners/WhatsApp Image 2026-04-17 at 13.08.15.jpeg',
  '/banners/apacheta-mandala (4).png',
];

let poolIdx = 0;
let lastSpawn = 0;
const SPAWN_INTERVAL = 1000;   // ms
const MAX_LIVE = 8;
const LIFETIME = 3400;         // total life: 2s visible + 1.4s fade out
const VISIBLE_DURATION = 2000; // ms al 100% opacidad

const live = new Set();

function pickAsset() {
  const a = ASSETS[poolIdx % ASSETS.length];
  poolIdx++;
  return a;
}

function spawnImageAt(x, y, host) {
  if (live.size >= MAX_LIVE) {
    const oldest = live.values().next().value;
    oldest?.remove();
    live.delete(oldest);
  }

  const src = pickAsset();
  const rot   = (Math.random() - 0.5) * 16;
  const scale = 0.75 + Math.random() * 0.45;

  // Crear un Image temporal para leer dimensiones reales
  const probe = new Image();
  probe.onload = () => {
    const ar = probe.naturalWidth / probe.naturalHeight;
    const BASE = 120 + Math.random() * 40; // base size 120-160px

    let w, h, radius;
    if (ar > 1.6) {
      // Horizontal — proporción 3:1 aprox
      w = BASE * 2.2; h = BASE * 0.75;
      radius = '12px';
    } else if (ar < 0.65) {
      // Vertical
      w = BASE * 0.75; h = BASE * 1.6;
      radius = '12px';
    } else if (Math.abs(ar - 1) < 0.15) {
      // Casi cuadrado o circular (si el nombre tiene "circle" o "mandala")
      w = h = BASE;
      radius = src.includes('mandala') || src.includes('circle') ? '50%' : '18px';
    } else {
      w = BASE; h = BASE / ar;
      radius = '14px';
    }

    const el = document.createElement('div');
    el.className = 'trail-spawn';
    el.style.cssText = `
      left:${x - w / 2}px; top:${y - h / 2}px;
      width:${w}px; height:${h}px;
      border-radius:${radius};
      background-image:url("${src}");
      background-size:cover;
      background-position:center;
    `;
    el.style.transform = `rotate(${rot}deg) scale(${scale * 0.5})`;

    host.appendChild(el);
    live.add(el);

    requestAnimationFrame(() => {
      el.style.opacity = '1';
      el.style.transform = `rotate(${rot}deg) scale(${scale})`;
    });

    setTimeout(() => {
      el.style.opacity = '0';
      el.style.transform = `rotate(${rot}deg) scale(${scale * 1.08}) translateY(-14px)`;
    }, VISIBLE_DURATION);

    setTimeout(() => {
      el.remove();
      live.delete(el);
    }, LIFETIME);
  };
  probe.src = src;
}

/* Canvas para la curva tipo Lissajous */
function ensureHost() {
  let host = document.getElementById('trail-spawn-host');
  if (host) return host;
  host = document.createElement('div');
  host.id = 'trail-spawn-host';
  host.innerHTML = '<canvas id="trail-canvas"></canvas>';
  document.body.appendChild(host);
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);
  return host;
}

function resizeCanvas() {
  const c = document.getElementById('trail-canvas');
  if (!c) return;
  c.width = window.innerWidth;
  c.height = window.innerHeight;
}

let trailPoints = [];
function addPoint(x, y) {
  trailPoints.push({ x, y, t: performance.now() });
  // Keep last 60
  if (trailPoints.length > 60) trailPoints.shift();
}

function drawTrail() {
  const c = document.getElementById('trail-canvas');
  if (!c) return;
  const ctx = c.getContext('2d');
  ctx.clearRect(0, 0, c.width, c.height);

  const now = performance.now();
  trailPoints = trailPoints.filter(p => now - p.t < 1200);
  if (trailPoints.length < 2) return;

  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  for (let i = 1; i < trailPoints.length; i++) {
    const p0 = trailPoints[i - 1];
    const p1 = trailPoints[i];
    const age = (now - p1.t) / 1200;
    const alpha = (1 - age) * 0.45;
    // Lissajous-ish offset
    const mid = {
      x: (p0.x + p1.x) / 2,
      y: (p0.y + p1.y) / 2,
    };
    ctx.strokeStyle = `rgba(168, 230, 224, ${alpha})`;
    ctx.lineWidth = 1 + (1 - age) * 2;
    ctx.beginPath();
    ctx.moveTo(p0.x, p0.y);
    ctx.quadraticCurveTo(mid.x, mid.y, p1.x, p1.y);
    ctx.stroke();

    // Second harmonic (lissajous overlay)
    ctx.strokeStyle = `rgba(244, 194, 194, ${alpha * 0.6})`;
    ctx.lineWidth = 0.6;
    ctx.beginPath();
    ctx.moveTo(p0.x, p0.y);
    const ox = Math.sin(p1.t * 0.004) * 8;
    const oy = Math.cos(p1.t * 0.003) * 8;
    ctx.quadraticCurveTo(mid.x + ox, mid.y + oy, p1.x, p1.y);
    ctx.stroke();
  }

  requestAnimationFrame(drawTrail);
}

export function initTrailSpawn() {
  const host = ensureHost();

  let active = false;
  const onMove = (e) => {
    const p = e.touches?.[0] ?? e;
    addPoint(p.clientX, p.clientY);

    const now = performance.now();
    if (active && now - lastSpawn > SPAWN_INTERVAL) {
      lastSpawn = now;
      spawnImageAt(p.clientX, p.clientY, host);
    }
  };

  const onStart = (e) => {
    // Solo activo si es drag deliberado, evitar interferir con scroll
    // => Gate: dos-dedos o long-press o desde zonas "canvas"
    const t = e.target;
    if (t.closest('.no-trail, input, textarea, button, a, .dw, .morning-nav, .drawer')) {
      active = false;
      return;
    }
    // Only on designated trail zones
    if (!t.closest('[data-trail], .slice-preview-section, #mandala, #modo-alucinaje, #aura-composer, #lissajous')) {
      active = false;
      return;
    }
    active = true;
    lastSpawn = 0;
    requestAnimationFrame(drawTrail);
  };
  const onEnd = () => { active = false; };

  window.addEventListener('touchstart', onStart, { passive: true });
  window.addEventListener('touchmove', onMove, { passive: true });
  window.addEventListener('touchend', onEnd);
  window.addEventListener('pointerdown', onStart);
  window.addEventListener('pointermove', (e) => { if (e.pressure > 0 || e.buttons) onMove(e); });
  window.addEventListener('pointerup', onEnd);
}
