/* =============================================
   APACHETA — MANDALA ARCHIVE
   Galería de thumbnails grises de mandalas guardados
   ============================================= */

export function initMandalaArchive() {
  const grid  = document.getElementById('mandala-archive-grid');
  const empty = document.getElementById('mandala-archive-empty');
  if (!grid) return;

  renderArchive();

  window.addEventListener('apacheta:mandalaArchiveUpdated', renderArchive);
}

function renderArchive() {
  const grid  = document.getElementById('mandala-archive-grid');
  const empty = document.getElementById('mandala-archive-empty');
  if (!grid) return;

  const user    = JSON.parse(localStorage.getItem('apacheta_user') || '{}');
  const archive = user.mandalaArchive || [];

  if (!archive.length) {
    if (empty) empty.style.display = '';
    grid.innerHTML = '';
    return;
  }
  if (empty) empty.style.display = 'none';

  grid.innerHTML = '';
  archive.forEach((entry, i) => {
    const card = document.createElement('div');
    card.className = 'mandala-archive-card';

    const d = new Date(entry.ts || 0);
    const label = d.toLocaleDateString('es-AR', { day: 'numeric', month: 'short' });

    card.innerHTML = `
      <div class="mandala-archive-thumb">
        <img src="${entry.thumbUrl}" alt="Mandala ${label}" loading="lazy" />
      </div>
      <p class="mandala-archive-label">${label}</p>
      ${entry.colores?.length ? `<div class="mandala-archive-dots">${entry.colores.map(c => `<span style="background:${c}"></span>`).join('')}</div>` : ''}
    `;
    grid.appendChild(card);
  });
}
