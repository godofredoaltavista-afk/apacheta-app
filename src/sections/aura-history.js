/* =============================================
   APACHETA — AURA HISTORY
   Timeline horizontal de auras guardadas
   Estilo "How We Feel"
   ============================================= */

const DAYS_ES   = ['Dom','Lun','Mar','Mié','Jue','Vie','Sáb'];
const MONTHS_ES = ['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic'];

const PARAM_LABELS = {
  calma:       { icon: '〜', color: '#A8E6E0' },
  foco:        { icon: '◎', color: '#F5D89A' },
  creatividad: { icon: '✦', color: '#F4C2C2' },
  energia:     { icon: '↑', color: '#FFE44D' },
  intuicion:   { icon: '⌇', color: '#D4C5E8' },
};

export function initAuraHistory() {
  const section  = document.getElementById('aura-history');
  const scroll   = document.getElementById('aura-history-scroll');
  const emptyEl  = document.getElementById('aura-history-empty');

  if (!section || !scroll) return;

  function loadHistory() {
    // Scan localStorage for any aura saves across all days
    const entries = [];

    // Current aura in apacheta_user
    try {
      const user = JSON.parse(localStorage.getItem('apacheta_user') || '{}');
      if (user.aura && user.aura.savedAt) {
        entries.push({ ...user.aura, date: new Date(user.aura.savedAt) });
      }
    } catch(e) {}

    // Also look for per-day saves (future aura_YYYY_MM_DD format)
    for (let key in localStorage) {
      if (!key.startsWith('aura_')) continue;
      try {
        const d = JSON.parse(localStorage.getItem(key));
        if (d && d.savedAt) entries.push({ ...d, date: new Date(d.savedAt) });
      } catch(e) {}
    }

    // Deduplicate by date-day and sort newest first
    const seen = new Set();
    const unique = entries.filter(e => {
      const k = `${e.date.getFullYear()}_${e.date.getMonth()}_${e.date.getDate()}`;
      if (seen.has(k)) return false;
      seen.add(k);
      return true;
    }).sort((a, b) => b.date - a.date);

    return unique;
  }

  function getDominant(aura) {
    let best = { id: 'calma', val: 0 };
    Object.entries(aura).forEach(([k, v]) => {
      if (PARAM_LABELS[k] && v > best.val) best = { id: k, val: v };
    });
    return best.id;
  }

  function buildMiniCanvas(aura) {
    const canvas = document.createElement('canvas');
    canvas.width  = 120;
    canvas.height = 80;
    const ctx = canvas.getContext('2d');
    const cx = 60, cy = 40;

    Object.entries(PARAM_LABELS).forEach(([key, p], i) => {
      const val   = (aura[key] || 50) / 100;
      const angle = (i / 5) * Math.PI * 2;
      const r     = 25 + val * 20;
      const ox    = cx + Math.cos(angle) * r;
      const oy    = cy + Math.sin(angle) * r;
      const grad  = ctx.createRadialGradient(ox, oy, 0, ox, oy, 20 + val * 15);
      grad.addColorStop(0, p.color + 'BB');
      grad.addColorStop(1, p.color + '00');
      ctx.globalCompositeOperation = 'screen';
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 120, 80);
    });

    ctx.globalCompositeOperation = 'source-over';
    return canvas;
  }

  function render() {
    const entries = loadHistory();

    if (entries.length === 0) {
      if (emptyEl) emptyEl.style.display = 'block';
      return;
    }
    if (emptyEl) emptyEl.style.display = 'none';

    // Remove existing cards (not the empty message)
    scroll.querySelectorAll('.aura-day-card').forEach(c => c.remove());

    entries.forEach((entry, idx) => {
      const dom   = getDominant(entry);
      const domP  = PARAM_LABELS[dom];
      const date  = entry.date;
      const isToday = idx === 0;

      const card = document.createElement('div');
      card.className = 'aura-day-card';
      if (isToday) card.classList.add('aura-day-card--today');

      // Mini canvas
      const miniCanvas = buildMiniCanvas(entry);
      miniCanvas.className = 'aura-day-mini';

      // Date label
      const dateLabel = document.createElement('div');
      dateLabel.className = 'aura-day-date';
      dateLabel.innerHTML = `
        <span class="aura-day-weekday">${DAYS_ES[date.getDay()]}</span>
        <span class="aura-day-num">${date.getDate()}</span>
        <span class="aura-day-month">${MONTHS_ES[date.getMonth()]}</span>
      `;

      // Dominant energy
      const domLabel = document.createElement('div');
      domLabel.className = 'aura-day-dominant';
      domLabel.style.color = domP.color;
      domLabel.textContent = `${domP.icon} ${dom}`;

      card.appendChild(miniCanvas);
      card.appendChild(dateLabel);
      card.appendChild(domLabel);

      scroll.insertBefore(card, emptyEl);
    });

    // Fill empty days (last 7)
    const today = new Date();
    for (let d = 0; d < 7; d++) {
      const date = new Date(today);
      date.setDate(date.getDate() - d);
      const hasEntry = entries.some(e =>
        e.date.getDate() === date.getDate() &&
        e.date.getMonth() === date.getMonth() &&
        e.date.getFullYear() === date.getFullYear()
      );
      if (!hasEntry) {
        const ghost = document.createElement('div');
        ghost.className = 'aura-day-card aura-day-card--empty';
        ghost.innerHTML = `
          <div class="aura-day-empty-orb"></div>
          <div class="aura-day-date">
            <span class="aura-day-weekday">${DAYS_ES[date.getDay()]}</span>
            <span class="aura-day-num">${date.getDate()}</span>
            <span class="aura-day-month">${MONTHS_ES[date.getMonth()]}</span>
          </div>
          <div class="aura-day-dominant" style="color:var(--text-ghost);">—</div>
        `;
        scroll.insertBefore(ghost, emptyEl);
      }
    }
  }

  render();

  // Re-render when section becomes visible (picks up new saves)
  const observer = new IntersectionObserver(entries => {
    if (entries[0].isIntersecting) render();
  }, { threshold: 0.1 });
  observer.observe(section);

  // Drag scroll
  let isDragging = false, startX = 0, scrollLeft = 0;
  scroll.addEventListener('mousedown', e => {
    isDragging = true; startX = e.pageX - scroll.offsetLeft;
    scrollLeft = scroll.scrollLeft; scroll.style.cursor = 'grabbing';
  });
  scroll.addEventListener('mousemove', e => {
    if (!isDragging) return;
    e.preventDefault();
    scroll.scrollLeft = scrollLeft - (e.pageX - scroll.offsetLeft - startX) * 1.2;
  });
  scroll.addEventListener('mouseup',   () => { isDragging = false; scroll.style.cursor = 'grab'; });
  scroll.addEventListener('mouseleave',() => { isDragging = false; scroll.style.cursor = 'grab'; });
}
