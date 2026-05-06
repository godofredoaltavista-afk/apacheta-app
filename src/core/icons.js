/* =============================================
   APACHETA — SVG ICON LAB
   Líneas finas médicas · vectores huella dactilar
   Todos 1.25–1.5 stroke · currentColor · 24x24
   Sin fills sólidos. Sin emojis. Puro vector técnico.
   ============================================= */

const wrap = (inner, { size = 24, stroke = 1.25 } = {}) =>
  `<svg class="apa-ico" viewBox="0 0 24 24" width="${size}" height="${size}" fill="none" stroke="currentColor" stroke-width="${stroke}" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg">${inner}</svg>`;

export const ICONS = {
  // ─── Core nav ──────────────────────────────
  home: wrap(`<path d="M3 11L12 4l9 7"/><path d="M5 10v9a1 1 0 001 1h4v-6h4v6h4a1 1 0 001-1v-9"/><circle cx="12" cy="13" r="1.2"/>`),

  biblioteca: wrap(`<path d="M4 5v14M20 5v14"/><path d="M4 6.5h3.5a2 2 0 012 2V19"/><path d="M20 6.5h-3.5a2 2 0 00-2 2V19"/><path d="M9.5 10.5h5M9.5 13.5h5M9.5 16.5h5"/>`),

  respirar: wrap(`<circle cx="12" cy="12" r="3.5"/><circle cx="12" cy="12" r="7" opacity="0.6"/><circle cx="12" cy="12" r="10.5" opacity="0.3" stroke-dasharray="1 2.5"/>`),

  chakras: wrap(`<circle cx="12" cy="3.5" r="1.2"/><circle cx="12" cy="7" r="1.2"/><circle cx="12" cy="10.5" r="1.2"/><circle cx="12" cy="14" r="1.2"/><circle cx="12" cy="17.5" r="1.2"/><circle cx="12" cy="20.5" r="1.2"/><path d="M12 3.5v17" opacity="0.25" stroke-dasharray="0.6 1.2"/>`),

  manana: wrap(`<circle cx="12" cy="13" r="4"/><path d="M12 5v1.5M12 19.5V21M4.5 13h1.5M18 13h1.5M6.5 7.5l1 1M16.5 7.5l-1 1M6.5 18.5l1-1M16.5 18.5l-1-1"/>`),

  tarde: wrap(`<path d="M4 14h16"/><circle cx="12" cy="10" r="3.5"/><path d="M8 18.5h8M6 17h2"/>`),

  noche: wrap(`<path d="M19 14.5A7.5 7.5 0 0110.5 6a7 7 0 00.7 14 7.5 7.5 0 007.8-5.5z"/><circle cx="16" cy="8" r="0.4" fill="currentColor"/><circle cx="18.5" cy="12" r="0.4" fill="currentColor"/>`),

  manifiestos: wrap(`<path d="M6 3.5h9l3 3V19a1.5 1.5 0 01-1.5 1.5h-10.5A1.5 1.5 0 014.5 19V5A1.5 1.5 0 016 3.5z"/><path d="M14.5 3.5v3.5H18"/><path d="M8 11.5h8M8 14.5h8M8 17.5h5"/>`),

  capturar: wrap(`<rect x="3" y="7" width="18" height="13" rx="2"/><circle cx="12" cy="13.5" r="3.5"/><path d="M8 7V5.5A1 1 0 019 4.5h6a1 1 0 011 1V7"/><circle cx="17.5" cy="10" r="0.4" fill="currentColor"/>`),

  sonidos: wrap(`<path d="M4 10v4M7 7.5v9M10 9v6M13 5v14M16 8v8M19 10.5v3"/>`),

  ondas: wrap(`<path d="M2 12c2-4 4-4 6 0s4 4 6 0 4-4 6 0 2 0 2 0" />`),

  alarma: wrap(`<circle cx="12" cy="13" r="7.5"/><path d="M12 9v4l2.5 2"/><path d="M5 4.5L3 7M19 4.5L21 7"/>`),

  home_godofredo: wrap(`<circle cx="12" cy="12" r="10"/><path d="M7.5 14s1.5 2 4.5 2 4.5-2 4.5-2"/><circle cx="9" cy="10.5" r="0.6" fill="currentColor"/><circle cx="15" cy="10.5" r="0.6" fill="currentColor"/>`),

  // ─── Fingerprint / identity ────────────────
  fingerprint: wrap(`<path d="M12 4C7.5 4 4 7.5 4 12c0 2 .5 4 1.5 5.5"/><path d="M12 7c-3 0-5 2-5 5 0 2 .5 4 2 6"/><path d="M12 10c-1.5 0-2.5 1-2.5 2.5 0 2 .5 4 1.5 5.5"/><path d="M12 13v3c0 1.5 1 3 2.5 3.5"/><path d="M15.5 5.5c2.5 1.5 4 4 4 6.5"/><path d="M18 14c0 2-.5 3.5-1.5 5"/>`),

  // ─── Chakras: 7 símbolos técnicos ──────────
  ch_raiz: wrap(`<path d="M12 4v16"/><path d="M6 12h12"/><path d="M8.5 7.5l7 9M15.5 7.5l-7 9"/><circle cx="12" cy="12" r="2.5"/>`),
  ch_sacro: wrap(`<circle cx="12" cy="12" r="7"/><path d="M5.5 14s2 4 6.5 4 6.5-4 6.5-4"/><circle cx="12" cy="12" r="2"/>`),
  ch_plexo: wrap(`<circle cx="12" cy="12" r="3"/><path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.5 5.5l2 2M16.5 16.5l2 2M5.5 18.5l2-2M16.5 7.5l2-2"/>`),
  ch_corazon: wrap(`<path d="M12 19s-7-4.5-7-10a4 4 0 017-2.5A4 4 0 0119 9c0 5.5-7 10-7 10z"/><path d="M9 11l2 2 4-4" opacity="0.55"/>`),
  ch_garganta: wrap(`<path d="M4 12c1.5-2 4-3 8-3s6.5 1 8 3"/><path d="M4 12c1.5 2 4 3 8 3s6.5-1 8-3"/><circle cx="12" cy="12" r="1.2"/>`),
  ch_tercerojo: wrap(`<path d="M2 12s4-6 10-6 10 6 10 6-4 6-10 6-10-6-10-6z"/><circle cx="12" cy="12" r="3"/><circle cx="12" cy="12" r="1" fill="currentColor"/>`),
  ch_corona: wrap(`<path d="M4 16l2-8 3 5 3-8 3 8 3-5 2 8"/><path d="M4 19h16"/>`),

  // ─── Acciones ──────────────────────────────
  close: wrap(`<path d="M6 6l12 12M18 6L6 18"/>`),
  min: wrap(`<path d="M5 12h14"/>`),
  max: wrap(`<rect x="5" y="5" width="14" height="14" rx="1"/>`),
  drag: wrap(`<circle cx="9" cy="6" r="1" fill="currentColor"/><circle cx="9" cy="12" r="1" fill="currentColor"/><circle cx="9" cy="18" r="1" fill="currentColor"/><circle cx="15" cy="6" r="1" fill="currentColor"/><circle cx="15" cy="12" r="1" fill="currentColor"/><circle cx="15" cy="18" r="1" fill="currentColor"/>`),
  arrow_right: wrap(`<path d="M5 12h14M13 6l6 6-6 6"/>`),
  arrow_up: wrap(`<path d="M12 19V5M6 11l6-6 6 6"/>`),
  plus: wrap(`<path d="M12 5v14M5 12h14"/>`),
  check: wrap(`<path d="M4 12l5 5 11-11"/>`),
  menu: wrap(`<path d="M4 7h16M4 12h16M4 17h16"/>`),
  settings: wrap(`<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.5 4.5l2 2M17.5 17.5l2 2M4.5 19.5l2-2M17.5 6.5l2-2"/>`),

  // ─── Elementos ────────────────────────────
  mandala: wrap(`<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.5"/><path d="M12 3v18M3 12h18M5.5 5.5l13 13M18.5 5.5l-13 13"/>`),
  mate: wrap(`<path d="M7 8h10l-1 12a1.5 1.5 0 01-1.5 1.5h-5A1.5 1.5 0 018 20L7 8z"/><path d="M10 8V5.5A2 2 0 0112 3.5A2 2 0 0114 5.5V8"/><path d="M9 13l1.5 5"/>`),
  fibonacci: wrap(`<path d="M21 12a4 4 0 00-4-4h-4a2.5 2.5 0 00-2.5 2.5 1.5 1.5 0 001.5 1.5 1 1 0 001-1"/>`),
  gear: wrap(`<circle cx="12" cy="12" r="3"/><path d="M12 3v2.5M12 18.5V21M3 12h2.5M18.5 12H21M5 5l1.8 1.8M17.2 17.2L19 19M5 19l1.8-1.8M17.2 6.8L19 5"/>`),
  infinity: wrap(`<path d="M8 12a3 3 0 116 0 3 3 0 106 0 3 3 0 11-6 0 3 3 0 10-6 0z"/>`),
  pulse: wrap(`<path d="M3 12h4l2-6 4 12 2-6h6"/>`),
  aura: wrap(`<circle cx="12" cy="12" r="3"/><circle cx="12" cy="12" r="6" opacity="0.6"/><circle cx="12" cy="12" r="9" opacity="0.3" stroke-dasharray="1 2"/>`),
  eye_meditation: wrap(`<path d="M3 12s3.5-5 9-5 9 5 9 5-3.5 5-9 5-9-5-9-5z"/><circle cx="12" cy="12" r="2.5"/><path d="M12 4.5v1.5M12 18v1.5"/>`),
  book_quote: wrap(`<path d="M8 7h-2a2 2 0 00-2 2v3a2 2 0 002 2h2V7zM18 7h-2a2 2 0 00-2 2v3a2 2 0 002 2h2V7z"/><path d="M8 10v3c0 1.5-1 3-2.5 3.5M18 10v3c0 1.5-1 3-2.5 3.5"/>`),
  write: wrap(`<path d="M4 20l4-1 10.5-10.5a1.5 1.5 0 000-2l-1-1a1.5 1.5 0 00-2 0L5 16l-1 4z"/><path d="M14 6l3 3"/>`),
  orbit: wrap(`<ellipse cx="12" cy="12" rx="10" ry="4"/><ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(60 12 12)"/><ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(-60 12 12)"/><circle cx="12" cy="12" r="1.5" fill="currentColor"/>`),
  waveform: wrap(`<path d="M2 12h2l1-4 2 8 2-6 2 4 2-8 2 10 2-4 2 6 2-6h2"/>`),
  spiral: wrap(`<path d="M12 12m-1 0a1 1 0 102 0 1 1 0 10-2 0"/><path d="M11 11c-1 1-1 2 0 3s3 1 4 0 1-3 0-5-3-2-5-1-3 4-2 7 4 4 7 3 5-4 4-8"/>`),
  bird: wrap(`<path d="M3 14c2-4 6-7 11-7 3 0 6 1.5 7 4"/><path d="M3 14c1 1.5 3 3 6 3 4 0 7-2 8-5"/><circle cx="18" cy="9" r="0.4" fill="currentColor"/>`),
  rain: wrap(`<path d="M6 11a4 4 0 014-4 4 4 0 014-4 5 5 0 015 5 3 3 0 01-3 3H7a3 3 0 01-1-4z"/><path d="M8 17l-1 3M12 17l-1 3M16 17l-1 3"/>`),
  flame: wrap(`<path d="M12 3s-5 4-5 9a5 5 0 0010 0c0-2-1-3-1-3s-2 1-2 3-3 1-2-2 2-5 0-7z"/>`),
  ocean: wrap(`<path d="M3 10s2-2 4.5-2 3.5 2 6 2 3.5-2 6-2 1.5 2 1.5 2"/><path d="M3 15s2-2 4.5-2 3.5 2 6 2 3.5-2 6-2 1.5 2 1.5 2"/>`),

  // ─── Ritual / experiencia ──────────────────
  mic: wrap(`<rect x="9.5" y="3" width="5" height="11" rx="2.5"/><path d="M5.5 12a6.5 6.5 0 0013 0M12 18.5v2.5M8.5 21h7"/>`),
  breath_flow: wrap(`<path d="M3 8c3-3 6-3 9 0s6 3 9 0"/><path d="M3 12c3-3 6-3 9 0s6 3 9 0"/><path d="M3 16c3-3 6-3 9 0s6 3 9 0"/>`),
  star: wrap(`<path d="M12 3l2.5 6 6.5.5-5 4.5 1.5 6.5-6-3.5-6 3.5 1.5-6.5-5-4.5 6.5-.5z"/>`),
  compass: wrap(`<circle cx="12" cy="12" r="9"/><path d="M14 10l-5 5M14 10l-2 4-2 1 1-2z" fill="currentColor"/>`),

  // ─── Astral / sideral ─────────────────────
  astral: wrap(`<circle cx="12" cy="12" r="4.5"/><circle cx="12" cy="12" r="8.5" opacity="0.35" stroke-dasharray="1.5 2.5"/><path d="M12 2v2.5M12 19.5V22M2 12h2.5M19.5 12H22M4.9 4.9l1.8 1.8M17.3 17.3l1.8 1.8M4.9 19.1l1.8-1.8M17.3 6.7l1.8-1.8"/><circle cx="12" cy="12" r="1.2" fill="currentColor"/>`),
};

/* ─── Helpers para inyectar ─── */
export function icon(name, opts = {}) {
  const src = ICONS[name];
  if (!src) return '';
  if (!opts.size && !opts.stroke) return src;
  // Re-parse size
  const size = opts.size || 24;
  return src.replace(/width="24"/, `width="${size}"`).replace(/height="24"/, `height="${size}"`);
}

/** Reemplaza todos los [data-icon="name"] con el SVG */
export function hydrateIcons(root = document) {
  root.querySelectorAll('[data-icon]').forEach(el => {
    const name = el.dataset.icon;
    if (!ICONS[name]) return;
    el.innerHTML = ICONS[name];
    el.classList.add('apa-ico-host');
  });
}
