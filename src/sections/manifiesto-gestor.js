/* =============================================
   APACHETA — MANIFIESTO GESTOR
   3 columnas Apple Notes dark: Carpetas · Lista · Visor
   Lee user.notas[], filtra por tag, banners, Playfair Display
   ============================================= */

import { getUser, saveUser } from '../main.js';
import { randomBanner, findByTags } from '../data/banner-registry.js';
import { openOracleModal } from '../components/oracle-modal.js';
import { NotasStore } from '../state/NotasStore.js';

const CARPETAS = [
  { id: 'todas',           label: '✦ Todas',      tags: [] },
  { id: 'filosofia',       label: 'Filosofía',     tags: ['filosofia', 'filosofia-personal'] },
  { id: 'vision',          label: 'Visión',        tags: ['vision-futuro', 'vision'] },
  { id: 'tech',            label: 'Tech',          tags: ['tech', 'codigo'] },
  { id: 'emocional',       label: 'Emocional',     tags: ['emocional', 'estado-cuerpo'] },
  { id: 'lenguaje',        label: 'Lenguaje',      tags: ['lenguaje-propio', 'copy'] },
  { id: 'sideral',         label: 'Sideral',       tags: ['sideral', 'yoga', 'mandala'] },
  { id: 'musical',         label: 'Musical',       tags: ['musical'] },
];

const CARPETA_COLORS = {
  filosofia: { bg: '#2D5016', text: '#FFE44D' },
  vision:    { bg: '#1B2B4B', text: '#ffffff' },
  tech:      { bg: '#0D1F2D', text: '#A8E6E0' },
  emocional: { bg: '#2D1B2D', text: '#F4C2C2' },
  lenguaje:  { bg: '#1A2A12', text: '#B4FF50' },
  sideral:   { bg: '#1A1A2D', text: '#D4C5E8' },
  musical:   { bg: '#2D1A0D', text: '#FFB347' },
  todas:     { bg: '#0e0e12', text: '#f0ede8' },
};

let activeCarpeta = 'todas';
let activeNota = null;
let allNotas = [];

export function initManifiestoGestor() {
  const section = document.getElementById('manifiesto-gestor');
  if (!section) return;

  renderShell(section);
  loadNotas();
  renderCarpetas();
  renderLista();
}

function renderShell(section) {
  section.innerHTML = `
    <div class="mg-layout">
      <!-- COL 1: CARPETAS -->
      <aside class="mg-col mg-col--carpetas" id="mg-carpetas">
        <div class="mg-col-header">
          <span class="mg-col-title">// CARPETAS</span>
        </div>
        <nav class="mg-carpetas-list" id="mg-carpetas-list"></nav>
        <button class="mg-nueva-nota-btn" id="mg-nueva-nota">
          <span>+</span> nueva nota
        </button>
      </aside>

      <!-- COL 2: LISTA DE NOTAS -->
      <div class="mg-col mg-col--lista" id="mg-lista-col">
        <div class="mg-col-header">
          <span class="mg-col-title" id="mg-lista-title">TODAS</span>
          <span class="mg-count" id="mg-count">0</span>
        </div>
        <div class="mg-notas-list" id="mg-notas-list"></div>
      </div>

      <!-- COL 3: VISOR / EDITOR -->
      <div class="mg-col mg-col--visor" id="mg-visor">
        <div class="mg-visor-empty" id="mg-visor-empty">
          <p class="mg-visor-hint">seleccioná una nota</p>
          <p class="mg-visor-tagline">Tu biblia. Tu lenguaje. Tu frecuencia.</p>
        </div>
        <div class="mg-visor-content" id="mg-visor-content" style="display:none;"></div>
      </div>
    </div>
  `;

  document.getElementById('mg-nueva-nota')?.addEventListener('click', crearNota);
}

function loadNotas() {
  const user = getUser();
  const raw = user.notas || {};
  allNotas = Object.entries(raw).map(([id, n]) => ({ id, ...n }))
    .sort((a, b) => (b.ts || 0) - (a.ts || 0));
}

