/* =============================================
   APACHETA — ALARMA CLOCK
   Reloj digital + puzzle mandala para desactivar
   ============================================= */

export function initAlarmaClock() {
  const section    = document.getElementById('alarma');
  const timeEl     = document.getElementById('alarma-time');
  const hUpBtn     = document.getElementById('alarma-h-up');
  const hDownBtn   = document.getElementById('alarma-h-down');
  const mUpBtn     = document.getElementById('alarma-m-up');
  const mDownBtn   = document.getElementById('alarma-m-down');
  const hValEl     = document.getElementById('alarma-h-val');
  const mValEl     = document.getElementById('alarma-m-val');
  const setBtn     = document.getElementById('alarma-set');
  const statusEl   = document.getElementById('alarma-status');
  const puzzleWrap = document.getElementById('alarma-puzzle');
  const puzzleGrid = document.getElementById('alarma-puzzle-grid');

  if (!section) return;

  // ── Current clock ──────────────────────────────
  function updateClock() {
    const now = new Date();
    const h   = String(now.getHours()).padStart(2, '0');
    const m   = String(now.getMinutes()).padStart(2, '0');
    if (timeEl) timeEl.textContent = `${h}:${m}`;
  }
  updateClock();
  setInterval(updateClock, 1000);

  // ── Alarm setter ──────────────────────────────
  let alarmH = 7, alarmM = 0;
  let alarmActive = false;
  let alarmCheck;
  let audioCtx = null;
  let alarmNodes = [];

  function pad(n) { return String(n).padStart(2, '0'); }

  function updateSetterDisplay() {
    if (hValEl) hValEl.textContent = pad(alarmH);
    if (mValEl) mValEl.textContent = pad(alarmM);
  }
  updateSetterDisplay();

  hUpBtn?.addEventListener('click',   () => { alarmH = (alarmH + 1) % 24; updateSetterDisplay(); });
  hDownBtn?.addEventListener('click', () => { alarmH = (alarmH + 23) % 24; updateSetterDisplay(); });
  mUpBtn?.addEventListener('click',   () => { alarmM = (alarmM + 5) % 60; updateSetterDisplay(); });
  mDownBtn?.addEventListener('click', () => { alarmM = (alarmM - 5 + 60) % 60; updateSetterDisplay(); });

  setBtn?.addEventListener('click', () => {
    if (alarmActive) return;
    alarmActive = true;
    if (setBtn)   setBtn.textContent = `Alarma: ${pad(alarmH)}:${pad(alarmM)} ✦`;
    if (statusEl) { statusEl.style.display = 'block'; }
    if (navigator.vibrate) navigator.vibrate([30, 20, 30]);

    alarmCheck = setInterval(() => {
      const now = new Date();
      if (now.getHours() === alarmH && now.getMinutes() === alarmM && now.getSeconds() < 5) {
        triggerAlarm();
      }
    }, 3000);
  });

  // ── Alarm ring ────────────────────────────────
  function triggerAlarm() {
    clearInterval(alarmCheck);
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();

    playAlarmSound();
    if (navigator.vibrate) navigator.vibrate([200, 100, 200, 100, 200]);

    if (puzzleWrap) puzzleWrap.style.display = 'block';
    buildPuzzle();
    if (statusEl) statusEl.textContent = 'Resolvé el puzzle para detener la alarma';
  }

  function playAlarmSound() {
    if (!audioCtx) return;
    const freqs = [528, 639, 741];

    function ring() {
      freqs.forEach((f, i) => {
        const osc  = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.value = f;
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        gain.gain.setValueAtTime(0.15, audioCtx.currentTime + i * 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 1.5);
        osc.start(audioCtx.currentTime + i * 0.05);
        osc.stop(audioCtx.currentTime + 1.5);
        alarmNodes.push(osc);
      });
    }

    ring();
    const ringInterval = setInterval(() => {
      if (!alarmActive) { clearInterval(ringInterval); return; }
      ring();
      if (navigator.vibrate) navigator.vibrate([150, 80]);
    }, 2500);
    alarmNodes.push({ stop: () => clearInterval(ringInterval) });
  }

  function stopAlarmSound() {
    alarmNodes.forEach(n => { try { n.stop?.(); } catch(e) {} });
    alarmNodes = [];
  }

  // ── Mandala Puzzle (3×3 sliding) ─────────────
  const TILES = 9;
  let puzzleState = [];  // 0..7 = piece, 8 = empty slot
  let solved = false;

  function buildPuzzle() {
    if (!puzzleGrid) return;
    puzzleGrid.innerHTML = '';
    solved = false;

    // Shuffled state [0..7, null]
    puzzleState = shuffle([0, 1, 2, 3, 4, 5, 6, 7, null]);

    renderPuzzle();
  }

  function shuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  // Mandala segment paths (simplified — 3×3 sections of a circular mandala)
  const MANDALA_COLORS = [
    '#FF4444','#FF8C00','#FFE44D','#B8D4B0',
    '#A8E6E0','#6495ED','#D4C5E8','#F4C2C2',
  ];

  function renderPuzzle() {
    if (!puzzleGrid) return;
    puzzleGrid.innerHTML = '';

    puzzleState.forEach((piece, pos) => {
      const tile = document.createElement('div');
      tile.className = 'alarma-puzzle-tile';

      if (piece === null) {
        tile.classList.add('alarma-puzzle-tile--empty');
      } else {
        // Draw mini mandala segment on canvas
        const c = document.createElement('canvas');
        c.width = c.height = 80;
        drawMandalaSegment(c.getContext('2d'), piece);
        tile.appendChild(c);
        tile.addEventListener('click', () => moveTile(pos));
      }

      puzzleGrid.appendChild(tile);
    });
  }

  function drawMandalaSegment(ctx, piece) {
    const W = 80, H = 80;
    ctx.clearRect(0, 0, W, H);
    const col = MANDALA_COLORS[piece];
    const cx = W / 2, cy = H / 2;

    // Background
    ctx.fillStyle = 'rgba(20,20,30,0.6)';
    ctx.fillRect(0, 0, W, H);

    // Arc segment (each piece is 1/8 of full circle)
    const sa = (piece / 8) * Math.PI * 2;
    const ea = ((piece + 1) / 8) * Math.PI * 2;

    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, 36, sa, ea);
    ctx.closePath();
    ctx.fillStyle = col + '88';
    ctx.fill();
    ctx.strokeStyle = col;
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Inner ring detail
    ctx.beginPath();
    ctx.arc(cx, cy, 18, sa, ea);
    ctx.strokeStyle = col + 'AA';
    ctx.lineWidth = 1;
    ctx.stroke();
  }

  function moveTile(pos) {
    if (solved) return;
    const emptyPos = puzzleState.indexOf(null);
    const row = Math.floor(pos / 3);
    const col = pos % 3;
    const eRow = Math.floor(emptyPos / 3);
    const eCol = emptyPos % 3;

    // Only adjacent tiles can move
    const adjacent = (Math.abs(row - eRow) + Math.abs(col - eCol)) === 1;
    if (!adjacent) return;

    [puzzleState[pos], puzzleState[emptyPos]] = [puzzleState[emptyPos], puzzleState[pos]];
    renderPuzzle();

    if (navigator.vibrate) navigator.vibrate(15);

    if (isSolved()) {
      solved = true;
      deactivateAlarm();
    }
  }

  function isSolved() {
    for (let i = 0; i < 8; i++) {
      if (puzzleState[i] !== i) return false;
    }
    return puzzleState[8] === null;
  }

  function deactivateAlarm() {
    stopAlarmSound();
    alarmActive = false;
    if (statusEl) statusEl.textContent = '✦ Alarma desactivada. Buenos días.';
    if (setBtn)   setBtn.textContent   = 'Activar alarma ✦';
    if (puzzleWrap) {
      setTimeout(() => {
        if (puzzleWrap) puzzleWrap.style.display = 'none';
      }, 2000);
    }
    if (navigator.vibrate) navigator.vibrate([50, 30, 50, 30, 100]);
  }
}
