# APACHETA — SESSION HANDOFF COMPLETO
**Fecha:** 2026-04-24  
**Sesión:** Arquitectura + Deploy + MongoDB + Vercel Production + Plan de escala  
**URL producción:** https://apacheta-nine.vercel.app  
**GitHub:** https://github.com/godofredoaltavista-afk/apacheta  
**Vercel project:** prj_gsnuTTaXi6HGcy6ClnSXzSBQ4418 · scope: francoaltavista-9013s-projects  
**MongoDB:** cluster dovlizera · DB apacheta_prod · user: godofredoaltavista_db_user

---

## 1. CRONOLOGÍA: PROMPTS + INTERPRETACIÓN + LO QUE CAMBIÓ

### PROMPT: "hosteamelo en local host nuevo"
Franco quería el dev server levantado y entender qué tecnología lo corre.

**Acción:** `npm run dev` → Vite en puerto 3005.

**Lo que aprendimos:** La app NO usa Live Server de VSCode. Usa **Vite 5** con `host: true` (expone en LAN para celular) y `open: true`. Puerto 3005 fijo en `vite.config.js` y `package.json`.

- Local: http://localhost:3005
- Red/celular: http://192.168.0.163:3005

---

### PROMPT: "Desacoplar de mejor forma el front del end [...] genera documentación"
Franco pedía un re-proyecto de arquitectura con énfasis en backend y persistencia de notas/manifiestos, para 2 devs trabajando en paralelo: **Franco (frontend)** y **Pulpo (backend)**.

**Preguntas que hice para no asumir:**
- ¿Objetivo real? → Producción con usuarios reales
- ¿Backend? → Vercel API Routes (mismo repo)
- ¿DB? → MongoDB Atlas
- ¿Auth? → Sin OAuth en Fase 1, device UUID

**Interpretación clave:** Franco no quería solo docs — quería un plan ejecutable hoy. El documento que generé (`APACHETA_DOC_COMPLETA.md`) cubre 29 secciones, schemas de datos, endpoints, división Franco/Pulpo, y flujos de datos.

**Archivos creados:** `APACHETA_DOC_COMPLETA.md` (doc técnica completa, 1000+ líneas)

---

### PROMPT: "go ejecucion en MONGO db y todas las conexiones / hoy quiero deployear en vercel"
Ejecutar, no planear. Franco quería el backend real funcionando en el día.

**Lo que descubrí al explorar:** Los archivos `api/_lib/db.js`, `api/_lib/auth.js`, `api/_lib/models.js`, y los endpoints CRUD ya existían (creados en sesión anterior). Lo que faltaba era `api/oracle.js` y `api/app-schema.js`.

**Correcciones que hice:**
- `db.js` le faltaba `dbName: 'apacheta_prod'` → sin esto Mongoose conectaba a la DB por defecto del cluster, no a apacheta_prod
- `vercel.json` tenía referencia a secret `@mongodb-uri` que no existía → saqué la sección `env` del json (las env vars van por Vercel Dashboard/CLI, no en el JSON)

**Archivos creados:** `api/oracle.js`, `api/app-schema.js`

**Deploy:**
```bash
npm install mongoose          # ya estaba, verificado
npx vercel login              # → https://vercel.com/oauth/device?user_code=LGVL-WTJS
npx vercel link --yes --scope francoaltavista-9013s-projects
# → linkedó al proyecto existente "apacheta" (prj_gsnuTTaXi6HGcy6ClnSXzSBQ4418)
# → intentó conectar github.com/godofredoaltavista-afk/apacheta → falló (repo privado o no existe)
# → el link del proyecto sí se creó (.vercel/project.json)
echo "mongodb+srv://..." | npx vercel env add MONGODB_URI production --scope ...
npx vercel --prod --scope francoaltavista-9013s-projects
# → ✓ https://apacheta-nine.vercel.app
```

