/* =============================================
   APACHETA — GYROSCOPE + PARALLAX
   DeviceOrientation para parallax en mobile
   También: floating name bubble, scroll reveals
   ============================================= */

export function initGyroscope() {
  // ─── Solicitar permiso en iOS 13+ ─────────
  async function requestPermission() {
    if (typeof DeviceOrientationEvent?.requestPermission === 'function') {
      try {
        const perm = await DeviceOrientationEvent.requestPermission();
        if (perm === 'granted') attachGyro();
      } catch (e) {
        // Sin permiso, usar mouse fallback
        attachMouseParallax();
      }
    } else {
      // Android / Desktop
      attachGyro();
      attachMouseParallax();
    }
  }

  // Intentar silenciosamente en el primer interaction
  document.addEventListener('click', () => {
    requestPermission();
  }, { once: true });

  // ─── Gyroscopio ───────────────────────────
  function attachGyro() {
    window.addEventListener('deviceorientation', e => {
      const beta  = (e.beta  || 0) / 90;   // -1 → 1
      const gamma = (e.gamma || 0) / 90;   // -1 → 1

      applyParallax(gamma * 15, beta * 10);
    }, { passive: true });
  }

  // ─── Mouse fallback ───────────────────────
  function attachMouseParallax() {
    window.addEventListener('mousemove', e => {
      const x = (e.clientX / window.innerWidth  - 0.5) * 20;
      const y = (e.clientY / window.innerHeight - 0.5) * 12;
      applyParallax(x, y);
    }, { passive: true });
  }

  // ─── Aplicar parallax a orbes ─────────────
  function applyParallax(x, y) {
    document.querySelectorAll('.orb, .parallax-layer').forEach(el => {
      const depth = parseFloat(el.dataset.depth || 1);
      el.style.transform = `translate(${x * depth}px, ${y * depth}px)`;
    });
  }

  requestPermission();
}

// ─── Nombre en burbuja flotante ────────────────
export function initNameBubble() {
  const user = getUserFromStorage();
  if (!user.nombre) return;

  // Burbuja persistente sobre el contenido
  const bubble = document.createElement('div');
  bubble.className = 'name-bubble';
  bubble.id        = 'name-bubble-global';
  bubble.innerHTML = `
    <span class="name-bubble__text">${user.nombre}</span>
    <span class="name-bubble__ring"></span>
  `;
  document.body.appendChild(bubble);

  // Pulso con scroll
  let lastScrollY = 0;
  window.addEventListener('scroll', () => {
    const sy    = window.scrollY;
    const delta = Math.abs(sy - lastScrollY);
    if (delta > 5) {
      bubble.classList.add('pulse');
      setTimeout(() => bubble.classList.remove('pulse'), 600);
    }
    lastScrollY = sy;
  }, { passive: true });
}

// ─── Scroll-invite: gradiente que invita a deslizar ─
export function initScrollInvites() {
  const sections = document.querySelectorAll('.section[data-invite]');
  sections.forEach(sec => {
    const invite = document.createElement('div');
    invite.className = 'scroll-invite';
    invite.innerHTML = `
      <div class="scroll-invite__orbs">
        <div class="scroll-invite__orb" data-depth="0.5"></div>
        <div class="scroll-invite__orb" data-depth="0.3"></div>
      </div>
      <p class="scroll-invite__label">${sec.dataset.invite}</p>
      <div class="scroll-invite__arrow">↓</div>
    `;
    sec.appendChild(invite);
  });
}

function getUserFromStorage() {
  try { return JSON.parse(localStorage.getItem('apacheta_user') || '{}'); }
  catch { return {}; }
}
