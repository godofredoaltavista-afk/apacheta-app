/* =============================================
   APACHETA — MANIFIESTOS PARTICLES
   Partículas flotantes para secciones de color
   filosofia: partículas amarillas / doradas
   tech: partículas blancas / cyan
   ============================================= */

function createParticleSystem(canvas, config) {
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let W, H;
  let particles = [];
  let raf;
  let active = false;

  function resize() {
    W = canvas.width  = canvas.offsetWidth  || canvas.parentElement?.offsetWidth  || 400;
    H = canvas.height = canvas.offsetHeight || canvas.parentElement?.offsetHeight || 300;
    // Rebuild particles on resize to fill new dimensions
    if (particles.length > 0) buildParticles();
  }

  function buildParticles() {
    const count = Math.floor((W * H) / config.density);
    particles = Array.from({ length: count }, () => makeParticle(true));
  }

  function makeParticle(randomY = false) {
    return {
      x: Math.random() * W,
      y: randomY ? Math.random() * H : H + Math.random() * 20,
      size: config.minSize + Math.random() * (config.maxSize - config.minSize),
      speed: config.minSpeed + Math.random() * (config.maxSpeed - config.minSpeed),
      drift: (Math.random() - 0.5) * 0.4,       // gentle horizontal sway
      opacity: 0.1 + Math.random() * 0.6,
      opacityDir: (Math.random() > 0.5 ? 1 : -1) * 0.003,
      phase: Math.random() * Math.PI * 2,        // for sinusoidal drift
    };
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);

    // Gradient fade: particles more visible at top, fade at bottom
    particles.forEach(p => {
      const fade = 1 - (p.y / H) * 0.4;  // slightly more opaque near top
      ctx.globalAlpha = Math.max(0, Math.min(1, p.opacity * fade));

      ctx.fillStyle = config.color;
      ctx.beginPath();

      if (config.shape === 'star') {
        drawStar(ctx, p.x, p.y, p.size);
      } else if (config.shape === 'diamond') {
        drawDiamond(ctx, p.x, p.y, p.size);
      } else {
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      }
      ctx.fill();
    });

    ctx.globalAlpha = 1;
  }

  function drawStar(ctx, x, y, r) {
    const pts = 4;
    const inner = r * 0.4;
    ctx.save();
    ctx.translate(x, y);
    ctx.beginPath();
    for (let i = 0; i < pts * 2; i++) {
      const angle = (i * Math.PI) / pts;
      const rad   = i % 2 === 0 ? r : inner;
      i === 0
        ? ctx.moveTo(Math.cos(angle) * rad, Math.sin(angle) * rad)
        : ctx.lineTo(Math.cos(angle) * rad, Math.sin(angle) * rad);
    }
    ctx.closePath();
    ctx.restore();
  }

  function drawDiamond(ctx, x, y, r) {
    ctx.save();
    ctx.translate(x, y);
    ctx.beginPath();
    ctx.moveTo(0, -r);
    ctx.lineTo(r * 0.6, 0);
    ctx.lineTo(0, r);
    ctx.lineTo(-r * 0.6, 0);
    ctx.closePath();
    ctx.restore();
  }

  function tick(t) {
    raf = requestAnimationFrame(tick);

    particles.forEach(p => {
      p.y -= p.speed;
      p.x += p.drift + Math.sin(t * 0.0008 + p.phase) * 0.3;

      // Opacity pulse
      p.opacity += p.opacityDir;
      if (p.opacity > 0.7 || p.opacity < 0.05) p.opacityDir *= -1;

      // Wrap around when particle leaves top
      if (p.y < -p.size * 2) {
        Object.assign(p, makeParticle(false));
      }
      // Wrap horizontal
      if (p.x < -10) p.x = W + 10;
      if (p.x > W + 10) p.x = -10;
    });

    draw();
  }

  // IntersectionObserver: only animate when visible
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !active) {
        active = true;
        resize();
        buildParticles();
        requestAnimationFrame(t => tick(t));
      } else if (!entry.isIntersecting && active) {
        active = false;
        cancelAnimationFrame(raf);
        ctx.clearRect(0, 0, W, H);
      }
    });
  }, { threshold: 0.1 });

  observer.observe(canvas.parentElement || canvas);
  window.addEventListener('resize', () => { if (active) resize(); });
}

export function initManifiestosParticles() {
  // ── Filosofia: yellow/gold particles, star shapes ──
  createParticleSystem(
    document.getElementById('particles-filosofia'),
    {
      color:    '#FFE44D',
      minSize:  1.2,
      maxSize:  3.5,
      minSpeed: 0.25,
      maxSpeed: 0.75,
      density:  6000,   // 1 particle per N px²
      shape:    'circle',
    }
  );

  // ── Tech: white/cyan particles, small circles ──
  createParticleSystem(
    document.getElementById('particles-tech'),
    {
      color:    'rgba(168,230,224,0.9)',
      minSize:  0.8,
      maxSize:  2.8,
      minSpeed: 0.2,
      maxSpeed: 0.6,
      density:  5500,
      shape:    'circle',
    }
  );
}
