/* =============================================
   APACHETA — GLB MATE VIEWER
   Three.js + GLTFLoader: mate.yerba.glb
   Swipe derecha → modo experimental
   ============================================= */

import * as THREE from 'three';

let renderer, scene, camera, model, animId;
let touchStartX = 0;

export function initGlbMate() {
  const section  = document.getElementById('glb-mate');
  const canvas   = document.getElementById('mate-canvas');
  const swipeHint= document.getElementById('mate-swipe-hint');

  if (!section || !canvas) return;

  // ─── Three.js setup ───────────────────────
  renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(canvas.offsetWidth || 390, canvas.offsetHeight || 450);
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  scene  = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(45, (canvas.offsetWidth || 390) / (canvas.offsetHeight || 450), 0.1, 100);
  camera.position.set(0, 0.5, 3.5);

  // Luces
  const ambient = new THREE.AmbientLight(0xffffff, 1.2);
  scene.add(ambient);

  const user   = getUserFromStorage();
  const c1Hex  = user.colores?.[0] || '#A8E6E0';
  const c2Hex  = user.colores?.[1] || '#F4C2C2';

  const light1 = new THREE.PointLight(new THREE.Color(c1Hex), 2, 10);
  light1.position.set(2, 2, 2);
  scene.add(light1);

  const light2 = new THREE.PointLight(new THREE.Color(c2Hex), 1.5, 10);
  light2.position.set(-2, -1, 2);
  scene.add(light2);

  // ─── Cargar GLB dinámicamente ──────────────
  loadGLTF('/glb/mate.yerba.glb').then(gltf => {
    model = gltf.scene;
    // Centrar modelo
    const box    = new THREE.Box3().setFromObject(model);
    const center = box.getCenter(new THREE.Vector3());
    const size   = box.getSize(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z);
    const scale  = 1.8 / maxDim;

    model.scale.setScalar(scale);
    model.position.sub(center.multiplyScalar(scale));

    scene.add(model);
  }).catch(() => {
    // Fallback: esfera con shader si GLB no carga
    const geo  = new THREE.SphereGeometry(1, 32, 32);
    const mat  = new THREE.MeshStandardMaterial({
      color:     new THREE.Color(c1Hex),
      roughness: 0.3,
      metalness: 0.1,
    });
    model = new THREE.Mesh(geo, mat);
    scene.add(model);
  });

  // ─── Animación ────────────────────────────
  let rotY = 0;
  function animate() {
    animId = requestAnimationFrame(animate);
    if (model) {
      rotY += 0.006;
      model.rotation.y = rotY;
      model.rotation.x = Math.sin(Date.now() * 0.0005) * 0.08;
    }
    renderer.render(scene, camera);
  }

  // Solo renderizar cuando es visible
  const obs = new IntersectionObserver(entries => {
    if (entries[0].isIntersecting) {
      animate();
    } else {
      cancelAnimationFrame(animId);
    }
  }, { threshold: 0.1 });
  obs.observe(section);

  // Resize
  window.addEventListener('resize', () => {
    const w = canvas.offsetWidth || 390;
    const h = canvas.offsetHeight || 450;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
  });

  // ─── Swipe derecha → experimental mode ────
  // BUG 1.5: trackear también Y para no confundir con scroll vertical
  let touchStartY = 0;

  section.addEventListener('touchstart', e => {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
  }, { passive: true });

  section.addEventListener('touchend', e => {
    const dx = e.changedTouches[0].clientX - touchStartX;
    const dy = Math.abs(e.changedTouches[0].clientY - touchStartY);
    // Solo disparar si: swipe derecho > 80px Y horizontal supera vertical × 1.5
    if (dx > 80 && dx > dy * 1.5) {
      openExperimentalMode();
    }
  }, { passive: true });

  // Botón alternativo
  const openBtn = document.getElementById('mate-open-experimental');
  openBtn?.addEventListener('click', openExperimentalMode);

  // Swipe hint animation
  if (swipeHint) {
    setInterval(() => {
      swipeHint.style.animation = 'none';
      requestAnimationFrame(() => {
        swipeHint.style.animation = 'swipeRight 1.4s ease-in-out';
      });
    }, 4000);
  }
}

// ─── Abrir modo experimental (panel lateral) ──
export function openExperimentalMode() {
  const panel = document.getElementById('experimental-panel');
  if (!panel) return;
  panel.classList.add('open');
  document.body.style.overflow = 'hidden';
  initExperimentalChat();
}

function closeExperimentalMode() {
  const panel = document.getElementById('experimental-panel');
  if (!panel) return;
  panel.classList.remove('open');
  document.body.style.overflow = '';
}

