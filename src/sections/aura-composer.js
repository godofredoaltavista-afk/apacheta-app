/* =============================================
   APACHETA — AURA COMPOSER
   MIDI sliders → Canvas aura en tiempo real
   ============================================= */

import { AuraStore } from '../state/AuraStore.js';

const PARAMS = [
  { id: 'calma',       label: 'calma',       icon: '〜', color: '#A8E6E0', default: 60 },
  { id: 'foco',        label: 'foco',        icon: '◎', color: '#F5D89A', default: 70 },
  { id: 'creatividad', label: 'creatividad', icon: '✦', color: '#F4C2C2', default: 55 },
  { id: 'energia',     label: 'energía',     icon: '↑', color: '#FFE44D', default: 65 },
  { id: 'intuicion',   label: 'intuición',   icon: '⌇', color: '#D4C5E8', default: 50 },
];

let auraValues = {};
PARAMS.forEach(p => { auraValues[p.id] = p.default; });

export function initAuraComposer() {
  const section     = document.getElementById('aura-composer');
  const slidersEl   = document.getElementById('aura-sliders');
  const canvas      = document.getElementById('aura-canvas');
  const saveBtn     = document.getElementById('aura-save');
  const dominEl     = document.getElementById('aura-dominant');

  if (!section) return;

  // ─── Canvas aura ──────────────────────────
  let ctx, W, H, t = 0;
  if (canvas) {
    ctx = canvas.getContext('2d');
    function resizeCanvas() {
      W = canvas.width  = canvas.offsetWidth  || 360;
      H = canvas.height = canvas.offsetHeight || 300;
    }
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    drawAura();
  }

  function drawAura() {
    if (!ctx) return;
    requestAnimationFrame(drawAura);
    t += 0.006;
    ctx.clearRect(0, 0, W, H);

    const cx = W / 2, cy = H / 2;

    PARAMS.forEach((p, i) => {
      const val    = auraValues[p.id] / 100;
      // Orbit distance scales with value — high value = fills the screen
      const angle  = (i / PARAMS.length) * Math.PI * 2 + t * (0.4 + i * 0.08);
      const orbitR = val * W * 0.35;
      const ox     = cx + Math.cos(angle) * orbitR;
      const oy     = cy + Math.sin(angle) * orbitR;
      // Nebula radius is directly proportional to value
      const radius = W * (0.15 + val * 0.5) * (0.9 + Math.sin(t * 1.5 + i) * 0.1);

      const grad = ctx.createRadialGradient(ox, oy, 0, ox, oy, radius);
      grad.addColorStop(0, p.color + 'CC');
      grad.addColorStop(0.4, p.color + '66');
      grad.addColorStop(1, p.color + '00');

      ctx.globalCompositeOperation = 'screen';
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, W, H);
    });

    // Centro brillante pulsante
    ctx.globalCompositeOperation = 'source-over';
    const centerR = 20 + 15 * Math.sin(t * 2);
    const centerGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, centerR);
    centerGrad.addColorStop(0, 'rgba(255,255,255,0.7)');
    centerGrad.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = centerGrad;
    ctx.beginPath();
    ctx.arc(cx, cy, centerR, 0, Math.PI * 2);
    ctx.fill();

    // Etiqueta dominante
    updateDominant();
  }

  function updateDominant() {
    if (!dominEl) return;
    const top = Object.entries(auraValues)
      .sort((a, b) => b[1] - a[1])[0];
    const param = PARAMS.find(p => p.id === top[0]);
    if (param) dominEl.textContent = `${param.icon} ${param.label}`;
  }

  // ─── Sliders MIDI style ────────────────────
  if (slidersEl) {
    PARAMS.forEach(p => {
      const wrap = document.createElement('div');
      wrap.className = 'aura-slider-wrap';

      const label = document.createElement('div');
      label.className = 'aura-slider-label';
      label.innerHTML = `<span class="aura-slider-icon" style="color:${p.color}">${p.icon}</span><span>${p.label}</span><span class="aura-slider-val" id="aura-val-${p.id}">${p.default}</span>`;

      // Track + thumb custom
      const trackWrap = document.createElement('div');
      trackWrap.className = 'aura-slider-track-wrap';

      const track = document.createElement('div');
      track.className = 'aura-slider-track';

      const fill = document.createElement('div');
      fill.className = 'aura-slider-fill';
      fill.id = `aura-fill-${p.id}`;
      fill.style.width  = `${p.default}%`;
      fill.style.background = p.color;

      const thumb = document.createElement('div');
      thumb.className = 'aura-slider-thumb';
      thumb.style.left = `${p.default}%`;
      thumb.style.borderColor = p.color;

      track.appendChild(fill);
      track.appendChild(thumb);
      trackWrap.appendChild(track);

      // Input range invisible por encima para interacción
      const input = document.createElement('input');
      input.type = 'range';
      input.min  = '0';
      input.max  = '100';
      input.value = String(p.default);
      input.className = 'aura-slider-input';

      input.addEventListener('input', () => {
        const v = parseInt(input.value);
        auraValues[p.id] = v;

        fill.style.width  = `${v}%`;
        thumb.style.left  = `${v}%`;

        const valEl = document.getElementById(`aura-val-${p.id}`);
        if (valEl) valEl.textContent = v;
      });

      trackWrap.appendChild(input);
      wrap.appendChild(label);
      wrap.appendChild(trackWrap);
      slidersEl.appendChild(wrap);
    });
  }

  // ─── Guardar aura ──────────────────────────
  saveBtn?.addEventListener('click', () => {
    try {
      const user = JSON.parse(localStorage.getItem('apacheta_user') || '{}');
      user.aura  = { ...auraValues, savedAt: Date.now() };

      // Save to aura history (max 30 days)
      const today    = new Date().toISOString().split('T')[0];
      const history  = user.auraHistory || [];
      const snapshot = { fecha: today, colores: user.colores || [], aura: { ...auraValues } };
      const todayIdx = history.findIndex(h => h.fecha === today);
      if (todayIdx >= 0) { history[todayIdx] = snapshot; }
      else { history.push(snapshot); }
      if (history.length > 30) history.splice(0, history.length - 30);
      user.auraHistory = history;
      localStorage.setItem('apacheta_user', JSON.stringify(user));

      // Sync a MongoDB en background (additive, no bloquea)
      AuraStore.save({ ...auraValues, colores: user.colores || [] });

      // Notify dashboard to refresh
      window.dispatchEvent(new CustomEvent('apacheta:auraSaved', { detail: snapshot }));

      // Feedback bus
      window.feedbackBus?.push({
        type: 'aura-saved',
        payload: { fecha: today, aura: { ...auraValues } }
      });

      saveBtn.textContent = '✦ Aura guardada';
      saveBtn.style.background = 'var(--color-personal-1)';
      saveBtn.style.color      = 'var(--text-primary)';
      setTimeout(() => {
        saveBtn.textContent      = 'Guardar mi aura';
        saveBtn.style.background = '';
        saveBtn.style.color      = '';
      }, 2000);
    } catch(e) { console.warn(e); }
  });
}
