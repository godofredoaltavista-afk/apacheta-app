/* =============================================
   APACHETA — CONFIG PRESETS
   Exportar / importar / mergear configuraciones completas.
   Preset = { tweaks, colores, copyOverrides, modoActual, fontScale, label }
   Share via ?preset=base64(json) en URL.
   ============================================= */

import { getUser, saveUser, applyUserColors } from '../main.js';

const PRESETS_KEY = 'apacheta_presets';

export function exportCurrent(label = '') {
  const user = getUser();
  const tweaks = JSON.parse(localStorage.getItem('apacheta_tweaks') || '{}');
  const preset = {
    label: label || `Preset ${new Date().toLocaleDateString('es-AR')}`,
    ts: Date.now(),
    colores:        user.colores || ['#A8E6E0', '#F4C2C2', '#FFE44D'],
    modoActual:     user.modoActual || 'manana',
    copyOverrides:  user.copyOverrides || {},
    tweaks,
    fontScale:      tweaks.fontScale || 1,
  };
  return preset;
}

export function getPresets() {
  try { return JSON.parse(localStorage.getItem(PRESETS_KEY) || '[]'); }
  catch { return []; }
}

export function savePreset(preset) {
  const presets = getPresets();
  presets.unshift(preset);
  if (presets.length > 20) presets.splice(20);
  localStorage.setItem(PRESETS_KEY, JSON.stringify(presets));
}

export function deletePreset(idx) {
  const presets = getPresets();
  presets.splice(idx, 1);
  localStorage.setItem(PRESETS_KEY, JSON.stringify(presets));
}

export function importPreset(preset) {
  if (!preset) return false;
  const user = getUser();
  const updates = {};
  if (preset.colores) {
    updates.colores = preset.colores;
    applyUserColors(preset.colores);
  }
  if (preset.modoActual) updates.modoActual = preset.modoActual;
  if (preset.copyOverrides) updates.copyOverrides = { ...user.copyOverrides, ...preset.copyOverrides };
  saveUser(updates);

  if (preset.tweaks) {
    const existing = JSON.parse(localStorage.getItem('apacheta_tweaks') || '{}');
    localStorage.setItem('apacheta_tweaks', JSON.stringify({ ...existing, ...preset.tweaks }));
  }
  window.dispatchEvent(new CustomEvent('apacheta:presetApplied', { detail: preset }));
  return true;
}

export function mergePresets(presets, strategy = { colores: 0, copys: 1, modo: 0 }) {
  if (!presets.length) return null;
  const merged = {
    label: `Merge · ${presets.map(p => p.label).join(' + ')}`,
    ts: Date.now(),
    colores:       presets[strategy.colores]?.colores,
    modoActual:    presets[strategy.modo]?.modoActual,
    copyOverrides: {},
    tweaks:        presets[strategy.colores]?.tweaks || {},
    fontScale:     presets[strategy.colores]?.fontScale || 1,
  };
  presets.forEach(p => {
    merged.copyOverrides = { ...merged.copyOverrides, ...(p.copyOverrides || {}) };
  });
  if (strategy.copys !== undefined && presets[strategy.copys]) {
    merged.copyOverrides = { ...merged.copyOverrides, ...presets[strategy.copys].copyOverrides };
  }
  return merged;
}

export function presetToURL(preset) {
  try {
    const b64 = btoa(encodeURIComponent(JSON.stringify(preset)));
    const url = new URL(window.location.href);
    url.searchParams.set('preset', b64);
    return url.toString();
  } catch { return null; }
}

export function presetFromURL() {
  const url = new URL(window.location.href);
  const raw = url.searchParams.get('preset');
  if (!raw) return null;
  try { return JSON.parse(decodeURIComponent(atob(raw))); }
  catch { return null; }
}

export function initPresetsFromURL() {
  const preset = presetFromURL();
  if (preset) {
    importPreset(preset);
    const url = new URL(window.location.href);
    url.searchParams.delete('preset');
    window.history.replaceState({}, '', url.toString());
    console.log('[presets] Preset aplicado desde URL:', preset.label);
  }
}

/* ── UI Panel de Presets en EDIT VIEWER ─── */
export function initPresetsUI() {
  const sheet = document.getElementById('tweaks-sheet');
  if (!sheet) return;

  // Agregar tab PRESETS al tweaks-panel
  const tabsEl = sheet.querySelector('.tweaks-color-tabs');
  if (!tabsEl) return;

  // Inyectar sección PRESETS al final del sheet
  const presetsSection = document.createElement('div');
  presetsSection.className = 'tweaks-row tweaks-presets-section';
  presetsSection.id = 'tweaks-presets-section';
  presetsSection.innerHTML = `
    <div class="tweaks-presets-header">
      <p class="tweaks-label">PRESETS</p>
      <button class="tw-btn tw-btn--sm" id="preset-save-btn">+ guardar actual</button>
    </div>
    <div class="tweaks-presets-list" id="tweaks-presets-list"></div>
    <button class="tw-btn tw-btn--sm" id="preset-copy-url-btn" style="width:100%;margin-top:6px;">⇗ copiar URL compartible</button>
  `;
  sheet.appendChild(presetsSection);

  renderPresetsList();

  document.getElementById('preset-save-btn')?.addEventListener('click', () => {
    const label = prompt('Nombre del preset:') || '';
    const preset = exportCurrent(label);
    savePreset(preset);
    renderPresetsList();
    showPresetToast('✦ preset guardado');
  });

  document.getElementById('preset-copy-url-btn')?.addEventListener('click', () => {
    const preset = exportCurrent('URL preset');
    const url = presetToURL(preset);
    if (url) {
      navigator.clipboard.writeText(url).then(() => showPresetToast('⇗ URL copiada'));
    }
  });
}

function renderPresetsList() {
  const list = document.getElementById('tweaks-presets-list');
  if (!list) return;
  const presets = getPresets();
  if (!presets.length) {
    list.innerHTML = '<p class="tweaks-presets-empty">sin presets · guardá tu primera config</p>';
    return;
  }
  list.innerHTML = presets.map((p, i) => `
    <div class="tweaks-preset-row">
      <span class="tweaks-preset-label">${p.label}</span>
      <div class="tweaks-preset-actions">
        <button class="tw-btn tw-btn--xs preset-apply" data-idx="${i}">aplicar</button>
        <button class="tw-btn tw-btn--xs preset-del" data-idx="${i}" style="color:rgba(255,80,80,0.6)">×</button>
      </div>
    </div>
  `).join('');

  list.querySelectorAll('.preset-apply').forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = parseInt(btn.dataset.idx, 10);
      importPreset(presets[idx]);
      showPresetToast(`✦ "${presets[idx].label}" aplicado`);
    });
  });
  list.querySelectorAll('.preset-del').forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = parseInt(btn.dataset.idx, 10);
      deletePreset(idx);
      renderPresetsList();
    });
  });
}

function showPresetToast(msg) {
  const t = document.createElement('div');
  t.className = 'oracle-toast';
  t.textContent = msg;
  document.body.appendChild(t);
  setTimeout(() => t.classList.add('is-in'), 20);
  setTimeout(() => { t.classList.remove('is-in'); setTimeout(() => t.remove(), 300); }, 1800);
}