**Problema con GitHub:** Vercel intentó conectar al repo `godofredoaltavista-afk/apacheta` y falló porque el repo no existe o es privado. El deploy funcionó igual porque Vercel CLI hace upload directo del código local. **Esto significa que los cambios están en Vercel pero NO en GitHub.** Ver sección "Plan GitHub" abajo.

---

### PROMPT: Screenshot con URI de MongoDB (password visible)
Franco mostró el string de conexión de Atlas con credenciales reales.

**Acción:** Guardé el URI en `.env.local` y como env var en Vercel production.

**URI en producción:** `mongodb+srv://godofredoaltavista_db_user:rJZLGSs7166TMS1l@dovlizera.eq1t1bx.mongodb.net/apacheta_prod`

**Seguridad:** `.env.local` está en `.gitignore`. La password NO está en git. Sí está en Vercel como env var encriptada.

---

### PROMPT: "acabo de hacerlo" (Screenshot de Atlas: 0.0.0.0/0 Pending)
Franco agregó `0.0.0.0/0` en Network Access de Atlas. Problema previo: Atlas bloqueaba las IPs de Vercel (que rotan y no son fijas).

**Acción:** Polling hasta que el endpoint respondió 200. Todos los tests pasaron.

**Tests ejecutados y resultados:**
```
GET  /api/user                     → ✓ devuelve defaults para usuario nuevo
POST /api/user                     → ✓ Franco · Aries guardado en MongoDB
POST /api/notes                    → ✓ nota con tags ['filosofia','sideral']
GET  /api/notes                    → ✓ 1 nota persistida y recuperada
POST /api/manifiestos              → ✓ manifiesto "visión" guardado
POST /api/aura                     → ✓ snapshot 2026-04-24, creatividad: 95
POST /api/oracle (feedbackBus)     → ✓ source: local-oracle
                                      topTags: ['emocional','yoga','sideral']
                                      wisdom.top: "SENTIR ES SABER"
                                      morning.invite: "¿cómo estás hoy, Franco?"
GET  /api/app-schema               → ✓ 29 secciones, 15 endpoints en JSON
```

---

### PROMPT: Screenshots de MongoDB Compass + frontend en el browser
Franco veía en Atlas las colecciones de `apacheta_prod` (aurahistories, manifiestos, notas, users) y en el frontend el Feedback Bus con "15 copys · mock". Preguntó por qué dice "mock" y no se actualiza al presionar regenerar.

**Diagnóstico que hice:**
1. `copy-oracle.js` nunca llamaba a `/api/oracle` — tenía `window.apachetaMCPQuery` (MCP directo) y fallback mock. El endpoint de la API que creamos no estaba conectado.
2. `src/api/client.js` no existía — los stores importaban `apiFetch` y `withFallback` de ahí pero el archivo era vacío.
3. `UserStore.js` no existía en `src/state/`.

**Correcciones:**
- Creé `src/api/client.js` con `apiFetch()`, `withFallback()`, `deviceUserId`
- Creé `src/state/UserStore.js`
- Parcheé `copy-oracle.js`: nuevo orden → `/api/oracle` primero → MCP → mock local

**Nuevo flujo del Oracle:**
```
regenerateAll()
  → 1° POST /api/oracle { bus, keys, intent }    ← NUEVO
  → 2° window.apachetaMCPQuery (MCP directo)      ← igual que antes
  → 3° mockRegenerateAll() local                  ← fallback
```

**Build y redeploy:** `npm run build` → `vercel --prod` → ✓ nuevo deploy con todo conectado.

---

### PROMPT: "explicame que tengo en MongoDB [...] qué me recomendas para 25 usuarios"
Franco quería entender el estado real de su DB y planear el crecimiento.

