/* =============================================
   APACHETA — AURA STORE
   Aura como salud mental predictiva: local-first + sync MongoDB
   Historial de 30 días sincronizado en la nube
   ============================================= */

import { apiFetch, withFallback } from '../api/client.js';
import { getUser, saveUser } from '../main.js';

// Clave de historial local por fecha
const auraKey = (fecha) => `aura_${fecha}`;
const todayKey = () => auraKey(new Date().toISOString().split('T')[0]);

function _localGetToday() {
  const raw = localStorage.getItem(todayKey());
  return raw ? JSON.parse(raw) : null;
}

function _localSaveToday(aura) {
  const fecha = new Date().toISOString().split('T')[0];
  localStorage.setItem(auraKey(fecha), JSON.stringify(aura));
  saveUser({ aura });
}

function _localGetHistory(days = 30) {
  const result = [];
  for (let i = 0; i < days; i++) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const fecha = d.toISOString().split('T')[0];
    const raw = localStorage.getItem(auraKey(fecha));
    if (raw) {
      try { result.push({ fecha, ...JSON.parse(raw) }); } catch (_) {}
    }
  }
  return result;
}

export const AuraStore = {

  // Obtiene el aura del día: localStorage primero, luego API
  async getToday() {
    const local = _localGetToday() || getUser().aura || null;

    withFallback(
      async () => {
        const history = await apiFetch('/aura');
        const fecha = new Date().toISOString().split('T')[0];
        const remote = history.find(a => a.fecha === fecha);
        if (remote) {
          _localSaveToday(remote);
        }
      },
      () => null
    );

    return local;
  },

  // Historial de N días: API first, fallback localStorage
  async getHistory(days = 30) {
    return withFallback(
      async () => {
        const data = await apiFetch('/aura');
        // Merge con local para datos offline no sincronizados
        const remoteFeches = new Set(data.map(a => a.fecha));
        const localOnly = _localGetHistory(days).filter(a => !remoteFeches.has(a.fecha));
        return [...data, ...localOnly].sort((a, b) => b.fecha.localeCompare(a.fecha)).slice(0, days);
      },
      () => _localGetHistory(days)
    );
  },

  // Guarda el aura del día — optimistic local + sync API
  async save(auraData) {
    const fecha = new Date().toISOString().split('T')[0];
    const aura = {
      calma:       auraData.calma       ?? 50,
      foco:        auraData.foco        ?? 50,
      creatividad: auraData.creatividad ?? 50,
      energia:     auraData.energia     ?? 50,
      intuicion:   auraData.intuicion   ?? 50,
      colores:     auraData.colores     || [],
      savedAt:     Date.now(),
    };

    // Optimistic: guardar local de inmediato (no bloquea UI)
    _localSaveToday(aura);

    // Sync en background
    withFallback(
      () => apiFetch('/aura', {
        method: 'POST',
        body: JSON.stringify({ fecha, ...aura }),
      }),
      () => null
    );

    return { fecha, ...aura };
  },

};
