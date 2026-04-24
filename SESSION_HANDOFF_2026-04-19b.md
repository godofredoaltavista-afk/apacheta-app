# APACHETA v2.1 — Sesión de implementación completa · 19 abril 2026

## Host
`http://localhost:3005` — `npm run dev` en `d:/ANTS on MARS/AAAAexplora/apacheta`

## Qué construimos

### Pilar 1 — Feedback Bus + Copy Oracle
Un buffer local que captura cada acción significativa del usuario (likes, aura guardada, mandala dibujado, nota escrita, MIDI tocado, días con streak). Ese buffer alimenta el Copy Oracle, que puede regenerar los textos de ~30 secciones de la app en bulk o de a uno. El Oracle tiene mock offline incorporado y un hook `window.apachetaMCPQuery` que se activa automáticamente cuando NotebookLM está con auth. Cada regeneración queda guardada en un historial con rollback — nunca se pierde una versión anterior.

**Archivos nuevos:**
- `src/core/feedback-bus.js` — push/read/clear, persiste en `user.feedbackBus[]`, cap 500
- `src/core/copy-oracle.js` — `regenerateAll()` + `askSingle()` + `rollback()`
- `src/core/copy-oracle-mock.js` — fallback offline con variantes curadas por sección
- `src/data/copy-registry.js` — ~30 keys dotted → DOM selectors + tags
- `src/data/banner-registry.js` — paths de `viernestator/banners/` con tags semánticos
- `src/components/feedback-bus-panel.js` — timeline visual Ventana 2 + botón ✦ regenerar
- `src/components/oracle-modal.js` — modal askSingle con 3 variantes tap-to-apply
- `src/sections/ventana2-historial.js` — tab historial copys con rollback en `#v2-panel`

### Pilar 2 — Manifiesto Gestor 3 columnas
Reemplaza las cards estáticas por un gestor tipo Apple Notes dark: carpetas a la izquierda (Filosofía, Tech, Emocional, Sideral, Musical, Yoga, Visión, Oracle), lista de notas en el centro, visor/editor a la derecha. En mobile colapsa a tabs horizontales con swipe. Cada nota tiene banner, texto justificado en 2 columnas (estilo revista), y botón Oracle para expandir vía NotebookLM.

**Archivos nuevos:**
- `src/sections/manifiesto-gestor.js` — 3 columnas, lee `user.notasList[]`, banners por tag
- `styles/manifiesto-gestor.css` — grid 200px/280px/1fr desktop, tabs mobile
- Sección `#manifiesto-gestor` agregada a `index.html`

### Pilar 3 — Drawer agrupado iOS
El menú lateral pasó de 13 ítems planos a 8 carpetas colapsables con spring physics: Dashboard, Mañana, Meditar, Crear, Sonidos, Leer, Escribir, Archivo. Tap en carpeta abre mini-grid de sub-apps. Backward compatible con IntersectionObserver existente via `NAV_ITEMS = NAV_GROUPS.flatMap(g => g.items)`.

**Modificado:**
- `src/core/nav-drawer.js` — `NAV_GROUPS` con expand/collapse spring
- `styles/folders.css` — `.drawer__subitems { max-height: 0; overflow: hidden; }`, stagger animation

### Pilar 4 — Config Presets
Sistema de export/import/merge de configuraciones completas (colores + copys + tweaks + modo + fontScale). Se guardan en localStorage (cap 20), se comparten via URL `?preset=base64(json)`, UI dentro del panel "EDIT VIEWER".

**Archivo nuevo:**
- `src/core/config-presets.js` — `exportCurrent()`, `importPreset()`, `mergePresets()`, `presetToURL()`, `initPresetsUI()`

---

## Correcciones técnicas (C1–C12)

| # | Qué | Archivo | Estado |
|---|---|---|---|
| C1 | Mandala: sin bordes punteados slice-preview | `styles/tweaks-modes.css`, `styles/hud-system.css` | ✅ DONE |
| C2 | Mandala save → thumbnail JPEG 50% gris + `user.mandalaArchive[]` | `src/sections/mandala.js:167-225` | ✅ DONE |
| C3 | Sección `#mandala-archive` galería thumbnails grises | `src/sections/mandala-archive.js`, `index.html`, `styles/new-sections.css` | ✅ DONE |
| C4 | Lissajous rotación más lenta (`t += 0.004`) + trazo con `--color-personal-1` | `src/sections/lissajous.js` | ✅ DONE |
| C5 | `.magazine-card` banner full + column-count:2 + three.js micro | PENDIENTE | ⏳ |
| C6 | Telemetry HUD tintado con accent, escucha `apacheta:colorsChanged` | `src/sections/telemetry-hud.js` | ✅ DONE |
| C7 | `applyTitles()` barre h1/h2/h3, eyebrows, subtítulos, mg-visor-titulo | `src/core/tweaks-panel.js` | ✅ DONE |
| C8 | Anotación color picker → CSS var `--note-current-color`, sobrevive modo | `src/sections/anotacion-rapida.js`, `styles/sections.css` | ✅ DONE |
| C9 | Notas recientes + días calendario → navegan a `#manifiesto-gestor` | `src/sections/calendar-preview.js` | ✅ DONE |
| C10 | HALLUCINATION tinta todas las secciones incluyendo nuevas | `styles/tweaks-modes.css` | ✅ DONE |
| C11 | "Crear Manifiesto" → guarda nota + abre gestor con esa nota | `src/sections/anotacion-rapida.js` | ✅ DONE |
| C12 | Panel renombrado "// EDIT VIEWER", swatches acuarela, font/size preview | `index.html`, `styles/tweaks-modes.css` | ✅ DONE |

---

## Eventos globales del sistema

| Evento | Quién dispara | Quién escucha |
|---|---|---|
| `apacheta:colorsChanged` | tweaks-panel | lissajous, telemetry-hud, ventana2 |
| `apacheta:mandalaSaved` | mandala.js | feedback-bus |
| `apacheta:mandalaArchiveUpdated` | mandala.js | mandala-archive.js |
| `apacheta:presetApplied` | config-presets.js | — |
| `apacheta:copyUpdated` | copy-oracle.js | — |
| `manifiesto:openEditor` | anotacion-rapida, calendar-preview | manifiesto-gestor.js |
| `openOracleModal` | manifiesto-gestor, secciones | oracle-modal.js |

---

## Pendiente próxima sesión

1. **C5** — `.magazine-card` con banner full-width + `column-count:2` + Three.js micro lateral
2. **MCP bridge real** — `src/core/mcp-bridge.js` conectando `window.apachetaMCPQuery` a los cuadernos de NotebookLM por tags de sección
3. **Onboarding copy step** — nuevo step en wizard: "¿Querés copys automáticos cada mañana?" → `user.copyScheduleEnabled`
4. **Deploy Vercel** — conectar repo, variables de entorno, preview URL para compartir con familia

---

## Build
```
vite v5.4.21 — 62 modules — ✓ built in 3.07s — sin errores
dist/index.html         98.12 kB
dist/assets/index.css  136.52 kB
dist/assets/index.js   632.45 kB
```
