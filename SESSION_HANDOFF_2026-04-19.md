# APACHETA v2.1 — SESSION HANDOFF · 2026-04-19

> Continuación de `SESSION_HANDOFF_2026-04-18.md`.
> Plan vigente: `C:\Users\franc\.claude\plans\bueno-con-el-flujo-sorted-alpaca.md`
> (Onboarding de Copys via NotebookLM + Feedback Bus + Ventana 2 acumulativa + Manifiesto 3col + Drawer iOS + Presets + Combo C1-C12).

---

## 1 · Qué quedó FUNCIONANDO esta sesión

### Pilar 1 — Feedback Bus + Copy Oracle (P0) · **COMPLETO y booteado**

| Archivo | Rol |
|---|---|
| `src/core/feedback-bus.js` | Bus central. `push / read / readRecent / removeAt / clear / summary`. Persiste en `user.feedbackBus[]` (cap 500, rolling). Expuesto como `window.feedbackBus`. |
| `src/components/feedback-bus-panel.js` | **Ventana 2 embrionaria.** Trigger flotante + panel derecho con timeline emoji+tiempo+payload + chips resumen + botón grande `✦ REGENERAR COPYS + BANNERS` que dispara `apacheta:oracle:regenerate-all`. |
| `styles/ventana2.css` | Styling completo del panel. |
| `src/data/copy-registry.js` | ~30 keys → DOM selectors (wisdom, biblioteca, scratch, aura, mandala, lissajous, fibonacci, aura-history, alarma, 7 chakras, 3 manifiestos, frases, morning, ojo, lofi, conexiones). `applyCopy(k,v)`, `readCurrent(k)`, `getRegistryKeys()`. |
| `src/data/banner-registry.js` | 19 paths `/banners/` con tags. `findByTags()` scoring + random jitter. |
| `src/core/copy-oracle-mock.js` | Variantes curadas por key + tag frequency analyzer sobre el bus. |
| `src/core/copy-oracle.js` | `regenerateAll()` bulk + `askSingle()` micro + `applySingle()` + `rollback()` + `hydrateFromStorage()`. MCP hook: `window.apachetaMCPQuery` / `window.apachetaMCPAskSingle` (cuando haya `nlm login`). Fallback automático al mock. |
| `src/components/oracle-modal.js` | Modal de 3 variantes con chips (tarde/voluntad/filosofía/minimalista/barroco/patagonia/…) + input libre "hoy quiero relacionar…". `initOracleButtons()` inyecta ✦ junto a cada selector del registry. |
| `styles/oracle.css` | Estilo completo modal + botón + toast + pulse animation. |

**Boot (main.js):**
```js
import { feedbackBus }      from './core/feedback-bus.js';
import { initFeedbackBusPanel } from './components/feedback-bus-panel.js';
import { initCopyOracle }       from './core/copy-oracle.js';
import { initOracleButtons }    from './components/oracle-modal.js';
…
try { initFeedbackBusPanel(); } catch …
try { initCopyOracle();       } catch …
try { initOracleButtons();    } catch …
```

**Eventos instrumentados ya pusheando al bus:**
- `aura-composer.js` → `aura-saved`
- `mandala.js` → `mandala-saved`
- `anotacion-rapida.js` → `note-written`
- `chakras.js` → `chakra-tapped`
- `scratch-reveal.js` → `scratch-revealed`
- `tweaks-panel.js` → `color-changed` + `mode-changed`

**Estado persistencia extendido:**
- `user.feedbackBus[]` (rolling cap 500)
- `user.copyOverrides{}` (key → variante aplicada)
- `user.copyHistory[]` (cap 40 snapshots para rollback)

---

## 2 · Lo que FALTA hacer (orden recomendado)

### INMEDIATO · Payoff visual (WhatsApp corrections)
Estos son los que Franco ve YA al abrir localhost:3005. Hacerlos primero mientras el Oracle corre en mock.

| # | Tarea | Archivo | Nota técnica |
|---|---|---|---|
| **C1** | Mandala: desactivar bordes punteados del Slice&Preview | `src/sections/mandala.js` + `styles/sections.css` | Buscar `slice` / `preview-overlay` classes, quitar `border: dashed` o clase activa. |
| **C4** | Lissajous: rotación más lenta + colores con `--color-personal-1/2/3` | `src/sections/lissajous.js:29,46-47` | `t += 0.008` → `t += 0.004`. Texto/sliders escuchan `apacheta:colorsChanged`. |
| **C6** | Telemetry HUD pintado con accent | `src/sections/telemetry-hud.js` + `styles/hud-system.css` | Listener `apacheta:colorsChanged` → set CSS vars `--hud-bg` `--hud-border`. |
| **C12** | Tweaks panel → `// EDIT VIEWER` label + paleta acuarela tech + fonts/sizes preview | `index.html` (labels) + `styles/tweaks-modes.css` | **Mantener `id="tweaks-panel"` para no romper**. Cada botón de font con `font-family: <su font>`, cada botón de size con `font-size: <su size>`. |

