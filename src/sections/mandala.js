/* =============================================
   APACHETA — MANDALA GENERATOR
   Canvas interactivo con toque para dibujar
   ============================================= */

export function initMandala() {
  const section = document.getElementById('mandala');
  const canvas  = document.getElementById('mandala-canvas');
  const clearBtn= document.getElementById('mandala-clear');
  const saveBtn = document.getElementById('mandala-save');

  if (!section || !canvas) return;

  const ctx = canvas.getContext('2d');
  let W, H, CX, CY;
  let isDrawing    = false;
  let symmetry     = 8;    // ejes de simetría
  let baseRotation = 0;
  let t            = 0;
  const strokes    = [];   // historial para redraw
  let lastX = 0, lastY = 0;

  const user   = getUserFromStorage();
  const colors = user.colores || ['#A8E6E0', '#F4C2C2', '#D4C5E8'];
  let colorIdx = 0;

  function resize() {
    W  = canvas.width  = canvas.offsetWidth  || 360;
    H  = canvas.height = canvas.offsetHeight || 360;
    CX = W / 2;
    CY = H / 2;
    redraw();
  }
  resize();
  window.addEventListener('resize', resize);

  // ─── Rotación automática de fondo ─────────
  function rotateBg() {
    requestAnimationFrame(rotateBg);
    t += 0.003;
    ctx.clearRect(0, 0, W, H);

    // Guías circulares tenues
    for (let r = 30; r < Math.min(W, H) / 2; r += 30) {
      ctx.beginPath();
      ctx.arc(CX, CY, r, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(168,230,224,${0.04 + Math.sin(t + r * 0.05) * 0.02})`;
      ctx.lineWidth   = 0.5;
      ctx.stroke();
    }

    // Ejes de simetría (líneas guía muy tenues)
    for (let i = 0; i < symmetry; i++) {
      const angle = (i / symmetry) * Math.PI * 2 + t * 0.1;
      ctx.beginPath();
      ctx.moveTo(CX, CY);
      ctx.lineTo(CX + Math.cos(angle) * Math.min(W, H) / 2, CY + Math.sin(angle) * Math.min(W, H) / 2);
      ctx.strokeStyle = 'rgba(212,197,232,0.06)';
      ctx.lineWidth   = 0.5;
      ctx.stroke();
    }

    // Redibujar trazos guardados
    strokes.forEach(s => drawSymmetricLine(s.x1, s.y1, s.x2, s.y2, s.color, s.width, false));
  }
  rotateBg();

  function drawSymmetricLine(x1, y1, x2, y2, color, lineW, save = true) {
    if (save) strokes.push({ x1, y1, x2, y2, color, width: lineW });

    for (let i = 0; i < symmetry; i++) {
      const angle = (i / symmetry) * Math.PI * 2;
      ctx.save();
      ctx.translate(CX, CY);
      ctx.rotate(angle);

      ctx.beginPath();
      ctx.moveTo(x1 - CX, y1 - CY);
      ctx.lineTo(x2 - CX, y2 - CY);
      ctx.strokeStyle = color;
      ctx.lineWidth   = lineW;
      ctx.lineCap     = 'round';
      ctx.stroke();

      // Espejo horizontal
      ctx.scale(1, -1);
      ctx.beginPath();
      ctx.moveTo(x1 - CX, y1 - CY);
      ctx.lineTo(x2 - CX, y2 - CY);
      ctx.stroke();

      ctx.restore();
    }
  }

  function redraw() {
    ctx.clearRect(0, 0, W, H);
    strokes.forEach(s => drawSymmetricLine(s.x1, s.y1, s.x2, s.y2, s.color, s.width, false));
  }

  function getPos(e) {
    const rect = canvas.getBoundingClientRect();
    const src  = e.touches ? e.touches[0] : e;
    return { x: src.clientX - rect.left, y: src.clientY - rect.top };
  }

  function startDraw(e) {
    isDrawing = true;
    const { x, y } = getPos(e);
    lastX = x; lastY = y;
    colorIdx = (colorIdx + 1) % colors.length;
  }

  function draw(e) {
    if (!isDrawing) return;
    e.preventDefault?.();
    const { x, y } = getPos(e);
    const lineW = 2 + Math.hypot(x - lastX, y - lastY) * 0.05;
    drawSymmetricLine(lastX, lastY, x, y, colors[colorIdx] + 'CC', Math.min(lineW, 5));
    lastX = x; lastY = y;
  }

  canvas.addEventListener('mousedown',  startDraw);
  canvas.addEventListener('mousemove',  draw);
  canvas.addEventListener('mouseup',    () => { isDrawing = false; });
  canvas.addEventListener('mouseleave', () => { isDrawing = false; });

  canvas.addEventListener('touchstart', e => { e.preventDefault(); startDraw(e); }, { passive: false });
  canvas.addEventListener('touchmove',  e => { e.preventDefault(); draw(e); },       { passive: false });
  canvas.addEventListener('touchend',   () => { isDrawing = false; });

  clearBtn?.addEventListener('click', () => {
    strokes.length = 0;
    ctx.clearRect(0, 0, W, H);
  });

  saveBtn?.addEventListener('click', () => {
    const link = document.createElement('a');
    link.download = 'apacheta-mandala.png';
    link.href     = canvas.toDataURL('image/png');
    link.click();
  });
}

function getUserFromStorage() {
  try { return JSON.parse(localStorage.getItem('apacheta_user') || '{}'); }
  catch { return {}; }
}