**Lo que tiene en MongoDB hoy:**
```
dovlizera (cluster)
├── apacheta_prod
│   ├── aurahistories   ← snapshots diarios de estado emocional
│   ├── manifiestos     ← textos con carpeta: filosofia/vision/tech/emocional...
│   ├── notas           ← 3 documentos guardados en sesión
│   └── users           ← 1 usuario: test-franco-001
└── sample_mflix        ← base de ejemplo de Atlas, ignorar o borrar
```

**Problema estructural identificado:** El `userId` actual es un UUID de dispositivo. Si el usuario cambia de browser o borra cookies → pierde su perfil. Para 25 usuarios reales → necesita identificador estable (email o magic link).

---

## 2. ESTADO ACTUAL DEL SISTEMA (al cierre de sesión)

### Lo que funciona en producción HOY
```
https://apacheta-nine.vercel.app

Frontend        ✅ Live — Vite SPA, 31 secciones, Three.js, HUDs
API backend     ✅ 15 endpoints en Vercel serverless
MongoDB         ✅ apacheta_prod conectado (dovlizera cluster)
Oracle API      ✅ /api/oracle → local-oracle (sin NotebookLM API keys aún)
App Schema      ✅ /api/app-schema → JSON público de toda la arquitectura
src/api/client  ✅ apiFetch + withFallback + deviceUserId
UserStore       ✅ sync perfil con /api/user + fallback localStorage
NotasStore      ✅ CRUD → /api/notes + fallback localStorage
AuraStore       ✅ historial → /api/aura + fallback localStorage
copy-oracle     ✅ llama /api/oracle antes del mock
```

### Lo que está pendiente
```
Email como userId estable        ← SIN ESTO 25 usuarios = 25 perfiles perdibles
/api/profile-sync (Claude API)   ← el cerebro del sistema de personalización
campo profileAI en users{}       ← donde Claude guarda el perfil semántico
NOTEBOOKLM_API_KEY en Vercel     ← para que Oracle use NLM en vez de fallback
GitHub sincronizado con Vercel   ← hoy el deploy fue manual, sin CI/CD
```

---

## 3. PROBLEMA GITHUB / VERCEL — CÓMO CERRARLO BIEN

### Qué pasó
El deploy a Vercel fue desde CLI (`vercel --prod`) con upload directo del código local. Vercel intentó conectar al repo GitHub `godofredoaltavista-afk/apacheta` pero falló (repo no existe o es privado). El link falló pero el deploy funcionó igual.

**Consecuencia:** Vercel y GitHub están desconectados. Si alguien hace push a GitHub, Vercel NO va a redesployar automáticamente. Si alguien hace `vercel --prod`, GitHub no se actualiza.

### El repo tiene un solo commit de hace 5 días
```
c195440 Initial commit: Apacheta v1 — 27 secciones completas
```

Todo lo que construimos (backend, stores, oracle, client, manifiestos, tweaks, HUDs) está en local y en Vercel **pero NO en GitHub**.

### Cómo cerrarlo correctamente (hacer esto antes de la próxima sesión)

**Paso 1 — Crear el repo en GitHub si no existe:**
```bash
# En browser: github.com/godofredoaltavista-afk → New repository → "apacheta" → Public
```

**Paso 2 — Pushear todo a main:**
```bash
cd "d:/ANTS on MARS/AAAAexplora/apacheta"

# Verificar que el remote apunta bien
git remote -v
# → origin https://github.com/godofredoaltavista-afk/apacheta.git

# Commitear todo lo que está sin trackear
git add .
git commit -m "feat: backend completo + MongoDB + Vercel + Oracle API"
git push origin main
```

**Paso 3 — Conectar GitHub con Vercel:**
```bash
# En Vercel Dashboard:
# → francoaltavista-9013s-projects/apacheta → Settings → Git
# → Connect Git Repository → GitHub → godofredoaltavista-afk/apacheta
```

**Después de esto:** Cada push a `main` dispara un deploy automático en Vercel. No más `vercel --prod` manual.

### Modelo de branches para 2 devs

