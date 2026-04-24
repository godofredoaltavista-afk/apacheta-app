# APACHETA — FUENTE NOTEBOOKLM v2.2
**Fecha:** 2026-04-24  
**Propósito:** Fuente primaria para cuaderno NotebookLM "Apacheta · Sistema"  
**Contexto:** Segunda sesión de arquitectura. Primera fue 2026-04-19 (v2.1).

---

## QUÉ ES APACHETA

Apacheta es una app personal de autoconocimiento — tipo "OS espiritual" — construida como SPA (Single Page Application) con Vite 5. Tiene 29 secciones organizadas como un flujo de conciencia: desde el Cosmos y el Aura hasta Notas, Manifiestos, Tarot, Chakras, Mandalas, y un sistema de Copys que se actualiza dinámicamente según el comportamiento del usuario.

**URL producción:** https://apacheta-nine.vercel.app  
**Stack:** Vite 5 SPA + Vercel Serverless Functions + MongoDB Atlas  
**Dev server:** localhost:3005 (LAN: 192.168.0.163:3005)  
**MongoDB:** cluster dovlizera · DB apacheta_prod

---

## ARQUITECTURA TÉCNICA COMPLETA

### Frontend
```
src/
├── main.js              ← boot sequence, Three.js nebula, nav, onboarding
├── api/
│   └── client.js        ← fetch wrapper: deviceUserId header, withFallback()
├── state/
│   ├── UserStore.js     ← sync perfil con /api/user, fallback localStorage
│   ├── NotasStore.js    ← CRUD notas + feedbackBus + API sync
│   └── AuraStore.js     ← snapshot diario + feedbackBus + API sync
├── core/
│   ├── feedback-bus.js  ← acumulador de eventos (max 500)
│   ├── copy-oracle.js   ← lee bus → llama /api/oracle → aplica copys al DOM
│   ├── copy-registry.js ← 50+ keys → selectores DOM → applyCopy()
│   └── banner-registry.js ← banners indexados por tags
├── data/
│   └── copy-oracle-mock.js ← fallback local del oracle
├── components/          ← HUDs, modales, tweaks panel
└── sections/            ← 29 secciones JS individuales
```

### Backend (Vercel API Routes)
```
api/
├── user.js              ← GET/POST/PATCH perfil usuario
├── notes.js             ← GET/POST notas
├── notes/[id].js        ← PATCH/DELETE nota individual
├── manifiestos.js       ← GET/POST manifiestos
├── manifiestos/[id].js  ← PATCH/DELETE manifiesto individual
├── aura.js              ← GET/POST snapshot diario de aura
├── oracle.js            ← POST: feedbackBus → copys personalizados
├── app-schema.js        ← GET: schema público de la app (sin auth)
└── _lib/
    ├── db.js            ← conexión MongoDB singleton (cached en global)
    ├── auth.js          ← requireUserId() desde header X-Apacheta-User-Id
    └── models.js        ← Mongoose schemas: User, Nota, Manifiesto, AuraHistory
```

---

## SISTEMA DE AUTH (Fase 1)

Sin OAuth. Device UUID generado con `crypto.randomUUID()` al primer acceso, guardado en `localStorage['apacheta_uid']`, enviado en cada request como header `X-Apacheta-User-Id`.

**Ventaja:** cero fricción, funciona offline  
**Limitación:** si el usuario borra localStorage o cambia de browser, pierde su historial  
**Fase 2 planificada:** email/Google OAuth, el campo `userId` en DB ya está preparado

---

## SCHEMAS MONGODB (v2.2)

### Collection: users
```json
{
  "_id": "ObjectId",
  "userId": "string (device UUID, único)",
  "nombre": "string",
  "signo": "string",
  "nacimiento": "date",
  "colores": ["#hex", "#hex", "#hex"],
  "alucinajeActivo": "boolean",
  "onboardingCompleto": "boolean",
  "profileAI": {
    "vectores": ["filosofico", "introspectivo", "visual"],
    "tono": "sereno",
    "ultimaActualizacion": "date"
  },
  "createdAt": "date",
  "updatedAt": "date"
}
```

### Collection: notas
```json
{
  "_id": "ObjectId",
  "userId": "string",
  "id": "string (client-generated UUID)",
  "texto": "string",
  "categoria": "string",
  "fecha": "date",
  "createdAt": "date"
}
```

### Collection: manifiestos
```json
{
  "_id": "ObjectId",
  "userId": "string",
  "id": "string",
  "titulo": "string",
  "contenido": "string",
  "tags": ["string"],
  "fecha": "date",
  "updatedAt": "date"
}
```

