/* =============================================
   APACHETA — COPY ORACLE
   Regenera copys + banners en base al feedback bus.
   Prioriza NotebookLM MCP (si hay auth); fallback al mock.
   Siempre guarda versión previa en copyHistory → rollback.
   ============================================= */

import { getUser, saveUser } from '../main.js';
import { feedbackBus } from './feedback-bus.js';
import { COPY_REGISTRY, getRegistryKeys, applyCopy, readCurrent } from '../data/copy-registry.js';
import { findByTags } from '../data/banner-registry.js';
import { mockAskSingle, mockRegenerateAll } from './copy-oracle-mock.js';
import { apiPost, deviceUserId } from '../api/client.js';

const HISTORY_MAX = 40;

function snapshotCurrentCopys() {
  const snap = {};
  getRegistryKeys().forEach(k => { snap[k] = readCurrent(k); });
  return snap;
}

function pushHistory(entry) {
  const user = getUser();
  const history = Array.isArray(user.copyHistory) ? user.copyHistory : [];
  history.push(entry);
  if (history.length > HISTORY_MAX) history.splice(0, history.length - HISTORY_MAX);
  saveUser({ copyHistory: history });
}

function applyBulk(copysMap) {
  let applied = 0;
  Object.entries(copysMap).forEach(([key, variant]) => {
    if (variant == null) return;
    if (applyCopy(key, variant)) applied++;
  });
  return applied;
}

export async function regenerateAll(opts = {}) {
  const { source = 'auto', intent = '' } = opts;
  const bus    = feedbackBus.read();
  const keys   = getRegistryKeys();

  const before = snapshotCurrentCopys();

  // 1. Intentar API backend /api/oracle (NotebookLM o fallback server-side)
  let result;
  try {
    if (source !== 'mock-only') {
      result = await apiPost('/api/oracle', { bus, keys, intent });
    }
  } catch (err) {
    console.warn('[copy-oracle] /api/oracle falló, usando mock local:', err.message);
  }

  // 2. Intentar MCP directo si la API no respondió
  if (!result?.copys) {
    try {
      if (window.apachetaMCPQuery && source !== 'mock-only') {
        result = await window.apachetaMCPQuery({ keys, bus, intent });
        if (result && result.copys) result.source = result.source || 'notebooklm';
      }
    } catch (err) {
      console.warn('[copy-oracle] MCP falló:', err);
    }
  }

  // 3. Fallback mock local
  if (!result || !result.copys) {
    result = mockRegenerateAll(bus, keys);
  }

  // Banners sugeridos según top tags
  const banners = findByTags(result.topTags || [], 5);

  // Aplicar al DOM
  const appliedCount = applyBulk(result.copys);

  // Guardar override persistente
  const user = getUser();
  const overrides = { ...(user.copyOverrides || {}), ...result.copys };
  saveUser({ copyOverrides: overrides });

  // Historial
  pushHistory({
    ts: Date.now(),
    source: result.source,
    intent,
    before,
    after: result.copys,
    topTags: result.topTags || [],
    banners: banners.map(b => b.path),
    busLen: bus.length,
  });

  feedbackBus.push({
    type: 'copy-regenerated',
    payload: { keys: appliedCount, source: result.source, tags: result.topTags || [] }
  });

  window.dispatchEvent(new CustomEvent('apacheta:copy:regenerated', {
    detail: { appliedCount, source: result.source, topTags: result.topTags, banners }
  }));

  return { appliedCount, source: result.source, topTags: result.topTags, banners };
}

export async function askSingle(key, opts = {}) {
  const { intent = '', useMock = false } = opts;
  let variants = [];

  try {
    if (window.apachetaMCPAskSingle && !useMock) {
      variants = await window.apachetaMCPAskSingle({ key, intent });
    }
  } catch (err) {
    console.warn('[copy-oracle:single] MCP falló:', err);
  }

  if (!variants || !variants.length) {
    variants = mockAskSingle(key, { intent });
  }

  return variants;
}

export function applySingle(key, variant) {
  const before = readCurrent(key);
  if (!applyCopy(key, variant)) return false;

  const user = getUser();
  const overrides = { ...(user.copyOverrides || {}), [key]: variant };
  saveUser({ copyOverrides: overrides });

  pushHistory({
    ts: Date.now(),
    source: 'single',
    before: { [key]: before },
    after:  { [key]: variant },
    single: key,
  });

  window.dispatchEvent(new CustomEvent('apacheta:copy:applied', { detail: { key, variant } }));
  return true;
}

export function rollback(historyIdx) {
  const user = getUser();
  const history = user.copyHistory || [];
  const entry = history[historyIdx];
  if (!entry) return false;

  const target = entry.before;
  if (!target) return false;

  const beforeRollback = snapshotCurrentCopys();
  applyBulk(target);

  const overrides = { ...(user.copyOverrides || {}) };
  Object.keys(target).forEach(k => { overrides[k] = target[k]; });
  saveUser({ copyOverrides: overrides });

  pushHistory({
    ts: Date.now(),
    source: 'rollback',
    rollbackFrom: historyIdx,
    before: beforeRollback,
    after: target,
  });

  window.dispatchEvent(new CustomEvent('apacheta:copy:rollback', { detail: { historyIdx } }));
  return true;
}

export function hydrateFromStorage() {
  const user = getUser();
  const overrides = user.copyOverrides || {};
  let restored = 0;
  Object.entries(overrides).forEach(([key, variant]) => {
    if (applyCopy(key, variant)) restored++;
  });
  return restored;
}

export function initCopyOracle() {
  hydrateFromStorage();

  window.addEventListener('apacheta:oracle:regenerate-all', () => {
    regenerateAll().then(res => {
      showOracleToast(`✦ ${res.appliedCount} copys regenerados · ${res.source}`);
    });
  });
}

function showOracleToast(msg) {
  const t = document.createElement('div');
  t.className = 'oracle-toast';
  t.textContent = msg;
  document.body.appendChild(t);
  setTimeout(() => t.classList.add('is-in'), 20);
  setTimeout(() => { t.classList.remove('is-in'); setTimeout(() => t.remove(), 300); }, 2400);
}
