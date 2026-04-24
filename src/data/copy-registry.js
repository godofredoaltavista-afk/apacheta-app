/* =============================================
   APACHETA — COPY REGISTRY
   Mapa de keys editables → selectors DOM.
   El Oracle lee esto, genera variantes (vía NotebookLM
   o mock), y aplica al DOM.
   ============================================= */

export const COPY_REGISTRY = {

  // ─── Visualising Wisdom ────────────────────
  'wisdom.top': {
    default: 'I AM<br/>NOTHING',
    selector: '#visualising-wisdom .wisdom__title-big',
    tags: ['filosofia', 'sideral'],
    allowHtml: true,
  },
  'wisdom.bottom': {
    default: 'I AM<br/>EVERYTHING',
    selector: '#visualising-wisdom .wisdom__title-bottom',
    tags: ['filosofia', 'sideral'],
    allowHtml: true,
  },

  // ─── Biblioteca ────────────────────────────
  'biblioteca.title': {
    default: 'Biblioteca',
    selector: '#biblioteca .t-title',
    tags: ['filosofia', 'tech', 'musical'],
  },

  // ─── Scratch reveal ────────────────────────
  'scratch.title': {
    default: 'Descubrí',
    selector: '#scratch-reveal .t-title',
    tags: ['emocional', 'filosofia'],
  },

  // ─── Aura composer ─────────────────────────
  'aura.kicker': {
    default: 'tu',
    selector: '#aura-composer .section-title:first-child',
    tags: ['emocional'],
  },
  'aura.title': {
    default: 'aura',
    selector: '#aura-composer .section-title:nth-child(2)',
    tags: ['emocional', 'sideral'],
  },

  // ─── Mandala ───────────────────────────────
  'mandala.title': {
    default: 'el mandala',
    selector: '#mandala .section-title',
    tags: ['yoga', 'sideral', 'filosofia'],
  },

  // ─── Lissajous ─────────────────────────────
  'lissajous.title': {
    default: 'lissajous.',
    selector: '#lissajous .section-title',
    tags: ['tech', 'musical', 'sideral'],
  },

  // ─── Fibonacci ─────────────────────────────
  'fibonacci.title': {
    default: 'fibonacci.',
    selector: '#fibonacci .section-title',
    tags: ['tech', 'sideral'],
  },

  // ─── Aura History ──────────────────────────
  'aura-history.title': {
    default: 'historial<br/>de aura.',
    selector: '#aura-history .section-title',
    tags: ['emocional'],
    allowHtml: true,
  },

  // ─── Alarma ────────────────────────────────
  'alarma.title': {
    default: 'despertar.',
    selector: '#alarma .section-title',
    tags: ['yoga', 'filosofia'],
  },

  // ─── Chakras (7) ──────────────────────────
  // Estos usan data-chakra + descripcion en chakras.js — los copys salen de CHAKRAS_DATA.
  // Mapeamos la descripción via data-key para que el Oracle pueda targetearlos.
  'chakras.muladhara.desc':  { default: '', selector: '[data-copy-key="chakras.muladhara.desc"]',  tags: ['yoga','raiz'] },
  'chakras.svadhisthana.desc':{default: '', selector: '[data-copy-key="chakras.svadhisthana.desc"]', tags: ['yoga','emocional'] },
  'chakras.manipura.desc':   { default: '', selector: '[data-copy-key="chakras.manipura.desc"]',    tags: ['yoga','voluntad'] },
  'chakras.anahata.desc':    { default: '', selector: '[data-copy-key="chakras.anahata.desc"]',     tags: ['yoga','amor'] },
  'chakras.vishuddha.desc':  { default: '', selector: '[data-copy-key="chakras.vishuddha.desc"]',   tags: ['yoga','voz'] },
  'chakras.ajna.desc':       { default: '', selector: '[data-copy-key="chakras.ajna.desc"]',        tags: ['yoga','intuicion'] },
  'chakras.sahasrara.desc':  { default: '', selector: '[data-copy-key="chakras.sahasrara.desc"]',   tags: ['yoga','sideral'] },

  // ─── Manifiestos particles (legacy 3 cards) ─
  'manifiestos.filosofia.title': {
    default: 'Filosofía',
    selector: '#manifiestos [data-manif="filosofia"] .t-title',
    tags: ['filosofia'],
  },
  'manifiestos.tech.title': {
    default: 'Tech',
    selector: '#manifiestos [data-manif="tech"] .t-title',
    tags: ['tech'],
  },
  'manifiestos.emocional.title': {
    default: 'Emocional',
    selector: '#manifiestos [data-manif="emocional"] .t-title',
    tags: ['emocional'],
  },

  // ─── Frases del día ────────────────────────
  'frases.kicker': {
    default: 'FRASE DEL DÍA',
    selector: '#frases [data-copy-key="frases.kicker"]',
    tags: ['filosofia', 'emocional'],
  },

  // ─── Morning journey ───────────────────────
  'morning.title': {
    default: 'MORNING JOURNEY',
    selector: '[data-copy-key="morning.title"]',
    tags: ['filosofia', 'yoga'],
  },
  'morning.invite': {
    default: 'escribí tu mañana',
    selector: '#morning-journey',
    attribute: 'data-invite',
    tags: ['yoga'],
  },

  // ─── Meditación ojo ────────────────────────
  'ojo.title': {
    default: 'el ojo',
    selector: '#meditacion-ojo [data-copy-key="ojo.title"]',
    tags: ['yoga', 'sideral'],
  },

  // ─── Lofi / Sonidos ────────────────────────
  'lofi.title': {
    default: 'sonidos',
    selector: '#lofi [data-copy-key="lofi.title"]',
    tags: ['musical'],
  },

  // ─── Conexiones ────────────────────────────
  'conexiones.title': {
    default: 'conexiones',
    selector: '#conexiones [data-copy-key="conexiones.title"]',
    tags: ['filosofia', 'sideral'],
  },
};

export function getRegistryKeys() {
  return Object.keys(COPY_REGISTRY);
}

export function applyCopy(key, variant) {
  const entry = COPY_REGISTRY[key];
  if (!entry || !entry.selector) return false;

  const els = document.querySelectorAll(entry.selector);
  if (!els.length) return false;

  els.forEach(el => {
    if (entry.attribute) {
      el.setAttribute(entry.attribute, variant);
    } else if (entry.allowHtml) {
      el.innerHTML = variant;
    } else {
      el.textContent = variant;
    }
  });
  return true;
}

export function readCurrent(key) {
  const entry = COPY_REGISTRY[key];
  if (!entry) return null;
  const el = document.querySelector(entry.selector);
  if (!el) return entry.default;
  if (entry.attribute) return el.getAttribute(entry.attribute);
  return entry.allowHtml ? el.innerHTML : el.textContent;
}