### Collection: aurahistories
```json
{
  "_id": "ObjectId",
  "userId": "string",
  "fecha": "YYYY-MM-DD",
  "calma": 0-10,
  "foco": 0-10,
  "creatividad": 0-10,
  "energia": 0-10,
  "intuicion": 0-10,
  "colores": ["#hex", "#hex", "#hex"]
}
```

---

## ENDPOINTS REST (15 activos en producción)

| Método | Path | Descripción |
|--------|------|-------------|
| GET | /api/user | Perfil del usuario autenticado |
| POST | /api/user | Crear usuario (onboarding) |
| PATCH | /api/user | Actualizar campos del perfil |
| GET | /api/notes | Todas las notas del usuario |
| POST | /api/notes | Crear nota |
| PATCH | /api/notes/:id | Editar nota |
| DELETE | /api/notes/:id | Eliminar nota |
| GET | /api/manifiestos | Todos los manifiestos |
| POST | /api/manifiestos | Crear manifiesto |
| PATCH | /api/manifiestos/:id | Editar manifiesto |
| DELETE | /api/manifiestos/:id | Eliminar manifiesto |
| GET | /api/aura | Snapshots diarios |
| POST | /api/aura | Guardar snapshot de hoy (upsert) |
| POST | /api/oracle | FeedbackBus → copys personalizados |
| GET | /api/app-schema | Schema completo de la app (público) |

---

## FEEDBACK BUS — SISTEMA DE SEÑALES

El FeedbackBus es el corazón del sistema de personalización. Es un array circular (max 500 eventos) que acumula todas las interacciones del usuario.

### Tipos de eventos registrados:
```javascript
{ type: 'nota-guardada',    payload: { texto, categoria } }
{ type: 'aura-saved',       payload: { calma, foco, creatividad, energia, intuicion } }
{ type: 'manifiesto-saved', payload: { titulo, tags } }
{ type: 'chakra-tapped',    payload: { chakra, intensidad } }
{ type: 'mandala-saved',    payload: { paleta, complejidad } }
{ type: 'copy-regenerated', payload: { keys, source, tags } }
{ type: 'banner-viewed',    payload: { path, duracion } }
```

### Cómo alimenta al Oracle:
```
feedbackBus.read()
    │
    ▼
POST /api/oracle { bus, keys, intent }
    │
    ├──► NotebookLM query (si hay NOTEBOOKLM_API_KEY)
    │         └──► respuesta con copys + tags
    │
    └──► localOracle() — reglas por tag dominante
              │
              ├── 'filosofia'  → copys contemplativos
              ├── 'emocional'  → copys de sentir/procesar
              ├── 'sideral'    → copys cósmicos
              ├── 'yoga'       → copys de práctica/cuerpo
              ├── 'tech'       → copys de claridad mental
              └── 'musical'    → copys de ritmo/flujo
```

---

## COPY ORACLE — PERSONALIZACIÓN DE LA INTERFAZ

El sistema más innovador de Apacheta. El Oracle lee el comportamiento del usuario (feedbackBus) y reescribe el copy de 50+ puntos de la interfaz en tiempo real.

### Flujo:
1. Usuario interactúa (guarda nota, chakra, aura, etc.)
2. FeedbackBus acumula el evento
3. Usuario o sistema dispara `apacheta:oracle:regenerate-all`
4. Oracle llama `/api/oracle` con el bus completo
5. Backend analiza → devuelve JSON con variantes por key
6. `applyCopy(key, variant)` actualiza el DOM
7. Los overrides se guardan en `user.copyOverrides` y persisten

### Ejemplo de respuesta del Oracle:
```json
{
  "copys": {
    "wisdom.top":     "SENTIR ES SABER",
    "morning.invite": "¿cómo estás hoy, Franco?",
    "mandala.cta":    "tu geometría de hoy",
    "notes.placeholder": "lo que quieras recordar..."
  },
  "topTags": ["emocional", "filosofia"],
  "source": "local-oracle"
}
```

---

## PROBLEMAS RESUELTOS EN ESTA SESIÓN

### 1. MongoDB 504 timeout
**Causa:** Atlas solo permitía la IP de casa (181.168.54.207/32). Las IPs dinámicas de Vercel no estaban permitidas.  
**Solución:** Agregar `0.0.0.0/0` en Atlas Network Access → Allow from Anywhere.

### 2. Vercel deploy fallaba por secret inexistente
**Causa:** `vercel.json` referenciaba `@mongodb-uri` que no existe como Vercel Secret.  
**Solución:** Quitar la sección `env` del JSON. Las env vars van por `vercel env add` o el Dashboard.

