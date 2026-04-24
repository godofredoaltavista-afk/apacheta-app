/* =============================================
   APACHETA — ORACLE MODAL
   Modal de 3 variantes para una key del registry.
   Chips de intent + input libre + apply a DOM + persist.
   ============================================= */

import { askSingle, applySingle } from '../core/copy-oracle.js';
import { COPY_REGISTRY } from '../data/copy-registry.js';

const DEFAULT_CHIPS = [
  'tarde', 'voluntad', 'filosofía', 'minimalista',
  'barroco', 'patagonia', 'montaña', 'atardecer',
  'tech', 'jazz', 'editorial', 'ritual',
];

let modalEl = null;
let selectedChips = new Set();
let currentKey = null;

function ensureModal() {
  if (modalEl) return modalEl;

  modalEl = document.createElement('div');
  modalEl.className = 'oracle-modal';
  modalEl.id = 'oracle-modal';
  modalEl.innerHTML = `
    <div class="oracle-modal__sheet" role="dialog" aria-label="Oracle">
      <div class="oracle-modal__kicker">// ORACLE · COPY GEN</div>
      <h2 class="oracle-modal__title" id="oracle-modal-title">—</h2>
      <div class="oracle-modal__key" id="oracle-modal-key">—</div>

      <input type="text" class="oracle-modal__input" id="oracle-intent-input"
             placeholder="hoy quiero relacionar…  (ej: electricidad con tela y patagonia)">

      <div class="oracle-modal__chips" id="oracle-chips"></div>

      <div class="oracle-modal__variants" id="oracle-variants">
        <div class="oracle-modal__loading">generando variantes</div>
      </div>

      <div class="oracle-modal__actions">
        <button class="oracle-modal__btn" id="oracle-cancel">cancelar</button>
        <button class="oracle-modal__btn oracle-modal__btn--primary" id="oracle-refresh">otras 3</button>
      </div>
    </div>
  `;
  document.body.appendChild(modalEl);

  modalEl.addEventListener('click', (e) => {
    if (e.target === modalEl) closeModal();
  });
  modalEl.querySelector('#oracle-cancel').addEventListener('click', closeModal);
  modalEl.querySelector('#oracle-refresh').addEventListener('click', () => {
    if (currentKey) loadVariants(currentKey);
  });

  // Render chips
  const chipsEl = modalEl.querySelector('#oracle-chips');
  chipsEl.innerHTML = DEFAULT_CHIPS.map(c =>
    `<span class="oracle-chip" data-chip="${c}">${c}</span>`
  ).join('');
  chipsEl.querySelectorAll('.oracle-chip').forEach(el => {
    el.addEventListener('click', () => {
      const c = el.dataset.chip;
      if (selectedChips.has(c)) { selectedChips.delete(c); el.classList.remove('is-active'); }
      else { selectedChips.add(c); el.classList.add('is-active'); }
      if (currentKey) loadVariants(currentKey);
    });
  });

  return modalEl;
}

function buildIntent() {
  const input = modalEl.querySelector('#oracle-intent-input')?.value.trim() || '';
  const chips = [...selectedChips].join(', ');
  return [input, chips].filter(Boolean).join(' · ');
}

async function loadVariants(key) {
  const variantsEl = modalEl.querySelector('#oracle-variants');
  variantsEl.innerHTML = `<div class="oracle-modal__loading">generando variantes</div>`;

  const variants = await askSingle(key, { intent: buildIntent() });

  if (!variants.length) {
    variantsEl.innerHTML = `
      <div class="oracle-modal__loading" style="opacity:0.6">
        no hay variantes para esta key todavía · agregá al mock o conectá NotebookLM
      </div>
    `;
    return;
  }

  variantsEl.innerHTML = variants.map((v, i) =>
    `<button class="oracle-variant" data-variant-idx="${i}">${v}</button>`
  ).join('');

  variantsEl.querySelectorAll('.oracle-variant').forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = parseInt(btn.dataset.variantIdx, 10);
      applySingle(key, variants[idx]);
      closeModal();
      showQuickToast('✦ aplicado');
    });
  });
}

export function openOracleModal(key) {
  ensureModal();
  currentKey = key;
  selectedChips = new Set();

  const entry = COPY_REGISTRY[key];
  const title = entry ? (entry.default || key).replace(/<br\s*\/?>/g, ' / ') : key;

  modalEl.querySelector('#oracle-modal-title').textContent = title;
  modalEl.querySelector('#oracle-modal-key').textContent = key;
  modalEl.querySelectorAll('.oracle-chip').forEach(el => el.classList.remove('is-active'));
  const input = modalEl.querySelector('#oracle-intent-input');
  if (input) input.value = '';

  modalEl.classList.add('is-open');
  loadVariants(key);
}

export function closeModal() {
  if (modalEl) modalEl.classList.remove('is-open');
  currentKey = null;
}

function showQuickToast(msg) {
  const t = document.createElement('div');
  t.className = 'oracle-toast';
  t.textContent = msg;
  document.body.appendChild(t);
  setTimeout(() => t.classList.add('is-in'), 20);
  setTimeout(() => { t.classList.remove('is-in'); setTimeout(() => t.remove(), 300); }, 1600);
}

export function initOracleButtons() {
  // Inyecta botones ✦ junto a todos los elementos mapeados en el registry
  Object.entries(COPY_REGISTRY).forEach(([key, entry]) => {
    if (!entry.selector) return;
    const els = document.querySelectorAll(entry.selector);
    els.forEach(el => {
      if (el.dataset.oracleHooked === '1') return;
      el.dataset.oracleHooked = '1';

      // El botón va como sibling si el elemento es inline
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'oracle-btn';
      btn.setAttribute('aria-label', `Regenerar copy de ${key}`);
      btn.textContent = '✦';
      btn.addEventListener('click', (ev) => {
        ev.stopPropagation();
        ev.preventDefault();
        openOracleModal(key);
      });
      if (el.parentElement) el.parentElement.insertBefore(btn, el.nextSibling);
    });
  });
}
