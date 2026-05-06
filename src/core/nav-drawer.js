/* =============================================
   APACHETA — NAV DRAWER
   Mobile: botón flotante TOP-RIGHT que abre
   un drawer VERTICAL desde arriba con todas las
   secciones. Grid 2col · iconos SVG finos.
   Cerrado: pill compacto con sólo el icono home
   Abierto: backdrop-blur ocupa el top del viewport
   ============================================= */

import { ICONS } from './icons.js';
import { springTo } from './spring.js';

const NAV_GROUPS = [
  {
    id: 'dashboard-grp', label: 'Dashboard', icon: 'home_godofredo',
    items: [
      { id: 'dashboard',  label: 'Dashboard', icon: 'home_godofredo' },
    ]
  },
  {
    id: 'manana-grp', label: 'Mañana', icon: 'manana',
    items: [
      { id: 'morning-journey', label: 'Mañana',    icon: 'manana' },
      { id: 'alarma',          label: 'Despertar', icon: 'alarma' },
    ]
  },
  {
    id: 'meditar-grp', label: 'Meditar', icon: 'respirar',
    items: [
      { id: 'respiracion',  label: 'Respirar', icon: 'respirar' },
      { id: 'chakras',      label: 'Chakras',  icon: 'chakras' },
      { id: 'meditacion-ojo', label: 'Ojo',   icon: 'eye_meditation' },
      { id: 'soplar',       label: 'Om',       icon: 'respirar' },
    ]
  },
  {
    id: 'crear-grp', label: 'Crear', icon: 'mandala',
    items: [
      { id: 'mandala',      label: 'Mandala',   icon: 'mandala' },
      { id: 'lissajous',    label: 'Ondas',     icon: 'ondas' },
      { id: 'fibonacci',    label: 'Fibonacci', icon: 'ondas' },
      { id: 'aura-composer',label: 'Aura',      icon: 'aura' },
    ]
  },
  {
    id: 'sonidos-grp', label: 'Sonidos', icon: 'sonidos',
    items: [
      { id: 'lofi',    label: 'Lofi',    icon: 'sonidos' },
    ]
  },
  {
    id: 'leer-grp', label: 'Leer', icon: 'biblioteca',
    items: [
      { id: 'biblioteca',   label: 'Biblioteca',  icon: 'biblioteca' },
      { id: 'conexiones',   label: 'Conexiones',  icon: 'biblioteca' },
      { id: 'visualising-wisdom', label: 'Wisdom', icon: 'biblioteca' },
    ]
  },
  {
    id: 'escribir-grp', label: 'Escribir', icon: 'manifiestos',
    items: [
      { id: 'manifiesto-gestor', label: 'Manifiesto', icon: 'manifiestos' },
      { id: 'manifiestos',       label: 'Mis notas',  icon: 'manifiestos' },
      { id: 'anotacion',         label: 'Nota rápida', icon: 'manifiestos' },
    ]
  },
  {
    id: 'archivo-grp', label: 'Archivo', icon: 'mandala',
    items: [
      { id: 'aura-history',     label: 'Historial aura', icon: 'aura' },
      { id: 'mandala-archive',  label: 'Mandalas',       icon: 'mandala' },
      { id: 'banner-gallery',   label: 'Galería',         icon: 'mandala' },
    ]
  },
  {
    id: 'sideral-grp', label: 'Sideral', icon: 'astral',
    items: [
      { id: 'carta-astral', label: 'Carta Astral', icon: 'astral', action: 'open-astral' },
    ]
  },
];

// Flat list for IntersectionObserver telemetry (backward compat)
const NAV_ITEMS = NAV_GROUPS.flatMap(g => g.items);