### CRÍTICO · Para que el Oracle llegue a todos los selectores
| Tarea | Detalle |
|---|---|
| Agregar `data-copy-key="..."` a templates | Chakras (7 descs, renderizadas en `chakras.js` al abrir modal), Morning title, Ojo title, Lofi title, Conexiones title, Frases kicker. Hoy esos selectors del registry **no matchean DOM** → el ✦ no aparece ahí. |

### PILARES RESTANTES (en este orden)

1. **Ventana 2 historial con rollback** — nuevo `src/sections/ventana2-historial.js` + tab en Manifiesto. Lista cronológica de `user.copyHistory[]` con diff visual y botón "volver a esta versión" (llama `rollback(idx)` de copy-oracle).
2. **Onboarding copy step** — nuevo `src/components/onboarding-copy-step.js`. Step al final del wizard: "¿Copys automáticos cada mañana?" → guarda `user.copyScheduleEnabled`.
3. **Manifiesto Gestor 3col** — nuevo `src/sections/manifiesto-gestor.js` + `styles/manifiesto-gestor.css`.
   - 3 cols horizontales Apple Notes dark (Carpetas · Lista · Visor con banner + column-count:2 + three.js lateral).
   - Mobile: stack con tabs + swipe.
   - Lee `user.notasList[]`, banners de `banner-registry`.
   - Botón ⚡ por nota → `openOracleModal(key-de-esa-nota)` para expandir.
4. **Drawer agrupado** — modificar `src/core/nav-drawer.js:13-27`. Reemplazar `NAV_ITEMS[]` por `NAV_GROUPS[]` con 8 grupos (Dashboard / Mañana / Meditar / Crear / Sonidos / Leer / Escribir / Archivo). Mini-grid 3×3 con `springTo()` al tap grupo.
5. **Config Presets** — nuevo `src/core/config-presets.js`. `exportCurrent()` / `importPreset(json)` / `mergePresets([a,b,c])` + tab PRESETS en tweaks panel. URL share: `?preset=base64(json)`.
6. **Resto del combo: C2, C3, C5, C7, C8, C9, C10, C11**
   - C2: Mandala save PNG gris @ 50% → `user.mandalaArchive[]`. (`mandala.js:167-219`)
   - C3: nueva sección `#mandala-archive` galería thumbnails.
   - C5: `.magazine-card` con banner full + `column-count:2` + three.js micro lateral.
   - C7: auditar hardcodes de subtítulos → heredar `--tweaks-titles`.
   - C8: `anotacion-rapida.js:49-58` → cambiar inline style por class + CSS var `--note-current-color`.
   - C9: calendar + "Notas recientes" clickeables → scroll a manifiesto-gestor con filtro.
   - C10: expandir `body.mode-hallucination .section` selectors en `tweaks-modes.css` sección por sección.
   - C11: botones "Crear manifiesto" / "Iniciar Manifiesto" → evento `manifiesto:openEditor` con nota nueva.

### MCP NotebookLM — cuando Franco corra `nlm login`

1. `nlm login` en bash.
2. Descubrir UUIDs con `mcp__notebooklm-mcp__notebook_list` (cuadernos: 02_APACHETA_PRODUCT, 08_FILOSOFIAS_BIBLIOTECA, 11_PROYECTOS_VISION, 03_FRONTEND_SKILLS_THREEJS, 05_TECH_2026_ABRIL, 10_SKILLS_MD_AGENTS).
3. Implementar `window.apachetaMCPQuery({keys, bus, intent})` y `window.apachetaMCPAskSingle({key, intent})` en un nuevo `src/core/mcp-bridge.js`:
   - `notebook_query` por cuaderno según tags del bus.
   - `cross_notebook_query` para keys que cruzan dominios (ej: `wisdom.*` → filosofías + visualising wisdom).
4. Apenas estén definidas, `copy-oracle.js` las usa automáticamente (ya las busca con `if (window.apachetaMCPQuery…)`).

---

## 3 · Decisiones arquitectónicas (para no olvidar el porqué)

- **Mock first, MCP opcional** — el Oracle funciona offline; cuando hay auth se enchufa por ventana global, sin reescribir oracle.
- **copyHistory es append-only** — nunca se borra; rollback recrea snapshot y empuja NUEVO history entry (así el rollback también es auditable).
- **Registry keys son dotted-strings estables** — no usar IDs de DOM, ni índices. Así el CMS/MCP puede referirse al mismo key aunque el HTML cambie.
- **`data-copy-key` como escape hatch** cuando el selector CSS es ambiguo o el contenido se renderiza desde JS (ej. chakras descs).
- **Feedback Bus como memoria viva** — Franco quiere ver "lo que la app aprendió de él" antes de regenerar. La Ventana 2 es esa superficie.
- **Ventana 2 doble uso** — (a) timeline actual del bus (ya existe), (b) historial de copys (pendiente). Ambos viven en el mismo panel con tabs.
- **Presets = JSON portable** — tweaks + copyOverrides + colores + modo + layout. Base64 en URL para compartir entre mibroder / mipana / mihermano.

---