### 3. Oracle siempre mostraba "mock"
**Causa:** `copy-oracle.js` nunca llamaba `/api/oracle`. Solo intentaba `window.apachetaMCPQuery` y caía al mock local.  
**Solución:** Agregar llamada a `apiPost('/api/oracle', { bus, keys, intent })` como primer paso.

### 4. db.js conectaba a la DB equivocada
**Causa:** `mongoose.connect(URI)` sin `dbName` usa la DB por defecto del cluster.  
**Solución:** Agregar `dbName: 'apacheta_prod'` en las opciones de connect.

---

## PLAN DE ESCALA PARA 25 USUARIOS

### Inmediato (ya implementado)
- MongoDB Atlas Free Tier: 512MB, suficiente para años con 25 usuarios
- Vercel Hobby: 100GB bandwidth/mes, serverless functions ilimitadas
- Costo real: $0/mes

### Próxima sesión
1. **userId estable** — migrar de device UUID a email + token (Google OAuth o Clerk)
2. **EntriesStore** — endpoint genérico para visiones, sueños, afirmaciones
3. **feedbackBus flush** — endpoint POST /api/events/batch para no perder el bus
4. **profileAI** — Claude haiku genera 3-5 vectores semánticos por usuario/semana

### Mediano plazo
5. **NotebookLM sync** — resumen semanal del usuario sube como fuente al cuaderno NLM
6. **Oracle con NLM** — query real a NotebookLM para copys ultra-personalizados
7. **Dashboard admin** — ver todos los usuarios, sus patrones, métricas de uso

---

## VARIABLES DE ENTORNO (Vercel Dashboard)

```
MONGODB_URI=mongodb+srv://godofredoaltavista_db_user:<password>@dovlizera.xxxxx.mongodb.net/
```

**Pendientes de agregar:**
```
NOTEBOOKLM_API_KEY=    (para oracle con NLM)
ANTHROPIC_API_KEY=     (para /api/profile-sync con Claude)
```

---

## COMANDOS ÚTILES

```bash
# Dev local
cd "d:/ANTS on MARS/AAAAexplora/apacheta"
npm run dev   # → localhost:3005

# Deploy producción
vercel --prod --scope francoaltavista-9013s-projects

# Ver logs en prod
vercel logs https://apacheta-nine.vercel.app

# Agregar env var
vercel env add NOTEBOOKLM_API_KEY production

# Test endpoint
curl -H "X-Apacheta-User-Id: TEST-UUID" https://apacheta-nine.vercel.app/api/user
curl https://apacheta-nine.vercel.app/api/app-schema
```

---

## PENDIENTES CRÍTICOS (no hechos en esta sesión)

| Task | Quién | Prioridad |
|------|-------|-----------|
| Crear repo GitHub + conectar Vercel | Franco | Alta |
| `UserStore.load()` en boot de main.js | Franco | Alta |
| `NOTEBOOKLM_API_KEY` en Vercel env | Franco | Media |
| `ANTHROPIC_API_KEY` en Vercel env | Franco | Media |
| `/api/entries.js` endpoint genérico | Pulpo | Media |
| `/api/events/flush.js` | Pulpo | Media |
| Google OAuth (Clerk) | Pulpo | Baja (Fase 2) |
| `/api/profile-sync.js` | Pulpo | Baja (Fase 3) |
| `/api/notebooklm-sync.js` | Pulpo | Baja (Fase 4) |

---

## NOTAS PARA EL CUADERNO NOTEBOOKLM

Este documento es la fuente principal para el cuaderno **"Apacheta · Sistema"** en NotebookLM. El cuaderno debe usarse para:

1. **Responder preguntas de arquitectura** — "¿cómo funciona el FeedbackBus?", "¿qué endpoints existen?"
2. **Generar copys** — el Oracle puede queryear este cuaderno para copys contextuales
3. **Onboarding de nuevos agentes** — Pulpo u otros devs pueden consultarlo antes de tocar código
4. **Planificación** — "¿qué falta implementar?", "¿cómo conectar la sección X?"

Otros documentos del proyecto (fuentes recomendadas para el cuaderno):
- `APACHETA_DOC_COMPLETA.md` — documentación técnica de las 29 secciones
- `APACHETA_SESSION_HANDOFF_2026-04-24.md` — cronología completa de esta sesión
- `APACHETA_SECTION_DATA_PIPELINE.md` — plan de conectar las 26 secciones restantes
- `APACHETA_ROADMAP.md` — visión y roadmap original