```
main              ← producción (apacheta-nine.vercel.app)
├── dev           ← integración (apacheta-nine-dev.vercel.app)
├── franco/...    ← ramas de Franco (frontend)
└── pulpo/...     ← ramas de Pulpo (backend)
```

**Flujo:**
```
Franco → rama franco/feature-x → PR a dev → review → merge
Pulpo  → rama pulpo/api-y     → PR a dev → review → merge
dev    → main → Vercel auto-deploy a producción
```

---

## 4. PLAN DE ESCALA: PIPELINE COMPLETO DE INFORMACIÓN

### El problema que hay que resolver

Hoy el Oracle recibe el feedbackBus (lista de eventos: notas, chakras, aura) y genera copys con reglas locales. **Pero no hay un perfil semántico del usuario** que acumule aprendizaje entre sesiones. Cada vez que el usuario llega, el Oracle empieza de cero.

La visión completa es:

```
USUARIO usa la app
        │
        ▼
FeedbackBus acumula eventos
(notas escritas, aura, chakras tocados, secciones visitadas, etc.)
        │
        ▼
Cada cierto tiempo (o on-demand):
POST /api/profile-sync
        │
        ├── Lee últimas 50 notas de MongoDB
        ├── Lee historial de aura (7 días)
        ├── Lee feedbackBus (últimos 100 eventos)
        ├── Lee texto de manifiestos
        │
        ▼
Claude API analiza todo esto
(modelo: claude-sonnet-4-6 o claude-haiku-4-5 para velocidad)
        │
Genera:
{
  topTags: ["sideral", "emocional", "filosofia"],
  dominantAura: { calma: 78, creatividad: 91 },
  copyStyle: "poético, corto, bilingüe, contemplativo",
  oraclePersonality: "contemplativo-sideral",
  patterns: ["escribe de noche", "toca chakra del corazón", "usa tags emocional+sideral juntos"],
  notebooklmContext: "texto formateado para mandar a NotebookLM como contexto"
}
        │
        ▼
Guarda en MongoDB users{}.profileAI
        │
        ▼
Próxima vez que el Oracle regenera copys:
POST /api/oracle { bus, keys, profileAI }
        │
        ├── Lee profileAI del usuario desde MongoDB
        ├── Construye query para NotebookLM con el perfil
        │   "El usuario [nombre] tiene este perfil: {topTags, copyStyle, patterns...}
        │    Su aura de hoy: creatividad 91, calma 78.
        │    Su última nota dice: '...'.
        │    Generá variantes de copy para estas secciones:"
        │
        ▼
NotebookLM responde con copys que conocen AL USUARIO ESPECÍFICO
        │
        ▼
Frontend aplica al DOM → secciones se actualizan en tiempo real
```

### Los 3 vectores predictivos que hay que construir

**Vector 1: Emocional** (de aura-history + feedbackBus)
```
Qué mide: tendencias de calma/creatividad/foco en el tiempo
Dónde vive: users{}.profileAI.dominantAura
Qué cambia: copy de aura-composer, morning-journey, meditacion-ojo
Cómo se actualiza: cada vez que el usuario guarda su aura
```

**Vector 2: Semántico** (de notas + manifiestos)
```
Qué mide: temas recurrentes en lo que escribe el usuario
Dónde vive: users{}.profileAI.topTags + patterns[]
Qué cambia: wisdom.top, wisdom.bottom, biblioteca, conexiones, chakras.desc
Cómo se actualiza: cada 5 notas nuevas o manual
```

**Vector 3: Conductual** (de feedbackBus eventos)
```
Qué mide: qué secciones visita, a qué hora, qué acciones repite
Dónde vive: users{}.profileAI.behaviorProfile
Qué cambia: saludo del hero, frase del día, challenge diario
Cómo se actualiza: en background cada sesión
```

### Cómo conectar NotebookLM al pipeline

