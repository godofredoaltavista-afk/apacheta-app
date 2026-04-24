/* =============================================
   APACHETA — MAIN.JS
   Boot sequence · Three.js · Secciones · Estado
   ============================================= */

import * as THREE from 'three';

// ─── Secciones existentes ─────────────────────
import { initOnboarding }       from './sections/onboarding.js';
import { initDashboard, initFraseWindow } from './sections/dashboard-dia.js';
import { initBiblioteca }       from './sections/biblioteca.js';
import { initRespiracion }      from './sections/respiracion.js';
import { initChakras }          from './sections/chakras.js';
import { initScratchReveal }    from './sections/scratch-reveal.js';
import { initAjetreoSur }       from './sections/ajetreo-sur.js';
import { initVisualisingWisdom} from './sections/visualising-wisdom.js';
import { initModoAlucinaje }    from './sections/modos-dia.js';
import { initCalendar }         from './sections/calendar-preview.js';
import { initConexiones }       from './sections/conexiones-culturales.js';
import { initAnotacion }        from './sections/anotacion-rapida.js';

// ─── Nuevas secciones ─────────────────────────
import { initMente }                from './sections/mente.js';
import { initSoplar }               from './sections/soplar.js';
import { initAuraComposer }         from './sections/aura-composer.js';
import { initMandala }              from './sections/mandala.js';
import { initGlbMate }              from './sections/glb-mate.js';
import { initManifiestosParticles } from './sections/manifiestos-particles.js';
import { initLissajous }            from './sections/lissajous.js';
import { initFibonacci }            from './sections/fibonacci.js';
import { initMorningJourney }       from './sections/morning-journey.js';
import { initMeditacionOjo }        from './sections/meditacion-ojo.js';
import { initAuraHistory }          from './sections/aura-history.js';
import { initLofi }                 from './sections/lofi.js';
import { initAlarmaClock }          from './sections/alarma-clock.js';
import { initGyroscope, initNameBubble, initScrollInvites } from './sections/gyroscope.js';
import { initColorHud } from './sections/color-hud.js';
import { initTelemetryHud } from './sections/telemetry-hud.js';
import { springTo } from './core/spring.js';

// ─── HUD system merge ─────────────────────────
import { initNavDrawer }    from './core/nav-drawer.js';
import { initSectionTint }  from './core/section-tint.js';
import { initTrailSpawn }   from './core/trail-spawn.js';
import { hydrateIcons }     from './core/icons.js';
import { initTweaksPanel }  from './core/tweaks-panel.js';
import { feedbackBus }      from './core/feedback-bus.js';
import { initFeedbackBusPanel } from './components/feedback-bus-panel.js';
import { initCopyOracle }       from './core/copy-oracle.js';
import { initOracleButtons }    from './components/oracle-modal.js';
import { initManifiestoGestor }  from './sections/manifiesto-gestor.js';
import { initVentana2Historial }  from './sections/ventana2-historial.js';
import { initPresetsFromURL, initPresetsUI } from './core/config-presets.js';
import { initMandalaArchive }     from './sections/mandala-archive.js';

// ─── Estado global del usuario ────────────────
export const USER_KEY = 'apacheta_user';

export const USER_DEFAULT = {
  nombre:              '',
  signo:               '',
  nacimiento:          '',
  colores:             ['#A8E6E0', '#F4C2C2', '#FFE44D'],
  modoActual:          'manana',
  alucinajeActivo:     false,
  onboardingCompleto:  false,
  ultimasAnotaciones:  [],
  notas:               {},
};

export function getUser() {
  try {
    return { ...USER_DEFAULT, ...JSON.parse(localStorage.getItem(USER_KEY) || '{}') };
  } catch { return { ...USER_DEFAULT }; }
}

export function saveUser(data) {
  const current = getUser();
  const updated  = { ...current, ...data };
  localStorage.setItem(USER_KEY, JSON.stringify(updated));
  applyUserColors(updated.colores);
  return updated;
}

export function applyUserColors(colores) {
  const r = document.documentElement;
  r.style.setProperty('--color-personal-1', colores[0] || '#A8E6E0');
  r.style.setProperty('--color-personal-2', colores[1] || '#F4C2C2');
  r.style.setProperty('--color-personal-3', colores[2] || '#FFE44D');
}

