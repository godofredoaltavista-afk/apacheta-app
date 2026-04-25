/* =============================================
   APACHETA — iOS DOCK
   Bottom floating dock · swipe horizontal
   Auto-hide on scroll · haptic springs
   Peek sheets para Notas + Manifiesto

   Additive: no borra el nav-drawer legacy.
   body.ios-dock-active esconde #nav-trigger via CSS.
   ============================================= */

import { ICONS } from './icons.js';
import { NotasStore } from '../state/NotasStore.js';
import { getUser, saveUser } from '../main.js';
import { feedbackBus } from './feedback-bus.js';

const DOCK_ITEMS = [
  { id: 'dashboard',        label: 'Home',       icon: 'home_godofredo', grad: 'linear-gradient(145deg,#F5B963,#D8903A)', kind: 'scroll' },
  { id: 'anotacion',        label: 'Notas',      icon: 'capturar',       grad: 'linear-gradient(145deg,#FFB088,#E07A5F)', kind: 'scroll' },
  { id: 'manifiesto-gestor',label: 'Manifiesto', icon: 'manifiestos',    grad: 'linear-gradient(145deg,#89A97A,#556B4B)', kind: 'scroll' },
  { id: 'morning-journey',  label: 'Mañana',     icon: 'manana',         grad: 'linear-gradient(145deg,#F6D27A,#C9863C)', kind: 'scroll' },
  { id: 'respiracion',      label: 'Respirar',   icon: 'respirar',       grad: 'linear-gradient(145deg,#A8E6E0,#4FB3AC)', kind: 'scroll' },
  { id: 'chakras',          label: 'Chakras',    icon: 'chakras',        grad: 'linear-gradient(145deg,#D98BB8,#8E4E7E)', kind: 'scroll' },
  { id: 'mandala',          label: 'Mandala',    icon: 'mandala',        grad: 'linear-gradient(145deg,#D4C5E8,#8A7AAE)', kind: 'scroll' },
  { id: 'aura-composer',    label: 'Aura',       icon: 'aura',           grad: 'linear-gradient(145deg,#F4C2C2,#D47A8E)', kind: 'scroll' },
  { id: 'biblioteca',       label: 'Biblioteca', icon: 'biblioteca',     grad: 'linear-gradient(145deg,#7A8BC4,#3D4B78)', kind: 'scroll' },
  { id: 'lofi',             label: 'Sonidos',    icon: 'sonidos',        grad: 'linear-gradient(145deg,#5BA0C4,#2E5F78)', kind: 'scroll' },
  { id: 'mandala-archive',  label: 'Archivo',    icon: 'mandala',        grad: 'linear-gradient(145deg,#B3C9A8,#6E8A62)', kind: 'scroll' },
  { id: 'alarma',           label: 'Alarma',     icon: 'alarma',         grad: 'linear-gradient(145deg,#AE8AC4,#664878)', kind: 'scroll' },
];

const LONG_PRESS_MS = 420;
const AUTO_HIDE_DELTA = 18;
const AUTO_HIDE_MIN_Y = 120;
const HAPTIC_SHORT = 8;
const HAPTIC_LONG = [12, 24, 12];

// ─── Public API ──────────────────────────────
export function initIosDock() {
  if (document.getElementById('ios-dock')) return;
  document.body.classList.add('ios-dock-active', 'hide-dev-tools');

  const dock = buildDock();
  document.body.appendChild(dock.root);

  wireScrollHide(dock.root);
  wireDockPages(dock);
  wireItemHandlers(dock);
  observeCurrentSection(dock);
  wireDevToolsReveal();
  enhanceSliders();
  enhanceTapTargets();

  return dock;
}

