/* =============================================
   APACHETA — MEDITACIÓN OJO
   Animación de ojo que abre/cierra + vibración
   chakras secuencial + sonido ding
   ============================================= */

// Chakra vibraciones: frecuencia Hz → mapea a oscilador
const CHAKRA_SEQUENCE = [
  { name: 'Raíz',        color: '#FF4444', freq: 396, ms: 120 },
  { name: 'Sacro',       color: '#FF8C00', freq: 417, ms: 120 },
  { name: 'Plexo',       color: '#FFE44D', freq: 528, ms: 120 },
  { name: 'Corazón',     color: '#B8D4B0', freq: 639, ms: 180 },
  { name: 'Garganta',    color: '#A8E6E0', freq: 741, ms: 120 },
  { name: 'Tercer Ojo',  color: '#6495ED', freq: 852, ms: 120 },
  { name: 'Corona',      color: '#D4C5E8', freq: 963, ms: 200 },
];

function makeDing(audioCtx, freq, duration = 0.6) {
  const osc  = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.connect(gain);
  gain.connect(audioCtx.destination);
  osc.type = 'sine';
  osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
  gain.gain.setValueAtTime(0.25, audioCtx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);
  osc.start(audioCtx.currentTime);
  osc.stop(audioCtx.currentTime + duration);
}

export function initMeditacionOjo() {
  const section    = document.getElementById('meditacion-ojo');
  const eyeSvg     = document.getElementById('eye-svg');
  const lidTop     = document.getElementById('eye-lid-top');
  const lidBottom  = document.getElementById('eye-lid-bottom');
  const iris       = document.getElementById('eye-iris');
  const pupil      = document.getElementById('eye-pupil');
  const instEl     = document.getElementById('eye-instruction');
  const startBtn   = document.getElementById('meditation-start');
  const bgEl       = document.getElementById('eye-bg');
  const dots       = section?.querySelectorAll('.chakra-seq-dot');

  if (!section) return;

  let running   = false;
  let audioCtx  = null;
  let animTimer = null;

  // ── Eye blink idle animation ──────────────────
  let blinkT = 0;
  let blinkRaf;

  function blinkLoop() {
    blinkRaf = requestAnimationFrame(blinkLoop);
    blinkT += 0.015;

    // Slow blink: eyelid closes and opens gently
    const blink = Math.pow(Math.max(0, Math.sin(blinkT * 0.35)), 8);
    setEyeOpen(1 - blink * 0.95);
  }

  function setEyeOpen(t) {
    // t=1 fully open, t=0 fully closed
    // Top lid moves down, bottom lid moves up
    const openTop    = `M10,50 Q100,${5 + (45 * (1-t))},190,50`;
    const openBottom = `M10,50 Q100,${95 - (45 * (1-t))},190,50`;
    const irisR      = 22 * t;
    const pupilR     = 10 * t;

    if (lidTop)    lidTop.setAttribute('d', openTop);
    if (lidBottom) lidBottom.setAttribute('d', openBottom);
    if (iris)      iris.setAttribute('r', String(Math.max(0.1, irisR)));
    if (pupil)     pupil.setAttribute('r', String(Math.max(0.1, pupilR)));
  }

  blinkLoop();

  // ── Background color pulse ────────────────────
  function pulseBackground(color, duration) {
    if (!bgEl) return;
    bgEl.style.transition = `background ${duration}ms ease`;
    bgEl.style.background = `radial-gradient(ellipse at center, ${color}44 0%, ${color}11 50%, transparent 70%)`;
    setTimeout(() => {
      bgEl.style.background = 'radial-gradient(ellipse at center, rgba(212,197,232,0.15) 0%, transparent 70%)';
    }, duration + 200);
  }

  // ── Chakra sequence ───────────────────────────
  async function runChakraSequence() {
    cancelAnimationFrame(blinkRaf);

    // Close eyes slowly
    const closeMs = 1800;
    const closeStart = performance.now();

    await new Promise(resolve => {
      function closeStep(now) {
        const p = Math.min(1, (now - closeStart) / closeMs);
        setEyeOpen(1 - p);
        if (p < 1) requestAnimationFrame(closeStep);
        else resolve();
      }
      requestAnimationFrame(closeStep);
    });

    if (instEl) instEl.textContent = 'sentí cada chakra...';

    // Sequence through chakras
    for (let i = 0; i < CHAKRA_SEQUENCE.length; i++) {
      if (!running) break;
      const ch = CHAKRA_SEQUENCE[i];

      // Highlight dot
      dots?.forEach((d, di) => {
        d.style.transform = di === i ? 'scale(1.8)' : 'scale(1)';
        d.style.boxShadow = di === i ? `0 0 12px ${ch.color}` : 'none';
      });

      // Ding sound
      if (audioCtx) makeDing(audioCtx, ch.freq, 1.0);

      // Vibration
      if (navigator.vibrate) navigator.vibrate(ch.ms);

      // Background pulse
      pulseBackground(ch.color, 600);

      if (instEl) instEl.textContent = ch.name;

      await delay(900);
    }

    // Reset dots
    dots?.forEach(d => { d.style.transform = 'scale(1)'; d.style.boxShadow = 'none'; });

    // Final ding (all chakras united)
    if (audioCtx) makeDing(audioCtx, 432, 2.0);
    if (navigator.vibrate) navigator.vibrate([50, 30, 50, 30, 100]);

    if (instEl) instEl.textContent = 'todo tu ser vibra.';

    await delay(2000);

    // Open eyes slowly
    const openMs    = 2000;
    const openStart = performance.now();

    await new Promise(resolve => {
      function openStep(now) {
        const p = Math.min(1, (now - openStart) / openMs);
        setEyeOpen(p);
        if (p < 1) requestAnimationFrame(openStep);
        else resolve();
      }
      requestAnimationFrame(openStep);
    });

    if (instEl) instEl.textContent = 'tocá para comenzar';
    if (startBtn) startBtn.textContent = 'iniciar viaje';
    running = false;
    blinkLoop();
  }

  function delay(ms) {
    return new Promise(r => setTimeout(r, ms));
  }

  // ── Start button ──────────────────────────────
  startBtn?.addEventListener('click', () => {
    if (running) return;
    running = true;

    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }

    startBtn.textContent = '· · ·';
    if (instEl) instEl.textContent = 'cerrá los ojos...';

    runChakraSequence();
  });
}