// ─── Modo del día por hora ────────────────────
export function getModoActual() {
  const h = new Date().getHours();
  if (h >= 6 && h < 12)  return 'manana';
  if (h >= 12 && h < 20) return 'tarde';
  return 'noche';
}

export function getModoLabel(modo) {
  return {
    manana:    '🌅 Mañana',
    tarde:     '🌿 Tarde',
    noche:     '🌙 Noche',
    alucinaje: '🌀 Alucinaje',
  }[modo] || '🌅 Mañana';
}

export function getModoGreeting(modo, nombre) {
  const n = nombre || 'viajero';
  return {
    manana:    `Buenos días,\n${n}`,
    tarde:     `Buenas tardes,\n${n}`,
    noche:     `Buenas noches,\n${n}`,
    alucinaje: `¿Quién sos hoy,\n${n}?`,
  }[modo];
}

// ─── IntersectionObserver para reveals ────────
function initReveal() {
  const items = document.querySelectorAll('.reveal-item');
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        obs.unobserve(e.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  items.forEach(el => obs.observe(el));
}

// ─── Reloj en tiempo real ─────────────────────
function initClock() {
  function tick() {
    const now  = new Date();
    const h    = String(now.getHours()).padStart(2, '0');
    const m    = String(now.getMinutes()).padStart(2, '0');
    const el   = document.getElementById('hm-time');
    if (el) el.textContent = `${h}:${m}`;
  }
  tick();
  setInterval(tick, 1000);
}

// ─── Fecha en el hero morning ─────────────────
function initDateDisplay() {
  const now  = new Date();
  const days = ['Domingo','Lunes','Martes','Miércoles','Jueves','Viernes','Sábado'];
  const months = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];

  const dayNameEl = document.getElementById('hm-dayname');
  const dateEl    = document.getElementById('hm-date');
  if (dayNameEl) dayNameEl.textContent = days[now.getDay()];
  if (dateEl)    dateEl.textContent    = `${months[now.getMonth()]} ${now.getDate()}`;
}