// ─── Build dock DOM ──────────────────────────
function buildDock() {
  const root = document.createElement('div');
  root.id = 'ios-dock';
  root.className = 'ios-dock';
  root.setAttribute('role', 'navigation');
  root.setAttribute('aria-label', 'Navegación principal');

  const track = document.createElement('div');
  track.className = 'ios-dock__track';
  track.innerHTML = DOCK_ITEMS.map(item => `
    <button class="ios-dock__btn" data-id="${item.id}" data-kind="${item.kind}"
            style="--btn-bg:${item.grad}" aria-label="${item.label}">
      <span class="ios-dock__ico-wrap">
        ${ICONS[item.icon] || ICONS.home}
      </span>
      <span class="ios-dock__label">${item.label}</span>
    </button>
  `).join('');

  const dots = document.createElement('div');
  dots.className = 'ios-dock__dots';

  root.appendChild(track);
  root.appendChild(dots);
  return { root, track, dots };
}

// ─── Auto-hide on scroll down, reveal up ────
function wireScrollHide(root) {
  let lastY = window.scrollY;
  let raf = null;
  window.addEventListener('scroll', () => {
    if (raf) return;
    raf = requestAnimationFrame(() => {
      const y = window.scrollY;
      const delta = y - lastY;
      if (Math.abs(delta) > AUTO_HIDE_DELTA) {
        if (delta > 0 && y > AUTO_HIDE_MIN_Y) root.classList.add('is-hidden');
        else root.classList.remove('is-hidden');
        lastY = y;
      }
      raf = null;
    });
  }, { passive: true });
}

// ─── Page dots (horizontal pagination) ──────
function wireDockPages({ track, dots }) {
  const render = () => {
    const pageW = track.clientWidth;
    const totalW = track.scrollWidth;
    const pages = Math.max(1, Math.ceil(totalW / pageW));
    const current = Math.min(pages - 1, Math.round(track.scrollLeft / pageW));
    dots.innerHTML = Array.from({ length: pages }, (_, i) =>
      `<span class="ios-dock__dot ${i === current ? 'is-active' : ''}"></span>`
    ).join('');
    dots.style.display = pages > 1 ? '' : 'none';
  };
  render();
  let sraf = null;
  track.addEventListener('scroll', () => {
    if (sraf) return;
    sraf = requestAnimationFrame(() => { render(); sraf = null; });
  }, { passive: true });
  window.addEventListener('resize', render);
}

// ─── Item handlers: tap · long-press · jiggle
function wireItemHandlers({ root }) {
  root.querySelectorAll('.ios-dock__btn').forEach(btn => {
    const kind = btn.dataset.kind;
    const id = btn.dataset.id;
    let pressTimer = null;
    let longFired = false;
    let tipTimer = null;

    const onShort = () => {
      haptic(HAPTIC_SHORT);
      if (kind === 'peek-notas') openPeekNotas();
      else if (kind === 'peek-manifiesto') openPeekManifiesto();
      else scrollToSection(id);
    };
    const onLong = () => {
      longFired = true;
      haptic(HAPTIC_LONG);
      btn.classList.add('is-jiggling');
      setTimeout(() => btn.classList.remove('is-jiggling'), 1400);
      if (kind === 'peek-notas') openPeekNotas({ composeNew: true });
      else if (kind === 'peek-manifiesto') openPeekManifiesto({ composeNew: true });
      else {
        btn.classList.add('is-tip-on');
        clearTimeout(tipTimer);
        tipTimer = setTimeout(() => btn.classList.remove('is-tip-on'), 1400);
      }
    };

    btn.addEventListener('pointerdown', (e) => {
      longFired = false;
      btn.classList.add('is-pressing');
      pressTimer = setTimeout(onLong, LONG_PRESS_MS);
    });
    const release = () => {
      btn.classList.remove('is-pressing');
      if (pressTimer) { clearTimeout(pressTimer); pressTimer = null; }
    };
    btn.addEventListener('pointerup', () => {
      release();
      if (!longFired) onShort();
    });
    btn.addEventListener('pointerleave', release);
    btn.addEventListener('pointercancel', release);
  });
}

function scrollToSection(id) {
  const el = document.getElementById(id);
  if (!el) return;
  el.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function haptic(pattern) {
  if (navigator.vibrate) {
    try { navigator.vibrate(pattern); } catch (_) {}
  }
}

// ─── Highlight current section via IO ──────
function observeCurrentSection({ root }) {
  const ids = DOCK_ITEMS.map(i => i.id);
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting && e.intersectionRatio > 0.5) {
        const id = e.target.id;
        root.querySelectorAll('.ios-dock__btn').forEach(b => {
          b.classList.toggle('is-current', b.dataset.id === id);
        });
      }
    });
  }, { threshold: [0.5] });
  ids.forEach(id => {
    const el = document.getElementById(id);
    if (el) obs.observe(el);
  });
}

