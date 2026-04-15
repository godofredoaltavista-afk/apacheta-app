/* =============================================
   APACHETA — CHAKRAS
   7 chakras con modal de detalle
   ============================================= */

const CHAKRAS_DATA = [
  {
    nombre: 'Raíz', sanskrit: 'Muladhara', num: 1,
    color: '#FF4444', emoji: '🔴',
    desc: 'El centro de la seguridad, la tierra, el instinto de supervivencia.',
    elemento: 'Tierra', sentido: 'Olfato', mantra: 'LAM',
    practica: 'Caminar descalzo. Meditar en contacto con la tierra. Sentir el peso de tu cuerpo.',
    conexion: 'La física newtoniana es la cosmovisión del chakra raíz: leyes fijas, causalidad directa, materia sólida.',
  },
  {
    nombre: 'Sacro', sanskrit: 'Svadhisthana', num: 2,
    color: '#FF8C00', emoji: '🟠',
    desc: 'La creatividad, el placer, el flujo de las emociones.',
    elemento: 'Agua', sentido: 'Gusto', mantra: 'VAM',
    practica: 'Movimiento fluido: baile, yoga, natación. Crear algo sin juzgarlo.',
    conexion: 'La teoría del flujo de Csikszentmihalyi: cuando la habilidad se encuentra con el desafío, el placer emerge.',
  },
  {
    nombre: 'Plexo Solar', sanskrit: 'Manipura', num: 3,
    color: '#FFE44D', emoji: '🟡',
    desc: 'La voluntad, el poder personal, la capacidad de actuar.',
    elemento: 'Fuego', sentido: 'Vista', mantra: 'RAM',
    practica: 'Hacer algo que miedo. Decir que no una vez al día. Terminar lo que empezaste.',
    conexion: 'La teoría de la autodeterminación de Deci y Ryan: necesitamos autonomía, competencia y relación para el bienestar.',
  },
  {
    nombre: 'Corazón', sanskrit: 'Anahata', num: 4,
    color: '#B8D4B0', emoji: '💚',
    desc: 'El amor, la compasión, el equilibrio entre lo material y lo espiritual.',
    elemento: 'Aire', sentido: 'Tacto', mantra: 'YAM',
    practica: 'Metta meditation: enviar amor a personas difíciles. Perdonar una pequeña cosa hoy.',
    conexion: 'La coherencia cardíaca (Heart Math Institute): el corazón emite un campo electromagnético que afecta el cerebro y el entorno.',
  },
  {
    nombre: 'Garganta', sanskrit: 'Vishuddha', num: 5,
    color: '#A8E6E0', emoji: '💙',
    desc: 'La expresión auténtica, la verdad, la comunicación.',
    elemento: 'Éter', sentido: 'Oído', mantra: 'HAM',
    practica: 'Cantá en la ducha. Escribí sin censura durante 5 minutos. Decí lo que pensás con amabilidad.',
    conexion: 'El lenguaje crea realidad. Nietzsche: "Damos nombre a las cosas, entonces creemos conocerlas."',
  },
  {
    nombre: 'Tercer Ojo', sanskrit: 'Ajna', num: 6,
    color: '#6495ED', emoji: '🔵',
    desc: 'La intuición, la visión interna, la sabiduría más allá de la lógica.',
    elemento: 'Luz', sentido: 'Intuición', mantra: 'OM',
    practica: 'Meditación de visualización. Confiar en una intuición sin explicarla racionalmente.',
    conexion: 'La física cuántica sugiere que el observador afecta lo observado. El tercer ojo es el observador puro.',
  },
  {
    nombre: 'Corona', sanskrit: 'Sahasrara', num: 7,
    color: '#D4C5E8', emoji: '🟣',
    desc: 'La consciencia pura, la conexión universal, la disolución del ego.',
    elemento: 'Pensamiento', sentido: 'Consciencia', mantra: 'AH',
    practica: 'Meditación del testigo: observá tus pensamientos sin identificarte con ellos. Silencio puro.',
    conexion: 'Nisargadatta: "Soy la consciencia misma, no el contenido de la consciencia." La física cuántica llama a esto el campo de información unificado.',
  },
];