// ─── Tab bar smooth scroll + collapse ─────────
function initNavigation() {
  // Morning nav links
  document.querySelectorAll('[data-section]').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const target = document.getElementById(link.dataset.section);
      if (target) target.scrollIntoView({ behavior: 'smooth' });

      document.querySelectorAll('[data-section]').forEach(l => l.classList.remove('active'));
      link.classList.add('active');
    });
  });

  // Smooth anchors
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const id = a.getAttribute('href').slice(1);
      const el = document.getElementById(id);
      if (el) { e.preventDefault(); el.scrollIntoView({ behavior: 'smooth' }); }
    });
  });

  // Home button → scroll to top / dashboard
  const homeBtn = document.getElementById('nav-home-btn');
  if (homeBtn) {
    homeBtn.addEventListener('click', () => {
      const dash = document.getElementById('dashboard');
      if (dash) dash.scrollIntoView({ behavior: 'smooth' });
      else window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // Collapse/expand nav — spring physics
  const nav         = document.getElementById('morning-nav');
  const collapseBtn = document.getElementById('nav-collapse-btn');
  let navCollapsed  = false;
  let colSpring     = null;

  // Entrance: nav slides up from below with spring overshoot
  if (nav) {
    nav.style.transform = 'translateX(-50%) translateY(120%)';
    nav.style.transition = 'none';
    setTimeout(() => {
      springTo({
        from: 120, to: 0, stiffness: 0.10, damping: 0.72,
        onUpdate: v => { nav.style.transform = `translateX(-50%) translateY(${v}%)`; },
      });
    }, 400);
  }

  if (collapseBtn && nav) {
    collapseBtn.addEventListener('click', () => {
      navCollapsed = !navCollapsed;
      nav.classList.toggle('collapsed', navCollapsed);
      collapseBtn.textContent = navCollapsed ? '›' : '‹';

      // Spring animate the collapse button rotation
      const startAngle = navCollapsed ? 0 : 180;
      const endAngle   = navCollapsed ? 180 : 0;
      if (colSpring) colSpring.cancel();
      colSpring = springTo({
        from: startAngle, to: endAngle, stiffness: 0.14, damping: 0.78,
        onUpdate: deg => { collapseBtn.style.transform = `rotate(${deg}deg)`; },
      });
    });
  }
}

// ─── Hero greeting dinámico ───────────────────
function updateHeroGreeting() {
  const user = getUser();
  const modo = user.alucinajeActivo ? 'alucinaje' : getModoActual();
  const el   = document.getElementById('hm-greeting');
  if (!el) return;

  const greetings = {
    manana:    ['Buen\nDía', 'Buen\nDía'],
    tarde:     ['Buenas\nTardes', 'Hola\nde nuevo'],
    noche:     ['Buenas\nNoches', 'A\nDescansar'],
    alucinaje: ['¿Y si\ntodo?', 'Adentro\nstá'],
  };
  const opts = greetings[modo] || greetings.manana;
  el.innerHTML = opts[0].replace('\n', '<br/>');
}

// ─── Frase del día en hero ────────────────────
const FRASES_HERO = [
  { texto: 'La sabiduría es saber que soy nada, el amor es saber que soy todo.', autor: 'Nisargadatta' },
  { texto: 'El universo no está hecho de historias, sino de momentos de luz.', autor: 'Muriel Rukeyser' },
  { texto: 'Hacé del presente tu amigo, no tu enemigo.', autor: 'Eckhart Tolle' },
  { texto: 'Lo que no te mata te da material para escribir.', autor: 'Friedrich Nietzsche' },
  { texto: 'La restricción crea libertad.', autor: 'Miles Davis' },
  { texto: 'Muy poco es necesario para una vida feliz; todo está dentro de vos.', autor: 'Marco Aurelio' },
  { texto: 'El silencio no es vacío. Es la base de toda sabiduría.', autor: 'Nisargadatta' },
];

function initFraseDia() {
  const today = new Date();
  const idx   = (today.getDate() + today.getMonth()) % FRASES_HERO.length;
  const frase = FRASES_HERO[idx];

  const fraseEl = document.getElementById('hm-frase');
  const dashFraseEl = document.getElementById('dash-frase');
  const dashAutorEl = document.getElementById('dash-autor');

  if (fraseEl) fraseEl.textContent = frase.texto;
  if (dashFraseEl) dashFraseEl.textContent = `"${frase.texto}"`;
  if (dashAutorEl) dashAutorEl.textContent = `— ${frase.autor}`;
}

// ─── Dashboard: nombre del usuario ────────────
function updateDashboardUser() {
  const user  = getUser();
  const modo  = user.alucinajeActivo ? 'alucinaje' : getModoActual();
  const label = getModoLabel(modo);

  const nombreEl = document.getElementById('dash-nombre');
  const badgeEl  = document.getElementById('dash-badge');
  const modeEl   = document.getElementById('dash-modo-label');

  if (nombreEl) nombreEl.textContent = user.nombre || 'viajero';
  if (badgeEl)  {
    badgeEl.textContent = label;
    badgeEl.className   = `dashboard__mode-badge badge--${modo === 'manana' ? 'morning' : modo}`;
  }
  if (modeEl) {
    const modeLabels = { manana:'MODO MAÑANA', tarde:'MODO TARDE', noche:'MODO NOCHE', alucinaje:'MODO ALUCINAJE' };
    modeEl.textContent = modeLabels[modo] || 'MODO MAÑANA';
  }
}

// ─── THREE.JS: Canvas nebulosa global ─────────
//   Activo solo en la sección de respiración
//   (se activa/desactiva vía IntersectionObserver)
let renderer3D, scene3D, camera3D, uniforms3D, mesh3D, animFrame;
let nebulosActive = false;

const vertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragmentShader = `
  uniform float uTime;
  uniform vec2  uResolution;
  uniform vec3  uColor1;
  uniform vec3  uColor2;
  uniform vec3  uColor3;
  uniform vec2  uMouse;
  varying vec2  vUv;

  // Organic noise via sine waves (mobile-safe, no heavy noise)
  float softNoise(vec2 p, float t) {
    float n = 0.0;
    n += sin(p.x * 2.1 + t * 0.4) * 0.5 + 0.5;
    n += sin(p.y * 1.8 + t * 0.3) * 0.5 + 0.5;
    n += sin((p.x + p.y) * 1.5 + t * 0.5) * 0.5 + 0.5;
    n += sin(p.x * p.y * 0.8 + t * 0.2) * 0.5 + 0.5;
    return n / 4.0;
  }

  void main() {
    vec2 uv = vUv;

    // Mouse influence (subtle)
    vec2 mouse = uMouse * 0.3;
    vec2 uvM = uv + mouse * 0.04;

    float t = uTime * 0.25;
    float n1 = softNoise(uvM * 2.0, t);
    float n2 = softNoise(uvM * 1.5 + vec2(1.3, 0.7), t + 1.0);
    float n3 = softNoise(uvM * 3.0 + vec2(0.5, 2.1), t + 2.0);

    // Blend tres colores pastel
    vec3 col = mix(uColor1, uColor2, n1);
    col = mix(col, uColor3, n2 * 0.5);

    // Suavizar edges
    float vignette = 1.0 - smoothstep(0.3, 1.0, length(uv - 0.5) * 1.5);
    col = mix(vec3(1.0), col, vignette * 0.8 + 0.1);

    // Alpha: más transparente en los bordes
    float alpha = vignette * 0.85 + 0.1;

    gl_FragColor = vec4(col, alpha);
  }
`;

function initNebulaShader(canvas) {
  if (!canvas) return;

  renderer3D = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: false });
  renderer3D.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer3D.setSize(canvas.offsetWidth || 430, canvas.offsetHeight || 844);

  scene3D  = new THREE.Scene();
  camera3D = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

  uniforms3D = {
    uTime:       { value: 0 },
    uResolution: { value: new THREE.Vector2(430, 844) },
    uColor1:     { value: new THREE.Color('#A8E6E0') },
    uColor2:     { value: new THREE.Color('#F4C2C2') },
    uColor3:     { value: new THREE.Color('#D4C5E8') },
    uMouse:      { value: new THREE.Vector2(0, 0) },
  };

  const material = new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader,
    uniforms: uniforms3D,
    transparent: true,
    depthWrite: false,
  });

  mesh3D = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material);
  scene3D.add(mesh3D);

  // Mouse tracking
  window.addEventListener('mousemove', (e) => {
    if (!uniforms3D) return;
    uniforms3D.uMouse.value.set(
      (e.clientX / window.innerWidth)  * 2 - 1,
      -(e.clientY / window.innerHeight) * 2 + 1
    );
  });

  // Touch tracking
  window.addEventListener('touchmove', (e) => {
    if (!uniforms3D || !e.touches[0]) return;
    const t = e.touches[0];
    uniforms3D.uMouse.value.set(
      (t.clientX / window.innerWidth)  * 2 - 1,
      -(t.clientY / window.innerHeight) * 2 + 1
    );
  }, { passive: true });

  // Resize
  window.addEventListener('resize', () => {
    if (!renderer3D) return;
    const w = canvas.offsetWidth || window.innerWidth;
    const h = canvas.offsetHeight || window.innerHeight;
    renderer3D.setSize(w, h);
    if (uniforms3D) uniforms3D.uResolution.value.set(w, h);
  });
}

