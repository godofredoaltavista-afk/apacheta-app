/* =============================================
   APACHETA — VENTANA 2: HISTORIAL DE COPYS
   Panel con todas las versiones previas + rollback.
   Se monta como tab en el panel Ventana 2 existente.
   ============================================= */

import { getUser } from '../main.js';
import { rollback } from '../core/copy-oracle.js';

export function initVentana2Historial() {
  // Agregar botón "historial" al panel existente de feedback-bus
  const panel = document.getElementById('v2-panel');
  if (!panel) return;

  // Agregar tab de historial al header
  const header = panel.querySelector('.v2-header');
  if (!header) return;

  const tabBar = document.createElement('div');
  tabBar.className = 'v2-tabs';
  tabBar.innerHTML = `
    <button class="v2-tab is-active" data-tab="bus">// FEEDBACK BUS</button>
    <button class="v2-tab" data-tab="historial">// HISTORIAL COPYS</button>
  `;
  header.appendChild(tabBar);

  // Panel de historial (oculto por defecto)
  const historialPanel = document.createElement('div');
  historialPanel.className = 'v2-historial-panel';
  historialPanel.id = 'v2-historial-panel';
  historialPanel.style.display = 'none';
  historialPanel.innerHTML = `<div class="v2-historial-list" id="v2-historial-list"></div>`;

  const busTimeline = panel.querySelector('.v2-timeline, #v2-timeline, .v2-events');
  const busContent  = panel.querySelector('.v2-content') || panel.querySelector('.v2-panel__body');

  panel.appendChild(historialPanel);

  // Tab switching
  tabBar.querySelectorAll('.v2-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      tabBar.querySelectorAll('.v2-tab').forEach(t => t.classList.remove('is-active'));
      tab.classList.add('is-active');
      const which = tab.dataset.tab;
      if (which === 'historial') {
        if (busContent) busContent.style.display = 'none';
        historialPanel.style.display = 'block';
        renderHistorial();
      } else {
        if (busContent) busContent.style.display = '';
        historialPanel.style.display = 'none';
      }
    });
  });
}

function renderHistorial() {
  const list = document.getElementById('v2-historial-list');
  if (!list) return;

  const user = getUser();
  const history = [...(user.copyHistory || [])].reverse(); // más reciente primero

  if (!history.length) {
    list.innerHTML = `
      <div class="v2-hist-empty">
        todavía no hay versiones · regenerá copys con ✦
      </div>
    `;
    return;
  }

  list.innerHTML = history.map((entry, idx) => {
    const realIdx = (user.copyHistory?.length || 0) - 1 - idx;
    const fecha = new Date(entry.ts).toLocaleString('es-AR', {
      day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
    });
    const source = entry.source || 'mock';
    const keysChanged = Object.keys(entry.after || {}).length;
    const isSingle = !!entry.single;
    const label = isSingle
      ? `✦ single · ${entry.single}`
      : source === 'rollback'
        ? `↩ rollback`
        : `✦ ${keysChanged} copys · ${source}`;

    // Mostrar diff de hasta 3 keys
    const afterEntries = Object.entries(entry.after || {}).slice(0, 3);
    const diffHtml = afterEntries.map(([k, v]) => {
      const before = entry.before?.[k];
      const vClean = (v || '').replace(/<br\s*\/?>/gi, ' / ');
      const bClean = (before || '').replace(/<br\s*\/?>/gi, ' / ');
      return `
        <div class="v2-hist-diff-row">
          <span class="v2-hist-key">${k}</span>
          ${before && before !== v ? `<span class="v2-hist-before">${bClean.slice(0,40)}</span>` : ''}
          <span class="v2-hist-after">${vClean.slice(0,50)}</span>
        </div>
      `;
    }).join('');

    return `
      <div class="v2-hist-entry" data-idx="${realIdx}">
        <div class="v2-hist-header">
          <span class="v2-hist-label">${label}</span>
          <span class="v2-hist-fecha">${fecha}</span>
        </div>
        ${entry.intent ? `<div class="v2-hist-intent">"${entry.intent}"</div>` : ''}
        <div class="v2-hist-diff">${diffHtml}</div>
        ${keysChanged > 3 ? `<div class="v2-hist-more">+${keysChanged - 3} más</div>` : ''}
        <button class="v2-hist-rollback-btn" data-idx="${realIdx}">
          ↩ volver a esta versión
        </button>
      </div>
    `;
  }).join('');

  list.querySelectorAll('.v2-hist-rollback-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = parseInt(btn.dataset.idx, 10);
      const ok = rollback(idx);
      if (ok) {
        showRollbackToast(`↩ versión restaurada`);
        renderHistorial();
      }
    });
  });
}

function showRollbackToast(msg) {
  const t = document.createElement('div');
  t.className = 'oracle-toast';
  t.textContent = msg;
  document.body.appendChild(t);
  setTimeout(() => t.classList.add('is-in'), 20);
  setTimeout(() => { t.classList.remove('is-in'); setTimeout(() => t.remove(), 300); }, 2000);
}
