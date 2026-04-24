/* =============================================
   APACHETA — SCRATCH REVEAL
   Canvas 2D rasca-pegatina mechanic
   ============================================= */

const SCRATCH_CONTENT = [
  {
    titulo: 'Física cuántica y Buda',
    texto: 'Heisenberg demostró que no podés conocer la posición y velocidad de una partícula al mismo tiempo. Buda enseñó que el intento de fijar la realidad es la causa del sufrimiento. 2.500 años de diferencia, la misma verdad.',
  },
  {
    titulo: 'El azul no existía',
    texto: 'Los griegos antiguos no tenían palabra para "azul". Homero llamó al mar "color vino". Los japoneses del siglo VII llamaban verde y azul con la misma palabra. El lenguaje no solo describe la realidad: la crea.',
  },
  {
    titulo: '432 Hz y la naturaleza',
    texto: 'La frecuencia 432 Hz coincide con la constante de Schumann de la Tierra (7.83 Hz × 55). La mayoría de la música del Renacimiento se afinaba en A=432. El estándar moderno de 440 Hz fue adoptado en 1939.',
  },
  {
    titulo: 'Fibonacci en todo',
    texto: 'La espiral de la concha nautilus, las semillas del girasol, la disposición de las hojas, las galaxias espirales: todas siguen la secuencia de Fibonacci. El universo tiene un patrón de crecimiento favorito.',
  },
];

export function initScratchReveal() {
  for (let i = 1; i <= 4; i++) {
    setupScratchCard(i);
  }
}