function startNebulaRender() {
  if (nebulosActive) return;
  nebulosActive = true;
  const clock = new THREE.Clock();

  function animate() {
    if (!nebulosActive) return;
    animFrame = requestAnimationFrame(animate);
    if (uniforms3D) uniforms3D.uTime.value = clock.getElapsedTime();
    if (renderer3D && scene3D && camera3D) renderer3D.render(scene3D, camera3D);
  }
  animate();
}

function stopNebulaRender() {
  nebulosActive = false;
  if (animFrame) cancelAnimationFrame(animFrame);
}

function updateNebulaColors(colores) {
  if (!uniforms3D) return;
  uniforms3D.uColor1.value.set(colores[0] || '#A8E6E0');
  uniforms3D.uColor2.value.set(colores[1] || '#F4C2C2');
  uniforms3D.uColor3.value.set(colores[2] || '#D4C5E8');
}

// ─── IntersectionObserver para nebulosa ───────
function initNebulaVisibility() {
  const secRespiracion = document.getElementById('respiracion');
  const secAlucinaje   = document.getElementById('modo-alucinaje');
  if (!secRespiracion) return;

  const obs = new IntersectionObserver((entries) => {
    const anyVisible = entries.some(e => e.isIntersecting);
    if (anyVisible) {
      startNebulaRender();
    } else {
      const respVis = secRespiracion.getBoundingClientRect();
      const alucVis = secAlucinaje ? secAlucinaje.getBoundingClientRect() : { top: -1 };
      if (respVis.top > window.innerHeight && alucVis.top > window.innerHeight) {
        stopNebulaRender();
      }
    }
  }, { threshold: 0.05 });

  obs.observe(secRespiracion);
  if (secAlucinaje) obs.observe(secAlucinaje);
}