// ─── Dev tools reveal: triple-tap on APACHETA brand ─
function wireDevToolsReveal() {
  let taps = [];
  const tripleTap = (e) => {
    const target = e.target.closest('#ajetreo-sur, .drawer__brand, [data-brand="apacheta"]');
    if (!target) return;
    const now = Date.now();
    taps = [...taps.filter(t => now - t < 700), now];
    if (taps.length >= 3) {
      document.body.classList.toggle('reveal-dev-tools');
      document.body.classList.toggle('hide-dev-tools');
      haptic([10, 30, 10, 30, 10]);
      taps = [];
    }
  };
  document.addEventListener('pointerup', tripleTap);
}

// ═══════════════════════════════════════════
//   PEEK SHEET — infraestructura común
// ═══════════════════════════════════════════

function renderPeekSheet({ title, sub, body, actions }) {
  let scrim = document.getElementById('peek-sheet-scrim');
  let sheet = document.getElementById('peek-sheet');
  if (!scrim) {
    scrim = document.createElement('div');
    scrim.id = 'peek-sheet-scrim';
    scrim.className = 'peek-sheet-scrim';
    document.body.appendChild(scrim);
    scrim.addEventListener('click', closePeekSheet);
  }
  if (!sheet) {
    sheet = document.createElement('div');
    sheet.id = 'peek-sheet';
    sheet.className = 'peek-sheet';
    sheet.setAttribute('role', 'dialog');
    sheet.setAttribute('aria-modal', 'true');
    document.body.appendChild(sheet);
  }
  sheet.innerHTML = `
    <div class="peek-sheet__grabber" aria-hidden="true"></div>
    <div class="peek-sheet__head">
      <h2 class="peek-sheet__title">${title}</h2>
      <span class="peek-sheet__sub">${sub || ''}</span>
    </div>
    <div class="peek-sheet__body">${body}</div>
    <div class="peek-sheet__actions">${actions}</div>
  `;
  wirePeekSwipe(sheet);
  requestAnimationFrame(() => {
    scrim.classList.add('is-open');
    sheet.classList.add('is-open');
  });
  return sheet;
}

function closePeekSheet() {
  const scrim = document.getElementById('peek-sheet-scrim');
  const sheet = document.getElementById('peek-sheet');
  if (scrim) scrim.classList.remove('is-open');
  if (sheet) {
    sheet.classList.remove('is-open');
    sheet.style.transform = '';
  }
}

function wirePeekSwipe(sheet) {
  const grabber = sheet.querySelector('.peek-sheet__grabber');
  if (!grabber) return;
  let y0 = 0, dy = 0;
  grabber.addEventListener('touchstart', e => { y0 = e.touches[0].clientY; dy = 0; }, { passive: true });
  grabber.addEventListener('touchmove',  e => {
    dy = e.touches[0].clientY - y0;
    if (dy > 0) sheet.style.transform = `translateX(-50%) translateY(${dy}px)`;
  }, { passive: true });
  grabber.addEventListener('touchend', () => {
    if (dy > 80) closePeekSheet();
    else sheet.style.transform = '';
  });
}

// ═══════════════════════════════════════════
//   PEEK: NOTAS
// ═══════════════════════════════════════════

