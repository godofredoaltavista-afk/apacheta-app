/* =============================================
   APACHETA — NOTAS STORE
   CRUD de notas: API first, fallback localStorage
   Alimenta feedback bus en cada operación
   ============================================= */

import { apiFetch, withFallback } from '../api/client.js';
import { getUser, saveUser } from '../main.js';
import { feedbackBus } from '../core/feedback-bus.js';

function _localGetAll() {
  const user = getUser();
  // Unifica notasList[] y notas{} en un solo array
  const fromList = user.notasList || [];
  const fromMap  = Object.entries(user.notas || {}).map(([id, n]) => ({ id, ...n }));
  // Deduplicar por id
  const seen = new Set();
  return [...fromList, ...fromMap].filter(n => {
    if (!n.id || seen.has(n.id)) return false;
    seen.add(n.id);
    return true;
  }).sort((a, b) => (b.ts || 0) - (a.ts || 0));
}

function _localSaveNota(nota) {
  const user  = getUser();
  const list  = user.notasList || [];
  const idx   = list.findIndex(n => n.id === nota.id);
  const next  = idx >= 0 ? list.map((n, i) => i === idx ? nota : n) : [...list, nota];

  const map   = { ...(user.notas || {}) };
  map[nota.id] = nota;

  const ultimas = [nota.texto, ...(user.ultimasAnotaciones || [])].slice(0, 3);
  saveUser({ notasList: next, notas: map, ultimasAnotaciones: ultimas });
}

function _localDeleteNota(id) {
  const user = getUser();
  const list = (user.notasList || []).filter(n => n.id !== id);
  const map  = { ...(user.notas || {}) };
  delete map[id];
  saveUser({ notasList: list, notas: map });
}

export const NotasStore = {

  async getAll() {
    return withFallback(
      async () => {
        const data = await apiFetch('/notes');
        // Merge con local para no perder notas offline pendientes
        const localOnly = _localGetAll().filter(n => !data.find(d => d.id === n.id));
        return [...data, ...localOnly].sort((a, b) => (b.ts || 0) - (a.ts || 0));
      },
      () => _localGetAll()
    );
  },

  // Crear nota — optimistic local + sync API
  async create(notaData) {
    const nota = {
      id:    notaData.id || Date.now().toString(36),
      titulo: notaData.titulo || '',
      texto:  notaData.texto  || '',
      color:  notaData.color  || '#FFE44D',
      tags:   notaData.tags   || [],
      ts:     notaData.ts     || Date.now(),
    };

    _localSaveNota(nota);

    feedbackBus.push({ type: 'note-written', payload: { titulo: nota.titulo, tags: nota.tags } });

    withFallback(
      () => apiFetch('/notes', { method: 'POST', body: JSON.stringify(nota) }),
      () => null
    );

    return nota;
  },

  // Actualizar nota (auto-save desde manifiesto-gestor)
  async update(id, patch) {
    const user  = getUser();
    const notas = user.notas || {};
    const existing = notas[id] || (user.notasList || []).find(n => n.id === id) || {};
    const updated  = { ...existing, ...patch, id };

    _localSaveNota(updated);

    withFallback(
      () => apiFetch(`/notes/${id}`, { method: 'PATCH', body: JSON.stringify(patch) }),
      () => null
    );

    return updated;
  },

  async delete(id) {
    _localDeleteNota(id);

    withFallback(
      () => apiFetch(`/notes/${id}`, { method: 'DELETE' }),
      () => null
    );
  },

};
