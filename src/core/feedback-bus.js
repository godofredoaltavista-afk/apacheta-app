/* =============================================
   APACHETA — FEEDBACK BUS
   Acumula cada interacción significativa del usuario.
   Alimenta el Copy Oracle para regenerar copys+banners
   en base al uso real de la app.
   ============================================= */

import { getUser, saveUser } from '../main.js';

const MAX_ENTRIES = 500;

const TYPE_META = {
  'like':             { emoji: '❤️',  label: 'like' },
  'dislike':          { emoji: '✕',   label: 'dislike' },
  'aura-saved':       { emoji: '✦',   label: 'aura' },
  'mandala-saved':    { emoji: '◎',   label: 'mandala' },
  'note-written':     { emoji: '📝',  label: 'nota' },
  'slice':            { emoji: '▱',   label: 'slice' },
  'midi-play':        { emoji: '🎹',  label: 'midi' },
  'streak-day':       { emoji: '∎',   label: 'streak' },
  'section-view-long':{ emoji: '◉',   label: 'visita' },
  'scratch-revealed': { emoji: '✧',   label: 'revelado' },
  'chakra-tapped':    { emoji: '⊙',   label: 'chakra' },
  'frase-saved':      { emoji: '❝',   label: 'frase' },
  'color-changed':    { emoji: '◐',   label: 'color' },
  'mode-changed':     { emoji: '☯',   label: 'modo' },
  'preset-applied':   { emoji: '◈',   label: 'preset' },
  'copy-regenerated': { emoji: '✦✦',  label: 'regenerar' },
};

function readBus() {
  const u = getUser();
  return Array.isArray(u.feedbackBus) ? u.feedbackBus : [];
}

function writeBus(bus) {
  const trimmed = bus.slice(-MAX_ENTRIES);
  saveUser({ feedbackBus: trimmed });
}

export const feedbackBus = {
  push({ type, payload = {}, ts = Date.now() }) {
    if (!TYPE_META[type]) {
      console.warn('[feedback-bus] tipo desconocido:', type);
    }
    const bus = readBus();
    bus.push({ type, payload, ts });
    writeBus(bus);
    window.dispatchEvent(new CustomEvent('apacheta:feedback', {
      detail: { type, payload, ts }
    }));
  },

  read() { return readBus(); },

  readRecent(n = 50) { return readBus().slice(-n); },

  removeAt(idx) {
    const bus = readBus();
    if (idx < 0 || idx >= bus.length) return;
    bus.splice(idx, 1);
    writeBus(bus);
    window.dispatchEvent(new CustomEvent('apacheta:feedback:removed', { detail: { idx } }));
  },

  clear() {
    writeBus([]);
    window.dispatchEvent(new CustomEvent('apacheta:feedback:cleared'));
  },

  meta(type) {
    return TYPE_META[type] || { emoji: '•', label: type };
  },

  summary() {
    const bus = readBus();
    const byType = {};
    bus.forEach(e => { byType[e.type] = (byType[e.type] || 0) + 1; });
    return {
      total: bus.length,
      byType,
      first: bus[0]?.ts || null,
      last:  bus[bus.length - 1]?.ts || null,
    };
  }
};

window.feedbackBus = feedbackBus;