function openPeekNotas({ composeNew = false } = {}) {
  const notas = readNotasSync().slice(0, 8);
  const body = composeNew ? renderCompose('nota') : renderNotasList(notas);
  const actions = composeNew
    ? `<button class="peek-sheet__btn" data-action="cancel">cancelar</button>
       <button class="peek-sheet__btn is-primary" data-action="save-nota">guardar nota</button>`
    : `<button class="peek-sheet__btn" data-action="ver-todas">ver todas (${notas.length})</button>
       <button class="peek-sheet__btn is-primary" data-action="nueva">+ nueva nota</button>`;

  const sheet = renderPeekSheet({
    title: 'Notas',
    sub: composeNew ? 'nueva captura' : 'recientes',
    body,
    actions,
  });

  sheet.querySelector('[data-action="ver-todas"]')?.addEventListener('click', () => {
    closePeekSheet();
    setTimeout(() => scrollToSection('manifiestos'), 240);
  });
  sheet.querySelector('[data-action="nueva"]')?.addEventListener('click', () => {
    openPeekNotas({ composeNew: true });
  });
  sheet.querySelector('[data-action="cancel"]')?.addEventListener('click', closePeekSheet);
  sheet.querySelector('[data-action="save-nota"]')?.addEventListener('click', () => {
    const ta = sheet.querySelector('.peek-compose__input');
    const chip = sheet.querySelector('.peek-chip.is-active');
    const texto = (ta?.value || '').trim();
    if (!texto) { ta?.focus(); return; }
    saveNotaQuick(texto, chip?.dataset.cat || 'rapida');
    haptic([18, 30, 18]);
    closePeekSheet();
  });
  sheet.querySelectorAll('.peek-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      sheet.querySelectorAll('.peek-chip').forEach(c => c.classList.remove('is-active'));
      chip.classList.add('is-active');
      haptic(6);
    });
  });
  sheet.querySelectorAll('[data-nota-id]').forEach(card => {
    card.addEventListener('click', () => {
      closePeekSheet();
      setTimeout(() => scrollToSection('manifiestos'), 220);
    });
  });

  if (composeNew) {
    setTimeout(() => sheet.querySelector('.peek-compose__input')?.focus(), 320);
  }
}

function renderNotasList(notas) {
  if (!notas.length) {
    return `<div class="peek-empty">Todavía no hay notas.<br>Capturá tu primer momento.</div>`;
  }
  return notas.map(n => `
    <div class="peek-card" data-nota-id="${n.id}">
      <p class="peek-card__title">${escapeHtml(n.titulo || (n.texto || '').slice(0, 48) || 'sin título')}</p>
      <span class="peek-card__meta">${fmtDate(n.fecha || n.ts)}${n.categoria ? ' · ' + escapeHtml(n.categoria) : ''}</span>
      ${n.texto ? `<p class="peek-card__body">${escapeHtml(n.texto)}</p>` : ''}
    </div>
  `).join('');
}

// ═══════════════════════════════════════════
//   PEEK: MANIFIESTO
// ═══════════════════════════════════════════

function openPeekManifiesto({ composeNew = false } = {}) {
  const items = readManifiestosSync().slice(0, 8);
  const body = composeNew ? renderCompose('manifiesto') : renderManifList(items);
  const actions = composeNew
    ? `<button class="peek-sheet__btn" data-action="cancel">cancelar</button>
       <button class="peek-sheet__btn is-primary" data-action="save-manif">guardar manifiesto</button>`
    : `<button class="peek-sheet__btn" data-action="ver-todos">ver todos (${items.length})</button>
       <button class="peek-sheet__btn is-primary" data-action="nuevo">+ nuevo manifiesto</button>`;

  const sheet = renderPeekSheet({
    title: 'Manifiestos',
    sub: composeNew ? 'nuevo' : 'recientes',
    body,
    actions,
  });

  sheet.querySelector('[data-action="ver-todos"]')?.addEventListener('click', () => {
    closePeekSheet();
    setTimeout(() => scrollToSection('manifiesto-gestor'), 240);
  });
  sheet.querySelector('[data-action="nuevo"]')?.addEventListener('click', () => {
    openPeekManifiesto({ composeNew: true });
  });
  sheet.querySelector('[data-action="cancel"]')?.addEventListener('click', closePeekSheet);
  sheet.querySelector('[data-action="save-manif"]')?.addEventListener('click', () => {
    const ta = sheet.querySelector('.peek-compose__input');
    const titulo = sheet.querySelector('.peek-compose__title')?.value?.trim();
    const chip = sheet.querySelector('.peek-chip.is-active');
    const contenido = (ta?.value || '').trim();
    if (!contenido) { ta?.focus(); return; }
    saveManifQuick(titulo || contenido.slice(0, 40), contenido, chip?.dataset.cat);
    haptic([18, 30, 18]);
    closePeekSheet();
  });
  sheet.querySelectorAll('.peek-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      sheet.querySelectorAll('.peek-chip').forEach(c => c.classList.remove('is-active'));
      chip.classList.add('is-active');
      haptic(6);
    });
  });
  sheet.querySelectorAll('[data-manif-id]').forEach(card => {
    card.addEventListener('click', () => {
      closePeekSheet();
      setTimeout(() => scrollToSection('manifiesto-gestor'), 220);
    });
  });

  if (composeNew) {
    setTimeout(() => sheet.querySelector('.peek-compose__title, .peek-compose__input')?.focus(), 320);
  }
}

