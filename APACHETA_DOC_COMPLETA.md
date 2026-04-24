# APACHETA — DOCUMENTACIÓN COMPLETA DE APLICACIÓN
**Versión:** 2.1 · **Fecha:** 2026-04-23  
**Stack actual:** Vite 5 · Three.js · localStorage  
**Stack objetivo:** Vite · Vercel API Routes · MongoDB Atlas

---

## ÍNDICE

1. [¿Qué es Apacheta?](#1-qué-es-apacheta)
2. [Pantallas y secciones](#2-pantallas-y-secciones)
3. [Flujo de la aplicación](#3-flujo-de-la-aplicación)
4. [Clases y módulos](#4-clases-y-módulos)
5. [Almacenamiento de información](#5-almacenamiento-de-información)
6. [Sistema de HUDs](#6-sistema-de-huds)
7. [Sistema de eventos (CustomEvents)](#7-sistema-de-eventos-customevents)
8. [Feedback Bus + Copy Oracle](#8-feedback-bus--copy-oracle)
9. [Shader Three.js (Nebulosa)](#9-shader-threejs-nebulosa)
10. [CSS y Design Tokens](#10-css-y-design-tokens)
11. [Arquitectura objetivo (Vercel + MongoDB)](#11-arquitectura-objetivo-vercel--mongodb)
12. [División de trabajo: Franco / Pulpo](#12-división-de-trabajo-franco--pulpo)

---

## 1. ¿Qué es Apacheta?

Apacheta es una **app personal tipo OS espiritual** — un dashboard que cambia con la hora del día y almacena el estado mental, emocional y creativo del usuario. No es una red social. No tiene feed. Es una biblia personal.

**Propuesta de valor:** Un espacio íntimo donde el usuario registra notas, compone su aura del día, dibuja mandalas, medita con guías visuales y lee frases filosóficas. Todo personalizado con sus colores y su nombre.

**Stack actual:**
```
Frontend: Vite 5 SPA · ES Modules · Three.js · CSS puro
Persistencia: localStorage (clave apacheta_user)
Dev server: http://localhost:3005
Build output: /dist
```

---

## 2. PANTALLAS Y SECCIONES

### Boot / Onboarding (primera visita)
```
ID: #onboarding
Archivo: src/sections/onboarding.js
```
- Formulario de configuración inicial: nombre, signo zodiacal, fecha de nacimiento, 3 colores personales
- Al completar → llama `revealApp()` en main.js → muestra toda la app
- Guarda en `apacheta_user`: nombre, signo, nacimiento, colores, onboardingCompleto: true
- **Estado persiste:** sí, en localStorage

---

### Hero Morning (landing principal)
```
ID: #hero-morning
Archivo: HTML inline en index.html
Inicializado en: main.js (updateHeroGreeting, initFraseDia, initClock, initDateDisplay)
```
- Saludo dinámico según hora del día (mañana / tarde / noche / alucinaje)
- Reloj en tiempo real (HH:MM)
- Día y fecha (ej: "Jueves · Abr 23")
- Frase filosófica del día (rota por fecha, 7 frases hardcodeadas en main.js)
- Nav bar horizontal con spring physics (slide up + collapse)
- **Estado persiste:** no (UI reactiva)

---

### Dashboard Día
```
ID: #dashboard
Archivo: src/sections/dashboard-dia.js
```
- Nombre del usuario + badge de modo (MAÑANA / TARDE / NOCHE / ALUCINAJE)
- Frase del día con autor
- Challenge diario (rota por semana, leído de `src/data/challenges.json`)
- Streak de días activos
- Contador de notas escritas
- Ventana "frase del día" expandible
- **Estado persiste:** streak y última actividad en `apacheta_user`

---

### Biblioteca
```
ID: #biblioteca
Archivo: src/sections/biblioteca.js
```
- Galería de tarjetas 3D con flip animation (CSS)
- Filtros por categoría: filosofia / tech / emocional / sideral / musical
- Contenido: citas, conceptos, referencias culturales
- **Estado persiste:** no (UI only)

---

### Respiración
```
ID: #respiracion
Archivo: src/sections/respiracion.js
Canvas: #respiracion-canvas (Three.js nebulosa)
```
- Guía de respiración con animación de círculo expandiéndose
- Fases: inhalar / sostener / exhalar / sostener
- Canvas Three.js de nebulosa activo solo cuando sección visible (IntersectionObserver)
- **Estado persiste:** no

---

### Chakras
```
ID: #chakras
Archivo: src/sections/chakras.js
```
- 7 puntos chakra interactivos (Muladhara → Sahasrara)
- Tap → emite evento `chakra-tapped` al feedbackBus
- Info de cada chakra: nombre sánscrito, color, función
- **Estado persiste:** no (el tap se registra en feedbackBus)

---

### Scratch Reveal
```
ID: #scratch-reveal
Archivo: src/sections/scratch-reveal.js
```
- Tarjeta raspadita (Canvas 2D) que revela un mensaje filosófico oculto
- Al revelar → emite `scratch-revealed` al feedbackBus
- **Estado persiste:** no

---

### Ajetreo Sur
```
ID: #ajetreo-sur
Archivo: src/sections/ajetreo-sur.js
```
- Visualizador de caos / movimiento (Canvas animado)
- Partículas que reaccionan a interacción del usuario
- **Estado persiste:** no

---

### Visualising Wisdom
```
ID: #visualising-wisdom
Archivo: src/sections/visualising-wisdom.js
Canvas: #wisdom-canvas (blur de colores, Canvas 2D)
```
- Display grande de frase filosófica con efecto blur de colores en fondo
- Texto editable por Copy Oracle (key: `wisdom.top`)
- **Estado persiste:** copyOverrides en apacheta_user

---

### Modo Alucinaje
```
ID: #modo-alucinaje
Archivo: src/sections/modos-dia.js
Canvas: #alucinaje-canvas (Three.js nebulosa)
```
- Toggle ON/OFF del modo alucinaje
- Al activar → `document.body.classList.add('modo-alucinaje')` → cambia toda la paleta
- Nebulosa Three.js se activa en este canvas
- Guarda `alucinajeActivo: true` en apacheta_user
- **Estado persiste:** sí

---

### Calendar Preview
```
ID: #calendar-section
Archivo: src/sections/calendar-preview.js
```
- Vista de calendario mensual
- Puntos de eventos en días con actividad
- **Estado persiste:** no

---

### Conexiones Culturales
```
ID: #conexiones
Archivo: src/sections/conexiones-culturales.js
```
- Mapa de conexiones entre conceptos / referencias culturales
- Visual interactivo tipo grafo
- **Estado persiste:** no

---

### Anotación Rápida (FAB + Modal)
```
ID: #fab-anotacion (botón flotante)
Modal: #anotacion-modal
Archivo: src/sections/anotacion-rapida.js
```
**Es la sección más importante para persistencia.**

- FAB circular esquina inferior derecha
- Modal top-down con 2 tabs: "nueva nota" / "lista"
- Input: título, texto, color de nota (6 opciones), tags auto-sugeridos por palabras clave
- Swipe up para cerrar
- Keyboard viewport awareness (el modal sube con el teclado en móvil)
- Al guardar: nota se almacena en `user.notasList[]` y `user.notas{}`
- Stack visual de últimas 5 notas (chips flotantes)
- Chip → abre NoteReader modal
- Botón "Enviar a Manifiesto" → guarda nota + scroll + abre manifiesto-gestor

**Schema de nota guardada:**
```javascript
{
  id: "abc123",           // Date.now().toString(36)
  titulo: "string",
  texto: "string",
  color: "#FFE44D",
  tags: ["filosofia", "emocional"],
  ts: 1714000000000       // timestamp Unix
}
```

**Estado persiste:** sí — `user.notasList[]` y `user.notas{}`

---

### Mente
```
ID: #mente
Archivo: src/sections/mente.js
```
- Sección de pensamientos / mente
- Animaciones de partículas
- **Estado persiste:** no

---

### Soplar (Om / MIDI)
```
ID: #soplar
Archivo: src/sections/soplar.js
```
- Práctica de Om con visualización de sonido
- Emite eventos `midi-play` al feedbackBus
- **Estado persiste:** no

---

### Aura Composer
```
ID: #aura-composer
Archivo: src/sections/aura-composer.js
```
- 5 sliders: calma · foco · creatividad · energía · intuición (0–100)
- Genera visualización de aura con los valores
- Botón "guardar aura del día" → snapshot diario
- Emite `aura-saved` al feedbackBus
- **Schema de aura guardada:**
```javascript
{
  calma: 75,
  foco: 60,
  creatividad: 90,
  energia: 45,
  intuicion: 80,
  savedAt: 1714000000000,
  colores: ["#A8E6E0", "#F4C2C2", "#FFE44D"]
}
```
- **Estado persiste:** `user.aura` (actual) y `aura_YYYY-MM-DD` (historial diario en localStorage separado)

---

### Mandala
```
ID: #mandala
Archivo: src/sections/mandala.js
```
- Canvas 2D de dibujo con simetría configurable (2x / 4x / 6x / 8x)
- Paleta de colores
- Botón "guardar mandala" → snapshot en `user.mandalas[]`
- Emite `mandala-saved` al feedbackBus
- **Estado persiste:** sí — `user.mandalas[]` (array de dataURLs + metadata)

---

### GLB Mate
```
ID: #glb-mate
Archivo: src/sections/glb-mate.js
```
- Modelo 3D de mate (archivo .glb en /public/glb/)
- Three.js: GLTFLoader, orbit controls, iluminación
- **Estado persiste:** no

---

### Manifiestos Particles
```
ID: #manifiestos
Archivo: src/sections/manifiestos-particles.js
```
- Animación de partículas sobre texto filosófico
- Muestra fragmentos de notas/manifiestos del usuario
- **Estado persiste:** lee de user.notas

---

### Lissajous
```
ID: #lissajous
Archivo: src/sections/lissajous.js
```
- Curvas de Lissajous interactivas (Canvas 2D)
- Parámetros ajustables: frecuencia A/B, fase
- **Estado persiste:** no

---

### Fibonacci
```
ID: #fibonacci
Archivo: src/sections/fibonacci.js
```
- Espiral de Fibonacci con razón áurea (Canvas 2D)
- Animación progresiva
- **Estado persiste:** no

---

### Morning Journey
```
ID: #morning-journey
Archivo: src/sections/morning-journey.js
```
- Ritual matutino: plantilla guiada de 3 pasos (intención / gratitud / acción)
- **Estado persiste:** no (o guarda como nota)

---

### Meditación Ojo
```
ID: #meditacion-ojo
Archivo: src/sections/meditacion-ojo.js
```
- Guía de meditación visual centrada en punto focal (tercer ojo)
- Timer, instrucciones de respiración
- **Estado persiste:** no

---

### Aura History
```
ID: #aura-history
Archivo: src/sections/aura-history.js
```
- Timeline de los últimos 7 días de aura guardada
- Lee de claves `aura_YYYY-MM-DD` en localStorage
- Gráfico de barras o línea por dimensión
- **Estado persiste:** lee, no escribe

---

### Lofi Player
```
ID: #lofi
Archivo: src/sections/lofi.js
```
- Reproductor de música lofi (tracks embebidos o URLs)
- Controles: play/pause, volumen, siguiente
- **Estado persiste:** no (solo sesión)

---

### Alarma Clock
```
ID: #alarma
Archivo: src/sections/alarma-clock.js
```
- Timer / alarma configurable
- Notificación visual + sonido al completar
- **Estado persiste:** no

---

### Manifiesto Gestor
```
ID: #manifiesto-gestor
Archivo: src/sections/manifiesto-gestor.js
```
**Segunda sección más importante para persistencia.**

- 3 columnas estilo Apple Notes dark:
  - COL 1: Carpetas (8 categorías con colores propios)
  - COL 2: Lista de notas de esa carpeta
  - COL 3: Visor/Editor contenteditable
- Carpetas: Todas / Filosofía / Visión / Tech / Emocional / Lenguaje / Sideral / Musical
- Cada carpeta tiene su paleta de colores específica (bg + text)
- Banner de imagen según tags de la nota (leído de banner-registry.js)
- Botón "expandir con Oracle" → abre oracle-modal
- Auto-save on blur en contenteditable
- Escucha evento `manifiesto:openEditor` desde anotacion-rapida

**Lee de:** `user.notas{}` (mismo objeto que anotacion-rapida)  
**Escribe a:** `user.notas{}` via `saveUser()`

---

### Ventana2 Historial
```
ID: #ventana2-historial
Archivo: src/sections/ventana2-historial.js
```
- Timeline del feedbackBus (todos los eventos del usuario)
- Panel lateral derecho
- Botón para limpiar historial
- **Estado persiste:** lee feedbackBus

---

### Mandala Archive
```
ID: #mandala-archive
Archivo: src/sections/mandala-archive.js
```
- Galería de mandalas guardados (dataURLs)
- Botón descargar individual
- **Estado persiste:** lee user.mandalas[]

---

## 3. FLUJO DE LA APLICACIÓN

```
PRIMERA VISITA:
┌─────────────┐
│  index.html │ → DOMContentLoaded → main.js boot
└─────────────┘
       │
       ▼
  checkOnboarding()
  user.onboardingCompleto === false
       │
       ▼
  #onboarding visible
  Resto de secciones display:none
  Tab-bar y FAB ocultos
       │
       ▼
  Usuario completa formulario (nombre, signo, nacimiento, colores)
       │
       ▼
  initOnboarding() → saveUser({ ...datos, onboardingCompleto: true })
       │
       ▼
  revealApp() → todas las secciones visibles (fade in 0.8s)
       │
       ▼
  VISITA NORMAL (segunda visita en adelante)
```

```
VISITA NORMAL:
┌─────────────┐
│  index.html │ → DOMContentLoaded → main.js boot
└─────────────┘
       │
       ├── applyUserColors(user.colores) → CSS vars --color-personal-1/2/3
       ├── initReveal() → IntersectionObserver en .reveal-item
       ├── initClock() → setInterval 1s
       ├── initDateDisplay() → día + fecha
       ├── initFraseDia() → frase según (día+mes) % 7
       ├── updateDashboardUser() → nombre + modo badge
       ├── updateHeroGreeting() → saludo según hora
       ├── initNavigation() → smooth scroll + spring collapse
       ├── checkOnboarding() → onboardingCompleto=true → skip
       ├── initNebulaShader(#respiracion-canvas)
       ├── initWisdomCanvas()
       ├── initAlucinajeToggle()
       ├── [31 initXxx() de secciones]
       └── [HUDs: color, telemetry, nav-drawer, tweaks, feedback-bus, copy-oracle]
```

---

## 4. CLASES Y MÓDULOS

### main.js (706 líneas — god file, candidato a dividir)

**Exports:**
| Export | Tipo | Descripción |
|--------|------|-------------|
| `USER_KEY` | const | `'apacheta_user'` |
| `USER_DEFAULT` | object | Objeto vacío de usuario nuevo |
| `getUser()` | function | Lee y parsea localStorage → USER_DEFAULT merge |
| `saveUser(data)` | function | Merge + write localStorage + applyColors |
| `applyUserColors(colores)` | function | Setea CSS vars --color-personal-1/2/3 |
| `getModoActual()` | function | Hora → `'manana'` / `'tarde'` / `'noche'` |
| `getModoLabel(modo)` | function | Modo → label con emoji |
| `getModoGreeting(modo, nombre)` | function | Modo + nombre → saludo personalizado |
| `revealApp()` | function | Muestra secciones tras onboarding |
| `updateNebulaColors(colores)` | function | Actualiza uniforms Three.js |

---

### src/sections/ (31 archivos)

| Archivo | Export | Persiste datos |
|---------|--------|----------------|
| onboarding.js | initOnboarding() | sí → user completo |
| dashboard-dia.js | initDashboard(), initFraseWindow() | streak, ultimaNota |
| anotacion-rapida.js | initAnotacion() | **sí → notasList[], notas{}** |
| manifiesto-gestor.js | initManifiestoGestor() | **sí → notas{}** |
| aura-composer.js | initAuraComposer() | sí → aura{}, aura_YYYY-MM-DD |
| mandala.js | initMandala() | sí → mandalas[] |
| modos-dia.js | initModoAlucinaje() | alucinajeActivo |
| color-hud.js | initColorHud() | colores[] |
| telemetry-hud.js | initTelemetryHud() | no (display only) |
| biblioteca.js | initBiblioteca() | no |
| respiracion.js | initRespiracion() | no |
| chakras.js | initChakras() | no (feedbackBus) |
| scratch-reveal.js | initScratchReveal() | no (feedbackBus) |
| ajetreo-sur.js | initAjetreoSur() | no |
| visualising-wisdom.js | initVisualisingWisdom() | copyOverrides |
| calendar-preview.js | initCalendar() | no |
| conexiones-culturales.js | initConexiones() | no |
| mente.js | initMente() | no |
| soplar.js | initSoplar() | no (feedbackBus) |
| glb-mate.js | initGlbMate() | no |
| manifiestos-particles.js | initManifiestosParticles() | no (lee notas) |
| lissajous.js | initLissajous() | no |
| fibonacci.js | initFibonacci() | no |
| morning-journey.js | initMorningJourney() | no |
| meditacion-ojo.js | initMeditacionOjo() | no |
| aura-history.js | initAuraHistory() | no (lee aura_YYYY-MM-DD) |
| lofi.js | initLofi() | no |
| alarma-clock.js | initAlarmaClock() | no |
| gyroscope.js | initGyroscope(), initNameBubble(), initScrollInvites() | no |
| ventana2-historial.js | initVentana2Historial() | no (lee feedbackBus) |
| mandala-archive.js | initMandalaArchive() | no (lee mandalas[]) |

---

### src/core/ (12 archivos)

| Archivo | Tipo | API pública |
|---------|------|-------------|
| feedback-bus.js | Logic | feedbackBus.push/read/readRecent/removeAt/clear/summary |
| spring.js | UI Physics | springTo({from,to,stiffness,damping,onUpdate,onDone}), lerp() |
| icons.js | UI | hydrateIcons() — reemplaza [data-icon] con SVGs |
| nav-drawer.js | UI | initNavDrawer() — drawer flotante con 8 grupos |
| draggable.js | UI | makeDraggable(el) — drag para ventanas flotantes |
| section-tint.js | UI | initSectionTint() — tinting por categoría de sección |
| trail-spawn.js | UI | initTrailSpawn() — partículas que siguen el mouse |
| tweaks-panel.js | UI | initTweaksPanel() — panel de personalización live |
| nota-reader.js | Logic | openNoteReader(nota) — modal de lectura de notas |
| copy-oracle.js | Logic | initCopyOracle() — regenera copys + banners |
| copy-oracle-mock.js | Logic | Mock local cuando MCP no está disponible |
| config-presets.js | Logic | initPresetsFromURL(), initPresetsUI() — presets de color/tema desde URL |

---

### src/components/ (2 archivos)

| Archivo | Función |
|---------|---------|
| feedback-bus-panel.js | Panel lateral derecho: timeline de eventos + botón regenerar |
| oracle-modal.js | Modal de variantes de copy: chips selector + input de intención |

---

### src/data/ (4 archivos)

| Archivo | Contenido |
|---------|-----------|
| challenges.json | 7 desafíos diarios (pregunta + dato + acción + categoría), rota por semana |
| frases.json | 10 frases filosóficas (texto + autor + obra + conexiones), rota por fecha |
| banner-registry.js | 18 imágenes de banner con tags; API: findByTags(tags, n), randomBanner() |
| copy-registry.js | 50+ claves de copy editable; API: applyCopy(key, variant), readCurrent(key) |

---

## 5. ALMACENAMIENTO DE INFORMACIÓN

### Estado actual: localStorage única fuente de verdad

```
localStorage key: 'apacheta_user'
```

```javascript
{
  // Perfil
  nombre:             "Franco",
  signo:              "Aries",
  nacimiento:         "1990-04-15",
  colores:            ["#A8E6E0", "#F4C2C2", "#FFE44D"],
  modoActual:         "manana",            // calculado por hora
  alucinajeActivo:    false,
  onboardingCompleto: true,

  // Contenido principal
  notasList: [                             // array (fuente principal, anotacion-rapida)
    {
      id:     "abc123",
      titulo: "Mi primera nota",
      texto:  "Hoy pensé en...",
      color:  "#FFE44D",
      tags:   ["filosofia", "emocional"],
      ts:     1714000000000
    }
  ],

  notas: {                                 // object keyed por id (manifiesto-gestor)
    "nota_1714000000000": {
      titulo: "Manifiesto de visión",
      texto:  "Quiero construir...",
      tag:    "vision",
      ts:     1714000000000
    }
  },

  // Aura
  aura: {
    calma:       75,
    foco:        60,
    creatividad: 90,
    energia:     45,
    intuicion:   80,
    savedAt:     1714000000000,
    colores:     ["#A8E6E0", "#F4C2C2", "#FFE44D"]
  },

  // Mandalas
  mandalas: [
    {
      id:    "m_abc",
      data:  "data:image/png;base64,...",
      fecha: "2026-04-23"
    }
  ],

  // Feedback Bus (historial de interacciones)
  feedbackBus: [
    { type: "note-written", payload: { titulo: "Mi nota", tags: ["filosofia"] }, ts: 1714000000000 },
    { type: "aura-saved",   payload: { calma: 75 },                             ts: 1714000001000 },
    { type: "chakra-tapped",payload: { chakra: "corazon" },                     ts: 1714000002000 }
  ],

  // Copy Oracle
  ultimasAnotaciones: ["Hoy pensé en...", "El universo..."],
  copyOverrides: {
    "wisdom.top": "LA NADA<br/>ES TODO"
  }
}
```

**Claves adicionales en localStorage (fuera de apacheta_user):**
```
aura_2026-04-23: { calma:75, foco:60, creatividad:90, energia:45, intuicion:80, colores:[...] }
aura_2026-04-22: { ... }
// Una clave por día, historial completo de aura
```

---

## 6. SISTEMA DE HUDs

4 HUDs siempre visibles sobre el contenido:

### Color HUD (izquierda)
```
Archivo: src/sections/color-hud.js
CSS: styles/hud-system.css
z-index: 250
```
- 3 dots arrastrables sobre track vertical
- Cambian `--color-personal-1/2/3` y uniforms Three.js en tiempo real
- Emite `apacheta:colorsChanged` → persiste via saveUser()

### Telemetry HUD (arriba derecha)
```
Archivo: src/sections/telemetry-hud.js
CSS: styles/hud-system.css
```
- Display: SYS (tema) · MODO (hora) · HORA (clock) · ALT (giroscopio) · SEC (sección actual) · NOTAS (count)
- IntersectionObserver detecta qué sección está en viewport
- Read-only, tap dot para toggle

### Nav Drawer (botón flotante)
```
Archivo: src/core/nav-drawer.js
CSS: styles/hud-system.css
```
- Botón circular arriba derecha con pulso de color cíclico (2.2s)
- Abre drawer vertical con 8 grupos: dashboard · manana · meditar · crear · sonidos · leer · escribir · archivo
- Grid 2 columnas con iconos SVG
- Telemetry readout: MODO · STREAK · SECCIÓN

### Tweaks Panel (abajo derecha)
```
Archivo: src/core/tweaks-panel.js
CSS: styles/hud-system.css, tweaks-modes.css
```
- Trigger: "// EDIT VIEWER · LIVE"
- Tabs: ACENTO (colores) / TÍTULOS (fuente) / FONDO (tema)
- Live apply a DOM + sessionStorage
- Fuentes: Playfair Display / Instrument Serif / Share Tech Mono
- Tamaño texto: 0.9x / 1x / 1.15x
- Layout: editorial / compact / outline
- Tema: nature / dark / hallucination

---

## 7. SISTEMA DE EVENTOS (CustomEvents)

Toda la comunicación entre secciones usa `window.dispatchEvent(new CustomEvent(...))`:

| Evento | Quién lo emite | Quién lo escucha |
|--------|----------------|------------------|
| `apacheta:colorsChanged` | color-hud.js | main.js (nebulosa), secciones con colores |
| `apacheta:feedback` | feedback-bus.js | feedback-bus-panel.js |
| `apacheta:feedback:removed` | feedback-bus.js | feedback-bus-panel.js |
| `apacheta:feedback:cleared` | feedback-bus.js | feedback-bus-panel.js |
| `apacheta:auraSaved` | aura-composer.js | telemetry-hud.js |
| `apacheta:oracle:regenerate-all` | feedback-bus-panel.js | copy-oracle.js |
| `apacheta:copy:regenerated` | copy-oracle.js | oracle-modal.js, secciones |
| `manifiesto:openEditor` | anotacion-rapida.js | manifiesto-gestor.js |
| `nota-edit-request` | nota-reader.js | anotacion-rapida.js |
| `nota-delete-request` | nota-reader.js | anotacion-rapida.js |

---

## 8. FEEDBACK BUS + COPY ORACLE

### Feedback Bus
```
Archivo: src/core/feedback-bus.js
```
Acumulador de eventos del usuario. Máximo 500 entradas, luego FIFO.

**Tipos de evento registrados:**
```
like · dislike · aura-saved · mandala-saved · note-written
slice · midi-play · streak-day · section-view-long
scratch-revealed · chakra-tapped · frase-saved
color-changed · mode-changed · preset-applied · copy-regenerated
```

**API:**
```javascript
feedbackBus.push({ type, payload, ts })   // registrar evento
feedbackBus.read()                        // todos los eventos
feedbackBus.readRecent(n)                 // últimos n eventos
feedbackBus.summary()                     // { total, byType, first, last }
feedbackBus.clear()                       // vaciar
```

Expuesto como `window.feedbackBus` para acceso global.

### Copy Oracle
```
Archivo: src/core/copy-oracle.js (real, vía MCP NotebookLM)
Fallback: src/core/copy-oracle-mock.js (local si MCP no disponible)
```
- Lee los últimos N eventos del feedbackBus
- Consulta a `window.apachetaMCPQuery` (NotebookLM)
- Genera variantes de copy para cada key del copy-registry
- Aplica via `applyCopy(key, variant)` del copy-registry
- Guarda overrides en `user.copyOverrides`

---

## 9. SHADER THREE.JS (NEBULOSA)

```
Inicializado en: main.js, función initNebulaShader(canvas)
Canvas activos: #respiracion-canvas, #alucinaje-canvas
Control: IntersectionObserver (start/stop según visibilidad)
```

**Vertex shader:** Pasa coordenadas UV al fragment shader.

**Fragment shader:** 4 capas de softNoise (sumas de senos), blend de 3 colores personales del usuario, vignette en bordes. Optimizado para mobile (sin Perlin noise pesado, solo sines).

**Uniforms actualizables en runtime:**
```javascript
uniforms3D.uColor1.value.set(hex)   // → updateNebulaColors(colores)
uniforms3D.uMouse.value.set(x, y)   // → mousemove / touchmove
uniforms3D.uTime.value              // → incrementado en animación
```

---

## 10. CSS Y DESIGN TOKENS

### Archivos CSS (11 archivos, ~7.500 líneas total)

| Archivo | Líneas | Propósito |
|---------|--------|-----------|
| variables.css | 153 | Design tokens |
| global.css | 521 | Base styles, tipografía |
| animations.css | 233 | @keyframes |
| sections.css | 1618 | Secciones legacy |
| new-sections.css | 2250 | Secciones nuevas |
| hud-system.css | 839 | HUDs (color, telemetry, nav-drawer, tweaks) |
| tweaks-modes.css | 870 | Temas (nature/dark/hallucination) + layouts |
| oracle.css | 200 | Copy oracle modal + toasts |
| ventana2.css | 381 | Feedback bus panel |
| folders.css | 89 | Vistas de carpetas/archivo |
| manifiesto-gestor.css | 407 | Editor de manifiestos |

### Variables principales (variables.css)

```css
/* Colores del usuario (seteadas por JS) */
--color-personal-1: #A8E6E0;
--color-personal-2: #F4C2C2;
--color-personal-3: #FFE44D;

/* Paleta base */
--bg-primary: #ffffff;
--bg-soft: #f8f6f2;
--text-primary: #0e0e12;
--text-secondary: #4a4a5a;

/* Acentos fijos */
--accent-cyan:    #A8E6E0;
--accent-rosa:    #F4C2C2;
--accent-amber:   #FFE44D;
--accent-lavanda: #D4C5E8;
--accent-sage:    #B8D4B0;

/* Colores por categoría de sección */
--section-filosofia: #2D5016;
--section-tech:      #0D1F2D;
--section-emocional: #2D1B2D;
--section-alucinaje: #1A1A2D;
--section-noche:     #0e0e12;

/* Tipografía */
--font-display: 'Playfair Display', serif;
--font-body:    'Inter', sans-serif;
--font-mono:    'Share Tech Mono', monospace;

/* Escalas de tipo */
--text-display: clamp(2.8rem, 8vw, 5.5rem);
--text-hero:    clamp(2rem, 5vw, 3.5rem);
--text-title:   clamp(1.5rem, 3vw, 2rem);
--text-body:    1rem;
--text-small:   0.875rem;

/* Espaciado */
--space-xs:  0.25rem;  /* 4px  */
--space-sm:  0.5rem;   /* 8px  */
--space-md:  1rem;     /* 16px */
--space-lg:  1.5rem;   /* 24px */
--space-xl:  2rem;     /* 32px */
--space-2xl: 3rem;     /* 48px */
--space-3xl: 4rem;     /* 64px */
--space-4xl: 8rem;     /* 128px */

/* Transiciones */
--transition-soft:   all 0.3s ease;
--transition-spring: all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
--transition-expo:   all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
```

---

## 11. ARQUITECTURA OBJETIVO (VERCEL + MONGODB)

### Diagrama general

```
┌─────────────────────────────────────────────────────────────┐
│                        VERCEL                               │
│                                                             │
│  ┌──────────────────────┐    ┌───────────────────────────┐  │
│  │   FRONTEND           │    │   API ROUTES (Serverless) │  │
│  │   Vite SPA           │◄──►│   /api/user               │  │
│  │   misma repo         │    │   /api/notes              │  │
│  │   /dist              │    │   /api/notes/:id          │  │
│  │                      │    │   /api/manifiestos        │  │
│  │   UserStore.js       │    │   /api/manifiestos/:id    │  │
│  │   NotasStore.js      │    │   /api/aura               │  │
│  │   AuraStore.js       │    │   /api/oracle             │  │
│  │   client.js          │    └───────────┬───────────────┘  │
│  └──────────────────────┘                │                  │
└──────────────────────────────────────────┼──────────────────┘
                                           │
                              ┌────────────▼──────────────┐
                              │      MongoDB Atlas         │
                              │      DB: apacheta_prod     │
                              │                           │
                              │  Collections:             │
                              │  · users                  │
                              │  · notas                  │
                              │  · manifiestos            │
                              │  · aura_history           │
                              └───────────────────────────┘
```

### Estructura de archivos objetivo

```
apacheta/
├── src/                          ← FRONTEND (igual que hoy + stores)
│   ├── state/
│   │   ├── UserStore.js          ← reemplaza getUser/saveUser
│   │   ├── NotasStore.js         ← CRUD notas con API sync
│   │   └── AuraStore.js          ← aura + history
│   ├── api/
│   │   └── client.js             ← fetch wrapper con userId header
│   ├── sections/                 ← igual que hoy
│   ├── core/                     ← igual que hoy
│   └── main.js                   ← dividido en:
│       ├── boot.js
│       ├── shader-init.js
│       └── nav-controller.js
│
├── api/                          ← BACKEND (nuevo)
│   ├── user.js                   ← GET/POST/PATCH /api/user
│   ├── notes.js                  ← GET/POST /api/notes
│   ├── notes/
│   │   └── [id].js               ← PATCH/DELETE /api/notes/:id
│   ├── manifiestos.js            ← GET/POST /api/manifiestos
│   ├── manifiestos/
│   │   └── [id].js               ← PATCH/DELETE /api/manifiestos/:id
│   ├── aura.js                   ← GET/POST /api/aura
│   └── _lib/
│       ├── db.js                 ← MongoDB connection (singleton)
│       ├── auth.js               ← verifica X-Apacheta-User-Id
│       └── models.js             ← Mongoose schemas
│
├── vercel.json                   ← rewrites + env vars ref
└── .env.local                    ← MONGODB_URI (no commitear)
```

### Schemas MongoDB

**Collection: users**
```javascript
{
  _id:                ObjectId,
  userId:             String,    // device fingerprint, unique index
  nombre:             String,
  signo:              String,
  nacimiento:         Date,
  colores:            [String],  // ["#hex", "#hex", "#hex"]
  alucinajeActivo:    Boolean,
  onboardingCompleto: Boolean,
  createdAt:          Date,
  updatedAt:          Date
}
```

**Collection: notas**
```javascript
{
  _id:       ObjectId,
  userId:    String,     // index
  titulo:    String,
  texto:     String,
  color:     String,     // hex
  tags:      [String],
  categoria: String,     // carpeta en manifiesto-gestor
  ts:        Number,     // timestamp original del cliente
  createdAt: Date,
  updatedAt: Date
}
```

**Collection: manifiestos**
```javascript
{
  _id:       ObjectId,
  userId:    String,
  titulo:    String,
  texto:     String,
  tag:       String,     // carpeta (filosofia, vision, tech, etc.)
  tags:      [String],
  ts:        Number,
  createdAt: Date,
  updatedAt: Date
}
```

**Collection: aura_history**
```javascript
{
  _id:        ObjectId,
  userId:     String,
  fecha:      String,    // "YYYY-MM-DD", unique per userId
  calma:      Number,    // 0-100
  foco:       Number,
  creatividad:Number,
  energia:    Number,
  intuicion:  Number,
  colores:    [String],
  savedAt:    Number
}
```

### Auth (fase 1 — sin OAuth)

```javascript
// Generado en el cliente al primer boot
const userId = localStorage.getItem('apacheta_uid') 
  || crypto.randomUUID();
localStorage.setItem('apacheta_uid', userId);

// Enviado en todas las requests
fetch('/api/notes', {
  headers: { 'X-Apacheta-User-Id': userId }
})

// Verificado en cada endpoint
// api/_lib/auth.js
export function getUserId(req) {
  return req.headers['x-apacheta-user-id'] || null;
}
```

### Endpoints REST

```
GET    /api/user                → perfil del usuario
POST   /api/user                → crear usuario (onboarding)
PATCH  /api/user                → actualizar perfil

GET    /api/notes               → todas las notas del user
POST   /api/notes               → crear nota
PATCH  /api/notes/:id           → actualizar nota
DELETE /api/notes/:id           → eliminar nota

GET    /api/manifiestos         → todos los manifiestos del user
POST   /api/manifiestos         → crear manifiesto
PATCH  /api/manifiestos/:id     → actualizar (auto-save)
DELETE /api/manifiestos/:id     → eliminar

GET    /api/aura                → historial de aura (últimos 30 días)
POST   /api/aura                → guardar aura del día (upsert por fecha)
```

---

## 12. DIVISIÓN DE TRABAJO: FRANCO / PULPO

### FRANCO — Frontend

**Puede arrancar ya (no necesita que Pulpo termine):**

1. **Dividir main.js** — extraer a `boot.js`, `shader-init.js`, `nav-controller.js`
2. **Crear `src/api/client.js`** — fetch wrapper con userId header + fallback localStorage
3. **Crear `src/state/UserStore.js`** — mismo API que getUser/saveUser pero async + fallback
4. **Crear `src/state/NotasStore.js`** — CRUD con fallback offline
5. **Modificar `anotacion-rapida.js`** — usar NotasStore.create() en lugar de saveUser directamente
6. **Modificar `manifiesto-gestor.js`** — usar NotasStore.getAll() + NotasStore.update()

**Archivos críticos para Franco:**
- [src/main.js](src/main.js) — dividir
- [src/sections/anotacion-rapida.js](src/sections/anotacion-rapida.js) — conectar store
- [src/sections/manifiesto-gestor.js](src/sections/manifiesto-gestor.js) — conectar store
- [src/sections/aura-composer.js](src/sections/aura-composer.js) — conectar AuraStore

---

### PULPO — Backend

**Puede arrancar en paralelo:**

1. **`api/_lib/db.js`** — conexión MongoDB con connection caching para serverless
2. **`api/_lib/models.js`** — Mongoose schemas (User, Nota, Manifiesto, AuraHistory)
3. **`api/_lib/auth.js`** — middleware getUserId(req)
4. **`api/user.js`** — GET + POST + PATCH
5. **`api/notes.js`** + **`api/notes/[id].js`** — CRUD completo
6. **`api/manifiestos.js`** + **`api/manifiestos/[id].js`** — CRUD completo
7. **`api/aura.js`** — GET historial + POST upsert diario
8. **`vercel.json`** — configuración de rewrites

**Variables de entorno necesarias (Pulpo configura):**
```
MONGODB_URI=mongodb+srv://...@cluster.mongodb.net/apacheta_prod
```

---

### Punto de integración

Pulpo documenta el primer endpoint funcional (`GET /api/user`) con ejemplo curl.  
Franco lo conecta en `UserStore.js` y verifica que la app sigue funcionando con fallback.

A partir de ahí, integran endpoint por endpoint sin bloquear al otro.

---

*Documento generado el 2026-04-23 · Apacheta v2.1*
