# ARCHITECTURE15AB.md
## Apacheta — Master Context Document
### Generated: 2026-04-15 | Version: 15AB

---

## SECTION 1 — FILE TREE

```
apacheta/
├── index.html                          # Main HTML shell — all sections, DOM structure, CDN fonts
├── package.json                        # Project manifest: name, version, deps (three, vite)
├── package-lock.json                   # Lockfile for npm deps
├── vite.config.js                      # Vite config: port 3005, LAN host, GLB/GLTF asset support
│
├── styles/
│   ├── variables.css                   # Design tokens: colors, typography scale, spacing, shadows, gradients, z-index, glass, easing
│   ├── global.css                      # Reset, body, layout (.section), nav, tab-bar, cards, buttons, FAB, badges, utilities
│   ├── animations.css                  # All @keyframes + animation utility classes + card-flip CSS + modal-sheet CSS
│   ├── sections.css                    # Per-section visual styles: onboarding, dashboard, hero-morning, wisdom, ajetreo, biblioteca, manifiestos, scratch, respiracion, chakras, modos, calendar, anotacion, frases, conexiones
│   └── new-sections.css                # Styles for sections 16–21: mente, soplar, aura-composer, mandala, glb-mate, experimental panel, name-bubble, scroll-invite, + improvements to existing sections
│
├── src/
│   ├── main.js                         # Entry point: USER_KEY/USER_DEFAULT/getUser/saveUser/applyUserColors, getModoActual/getModoLabel/getModoGreeting, initReveal (IntersectionObserver), initClock, initDateDisplay, initNavigation, FRASES_HERO array, initFraseDia, updateDashboardUser, THREE.js nebulosa shader (vertexShader + fragmentShader), initNebulaShader, startNebulaRender, stopNebulaRender, updateNebulaColors, initNebulaVisibility, initAlucinajeToggle, initWisdomCanvas, checkOnboarding, revealApp, DOMContentLoaded boot sequence
│   │
│   └── sections/
│       ├── onboarding.js               # Color picker (6 swatches, max 3 selected), nombre/signo/fecha inputs, gradient preview, saveUser + revealApp on submit, shake animation on empty name
│       ├── dashboard-dia.js            # CHALLENGES array (7 rotating), initDashboard: challenge by date idx, totalNotas stat from localStorage, updateDashboardOrbs with user colors
│       ├── biblioteca.js               # Card flip 3D on click (touch: only if delta < 8px), filter pills (opacity/scale toggle), mousemove hover glow (perspective rotateX/Y)
│       ├── respiracion.js              # MODOS object (478/box/coherencia), phase-based animation (scale 1.35 inhale, 1 exhale), Vibration API, countdown timer, start/stop toggle
│       ├── chakras.js                  # CHAKRAS_DATA array (7 items with nombre/sanskrit/color/emoji/desc/elemento/sentido/mantra/practica/conexion), modal open/close, swipe-down-to-close (80px threshold), innerHTML modal content generation
│       ├── ajetreo-sur.js              # Three.js: 5 MeshStandardMaterial spheres labeled FILOSOFÍA/TECH/YOGA/MÚSICA/SIDERAL, floating sinusoidal motion, mouse/touch repulsion (dist < 2 → push), IntersectionObserver start/stop, ResizeObserver
│       ├── visualising-wisdom.js       # Stagger reveal of .wisdom__word elements via IntersectionObserver (opacity + translateY)
│       ├── modos-dia.js                # FRASES_ALUCINAJE (5 items) + CONEXIONES (5 items), IntersectionObserver triggers setInterval(6000ms) rotation with opacity fade transitions
│       ├── scratch-reveal.js           # SCRATCH_CONTENT (4 cards), Canvas 2D destination-out mechanic, IntersectionObserver lazy init, getScratchPercent() sampling every 4px, drawCircle() erases overlay, reveal() at >50% scratched
│       ├── calendar-preview.js         # renderWeek() Mon–Sun grid from current date, has-note indicator from localStorage.notas[YYYY-MM-DD], renderNotas() last 4 notes, openDayNote() pre-fills anotacion modal
│       ├── conexiones-culturales.js    # CONEXIONES_DATA (3 conceptos: naranja/agua/tiempo × 5 culturas), date-based concepto rotation, cultura pill select (max 3, min 1), renderPerspectivas() innerHTML
│       ├── anotacion-rapida.js         # FAB + modal-sheet open/close, swipe-to-close in top 25% zone, tag auto-suggest by keyword matching, save to localStorage notas[YYYY-MM-DD], post-it mini preview, showToast()
│       ├── mente.js                    # PALABRAS (4 kinetic typography words), MICRO_CARDS (5 concept cards), initMenteCanvas() with 3 animated radial gradient orbs using screen blend mode, user name bubble
│       ├── soplar.js                   # Web Audio API: getUserMedia, AnalyserNode (fftSize 512), RMS blow detection (threshold 0.04), blowLevel accumulator, Canvas 2D ripples, reward state at blowLevel >= 0.99
│       ├── aura-composer.js            # PARAMS (5: calma/foco/creatividad/energia/intuicion), dynamically built MIDI-style sliders (input[type=range] invisible over custom track), Canvas 2D aura with screen blend radial gradients, save to localStorage.aura
│       ├── mandala.js                  # Canvas 2D 8-fold symmetry drawing, stroke history array for redraw, sinusoidal guide circles + axis lines, color cycles through user.colores, save to PNG
│       ├── glb-mate.js                 # Three.js: dynamic GLTFLoader import from unpkg CDN, loads /glb/mate.yerba.glb, procedural sphere fallback, swipe-right (80px) opens experimental panel, RESPUESTAS keyword-based chat, typewriter effect for bot messages
│       └── gyroscope.js               # DeviceOrientationEvent.requestPermission() for iOS 13+, beta/gamma → parallax on .orb/.parallax-layer, mouse fallback, initNameBubble() injects floating glassmorphism bubble, initScrollInvites() appends .scroll-invite to [data-invite] sections
│
├── src/data/
│   ├── frases.json                     # 10 wisdom quotes with autor, obra, categoria, conexiones array — used as data reference (not imported in current build, content duplicated in main.js)
│   └── challenges.json                 # 7 daily challenges with dia, pregunta, dato, accion, categoria — data reference (content duplicated in dashboard-dia.js)
│
├── public/
│   └── (static assets, /glb/mate.yerba.glb expected here)
│
├── dist/
│   └── (Vite production build output — index.html + assets/)
│
├── scree/
│   ├── WhatsApp Image 2026-04-15 at 02.49.24.jpeg   # Screenshot: app in use
│   ├── WhatsApp Image 2026-04-15 at 02.49.44.jpeg   # Screenshot: app in use
│   ├── WhatsApp Image 2026-04-15 at 02.49.52.jpeg   # Screenshot: app in use
│   ├── WhatsApp Image 2026-04-15 at 02.50.34.jpeg   # Screenshot: app in use
│   ├── WhatsApp Image 2026-04-15 at 02.50.40.jpeg   # Screenshot: app in use
│   └── WhatsApp Image 2026-04-15 at 02.50.52.jpeg   # Screenshot: app in use
│
├── APACHETA_ARCHITECTURE.md            # Older architecture doc (superseded by this file)
├── APACHETA_MANIFIESTO.md              # Product vision and philosophy doc
├── APACHETA_PROJECT_BRIEF.md           # Initial project brief
├── APACHETA_ROADMAP.md                 # Development roadmap
├── ARCHITECTURE15AB.md                 # THIS FILE — master context document
└── PROMPT_APACHETA_ETAPA1.md           # AI prompt used for Etapa 1 build
```