function renderManifList(items) {
  if (!items.length) {
    return `<div class="peek-empty">Todavía no hay manifiestos.<br>Empezá tu biblia personal.</div>`;
  }
  return items.map(m => `
    <div class="peek-card" data-manif-id="${m.id}">
      <p class="peek-card__title">${escapeHtml(m.titulo || 'sin título')}</p>
      <span class="peek-card__meta">${fmtDate(m.fecha || m.ts)}${m.tags?.length ? ' · ' + m.tags.map(escapeHtml).join(', ') : ''}</span>
      ${m.contenido ? `<p class="peek-card__body">${escapeHtml(m.contenido)}</p>` : ''}
    </div>
  `).join('');
}

// ═══════════════════════════════════════════
//   COMPOSE (MIDI-style quick input)
// ═══════════════════════════════════════════

function renderCompose(kind) {
  const cats = kind === 'nota'
    ? ['rapida', 'filosofia', 'emocional', 'tech', 'sideral']
    : ['filosofia', 'tech', 'emocional', 'musical', 'yoga'];
  const titleField = kind === 'manifiesto'
    ? `<input class="peek-compose__title" type="text" placeholder="título…"
              style="width:100%;padding:10px 14px;border:1px solid rgba(0,0,0,0.1);
                     border-radius:12px;font:inherit;font-size:14px;margin-bottom:6px;" />`
    : '';
  return `
    <div class="peek-compose">
      ${titleField}
      <textarea class="peek-compose__input" placeholder="${kind === 'nota' ? 'qué pasó?' : 'qué pensás?'}"></textarea>
      <div class="peek-compose__chips">
        ${cats.map((c, i) => `<button class="peek-chip ${i === 0 ? 'is-active' : ''}" data-cat="${c}">${c}</button>`).join('')}
      </div>
    </div>
  `;
}

// ═══════════════════════════════════════════
//   DATA: sync reads + quick saves
// ═══════════════════════════════════════════

function readNotasSync() {
  try {
    const u = getUser() || {};
    const list = u.notasList || [];
    const map  = Object.entries(u.notas || {}).map(([id, n]) => ({ id, ...n }));
    const seen = new Set();
    return [...list, ...map]
      .filter(n => n.id && !seen.has(n.id) && seen.add(n.id))
      .sort((a, b) => (b.ts || 0) - (a.ts || 0));
  } catch (_) { return []; }
}

function readManifiestosSync() {
  try {
    const u = getUser() || {};
    const list = u.manifiestos || u.manifiestosList || [];
    return Array.isArray(list)
      ? [...list].sort((a, b) => (b.ts || 0) - (a.ts || 0))
      : Object.entries(list).map(([id, m]) => ({ id, ...m })).sort((a, b) => (b.ts || 0) - (a.ts || 0));
  } catch (_) { return []; }
}

function saveNotaQuick(texto, categoria) {
  const nota = {
    id: 'n_' + Date.now().toString(36),
    texto,
    categoria,
    fecha: new Date().toISOString(),
    ts: Date.now(),
  };
  try {
    if (NotasStore?.create) {
      NotasStore.create(texto, categoria);
    } else {
      const u = getUser() || {};
      saveUser({ notasList: [nota, ...(u.notasList || [])] });
    }
    feedbackBus?.push?.({ type: 'nota-guardada', payload: { texto, categoria }, tags: ['peek-dock'] });
  } catch (e) { console.warn('[peek-notas]', e); }
}

