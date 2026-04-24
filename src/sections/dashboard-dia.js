/* =============================================
   APACHETA — DASHBOARD DEL DÍA
   Stats, challenge rotativo, modo por hora
   ============================================= */

import { getUser, saveUser, getModoActual, getModoLabel } from '../main.js';

const CHALLENGES = [
  {
    pregunta: '¿Qué hábito mental te limita más?',
    dato: 'El 95% de tus decisiones vienen de patrones inconscientes formados antes de los 7 años.',
    accion: '→ Escribí ese hábito y nombralo por primera vez.',
  },
  {
    pregunta: '¿Qué aprendiste esta semana que no sabías?',
    dato: 'El cerebro consolida aprendizajes principalmente durante el sueño profundo (fase REM).',
    accion: '→ Escribilo ahora antes de que lo olvides.',
  },
  {
    pregunta: '¿A quién te acordaste sin razón aparente?',
    dato: 'Las personas que aparecen en tu mente sin motivo suelen tener algo que resolver con vos.',
    accion: '→ Mandá un mensaje o escribí sobre esa persona.',
  },
  {
    pregunta: '¿Qué conexión inesperada encontraste esta semana?',
    dato: 'La creatividad es el arte de conectar puntos que nadie más conectó. — Steve Jobs',
    accion: '→ Describí esa conexión en una oración.',
  },
  {
    pregunta: '¿De qué te costó soltarte hoy?',
    dato: 'El apego al resultado destruye el proceso. La soltura es una práctica, no un estado.',
    accion: '→ Nombrá lo que querés soltar y escribí por qué lo sostenés.',
  },
  {
    pregunta: '¿Cuándo fue la última vez que hiciste algo por primera vez?',
    dato: 'La novedad activa dopamina y genera nuevas conexiones neuronales. La rutina las consolida.',
    accion: '→ Planeá algo nuevo para esta semana.',
  },
  {
    pregunta: '¿Qué creencia sobre vos mismo está lista para cambiar?',
    dato: 'La neuroplasticidad confirma que el cerebro cambia físicamente con cada pensamiento repetido.',
    accion: '→ Reescribí esa creencia en positivo y en presente.',
  },
];

export function initDashboard() {
  const user  = getUser();
  const modo  = getModoActual();

  // Challenge del día (rotativo por fecha)
  const today     = new Date();
  const idx       = (today.getDate() + today.getMonth()) % CHALLENGES.length;
  const challenge = CHALLENGES[idx];

  const pregEl   = document.getElementById('dash-challenge-pregunta');
  const datoEl   = document.getElementById('dash-challenge-dato');
  const accionEl = document.getElementById('dash-challenge-accion');

  if (pregEl)   pregEl.textContent   = challenge.pregunta;
  if (datoEl)   datoEl.textContent   = challenge.dato;
  if (accionEl) accionEl.textContent = challenge.accion;

  // Stats expandidos
  const notas      = user.notas || {};
  const totalNotas = Object.keys(notas).length;
  const statEl     = document.getElementById('dash-stat-obras');
  if (statEl) statEl.textContent = String(Math.max(totalNotas, 6)).padStart(2, '0');

  // Notas de hoy
  const todayKey   = today.toISOString().split('T')[0];
  const notasHoy   = Object.values(notas).filter(n => n.fecha && n.fecha.startsWith(todayKey)).length;
  const notasHoyEl = document.getElementById('dash-stat-notas');
  if (notasHoyEl) notasHoyEl.textContent = notasHoy > 0 ? String(notasHoy) : '—';

  // Streak (días seguidos — aproximado por lastVisit)
  const streakEl = document.getElementById('dash-stat-streak');
  if (streakEl && user.streak) streakEl.textContent = String(user.streak);

  // Modo mini
  const modoMiniEl = document.getElementById('dash-modo-mini');
  if (modoMiniEl) modoMiniEl.textContent = getModoLabel(modo);

  // Última nota
  const ultimaNotaEl = document.getElementById('dash-ultima-nota');
  if (ultimaNotaEl) {
    const entries = Object.values(notas);
    if (entries.length > 0) {
      const ultima = entries[entries.length - 1];
      ultimaNotaEl.textContent = ultima.texto
        ? ultima.texto.substring(0, 40) + (ultima.texto.length > 40 ? '…' : '')
        : 'Sin texto';
    }
  }

  // Aura mini-canvas
  initAuraMini(user.colores);

  // Actualizar colores de los orbs del dashboard con colores personales
  updateDashboardOrbs(user.colores);

  // Escuchar cambios de color desde el HUD
  window.addEventListener('apacheta:colorsChanged', e => {
    updateDashboardOrbs(e.detail.colores);
    initAuraMini(e.detail.colores);
  });

  // Actualizar history row cuando se guarda una aura
  window.addEventListener('apacheta:auraSaved', () => {
    initAuraHistory();
  });

  // Aura history row
  initAuraHistory();

  // Arcano del día
  initArcanoDia(user);

  // Mode pills (hallucination / therapy)
  initModePills(user);
}