---

## SECTION 2 — TECH STACK

### Runtime Dependencies (package.json)

| Package | Version | Role |
|---------|---------|------|
| `three` | `^0.160.0` | 3D WebGL rendering: nebulosa shader, ajetreo-sur bubbles, GLB mate viewer |
| `vite` | `^5.0.0` (devDep) | Build tool + dev server on port 3005 |

### CDN Imports (detected in source)

| Resource | URL | Used in |
|----------|-----|---------|
| Google Fonts | `https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500;1,600&family=Inter:wght@300;400;500;600&family=Share+Tech+Mono&display=swap` | `styles/variables.css` — imported via `@import url()` |
| GLTFLoader | `https://unpkg.com/three@0.160.0/examples/jsm/loaders/GLTFLoader.js` | `src/sections/glb-mate.js` — dynamic `import()` at runtime |

### Browser APIs Used

| API | Section |
|-----|---------|
| `localStorage` | main.js, onboarding, dashboard, anotacion, aura-composer, calendar, mandala, mente, glb-mate, gyroscope |
| `IntersectionObserver` | main.js (reveal, nebulosa), ajetreo-sur, scratch-reveal, visualising-wisdom, modos-dia, glb-mate |
| `ResizeObserver` | ajetreo-sur |
| `navigator.mediaDevices.getUserMedia` | soplar (microphone) |
| `AudioContext` / `AnalyserNode` | soplar |
| `DeviceOrientationEvent` | gyroscope |
| `navigator.vibrate` | respiracion |
| `canvas.toDataURL` | mandala (save PNG) |
| `Canvas 2D API` | scratch-reveal, aura-composer, mandala, soplar (ripples), mente (orbs), main.js (wisdom canvas) |
| `WebGL / Three.js` | main.js (nebulosa shader), ajetreo-sur, glb-mate |
| `requestAnimationFrame` | mandala, aura-composer, mente, soplar, main.js (wisdom canvas), glb-mate |

### No Frameworks

This is **100% vanilla JavaScript** (ES6+ modules). No React, Vue, Angular, or any component framework. No state management library. No CSS preprocessor.

### Language / Module System

- **JavaScript**: ES Modules (`type: "module"` in package.json), all files use `import`/`export`
- **CSS**: 5 plain CSS files loaded via `<link>` in index.html
- **HTML**: Single-page app, all sections in one `index.html`

### Dev Server

```
npm run dev   → vite --port 3005 (host: true = accessible on LAN via IP)
npm run build → vite build → dist/
npm run preview → vite preview
```

---

## SECTION 3 — APP SECTIONS / COMPONENTS

### Boot Sequence (main.js)

On `DOMContentLoaded`, main.js executes in this order:
1. `applyUserColors(user.colores)` — CSS vars set immediately
2. `initReveal()` — IntersectionObserver on all `.reveal-item`
3. `initClock()` + `initDateDisplay()` — live clock + Spanish date
4. `initFraseDia()` — fills `#hm-frase`, `#dash-frase`, `#dash-autor`
5. `updateDashboardUser()` — name, mode badge, mode label
6. `updateHeroGreeting()` — fills `#hm-greeting` based on time
7. `initNavigation()` — smooth scroll for `[data-section]` + `a[href^="#"]`
8. `checkOnboarding()` — show/hide onboarding vs main app
9. `initNebulaShader(respCanvas)` + `initNebulaVisibility()`
10. `initWisdomCanvas()`
11. `initAlucinajeToggle()`
12. All 12 section init functions (in order listed in imports)
13. `initGyroscope()` + `initNameBubble()` + `initScrollInvites()`

---

### Section 1: Onboarding
**ID:** `#onboarding`  
**Visual:** Full-screen white card centered on page, pastel orb background, two blur orbs.  
**Functional:**
- Input: `nombre` (required), `signo` (optional), `nacimiento` (date, optional)
- Color picker: 6 pastel swatches in a grid, select up to 3. Selected colors update gradient preview bar and live CSS vars in real time.
- Submit: saves to localStorage, triggers fade-out animation (opacity 0, translateY -20px over 600ms), then calls `revealApp()`
- Enter key on any input submits
- Shake animation on empty nombre submission (reuses `scratchHint` keyframe)
**Data writes:** `localStorage['apacheta_user']` with `{nombre, signo, nacimiento, colores, onboardingCompleto: true}`

---

### Section 2: Hero Morning
**ID:** `#hero-morning`  
**Visual:** Cream background, giant display time (HH:MM), day name + date in Spanish, animated aura radial gradient, two floating cards (rotated), fixed nav pills above tab-bar.  
**Functional:**
- Live clock updates every 1000ms
- Frase del día from `FRASES_HERO[idx]` where `idx = (date + month) % 7`
- Nav pills scroll to target sections
- `morning-card--main`: shows frase + autor
- `morning-card--date`: shows day name + date
**Data reads:** `localStorage['apacheta_user'].nombre`, current time

---

