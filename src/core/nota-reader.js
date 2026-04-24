/* =============================================
   APACHETA — NOTA READER
   Visor de lectura: nota a pantalla completa en
   modo "Open Preview" estilo editorial.
   Glass acrylic · tipografía grande · párrafos,
   subtítulos, puntos segmentados automáticamente.
   ============================================= */

let readerEl = null;

function ensureReader() {
  if (readerEl) return readerEl;
  readerEl = document.createElement('div');
  readerEl.id = 'nota-reader';
  readerEl.className = 'nota-reader';
  readerEl.innerHTML = `
    <div class="nota-reader__scrim"></div>
    <div class="nota-reader__window" role="dialog" aria-modal="true">
      <div class="nota-reader__bar">
        <div class="nota-reader__dots">
          <span class="nota-reader__dot nota-reader__dot--close" data-action="close"></span>
          <span class="nota-reader__dot nota-reader__dot--min"></span>
          <span class="nota-reader__dot nota-reader__dot--max"></span>
        </div>
        <span class="nota-reader__barname">PREVIEW · NOTA</span>
        <span class="nota-reader__barmeta" data-el="meta"></span>
      </div>
      <div class="nota-reader__aura" data-el="aura"></div>
      <div class="nota-reader__scroll">
        <div class="nota-reader__eyebrow" data-el="eyebrow">◎ NOTA</div>
        <h1 class="nota-reader__title" data-el="title"></h1>
        <div class="nota-reader__meta-row" data-el="metarow"></div>
        <div class="nota-reader__body" data-el="body"></div>
        <div class="nota-reader__footer">
          <button class="nota-reader__action" data-action="edit">
            <span>✎</span><span>Editar</span>
          </button>
          <button class="nota-reader__action" data-action="manifesto">
            <span>◈</span><span>A Manifiestos</span>
          </button>
          <button class="nota-reader__action nota-reader__action--danger" data-action="delete">
            <span>×</span><span>Borrar</span>
          </button>
        </div>
      </div>
    </div>
  `;
  document.body.appendChild(readerEl);

  readerEl.querySelector('.nota-reader__scrim')?.addEventListener('click', closeNoteReader);
  readerEl.querySelector('[data-action="close"]')?.addEventListener('click', closeNoteReader);

  return readerEl;
}

// Segmenta un texto en bloques: subtítulos (líneas con ::), bullets (- o •), párrafos.
function segmentText(raw) {
  if (!raw) return [];
  const lines = raw.split(/\r?\n/);
  const blocks = [];
  let buffer = [];

  function flushParagraph() {
    if (buffer.length) {
      blocks.push({ type: 'p', text: buffer.join(' ').trim() });
      buffer = [];
    }
  }

  const bulletRegex = /^\s*[-•·*]\s+/;
  const subtitleRegex = /^\s*(#{1,3}|::|==)\s*/;
  const enumRegex     = /^\s*\d+[\.\)]\s+/;

  lines.forEach(line => {
    const trimmed = line.trim();
    if (!trimmed) { flushParagraph(); return; }

    if (subtitleRegex.test(trimmed)) {
      flushParagraph();
      blocks.push({ type: 'h', text: trimmed.replace(subtitleRegex, '') });
    } else if (bulletRegex.test(trimmed)) {
      flushParagraph();
      // acumular bullets contiguos
      const last = blocks[blocks.length - 1];
      const item = trimmed.replace(bulletRegex, '');
      if (last && last.type === 'ul') {
        last.items.push(item);
      } else {
        blocks.push({ type: 'ul', items: [item] });
      }
    } else if (enumRegex.test(trimmed)) {
      flushParagraph();
      const last = blocks[blocks.length - 1];
      const item = trimmed.replace(enumRegex, '');
      if (last && last.type === 'ol') {
        last.items.push(item);
      } else {
        blocks.push({ type: 'ol', items: [item] });
      }
    } else {
      buffer.push(trimmed);
    }
  });
  flushParagraph();
  return blocks;
}