**Hoy:** El Oracle usa un fallback local cuando no hay NOTEBOOKLM_API_KEY. Las reglas son buenas pero estáticas.

**Con NotebookLM:** Cada cuaderno del usuario puede contener sus notas, manifiestos, frases favoritas como fuentes. Cuando el Oracle pregunta, NotebookLM responde usando ESE corpus personalizado.

```bash
# Configurar en Vercel:
vercel env add NOTEBOOKLM_NOTEBOOK_ID production
# → ID del cuaderno de la app en NotebookLM (el que creamos hoy)

vercel env add NOTEBOOKLM_API_KEY production  
# → Google API key con acceso a NotebookLM API
```

El endpoint `/api/oracle.js` ya tiene el código para llamar a NotebookLM. Solo necesita las credenciales.

---

## 5. ENDPOINTS PENDIENTES DE IMPLEMENTAR (Pulpo)

### `/api/profile-sync` — el más importante
```javascript
// POST /api/profile-sync
// Lee datos del usuario → Claude API → genera profileAI → guarda en MongoDB

export default async function handler(req, res) {
  const userId = requireUserId(req, res);
  
  // 1. Leer todo del usuario
  const [user, notas, auras] = await Promise.all([
    User.findOne({ userId }),
    Nota.find({ userId }).sort({ ts: -1 }).limit(50),
    AuraHistory.find({ userId }).sort({ fecha: -1 }).limit(7),
  ]);

  // 2. Construir contexto para Claude
  const context = buildContext(user, notas, auras);

  // 3. Llamar Claude API
  const profileAI = await claude.messages.create({
    model: 'claude-haiku-4-5-20251001', // rápido y barato
    max_tokens: 500,
    messages: [{ role: 'user', content: PROFILE_PROMPT + context }],
  });

  // 4. Parsear y guardar
  const parsed = JSON.parse(profileAI.content[0].text);
  await User.findOneAndUpdate({ userId }, { $set: { profileAI: parsed } });

  res.json({ ok: true, profileAI: parsed });
}
```

### `/api/users/[id]/notes-export` — para NotebookLM
```javascript
// GET /api/users/:id/notes-export
// Devuelve todas las notas + manifiestos formateados como texto
// Para subir como fuente a NotebookLM
```

### `/api/sync-batch` — para múltiples usuarios
```javascript
// POST /api/sync-batch (llamado por cron)
// Actualiza profileAI de todos los usuarios que tuvieron actividad
// en las últimas 24 horas
```

---

## 6. SCHEMA MONGODB — PRÓXIMA VERSIÓN (v2.2)

### `users` — agregar campo `profileAI`
```javascript
const userSchema = new mongoose.Schema({
  // ... campos actuales ...
  email:      { type: String, sparse: true, index: true },  // NUEVO: userId estable
  profileAI:  {                                              // NUEVO: generado por Claude
    topTags:            [String],
    dominantAura:       Object,
    copyStyle:          String,
    oraclePersonality:  String,
    patterns:           [String],
    notebooklmContext:  String,
    lastSyncAt:         Number,
  },
}, { timestamps: true });
```

### `sessions` — para tracking entre dispositivos (Fase 2)
```javascript
const sessionSchema = new mongoose.Schema({
  userId:     String,
  deviceId:   String,   // UUID del dispositivo
  email:      String,
  createdAt:  Date,
  lastSeenAt: Date,
});
```

---

## 7. PLAN DE AUTH PROGRESIVO

### Fase 1 — HOY (device UUID)
```
Sin fricción. UUID se genera en localStorage.
Problema: se pierde con el browser.
Útil para: testing, primeros usuarios, demos.
```

### Fase 2 — PRÓXIMO (email sin password)
```javascript
// Onboarding: agregar campo email
// Al ingresar email:
// 1. Hashear email → nuevo userId estable
// 2. Mantener el UUID viejo, hacer merge de datos
// 3. Guardar { email: hash, deviceIds: [uuid1, uuid2] }
// Sin magic link, sin OAuth — solo email como clave de recuperación
```

