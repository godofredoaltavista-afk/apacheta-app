/* =============================================
   APACHETA — USER STORE
   Sincroniza perfil con /api/user.
   Fallback inmediato a localStorage si la API falla.
   ============================================= */

import { apiGet, apiPost, apiPatch, deviceUserId } from '../api/client.js';
import { USER_KEY, USER_DEFAULT, applyUserColors } from '../main.js';

function readLocal() {
  try {
    return { ...USER_DEFAULT, ...JSON.parse(localStorage.getItem(USER_KEY) || '{}') };
  } catch { return { ...USER_DEFAULT }; }
}

function writeLocal(data) {
  localStorage.setItem(USER_KEY, JSON.stringify(data));
}

export const UserStore = {
  // Carga perfil desde API → sincroniza localStorage
  async load() {
    try {
      const remote = await apiGet('/api/user');
      const merged = { ...USER_DEFAULT, ...remote };
      writeLocal(merged);
      applyUserColors(merged.colores);
      return merged;
    } catch (err) {
      console.warn('[UserStore] offline, usando localStorage:', err.message);
      const local = readLocal();
      applyUserColors(local.colores);
      return local;
    }
  },

  // Crear usuario en onboarding
  async create(data) {
    try {
      const remote = await apiPost('/api/user', data);
      const merged = { ...USER_DEFAULT, ...remote };
      writeLocal(merged);
      return merged;
    } catch (err) {
      console.warn('[UserStore] create offline:', err.message);
      const merged = { ...readLocal(), ...data, onboardingCompleto: true };
      writeLocal(merged);
      return merged;
    }
  },

  // Actualizar campos (colores, alucinajeActivo, etc.)
  async patch(patch) {
    // Optimistic: actualiza local inmediato
    const current = readLocal();
    const merged = { ...current, ...patch };
    writeLocal(merged);
    applyUserColors(merged.colores);

    // Sync a API en background
    apiPatch('/api/user', patch).catch(err =>
      console.warn('[UserStore] patch sync failed:', err.message)
    );

    return merged;
  },

  get(key) {
    return readLocal()[key];
  },

  getAll() {
    return readLocal();
  },
};
