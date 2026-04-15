/* =============================================
   APACHETA — MENTE / CONSCIENCIA
   Sección full-screen con tipografía cinética
   ============================================= */

const PALABRAS = [
  { txt: 'm i n d .', cls: 'word-giant' },
  { txt: 'b r e a t h e .', cls: 'word-mid' },
  { txt: 'p r e s e n c i a', cls: 'word-small' },
  { txt: 'c o n s c i e n c i a', cls: 'word-small' },
];

const MICRO_CARDS = [
  {
    top: 'ESTADO', main: 'flujo', sub: 'cuando el hacer y el ser son lo mismo',
    icon: '◎', color: '#A8E6E0',
  },
  {
    top: 'PATRÓN', main: 'fractal', sub: 'el universo se repite en escalas',
    icon: '✦', color: '#D4C5E8',
  },
  {
    top: 'VACÍO', main: 'origen', sub: 'del silencio nace todo lo que es',
    icon: '○', color: '#F4C2C2',
  },
  {
    top: 'TIEMPO', main: 'ahora', sub: 'el único momento que siempre existió',
    icon: '◷', color: '#F5D89A',
  },
  {
    top: 'MENTE', main: 'espejo', sub: 'lo que ves afuera vive adentro tuyo',
    icon: '⌇', color: '#B8D4B0',
  },
];

export function initMente() {
  const section    = document.getElementById('mente');
  const wordTrack  = document.getElementById('mente-word-track');
  const cardsTrack = document.getElementById('mente-cards-track');

  if (!section) return;

  // ─── Palabras cinéticas animadas ──────────
  if (wordTrack) {
    PALABRAS.forEach((w, i) => {
      const el = document.createElement('div');
      el.className = `mente-word mente-word--${w.cls} reveal-item`;
      el.style.animationDelay = `${i * 0.18}s`;
      el.textContent = w.txt;
      wordTrack.appendChild(el);
    });
  }

  // ─── Cards de conceptos (scroll horizontal) ─
  if (cardsTrack) {
    MICRO_CARDS.forEach(card => {
      const el = document.createElement('div');
      el.className = 'mente-concept-card';
      el.style.setProperty('--card-accent', card.color);
      el.innerHTML = `
        <span class="mente-card__icon" style="color:${card.color}">${card.icon}</span>
        <p class="mente-card__top">${card.top}</p>
        <p class="mente-card__main">${card.main}</p>
        <p class="mente-card__sub">${card.sub}</p>
      `;
      cardsTrack.appendChild(el);
    });
  }

  // ─── Canvas: onda de energía de fondo ──────
  const canvas = document.getElementById('mente-canvas');
  if (canvas) {
    initMenteCanvas(canvas);
  }

  // ─── Orbes flotantes con nombre ────────────
  const user = getUserFromStorage();
  const nameEl = document.getElementById('mente-name-bubble');
  if (nameEl && user.nombre) {
    nameEl.textContent = user.nombre;
  }

  // ─── Mouse/touch drag for cards scroll ─────
  const scrollEl = section.querySelector('.mente-cards-scroll');
  if (scrollEl) {
    let isDragging = false, startX = 0, scrollLeft = 0;

    scrollEl.addEventListener('mousedown', e => {
      isDragging = true;
      startX = e.pageX - scrollEl.offsetLeft;
      scrollLeft = scrollEl.scrollLeft;
      scrollEl.style.cursor = 'grabbing';
    });
    scrollEl.addEventListener('mouseleave', () => { isDragging = false; scrollEl.style.cursor = 'grab'; });
    scrollEl.addEventListener('mouseup', () => { isDragging = false; scrollEl.style.cursor = 'grab'; });
    scrollEl.addEventListener('mousemove', e => {
      if (!isDragging) return;
      e.preventDefault();
      const x = e.pageX - scrollEl.offsetLeft;
      const walk = (x - startX) * 1.5;
      scrollEl.scrollLeft = scrollLeft - walk;
    });
  }
}

function getUserFromStorage() {
  try { return JSON.parse(localStorage.getItem('apacheta_user') || '{}'); }
  catch { return {}; }
}

function initMenteCanvas(canvas) {
  const ctx = canvas.getContext('2d');
  let W, H, t = 0;

  function resize() {
    W = canvas.width  = canvas.offsetWidth  || 390;
    H = canvas.height = canvas.offsetHeight || window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  const user   = getUserFromStorage();
  const c1     = user.colores?.[0] || '#A8E6E0';
  const c2     = user.colores?.[1] || '#F4C2C2';
  const c3     = user.colores?.[2] || '#D4C5E8';

  function draw() {
    requestAnimationFrame(draw);
    t += 0.004;

    ctx.clearRect(0, 0, W, H);

    // Tres orbes suaves que se mueven
    const orbs = [
      { x: 0.3 + Math.sin(t)       * 0.15, y: 0.3 + Math.cos(t * 0.7)  * 0.15, r: W * 0.45, c: c1 },
      { x: 0.7 + Math.cos(t * 1.2) * 0.12, y: 0.5 + Math.sin(t * 0.9)  * 0.2,  r: W * 0.4,  c: c2 },
      { x: 0.5 + Math.sin(t * 0.8) * 0.1,  y: 0.7 + Math.cos(t * 1.1)  * 0.12, r: W * 0.35, c: c3 },
    ];

    ctx.globalCompositeOperation = 'screen';

    orbs.forEach(o => {
      const gx = o.x * W, gy = o.y * H;
      const grad = ctx.createRadialGradient(gx, gy, 0, gx, gy, o.r);
      grad.addColorStop(0, o.c + '55');
      grad.addColorStop(0.5, o.c + '22');
      grad.addColorStop(1, o.c + '00');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, W, H);
    });

    ctx.globalCompositeOperation = 'source-over';
  }

  draw();
}
