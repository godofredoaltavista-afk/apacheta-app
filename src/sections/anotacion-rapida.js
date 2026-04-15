/* =============================================
   APACHETA — ANOTACIÓN RÁPIDA
   FAB + Modal Sheet + Post-it + localStorage
   ============================================= */

import { getUser, saveUser } from '../main.js';

export function initAnotacion() {
  const fab      = document.getElementById('fab-anotacion');
  const modal    = document.getElementById('anotacion-modal');
  const overlay  = document.getElementById('modal-overlay');
  const saveBtn  = document.getElementById('save-anotacion');
  const manifBtn = document.getElementById('save-manifiesto');
  const textarea = document.getElementById('anotacion-text');
  const tagsEl   = document.getElementById('anotacion-tags');
  const postitMini = document.getElementById('postit-mini');
  const postitPreview = document.getElementById('postit-preview');

  if (!fab || !modal) return;

  let selectedTags  = [];
  let isOpen        = false;
  let dragStartY    = 0;

  // ─── Abrir ────────────────────────────────
  fab.addEventListener('click', () => {
    if (isOpen) {
      closeSheet();
    } else {
      openSheet();
    }
  });

  overlay?.addEventListener('click', closeSheet);

  function openSheet() {
    isOpen = true;
    fab.classList.add('open');
    modal.classList.add('open');
    overlay?.classList.add('open');
    document.body.style.overflow = 'hidden';
    textarea?.focus();

    // BUG 1.4: visualViewport — mover modal cuando sube el teclado en iOS
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', onViewportResize);
      window.visualViewport.addEventListener('scroll', onViewportResize);
    }
  }

  function closeSheet() {
    isOpen = false;
    fab.classList.remove('open');
    modal.classList.remove('open');
    modal.style.transform = ''; // resetear cualquier offset de teclado
    overlay?.classList.remove('open');
    document.body.style.overflow = '';

    // BUG 1.4: remover listeners de viewport
    if (window.visualViewport) {
      window.visualViewport.removeEventListener('resize', onViewportResize);
      window.visualViewport.removeEventListener('scroll', onViewportResize);
    }
  }

  // BUG 1.4: reposicionar modal cuando el teclado virtual aparece
  function onViewportResize() {
    if (!isOpen) return;
    const vv = window.visualViewport;
    // Cuánto sube el teclado: diferencia entre viewport visual y alto total
    const keyboardOffset = window.innerHeight - vv.height - vv.offsetTop;
    if (keyboardOffset > 50) {
      // Teclado abierto: subir el modal para que no quede tapado
      modal.style.transition = 'none';
      modal.style.transform = `translateX(-50%) translateY(-${keyboardOffset}px)`;
    } else {
      // Teclado cerrado: volver a posición original
      modal.style.transition = '';
      modal.style.transform = '';
    }
  }

  // ─── Swipe to close ───────────────────────
  // Solo trackear si el touch empieza cerca de la parte superior del modal (handle area)
  let swipeActive = false;

  modal.addEventListener('touchstart', e => {
    const rect = modal.getBoundingClientRect();
    const touchY = e.touches[0].clientY;
    // Activar swipe solo si el touch es en el 25% superior del modal (zona handle)
    if (touchY - rect.top < rect.height * 0.25) {
      dragStartY  = touchY;
      swipeActive = true;
      // Deshabilitar transición durante el drag para que siga el dedo
      modal.style.transition = 'none';
    }
  }, { passive: true });

  modal.addEventListener('touchmove', e => {
    if (!swipeActive) return;
    const delta = e.touches[0].clientY - dragStartY;
    if (delta > 0) {
      // La modal en estado .open tiene transform: translateX(-50%) translateY(0)
      // Al arrastrar, sumamos el delta vertical
      modal.style.transform = `translateX(-50%) translateY(${delta}px)`;
    }
  }, { passive: true });

  modal.addEventListener('touchend', e => {
    if (!swipeActive) return;
    swipeActive = false;

    const delta = e.changedTouches[0].clientY - dragStartY;

    // Restaurar transición CSS
    modal.style.transition = '';
    modal.style.transform  = '';

    if (delta > 90) {
      closeSheet();
    }
    // Si no supera el umbral, el modal vuelve solo a posición 0 por la transición CSS
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

  // Auto-sugerir tags mientras tipea
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

    tagsEl?.querySelectorAll('.anotacion-tag').forEach(tag => {
      const t     = tag.dataset.tag;
      const words = suggestions[t] || [];
      const match = words.some(w => val.includes(w));
      if (match && !tag.classList.contains('active')) {
        tag.style.background = 'rgba(168,230,224,0.3)';
        tag.style.borderColor = 'rgba(168,230,224,0.6)';
      } else if (!tag.classList.contains('active')) {
        tag.style.background = '';
        tag.style.borderColor = '';
      }
    });
  });

  // ─── Guardar como post-it ─────────────────
  saveBtn?.addEventListener('click', () => {
    const texto = textarea?.value.trim();
    if (!texto) return;

    const key  = new Date().toISOString().slice(0, 10);
    const nota = { texto, tags: selectedTags, ts: Date.now() };

    const user = getUser();
    const notas = { ...(user.notas || {}), [key]: nota };

    // Guardar última en ultimasAnotaciones
    const ultimas = [texto, ...(user.ultimasAnotaciones || [])].slice(0, 3);
    saveUser({ notas, ultimasAnotaciones: ultimas });

    // Mostrar post-it
    if (postitMini) {
      postitMini.style.display = 'block';
      if (postitPreview) postitPreview.textContent = texto;
    }

    // Limpiar + cerrar
    if (textarea) textarea.value = '';
    selectedTags = [];
    tagsEl?.querySelectorAll('.anotacion-tag').forEach(t => t.classList.remove('active'));
    closeSheet();

    // Feedback visual
    showToast('Guardado como post-it ✓');
  });

  // ─── Guardar como manifiesto ──────────────
  manifBtn?.addEventListener('click', () => {
    const texto = textarea?.value.trim();
    if (!texto) return;
    // Por ahora igual que post-it + scroll a manifiestos
    saveBtn?.click();
    setTimeout(() => {
      document.getElementById('manifiestos')?.scrollIntoView({ behavior: 'smooth' });
    }, 300);
  });

  // ─── Post-it click (expand) ───────────────
  postitMini?.addEventListener('click', () => {
    const user   = getUser();
    const key    = new Date().toISOString().slice(0, 10);
    const nota   = user.notas?.[key];
    if (nota && textarea) {
      textarea.value = nota.texto || '';
    }
    openSheet();
    postitMini.style.display = 'none';
  });
}

// ─── Toast util ───────────────────────────────
function showToast(msg) {
  const toast = document.createElement('div');
  toast.textContent = msg;
  toast.style.cssText = `
    position:fixed; bottom:calc(var(--tab-height) + 20px);
    left:50%; transform:translateX(-50%);
    background:var(--text-primary); color:var(--bg-primary);
    padding:10px 20px; border-radius:20px;
    font-size:0.875rem; font-weight:500;
    z-index:9999; pointer-events:none;
    animation:fadeUp 0.3s ease both;
    white-space:nowrap;
  `;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 2500);
}
