/* =============================================
   APACHETA — VENTANA 2 · FEEDBACK BUS PANEL
   Timeline visual del bus + botón Regenerar Oracle
   Botón fijo bottom-right, abre panel desde la derecha
   ============================================= */

import { feedbackBus } from '../core/feedback-bus.js';

export function initFeedbackBusPanel() {
  // ─── Trigger flotante ─────────────────────
  const trigger = document.createElement('button');
  trigger.id = 'ventana2-trigger';
  trigger.className = 'v2-trigger';
  trigger.setAttribute('aria-label', 'Ventana 2');
  trigger.innerHTML = `
    <span class="v2-trigger__glyph">◱</span>
    <span class="v2-trigger__count" id="v2-count">0</span>
  `;
  document.body.appendChild(trigger);

  // ─── Panel ────────────────────────────────
  const panel = document.createElement('aside');
  panel.id = 'ventana2-panel';
  panel.className = 'v2-panel';
  panel.innerHTML = `
    <header class="v2-panel__head">
      <div class="v2-panel__title-wrap">
        <span class="v2-panel__kicker">// VENTANA 2 · ACUMULATIVA</span>
        <h2 class="v2-panel__title">feedback bus</h2>
        <p class="v2-panel__sub">lo que hiciste en la app</p>
      </div>
      <button class="v2-panel__close" id="v2-close" aria-label="Cerrar">×</button>
    </header>

    <div class="v2-panel__summary" id="v2-summary"></div>

    <div class="v2-panel__timeline" id="v2-timeline"></div>

    <div class="v2-panel__actions">
      <button class="v2-btn v2-btn--ghost" id="v2-clear">Limpiar todo</button>
      <button class="v2-btn v2-btn--primary" id="v2-regenerate">
        <span class="v2-btn__glyph">✦</span>
        Regenerar copys + banners
      </button>
    </div>

    <p class="v2-panel__foot">sin perder versiones previas · todo queda en historial</p>
  `;
  document.body.appendChild(panel);

  // ─── Open / close ─────────────────────────
  let open = false;
  function toggle(force) {
    open = typeof force === 'boolean' ? force : !open;
    panel.classList.toggle('is-open', open);
    trigger.classList.toggle('is-open', open);
  }
  trigger.addEventListener('click', () => toggle());
  panel.querySelector('#v2-close')?.addEventListener('click', () => toggle(false));
  document.addEventListener('pointerdown', e => {
    if (open && !panel.contains(e.target) && !trigger.contains(e.target)) toggle(false);
  });

  // ─── Render ───────────────────────────────
  const timelineEl = panel.querySelector('#v2-timeline');
  const summaryEl  = panel.querySelector('#v2-summary');
  const countEl    = trigger.querySelector('#v2-count');

  function render() {
    const bus   = feedbackBus.read();
    const recent = bus.slice(-80).reverse();

    countEl.textContent = bus.length > 99 ? '99+' : String(bus.length);

    const sum = feedbackBus.summary();
    summaryEl.innerHTML = sum.total
      ? `<span class="v2-chip">${sum.total} eventos</span>` +
        Object.entries(sum.byType).slice(0, 6).map(([type, n]) => {
          const m = feedbackBus.meta(type);
          return `<span class="v2-chip">${m.emoji} ${m.label} · ${n}</span>`;
        }).join('')
      : `<span class="v2-chip v2-chip--empty">vacío · usá la app</span>`;

    if (!recent.length) {
      timelineEl.innerHTML = `
        <div class="v2-empty">
          <p>Todavía no hay interacciones registradas.</p>
          <p class="v2-empty__hint">Tocá chakras, guardá tu aura, escribí notas, rascá las cards…</p>
        </div>
      `;
      return;
    }

    timelineEl.innerHTML = recent.map((e, i) => {
      const m = feedbackBus.meta(e.type);
      const d = new Date(e.ts);
      const hhmm = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
      const realIdx = bus.length - 1 - i;
      return `
        <div class="v2-row" data-idx="${realIdx}">
          <span class="v2-row__time">${hhmm}</span>
          <span class="v2-row__emoji">${m.emoji}</span>
          <span class="v2-row__body">
            <span class="v2-row__label">${m.label}</span>
            <span class="v2-row__payload">${formatPayload(e.type, e.payload)}</span>
          </span>
          <button class="v2-row__del" data-idx="${realIdx}" aria-label="Eliminar">×</button>
        </div>
      `;
    }).join('');

    timelineEl.querySelectorAll('.v2-row__del').forEach(btn => {
      btn.addEventListener('click', ev => {
        ev.stopPropagation();
        const idx = parseInt(btn.dataset.idx, 10);
        feedbackBus.removeAt(idx);
      });
    });
  }

  function formatPayload(type, p) {
    if (!p) return '';
    try {
      switch (type) {
        case 'note-written':    return `"${p.titulo || ''}" · ${(p.tags || []).join('·')}`;
        case 'aura-saved':      return Object.entries(p.aura || {}).map(([k,v]) => `${k}=${v}`).join(' ');
        case 'mandala-saved':   return `${p.strokes} trazos · sim ${p.symmetry}`;
        case 'chakra-tapped':   return `${p.sanskrit} · ${p.nombre}`;
        case 'color-changed':   return `${p.tab} → ${p.color}`;
        case 'mode-changed':    return `${p.mode}`;
        case 'scratch-revealed':return `${p.titulo}`;
        case 'frase-saved':     return `"${(p.texto || '').slice(0, 50)}…"`;
        case 'copy-regenerated':return `${p.keys || 0} copys · ${p.source}`;
        default: return JSON.stringify(p).slice(0, 60);
      }
    } catch { return ''; }
  }

  render();
  window.addEventListener('apacheta:feedback',         render);
  window.addEventListener('apacheta:feedback:removed', render);
  window.addEventListener('apacheta:feedback:cleared', render);

  // ─── Clear ────────────────────────────────
  panel.querySelector('#v2-clear')?.addEventListener('click', () => {
    if (confirm('¿Limpiar todo el bus? El historial de copys no se toca.')) {
      feedbackBus.clear();
    }
  });

  // ─── Regenerate (hook para copy-oracle) ───
  panel.querySelector('#v2-regenerate')?.addEventListener('click', () => {
    window.dispatchEvent(new CustomEvent('apacheta:oracle:regenerate-all'));
    toggle(false);
  });
}