// ─── Chat experimental ────────────────────────
const RESPUESTAS = {
  default: [
    'El universo escucha. Cada pregunta que hacés ya es una respuesta.',
    'Nisargadatta diría: "La pregunta y quien pregunta son lo mismo."',
    'Interesante. ¿Y qué sentís cuando lo pensás?',
    'Marco Aurelio pasó años con esa misma duda. No la resolvió. La habitó.',
    'Quizás la respuesta no es algo que encontrás. Es algo que dejás de buscar.',
  ],
  meditacion: [
    'Cerrá los ojos. Tres respiraciones. Ya estás meditando.',
    'La meditación no es vaciar la mente. Es observarla sin juicio.',
    'Tu modo respiración está a un scroll de distancia. Usalo ahora.',
  ],
  filosofia: [
    'Los estoicos decían: lo único que controlás es tu respuesta ante lo que pasa.',
    'Gödel demostró que todo sistema completo es inconsistente. Incluyendo las certezas.',
    'Spinoza vería el universo como un solo ser que se expresa en infinitas formas.',
  ],
};

let chatInitialized = false;

function initExperimentalChat() {
  if (chatInitialized) return;
  chatInitialized = true;

  const closeBtn  = document.getElementById('exp-close');
  const input     = document.getElementById('exp-input');
  const sendBtn   = document.getElementById('exp-send');
  const messages  = document.getElementById('exp-messages');

  closeBtn?.addEventListener('click', closeExperimentalMode);

  function addMessage(text, type = 'bot') {
    const el = document.createElement('div');
    el.className = `exp-msg exp-msg--${type}`;

    if (type === 'bot') {
      // Escribir el mensaje letra por letra
      el.textContent = '';
      messages?.appendChild(el);
      messages?.scrollTo({ top: messages.scrollHeight, behavior: 'smooth' });

      let i = 0;
      const interval = setInterval(() => {
        el.textContent += text[i++];
        if (i >= text.length) clearInterval(interval);
      }, 22);
    } else {
      el.textContent = text;
      messages?.appendChild(el);
      messages?.scrollTo({ top: messages.scrollHeight, behavior: 'smooth' });
    }
  }

  function showLoader() {
    const el = document.createElement('div');
    el.className = 'exp-loader';
    el.id        = 'exp-loader-current';
    el.innerHTML = `
      <span class="exp-dot"></span>
      <span class="exp-dot"></span>
      <span class="exp-dot"></span>
    `;
    messages?.appendChild(el);
    messages?.scrollTo({ top: messages.scrollHeight, behavior: 'smooth' });
    return el;
  }

  function getResponse(text) {
    const lower = text.toLowerCase();
    if (/medita|respir|calma|silencio/.test(lower)) {
      return RESPUESTAS.meditacion[Math.floor(Math.random() * RESPUESTAS.meditacion.length)];
    }
    if (/filosof|estoic|verdad|ser|nada|todo|buda|spinoza|marco/.test(lower)) {
      return RESPUESTAS.filosofia[Math.floor(Math.random() * RESPUESTAS.filosofia.length)];
    }
    return RESPUESTAS.default[Math.floor(Math.random() * RESPUESTAS.default.length)];
  }

  function sendMessage() {
    const text = input?.value.trim();
    if (!text) return;
    if (input) input.value = '';

    addMessage(text, 'user');

    const loader = showLoader();
    const delay  = 900 + Math.random() * 800;

    setTimeout(() => {
      loader.remove();
      addMessage(getResponse(text), 'bot');
    }, delay);
  }

  sendBtn?.addEventListener('click', sendMessage);
  input?.addEventListener('keydown', e => { if (e.key === 'Enter') sendMessage(); });

  // Mensaje inicial
  setTimeout(() => {
    addMessage('Modo experimental activado. Soy un fragmento de Apacheta. ¿Qué exploramos?');
  }, 600);
}

// ─── GLTF Loader manual (sin importar GLTFLoader) ─
function loadGLTF(url) {
  return new Promise(async (resolve, reject) => {
    try {
      // Importar GLTFLoader dinámicamente desde CDN (Three.js addon)
      const { GLTFLoader } = await import('https://unpkg.com/three@0.160.0/examples/jsm/loaders/GLTFLoader.js');
      const loader = new GLTFLoader();
      loader.load(url, resolve, undefined, reject);
    } catch (e) {
      reject(e);
    }
  });
}

function getUserFromStorage() {
  try { return JSON.parse(localStorage.getItem('apacheta_user') || '{}'); }
  catch { return {}; }
}