function initAuraHistory() {
  const row = document.getElementById('dash-aura-history-row');
  if (!row) return;

  // Read aura history from localStorage (set by aura-composer.js via saveUser)
  const user    = getUser();
  const history = user.auraHistory || [];
  const days    = ['D', 'L', 'M', 'X', 'J', 'V', 'S'];
  const today   = new Date();

  row.innerHTML = '';
  for (let i = 6; i >= 0; i--) {
    const d      = new Date(today);
    d.setDate(today.getDate() - i);
    const key    = d.toISOString().split('T')[0];
    const entry  = history.find(h => h.fecha === key);
    const isToday = i === 0;

    const wrap   = document.createElement('div');
    wrap.className = 'dash-aura-day';

    const circle = document.createElement('div');
    circle.className = 'dash-aura-day__circle' + (isToday ? ' today' : '');

    if (entry && entry.colores) {
      const [c1, c2, c3] = entry.colores;
      // Past days: desaturate toward gray
      const alpha = isToday ? '1' : '0.6';
      const filter = isToday ? '' : 'grayscale(70%) brightness(1.1)';
      circle.style.background = `radial-gradient(circle at 40% 40%, ${c1}, ${c2}, ${c3})`;
      circle.style.filter = filter;
      circle.style.opacity = alpha;
    } else {
      circle.style.background = 'rgba(0,0,0,0.04)';
      circle.style.border = '1.5px dashed rgba(0,0,0,0.12)';
    }

    const label = document.createElement('p');
    label.className = 'dash-aura-day__label';
    label.textContent = isToday ? 'hoy' : days[d.getDay()];

    wrap.appendChild(circle);
    wrap.appendChild(label);
    row.appendChild(wrap);
  }
}

const ARCANOS = [
  { glyph: '☽', titulo: 'Luna Creciente', desc: 'Momento de iniciar. La energía se acumula. Plantá intenciones.', num: 'II' },
  { glyph: '☀', titulo: 'El Sol Interior', desc: 'Claridad plena. Lo que buscás está frente a vos. Confiá.', num: 'XIX' },
  { glyph: '⚡', titulo: 'La Torre', desc: 'Ruptura necesaria. Algo viejo cae para que lo nuevo entre.', num: 'XVI' },
  { glyph: '⭐', titulo: 'La Estrella', desc: 'Después de la tormenta, esperanza. Tu intuición es brújula.', num: 'XVII' },
  { glyph: '♾', titulo: 'El Mundo', desc: 'Ciclo completo. Celebrá lo logrado y preparate para el próximo.', num: 'XXI' },
  { glyph: '🜂', titulo: 'El Fuego Sagrado', desc: 'Pasión y creatividad en pico. Actuá mientras el fuego está vivo.', num: 'I' },
  { glyph: '🜄', titulo: 'Aguas Profundas', desc: 'Emociones a flor de piel. Escuchá lo que el cuerpo dice.', num: 'XII' },
  { glyph: '☯', titulo: 'El Equilibrio', desc: 'Ni mucho ni poco. Hoy el centro es la práctica.', num: 'XI' },
  { glyph: '✦', titulo: 'La Noche Interior', desc: 'Introspección profunda. Las respuestas están en el silencio.', num: 'IX' },
  { glyph: '⊕', titulo: 'La Cruz Cósmica', desc: 'Cuatro direcciones, un solo centro. Vos sos el eje.', num: 'X' },
];