// ─── Alucinaje toggle ─────────────────────────
function initAlucinajeToggle() {
  const btn = document.getElementById('alucinaje-toggle');
  if (!btn) return;

  btn.addEventListener('click', () => {
    const user = getUser();
    const next = !user.alucinajeActivo;
    saveUser({ alucinajeActivo: next });

    btn.textContent = next ? 'ON' : 'OFF';
    document.body.classList.toggle('modo-alucinaje', next);
    updateDashboardUser();

    if (next) {
      // Iniciar nebulosa en alucinaje
      const canvas = document.getElementById('alucinaje-canvas');
      if (canvas && !renderer3D) initNebulaShader(canvas);
      startNebulaRender();
    }
  });

  // Estado inicial
  const user = getUser();
  if (user.alucinajeActivo) {
    btn.textContent = 'ON';
    document.body.classList.add('modo-alucinaje');
  }
}

// ─── Wisdom canvas (blur de colores) ──────────
function initWisdomCanvas() {
  const canvas = document.getElementById('wisdom-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  const W = canvas.offsetWidth || 380;
  const H = canvas.offsetHeight || 320;
  canvas.width  = W;
  canvas.height = H;

  const colors = [
    { x: 0.2, y: 0.3, r: 140, color: '#F4C2C2' },
    { x: 0.6, y: 0.2, r: 120, color: '#FFE44D' },
    { x: 0.5, y: 0.6, r: 160, color: '#D4906A' },
    { x: 0.8, y: 0.7, r: 100, color: '#F5D89A' },
    { x: 0.1, y: 0.7, r: 120, color: '#F4C2C2' },
  ];

  let t = 0;
  function draw() {
    requestAnimationFrame(draw);
    t += 0.008;
    ctx.clearRect(0, 0, W, H);

    colors.forEach((c, i) => {
      const x = (c.x + Math.sin(t + i * 1.3) * 0.1) * W;
      const y = (c.y + Math.cos(t + i * 0.9) * 0.1) * H;
      const grad = ctx.createRadialGradient(x, y, 0, x, y, c.r);
      grad.addColorStop(0, c.color + 'CC');
      grad.addColorStop(1, c.color + '00');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(x, y, c.r, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  draw();
}

// ─── Onboarding: mostrar/ocultar ──────────────
function checkOnboarding() {
  const user    = getUser();
  const section = document.getElementById('onboarding');

  if (!section) return;

  if (user.onboardingCompleto) {
    // Onboarding ya completado: ocultarlo y mostrar la app normal
    section.style.display = 'none';
    applyUserColors(user.colores);
    updateNebulaColors(user.colores);
  } else {
    // Primera visita: mostrar onboarding, ocultar TODAS las secciones debajo
    section.style.display = 'flex';

    // Ocultar el resto del app hasta que el usuario complete el setup
    const sectionsToHide = [
      'hero-morning', 'dashboard', 'modo-alucinaje', 'biblioteca',
      'scratch-reveal', 'respiracion', 'chakras', 'manifiestos',
      'calendar-section', 'conexiones', 'visualising-wisdom', 'ajetreo-sur',
      'mente', 'soplar', 'aura-composer', 'mandala', 'glb-mate',
    ];
    sectionsToHide.forEach(id => {
      const el = document.getElementById(id);
      if (el) {
        el.style.display  = 'none';
        el.style.opacity  = '0';
        el.style.pointerEvents = 'none';
      }
    });

    // Ocultar tab-bar y FAB también
    const tabBar = document.querySelector('.tab-bar');
    const fab    = document.getElementById('fab-anotacion');
    if (tabBar) tabBar.style.display = 'none';
    if (fab)    fab.style.display    = 'none';
  }
}

// Llamada pública para que onboarding.js pueda revelar la app
export function revealApp() {
  const user = getUser();

  // Mostrar secciones
  const sectionsToShow = [
    'hero-morning', 'dashboard', 'modo-alucinaje', 'biblioteca',
    'scratch-reveal', 'respiracion', 'chakras', 'manifiestos',
    'calendar-section', 'conexiones', 'visualising-wisdom', 'ajetreo-sur',
    'mente', 'soplar', 'aura-composer', 'mandala', 'glb-mate',
  ];
  sectionsToShow.forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.style.display       = '';
      el.style.pointerEvents = '';
      // Fade in suave
      requestAnimationFrame(() => {
        el.style.transition = 'opacity 0.8s ease';
        el.style.opacity    = '1';
      });
    }
  });

  // Mostrar tab-bar y FAB
  const tabBar = document.querySelector('.tab-bar');
  const fab    = document.getElementById('fab-anotacion');
  if (tabBar) tabBar.style.display = '';
  if (fab)    fab.style.display    = '';

  // Aplicar colores del usuario
  applyUserColors(user.colores);
  updateNebulaColors(user.colores);
}

// ─── Boot ─────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  const user = getUser();
  applyUserColors(user.colores);

  // 1. Reveal animations
  initReveal();

  // 2. Reloj + fecha
  initClock();
  initDateDisplay();

  // 3. Frase del día
  initFraseDia();

  // 4. Dashboard user
  updateDashboardUser();

  // 5. Hero greeting
  updateHeroGreeting();

  // 6. Navigation
  initNavigation();

  // 7. Onboarding check
  checkOnboarding();

  // 8. Three.js nebulosa (en canvas de respiración)
  const respCanvas = document.getElementById('respiracion-canvas');
  if (respCanvas) {
    initNebulaShader(respCanvas);
    initNebulaVisibility();
  }

  // 9. Wisdom canvas
  initWisdomCanvas();

  // 10. Alucinaje toggle
  initAlucinajeToggle();

  // 11. Secciones existentes
  initOnboarding();
  initDashboard();
  initFraseWindow();
  initBiblioteca();
  initRespiracion();
  initChakras();
  initScratchReveal();
  initAjetreoSur();
  initVisualisingWisdom();
  initModoAlucinaje();
  initCalendar();
  initConexiones();
  initAnotacion();

  // 12. Nuevas secciones
  initMente();
  initSoplar();
  initAuraComposer();
  initMandala();
  initGlbMate();
  initManifiestosParticles();
  initLissajous();
  initFibonacci();
  initMorningJourney();
  initMeditacionOjo();
  initAuraHistory();
  initLofi();
  initAlarmaClock();

  // 13. Globales
  initGyroscope();
  initNameBubble();
  initScrollInvites();

  // 14. Color HUD flotante
  initColorHud();

  // 15. Telemetry HUD
  initTelemetryHud();

  // 16. HUD system merge (drawer · tint · trail · icons)
  try { initSectionTint(); } catch (e) { console.warn('[section-tint]', e); }
  try { initNavDrawer();   } catch (e) { console.warn('[nav-drawer]', e); }
  try { initTrailSpawn();  } catch (e) { console.warn('[trail-spawn]', e); }
  try { hydrateIcons();    } catch (e) { console.warn('[icons]', e); }
  try { initTweaksPanel(); } catch (e) { console.warn('[tweaks-panel]', e); }
  try { initFeedbackBusPanel(); } catch (e) { console.warn('[feedback-bus-panel]', e); }
  try { initCopyOracle();       } catch (e) { console.warn('[copy-oracle]', e); }
  try { initOracleButtons();    } catch (e) { console.warn('[oracle-buttons]', e); }
  try { initManifiestoGestor();  } catch (e) { console.warn('[manifiesto-gestor]', e); }
  try { initVentana2Historial();  } catch (e) { console.warn('[ventana2-historial]', e); }
  try { initPresetsFromURL();     } catch (e) { console.warn('[presets-url]', e); }
  try { initPresetsUI();          } catch (e) { console.warn('[presets-ui]', e); }
  try { initMandalaArchive();     } catch (e) { console.warn('[mandala-archive]', e); }

  console.log('%cApacheta ready · HUD system merged · Feedback Bus + Oracle online', 'font-family:serif;font-size:14px;color:#A8E6E0;');
});

// getModoActual y getModoLabel ya están exportadas arriba con `export function`
export { updateNebulaColors };