### Section 3: Dashboard del Día
**ID:** `#dashboard`  
**Visual:** Cream bg, large name display with mode badge, stats row (obras count), main day-card with challenge, two floating mini-cards.  
**Functional:**
- Greeting: "BUENOS DÍAS" + user's nombre
- Mode badge: colored by time (morning/tarde/noche/alucinaje), labels in Spanish
- Challenge of the day: `CHALLENGES[(date+month) % 7]` — pregunta + dato + accion
- Stats: counts `Object.keys(user.notas).length` for "obras exploradas"
- Three background orbs styled with user's personal colors (dash-orb-1/2/3)
- Two float-cards: "Próxima práctica" + "Tu aura hoy" (static content, visual only)
**Data reads:** `localStorage['apacheta_user'].nombre`, `.notas`, `.colores`, time-based mode

---

### Section 4: Visualising Wisdom
**ID:** `#visualising-wisdom`  
**Visual:** White bg, large bold "I AM NOTHING" title left-bordered, framed canvas area with 5 animated color orbs, 6 floating numbered words, "I AM EVERYTHING" title below, color strip, author attribution.  
**Functional:**
- Canvas: 5 radial gradient orbs (pink, yellow, terracotta, amber, pink) drift via sin/cos — always running (`requestAnimationFrame` loop in `main.js`)
- 6 `.wisdom__word` elements with numbered superscripts stagger-reveal on IntersectionObserver (opacity + translateY, 0.15s per word)
- Color strip: 4 hardcoded pastel spans
**Key interaction:** Scroll-triggered word reveal  
**Data reads:** None

---

### Section 5: Ajetreo Sur (Contexts)
**ID:** `#ajetreo-sur`  
**Visual:** Cream bg, full-screen Three.js canvas with 5 labeled translucent colored spheres.  
**Functional:**
- 5 `THREE.MeshStandardMaterial` spheres with opacity 0.5, roughness 0.1
- Labels: FILOSOFÍA, TECH, YOGA, MÚSICA, SIDERAL
- Float motion: `sin(t * speed + offset) * floatAmp` per axis
- Mouse/touch repulsion: if pointer within dist 2, push away by 0.04 units
- Rotation: `rotation.y = t * 0.1 + i`
- `IntersectionObserver(threshold: 0.1)`: stops `requestAnimationFrame` when off-screen
- `ResizeObserver`: updates renderer + camera aspect
**Data reads:** `localStorage['apacheta_user'].colores` for sphere colors

---

### Section 6: Biblioteca
**ID:** `#biblioteca`  
**Visual:** White bg, 2×2 grid of square obra cards with front/back faces.  
**Functional:**
- **Card flip 3D**: CSS `preserve-3d` + `rotateY(180deg)` on `.flipped` class. Touch: only toggles if `|deltaY| < 8px` (prevents accidental flip on scroll)
- **Front**: image + title + author + category tag
- **Back**: notes, connections list, tag pill
- **Filter pills**: `data-filter` on pills + cards, non-matching cards go to opacity 0.2, scale 0.95, pointer-events none
- **Hover glow**: `mousemove` → `perspective(600px) rotateY(xDeg) rotateX(-yDeg) translateY(-2px)` on each card
**Data reads:** None (hardcoded HTML cards for Kind of Blue, GEB, Meditaciones, A Love Supreme)  
**Bug:** Hover glow applies transform inline, conflicts with filter transition transform

---

### Section 7: Manifiestos
**ID:** `#manifiestos`  
**Visual:** Hero with animated nebulosa gradient bg + 4 manifiesto articles with distinct section backgrounds.  
**Functional:** Static content only. No JS behavior.  
**Sections:**
- Hero: animated `gradShift` bg, eyebrow tags, title, desc, CTA
- Filosofía item: `#2D5016` bg / `#FFE44D` text
- Tech item: `#1B2B4B` bg / white text
- Emocional item: `#E8E8E8` bg / `#1A1A1A` text
- Alucinaje item: `#F4C2C2` bg / `#A8E6E0` text

---

### Section 8: Scratch Reveal
**ID:** `#scratch-reveal`  
**Visual:** Soft bg, 2×2 grid of 4/5 aspect ratio cards with colorful overlay that erases on scratch.  
**Functional:**
- Each card: Canvas 2D positioned absolute over `.scratch-card__content`
- `globalCompositeOperation = 'destination-out'` to erase the gradient overlay
- `drawCircle(x, y, r=30)` on mousedown/mousemove, `r=34` on touch
- `getScratchPercent()` samples every 4th pixel from `getImageData`; called every 15 strokes
- `reveal()` at >50%: adds `.revealed` class, clears canvas, replaces content with `showRevealedContent()`
- Lazy init via IntersectionObserver (avoids W=0/H=0 if off-screen at load)
**Content:** 4 wisdom cards — Física cuántica+Buda, El azul no existía, 432Hz, Fibonacci  
**Data reads:** None

---

### Section 9: Respiración
**ID:** `#respiracion`  
**Visual:** White bg, Three.js nebulosa shader full-bleed canvas behind, centered breathing circle with rings, countdown number, guide text, mode selector pills.  
**Functional:**
- `MODOS`: `478` (4-7-8s), `box` (4-4-4-4s), `coherencia` (5-5s)
- Circle scale: `transform: scale(1.35)` on inhale, `scale(1)` on exhale, hold sustains
- `navigator.vibrate()`: 80ms inhale, [40,20,40] exhale, 20ms hold
- Countdown `setInterval(1000ms)` per phase
- `breathTimeout = setTimeout(runFase, fase.duracion)` chains phases
- Nebulosa shader activated by `IntersectionObserver` in main.js (shared renderer)
**Data reads:** None

---

### Section 10: Chakras
**ID:** `#chakras`  
**Visual:** White bg, vertical list of 7 chakra items with colored orbs + pulsing animation.  
**Functional:**
- 7 items: Muladhara(🔴) → Sahasrara(🟣)
- Click → modal-sheet opens, content generated via `innerHTML` (emoji, sanskrit, nombre, desc, 3-col grid: elemento/sentido/mantra, práctica, conexión sideral)
- Close: overlay click or swipe-down 80px
- Each `.chakra-item__orb` uses `chakraPulse` animation
**Data source:** `CHAKRAS_DATA` array in chakras.js (hardcoded, complete)

---