## 4 · Predicciones / riesgos a vigilar

1. **Selectores que no matchean hoy**: 7 chakras + 5 secciones con `[data-copy-key]`. El ✦ simplemente no aparecerá ahí (graceful fail en `initOracleButtons`). No crashea. **Solución**: agregar atributos al DOM/templates (tarea explícita arriba).
2. **Performance del bus**: 500 entries cap es suficiente para ~2 semanas de uso intenso. Si la timeline laguea, paginar render a 80 (ya lo hace feedback-bus-panel).
3. **`window.apachetaMCPQuery` indefinido**: oracle loguea warn, cae a mock. Franco no se entera, pero el badge del panel debe mostrar `source: mock` vs `notebooklm` (ver toast existente: ya lo hace).
4. **Conflicto HALLU global (C10)**: si el tint global se reactiva, puede pisar los `copyOverrides` visuales. Testear que el color aplica solo a `background/border/text-color` — nunca a `content`.
5. **Drawer NAV_GROUPS rompe deep-links**: antes de cambiar `NAV_ITEMS[]` por grupos, preservar los IDs de sección originales y que el tap sub-app haga `springTo(id)`. No renombrar IDs.
6. **Onboarding copy step**: el wizard actual tiene N pasos; insertar ANTES del cierre, no como paso aislado. Ver `src/sections/onboarding.js` flow.
7. **Ventana 2 en mobile**: panel derecho full-width puede tapar el FAB. Usar `z-index: 210` (ya en oracle.css) y cerrar con swipe desde el borde.

---

## 5 · Cuadernos NotebookLM relevantes (para la consulta)

| Cuaderno | Uso en Oracle |
|---|---|
| `02_APACHETA_PRODUCT` | Copys base de cada sección, tono general. |
| `08_FILOSOFIAS_BIBLIOTECA` | `wisdom.*`, `scratch.*`, `visualising-wisdom.*`, frases filosóficas (Marco Aurelio, Nisargadatta). |
| `11_PROYECTOS_VISION` | "Sabiduría Visualizada y Guía Estratégica" (VISUALISING WISDOM). |
| `03_FRONTEND_SKILLS_THREEJS` | Micro-copy para lissajous/fibonacci/mandala (explicaciones técnicas cortas). |
| `05_TECH_2026_ABRIL` | Patterns SDK/Skills para el propio Oracle (meta). |
| `10_SKILLS_MD_AGENTS` | Cómo estructurar el agente Oracle. |

**Auth**: pendiente. Correr `nlm login` antes de enchufar MCP real.

---

## 6 · Checklist rápido de smoke test

```bash
cd "d:/ANTS on MARS/AAAAexplora/apacheta"
npm run dev   # localhost:3005
```

- [ ] Trigger `// VENTANA 2` visible bottom-right.
- [ ] Tap en trigger → panel abre con timeline (aunque vacío en primer boot).
- [ ] Guardar un aura / crear mandala / escribir nota → aparecen nuevas filas en el panel.
- [ ] Tap botón grande `✦ REGENERAR COPYS + BANNERS` → toast `✦ N copys regenerados · mock`, títulos de ~30 keys cambian (donde hay selector válido).
- [ ] Reload → variantes aplicadas persisten (`copyOverrides`).
- [ ] Botones ✦ inline aparecen junto a títulos del registry que sí tienen selector en DOM.
- [ ] Tap ✦ → modal con 3 variantes + chips + input. Tap variante → se aplica.
- [ ] Console: `Apacheta ready · HUD system merged · Feedback Bus + Oracle online`.

---

## 7 · Archivos tocados esta sesión (para diff rápido)

**Nuevos:**
- `src/core/feedback-bus.js`
- `src/core/copy-oracle.js`
- `src/core/copy-oracle-mock.js`
- `src/data/copy-registry.js`
- `src/data/banner-registry.js`
- `src/components/feedback-bus-panel.js`
- `src/components/oracle-modal.js`
- `styles/ventana2.css`
- `styles/oracle.css`

**Modificados:**
- `src/main.js` (imports + boot wiring)
- `index.html` (link stylesheets nuevos)
- `src/sections/aura-composer.js` (bus push)
- `src/sections/mandala.js` (bus push)
- `src/sections/anotacion-rapida.js` (bus push)
- `src/sections/chakras.js` (bus push)
- `src/sections/scratch-reveal.js` (bus push)
- `src/core/tweaks-panel.js` (bus push color/mode)

---

## 8 · Próxima sesión: por dónde arrancar

1. Smoke test local (checklist §6).
2. Combo **C1 + C4 + C6 + C12** (payoff visual inmediato, Franco los ve).
3. Agregar `data-copy-key` en los 6 templates pendientes (chakras modal render + morning/ojo/lofi/conexiones/frases HTML).
4. Ventana 2 historial con rollback UI (usa `user.copyHistory[]` ya poblado por el oracle).
5. Pedir a Franco que corra `nlm login` y enchufar MCP real (`src/core/mcp-bridge.js`).

---

**Fin handoff 2026-04-19.**