function setupScratchCard(num) {
  const card    = document.getElementById(`sc-${num}`);
  const canvas  = document.getElementById(`sc-canvas-${num}`);
  const overlay = card?.querySelector('.scratch-card__overlay');
  const data    = SCRATCH_CONTENT[num - 1];

  if (!card || !canvas || !data) return;

  // Actualizar contenido de la card
  const titleEl = card.querySelector('.scratch-card__content-title');
  if (titleEl) titleEl.textContent = data.titulo;

  const ctx = canvas.getContext('2d');
  let isInitialized = false;
  let isDrawing = false;
  let scratchedPixels = 0;
  let W = 0;
  let H = 0;
  let isRevealed = false;

  // ─── Inicializar canvas cuando el card es visible ────
  // Evita W=0/H=0 si el card no está en el viewport al cargar
  function initCanvas() {
    if (isInitialized) return;

    W = card.offsetWidth;
    H = card.offsetHeight;

    if (!W || !H) return; // todavía no renderizó

    canvas.width  = W;
    canvas.height = H;

    drawOverlay();
    isInitialized = true;
  }

  // IntersectionObserver para inicializar solo cuando es visible
  const initObserver = new IntersectionObserver(entries => {
    if (entries[0].isIntersecting && !isInitialized) {
      initCanvas();
      initObserver.disconnect();
    }
  }, { threshold: 0.1 });
  initObserver.observe(card);

  // Fallback: intentar inicializar en el próximo frame por si ya es visible
  requestAnimationFrame(() => initCanvas());

  // ─── Dibujar el overlay "rascable" ──────────────────
  function drawOverlay() {
    // Resetear composite op para dibujar el overlay
    ctx.globalCompositeOperation = 'source-over';

    const colors = [
      ['#D4C5E8', '#A8E6E0'],
      ['#F4C2C2', '#D4C5E8'],
      ['#A8E6E0', '#F5D89A'],
      ['#F5D89A', '#F4C2C2'],
    ];
    const [c1, c2] = colors[(num - 1) % colors.length];
    const grad = ctx.createLinearGradient(0, 0, W, H);
    grad.addColorStop(0, c1 + 'F0');
    grad.addColorStop(1, c2 + 'F0');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);

    // Texto "Rascá ↓" — sin ctx.letterSpacing (no es propiedad Canvas válida en todos los browsers)
    ctx.fillStyle = 'rgba(26,26,26,0.55)';
    ctx.font = 'bold 12px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('R  A  S  C  Á', W / 2, H / 2 - 8);
    ctx.fillText('↓', W / 2, H / 2 + 16);

    // Cambiar a destination-out para el scratch mechanic
    ctx.globalCompositeOperation = 'destination-out';
  }

  // ─── Calcular % rascado (muestra aleatoria para performance) ─
  function getScratchPercent() {
    const imageData = ctx.getImageData(0, 0, W, H);
    let cleared = 0;
    // Samplear cada 4 pixels para no bloquear el hilo
    for (let i = 3; i < imageData.data.length; i += 16) {
      if (imageData.data[i] < 128) cleared++;
    }
    return (cleared / (W * H / 4)) * 100;
  }

  // ─── Rascar ──────────────────────────────────────────
  function drawCircle(x, y, r = 30) {
    if (!isInitialized || isRevealed) return;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
    scratchedPixels++;

    // Chequear % cada 15 trazos para no hammear getImageData
    if (scratchedPixels % 15 === 0) {
      const pct = getScratchPercent();
      if (pct > 50) {
        reveal();
      }
    }
  }

  function reveal() {
    if (isRevealed) return;
    isRevealed = true;

    window.feedbackBus?.push({
      type: 'scratch-revealed',
      payload: { titulo: data?.titulo || card.dataset.scratchId || 'scratch' }
    });

    // 1. Agregar clase CSS (overlay div se hace opacity:0)
    card.classList.add('revealed');

    // 2. Limpiar canvas completamente para que el contenido sea 100% visible
    ctx.globalCompositeOperation = 'destination-out';
    ctx.fillStyle = 'rgba(0,0,0,1)';
    ctx.fillRect(0, 0, W, H);

    // 3. Mostrar contenido
    showRevealedContent(card, data);

    // 4. Desactivar eventos del canvas
    canvas.style.pointerEvents = 'none';
  }

  // ─── Eventos Mouse ────────────────────────────────────
  canvas.addEventListener('mousedown', e => {
    isDrawing = true;
    const r = canvas.getBoundingClientRect();
    drawCircle(e.clientX - r.left, e.clientY - r.top);
  });
  canvas.addEventListener('mousemove', e => {
    if (!isDrawing) return;
    const r = canvas.getBoundingClientRect();
    drawCircle(e.clientX - r.left, e.clientY - r.top);
  });
  canvas.addEventListener('mouseup',    () => { isDrawing = false; });
  canvas.addEventListener('mouseleave', () => { isDrawing = false; });

  // ─── Eventos Touch ────────────────────────────────────
  canvas.addEventListener('touchstart', e => {
    e.preventDefault();
    isDrawing = true;
    const r = canvas.getBoundingClientRect();
    const t = e.touches[0];
    drawCircle(t.clientX - r.left, t.clientY - r.top);
  }, { passive: false });

  canvas.addEventListener('touchmove', e => {
    e.preventDefault();
    if (!isDrawing) return;
    const r = canvas.getBoundingClientRect();
    const t = e.touches[0];
    drawCircle(t.clientX - r.left, t.clientY - r.top, 34);
  }, { passive: false });

  canvas.addEventListener('touchend', () => { isDrawing = false; });
}

function showRevealedContent(card, data) {
  const contentEl = card.querySelector('.scratch-card__content');
  if (!contentEl) return;

  contentEl.innerHTML = `
    <div style="padding:var(--space-md);display:flex;flex-direction:column;justify-content:flex-end;height:100%;">
      <p style="font-family:var(--font-mono);font-size:0.65rem;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.1em;margin-bottom:8px;">Descubriste</p>
      <p style="font-family:var(--font-display);font-size:1.05rem;font-weight:600;line-height:1.3;margin-bottom:10px;">${data.titulo}</p>
      <p style="font-size:0.78rem;color:var(--text-secondary);line-height:1.65;">${data.texto}</p>
    </div>
  `;
  contentEl.style.background = 'var(--bg-primary)';
}
