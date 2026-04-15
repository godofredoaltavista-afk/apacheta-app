/* =============================================
   APACHETA — RITUAL OM
   Web Audio API: voz/sonido mueve la nebulosa
   ============================================= */

let audioCtx, analyser, microphone, dataArray, mediaStream;
let isListening = false;
let energyLevel = 0;
let animFrame;

export function initSoplar() {
  const section    = document.getElementById('soplar');
  const startBtn   = document.getElementById('soplar-start');
  const bar        = document.getElementById('soplar-bar-fill');
  const orb        = document.getElementById('soplar-orb');
  const labelEl    = document.getElementById('soplar-label');
  const rewardEl   = document.getElementById('soplar-reward');
  const canvasEl   = document.getElementById('soplar-canvas');

  if (!section || !startBtn) return;

  // ─── Canvas de nebulosa reactiva ──────────
  let ctx, W, H, t = 0;
  let currentRms = 0;

  function getUserColors() {
    try {
      const u = JSON.parse(localStorage.getItem('apacheta_user') || '{}');
      return u.colores || ['#A8E6E0', '#F4C2C2', '#FFE44D'];
    } catch { return ['#A8E6E0', '#F4C2C2', '#FFE44D']; }
  }

  if (canvasEl) {
    ctx = canvasEl.getContext('2d');
    function resizeCanvas() {
      W = canvasEl.width  = canvasEl.offsetWidth  || 390;
      H = canvasEl.height = canvasEl.offsetHeight || 500;
    }
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    function drawNebula() {
      requestAnimationFrame(drawNebula);
      t += 0.008;
      ctx.clearRect(0, 0, W, H);

      const colors = getUserColors();
      // Intensity driven by voice
      const amp = 1 + currentRms * 8;

      const orbs = [
        { x: 0.5 + Math.sin(t * 0.7) * 0.2 * amp, y: 0.4 + Math.cos(t * 0.5) * 0.15 * amp, r: W * (0.3 + currentRms * 0.4), c: colors[0] },
        { x: 0.4 + Math.cos(t * 0.9) * 0.15 * amp, y: 0.6 + Math.sin(t * 0.6) * 0.2 * amp,  r: W * (0.25 + currentRms * 0.3), c: colors[1] },
        { x: 0.6 + Math.sin(t * 1.1) * 0.12 * amp, y: 0.5 + Math.cos(t * 0.8) * 0.1 * amp,  r: W * (0.2 + currentRms * 0.25), c: colors[2] },
      ];

      ctx.globalCompositeOperation = 'screen';
      orbs.forEach(o => {
        const gx = o.x * W, gy = o.y * H;
        const grad = ctx.createRadialGradient(gx, gy, 0, gx, gy, o.r);
        grad.addColorStop(0, o.c + 'AA');
        grad.addColorStop(0.5, o.c + '33');
        grad.addColorStop(1, o.c + '00');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, W, H);
      });
      ctx.globalCompositeOperation = 'source-over';
    }
    drawNebula();
  }

  // ─── Iniciar micrófono ─────────────────────
  startBtn.addEventListener('click', async () => {
    if (isListening) {
      stopListening();
      return;
    }

    try {
      mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      audioCtx    = new (window.AudioContext || window.webkitAudioContext)();
      analyser    = audioCtx.createAnalyser();
      analyser.fftSize = 512;
      analyser.smoothingTimeConstant = 0.75;

      microphone  = audioCtx.createMediaStreamSource(mediaStream);
      microphone.connect(analyser);
      dataArray   = new Uint8Array(analyser.fftSize);

      isListening = true;
      startBtn.textContent = 'Detener';
      if (labelEl) labelEl.textContent = 'Emití tu om... la nebulosa te escucha';

      detect();
    } catch (err) {
      console.warn('Ritual Om: error micro', err);
      if (labelEl) labelEl.textContent = 'Permitir micrófono en el navegador para continuar';
    }
  });

  function detect() {
    animFrame = requestAnimationFrame(detect);
    analyser.getByteTimeDomainData(dataArray);

    // RMS (volumen)
    let sum = 0;
    for (let i = 0; i < dataArray.length; i++) {
      const v = (dataArray[i] / 128) - 1;
      sum += v * v;
    }
    const rms = Math.sqrt(sum / dataArray.length);
    currentRms = rms;

    const THRESHOLD = 0.03;
    const isActive  = rms > THRESHOLD;

    if (isActive) {
      energyLevel = Math.min(1, energyLevel + 0.015 + rms * 0.1);
    } else {
      energyLevel = Math.max(0, energyLevel - 0.005);
    }

    const pct = energyLevel * 100;
    if (bar) bar.style.width = `${pct}%`;

    if (orb) {
      const scale = 1 + energyLevel * 0.7 + rms * 2;
      orb.style.transform  = `scale(${Math.min(scale, 2)})`;
      orb.style.opacity    = String(0.5 + energyLevel * 0.5);
    }

    if (labelEl && isListening && energyLevel < 0.99) {
      const p = Math.round(energyLevel * 100);
      if (p < 30)       labelEl.textContent = 'Emití tu om... la nebulosa te escucha';
      else if (p < 60)  labelEl.textContent = 'Seguí... sentí cómo crece';
      else if (p < 90)  labelEl.textContent = 'Casi... sostené el sonido';
    }

    if (energyLevel >= 0.99) omCompleted();
  }

  function omCompleted() {
    stopListening();
    energyLevel = 0;
    currentRms  = 0;
    if (bar)     bar.style.width   = '100%';
    if (labelEl) labelEl.textContent = '✦ Energía cargada. Om completo.';
    if (rewardEl) {
      rewardEl.style.display  = 'block';
      rewardEl.style.opacity  = '0';
      rewardEl.style.transition = 'opacity 1.2s ease';
      requestAnimationFrame(() => { rewardEl.style.opacity = '1'; });
    }
    if (orb) {
      orb.style.transform = 'scale(1.8)';
      orb.style.boxShadow = '0 0 80px var(--color-personal-1), 0 0 160px var(--color-personal-2)';
    }
  }

  function stopListening() {
    isListening = false;
    currentRms  = 0;
    cancelAnimationFrame(animFrame);
    if (microphone) microphone.disconnect();
    if (audioCtx)   audioCtx.close();
    if (mediaStream) mediaStream.getTracks().forEach(t => t.stop());
    if (startBtn)   startBtn.textContent = 'Activar micrófono · Ritual Om';
  }
}
