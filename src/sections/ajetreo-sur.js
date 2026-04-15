/* =============================================
   APACHETA — AJETREO SUR
   Three.js: esferas/burbujas flotantes
   Colores personales del usuario, mouse reactivo
   ============================================= */

import * as THREE from 'three';
import { getUser } from '../main.js';

export function initAjetreoSur() {
  const canvas = document.getElementById('ajetreo-canvas');
  if (!canvas) return;

  const user    = getUser();
  const colores = user.colores || ['#A8E6E0', '#F4C2C2', '#FFE44D'];

  // ─── Three.js setup ───────────────────────
  const W = canvas.offsetWidth  || 430;
  const H = canvas.offsetHeight || 844;

  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(W, H);

  const scene  = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(60, W / H, 0.1, 100);
  camera.position.set(0, 0, 8);

  // ─── Burbujas ─────────────────────────────
  const bubbles = [];
  const count   = 5;

  const labels = ['FILOSOFÍA', 'TECH', 'YOGA', 'MÚSICA', 'SIDERAL'];

  for (let i = 0; i < count; i++) {
    const r    = 0.8 + Math.random() * 1.2;
    const geo  = new THREE.SphereGeometry(r, 32, 32);
    const col  = new THREE.Color(colores[i % colores.length]);

    const mat  = new THREE.MeshStandardMaterial({
      color:       col,
      transparent: true,
      opacity:     0.5,
      roughness:   0.1,
      metalness:   0.0,
    });

    const mesh = new THREE.Mesh(geo, mat);

    // Posición inicial dispersa
    mesh.position.set(
      (Math.random() - 0.5) * 6,
      (Math.random() - 0.5) * 8,
      (Math.random() - 0.5) * 2,
    );

    // userData para animación
    mesh.userData = {
      label:     labels[i],
      baseX:     mesh.position.x,
      baseY:     mesh.position.y,
      speed:     0.3 + Math.random() * 0.4,
      offset:    Math.random() * Math.PI * 2,
      floatAmp:  0.3 + Math.random() * 0.5,
    };

    scene.add(mesh);
    bubbles.push(mesh);
  }

  // ─── Luz ──────────────────────────────────
  scene.add(new THREE.AmbientLight(0xffffff, 0.8));
  const dirLight = new THREE.DirectionalLight(0xffffff, 0.6);
  dirLight.position.set(2, 4, 6);
  scene.add(dirLight);

  // ─── Mouse ────────────────────────────────
  const mouse = new THREE.Vector2(0, 0);
  const section = document.getElementById('ajetreo-sur');

  section?.addEventListener('mousemove', e => {
    const rect = canvas.getBoundingClientRect();
    mouse.x = ((e.clientX - rect.left) / rect.width)  * 2 - 1;
    mouse.y = -((e.clientY - rect.top)  / rect.height) * 2 + 1;
  });

  section?.addEventListener('touchmove', e => {
    if (!e.touches[0]) return;
    const rect = canvas.getBoundingClientRect();
    mouse.x = ((e.touches[0].clientX - rect.left) / rect.width)  * 2 - 1;
    mouse.y = -((e.touches[0].clientY - rect.top)  / rect.height) * 2 + 1;
  }, { passive: true });

  // ─── Resize ───────────────────────────────
  const ro = new ResizeObserver(() => {
    const nW = canvas.offsetWidth  || 430;
    const nH = canvas.offsetHeight || 844;
    renderer.setSize(nW, nH);
    camera.aspect = nW / nH;
    camera.updateProjectionMatrix();
  });
  ro.observe(canvas.parentElement || canvas);

  // ─── IntersectionObserver: solo renderizar cuando visible ───
  let animId, isVisible = false;
  const clock = new THREE.Clock();

  const obs = new IntersectionObserver(entries => {
    isVisible = entries[0].isIntersecting;
    if (isVisible && !animId) animate();
  }, { threshold: 0.1 });

  obs.observe(section || canvas);

  function animate() {
    if (!isVisible) { animId = null; return; }
    animId = requestAnimationFrame(animate);

    const t = clock.getElapsedTime();

    bubbles.forEach((b, i) => {
      const ud = b.userData;
      // Flotación suave
      b.position.x = ud.baseX + Math.sin(t * ud.speed + ud.offset) * ud.floatAmp;
      b.position.y = ud.baseY + Math.cos(t * ud.speed * 0.7 + ud.offset) * ud.floatAmp;

      // Alejarse del mouse suavemente
      const distX = b.position.x - mouse.x * 3;
      const distY = b.position.y - mouse.y * 3;
      const dist  = Math.sqrt(distX * distX + distY * distY);
      if (dist < 2) {
        b.position.x += (distX / dist) * 0.04;
        b.position.y += (distY / dist) * 0.04;
      }

      // Rotación lenta
      b.rotation.y = t * 0.1 + i;
    });

    renderer.render(scene, camera);
  }
}
