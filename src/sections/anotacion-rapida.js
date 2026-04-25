/* =============================================
   APACHETA — ANOTACIÓN RÁPIDA v2
   FAB + Modal top-down + Título + Color + Lista
   ============================================= */

import { getUser, saveUser } from '../main.js';
import { openNoteReader } from '../core/nota-reader.js';
import { NotasStore } from '../state/NotasStore.js';

const NOTE_COLORS = ['#FFE44D', '#A8E6E0', '#F4C2C2', '#B8D4B0', '#D4C5E8', '#F5D89A'];

export function initAnotacion() {
  const fab         = document.getElementById('fab-anotacion');
  const modal       = document.getElementById('anotacion-modal');
  const overlay     = document.getElementById('modal-overlay');
  const saveBtn     = document.getElementById('save-anotacion');
  const manifBtn    = document.getElementById('save-manifiesto');
  const textarea    = document.getElementById('anotacion-text');
  const tagsEl      = document.getElementById('anotacion-tags');
  const tituloInput = document.getElementById('anotacion-titulo');
  const colorPicker = document.getElementById('anotacion-color-picker');
  const notasStack  = document.getElementById('notas-stack');
  const tabBtns     = document.querySelectorAll('.anotacion-tab');
  const panelNueva  = document.getElementById('anotacion-panel-nueva');
  const panelLista  = document.getElementById('anotacion-panel-lista');

  if (!fab || !modal) return;

  // Render stack on load
  renderStack();

  let selectedTags  = [];
  let selectedColor = NOTE_COLORS[0];
  let isOpen        = false;
  let dragStartY    = 0;
  let activeTab     = 'nueva';
  let editingId     = null;

  // ─── Tab switching ────────────────────────
  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      activeTab = btn.dataset.tab;
      tabBtns.forEach(b => b.classList.toggle('is-active', b.dataset.tab === activeTab));
      panelNueva.style.display  = activeTab === 'nueva' ? '' : 'none';
      panelLista.style.display  = activeTab === 'lista' ? '' : 'none';
      if (activeTab === 'lista') renderLista();
    });
  });

  // ─── Color picker ─────────────────────────
  function applyNoteColor(color) {
    selectedColor = color;
    if (textarea)    textarea.style.setProperty('--note-current-color', color + '55');
    if (tituloInput) tituloInput.style.borderColor = color;
    colorPicker?.querySelectorAll('.anotacion-color-dot').forEach(d =>
      d.classList.toggle('is-selected', d.dataset.color === color)
    );
  }

  colorPicker?.querySelectorAll('.anotacion-color-dot').forEach(dot => {
    dot.addEventListener('click', () => applyNoteColor(dot.dataset.color));
  });
  // Seleccionar el primero por defecto
  applyNoteColor(selectedColor);

  // ─── Abrir / Cerrar ───────────────────────
  fab.addEventListener('click', () => isOpen ? closeSheet() : openSheet());
  overlay?.addEventListener('click', closeSheet);

  function openSheet() {
    isOpen = true;
    fab.classList.add('open');
    modal.classList.add('open');
    overlay?.classList.add('open');
    document.body.style.overflow = 'hidden';
    if (activeTab === 'nueva') textarea?.focus();

    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', onViewportResize);
      window.visualViewport.addEventListener('scroll', onViewportResize);
    }
  }

  function closeSheet() {
    isOpen = false;
    fab.classList.remove('open');
    modal.classList.remove('open');
    modal.style.transform = '';
    overlay?.classList.remove('open');
    document.body.style.overflow = '';

    if (window.visualViewport) {
      window.visualViewport.removeEventListener('resize', onViewportResize);
      window.visualViewport.removeEventListener('scroll', onViewportResize);
    }
  }

  function onViewportResize() {
    if (!isOpen) return;
    const vv = window.visualViewport;
    const keyboardOffset = window.innerHeight - vv.height - vv.offsetTop;
    if (keyboardOffset > 50) {
      modal.style.transition = 'none';
      modal.style.transform = `translateX(-50%) translateY(${keyboardOffset * 0.5}px)`;
    } else {
      modal.style.transition = '';
      modal.style.transform = '';
    }
  }

  // ─── Swipe up to close ────────────────────
  let swipeActive = false;
  const handleEl = modal.querySelector('.modal-sheet__handle--bottom');

  modal.addEventListener('touchstart', e => {
    const rect   = modal.getBoundingClientRect();
    const touchY = e.touches[0].clientY;
    if (touchY - rect.top < rect.height * 0.18) {
      dragStartY  = touchY;
      swipeActive = true;
      modal.style.transition = 'none';
    }
  }, { passive: true });

  modal.addEventListener('touchmove', e => {
    if (!swipeActive) return;
    const delta = e.touches[0].clientY - dragStartY;
    if (delta < 0) {
      modal.style.transform = `translateX(-50%) translateY(${delta}px)`;
    }
  }, { passive: true });

  modal.addEventListener('touchend', e => {
    if (!swipeActive) return;
    swipeActive = false;
    const delta = e.changedTouches[0].clientY - dragStartY;
    modal.style.transition = '';
    modal.style.transform  = '';
    if (delta < -90) closeSheet();
  });

  // ─── Tags ─────────────────────────────────
  tagsEl?.querySelectorAll('.anotacion-tag').forEach(tag => {
    tag.addEventListener('click', () => {
      tag.classList.toggle('active');
      const t = tag.dataset.tag;
      if (selectedTags.includes(t)) {
        selectedTags = selectedTags.filter(x => x !== t);
      } else {
        selectedTags.push(t);
      }
    });
  });

  textarea?.addEventListener('input', () => {
    const val = (textarea.value || '').toLowerCase();
    const suggestions = {
      filosofia: ['marco aurelio', 'buda', 'estoic', 'zenon', 'nietzsche', 'heidegger', 'spinoza', 'socrát'],
      tech:      ['código', 'programar', 'vite', 'javascript', 'algoritmo', 'base de datos', 'github', 'deploy'],
      emocional: ['siento', 'miedo', 'alegría', 'tristeza', 'ansied', 'amor', 'soledad', 'enojo'],
      sideral:   ['universo', 'quantum', 'física', 'astro', 'átomo', 'energía', 'conciencia', 'fractal'],
      musical:   ['música', 'canción', 'jazz', 'coltrane', 'miles', 'beatles', 'letra', 'ritmo'],
      yoga:      ['yoga', 'chakra', 'respirar', 'medita', 'asana', 'prana'],
    };
    tagsEl.querySelectorAll('.anotacion-tag').forEach(tag => {
      const t     = tag.dataset.tag;
      const words = suggestions[t] || [];
      const match = words.some(w => val.includes(w));
      if (match && !tag.classList.contains('active')) {
        tag.style.background  = 'rgba(168,230,224,0.3)';
        tag.style.borderColor = 'rgba(168,230,224,0.6)';
      } else if (!tag.classList.contains('active')) {
        tag.style.background  = '';
        tag.style.borderColor = '';
      }
    });
  });

  // ─── Guardar nota ─────────────────────────
  saveBtn?.addEventListener('click', () => {
    const texto  = textarea?.value.trim();
    if (!texto) return;

    const titulo = tituloInput?.value.trim() || generarTituloAuto(texto);

    if (editingId) {
      NotasStore.update(editingId, { titulo, texto, color: selectedColor, tags: [...selectedTags] });
    } else {
      const nota = {
        id:    Date.now().toString(36),
        titulo, texto,
        color: selectedColor,
        tags:  [...selectedTags],
        ts:    Date.now(),
      };
      NotasStore.create(nota);
    }

    window.feedbackBus?.push({
      type: 'note-written',
      payload: { titulo, preview: texto.slice(0, 60), tags: [...selectedTags], color: selectedColor }
    });

    renderStack();
    resetForm();
    closeSheet();
    showToast(`"${titulo}" guardada ✓`);
  });

  manifBtn?.addEventListener('click', () => {
    const texto = textarea?.value.trim();
    if (!texto) return;
    saveBtn?.click();
    setTimeout(() => {
      const user = getUser();
      const ultimaNota = (user.notasList || []).at(-1);
      window.dispatchEvent(new CustomEvent('manifiesto:openEditor', { detail: { nota: ultimaNota } }));
      document.getElementById('manifiesto-gestor')?.scrollIntoView({ behavior: 'smooth' });
    }, 300);
  });

  const postitMini = document.getElementById('postit-mini');
  postitMini?.addEventListener('click', () => {
    const user  = getUser();
    const lista = user.notasList || [];
    if (lista.length && textarea) {
      const last = lista[lista.length - 1];
      textarea.value = last.texto || '';
      if (tituloInput) tituloInput.value = last.titulo || '';
    }
    openSheet();
    postitMini.style.display = 'none';
  });

  // ─── Renderizar lista de notas ─────────────
  function renderLista() {
    const grid  = document.getElementById('anotacion-lista-grid');
    const empty = document.getElementById('anotacion-lista-empty');
    if (!grid) return;

    const user  = getUser();
    const lista = [...(user.notasList || [])].reverse();

    grid.innerHTML = '';

    if (!lista.length) {
      if (empty) empty.style.display = '';
      return;
    }
    if (empty) empty.style.display = 'none';

    lista.forEach(nota => {
      const card = document.createElement('div');
      card.className = 'anotacion-saved-card';
      card.style.background = (nota.color || '#FFE44D') + '88';
      card.style.borderColor = nota.color || '#FFE44D';

      const fecha = new Date(nota.ts).toLocaleDateString('es-AR', { day: 'numeric', month: 'short' });
      card.innerHTML = `
        <p class="anotacion-saved-titulo">${nota.titulo || 'Sin título'}</p>
        <p class="anotacion-saved-texto">${nota.texto.slice(0, 90)}${nota.texto.length > 90 ? '…' : ''}</p>
        <div class="anotacion-saved-meta">
          <span>${fecha}</span>
          ${nota.tags?.map(t => `<span class="anotacion-saved-tag">${t}</span>`).join('') || ''}
          <button class="anotacion-saved-del" data-id="${nota.id}" title="Eliminar">×</button>
        </div>
      `;
      card.addEventListener('click', e => {
        if (e.target.closest('.anotacion-saved-del')) return;
        closeSheet();
        setTimeout(() => openNoteReader(nota), 280);
      });
      grid.appendChild(card);
    });

    grid.querySelectorAll('.anotacion-saved-del').forEach(btn => {
      btn.addEventListener('click', e => {
        e.stopPropagation();
        const id   = btn.dataset.id;
        const user = getUser();
        const list = (user.notasList || []).filter(n => n.id !== id);
        saveUser({ notasList: list });
        renderLista();
      });
    });
  }

  // ─── Stack flotante de notas ───────────────
  function renderStack() {
    if (!notasStack) return;
    const user  = getUser();
    const lista = [...(user.notasList || [])].reverse().slice(0, 5); // máx 5 visibles

    notasStack.innerHTML = '';
    if (!lista.length) return;

    lista.forEach((nota, i) => {
      const chip = document.createElement('div');
      chip.className = 'nota-chip';
      chip.style.background = nota.color || '#FFE44D';
      chip.style.zIndex = String(10 - i);
      chip.style.setProperty('--chip-i', String(i));
      chip.innerHTML = `
        <span class="nota-chip__dot" style="background:${nota.color || '#FFE44D'};filter:brightness(0.7);"></span>
        <span class="nota-chip__titulo">${nota.titulo || 'nota'}</span>
        <button class="nota-chip__edit" title="Editar">✎</button>
      `;

      // Click sobre el chip → abrir visor de lectura
      chip.addEventListener('click', e => {
        if (e.target.closest('.nota-chip__edit')) return;
        openNoteReader(nota);
      });

      // Botón ✎ → modo editar
      chip.querySelector('.nota-chip__edit')?.addEventListener('click', e => {
        e.stopPropagation();
        editingId = nota.id;
        if (textarea)    textarea.value = nota.texto || '';
        if (tituloInput) tituloInput.value = nota.titulo || '';
        applyNoteColor(nota.color || NOTE_COLORS[0]);
        openSheet();
      });

      notasStack.appendChild(chip);
    });
  }

  function resetForm() {
    editingId = null;
    if (textarea)    textarea.value = '';
    if (tituloInput) tituloInput.value = '';
    selectedTags = [];
    tagsEl?.querySelectorAll('.anotacion-tag').forEach(t => {
      t.classList.remove('active');
      t.style.background = '';
      t.style.borderColor = '';
    });
    applyNoteColor(NOTE_COLORS[0]);
  }

  // ─── Escucha eventos del reader ─────────────
  document.addEventListener('nota-edit-request', e => {
    const nota = e.detail;
    if (!nota) return;
    editingId = nota.id;
    if (textarea)    textarea.value = nota.texto || '';
    if (tituloInput) tituloInput.value = nota.titulo || '';
    applyNoteColor(nota.color || NOTE_COLORS[0]);
    const tabNueva = document.querySelector('.anotacion-tab[data-tab="nueva"]');
    tabNueva?.click();
    openSheet();
  });

  document.addEventListener('nota-delete-request', e => {
    const nota = e.detail;
    if (!nota?.id) return;
    const user = getUser();
    const list = (user.notasList || []).filter(n => n.id !== nota.id);
    saveUser({ notasList: list });
    renderStack();
    if (activeTab === 'lista') renderLista();
  });
}

function generarTituloAuto(texto) {
  const words = texto.split(/\s+/).slice(0, 5).join(' ');
  return words.length < texto.length ? words + '…' : words;
}

function showToast(msg) {
  const toast = document.createElement('div');
  toast.textContent = msg;
  toast.style.cssText = `
    position:fixed; top:calc(env(safe-area-inset-top,0px) + 16px);
    left:50%; transform:translateX(-50%);
    background:var(--text-primary); color:var(--bg-primary);
    padding:10px 20px; border-radius:20px;
    font-size:0.875rem; font-weight:500;
    z-index:9999; pointer-events:none;
    animation:fadeDown 0.3s ease both;
    white-space:nowrap;
  `;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 2500);
}