function renderBody(blocks) {
  if (!blocks.length) return '<p class="nota-reader__p nota-reader__p--empty">— sin contenido —</p>';
  return blocks.map(b => {
    if (b.type === 'h') return `<h2 class="nota-reader__h">${escapeHtml(b.text)}</h2>`;
    if (b.type === 'p') return `<p class="nota-reader__p">${escapeHtml(b.text)}</p>`;
    if (b.type === 'ul') return `<ul class="nota-reader__ul">${b.items.map(i => `<li>${escapeHtml(i)}</li>`).join('')}</ul>`;
    if (b.type === 'ol') return `<ol class="nota-reader__ol">${b.items.map(i => `<li>${escapeHtml(i)}</li>`).join('')}</ol>`;
    return '';
  }).join('');
}

function escapeHtml(s) {
  return String(s || '').replace(/[&<>"']/g, m => ({
    '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
  }[m]));
}

export function openNoteReader(nota) {
  const el = ensureReader();
  const color = nota.color || '#FFE44D';

  // Aura del color
  el.style.setProperty('--reader-color', color);
  el.querySelector('[data-el="aura"]').style.background =
    `radial-gradient(circle at 50% 30%, ${color}55, transparent 65%)`;

  // Contenido
  el.querySelector('[data-el="title"]').textContent = nota.titulo || 'Sin título';
  el.querySelector('[data-el="body"]').innerHTML = renderBody(segmentText(nota.texto));

  // Meta
  const fecha = nota.ts ? new Date(nota.ts) : null;
  const fechaStr = fecha ? fecha.toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric' }) : '';
  const tags = (nota.tags || []).map(t => `<span class="nota-reader__tag">${escapeHtml(t)}</span>`).join('');
  const words = (nota.texto || '').trim().split(/\s+/).filter(Boolean).length;
  const mins  = Math.max(1, Math.round(words / 220));

  el.querySelector('[data-el="metarow"]').innerHTML = `
    <span class="nota-reader__metacell">${fechaStr}</span>
    <span class="nota-reader__metadot">·</span>
    <span class="nota-reader__metacell">${words} palabras</span>
    <span class="nota-reader__metadot">·</span>
    <span class="nota-reader__metacell">${mins} min lectura</span>
    ${tags ? `<span class="nota-reader__metadot">·</span>${tags}` : ''}
  `;
  el.querySelector('[data-el="meta"]').textContent = fechaStr;

  // Action handlers (rebind each open)
  el.querySelector('[data-action="edit"]').onclick = () => {
    closeNoteReader();
    setTimeout(() => {
      const evt = new CustomEvent('nota-edit-request', { detail: nota });
      document.dispatchEvent(evt);
    }, 280);
  };
  el.querySelector('[data-action="manifesto"]').onclick = () => {
    closeNoteReader();
    setTimeout(() => {
      document.getElementById('manifiestos')?.scrollIntoView({ behavior: 'smooth' });
    }, 280);
  };
  el.querySelector('[data-action="delete"]').onclick = () => {
    if (!confirm(`¿Borrar "${nota.titulo || 'esta nota'}"?`)) return;
    closeNoteReader();
    setTimeout(() => {
      const evt = new CustomEvent('nota-delete-request', { detail: nota });
      document.dispatchEvent(evt);
    }, 200);
  };

  requestAnimationFrame(() => el.classList.add('is-open'));
  document.body.classList.add('reader-locked');
}

export function closeNoteReader() {
  if (!readerEl) return;
  readerEl.classList.remove('is-open');
  document.body.classList.remove('reader-locked');
}

// Export global para que otros módulos puedan abrir el reader
if (typeof window !== 'undefined') {
  window.openNoteReader = openNoteReader;
  window.closeNoteReader = closeNoteReader;
}
