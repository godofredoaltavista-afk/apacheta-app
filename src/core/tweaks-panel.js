/* =============================================
   APACHETA — TWEAKS PANEL
   Panel flotante persistente de personalización.
   Colores · Fuente · Tamaño · Layout · Modo
   Estilo referencia: Every Drop / raytranscribes
   ============================================= */

import { getUser, saveUser } from '../main.js';

const STORAGE_KEY = 'apacheta_tweaks';

function loadTweaks() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}'); }
  catch { return {}; }
}

function saveTweaks(data) {
  const current = loadTweaks();
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...current, ...data }));
}

export function initTweaksPanel() {
  const panel   = document.getElementById('tweaks-panel');
  const trigger = document.getElementById('tweaks-trigger');
  const sheet   = document.getElementById('tweaks-sheet');
  if (!panel || !trigger || !sheet) return;

  let open = false;

  trigger.addEventListener('click', () => {
    open = !open;
    sheet.classList.toggle('is-open', open);
    trigger.classList.toggle('is-open', open);
  });

  // Close on outside tap
  document.addEventListener('pointerdown', e => {
    if (open && !panel.contains(e.target)) {
      open = false;
      sheet.classList.remove('is-open');
      trigger.classList.remove('is-open');
    }
  });

  // ─── Apply saved tweaks on load ───────────
  const saved = loadTweaks();
  if (saved.accent)  applyAccent(saved.accent);
  if (saved.titles)  applyTitles(saved.titles);
  if (saved.bgColor) applyBg(saved.bgColor);
  if (saved.font)    applyFont(saved.font);
  if (saved.size)    applySize(saved.size);
  if (saved.layout)  applyLayout(saved.layout);
  if (saved.mode)    applyMode(saved.mode);
  markActive('tweaks-fonts',  '[data-font]',   saved.font,   'data-font');
  markActive('tweaks-sizes',  '[data-size]',   String(saved.size), 'data-size');
  markActive('tweaks-layout', '[data-layout]', saved.layout, 'data-layout');
  markActive('tweaks-mode',   '[data-mode]',   saved.mode,   'data-mode');

  // ─── Color tabs (accent / titles / bg) ───
  let activeColorTab = 'accent';
  document.getElementById('tweaks-color-tabs')?.querySelectorAll('.tw-ctab').forEach(tab => {
    tab.addEventListener('click', () => {
      activeColorTab = tab.dataset.ctab;
      document.getElementById('tweaks-color-tabs')?.querySelectorAll('.tw-ctab').forEach(t =>
        t.classList.toggle('is-active', t.dataset.ctab === activeColorTab)
      );
      // Marcar el color activo del tab seleccionado
      const current = saved[activeColorTab] || saved.accent;
      markActive('tweaks-swatches', '[data-color]', current, 'data-color');
    });
  });

  // ─── Color swatches ───────────────────────
  document.getElementById('tweaks-swatches')?.querySelectorAll('.tw-sw').forEach(btn => {
    btn.addEventListener('click', () => {
      if (btn.dataset.color === 'custom') {
        document.getElementById('tweaks-color-custom')?.click();
        return;
      }
      const c = btn.dataset.color;
      applyColorToTab(activeColorTab, c);
      markActive('tweaks-swatches', '[data-color]', c, 'data-color');
    });
  });

  document.getElementById('tweaks-color-custom')?.addEventListener('input', e => {
    applyColorToTab(activeColorTab, e.target.value);
  });

  function applyColorToTab(tab, color) {
    if (tab === 'accent') {
      applyAccent(color);
      saveTweaks({ accent: color });
      const user = getUser();
      const cols = user.colores || ['#A8E6E0', '#F4C2C2', '#FFE44D'];
      cols[0] = color;
      saveUser({ colores: cols });
    } else if (tab === 'titles') {
      applyTitles(color);
      saveTweaks({ titles: color });
    } else if (tab === 'bg') {
      applyBg(color);
      saveTweaks({ bgColor: color });
    }
    window.feedbackBus?.push({ type: 'color-changed', payload: { tab, color } });
  }

  // ─── Font ─────────────────────────────────
  document.getElementById('tweaks-fonts')?.querySelectorAll('.tw-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      applyFont(btn.dataset.font);
      saveTweaks({ font: btn.dataset.font });
      markActive('tweaks-fonts', '[data-font]', btn.dataset.font, 'data-font');
    });
  });

  // ─── Size ─────────────────────────────────
  document.getElementById('tweaks-sizes')?.querySelectorAll('.tw-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const s = parseFloat(btn.dataset.size);
      applySize(s);
      saveTweaks({ size: s });
      markActive('tweaks-sizes', '[data-size]', btn.dataset.size, 'data-size');
    });
  });

  // ─── Layout ───────────────────────────────
  document.getElementById('tweaks-layout')?.querySelectorAll('.tw-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      applyLayout(btn.dataset.layout);
      saveTweaks({ layout: btn.dataset.layout });
      markActive('tweaks-layout', '[data-layout]', btn.dataset.layout, 'data-layout');
    });
  });

  // ─── Mode ─────────────────────────────────
  document.getElementById('tweaks-mode')?.querySelectorAll('.tw-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      applyMode(btn.dataset.mode);
      saveTweaks({ mode: btn.dataset.mode });
      markActive('tweaks-mode', '[data-mode]', btn.dataset.mode, 'data-mode');
      window.feedbackBus?.push({ type: 'mode-changed', payload: { mode: btn.dataset.mode } });
    });
  });
}

// ─── Applicators ─────────────────────────────

function applyAccent(color) {
  document.documentElement.style.setProperty('--tweaks-accent', color);
  document.documentElement.style.setProperty('--color-personal-1', color);
}

function applyTitles(color) {
  document.documentElement.style.setProperty('--tweaks-titles', color);
  document.querySelectorAll([
    'h1', 'h2', 'h3',
    '.t-title', '.section-title', '.section__title',
    '.wisdom__title-big', '.wisdom__title-bottom',
    '.section__eyebrow', '.section-subtitle',
    '.mg-visor-titulo', '.v2-panel__title',
  ].join(', ')).forEach(el => {
    el.style.color = color;
  });
}

function applyBg(color) {
  document.documentElement.style.setProperty('--tweaks-bg', color);
  document.documentElement.style.setProperty('--bg-primary', color);
  document.body.style.background = color;
}

function applyFont(fontValue) {
  document.documentElement.style.setProperty('--font-display', fontValue);
}

function applySize(scale) {
  document.documentElement.style.setProperty('--tweaks-text-scale', String(scale));
  document.documentElement.style.fontSize = (16 * scale) + 'px';
}

function applyLayout(layout) {
  document.body.classList.remove('layout-editorial', 'layout-compact', 'layout-outline');
  document.body.classList.add(`layout-${layout}`);
}

function applyMode(mode) {
  document.body.classList.remove('mode-light', 'mode-dark', 'mode-hallucination');
  document.body.classList.add(`mode-${mode}`);
}

function markActive(containerId, selector, value, attr) {
  if (!value) return;
  const container = document.getElementById(containerId);
  if (!container) return;
  container.querySelectorAll(selector).forEach(el => {
    el.classList.toggle('is-active', el.getAttribute(attr) === String(value));
  });
}
