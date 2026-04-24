/* =============================================
   APACHETA — DRAGGABLE SYSTEM
   Universal mobile-first draggable windows
   Abren desde ARRIBA (teclado va abajo en mobile)
   Multi-touch safe · spring close · glass style
   ============================================= */

import { springTo } from './spring.js';

const STATE = {
  openWindows: new Map(),
  zCounter: 30,
};

export function makeDraggable(el, opts = {}) {
  const {
    handle = el.querySelector('.dw-bar') || el,
    onClose,
    lockAxis = null,
    boundary = true,
  } = opts;

  let startX = 0, startY = 0, baseX = 0, baseY = 0;
  let dragging = false;
  let pointerId = null;

  const onDown = (e) => {
    if (e.target.closest('.dw-close, .dw-min, .dw-max, input, textarea, button:not(.dw-bar button)')) return;
    const p = getPoint(e);
    pointerId = e.pointerId ?? 1;
    startX = p.x; startY = p.y;

    const r = el.getBoundingClientRect();
    baseX = r.left; baseY = r.top;

    el.style.transition = 'none';
    el.style.left = r.left + 'px';
    el.style.top = r.top + 'px';
    el.style.right = 'auto';
    el.style.bottom = 'auto';
    el.style.transform = 'none';

    dragging = true;
    el.classList.add('dw-dragging');
    el.style.zIndex = ++STATE.zCounter;

    if (e.type === 'touchstart') {
      document.addEventListener('touchmove', onMove, { passive: false });
      document.addEventListener('touchend', onUp);
    } else {
      document.addEventListener('pointermove', onMove);
      document.addEventListener('pointerup', onUp);
      document.addEventListener('pointercancel', onUp);
    }
  };

  const onMove = (e) => {
    if (!dragging) return;
    e.preventDefault?.();
    const p = getPoint(e);
    const dx = lockAxis === 'y' ? 0 : p.x - startX;
    const dy = lockAxis === 'x' ? 0 : p.y - startY;

    let nx = baseX + dx;
    let ny = baseY + dy;

    if (boundary) {
      const r = el.getBoundingClientRect();
      const W = window.innerWidth;
      const H = window.innerHeight;
      nx = Math.max(-r.width * 0.6, Math.min(W - r.width * 0.4, nx));
      ny = Math.max(0, Math.min(H - 60, ny));
    }

    el.style.left = nx + 'px';
    el.style.top = ny + 'px';
  };

  const onUp = () => {
    dragging = false;
    el.classList.remove('dw-dragging');
    document.removeEventListener('touchmove', onMove);
    document.removeEventListener('touchend', onUp);
    document.removeEventListener('pointermove', onMove);
    document.removeEventListener('pointerup', onUp);
    document.removeEventListener('pointercancel', onUp);
  };

  handle.addEventListener('pointerdown', onDown);
  handle.addEventListener('touchstart', onDown, { passive: true });

  // Close button
  el.querySelector('.dw-close')?.addEventListener('click', () => {
    closeDraggable(el);
    onClose?.();
  });

  return el;
}

function getPoint(e) {
  if (e.touches?.[0]) return { x: e.touches[0].clientX, y: e.touches[0].clientY };
  return { x: e.clientX, y: e.clientY };
}

/* ─── Abrir desde arriba ─── */
export function openFromTop(el) {
  el.style.display = 'block';
  el.style.transition = 'none';
  el.style.transform = 'translateY(-120%) scale(0.96)';
  el.style.opacity = '0';
  el.style.zIndex = ++STATE.zCounter;

  // Force reflow
  void el.offsetHeight;

  springTo({
    from: -120, to: 0, stiffness: 0.11, damping: 0.76,
    onUpdate: v => {
      const o = Math.min(1, 1 - Math.abs(v) / 120);
      el.style.transform = `translateY(${v}%) scale(${0.96 + o * 0.04})`;
      el.style.opacity = String(o);
    },
  });

  STATE.openWindows.set(el.id || el, el);
}

export function closeDraggable(el) {
  springTo({
    from: 0, to: -120, stiffness: 0.13, damping: 0.82,
    onUpdate: v => {
      const o = Math.max(0, 1 - Math.abs(v) / 120);
      el.style.transform = `translateY(${v}%) scale(${0.96 + o * 0.04})`;
      el.style.opacity = String(o);
    },
    onComplete: () => { el.style.display = 'none'; },
  });

  STATE.openWindows.delete(el.id || el);
}

/* ─── Helper: Crear ventana draggable ─── */
export function createDraggableWindow({
  id, title, icon = '◈', body, width = 320,
  initialX = 'center', initialY = 80, accent = 'cyan',
}) {
  let el = document.getElementById(id);
  if (el) el.remove();

  el = document.createElement('div');
  el.id = id;
  el.className = `dw dw--${accent}`;
  el.style.width = width + 'px';
  el.style.position = 'fixed';
  el.style.display = 'none';

  const W = window.innerWidth;
  const x = initialX === 'center' ? (W - width) / 2 : initialX;
  el.style.left = x + 'px';
  el.style.top = initialY + 'px';

  el.innerHTML = `
    <div class="dw-bar">
      <div class="dw-dots">
        <span class="dw-close"></span>
        <span class="dw-min"></span>
        <span class="dw-max"></span>
      </div>
      <span class="dw-title">${icon} ${title}</span>
      <span class="dw-grip">⋮⋮</span>
    </div>
    <div class="dw-body">${body || ''}</div>
  `;

  document.body.appendChild(el);
  makeDraggable(el);
  openFromTop(el);
  return el;
}