### Section 11: Modos del Día (4 sub-sections)
**IDs:** `#modo-manana`, `#modo-tarde`, `#modo-noche`, `#modo-alucinaje`  
**Visual:** 4 full-screen sections with distinct backgrounds:
- Mañana: cream, motivational
- Tarde: `#2D5016` dark green, yellow text
- Noche: `#1A1A2E` dark navy, light text
- Alucinaje: `#F4C2C2` pink, cyan text
**Functional (Alucinaje):**
- `FRASES_ALUCINAJE` array (5 items) + `CONEXIONES` array (5 items)
- IntersectionObserver (threshold 0.3) starts `setInterval(6000ms)`
- Each tick: opacity 0 → timeout → update text → opacity 1 transition on title (300ms delay), frase (500ms), conexion (700ms)
- `trackingWide` CSS keyframe animation on alucinaje title (letter-spacing pulses)
**Data reads:** Mode determined by time via `getModoActual()`

---

### Section 12: Calendar Preview
**ID:** `#calendar-section` (wrapper), `#calendar` (inner)  
**Visual:** Soft bg, 7-column week grid (Mon–Sun), dots for days with notes, 2×2 grid of recent notes.  
**Functional:**
- Week rendered from current Monday, `isToday` highlighted black
- `has-note` dot indicator if `user.notas[YYYY-MM-DD]` exists
- Click day → `fab-anotacion.click()` (opens annotation modal), pre-fills title and textarea with existing note
- `renderNotas()`: last 4 notes sorted descending by date, colored alternately (amarilla/cyan/rosa/lavanda)
- `formatDate()`: "Hoy", "Ayer", or day abbreviation
**Data reads/writes:** `localStorage['apacheta_user'].notas`

---

### Section 13: Conexiones Culturales
**ID:** `#conexiones`  
**Visual:** Cream bg, concepto-del-día headline, culture selector pills, perspectiva cards below.  
**Functional:**
- 5 cultura pills: Griega, Azteca, Oriental (default selected), Andina, Africana
- Max 3 selected, min 1 (cannot deselect last one)
- Concepto rotates by `(date+month) % 3`: naranja / agua / tiempo
- `renderPerspectivas()`: generates `.perspectiva-card` innerHTML for each selected culture's text
**Data source:** `CONEXIONES_DATA` (3 conceptos × 5 perspectivas, all hardcoded in JS)

---

### Section 14: Anotación Rápida (FAB + Modal)
**ID (FAB):** `#fab-anotacion`  
**ID (Modal):** `#anotacion-modal`  
**Visual:** Fixed FAB (+ button, rotates 45° when open), bottom-sheet modal with handle, textarea, tag pills, two action buttons.  
**Functional:**
- FAB toggles modal open/close, applies `.open` class to FAB (rotate 45°), modal, overlay
- `body.overflow = 'hidden'` when open
- Swipe-to-close: only active when touch starts in top 25% of modal; tracks `translateX(-50%) translateY(delta)` during drag; `transition = 'none'` during drag, restored on touchend; closes if delta > 90px
- Tags: filosofia, tech, emocional, sideral, musical, yoga — auto-highlight via keyword matching on textarea input
- Save: stores `{texto, tags, ts}` to `user.notas[YYYY-MM-DD]`, updates `ultimasAnotaciones[3]`, shows post-it mini preview + toast
- Manifiesto btn: same as save, then smooth-scrolls to `#manifiestos`
- `showToast()`: injects temporary DOM element with fadeUp animation, auto-removes after 2500ms
**Data writes:** `localStorage['apacheta_user'].notas`, `.ultimasAnotaciones`

---

### Section 15: Frases (Editorial Quotes)
**ID:** `#frases`  
**Visual:** 3 full-screen quote sections with large serif text, animated aura orb, mono number labels, author attribution.  
**Functional:** Static HTML only. No JS behavior.  
**Content:** 3 hardcoded quotes with distinct colored backgrounds.

---

### Section 16: Mente / Consciencia
**ID:** `#mente`  
**Visual:** White bg, animated canvas orbs (screen blend), kinetic typography words, horizontal scroll of 5 concept cards, side text label, name bubble.  
**Functional:**
- 4 words rendered: `m i n d .` (giant), `b r e a t h e .` (mid), `p r e s e n c i a` + `c o n s c i e n c i a` (small) — added to `#mente-word-track` as `.reveal-item` elements
- 5 concept cards horizontally scrollable: Flujo, Fractal, Origen, Ahora, Espejo
- Canvas: 3 orbs using `screen` composite mode with user's personal colors, `t += 0.004` per frame
- Name bubble: `#mente-name-bubble` filled with `user.nombre`
**Data reads:** `localStorage['apacheta_user'].colores`, `.nombre`

---

### Section 17: Soplar (Blow Interaction)
**ID:** `#soplar`  
**Visual:** White bg, kinetic "SOPLAR" title with individual letter spans, mono subtitle, central orb with ring, progress bar, start/stop button, reward reveal.  
**Functional:**
- Button triggers `navigator.mediaDevices.getUserMedia({audio: true})`
- `AudioContext` + `AnalyserNode` (fftSize 512, smoothingTimeConstant 0.8)
- RMS calculation: `sqrt(sum((sample/128 - 1)²) / length)`
- Blow detection: RMS > 0.04 → `blowLevel += 0.012` (capped at 1), else `blowLevel -= 0.004`
- Visual: bar width = `blowLevel * 100%`, orb `scale(1 + blowLevel * 0.5)`
- `addRipple()`: Canvas 2D expanding circles (strokeStyle cyan, radius grows by 2.5/frame, alpha decays 0.012)
- Completion: `blowLevel >= 0.99` → `blowCompleted()`, orb glows, reward block fades in
**Data reads/writes:** None (stateless, resets on page reload)

---

### Section 18: Aura Composer
**ID:** `#aura-composer`  
**Visual:** Dark bg section, centered canvas aura visualization, 5 MIDI-style sliders below, dominant label, save button.  
**Functional:**
- 5 parameters: calma(〜), foco(◎), creatividad(✦), energía(↑), intuición(⌇) with defaults 60/70/55/65/50
- Each slider: custom HTML (track + fill + thumb + invisible `input[type=range]`), JS syncs fill width and thumb left% on input event
- Canvas: 5 radial gradients in `screen` blend mode, orbiting center at angle `(i/5)*2π + t*(0.5+i*0.1)`, radius proportional to value
- Center: bright white radial gradient
- `updateDominant()`: finds highest-value param, shows icon + label in `#aura-dominant`
- Save: directly accesses `localStorage['apacheta_user']`, adds `.aura = {...auraValues, savedAt: Date.now()}`
**Data writes:** `localStorage['apacheta_user'].aura`