export function initNavDrawer() {
  // Eliminar la nav horizontal anterior si existe — la reemplazamos
  const oldNav = document.getElementById('morning-nav');
  if (oldNav) oldNav.classList.add('is-replaced'); // hidden via CSS

  // Botón flotante (siempre visible, arriba a la derecha)
  const trigger = document.createElement('button');
  trigger.id = 'nav-trigger';
  trigger.className = 'nav-trigger';
  trigger.setAttribute('aria-label', 'Navegación');
  trigger.innerHTML = `
    <span class="nav-trigger__icon-home">
      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" width="20" height="20">
        <path d="M3 9.5L12 3L21 9.5V20C21 20.55 20.55 21 20 21H15V15H9V21H4C3.45 21 3 20.55 3 20V9.5Z" fill="currentColor" opacity="0.92" stroke="currentColor" stroke-width="0.5" stroke-linejoin="round"/>
        <circle cx="12" cy="11" r="1.8" fill="white" opacity="0.5"/>
      </svg>
      <span class="nav-trigger__arrow-wrap">
        <svg class="nav-trigger__arrow" viewBox="0 0 12 7" fill="none" xmlns="http://www.w3.org/2000/svg" width="12" height="7">
          <path d="M1 1.5L6 6L11 1.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        <span class="nav-trigger__arrow-dot"></span>
      </span>
    </span>
    <span class="nav-trigger__icon-close">${ICONS.close}</span>
    <span class="nav-trigger__pulse"></span>
  `;
  document.body.appendChild(trigger);

  // Color cycling — slider entre degradados personales
  const CYCLE_COLORS = ['#B4FF50', '#00FFE0', '#F4C2C2', '#FFE44D', '#D4C5E8', '#A8E6E0'];
  let cycleIdx = 0;
  function nextCycleColor() {
    const u = JSON.parse(localStorage.getItem('apacheta_user') || '{}');
    const palette = u.colores?.length ? [...u.colores, ...CYCLE_COLORS] : CYCLE_COLORS;
    const c = palette[cycleIdx % palette.length];
    cycleIdx++;
    trigger.style.setProperty('--trigger-cycle', c);
    trigger.style.borderColor = c + '88';
    trigger.style.boxShadow = `0 0 16px ${c}44, 0 2px 12px rgba(0,0,0,0.1)`;
    const pulse = trigger.querySelector('.nav-trigger__pulse');
    if (pulse) pulse.style.borderColor = c + 'bb';
  }
  nextCycleColor();
  setInterval(nextCycleColor, 2200);

  // Drawer
  const drawer = document.createElement('div');
  drawer.id = 'nav-drawer';
  drawer.className = 'drawer drawer--top';
  drawer.innerHTML = `
    <div class="drawer__scrim"></div>
    <div class="drawer__sheet">
      <div class="drawer__handle"></div>
      <div class="drawer__header">
        <div class="drawer__brand">
          <span class="drawer__mark"></span>
          <span class="drawer__name">Apacheta</span>
          <span class="drawer__tag">tu biblia · tu frecuencia</span>
        </div>
        <div class="drawer__telemetry" id="drawer-tel">
          <span class="tel-row"><em>MODO</em><b id="drawer-tel-modo">TARDE</b></span>
          <span class="tel-row"><em>STREAK</em><b id="drawer-tel-streak">11D</b></span>
          <span class="tel-row"><em>SECCION</em><b id="drawer-tel-section">—</b></span>
        </div>
      </div>
      <div class="drawer__groups" id="drawer-groups">
        ${NAV_GROUPS.map((grp, gi) => `
          <div class="drawer__group" data-group="${grp.id}">
            <button class="drawer__group-trigger" data-group="${grp.id}" style="--i:${gi}">
              <span class="drawer__item-ico">${ICONS[grp.icon] || ICONS.home}</span>
              <span class="drawer__group-lbl">${grp.label}</span>
              <span class="drawer__group-count">${grp.items.length}</span>
              <span class="drawer__group-arrow">›</span>
            </button>
            <div class="drawer__subitems" id="drawer-sub-${grp.id}">
              ${grp.items.map((it, i) => `
                <a href="#${it.id}" class="drawer__item drawer__subitem"
                  data-section="${it.id}"
                  ${it.action ? `data-action="${it.action}"` : ''}
                  style="--i:${i}">
                  <span class="drawer__item-ico">${ICONS[it.icon] || ICONS.home}</span>
                  <span class="drawer__item-lbl">${it.label}</span>
                </a>
              `).join('')}
            </div>
          </div>
        `).join('')}
      </div>
      <div class="drawer__footer">
        <span class="drawer__meta">AJETREOS DEL SUR · CBA · 2026</span>
      </div>
    </div>
  `;
  document.body.appendChild(drawer);

  let open = false;
  const sheet = drawer.querySelector('.drawer__sheet');
  const scrim = drawer.querySelector('.drawer__scrim');
  let currentSpring = null;

  function openDrawer() {
    open = true;
    drawer.classList.add('is-open');
    trigger.classList.add('is-open');
    document.body.classList.add('drawer-locked');
    if (currentSpring) currentSpring.cancel();
    sheet.style.display = 'block';
    currentSpring = springTo({
      from: -110, to: 0, stiffness: 0.12, damping: 0.78,
      onUpdate: v => { sheet.style.transform = `translateY(${v}%)`; },
    });
  }
  function closeDrawer() {
    open = false;
    drawer.classList.remove('is-open');
    trigger.classList.remove('is-open');
    document.body.classList.remove('drawer-locked');
    if (currentSpring) currentSpring.cancel();
    currentSpring = springTo({
      from: 0, to: -110, stiffness: 0.14, damping: 0.82,
      onUpdate: v => { sheet.style.transform = `translateY(${v}%)`; },
      onDone: () => {},
    });
  }

  trigger.addEventListener('click', () => open ? closeDrawer() : openDrawer());
  scrim.addEventListener('click', closeDrawer);

  // Grupos expand/collapse
  let openGroup = null;
  drawer.querySelectorAll('.drawer__group-trigger').forEach(btn => {
    btn.addEventListener('click', () => {
      const gid = btn.dataset.group;
      const subEl = document.getElementById(`drawer-sub-${gid}`);
      if (!subEl) return;
      if (openGroup && openGroup !== gid) {
        const prevSub = document.getElementById(`drawer-sub-${openGroup}`);
        if (prevSub) {
          prevSub.style.maxHeight = '0';
          prevSub.style.opacity = '0';
          drawer.querySelector(`[data-group="${openGroup}"] .drawer__group-arrow`).textContent = '›';
        }
      }
      const isOpen = subEl.style.maxHeight && subEl.style.maxHeight !== '0px' && subEl.style.maxHeight !== '0';
      if (isOpen) {
        subEl.style.maxHeight = '0';
        subEl.style.opacity = '0';
        btn.querySelector('.drawer__group-arrow').textContent = '›';
        openGroup = null;
      } else {
        subEl.style.maxHeight = subEl.scrollHeight + 'px';
        subEl.style.opacity = '1';
        btn.querySelector('.drawer__group-arrow').textContent = '↓';
        openGroup = gid;
      }
    });
  });

  // Navegar al tocar un subitem
  drawer.querySelectorAll('.drawer__item').forEach(a => {
    a.addEventListener('click', (e) => {
      e.preventDefault();
      // Panel especial: abrir sin scroll
      if (a.dataset.action === 'open-astral') {
        closeDrawer();
        setTimeout(() => window.openCartaAstral?.(), 260);
        return;
      }
      const id = a.dataset.section;
      const target = document.getElementById(id);
      if (target) {
        closeDrawer();
        setTimeout(() => target.scrollIntoView({ behavior: 'smooth' }), 260);
      }
    });
  });

  // Swipe-down-to-close en el handle
  let startY = 0, dy = 0;
  drawer.querySelector('.drawer__handle').addEventListener('touchstart', e => {
    startY = e.touches[0].clientY; dy = 0;
  }, { passive: true });
  drawer.querySelector('.drawer__handle').addEventListener('touchmove', e => {
    dy = e.touches[0].clientY - startY;
    if (dy < 0) sheet.style.transform = `translateY(${dy * 0.4}%)`;
  }, { passive: true });
  drawer.querySelector('.drawer__handle').addEventListener('touchend', () => {
    if (dy < -40) closeDrawer();
    else sheet.style.transform = 'translateY(0%)';
  });

  // Actualizar tel: sección actual
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting && e.intersectionRatio > 0.5) {
        const id = e.target.id;
        const item = NAV_ITEMS.find(i => i.id === id);
        if (item) {
          const lbl = document.getElementById('drawer-tel-section');
          if (lbl) lbl.textContent = item.label.toUpperCase();
          drawer.querySelectorAll('.drawer__item').forEach(a => {
            a.classList.toggle('is-current', a.dataset.section === id);
          });
        }
      }
    });
  }, { threshold: [0.5] });
  NAV_ITEMS.forEach(it => {
    const el = document.getElementById(it.id);
    if (el) obs.observe(el);
  });

  // Actualizar modo telemetry
  function updateModo() {
    const h = new Date().getHours();
    const modo = h >= 6 && h < 12 ? 'MAÑANA' : h >= 12 && h < 20 ? 'TARDE' : 'NOCHE';
    const el = document.getElementById('drawer-tel-modo');
    if (el) el.textContent = modo;
  }
  updateModo();
  setInterval(updateModo, 60000);
}