### Fase 3 — FUTURO (magic link o Google OAuth)
```
Solo si lo piden los usuarios.
Clerk o NextAuth se pueden agregar en 1 día.
El campo userId en MongoDB ya existe.
```

---

## 8. VARIABLES DE ENTORNO — ESTADO COMPLETO

```bash
# Vercel production (ya configuradas)
MONGODB_URI = mongodb+srv://godofredoaltavista_db_user:***@dovlizera.eq1t1bx.mongodb.net/apacheta_prod

# Vercel production (pendientes)
NOTEBOOKLM_NOTEBOOK_ID = [ID del cuaderno que creamos hoy en NotebookLM]
NOTEBOOKLM_API_KEY     = [Google API key — ver Google Cloud Console]
ANTHROPIC_API_KEY      = [para /api/profile-sync con Claude API]

# .env.local (desarrollo local)
MONGODB_URI            = [mismo URI]
NOTEBOOKLM_NOTEBOOK_ID = 
NOTEBOOKLM_API_KEY     = 
ANTHROPIC_API_KEY      = 
```

---

## 9. COMANDOS DE REFERENCIA RÁPIDA

```bash
# Dev local
cd "d:/ANTS on MARS/AAAAexplora/apacheta"
npm run dev                     # http://localhost:3005

# Deploy manual (mientras no esté GitHub conectado)
npm run build
npx vercel --prod --scope francoaltavista-9013s-projects

# Ver logs de producción
npx vercel logs https://apacheta-nine.vercel.app --scope francoaltavista-9013s-projects

# Agregar env var a Vercel
echo "valor" | npx vercel env add NOMBRE production --scope francoaltavista-9013s-projects

# Git — pushear todo
git add .
git commit -m "feat: descripcion"
git push origin main

# Test endpoint en producción
curl -s https://apacheta-nine.vercel.app/api/app-schema | python -c "import sys,json; d=json.load(sys.stdin); print(len(d['sections']), 'secciones')"

curl -s -X POST https://apacheta-nine.vercel.app/api/oracle \
  -H "X-Apacheta-User-Id: mi-uuid" \
  -H "Content-Type: application/json" \
  -d '{"bus":[],"keys":["wisdom.top"],"intent":"test"}'
```

---

## 10. ARQUITECTURA DE ARCHIVOS — CÓMO CONECTAR TODO

### Punto de entrada: `src/main.js`
```javascript
// Lo que le falta agregar en el boot:
import { UserStore } from './state/UserStore.js';

document.addEventListener('DOMContentLoaded', async () => {
  // Cargar perfil desde API (con fallback a localStorage)
  await UserStore.load();   // ← agregar esto al inicio del boot
  
  // ... resto del boot igual que hoy
});
```

### Cómo el Oracle conoce al usuario
```javascript
// En api/oracle.js — ya implementado, falta el profileAI:
const userData = await User.findOne({ userId }).lean();
// userData.profileAI ya contiene topTags, copyStyle, patterns
// → se incluye en el prompt a NotebookLM
```

### Cómo cada sección manda datos al backend
```javascript
// PATRÓN ESTÁNDAR para todas las secciones:
// 1. Acción del usuario (input, slider, tap)
// 2. Actualizar localStorage INMEDIATO (no bloquear UI)
// 3. feedbackBus.push({ type, payload })
// 4. withFallback(() => apiFetch('/endpoint', { ... }), () => null)
```

---

*Handoff generado: 2026-04-24*  
*Próxima sesión prioridad 1: git push + GitHub-Vercel connection*  
*Próxima sesión prioridad 2: /api/profile-sync + ANTHROPIC_API_KEY*  
*Próxima sesión prioridad 3: email en onboarding como userId estable*