function initArcanoDia(user) {
  const card = document.getElementById('dash-arcano-card');
  if (!card) return;

  // Selección basada en fecha + número de nacimiento
  const today   = new Date();
  let seed      = today.getDate() + today.getMonth() * 31;
  if (user.nacimiento) {
    const parts = user.nacimiento.replace(/\D/g, '');
    seed += parts.split('').reduce((a, d) => a + +d, 0);
  }
  if (user.nombre) {
    seed += user.nombre.split('').reduce((a, c) => a + c.charCodeAt(0), 0) % 100;
  }
  const arcano  = ARCANOS[seed % ARCANOS.length];

  const glyphEl  = document.getElementById('dash-arcano-glyph');
  const tituloEl = document.getElementById('dash-arcano-titulo');
  const descEl   = document.getElementById('dash-arcano-desc');
  const numEl    = document.getElementById('dash-arcano-num');

  if (glyphEl)  glyphEl.textContent  = arcano.glyph;
  if (tituloEl) tituloEl.textContent = arcano.titulo;
  if (descEl)   descEl.textContent   = arcano.desc;
  if (numEl)    numEl.textContent    = arcano.num;
}

function initModePills(user) {
  const hallBtn  = document.getElementById('dash-pill-hallucination');
  const therapyBtn = document.getElementById('dash-pill-therapy');

  if (hallBtn) {
    hallBtn.classList.toggle('active', !!user.alucinajeActivo);
    hallBtn.addEventListener('click', () => {
      const u   = getUser();
      const next = !u.alucinajeActivo;
      // Delegate to the existing alucinaje toggle
      const mainToggle = document.getElementById('alucinaje-toggle');
      if (mainToggle) mainToggle.click();
      hallBtn.classList.toggle('active', next);
    });
  }

  if (therapyBtn) {
    therapyBtn.classList.toggle('active', !!user.therapyMode);
    therapyBtn.addEventListener('click', () => {
      const u   = getUser();
      const next = !u.therapyMode;
      saveUser({ therapyMode: next });
      therapyBtn.classList.toggle('active', next);
      document.body.classList.toggle('mode-therapy', next);
    });
  }
}

function initAuraMini(colores) {
  const canvas = document.getElementById('dash-aura-mini');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const W = 44, H = 44;
  canvas.width = W; canvas.height = H;

  let t = 0;
  function draw() {
    ctx.clearRect(0, 0, W, H);
    const [c1, c2, c3] = colores || ['#A8E6E0', '#F4C2C2', '#FFE44D'];

    const g1 = ctx.createRadialGradient(22 + Math.sin(t) * 6, 22 + Math.cos(t * 0.7) * 5, 0, 22, 22, 22);
    g1.addColorStop(0, c1 + 'DD');
    g1.addColorStop(0.5, c2 + '88');
    g1.addColorStop(1, c3 + '22');
    ctx.fillStyle = g1;
    ctx.beginPath();
    ctx.arc(22, 22, 22, 0, Math.PI * 2);
    ctx.fill();
    t += 0.03;
    requestAnimationFrame(draw);
  }
  draw();
}