function getNotasForCarpeta(carpetaId) {
  if (carpetaId === 'todas') return allNotas;
  const carpeta = CARPETAS.find(c => c.id === carpetaId);
  if (!carpeta) return allNotas;
  return allNotas.filter(n => {
    const notaTags = (n.tags || []).concat([n.tag].filter(Boolean));
    return carpeta.tags.some(t => notaTags.includes(t));
  });
}

function renderCarpetas() {
  const list = document.getElementById('mg-carpetas-list');
  if (!list) return;
  list.innerHTML = CARPETAS.map(c => `
    <button class="mg-carpeta-item ${c.id === activeCarpeta ? 'is-active' : ''}"
            data-carpeta="${c.id}">
      ${c.label}
      <span class="mg-carpeta-count">${getNotasForCarpeta(c.id).length}</span>
    </button>
  `).join('');

  list.querySelectorAll('.mg-carpeta-item').forEach(btn => {
    btn.addEventListener('click', () => {
      activeCarpeta = btn.dataset.carpeta;
      activeNota = null;
      renderCarpetas();
      renderLista();
      renderVisorEmpty();
      // mobile: show lista col
      document.getElementById('mg-lista-col')?.classList.add('is-visible');
      document.getElementById('mg-visor')?.classList.remove('is-visible');
    });
  });
}

function renderLista() {
  const list = document.getElementById('mg-notas-list');
  const titleEl = document.getElementById('mg-lista-title');
  const countEl = document.getElementById('mg-count');
  if (!list) return;

  const notas = getNotasForCarpeta(activeCarpeta);
  const carpeta = CARPETAS.find(c => c.id === activeCarpeta);
  if (titleEl) titleEl.textContent = (carpeta?.label || 'TODAS').toUpperCase();
  if (countEl) countEl.textContent = notas.length;

  if (!notas.length) {
    list.innerHTML = `<div class="mg-empty-state">sin notas en esta carpeta · creá la primera</div>`;
    return;
  }

  list.innerHTML = notas.map(n => {
    const fecha = n.ts ? new Date(n.ts).toLocaleDateString('es-AR', { day: 'numeric', month: 'short' }) : '';
    const preview = (n.texto || '').slice(0, 80).replace(/\n/g, ' ');
    const tag = n.tag || n.tags?.[0] || '';
    return `
      <button class="mg-nota-card ${activeNota?.id === n.id ? 'is-active' : ''}" data-nota-id="${n.id}">
        <p class="mg-nota-titulo">${n.titulo || 'Sin título'}</p>
        <p class="mg-nota-preview">${preview || '…'}</p>
        <div class="mg-nota-meta">
          <span class="mg-nota-fecha">${fecha}</span>
          ${tag ? `<span class="mg-nota-tag">${tag}</span>` : ''}
        </div>
      </button>
    `;
  }).join('');

  list.querySelectorAll('.mg-nota-card').forEach(card => {
    card.addEventListener('click', () => {
      const nota = notas.find(n => n.id === card.dataset.notaId);
      if (nota) openNota(nota);
    });
  });
}