---

### Section 19: Mandala Generator
**ID:** `#mandala`  
**Visual:** White bg, square canvas with faint circular guides + symmetry axis lines, clear + save PNG buttons.  
**Functional:**
- `symmetry = 8` axes, horizontal mirror per axis
- `strokes[]` array stores `{x1,y1,x2,y2,color,width}` for redraw on resize
- Line width: `2 + hypot(dx,dy) * 0.05`, max 5
- Color cycles through `user.colores[colorIdx % 3]` per stroke start
- Background loop `rotateBg()`: circular guides with pulsing opacity `sin(t + r*0.05)`, axis lines rotate slowly `+ t*0.1`
- `canvas.toDataURL('image/png')` for save
- `touch-action: none` on canvas prevents scroll conflict
**Data reads:** `localStorage['apacheta_user'].colores`

---

### Section 20: GLB Mate Viewer
**ID:** `#glb-mate`  
**Visual:** Dark `#1B2B4B` bg, full-screen Three.js canvas rendering a 3D object (yerba mate), overlaid text + swipe hint.  
**Functional:**
- `THREE.WebGLRenderer(alpha: true, antialias: true)`, `SRGBColorSpace`
- `PerspectiveCamera(fov 45)` at `(0, 0.5, 3.5)`
- 2 PointLights colored by `user.colores[0]` and `[1]`
- `GLTFLoader` from unpkg CDN, loads `/glb/mate.yerba.glb`, auto-centers + scales to 1.8 units
- Fallback: `MeshStandardMaterial` sphere if GLB fails
- Animation: `rotY += 0.006`, subtle `rotX = sin(Date.now()*0.0005)*0.08`
- IntersectionObserver starts/stops render loop
- Swipe right (touchend delta > 80px) OR button click → `openExperimentalMode()`
- Swipe hint arrow: animates with `swipeRight` keyframe every 4s via setInterval
**Data reads:** `localStorage['apacheta_user'].colores`

**Experimental Panel (inside glb-mate.js):**
- `#experimental-panel`: fixed overlay, slides from right (`translateX(100%)` → `translateX(0)`)
- Dark noche bg, chat UI
- `RESPUESTAS` object: default (5), meditacion (3), filosofia (3)
- `getResponse(text)`: regex match for medita/respir/calma vs filosof/estoic/etc
- Bot messages: typewriter effect via `setInterval(22ms)` per character
- Loader: 3 animated dots
- Close: button or re-open

---

### Section 21: Gyroscope + Parallax (Global)
**No dedicated section** — runs globally on all sections  
**Functional:**
- `DeviceOrientationEvent.requestPermission()` on first user click (iOS 13+)
- `beta/gamma → applyParallax(x, y)` on all `.orb` and `.parallax-layer` elements with `data-depth` multiplier
- Mouse fallback for desktop: `mousemove` → same applyParallax with ±10/±6 range

**Name Bubble (global):**
- Injects `.name-bubble` div fixed at `top: 80px, left: 24px`
- Shows `user.nombre` in glassmorphism pill with personal color dot
- Pulses on scroll via `classList.add/remove('pulse')`

**Scroll Invites (section-specific):**
- Appended to all `.section[data-invite]` elements
- Contains scroll label + down arrow, bouncing animation

---

### Tab Bar (global)
**CSS:** `.tab-bar` — fixed bottom, centered, max-width 430px, glassmorphism bg  
**HTML:** 5 items with emoji icons and labels (Inicio, Mindfulness, Biblioteca, Aura, Diario)  
**JS:** None dedicated — smooth scroll via `initNavigation()` in main.js  
**Bug:** `height: var(--tab-height)` (72px) + `padding-bottom: env(safe-area-inset-bottom, 8px)` — on some devices may overlap content if safe-area is not correctly applied

---

## SECTION 4 — KNOWN BUGS TO FIX (MOBILE PRIORITY)

### BUG 1: Bottom Navigation Overlaps Content and Buttons
**Current behavior:** Tab bar is `position: fixed; bottom: 0` with `height: 72px`. The `#app` has `padding-bottom: var(--tab-height)` (72px), but individual sections using `min-height: 100svh` do not account for tab height. Buttons positioned near the bottom of a section (e.g., breathe start button, aura save, mandala controls) can be partially hidden behind the tab bar.  
**Expected behavior:** All interactive elements should be at minimum `72px + safe-area-inset-bottom` from the viewport bottom.  
**Fix approach:** Add `padding-bottom: calc(var(--tab-height) + env(safe-area-inset-bottom, 16px) + var(--space-xl))` to section inner content containers that have bottom CTAs. Audit `sections.css` bottom-positioned elements.

### BUG 2: Text is Selectable Throughout the App
**Current behavior:** `global.css` has no `user-select: none` rule. All text — including animated kinetic typography in Mente, Alucinaje section titles, Soplar letter spans, decorative numbers — is selectable, which causes visual selection highlights during touch interactions.  
**Expected behavior:** Decorative, animated, and UI text should not be selectable. Only input fields and actual content should be selectable.  
**Fix approach:** Add to `global.css`:
```css
body { user-select: none; -webkit-user-select: none; }
input, textarea, [contenteditable] { user-select: text; -webkit-user-select: text; }
```

### BUG 3: Animations Rendered on Top of Buttons Block Click/Tap Events
**Current behavior:** Several sections have canvas elements or absolutely-positioned animated divs (`pointer-events` not explicitly set to `none`) that render over buttons. In `#glb-mate`, the `.mate-canvas` is `position: absolute; inset: 0; z-index: 1`, but the overlay has `pointer-events: none` only partially — the `.mate-overlay .btn` has `pointer-events: all` via a specific selector. In `#soplar`, the `.soplar-canvas` is set `pointer-events: none` ✓. In `#ajetreo-sur`, the canvas covers the entire section including the footer buttons.
**Expected behavior:** Canvases and animated bg layers must always have `pointer-events: none`. Interactive buttons must always have `pointer-events: all` explicitly, with z-index above canvas layers.  
**Fix approach:** Audit all canvases and `.orb-bg` elements to confirm `pointer-events: none`. In `sections.css`, ensure `.ajetreo__footer` has `position: relative; z-index: 10; pointer-events: all`.