function updateDashboardOrbs(colores) {
  const orb1 = document.getElementById('dash-orb-1');
  const orb2 = document.getElementById('dash-orb-2');
  const orb3 = document.getElementById('dash-orb-3');
  if (orb1) orb1.style.background = colores[0] || '#A8E6E0';
  if (orb2) orb2.style.background = colores[1] || '#F4C2C2';
  if (orb3) orb3.style.background = colores[2] || '#FFE44D';
}

// ─── Floating window: drag + aura micro-icon ──
export function initFraseWindow() {
  const win  = document.getElementById('frase-window');
  const bar  = document.getElementById('frase-window-bar');
  if (!win || !bar) return;

  // ── Modo label en la barra ─────────────────
  const modoEl = document.getElementById('frase-window-modo');
  const modo   = getModoActual();
  const modoMap = { manana: 'modo mañana', tarde: 'modo tarde', noche: 'modo noche', alucinaje: 'modo alucinaje' };
  if (modoEl) modoEl.textContent = `◎ · ${modoMap[modo] || 'modo mañana'}`;

  // ── Aura micro-icon ────────────────────────
  const iconCanvas = document.getElementById('frase-aura-icon');
  if (iconCanvas) {
    const ctx = iconCanvas.getContext('2d');
    let ta = 0;
    function drawAuraIcon() {
      const user = getUser();
      const cols = user.colores || ['#A8E6E0', '#F4C2C2', '#FFE44D'];
      ctx.clearRect(0, 0, 22, 22);
      const g = ctx.createRadialGradient(11 + Math.sin(ta) * 3, 11 + Math.cos(ta * 0.7) * 2, 0, 11, 11, 11);
      g.addColorStop(0, cols[0] + 'EE');
      g.addColorStop(0.5, cols[1] + '99');
      g.addColorStop(1, cols[2] + '33');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(11, 11, 11, 0, Math.PI * 2);
      ctx.fill();
      ta += 0.025;
      requestAnimationFrame(drawAuraIcon);
    }
    drawAuraIcon();

    // Update when colors change
    window.addEventListener('apacheta:colorsChanged', () => {});
  }

  // ── Drag logic (mobile + desktop) ─────────
  let isDragging = false, startX = 0, startY = 0, origLeft = 0, origTop = 0;

  function onDragStart(e) {
    if (e.target.classList.contains('frase-window__dot')) return;
    isDragging = true;
    const pt = e.touches ? e.touches[0] : e;
    startX = pt.clientX; startY = pt.clientY;
    const rect = win.getBoundingClientRect();
    origLeft = rect.left; origTop = rect.top;
    win.classList.add('is-dragging');
    win.style.position = 'fixed';
    win.style.left     = origLeft + 'px';
    win.style.top      = origTop  + 'px';
    win.style.margin   = '0';
    win.style.width    = rect.width + 'px';
    win.style.zIndex   = '50';
  }
  function onDragMove(e) {
    if (!isDragging) return;
    const pt = e.touches ? e.touches[0] : e;
    const dx = pt.clientX - startX;
    const dy = pt.clientY - startY;
    win.style.left = (origLeft + dx) + 'px';
    win.style.top  = (origTop  + dy) + 'px';
  }
  function onDragEnd() {
    if (!isDragging) return;
    isDragging = false;
    win.classList.remove('is-dragging');
  }

  bar.addEventListener('mousedown',  onDragStart);
  bar.addEventListener('touchstart', onDragStart, { passive: true });
  document.addEventListener('mousemove', onDragMove);
  document.addEventListener('touchmove', e => { if (isDragging) { e.preventDefault(); onDragMove(e); } }, { passive: false });
  document.addEventListener('mouseup',   onDragEnd);
  document.addEventListener('touchend',  onDragEnd);

  // Close dot: hide window
  const closeDot = win.querySelector('.frase-window__dot--close');
  if (closeDot) {
    closeDot.addEventListener('click', () => {
      win.style.opacity = '0';
      win.style.pointerEvents = 'none';
      setTimeout(() => { win.style.display = 'none'; }, 220);
    });
  }
}
