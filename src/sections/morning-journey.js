/* =============================================
   APACHETA — MORNING JOURNEY
   Diario de gratitud diario · estilo Calm
   ============================================= */

const DAYS_ES  = ['Domingo','Lunes','Martes','Miércoles','Jueves','Viernes','Sábado'];
const MONTHS_ES = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];

export function initMorningJourney() {
  const section    = document.getElementById('morning-journey');
  const dayEl      = document.getElementById('morning-day');
  const dateFullEl = document.getElementById('morning-date-full');
  const prevBtn    = document.getElementById('morning-prev');
  const nextBtn    = document.getElementById('morning-next');
  const saveBtn    = document.getElementById('morning-save');
  const fields     = section?.querySelectorAll('.morning-field');

  if (!section) return;

  // ── State ─────────────────────────────────────
  let currentOffset = 0; // 0 = today, -1 = yesterday, etc.
  const today = new Date();

  function getDateForOffset(offset) {
    const d = new Date(today);
    d.setDate(d.getDate() + offset);
    return d;
  }

  function dateKey(date) {
    return `morning_${date.getFullYear()}_${date.getMonth()}_${date.getDate()}`;
  }

  // ── Render ────────────────────────────────────
  function render() {
    const date = getDateForOffset(currentOffset);

    if (dayEl)      dayEl.textContent     = DAYS_ES[date.getDay()];
    if (dateFullEl) dateFullEl.textContent = `${date.getDate()} de ${MONTHS_ES[date.getMonth()]}, ${date.getFullYear()}`;

    // Disable next if we're already at today
    if (nextBtn) nextBtn.disabled = currentOffset >= 0;
    if (nextBtn) nextBtn.style.opacity = currentOffset >= 0 ? '0.3' : '1';

    // Load saved data
    const key  = dateKey(date);
    const data = JSON.parse(localStorage.getItem(key) || '{}');

    fields?.forEach(f => {
      const k = f.dataset.key;
      f.value = data[k] || '';
    });
  }

  // ── Auto-save on field change ──────────────────
  fields?.forEach(f => {
    f.addEventListener('input', saveCurrentDay);
  });

  function saveCurrentDay() {
    const date = getDateForOffset(currentOffset);
    const key  = dateKey(date);
    const data = {};
    fields?.forEach(f => { data[f.dataset.key] = f.value; });
    localStorage.setItem(key, JSON.stringify(data));
  }

  // ── Save button feedback ───────────────────────
  saveBtn?.addEventListener('click', () => {
    saveCurrentDay();
    saveBtn.textContent = '✦ Guardado';
    saveBtn.style.background = 'var(--color-personal-1)';
    setTimeout(() => {
      saveBtn.textContent = 'Guardar día ✦';
      saveBtn.style.background = '';
    }, 1800);
    if (navigator.vibrate) navigator.vibrate([30, 20, 30]);
  });

  // ── Navigation ────────────────────────────────
  prevBtn?.addEventListener('click', () => {
    currentOffset--;
    animateTransition('left');
    render();
  });
  nextBtn?.addEventListener('click', () => {
    if (currentOffset >= 0) return;
    currentOffset++;
    animateTransition('right');
    render();
  });

  function animateTransition(dir) {
    const prompts = section.querySelector('.morning-prompts');
    if (!prompts) return;
    const from = dir === 'left' ? '30px' : '-30px';
    prompts.style.transition = 'none';
    prompts.style.transform  = `translateX(${from})`;
    prompts.style.opacity    = '0';
    requestAnimationFrame(() => {
      prompts.style.transition = 'transform 0.3s ease, opacity 0.3s ease';
      prompts.style.transform  = 'translateX(0)';
      prompts.style.opacity    = '1';
    });
  }

  render();
}
