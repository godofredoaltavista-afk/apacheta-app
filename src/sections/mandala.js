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
  let symmetry     = 8;
  let baseRotation = 0;
  let t            = 0;
  const strokes    = [];
  let lastX = 0, lastY = 0;

  const user   = getUserFromStorage();
  const colors = [...(user.colores || ['#A8E6E0', '#F4C2C2', '#D4C5E8'])];
  let colorIdx = 0;

  // ─── Color picker buttons ─────────────────────
  const colorBtns = document.querySelectorAll('.mandala-color-btn');
  function syncColorBtns() {
    colorBtns.forEach((btn, i) => {
      btn.style.background = colors[i] || '#ccc';
      btn.classList.toggle('is-active', i === colorIdx);
    });
  }
  colorBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      colorIdx = parseInt(btn.dataset.colorIdx, 10);
      syncColorBtns();
    });
  });
  syncColorBtns();

  // Update colors when user changes aura
  window.addEventListener('apacheta:colorsChanged', e => {
    const newCols = e.detail?.colores;
    if (newCols) { newCols.forEach((c, i) => { colors[i] = c; }); syncColorBtns(); }
  });

  // ─── Symmetry selector ───────────────────────
  document.querySelectorAll('.mandala-sym-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      symmetry = parseInt(btn.dataset.sym, 10);
      document.querySelectorAll('.mandala-sym-btn').forEach(b => b.classList.toggle('is-active', b === btn));
    });
  });

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
    const dataUrl = canvas.toDataURL('image/png');

    // Download full-size PNG
    const link = document.createElement('a');
    link.download = 'apacheta-mandala.png';
    link.href     = dataUrl;
    link.click();

    // Apply grayscale + build 50% thumbnail for archive
    const grayCanvas = document.createElement('canvas');
    grayCanvas.width  = W;
    grayCanvas.height = H;
    const gctx = grayCanvas.getContext('2d');
    const img  = new Image();
    img.onload = () => {
      // full-size grayscale
      gctx.drawImage(img, 0, 0);
      const imgData = gctx.getImageData(0, 0, W, H);
      for (let pi = 0; pi < imgData.data.length; pi += 4) {
        const g = imgData.data[pi] * 0.299 + imgData.data[pi+1] * 0.587 + imgData.data[pi+2] * 0.114;
        imgData.data[pi] = imgData.data[pi+1] = imgData.data[pi+2] = g;
      }
      gctx.putImageData(imgData, 0, 0);
      const grayDataUrl = grayCanvas.toDataURL();

      // 50% thumbnail (gray)
      const thumbW = Math.round(W * 0.5);
      const thumbH = Math.round(H * 0.5);
      const thumbCanvas = document.createElement('canvas');
      thumbCanvas.width  = thumbW;
      thumbCanvas.height = thumbH;
      thumbCanvas.getContext('2d').drawImage(grayCanvas, 0, 0, thumbW, thumbH);
      const thumbUrl = thumbCanvas.toDataURL('image/jpeg', 0.75);

      // Set section background
      section.style.backgroundImage = `url(${grayDataUrl})`;
      section.style.backgroundSize  = 'cover';
      section.style.backgroundPos   = 'center';

      // Save to archive
      try {
        const user    = JSON.parse(localStorage.getItem('apacheta_user') || '{}');
        const today   = new Date().toISOString().split('T')[0];
        const archive = user.mandalaArchive || [];
        archive.unshift({ ts: Date.now(), fecha: today, thumbUrl, colores: user.colores || [], strokes: strokes.length });
        if (archive.length > 30) archive.splice(30);
        user.mandalaArchive  = archive;
        // keep legacy mandalaHistory too
        user.mandalaHistory  = user.mandalaHistory || [];
        const legacyEntry    = { fecha: today, dataUrl, colores: user.colores || [] };
        const legacyIdx      = user.mandalaHistory.findIndex(m => m.fecha === today);
        if (legacyIdx >= 0) user.mandalaHistory[legacyIdx] = legacyEntry;
        else user.mandalaHistory.push(legacyEntry);
        if (user.mandalaHistory.length > 14) user.mandalaHistory.splice(0, user.mandalaHistory.length - 14);
        localStorage.setItem('apacheta_user', JSON.stringify(user));

        // Refresh archive gallery if visible
        window.dispatchEvent(new CustomEvent('apacheta:mandalaArchiveUpdated', { detail: { thumbUrl, fecha: today } }));
      } catch(e) { console.warn('[mandala-archive]', e); }

      // Dispatch event
      window.dispatchEvent(new CustomEvent('apacheta:mandalaSaved', {
        detail: { dataUrl, grayDataUrl }
      }));

      // Feedback bus
      const user = getUserFromStorage();
      window.feedbackBus?.push({
        type: 'mandala-saved',
        payload: { strokes: strokes.length, symmetry, colores: user.colores || [] }
      });
    };
    img.src = dataUrl;

    // Visual feedback
    if (saveBtn) {
      saveBtn.textContent = '✦ Mandala guardado';
      setTimeout(() => { saveBtn.textContent = 'Guardar mandala'; }, 2000);
    }
  });
}

function getUserFromStorage() {
  try { return JSON.parse(localStorage.getItem('apacheta_user') || '{}'); }
  catch { return {}; }
}
