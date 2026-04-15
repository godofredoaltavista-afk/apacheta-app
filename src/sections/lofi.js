/* =============================================
   APACHETA — LOFI / AMBIENT SOUNDS
   Web Audio API: sonidos generativos ambientales
   Pájaros, lluvia, océano, fuego
   ============================================= */

export function initLofi() {
  const section      = document.getElementById('lofi');
  const canvas       = document.getElementById('lofi-canvas');
  const playBtn      = document.getElementById('lofi-play');
  const playingLabel = document.getElementById('lofi-playing-label');
  const timeEl       = document.getElementById('lofi-time-remaining');
  const soundBtns    = section?.querySelectorAll('.lofi-sound-btn');
  const timerBtns    = section?.querySelectorAll('.lofi-timer-btn');
  const birdsEl      = document.getElementById('lofi-birds');

  if (!section) return;

  let audioCtx    = null;
  let playing     = false;
  let currentType = 'birds';
  let durationMin = 5;
  let endTime     = 0;
  let timerRaf;
  let nodes       = [];  // active audio nodes to stop

  // ── Sound type selection ──────────────────────
  soundBtns?.forEach(btn => {
    btn.addEventListener('click', () => {
      soundBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentType = btn.dataset.sound;
      if (playing) {
        stopSound();
        startSound();
      }
    });
  });

  // ── Timer selection ───────────────────────────
  timerBtns?.forEach(btn => {
    btn.addEventListener('click', () => {
      timerBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      durationMin = parseInt(btn.dataset.mins);
    });
  });

  // ── Play / Stop ───────────────────────────────
  playBtn?.addEventListener('click', () => {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();

    if (playing) {
      stopSound();
      playBtn.textContent = '▶ comenzar';
      if (playingLabel) playingLabel.style.display = 'none';
      playing = false;
    } else {
      startSound();
      playing = true;
      playBtn.textContent = '■ detener';
      endTime = Date.now() + durationMin * 60 * 1000;
      if (playingLabel) playingLabel.style.display = 'flex';
      updateTimer();
    }
  });

  function updateTimer() {
    if (!playing) return;
    timerRaf = requestAnimationFrame(updateTimer);
    const remaining = Math.max(0, endTime - Date.now());
    const m = Math.floor(remaining / 60000);
    const s = Math.floor((remaining % 60000) / 1000);
    if (timeEl) timeEl.textContent = `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
    if (remaining <= 0) {
      stopSound();
      playing = false;
      if (playBtn) playBtn.textContent = '▶ comenzar';
      if (playingLabel) playingLabel.style.display = 'none';
    }
  }

  // ── Audio generators ──────────────────────────

  function startSound() {
    if (!audioCtx) return;
    stopSound();
    switch (currentType) {
      case 'birds':  generateBirds();  break;
      case 'rain':   generateRain();   break;
      case 'ocean':  generateOcean();  break;
      case 'fire':   generateFire();   break;
    }
  }

  function stopSound() {
    nodes.forEach(n => {
      try { n.stop?.(); n.disconnect?.(); } catch(e) {}
    });
    nodes = [];
  }

  function addNode(n) { nodes.push(n); return n; }

  // Birds: random short sine tones in pentatonic scale
  function generateBirds() {
    const pentatonic = [523, 587, 659, 784, 880, 1047, 1175, 1319];
    let birdTimeout;

    function chirp() {
      if (!playing) return;
      const osc   = audioCtx.createOscillator();
      const gain  = audioCtx.createGain();
      const freq  = pentatonic[Math.floor(Math.random() * pentatonic.length)];
      const noteDur = 0.08 + Math.random() * 0.12;
      const notes   = 2 + Math.floor(Math.random() * 4);

      osc.type = 'sine';
      osc.connect(gain);
      gain.connect(audioCtx.destination);

      let t = audioCtx.currentTime;
      for (let i = 0; i < notes; i++) {
        const f = freq * (1 + i * 0.05 * (Math.random() > 0.5 ? 1 : -1));
        osc.frequency.setValueAtTime(f, t);
        gain.gain.setValueAtTime(0, t);
        gain.gain.linearRampToValueAtTime(0.08, t + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.001, t + noteDur);
        t += noteDur + 0.02;
      }
      osc.start(audioCtx.currentTime);
      osc.stop(t);
      addNode(osc);

      const nextIn = 400 + Math.random() * 2000;
      birdTimeout = setTimeout(chirp, nextIn);
    }

    chirp();
    nodes.push({ stop: () => clearTimeout(birdTimeout), disconnect: () => {} });
  }

  // Rain: white noise filtered
  function generateRain() {
    const bufSize = audioCtx.sampleRate * 2;
    const buffer  = audioCtx.createBuffer(1, bufSize, audioCtx.sampleRate);
    const data    = buffer.getChannelData(0);
    for (let i = 0; i < bufSize; i++) data[i] = Math.random() * 2 - 1;

    const source = audioCtx.createBufferSource();
    source.buffer = buffer;
    source.loop   = true;

    const filter = audioCtx.createBiquadFilter();
    filter.type      = 'bandpass';
    filter.frequency.value = 1000;
    filter.Q.value         = 0.5;

    const gain = audioCtx.createGain();
    gain.gain.value = 0.3;

    source.connect(filter);
    filter.connect(gain);
    gain.connect(audioCtx.destination);
    source.start();
    addNode(source);
  }

  // Ocean: low-freq wobble noise
  function generateOcean() {
    const bufSize = audioCtx.sampleRate * 4;
    const buffer  = audioCtx.createBuffer(1, bufSize, audioCtx.sampleRate);
    const data    = buffer.getChannelData(0);
    for (let i = 0; i < bufSize; i++) data[i] = Math.random() * 2 - 1;

    const source = audioCtx.createBufferSource();
    source.buffer = buffer;
    source.loop   = true;

    const lp = audioCtx.createBiquadFilter();
    lp.type            = 'lowpass';
    lp.frequency.value = 400;

    // LFO for wave rhythm
    const lfo  = audioCtx.createOscillator();
    const lfoG = audioCtx.createGain();
    lfo.frequency.value = 0.12;
    lfoG.gain.value     = 0.15;
    lfo.connect(lfoG);

    const gain = audioCtx.createGain();
    gain.gain.value = 0.25;
    lfoG.connect(gain.gain);

    source.connect(lp);
    lp.connect(gain);
    gain.connect(audioCtx.destination);
    lfo.start();
    source.start();
    addNode(source);
    addNode(lfo);
  }

  // Fire: crackle with low rumble
  function generateFire() {
    // Low rumble
    const bufSize = audioCtx.sampleRate * 2;
    const buffer  = audioCtx.createBuffer(1, bufSize, audioCtx.sampleRate);
    const data    = buffer.getChannelData(0);
    for (let i = 0; i < bufSize; i++) data[i] = Math.random() * 2 - 1;

    const source = audioCtx.createBufferSource();
    source.buffer = buffer;
    source.loop   = true;

    const lp = audioCtx.createBiquadFilter();
    lp.type            = 'lowpass';
    lp.frequency.value = 200;

    const gain = audioCtx.createGain();
    gain.gain.value = 0.2;

    source.connect(lp);
    lp.connect(gain);
    gain.connect(audioCtx.destination);
    source.start();
    addNode(source);

    // Random crackles
    let crackleTimeout;
    function crackle() {
      if (!playing) return;
      const osc = audioCtx.createOscillator();
      const g   = audioCtx.createGain();
      const dur = 0.02 + Math.random() * 0.04;
      osc.type = 'sawtooth';
      osc.frequency.value = 200 + Math.random() * 800;
      osc.connect(g);
      g.connect(audioCtx.destination);
      g.gain.setValueAtTime(0.04, audioCtx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + dur);
      osc.start(audioCtx.currentTime);
      osc.stop(audioCtx.currentTime + dur);
      addNode(osc);
      crackleTimeout = setTimeout(crackle, 100 + Math.random() * 500);
    }
    crackle();
    nodes.push({ stop: () => clearTimeout(crackleTimeout), disconnect: () => {} });
  }

  // ── Canvas: animated waveform ─────────────────
  let ctx, W, H, t = 0, active = false, canvasRaf;

  if (canvas) {
    ctx = canvas.getContext('2d');
    function resize() {
      W = canvas.width  = canvas.offsetWidth  || 390;
      H = canvas.height = canvas.offsetHeight || 480;
    }
    resize();
    window.addEventListener('resize', () => { if (active) resize(); });

    function drawWave() {
      canvasRaf = requestAnimationFrame(drawWave);
      t += playing ? 0.02 : 0.006;
      ctx.clearRect(0, 0, W, H);

      const amp  = playing ? 1 : 0.3;
      const cols = ['rgba(168,230,224,', 'rgba(212,197,232,', 'rgba(245,216,154,'];

      cols.forEach((c, i) => {
        ctx.beginPath();
        const freq  = 0.008 + i * 0.002;
        const phase = i * Math.PI * 0.6;
        ctx.strokeStyle = `${c}${playing ? 0.5 : 0.2})`;
        ctx.lineWidth   = 1.5;

        for (let x = 0; x < W; x++) {
          const y = H * 0.5
            + Math.sin(x * freq + t + phase) * H * 0.15 * amp
            + Math.sin(x * freq * 2 + t * 1.3 + phase) * H * 0.07 * amp;
          x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        }
        ctx.stroke();
      });
    }

    const observer = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting && !active) { active = true; resize(); drawWave(); }
        else if (!e.isIntersecting && active) { active = false; cancelAnimationFrame(canvasRaf); }
      });
    }, { threshold: 0.1 });
    observer.observe(canvas);
  }

  // ── Bird animation ────────────────────────────
  if (birdsEl) {
    let bt = 0;
    function animateBirds() {
      requestAnimationFrame(animateBirds);
      bt += 0.008;
      const birdEls = birdsEl.querySelectorAll('.lofi-bird');
      birdEls.forEach((b, i) => {
        const fly  = playing ? 12 : 4;
        const yOff = Math.sin(bt * (0.9 + i * 0.15) + i) * fly;
        const xOff = Math.cos(bt * 0.3 + i * 1.2) * (playing ? 8 : 3);
        b.style.transform = `translateY(${yOff}px) translateX(${xOff}px)`;
      });
    }
    animateBirds();
  }
}