function openNota(nota) {
  activeNota = nota;
  renderLista(); // re-render to update active state

  const visorEmpty = document.getElementById('mg-visor-empty');
  const visorContent = document.getElementById('mg-visor-content');
  if (!visorContent) return;

  visorEmpty.style.display = 'none';
  visorContent.style.display = 'block';

  const carpetaId = getCarpetaForTag(nota.tag || nota.tags?.[0]);
  const colors = CARPETA_COLORS[carpetaId] || CARPETA_COLORS.todas;
  const banners = findByTags([nota.tag || nota.tags?.[0] || 'sideral'], 1);
  const bannerPath = banners[0]?.path || randomBanner()?.path || '';
  const fecha = nota.ts ? new Date(nota.ts).toLocaleDateString('es-AR', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
  }) : '';

  visorContent.innerHTML = `
    ${bannerPath ? `
      <div class="mg-visor-banner" style="background-image:url('${bannerPath}')"></div>
    ` : ''}
    <div class="mg-visor-body" style="--mg-accent:${colors.text};--mg-bg:${colors.bg}">
      <div class="mg-visor-meta-row">
        <span class="mg-visor-fecha">${fecha}</span>
        ${nota.tag ? `<span class="mg-visor-tag-badge" style="color:${colors.text}">${nota.tag}</span>` : ''}
      </div>
      <h1 class="mg-visor-titulo" contenteditable="true" data-id="${nota.id}">${nota.titulo || 'Sin título'}</h1>
      <div class="mg-visor-divider"></div>
      <div class="mg-visor-texto" contenteditable="true" data-id="${nota.id}">${(nota.texto || '').replace(/\n/g, '<br/>')}</div>
      <div class="mg-visor-actions">
        <button class="mg-visor-oracle-btn" data-key="morning.title">
          ⚡ expandir con Oracle
        </button>
        <button class="mg-visor-save-btn" data-id="${nota.id}">
          ✦ guardar
        </button>
        <button class="mg-visor-delete-btn" data-id="${nota.id}">
          eliminar
        </button>
      </div>
    </div>
  `;

  // Save on blur contenteditable
  visorContent.querySelectorAll('[contenteditable]').forEach(el => {
    el.addEventListener('blur', () => saveNota(nota.id));
  });

  visorContent.querySelector('.mg-visor-save-btn')?.addEventListener('click', () => {
    saveNota(nota.id);
    showMgToast('✦ guardado');
  });

  visorContent.querySelector('.mg-visor-delete-btn')?.addEventListener('click', () => {
    if (confirm('¿Eliminar esta nota?')) deleteNota(nota.id);
  });

  visorContent.querySelector('.mg-visor-oracle-btn')?.addEventListener('click', () => {
    openOracleModal('morning.title');
  });

  // mobile: show visor
  document.getElementById('mg-visor')?.classList.add('is-visible');
  document.getElementById('mg-lista-col')?.classList.remove('is-visible');
}

function saveNota(id) {
  const visorContent = document.getElementById('mg-visor-content');
  if (!visorContent) return;
  const tituloEl = visorContent.querySelector(`.mg-visor-titulo[data-id="${id}"]`);
  const textoEl  = visorContent.querySelector(`.mg-visor-texto[data-id="${id}"]`);
  const titulo = tituloEl?.textContent?.trim() || '';
  const texto  = textoEl?.innerHTML?.replace(/<br\s*\/?>/gi, '\n').replace(/<[^>]+>/g, '') || '';

  // Usar NotasStore: guarda local + sincroniza API en background
  NotasStore.update(id, { titulo, texto });
  loadNotas();
  renderLista();
}

function deleteNota(id) {
  NotasStore.delete(id);
  loadNotas();
  activeNota = null;
  renderCarpetas();
  renderLista();
  renderVisorEmpty();
}

function crearNota() {
  const id  = `nota_${Date.now()}`;
  const tag = activeCarpeta === 'todas' ? '' : CARPETAS.find(c => c.id === activeCarpeta)?.tags[0] || '';
  const nota = { id, titulo: 'Nueva nota', texto: '', tag, tags: tag ? [tag] : [], ts: Date.now() };

  NotasStore.create(nota);
  loadNotas();
  renderCarpetas();
  renderLista();
  openNota(nota);
}

function renderVisorEmpty() {
  const visorEmpty = document.getElementById('mg-visor-empty');
  const visorContent = document.getElementById('mg-visor-content');
  if (visorEmpty) visorEmpty.style.display = '';
  if (visorContent) visorContent.style.display = 'none';
}

function getCarpetaForTag(tag) {
  if (!tag) return 'todas';
  for (const c of CARPETAS) {
    if (c.tags.includes(tag)) return c.id;
  }
  return 'todas';
}

function showMgToast(msg) {
  const t = document.createElement('div');
  t.className = 'oracle-toast';
  t.textContent = msg;
  document.body.appendChild(t);
  setTimeout(() => t.classList.add('is-in'), 20);
  setTimeout(() => { t.classList.remove('is-in'); setTimeout(() => t.remove(), 300); }, 1600);
}

// Escuchar evento de "Enviar a Manifiesto" desde anotacion-rapida
window.addEventListener('manifiesto:openEditor', (e) => {
  const nota = e.detail?.nota;
  if (nota) {
    // scroll a la sección y abrir la nota
    document.getElementById('manifiesto-gestor')?.scrollIntoView({ behavior: 'smooth' });
    setTimeout(() => {
      loadNotas();
      const found = allNotas.find(n => n.id === nota.id);
      if (found) openNota(found);
    }, 600);
  }
});
