# APACHETA — PLAN DE CARGA DE SECCIONES Y PIPELINE DE DATOS
**Fecha:** 2026-04-24  
**Estado:** Planning. Ninguna sección conectada aún salvo notas, aura, manifiestos.  
**Objetivo:** Que las 29 secciones envíen datos estructurados al backend.

---

## SITUACIÓN ACTUAL

Hay 29 secciones en Apacheta. De ellas, solo 3 tienen persistencia real en MongoDB:

| Sección | Endpoint | Estado |
|---------|----------|--------|
| Notas (anotacion-rapida) | POST /api/notes | ✅ activo |
| Aura (aura-composer) | POST /api/aura | ✅ activo |
| Manifiestos | POST /api/manifiestos | ✅ activo |
| El resto (26) | ninguno | ❌ solo localStorage |

El FeedbackBus acumula eventos de TODO — chakra-tapped, mandala-saved, vision-written, etc. — pero no hay endpoints para esos datos ni pipeline que los analice.

---

## CATEGORÍAS DE SECCIONES POR TIPO DE DATO

### Categoría A — Eventos discretos (ya capturados en feedbackBus)
No generan "documentos" pero sí señales de comportamiento.

```
chakra-activator    → { chakra, intensidad, ts }
tarot-revelador     → { carta, orientacion, ts }
mandala-gestor      → { paleta, complejidad, ts }
ritmo-compositor    → { bpm, modo, ts }
respiracion         → { duracion, patron, ts }
```

**Plan:** Estos NO necesitan endpoints propios. El feedbackBus los acumula y el Oracle los lee.
Lo que sí falta: un endpoint `/api/events/batch` para flush periódico del bus completo a MongoDB (cada 24hs o al cerrar sesión).

---

### Categoría B — Texto generado por el usuario (necesitan endpoints)
Generan contenido que el usuario quiere recuperar.

```
vision-gestor       → { titulo, texto, tags, fecha }
sueño-diario        → { texto, interpretacion, fecha }
afirmacion-hoy      → { texto, intensidad, fecha }
proposito-semana    → { texto, progreso, fecha }
gratitud-log        → { items: [string], fecha }
```

**Plan:** Endpoint genérico `/api/entries` con campo `tipo` para no multiplicar endpoints.

```javascript
// api/entries.js
// POST /api/entries { tipo, contenido, tags, metadata }
// GET  /api/entries?tipo=vision&limit=20
// PATCH /api/entries/:id
// DELETE /api/entries/:id

// Mongoose schema
{
  userId: String,
  tipo: { type: String, enum: ['vision','sueño','afirmacion','proposito','gratitud'] },
  contenido: Mixed,  // flexible por tipo
  tags: [String],
  fecha: Date,
  createdAt: Date
}
```

---

### Categoría C — Estado continuo (snapshots diarios, como aura)
El usuario no escribe texto libre, pero hay un estado que evoluciona.

```
signo-dinamico      → { signo, planeta, fase, fecha }
biorhythm           → { fisico, emocional, intelectual, fecha }
lunar-tracker       → { fase, signo, aspecto, fecha }
```

**Plan:** Endpoint `/api/daily-state` con upsert por userId+fecha.

---

### Categoría D — Generativas (el sistema genera, el usuario reacta)
El usuario no escribe pero sí reacciona (like, save, remix).

```
copy-oracle         → banners aplicados, variantes aceptadas
tarot-revelador     → carta tirada, significado leído
cosmos-viewer       → objeto visualizado, duración
```

**Plan:** Capturar en feedbackBus como ahora, luego flush batch a MongoDB.

---

## PLAN DE IMPLEMENTACIÓN POR FASES

### Fase 2 (próxima sesión) — Endpoint genérico + flush del bus

1. **Crear `api/entries.js`** — CRUD genérico para Categoría B
   - Migrar `vision-gestor.js` y `sueño-diario.js` para usarlo
   - EntriesStore en frontend (patrón igual que NotasStore)

2. **Crear `api/events/flush.js`** — POST recibe array de eventos
   - Frontend llama esto al cerrar sesión (`beforeunload`) y cada 24hs
   - Guarda en collection `events` (no reemplaza feedbackBus, lo respalda)

3. **Actualizar `api/_lib/models.js`** — agregar Entry y Event schemas

---

### Fase 3 — Profile AI + análisis

4. **Crear `api/profile-sync.js`** — POST recibe feedbackBus + entries recientes
   - Llama Claude API (`claude-haiku-4-5`) con los datos
   - Genera `profileAI`: 3-5 vectores semánticos del usuario
   - Guarda en `users.profileAI`

5. **Conectar Oracle con profileAI** — en `api/oracle.js` incluir profileAI en el prompt al sistema:
   ```javascript
   const profile = await User.findOne({ userId }).select('profileAI').lean();
   // → incluir en prompt de NotebookLM o Claude
   ```

---

### Fase 4 — NotebookLM como capa de comprensión

6. **Sync automático con NotebookLM** — cada semana, el sistema:
   - Genera un resumen en texto plano de las entradas del usuario
   - Lo sube como fuente al cuaderno del usuario en NotebookLM
   - La próxima llamada al Oracle incluye el query a ese cuaderno

7. **`api/notebooklm-sync.js`** — usa `mcp__notebooklm-mcp__source_add` server-side
   - Necesita NOTEBOOKLM_API_KEY en Vercel env vars

---

## FLUJO COMPLETO OBJETIVO (estado futuro)

```
Usuario interactúa con sección X
        │
        ▼
feedbackBus.push({ type, payload, ts })
        │
        ├──► localStorage (inmediato)
        │
        └──► SectionStore.save() (optimistic)
                  │
                  ├──► localStorage (cache)
                  └──► POST /api/entries o /api/daily-state
                              │
                              ▼
                        MongoDB Atlas
                              │
                              ▼
                   (noche, cron Vercel) /api/profile-sync
                              │
                        Claude haiku-4-5
                              │
                        users.profileAI updated
                              │
                   (semanal) /api/notebooklm-sync
                              │
                        Fuente nueva en cuaderno NLM
                              │
                   (usuario pide Oracle) /api/oracle
                              │
                        NotebookLM query con profileAI
                              │
                        Copys personalizados al DOM
```

---

## PRIORIDAD REAL PARA 25 USUARIOS

Para 25 usuarios, lo más importante NO es tener todas las secciones conectadas. Es:

1. **userId estable** — email o Google OAuth, no device UUID (se pierde si borra el browser)
2. **Notas + Manifiestos funcionando bien** — ya están, refinar
3. **feedbackBus flush** — no perder los eventos de comportamiento
4. **profileAI básico** — 1 sola llamada a Claude por semana por usuario = ~$0.01/user/semana

Las 26 secciones restantes pueden ir conectando de a poco. El patrón es siempre el mismo:
```
SectionStore → withFallback(apiFetch, localStorage) → feedbackBus.push
```

---

## ARCHIVOS A CREAR (en orden de prioridad)

| Archivo | Quién | Fase |
|---------|-------|------|
| `api/entries.js` | Pulpo | 2 |
| `api/events/flush.js` | Pulpo | 2 |
| `src/state/EntriesStore.js` | Franco | 2 |
| `api/profile-sync.js` | Pulpo | 3 |
| `api/notebooklm-sync.js` | Pulpo | 4 |
| `src/sections/vision-gestor.js` (migrar) | Franco | 2 |
| `src/sections/sueño-diario.js` (migrar) | Franco | 2 |
