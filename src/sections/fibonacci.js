/* =============================================
   APACHETA — FIBONACCI SPIRAL
   Espiral áurea animada con rectángulos
   ============================================= */

export function initFibonacci() {
  const canvas = document.getElementById('fibonacci-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let W, H, raf;
  let active    = false;
  let progress  = 0;   // 0→1 draw progress
  let drawPhase = 0;   // current fib square being drawn

  const PHI = (1 + Math.sqrt(5)) / 2;

  function resize() {
    W = canvas.width  = canvas.offsetWidth  || 390;
    H = canvas.height = canvas.offsetHeight || 420;
  }
  resize();
  window.addEventListener('resize', () => { if (active) { resize(); progress = 0; drawPhase = 0; } });

  function getBaseUnit() {
    // Fit the spiral into the canvas with padding
    const side = Math.min(W, H) * 0.82;
    // Fib unit so that a(8) + a(5) = side → 13 units = side
    return side / 13;
  }

  function draw() {
    raf = requestAnimationFrame(draw);
    ctx.clearRect(0, 0, W, H);
    progress = Math.min(1, progress + 0.003);

    const u    = getBaseUnit();
    const fibs = [1, 1, 2, 3, 5, 8];
    const cx   = W / 2 - u * 0.5;
    const cy   = H / 2 + u * 2;

    // Compute square positions (same layout as the classic golden rectangle)
    const squares = [
      { n: fibs[0], x: cx,         y: cy - u,     w: u,       h: u       },   // 1
      { n: fibs[1], x: cx - u,     y: cy - u,     w: u,       h: u       },   // 1
      { n: fibs[2], x: cx - u,     y: cy - 3*u,   w: 2*u,     h: 2*u     },   // 2
      { n: fibs[3], x: cx + u,     y: cy - 4*u,   w: 3*u,     h: 3*u     },   // 3
      { n: fibs[4], x: cx - 4*u,   y: cy - 5*u,   w: 5*u,     h: 5*u     },   // 5
      { n: fibs[5], x: cx - 4*u,   y: cy + u,     w: 8*u,     h: 8*u     },   // 8
    ];

    const totalSquares = squares.length;
    const drawn = Math.floor(progress * totalSquares * 2) / 2; // half-square steps

    squares.forEach((sq, i) => {
      const alpha = Math.min(1, Math.max(0, (progress * totalSquares - i)));
      if (alpha <= 0) return;

      // Square border
      ctx.globalAlpha = alpha * 0.35;
      ctx.strokeStyle = 'rgba(212,197,232,1)';
      ctx.lineWidth   = 1;
      ctx.strokeRect(sq.x, sq.y, sq.w, sq.h);

      // Number label
      ctx.globalAlpha = alpha * 0.7;
      ctx.fillStyle   = 'rgba(212,197,232,0.9)';
      ctx.font        = `${Math.max(8, sq.w * 0.3)}px var(--font-mono, monospace)`;
      ctx.textAlign   = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(sq.n, sq.x + sq.w / 2, sq.y + sq.h / 2);
    });

    // Draw arc (spiral) per square
    ctx.globalAlpha = 1;
    ctx.strokeStyle = 'rgba(212,197,232,0.85)';
    ctx.lineWidth   = 2;
    ctx.lineJoin    = 'round';
    ctx.lineCap     = 'round';

    // Arc centers and directions per square
    const arcs = [
      { cx: squares[0].x + squares[0].w, cy: squares[0].y,              r: squares[0].w, sa: Math.PI,       ea: Math.PI * 1.5 },
      { cx: squares[1].x + squares[1].w, cy: squares[1].y + squares[1].h, r: squares[1].w, sa: Math.PI * 1.5, ea: Math.PI * 2   },
      { cx: squares[2].x,                cy: squares[2].y + squares[2].h, r: squares[2].w, sa: 0,             ea: Math.PI * 0.5 },
      { cx: squares[3].x + squares[3].w, cy: squares[3].y + squares[3].h, r: squares[3].w, sa: Math.PI * 0.5, ea: Math.PI       },
      { cx: squares[4].x + squares[4].w, cy: squares[4].y,               r: squares[4].w, sa: Math.PI,       ea: Math.PI * 1.5 },
      { cx: squares[5].x + squares[5].w, cy: squares[5].y,               r: squares[5].w, sa: Math.PI * 1.5, ea: Math.PI * 2   },
    ];

    arcs.forEach((arc, i) => {
      const frac = Math.min(1, Math.max(0, progress * totalSquares - i));
      if (frac <= 0) return;

      const ea = arc.sa + (arc.ea - arc.sa) * frac;
      ctx.globalAlpha = Math.min(1, frac + 0.2);
      ctx.beginPath();
      ctx.arc(arc.cx, arc.cy, arc.r, arc.sa, ea, false);
      ctx.stroke();
    });

    ctx.globalAlpha = 1;
  }

  const observer = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting && !active) {
        active   = true;
        progress = 0;
        resize();
        requestAnimationFrame(draw);
      } else if (!e.isIntersecting && active) {
        active = false;
        cancelAnimationFrame(raf);
      }
    });
  }, { threshold: 0.15 });
  observer.observe(canvas);
}