### BUG 4: Bottom Nav Disappears or Gets Pushed Up When Keyboard Opens
**Current behavior:** On mobile, when the system keyboard opens (e.g., in the annotation modal or experimental chat input), the virtual keyboard resizes the viewport. The tab bar uses `position: fixed; bottom: 0`, which should stay fixed, but iOS Safari has known bugs where `fixed` elements jump when the keyboard opens, and `100svh` layouts can shift.  
**Expected behavior:** Tab bar should remain at the bottom of the visual viewport (below the keyboard), not between the keyboard and the content.  
**Fix approach:** The experimental chat input already uses `env(safe-area-inset-bottom)`. For the tab bar, add `bottom: env(safe-area-inset-bottom, 0)` and test on iOS. For modals with inputs, add the `visualViewport` API to reposition:
```javascript
window.visualViewport.addEventListener('resize', () => {
  modal.style.bottom = `${window.innerHeight - window.visualViewport.height}px`;
});
```

### BUG 5: Pulse/Breathing Mode Toggle Buttons Not Tappable
**Current behavior:** In `#respiracion`, the `.respiracion__modes` buttons (`[data-breath]`) sit below the breathing circle. The `#respiracion-canvas` (Three.js) is `position: absolute; inset: 0; z-index: 0` and the `.respiracion__content` is `position: relative; z-index: 2`. This should be correct, BUT if `#respiracion-canvas` is taller than expected or the buttons fall below `.respiracion__content`, they may be behind the canvas.  
In `#ajetreo-sur`, the bubbles section has no interactive buttons currently, but the Three.js canvas covers the full section — any future buttons would be blocked unless explicitly given `pointer-events: all` and high z-index.  
**Expected behavior:** All mode toggle buttons in respiracion must be tappable on mobile.  
**Fix approach:** Explicitly set `pointer-events: none` on `#respiracion-canvas` in CSS (it's likely missing this). Verify `.respiracion__modes` z-index > canvas z-index.

### BUG 6: Scroll or Swipe Interactions Conflict with Navigation Gestures
**Current behavior:**
- **Mandala canvas**: uses `touch-action: none` ✓ — prevents scroll but also prevents native pinch-zoom globally
- **Scratch reveal canvas**: uses `e.preventDefault()` on touchstart/touchmove ✓ — prevents scroll but may conflict with browser back gesture on Android
- **Biblioteca cards**: touchstart/touchend delta check prevents flip on scroll, but no `touch-action` — default browser scroll behavior may interfere with the card interaction on some Android devices
- **GLB Mate swipe**: `passive: true` on touchstart/end — the 80px horizontal swipe threshold could accidentally trigger when user scrolls diagonally
**Expected behavior:** Horizontal swipes on GLB Mate only trigger if the gesture is primarily horizontal. Vertical scroll should not trigger section transitions.  
**Fix approach:** For GLB Mate, track both X and Y delta and only trigger if `|deltaX| > |deltaY| * 1.5`. For Biblioteca, add `touch-action: pan-y` to allow vertical scroll but block horizontal gestures that would conflict.

---

## SECTION 5 — DATA ARCHITECTURE & BACKEND

### localStorage — Single Key Architecture

**Key:** `apacheta_user`  
**Type:** JSON string  
**Access pattern:** `JSON.parse(localStorage.getItem('apacheta_user') || '{}')`

**Full Schema (with defaults from USER_DEFAULT):**

```javascript
{
  // Set during onboarding
  nombre:             String,          // e.g. "Franco"
  signo:              String,          // e.g. "Capricornio"
  nacimiento:         String,          // e.g. "1999-01-15" (YYYY-MM-DD)
  colores:            [String, String, String],  // 3 hex colors, e.g. ["#A8E6E0", "#F4C2C2", "#FFE44D"]
  onboardingCompleto: Boolean,         // true after first setup

  // Runtime state
  modoActual:         String,          // 'manana'|'tarde'|'noche' (not saved — computed from time)
  alucinajeActivo:    Boolean,         // persisted toggle state

  // Notes (from anotacion-rapida + calendar)
  notas: {
    "YYYY-MM-DD": {
      texto: String,       // note content
      tags:  [String],     // e.g. ["filosofia", "tech"]
      ts:    Number,       // Date.now() timestamp
    },
    // ...one entry per day
  },

  // Last 3 quick notes (for dashboard context display)
  ultimasAnotaciones: [String, String, String],

  // From aura-composer save
  aura: {
    calma:       Number,   // 0–100
    foco:        Number,   // 0–100
    creatividad: Number,   // 0–100
    energia:     Number,   // 0–100
    intuicion:   Number,   // 0–100
    savedAt:     Number,   // Date.now()
  }
}
```

### State Management Functions (main.js)

```javascript
getUser()          // safe merge of USER_DEFAULT + localStorage parse
saveUser(data)     // merge + setItem + applyUserColors
applyUserColors()  // sets --color-personal-{1,2,3} CSS vars
getModoActual()    // hour → 'manana'|'tarde'|'noche'
getModoLabel()     // mode → emoji + label string
getModoGreeting()  // mode + nombre → personalized greeting
updateNebulaColors()  // updates Three.js shader uniforms
revealApp()        // shows all hidden sections after onboarding
```

### Fetch / API Calls

**There are NO network requests in the current codebase**, except:
1. Google Fonts loaded via `@import url()` in `variables.css` (passive, no JS)
2. GLTFLoader dynamically imported from `https://unpkg.com/three@0.160.0/examples/jsm/loaders/GLTFLoader.js` in `glb-mate.js` (runtime, on section load)
3. `/glb/mate.yerba.glb` — local file request from Vite dev server `/public/glb/`

### What's Hardcoded vs Dynamic

| Data | Status |
|------|--------|
| `FRASES_HERO` (7 quotes) | Hardcoded in main.js |
| `CHALLENGES` (7 challenges) | Hardcoded in dashboard-dia.js (duplicated in `src/data/challenges.json`) |
| `CHAKRAS_DATA` (7 chakras) | Hardcoded in chakras.js |
| `SCRATCH_CONTENT` (4 cards) | Hardcoded in scratch-reveal.js |
| `CONEXIONES_DATA` (3×5) | Hardcoded in conexiones-culturales.js |
| `FRASES_ALUCINAJE` + `CONEXIONES` | Hardcoded in modos-dia.js |
| `MICRO_CARDS` (5 concept cards) | Hardcoded in mente.js |
| `PALABRAS` (4 kinetic words) | Hardcoded in mente.js |
| `RESPUESTAS` (chat responses) | Hardcoded in glb-mate.js |
| Biblioteca obras | Hardcoded in index.html |
| Manifiestos content | Hardcoded in index.html |
| Frases section quotes | Hardcoded in index.html |
| User notas | Dynamic via localStorage |
| User aura | Dynamic via localStorage |
| User profile (nombre/colores) | Dynamic via localStorage |
| Day/mode-based content | Dynamic (computed from `new Date()`) |

---

## SECTION 6 — VISION FOR NEXT PHASE

### Product Identity

Apacheta is a **personal intelligence interface** — a living system where the user feeds raw input (long text, book summaries, links, images, markdown files, WhatsApp messages) and the app surfaces it dynamically across sections, personalized, filtered by category (technology, creativity, mindfulness, links, manifesto).

The metaphor: a digital mesa (altar/pile of offerings) where everything the user feeds the system becomes part of their living manifesto.

---

### Phase 2: Note Input System (Local Backend)

**What to build:**
- Enhanced FAB modal with category selector: `tecnología / creatividad / mindfulness / link / manifiesto`
- Notes stored with full metadata: `{texto, categoria, tags[], url?, ts, titulo?}`
- Each section dynamically reads its category's notes and renders them
  - Biblioteca → notes with `categoria: 'libro'` or `'creatividad'`
  - Manifiestos → notes with `categoria: 'manifiesto'`
  - Dashboard → latest 3 notes across all categories
- Category filter bar in dashboard and biblioteca sections
- **Data structure evolution:**
```javascript
notas: {
  "uuid-or-ts": {
    texto:     String,
    titulo:    String,         // optional
    categoria: 'tech' | 'creatividad' | 'mindfulness' | 'link' | 'manifiesto',
    tags:      [String],
    url:       String,         // optional, for link type
    ts:        Number,
    date:      'YYYY-MM-DD',
  }
}
```

---

### Phase 3: Manifesto Mode

**What to build:**
- Multi-tag/filter selector: user picks 2–5 tags (e.g., "estoicismo + jazz + neuroplasticidad")
- System surfaces all notes matching those tags
- "Construir manifiesto" button: takes selected notes, assembles a full-screen editorial manifesto view
- Manifesto can be saved as a snapshot (date + tags + content)
- Manifesto snapshot stored in localStorage as `manifestos[]` array
- Each saved manifesto gets its own visual template (filosofía/tech/emocional/alucinaje)

---

### Phase 4: WhatsApp-to-App Pipeline

**What to build:**
- User sends messages to a dedicated WhatsApp number (Twilio or WhatsApp Business API)
- Backend (Node.js serverless function on Vercel) receives webhook
- Auto-classification: keyword matching → assigns categoria
- Stores in Supabase/Firebase DB with user identifier
- App polls or uses SSE/websocket to sync new notes
- "Inbox" section: unprocessed raw inputs waiting for categorization
- User can categorize, tag, or discard from within app

**Architecture:**
```
WhatsApp → Twilio Webhook → Vercel Edge Function → Supabase → App sync
```

---

### Phase 5: Terminal Processing Mode (Night Mode)

**What to build:**
- Activates at night (configurable, default 22:00–06:00) or manually
- Scans day's inputs: links, GitHub repos, markdown files, book cover images
- For each input, generates a "processed card":
  - Link → title, summary, suggested section, suggested tags
  - GitHub repo → repo description, language, stars, suggested category
  - Image → OCR or visual description (Claude API call)
  - Markdown → parse headers, extract key concepts
- Proposes frontend updates: "New content for Biblioteca", "3 new Manifesto entries"
- User approves/rejects proposed updates
- Approved updates get committed to localStorage (or backend)

**Implementation note:** This requires Claude API integration. Recommended: `claude-haiku-4-5-20251001` for classification tasks, `claude-sonnet-4-6` for summarization and manifesto building.

---

### Phase 6: Aura State Persistence + History

**What to build:**
- Every aura save gets timestamped entry: `{...values, savedAt, dayOfWeek, timeOfDay, mode}`
- Aura history view: week/month chart showing each parameter over time
- Pattern detection: "Los martes a las 18h sos más creativo y menos calmo"
- Correlations with notes: "3/5 de tus notas técnicas coinciden con tu pico de foco"
- Visual: line chart using Canvas 2D (no Chart.js — keep vanilla)

---

### Phase 7: Dynamic Content Sections

**Book gallery with 3D swipe:**
- Replace static Biblioteca grid with 3D book shelf
- `THREE.js` spine-on-shelf view, finger swipe rotates shelf
- Books loaded from user's "libro" category notes
- Book data fetched from Open Library API (cover, author, description)

**Daily GitHub repo feed:**
- Twitter/X links to repos get auto-detected by the WhatsApp pipeline
- `github.com/*` URLs → GitHub API fetch for repo metadata
- Rendered as cards in a "Tech Feed" section

**Scratch-to-reveal refactor:**
- Cards generated from user's notes (not hardcoded)
- Category determines overlay color

**Color slider:**
- Vertical gradient strip on section edges
- Drag up/down changes section `--bg-primary` for that section
- Saved per-section to localStorage

---

### Phase 8: AI Personalization Layer

**Replace static RESPUESTAS with Claude API:**
```javascript
// glb-mate.js experimental chat
const response = await anthropic.messages.create({
  model: 'claude-haiku-4-5-20251001',
  max_tokens: 200,
  system: `Sos Apacheta, un asistente filosófico y mindfulness. 
           Conocés al usuario: se llama ${user.nombre}, sus colores son ${user.colores}.
           Sus últimas notas: ${user.ultimasAnotaciones.join('; ')}.
           Respondé en español rioplatense, conciso, con profundidad.`,
  messages: [{ role: 'user', content: userMessage }]
});
```

**Personalized frase del día:**
- Instead of date-based rotation, Claude generates a frase each day based on user's recent notes and aura state

**Manifesto generation:**
- User selects notes, sends to Claude for editorial assembly
- Output: structured manifesto in Apacheta's voice

---

### Phase 9: iOS-Specific Enhancements

- **PWA manifest**: Add `manifest.json` with theme color, icons, `display: standalone`
- **Home screen shortcut**: Prompt user to add to home screen after 3rd visit
- **Haptic feedback**: `navigator.vibrate()` already used in respiracion — extend to all interactions
- **Push notifications**: Daily challenge reminder at 8am, aura prompt at 6pm
- **Offline mode**: All content already works offline (localStorage). Service Worker caches assets.

---

## SECTION 7 — SESSION HANDOFF NOTES

### Start Here — for the Next AI Coding Agent

**What this app is:**

Apacheta is a personal knowledge and mindfulness interface for a single user (Franco, Argentine developer, ~27). Think of it as a "living Bible" — a full-screen mobile web app (max-width 430px) with ~21 sections that blend mindfulness practices (breathing, chakras, mandala drawing), philosophy (Nisargadatta, Marcus Aurelius, Stoicism), and personal knowledge curation. It's built entirely in vanilla JavaScript + Three.js + Vite. No React, no framework.

**What was working last session (as of 2026-04-15):**

All 21 sections are implemented and functional:
- Onboarding with color picker → localStorage save → app reveal
- Hero morning with live clock + frase del día
- Dashboard with daily challenge + user stats
- Three.js nebulosa shader (shared renderer in main.js, activated by IntersectionObserver)
- Scratch reveal with Canvas 2D destination-out mechanic
- Chakras with bottom-sheet modals
- Respiración with 3 modes, Vibration API
- Ajetreo Sur with 5 Three.js labeled bubbles + mouse repulsion
- Visualising Wisdom with stagger reveal
- Modos del Día (4 sections) with alucinaje rotating text
- Calendar + notes grid from localStorage
- Conexiones Culturales with 3 concepts × 5 cultures
- Anotación Rápida with FAB + modal + tag auto-suggest + localStorage save
- Mente with kinetic typography + concept cards + canvas orbs
- Soplar with Web Audio API microphone blow detection
- Aura Composer with MIDI sliders + canvas visualization + localStorage save
- Mandala with 8-fold symmetric drawing + save to PNG
- GLB Mate with Three.js 3D viewer + experimental chat panel
- Gyroscope parallax + global name bubble + scroll invites

**Fix first (mobile bugs, in priority order):**

1. **`user-select: none` on body** — text highlights on any tap/drag. Add to `styles/global.css`: `body { user-select: none; -webkit-user-select: none; }` and re-allow on inputs/textareas.
2. **Bottom nav overlap** — audit all sections for buttons near bottom, ensure `padding-bottom: calc(72px + env(safe-area-inset-bottom, 16px) + 40px)` on section content containers with bottom CTAs.
3. **Canvas pointer-events** — add `pointer-events: none` to `#respiracion-canvas` and verify all Three.js canvases have this in CSS.
4. **GLB Mate swipe conflict** — add direction check before triggering experimental panel: only trigger if horizontal delta > vertical delta × 1.5.
5. **Keyboard pushes layout** — test annotation modal on iOS; add `visualViewport` resize listener if needed.
6. **Biblioteca hover glow conflict** — the inline transform from mousemove overwrites the filter transition transform. Move filter logic to use opacity only (not transform) to avoid conflict.

**What to build next:**

The immediate next phase is the **Note Input System** (Section 6, Phase 2 above):
- Upgrade the annotation FAB modal to support categorization (tech/creatividad/mindfulness/link/manifiesto)
- Store notes with full metadata
- Make Manifiestos section dynamically read from `categoria: 'manifiesto'` notes
- Add a basic local "inbox" view showing all saved notes by category

After that: connect to Claude API for the experimental chat in GLB Mate (replace static RESPUESTAS with real API call using `claude-haiku-4-5-20251001`).

**Design language — NEVER deviate from this:**

- **Dark backgrounds** for night/tech sections: `#1A1A2E` (noche), `#1B2B4B` (tech), `#2D5016` (filosofía)
- **Light cream/white** for main sections: `#FFFFFF`, `#F8F6F2`, `#F5F0E8`
- **Glassmorphism panels**: `rgba(255,255,255,0.72)` bg + `blur(16px)` backdrop-filter
- **Gradient animations**: flowing nebulosa, aura orbs, `gradShift` keyframe
- **South Hustles aesthetic** (even though current palette is pastels): the NEXT palette iteration adds lime `#B4FF50` and cyan `#00FFE0` as accent options in the color picker
- **Bebas Neue** is the display font for future South Hustles sections (currently using Playfair Display — keep Playfair for mindfulness sections, Bebas for tech/alucinaje sections when building new sections)
- **Share Tech Mono** (`var(--font-mono)`) for all HUD elements, timestamps, labels, mono data
- **Playfair Display** (`var(--font-display)`) for all emotional/philosophical content, quotes, titles
- **Inter** (`var(--font-body)`) for body text, descriptions, UI labels
- **Border radius**: iOS-like, use `var(--radius-lg)` (32px) for cards, `var(--radius-full)` for pills/buttons
- **Spacing**: use CSS vars (`--space-xs` through `--space-4xl`), never hardcode px values
- **Z-index layers**: canvas (-1) → base (1) → card (10) → modal (100) → nav (200) → fab (300) → toast (400)

**Dev philosophy — STRICT RULES:**

1. **Additive only** — never delete existing functionality. Every session adds to the app, nothing removed.
2. **Always deliver complete files** — when editing a JS or CSS file, return the entire file contents, not diffs.
3. **Vanilla JS only** — no React, no Vue, no component frameworks. ES modules + Vite + Three.js is the full stack.
4. **One HTML file** — all sections live in `index.html`. New sections are new `<section>` elements added in order.
5. **Section isolation** — each section has its own `src/sections/section-name.js`. Export a single `init*()` function. Import it in `main.js`.
6. **CSS modules** — section-specific styles go in `sections.css` or `new-sections.css`. Global patterns go in `global.css`.
7. **localStorage is the database** — all persistence goes through `getUser()`/`saveUser()` from `main.js`. Never call `localStorage.setItem()` directly except in aura-composer.js (which should be refactored to use `saveUser()`).
8. **IntersectionObserver for expensive renders** — any Three.js or Canvas animation loop MUST stop when the section is off-screen.
9. **Mobile-first, 430px max-width** — every layout decision optimizes for a phone held vertically.
10. **Test on real device** — always test the vite dev server from a phone on the same LAN (the `host: true` in vite.config.js exposes it at the machine's local IP on port 3005).

---

*End of ARCHITECTURE15AB.md — Generated 2026-04-15*
