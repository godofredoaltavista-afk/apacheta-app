/* =============================================
   APACHETA — SECTION TINT
   Cada sección tiñe el fondo global con su color
   Se activa al entrar (IntersectionObserver).
   El halo global sigue la sección visible.
   ============================================= */

const TINTS = {
  'hero-morning':        { a: '#A8E6E0', b: '#F4C2C2', c: '#FFE44D' },
  'dashboard':           { a: '#A8E6E0', b: '#F5E6D3', c: '#FFE44D' },
  'modo-alucinaje':      { a: '#F4C2C2', b: '#D4C5E8', c: '#A8E6E0' },
  'biblioteca':          { a: '#F4C2C2', b: '#F5D89A', c: '#FFFFFF' },
  'scratch-reveal':      { a: '#D4C5E8', b: '#F4C2C2', c: '#A8E6E0' },
  'respiracion':         { a: '#F4C2C2', b: '#D4C5E8', c: '#FFFFFF' },
  'chakras':             { a: '#FF8C00', b: '#FFE44D', c: '#A8E6E0' },
  'manifiestos':         { a: '#FFE44D', b: '#2a3a1a', c: '#F4C2C2' },
  'calendar-section':    { a: '#A8E6E0', b: '#F5E6D3', c: '#F4C2C2' },
  'conexiones':          { a: '#F5D89A', b: '#F4C2C2', c: '#A8E6E0' },
  'visualising-wisdom':  { a: '#F4C2C2', b: '#FFE44D', c: '#D4906A' },
  'ajetreo-sur':         { a: '#2a3a1a', b: '#FFE44D', c: '#F4C2C2' },
  'mente':               { a: '#D4C5E8', b: '#A8E6E0', c: '#FFFFFF' },
  'soplar':              { a: '#F4C2C2', b: '#A8E6E0', c: '#FFFFFF' },
  'aura-composer':       { a: '#FFE44D', b: '#D4C5E8', c: '#F4C2C2' },
  'mandala':             { a: '#A8E6E0', b: '#F4C2C2', c: '#D4C5E8' },
  'glb-mate':            { a: '#1a1a2e', b: '#B57A8A', c: '#A8E6E0' },
  'lissajous':           { a: '#0a0a0a', b: '#D4C5E8', c: '#A8E6E0' },
  'fibonacci':           { a: '#0a0a0a', b: '#F5D89A', c: '#D4C5E8' },
  'morning-journey':     { a: '#F5E6D3', b: '#F4C2C2', c: '#FFE44D' },
  'meditacion-ojo':      { a: '#0a0a0a', b: '#D4C5E8', c: '#A8E6E0' },
  'aura-history':        { a: '#F4C2C2', b: '#A8E6E0', c: '#F5D89A' },
  'lofi':                { a: '#0f0f1a', b: '#A8E6E0', c: '#F4C2C2' },
  'alarma':              { a: '#1a1a2e', b: '#F5D89A', c: '#A8E6E0' },
};

export function initSectionTint() {
  // Halo contenedor
  let halo = document.getElementById('section-tint-halo');
  if (!halo) {
    halo = document.createElement('div');
    halo.id = 'section-tint-halo';
    halo.innerHTML = `
      <div class="tint-blob tint-blob--a"></div>
      <div class="tint-blob tint-blob--b"></div>
      <div class="tint-blob tint-blob--c"></div>
    `;
    document.body.prepend(halo);
  }

  const sections = Object.keys(TINTS).map(id => document.getElementById(id)).filter(Boolean);
  if (!sections.length) return;

  const obs = new IntersectionObserver((entries) => {
    // Pick the entry with highest intersectionRatio
    let best = null;
    entries.forEach(e => {
      if (!best || e.intersectionRatio > best.intersectionRatio) best = e;
    });
    if (!best || best.intersectionRatio < 0.25) return;

    const id = best.target.id;
    const tint = TINTS[id];
    if (!tint) return;

    const root = document.documentElement;
    root.style.setProperty('--tint-a', tint.a);
    root.style.setProperty('--tint-b', tint.b);
    root.style.setProperty('--tint-c', tint.c);
    root.dataset.section = id;
  }, { threshold: [0.25, 0.5, 0.75] });

  sections.forEach(s => obs.observe(s));
}