function saveManifQuick(titulo, contenido, tag) {
  const manif = {
    id: 'm_' + Date.now().toString(36),
    titulo,
    contenido,
    tags: tag ? [tag] : [],
    fecha: new Date().toISOString(),
    ts: Date.now(),
  };
  try {
    const u = getUser() || {};
    const list = u.manifiestos || [];
    saveUser({ manifiestos: [manif, ...(Array.isArray(list) ? list : [])] });
    feedbackBus?.push?.({ type: 'manifiesto-saved', payload: { titulo, tags: manif.tags }, tags: ['peek-dock'] });
  } catch (e) { console.warn('[peek-manif]', e); }
}

// ═══════════════════════════════════════════
//   MOBILE ENHANCEMENTS — MIDI sliders · tap targets
// ═══════════════════════════════════════════

/**
 * MIDI-style sliders: drag anywhere on track (not just thumb),
 * haptic ticks on value change, snap to integer, live value bubble.
 * Wraps existing <input type="range"> without changing markup.
 */
function enhanceSliders() {
  const selector = 'input[type="range"]:not([data-midi])';
  const wire = (input) => {
    input.dataset.midi = '1';
    input.style.touchAction = 'manipulation';

    let lastTick = Number(input.value);
    const onInput = () => {
      const v = Number(input.value);
      if (Math.round(v) !== Math.round(lastTick)) {
        haptic(4);
        lastTick = v;
      }
      input.style.setProperty('--midi-v', v);
      feedbackBus?.push?.({
        type: 'slider-midi',
        payload: { id: input.id || input.name || 'anon', value: v },
      });
    };
    input.addEventListener('input', onInput, { passive: true });

    // Drag-anywhere: tap on track jumps to that position
    const onPointerDown = (e) => {
      if (e.target !== input) return;
      const rect = input.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const min = Number(input.min || 0);
      const max = Number(input.max || 100);
      const next = Math.round(min + x * (max - min));
      if (!isNaN(next)) {
        input.value = next;
        input.dispatchEvent(new Event('input', { bubbles: true }));
        input.dispatchEvent(new Event('change', { bubbles: true }));
      }
    };
    input.addEventListener('pointerdown', onPointerDown);
  };

  document.querySelectorAll(selector).forEach(wire);
  // Re-wire new sliders added dynamically
  const mo = new MutationObserver(muts => {
    for (const m of muts) {
      m.addedNodes.forEach(n => {
        if (n.nodeType !== 1) return;
        if (n.matches?.(selector)) wire(n);
        n.querySelectorAll?.(selector).forEach(wire);
      });
    }
  });
  mo.observe(document.body, { childList: true, subtree: true });
}

/**
 * Enlarge tap targets: any button or link smaller than 36px gets an
 * invisible ::before pseudo-hitbox via data-tap-plus attribute.
 * Also routes click to the element on touchend within 500ms window.
 */
function enhanceTapTargets() {
  const MIN = 36;
  const check = () => {
    document.querySelectorAll('button, a, [role="button"]').forEach(el => {
      if (el.dataset.tapPlus) return;
      const r = el.getBoundingClientRect();
      if (r.width && r.height && (r.width < MIN || r.height < MIN)) {
        el.dataset.tapPlus = '1';
        el.style.position ||= 'relative';
        el.style.touchAction = 'manipulation';
      }
    });
  };
  check();
  window.addEventListener('load', check);
  setTimeout(check, 800);
  setTimeout(check, 2400);
}

// ═══════════════════════════════════════════
//   Utils
// ═══════════════════════════════════════════

function fmtDate(iso) {
  if (!iso) return '';
  const d = typeof iso === 'number' ? new Date(iso) : new Date(iso);
  if (isNaN(d)) return '';
  return d.toLocaleDateString('es-AR', { day: '2-digit', month: 'short' });
}

function escapeHtml(s) {
  return String(s == null ? '' : s).replace(/[&<>"']/g, c => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  })[c]);
}