// SVG icons per chakra
const CHAKRA_ICONS = [
  // 0 Raíz - earth/root
  `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:48px;height:48px;">
    <circle cx="32" cy="32" r="20" fill="#FF4444" opacity="0.85"/>
    <circle cx="32" cy="32" r="10" fill="#FF4444"/>
    <line x1="32" y1="12" x2="32" y2="4" stroke="#FF4444" stroke-width="2.5" stroke-linecap="round"/>
    <line x1="32" y1="52" x2="32" y2="60" stroke="#FF4444" stroke-width="2.5" stroke-linecap="round"/>
    <line x1="12" y1="32" x2="4" y2="32" stroke="#FF4444" stroke-width="2.5" stroke-linecap="round"/>
    <line x1="52" y1="32" x2="60" y2="32" stroke="#FF4444" stroke-width="2.5" stroke-linecap="round"/>
  </svg>`,
  // 1 Sacro - water crescent
  `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:48px;height:48px;">
    <circle cx="32" cy="32" r="22" fill="#FF8C00" opacity="0.7"/>
    <path d="M22 28 Q32 18 42 28 Q32 22 22 28Z" fill="#FF8C00" opacity="0.9"/>
    <circle cx="32" cy="36" r="8" fill="#FF8C00"/>
  </svg>`,
  // 2 Plexo solar - sun/star
  `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:48px;height:48px;">
    <circle cx="32" cy="32" r="14" fill="#FFE44D"/>
    ${Array.from({length:8},(_,i)=>{
      const a = (i/8)*Math.PI*2;
      const x1=32+18*Math.cos(a), y1=32+18*Math.sin(a);
      const x2=32+28*Math.cos(a), y2=32+28*Math.sin(a);
      return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#FFE44D" stroke-width="2.5" stroke-linecap="round"/>`;
    }).join('')}
  </svg>`,
  // 3 Corazón - animated heart
  `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:48px;height:48px;" class="chakra-heart-icon">
    <path d="M32 48 C32 48 12 36 12 22 C12 15 18 10 25 12 C28 13 30 15 32 18 C34 15 36 13 39 12 C46 10 52 15 52 22 C52 36 32 48 32 48Z" fill="#B8D4B0" class="heart-path"/>
    <circle cx="32" cy="28" r="5" fill="rgba(255,255,255,0.5)"/>
  </svg>`,
  // 4 Garganta - mouth/sound waves
  `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:48px;height:48px;">
    <circle cx="32" cy="32" r="18" fill="#A8E6E0" opacity="0.7"/>
    <path d="M20 32 Q26 40 32 32 Q38 24 44 32" stroke="white" stroke-width="2" fill="none" stroke-linecap="round"/>
    <path d="M14 26 Q8 32 14 38" stroke="#A8E6E0" stroke-width="2" fill="none" stroke-linecap="round" opacity="0.8"/>
    <path d="M50 26 Q56 32 50 38" stroke="#A8E6E0" stroke-width="2" fill="none" stroke-linecap="round" opacity="0.8"/>
  </svg>`,
  // 5 Tercer ojo - eye
  `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:48px;height:48px;">
    <ellipse cx="32" cy="32" rx="22" ry="14" fill="#6495ED" opacity="0.6"/>
    <ellipse cx="32" cy="32" rx="22" ry="14" stroke="#6495ED" stroke-width="2" fill="none"/>
    <circle cx="32" cy="32" r="8" fill="#6495ED"/>
    <circle cx="29" cy="29" r="3" fill="rgba(255,255,255,0.7)"/>
    <circle cx="35" cy="35" r="1.5" fill="rgba(255,255,255,0.4)"/>
  </svg>`,
  // 6 Corona - crown shape
  `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:48px;height:48px;">
    <circle cx="32" cy="38" r="14" fill="#D4C5E8" opacity="0.6"/>
    <path d="M16 44 L16 30 L22 38 L32 20 L42 38 L48 30 L48 44 Z" fill="#D4C5E8" opacity="0.9"/>
    <path d="M16 44 L48 44" stroke="#D4C5E8" stroke-width="3" stroke-linecap="round"/>
    <circle cx="32" cy="20" r="3" fill="#D4C5E8"/>
    <circle cx="22" cy="38" r="2.5" fill="rgba(255,255,255,0.6)"/>
    <circle cx="42" cy="38" r="2.5" fill="rgba(255,255,255,0.6)"/>
  </svg>`,
];

export function initChakras() {
  const items        = document.querySelectorAll('.chakra-item');
  const modal        = document.getElementById('chakra-modal');
  const overlay      = document.getElementById('chakra-overlay');
  const modalContent = document.getElementById('chakra-modal-content');

  if (!modal) return;

  // ─── Replace emoji orbs with SVG icons ────
  items.forEach(item => {
    const idx = parseInt(item.dataset.chakra, 10);
    const orbEl = item.querySelector('.chakra-item__orb');
    if (orbEl && CHAKRA_ICONS[idx]) {
      orbEl.innerHTML = CHAKRA_ICONS[idx];
      orbEl.style.background = 'transparent';
    }
  });

  // ─── Add pulse animation to heart icon ────
  const heartStyle = document.createElement('style');
  heartStyle.textContent = `
    .chakra-heart-icon .heart-path {
      transform-origin: 32px 32px;
      animation: heartbeat 1.4s ease-in-out infinite;
    }
    @keyframes heartbeat {
      0%, 100% { transform: scale(1); }
      14% { transform: scale(1.12); }
      28% { transform: scale(1); }
      42% { transform: scale(1.08); }
      56% { transform: scale(1); }
    }
    .chakra-item__orb svg { display: block; }
    .chakra-item:hover .chakra-item__orb svg {
      filter: drop-shadow(0 0 8px currentColor);
    }
  `;
  document.head.appendChild(heartStyle);

  // ─── Click en chakra → modal ──────────────
  items.forEach(item => {
    item.addEventListener('click', () => {
      const idx    = parseInt(item.dataset.chakra, 10);
      const chakra = CHAKRAS_DATA[idx];
      if (!chakra || !modalContent) return;

      // Color gradient background for modal
      const c = chakra.color;
      const headerBg = `linear-gradient(160deg, ${c}33, ${c}11, transparent)`;

      modalContent.innerHTML = `
        <div style="background:${headerBg};border-radius:var(--radius-xl);padding:var(--space-xl) var(--space-lg);text-align:center;margin-bottom:var(--space-lg);">
          <div style="margin-bottom:var(--space-md);display:flex;justify-content:center;">${CHAKRA_ICONS[idx]}</div>
          <p style="font-family:var(--font-mono);font-size:var(--text-xs);color:${c};letter-spacing:0.15em;text-transform:uppercase;margin-bottom:4px;font-weight:600;">${chakra.sanskrit}</p>
          <h3 style="font-family:var(--font-display);font-size:var(--text-title);font-weight:700;margin-bottom:var(--space-sm);color:var(--text-primary);">${chakra.nombre}</h3>
          <p style="font-size:var(--text-small);color:var(--text-secondary);line-height:var(--leading-body);">${chakra.desc}</p>
          <div style="margin-top:var(--space-md);width:40px;height:3px;background:${c};border-radius:2px;margin-inline:auto;opacity:0.7;"></div>
        </div>

        <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:var(--space-sm);margin-bottom:var(--space-lg);">
          ${['Elemento', 'Sentido', 'Mantra'].map((label, i) => `
            <div style="background:${c}18;border:1px solid ${c}33;border-radius:var(--radius-md);padding:var(--space-md);text-align:center;">
              <p style="font-size:0.6rem;color:${c};font-weight:700;text-transform:uppercase;letter-spacing:0.1em;margin-bottom:4px;">${label}</p>
              <p style="font-weight:700;font-size:var(--text-small);color:var(--text-primary);">${[chakra.elemento, chakra.sentido, chakra.mantra][i]}</p>
            </div>
          `).join('')}
        </div>

        <div style="margin-bottom:var(--space-lg);padding:var(--space-lg);background:var(--bg-soft);border-radius:var(--radius-md);border-left:3px solid ${c};">
          <p style="font-size:var(--text-xs);font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:${c};margin-bottom:var(--space-sm);">PRÁCTICA DIARIA</p>
          <p style="font-size:var(--text-small);line-height:var(--leading-body);color:var(--text-secondary);">${chakra.practica}</p>
        </div>

        <div style="background:linear-gradient(135deg,${c}22,${c}08);border:1px solid ${c}22;border-radius:var(--radius-md);padding:var(--space-lg);">
          <p style="font-size:var(--text-xs);font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:${c};margin-bottom:var(--space-sm);">CONEXIÓN SIDERAL</p>
          <p style="font-size:var(--text-small);line-height:var(--leading-body);font-style:italic;color:var(--text-secondary);">${chakra.conexion}</p>
        </div>
      `;

      openModal(modal, overlay);
    });
  });

  // ─── Cerrar modal ─────────────────────────
  overlay?.addEventListener('click', () => closeModal(modal, overlay));

  // ─── Swipe down to close ──────────────────
  let startY = 0;
  modal.addEventListener('touchstart', e => { startY = e.touches[0].clientY; }, { passive: true });
  modal.addEventListener('touchend', e => {
    const delta = e.changedTouches[0].clientY - startY;
    if (delta > 80) closeModal(modal, overlay);
  });
}

function openModal(modal, overlay) {
  overlay?.classList.add('open');
  overlay && (overlay.ariaHidden = 'false');
  modal.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeModal(modal, overlay) {
  overlay?.classList.remove('open');
  overlay && (overlay.ariaHidden = 'true');
  modal.classList.remove('open');
  document.body.style.overflow = '';
}
