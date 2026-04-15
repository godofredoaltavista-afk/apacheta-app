/* =============================================
   APACHETA — LISSAJOUS CURVE
   Curva animada controlada por dos frecuencias
   ============================================= */

export function initLissajous() {
  const canvas  = document.getElementById('lissajous-canvas');
  const sliderA = document.getElementById('lissajous-freq-a');
  const sliderB = document.getElementById('lissajous-freq-b');
  const valA    = document.getElementById('lissajous-a-val');
  const valB    = document.getElementById('lissajous-b-val');

  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let W, H, t = 0, raf;
  let freqA = 2, freqB = 1;
  let active = false;

  function resize() {
    W = canvas.width  = canvas.offsetWidth  || 390;
    H = canvas.height = canvas.offsetHeight || 420;
  }
  resize();
  window.addEventListener('resize', () => { if (active) resize(); });

  // ── Drawing ──────────────────────────────────
  function draw(timestamp) {
    raf = requestAnimationFrame(draw);
    t += 0.008;

    ctx.clearRect(0, 0, W, H);

    const cx = W / 2;
    const cy = H / 2;
    const r  = Math.min(W, H) * 0.42;
    const POINTS = 1200;
    const delta  = Math.PI * 0.5; // phase offset

    // Draw fading trail segments
    const segments = 6;
    for (let s = 0; s < segments; s++) {
      const tOffset = t - s * 0.04;
      const alpha   = (1 - s / segments) * 0.9;

      ctx.beginPath();
      ctx.strokeStyle = `rgba(212,197,232,${alpha})`;
      ctx.lineWidth   = 1.5 - s * 0.15;

      for (let i = 0; i <= POINTS; i++) {
        const angle = (i / POINTS) * Math.PI * 2;
        const x = cx + r * Math.sin(freqA * angle + tOffset + delta);
        const y = cy + r * Math.sin(freqB * angle + tOffset);
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.stroke();
    }

    // Glowing leading point
    const a0 = 0;
    const px = cx + r * Math.sin(freqA * a0 + t + delta);
    const py = cy + r * Math.sin(freqB * a0 + t);
    const grd = ctx.createRadialGradient(px, py, 0, px, py, 10);
    grd.addColorStop(0, 'rgba(212,197,232,0.9)');
    grd.addColorStop(1, 'rgba(212,197,232,0)');
    ctx.fillStyle = grd;
    ctx.beginPath();
    ctx.arc(px, py, 10, 0, Math.PI * 2);
    ctx.fill();
  }

  // ── IntersectionObserver ──────────────────────
  const observer = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting && !active) {
        active = true;
        resize();
        requestAnimationFrame(draw);
      } else if (!e.isIntersecting && active) {
        active = false;
        cancelAnimationFrame(raf);
      }
    });
  }, { threshold: 0.1 });
  observer.observe(canvas);

  // ── Sliders ──────────────────────────────────
  sliderA?.addEventListener('input', () => {
    freqA = parseFloat(sliderA.value);
    if (valA) valA.textContent = freqA.toFixed(1);
  });
  sliderB?.addEventListener('input', () => {
    freqB = parseFloat(sliderB.value);
    if (valB) valB.textContent = freqB.toFixed(1);
  });
}
