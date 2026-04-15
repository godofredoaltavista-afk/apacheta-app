/* =============================================
   APACHETA — RESPIRACIÓN
   3 modos: 4-7-8 / Box / Coherencia cardíaca
   ============================================= */

const MODOS = {
  '478': {
    label: '4-7-8',
    fases: [
      { texto: 'Inhalar...', duracion: 4000 },
      { texto: 'Sostener...', duracion: 7000 },
      { texto: 'Exhalar...', duracion: 8000 },
    ],
  },
  'box': {
    label: 'Box',
    fases: [
      { texto: 'Inhalar...', duracion: 4000 },
      { texto: 'Sostener...', duracion: 4000 },
      { texto: 'Exhalar...', duracion: 4000 },
      { texto: 'Sostener...', duracion: 4000 },
    ],
  },
  'coherencia': {
    label: 'Coherencia',
    fases: [
      { texto: 'Inhalar...', duracion: 5000 },
      { texto: 'Exhalar...', duracion: 5000 },
    ],
  },
};

let breathInterval = null;
let breathTimeout  = null;
let currentModo    = '478';
let faseIdx        = 0;
let countdown      = 0;
let countdownTimer = null;
let isRunning      = false;

export function initRespiracion() {
  const circle    = document.getElementById('breath-circle');
  const numEl     = document.getElementById('breath-num');
  const guideEl   = document.getElementById('breath-guide');
  const startBtn  = document.getElementById('breath-start');
  const modeBtns  = document.querySelectorAll('[data-breath]');

  if (!circle || !startBtn) return;

  // ─── Selector de modo ─────────────────────
  modeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      modeBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentModo = btn.dataset.breath;
      if (isRunning) {
        stopBreath();
        startBreath();
      }
    });
  });

  // ─── Start / Stop ─────────────────────────
  startBtn.addEventListener('click', () => {
    if (isRunning) {
      stopBreath();
    } else {
      startBreath();
    }
  });

  // ─── Nebulosa de fondo (canvas de respiracion) ─
  const nebulaCanvas = document.getElementById('respiracion-canvas');
  let nebulaIntensity = 0; // 0=normal, 1=lleno

  function pulseNebula(phase) {
    if (!nebulaCanvas) return;
    const isInhalar  = phase.includes('Inhalar');
    const isExhalar  = phase.includes('Exhalar');

    // Dispatch custom event para que main.js / shader lo reciba
    nebulaCanvas.dispatchEvent(new CustomEvent('breath-phase', {
      detail: { phase, intensity: isInhalar ? 1 : isExhalar ? 0 : 0.5 }
    }));

    // CSS approach: expand/contract section background
    const section = document.getElementById('respiracion');
    if (section) {
      if (isInhalar) {
        section.style.transition = 'background-size 4s ease-in-out';
        section.style.backgroundSize = '140% 140%';
      } else if (isExhalar) {
        section.style.transition = `background-size ${phase === 'Exhalar...' ? 8 : 4}s ease-in-out`;
        section.style.backgroundSize = '100% 100%';
      }
    }
  }

  function startBreath() {
    isRunning = true;
    startBtn.textContent = 'Detener';
    faseIdx = 0;
    runFase();
  }

  function stopBreath() {
    isRunning = false;
    startBtn.textContent = 'Iniciar respiración';
    clearTimeout(breathTimeout);
    clearInterval(countdownTimer);
    circle.classList.remove('breathing');
    circle.style.transform = '';
    if (guideEl) guideEl.textContent = 'Inhalar...';
    if (numEl)   numEl.textContent   = '4';
    // Reset nebulosa
    const section = document.getElementById('respiracion');
    if (section) section.style.backgroundSize = '';
  }

  function runFase() {
    if (!isRunning) return;

    const modo  = MODOS[currentModo];
    const fase  = modo.fases[faseIdx % modo.fases.length];
    const secs  = Math.round(fase.duracion / 1000);

    if (guideEl) guideEl.textContent = fase.texto;

    // Animación del círculo
    const isInhalar   = fase.texto.includes('Inhalar');
    const isExhalar   = fase.texto.includes('Exhalar');
    const isSostener  = fase.texto.includes('Sostener');

    const circleScale = isInhalar ? 'scale(1.4)' : isExhalar ? 'scale(0.9)' : 'scale(1.4)';
    circle.style.transition = `transform ${fase.duracion}ms ease-in-out`;
    circle.style.transform  = circleScale;

    // Nebulosa pulsa con la respiración
    pulseNebula(fase.texto);

    // Vibración mobile
    if (navigator.vibrate) {
      if (isInhalar)  navigator.vibrate(80);
      if (isExhalar)  navigator.vibrate([40, 20, 40]);
      if (isSostener) navigator.vibrate(20);
    }

    // Countdown
    countdown = secs;
    if (numEl) numEl.textContent = countdown;

    clearInterval(countdownTimer);
    countdownTimer = setInterval(() => {
      countdown--;
      if (numEl) numEl.textContent = Math.max(0, countdown);
      if (countdown <= 0) clearInterval(countdownTimer);
    }, 1000);

    // Siguiente fase
    breathTimeout = setTimeout(() => {
      faseIdx++;
      runFase();
    }, fase.duracion);
  }
}
