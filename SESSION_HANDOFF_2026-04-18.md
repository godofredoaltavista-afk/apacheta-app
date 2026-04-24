# SESSION HANDOFF — Apacheta v2.0
**Fecha:** 2026-04-18 | **Modelo:** claude-sonnet-4-6 | **Puerto:** localhost:3005

---

## ESTADO DEL CÓDIGO AL CIERRE DE SESIÓN

### Archivos creados (nuevos)
| Archivo | Propósito |
|---|---|
| `src/sections/color-hud.js` | HUD flotante izquierdo: 3 dots arrastrables, degradé HSL programático, breathing RAF, persiste en `user.colorHudPositions` |
| `src/core/spring.js` | Spring physics pura: `velocity += (to-current)*stiffness; velocity *= damping` — exporta `springTo()` y `lerp()` |

### Archivos modificados
| Archivo | Cambios clave |
|---|---|
| `src/main.js` | Import `initColorHud` + `springTo`; nav entrance desde abajo con spring (delay 400ms); collapse button rota con spring |
| `src/sections/dashboard-dia.js` | Stats expandidos (secciones/streak/notasHoy/heartbeat); 4 float cards grid; aura mini-canvas animada; aura history row 7 días (grayscale pasados, color hoy); arcano card (seed fecha+nacimiento+nombre); pills hallucination/therapy; ticker marquee secciones |
| `src/sections/aura-composer.js` | saveBtn guarda en `user.auraHistory[]` (max 30 días) + dispara `apacheta:auraSaved` |
| `src/sections/mandala.js` | saveBtn convierte canvas a escala de grises → aplica como backgroundImage de sección; guarda `user.mandalaHistory[]` (14 días) + dispara `apacheta:mandalaSaved` |
| `styles/new-sections.css` | CSS para: color-hud, dashboard stats/heartbeat/float-cards/aura-history/arcano/mode-pills/ticker |
| `styles/sections.css` | Removida la `transition: transform` del `.morning-nav` (ahora la maneja el spring JS) |
| `index.html` | `<div id="color-hud">` antes del onboarding; stats row con heartbeat SVG; 4 float cards; aura history row; arcano card; mode pills; ticker |

---

## ARQUITECTURA DE ESTADO (localStorage: `apacheta_user`)

```js
{
  nombre: '',
  signo: '',
  nacimiento: '',           // fecha de nacimiento → seed arcanos
  colores: ['#hex','#hex','#hex'],  // color-personal-1/2/3
  colorHudPositions: [0.15, 0.50, 0.82],  // NUEVO: posiciones del HUD
  modoActual: 'manana',
  alucinajeActivo: false,
  therapyMode: false,       // NUEVO: modo therapy global
  onboardingCompleto: false,
  ultimasAnotaciones: [],
  notas: {},
  aura: { savedAt, ...auraValues },
  auraHistory: [            // NUEVO: max 30 entradas
    { fecha: 'YYYY-MM-DD', colores: [], aura: {} }
  ],
  mandalaHistory: [         // NUEVO: max 14 entradas
    { fecha: 'YYYY-MM-DD', dataUrl: '', colores: [] }
  ],
  streak: 0,
}
```

---

## EVENTOS GLOBALES (window.dispatchEvent)

| Evento | Quién lo dispara | Qué contiene | Quién escucha |
|---|---|---|---|
| `apacheta:colorsChanged` | color-hud.js | `{ colores: ['#hex','#hex','#hex'] }` | dashboard, orbs de secciones |
| `apacheta:auraSaved` | aura-composer.js | `{ fecha, colores, aura }` | dashboard (refresh history row) |
| `apacheta:mandalaSaved` | mandala.js | `{ dataUrl, grayDataUrl }` | calendar, manifiestos (escuchar para mostrar como bg) |

---

## PRÓXIMOS PASOS (según plan P1-P3)

### Inmediatos (P1):
- **Sonidos → Modo Estudio**: vinilo CSS + Web Audio batería (hi-hat/snare/bombo via AudioContext) + octapad 4×4 + VU meter SVG
- **Mandala → user colors**: los 3 colores del picker se inicializan desde `user.colores` al abrir la sección
- **Calendar**: escuchar `apacheta:mandalaSaved` → mostrar thumbnail grayscale en la celda del día

### Medianos (P2):
- **Split 50/50**: respiración, chakras, manifiestos — canvas secundario lateral con IntersectionObserver
- **Chakras pattern**: extraer `max-height: 0 → 500px` como util reutilizable (con spring)
- **Manifiestos dinámicos**: leer `user.notas` filtradas por tags `filosofia-personal`, `vision-futuro`

### Visión nueva (esta sesión):
- **FAMILIA MULTI-PERFIL**: `mibroder.arg`, `mipana.cl`, `mihermanoqueentiendemisideas.yo` como perfiles separados en localStorage (`apacheta_mibroder`, `apacheta_mipana`, etc.)
- **PUZZLE-CAPTCHA DE NOTAS**: dado un pool de notas de varios perfiles familiares, generar puzzles de texto tipo "¿quién escribió esto?" o "completá esta nota"
- **Modo therapy/hallucination por sección**: cada sección lee `user.therapyMode` o `user.alucinajeActivo` y cambia su copy y visual

---

## CONCEPTOS TÉCNICOS ESTABLECIDOS

```
Spring: velocity += (to - current) * stiffness; velocity *= damping; current += velocity
Lerp pattern: position.lerp(target, 0.028) — heavier; rotation.lerp(target, 0.05) — lighter
Sin float: Math.sin(Date.now() * 0.001 + phaseShift) * amplitude
Glass CSS: backdrop-filter: blur(12px); background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.4)
Ticker: @keyframes: translateX(0) → translateX(-50%), duración 28s, copia duplicada en HTML
Section isolation: cada sección tiene su init(), su canvas, su IntersectionObserver
Modo del día: getHours() → 6-12 mañana / 12-20 tarde / rest noche
```

---

## REGLAS DE INGENIERÍA ACTIVAS

1. **NUNCA borrar** — solo `// DISABLED: [razón]` si se desactiva algo
2. **Spring > CSS transitions** en todo nuevo comportamiento animado
3. **Web Audio > samples** para batería (procedural)
4. **IntersectionObserver obligatorio** para cada nuevo canvas
5. **Orden de entrega:** copy → HTML → CSS → JS
6. **Eventos globales** para comunicación entre secciones (no imports cruzados)
7. **localStorage solo via `saveUser()` / `getUser()`** de main.js — no `localStorage.setItem()` directo (excepto en aura-composer por ahora)

---

## FAMILIA — CONCEPTO PUZZLE

**Perfiles:** `mibroder.arg` · `mipana.cl` · `mihermanoqueentiendemisideas.yo`

**Idea central:** cada miembro carga sus notas en su perfil de Apacheta. Una vez al día, el sistema:
1. Lee el pool de notas de todos los perfiles (`apacheta_mibroder.notas`, etc.)
2. Genera un puzzle de texto: "¿quién escribió: _[fragmento de nota]_?" o "completá: _[primera mitad de la nota]_"
3. La respuesta correcta desbloquea contenido (una sección, un mandala, una carta arcana)
4. Los resultados se agregan a un `sharedHistory` en un servidor simple (o via URL params para empezar)

**MVP sin backend:** los 4 localStorage keys en el mismo browser → un modo "familia" que mezcla los pools localmente.
