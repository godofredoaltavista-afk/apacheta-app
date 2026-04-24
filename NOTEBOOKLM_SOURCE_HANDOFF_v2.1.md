# APACHETA v2.1 — Source para NotebookLM
## Role: Tech Lead · Vercel app developer · GitHub deploy · Agents orchestrator

> Este documento es una **source MD** para subir al cuaderno `02_APACHETA_PRODUCT` de NotebookLM.
> Persona del agente que lo consume: **ingeniero tech lead full-stack**, experto Vercel + GitHub Actions + Vite + Vanilla JS, orquestador de agentes IA (Claude Code SDK + NotebookLM MCP).
> Co-autor con Franco Altavista (diseñador industrial, 13 años TouchDesigner, orquestador humano).

---

## 0 · Persona + estilo de trabajo con Franco

- **Additive-only**: jamás romper secciones existentes al agregar features. Si hay que reescribir, se deja la versión anterior rollback-able.
- **Directo, sin resumir lo hecho**: Franco lee los diffs. Nada de "✅ Hecho lo siguiente: 1)...". Solo el próximo paso y obstáculos reales.
- **Mobile-first**: todo se prueba primero en iPhone portrait. Desktop es bonus.
- **TouchDesigner aesthetic**: líneas 0.5px, grids, monospace, dashed dividers pensados (pero los del slice-preview se removieron por pedido explícito).
- **Spanish-first** en UI, copys, logs de consola, memories. Código: inglés.
- **MCP NotebookLM como copiloto cultural**: cuando necesite copys, que consulte cuadernos (8_FILOSOFIAS, 11_PROYECTOS_VISION, 02_APACHETA_PRODUCT), nunca inventar.
- **Bus de feedback como memoria viva**: todo lo que el usuario hace dentro de la app se acumula y alimenta al Oracle. Sin eso la app pierde alma.

---

## 1 · Arquitectura v2.1 — los 4 pilares

### Pilar 1 — Feedback Bus + Copy Oracle (P0, DONE en mock)
Cada interacción significativa (like, aura, mandala, nota, slice, midi, chakra-tap, scratch, color-change, mode-change) → `window.feedbackBus.push({type,payload,ts})` → se persiste en `user.feedbackBus[]` (cap 500 rolling) → se muestra en **Ventana 2** (panel derecho con timeline) → botón `✦ REGENERAR COPYS + BANNERS` manda todo al Oracle → devuelve bulk `{key: variant}` para los ~30 keys del registry + banners sugeridos por tags → aplica al DOM + guarda `user.copyOverrides` + snapshot en `user.copyHistory[]` para rollback.

MCP hook: `window.apachetaMCPQuery({keys, bus, intent})`. Si no existe, fallback automático al mock curado.

Modal micro: tap ✦ junto a cualquier título editable → 3 variantes + chips de intent (tarde/voluntad/filosofía/minimalista/barroco/patagonia/montaña/tech/jazz/editorial/ritual) + input libre "hoy quiero relacionar X con Y" → tap variante aplica.

### Pilar 2 — Manifiesto Gestor 3col (PENDING)
Reemplaza `manifiestos-particles.js`. Layout Apple Notes dark horizontal:
`Carpetas (Filosofía/Tech/Emocional/Sideral/Musical/Yoga) · Lista (cards con preview 2L + fecha + tag) · Visor (banner full-width + H1 Playfair + column-count:2 + three.js micro lateral)`. Mobile: tabs + swipe. Cada nota: botón ⚡ → `openOracleModal()` para expandir via NotebookLM.

### Pilar 3 — Drawer iOS agrupado (PENDING)
Reemplaza `NAV_ITEMS[]` plano por 8 grupos: Dashboard · Mañana · Meditar · Crear · Sonidos · Leer · Escribir · Archivo. Tap grupo → mini-grid 3×3 con `springTo()` scale. Preservar IDs de sección para no romper deep-links.

### Pilar 4 — Config Presets combinables (PENDING)
JSON `{tweaks, copyOverrides, colores, modoActual, fontScale, folders.lastGroup}`. API: `exportCurrent()`, `importPreset(json)`, `mergePresets([a,b,c])` con selector (colores de A + copys de B + modo de C). Share via `?preset=base64(json)` en URL. Tab "PRESETS" en EDIT VIEWER panel.

---

## 2 · Combo correcciones WhatsApp (C1-C12)

| # | Qué | Estado |
|---|---|---|
| C1 | Mandala: desactivar bordes dashed del slice-preview | **DONE** (hud-system.css + tweaks-modes.css) |
| C2 | Mandala save PNG gris @ 50% + `user.mandalaArchive[]` | PENDING |
| C3 | Nueva sección `#mandala-archive` galería thumbnails | PENDING |
| C4 | Lissajous: rotación `t+=0.004`, colores `--color-personal-1` live | **DONE** |
| C5 | `.magazine-card` banner full + column-count:2 + three.js micro | PENDING |
| C6 | Telemetry HUD tintado con `--color-personal-1`, listen `apacheta:colorsChanged` | **DONE** |
| C7 | Subtítulos heredan `--tweaks-titles` | PENDING |
| C8 | Anotación color picker persist via CSS var `--note-current-color` | PENDING |
| C9 | Calendar + "Notas recientes" clickeables → scroll a manifiesto | PENDING |
| C10 | HALLUCINATION global reconectado (expandir selectors `body.mode-hallucination .section`) | PENDING |
| C11 | Botones "Crear/Iniciar Manifiesto" → event `manifiesto:openEditor` | PENDING |
| C12 | Tweaks → "// EDIT VIEWER", fonts/sizes con preview de su propia fuente, paleta acuarela tech | **DONE base** (rename + preview); paleta acuarela PENDING |

---

## 3 · Estado actual de archivos (post-sesión 2026-04-19)

### Creados
- `src/core/feedback-bus.js`
- `src/core/copy-oracle.js`
- `src/core/copy-oracle-mock.js`
- `src/data/copy-registry.js`
- `src/data/banner-registry.js`
- `src/components/feedback-bus-panel.js`
- `src/components/oracle-modal.js`
- `styles/ventana2.css`
- `styles/oracle.css`
- `SESSION_HANDOFF_2026-04-19.md`

### Modificados
- `src/main.js` — imports + boot de feedbackBus + initFeedbackBusPanel + initCopyOracle + initOracleButtons
- `index.html` — stylesheets nuevos + labels `// EDIT VIEWER` + fonts/sizes preview inline
- `src/sections/lissajous.js` — rotación lenta + accent dinámico
- `src/sections/telemetry-hud.js` — listener colorsChanged
- `styles/hud-system.css` — slice-preview border 0
- `styles/tweaks-modes.css` — slice-preview CTA sin dashed
- `src/sections/{aura-composer,mandala,anotacion-rapida,chakras,scratch-reveal}.js` — bus pushes
- `src/core/tweaks-panel.js` — bus push color/mode

---

## 4 · Deploy — Vercel + GitHub (tech lead notes)

**Stack**: Vanilla JS + Vite 5 + Three.js r160 + localStorage. Sin backend (todo client-side). Apacheta vive en `d:/ANTS on MARS/AAAAexplora/apacheta/`. Dev: `npm run dev` → localhost:3005.

**Vercel**:
- Framework preset: Vite.
- Build: `npm run build` → `dist/`.
- Output dir: `dist`.
- Node 20.x.
- Env vars: ninguna por ahora (Oracle corre en mock; cuando se enchufe NotebookLM será via serverless function proxy — ver §6).

**GitHub Actions hack**:
- Trigger deploy automático en push a `main` via Vercel Git integration.
- Para previews por PR: Vercel preview deployments ya activos por default.
- **Cuidado con `viernestator/banners/`**: 19 imágenes ~5MB total. Considerar mover a `public/banners/` (Vite las copia raw a `dist/`) o a Vercel Blob si crece.
- **Service worker** pendiente: la app funciona offline con localStorage pero no hay SW registrado. Cuando se agregue, cachear `/banners/*` y `/styles/*`.

**Deploy hacks concretos**:
1. `vite.config.js` debe tener `base: '/'` (relative paths rompen banner imports).
2. Stylesheet paths en `index.html` son `/styles/*.css` absolutos — Vercel los sirve bien; en subdirectorio rompen (no es el caso).
3. **Cache-busting de copyOverrides**: al hacer deploy nuevo, los `copyOverrides` persisten en localStorage del usuario → si cambia el selector DOM de un key, el override queda huérfano. Mitigación: `hydrateFromStorage()` usa `applyCopy()` que retorna false si no hay DOM match, así que no explota; pero el override queda stale. Agregar versioning: `user.copyOverridesVersion = N` y limpiar si `N < CURRENT`.
4. **HTTPS + cámara/mic**: respiración, lofi, birdsong usan MediaStream API — Vercel ya sirve HTTPS, no hay que hacer nada. Solo `localhost` funciona sin SSL.
5. **iOS safe-area**: respetar `env(safe-area-inset-*)` en trigger de Ventana 2 y tweaks-panel. Ya implementado en `oracle.css:180`.

---

## 5 · MCP NotebookLM — workflow de consulta

Cuando Franco corra `nlm login` y vuelva la auth:

### Cuadernos → keys del registry

| Cuaderno | Keys a consultar | Tipo de query |
|---|---|---|
| `02_APACHETA_PRODUCT` | todas las `*.title`, `*.kicker`, `*.invite` | `notebook_query` directo |
| `08_FILOSOFIAS_BIBLIOTECA` | `wisdom.*`, `scratch.*`, `frases.kicker`, `manifiestos.filosofia.*` | `notebook_query` + citar fuente |
| `11_PROYECTOS_VISION` | `wisdom.*` (VISUALISING WISDOM) | `cross_notebook_query` con 08 |
| `03_FRONTEND_SKILLS_THREEJS` | `lissajous.*`, `fibonacci.*`, `mandala.*` | micro-copy técnico |
| `05_TECH_2026_ABRIL` | `manifiestos.tech.*` | Skills/SDK patterns |
| `10_SKILLS_MD_AGENTS` | meta: estructura del propio Oracle | `research_start` si hace falta |

### Puente código → MCP (pendiente crear)

```js
// src/core/mcp-bridge.js
import { COPY_REGISTRY } from '../data/copy-registry.js';

const KEY_TO_NOTEBOOKS = {
  'wisdom.': ['08_FILOSOFIAS_BIBLIOTECA', '11_PROYECTOS_VISION'],
  'scratch.': ['08_FILOSOFIAS_BIBLIOTECA'],
  'chakras.': ['02_APACHETA_PRODUCT', '08_FILOSOFIAS_BIBLIOTECA'],
  'lissajous.': ['03_FRONTEND_SKILLS_THREEJS'],
  // …
};

window.apachetaMCPQuery = async ({ keys, bus, intent }) => {
  // 1. Agrupar keys por cuaderno relevante
  // 2. Por cuaderno: notebook_query con prompt construido con bus + intent
  // 3. Parsear respuesta → {key: variant}
  // 4. topTags = tag frequency del bus
  // 5. return { copys, topTags, source: 'notebooklm', sourceIds: [...] }
};

window.apachetaMCPAskSingle = async ({ key, intent }) => {
  const notebooks = pickNotebooks(key);
  const prompt = buildSinglePrompt(key, intent);
  // → 3 variantes
};
```

### Prompt template para Oracle bulk

```
Sos el Oracle de Apacheta (app de meditación/bienestar, tono editorial + TouchDesigner).
El usuario acumuló estas interacciones (feedback bus):
{bus-summary}
Intent manual: "{intent}"
Top tags: {topTags}

Regenerá estos {N} copys manteniendo largo similar al default:
{keys-with-defaults}

Devolvé JSON: {"key": "variante", ...}
```

---

## 6 · Smoke test checklist (para futuras sesiones)

```bash
cd "d:/ANTS on MARS/AAAAexplora/apacheta"
npm run dev
```

- [ ] Trigger `// VENTANA 2` bottom-right.
- [ ] Tap abre panel derecho.
- [ ] Guardar aura / mandala / nota → timeline crece.
- [ ] `✦ REGENERAR` → toast + cambios en DOM.
- [ ] Reload → copyOverrides persisten.
- [ ] Botones ✦ inline junto a títulos.
- [ ] Modal 3 variantes + chips + input.
- [ ] Mandala: sin bordes dashed.
- [ ] Lissajous: rotación lenta + color accent live al cambiar color en tweaks.
- [ ] Telemetry HUD: tintado cuando cambia accent.
- [ ] Tweaks panel: dice "// EDIT VIEWER", botones font con su fuente, botones size con su tamaño.
- [ ] Console: `Apacheta ready · HUD system merged · Feedback Bus + Oracle online`.

---

## 7 · Indicaciones de Franco (textuales, para memory)

- "TOOOODO el feedback que vas dando durante la pagina, like de secciones, aura, dias, slices, midi, lo que hayas escrito / se muestre de manera logica en ese ultimo mock dentro de la app, y que acumulando varios de esos, desde la app (deployeada en vercel, ahora en github y no puleada todavía hasta el final) que apretes y todo eso se mande a renovar el frontside de textos y banners buscados COMPLETOS, PEROOOO / sin perder lo anterior, osea eso es la VENTANA 2 de la aplicacion acumulativa"
- "mergeamos secciones, los repositorios, los codigos para trear, o triplicar una configuracion completa de aplicacion, haciendo mas combinable mas aplicacion todo"
- "onboarding de como preguntar y agregar cambios de copys de estas secciones previas, entendiendo bien las ideas 'Presentaciones Slides: Ecosistema VISUALISING WISDOM > Sabiduría Visualizada y Guía Estratégica' + 02 — APACHETA_PRODUCT"
- "mandalo al mcp de notebookLM a que lo complete y lo guarde como fuente de ultima, escrito como MD agent skill roles persona ingeniero tech lead vercel app developer github deploy hacks, mis propios indicaciones y demas"
- "Bueno, con el flujo, como hacemos siempre..." (= additive, mock primero, MCP después, no romper).

---

## 8 · Próxima sesión — TL;DR

1. `nlm login` → subir este MD como source a `02_APACHETA_PRODUCT` via `source_add`.
2. Smoke test en localhost:3005 (checklist §6).
3. Seguir con: `data-copy-key` en 6 templates pendientes → Ventana 2 historial rollback UI → Onboarding copy step → Manifiesto Gestor 3col → Drawer NAV_GROUPS → Config Presets → resto del combo.
4. Cuando todo el pilar 1+2 esté en mock: crear `src/core/mcp-bridge.js` con los hooks `window.apachetaMCPQuery/AskSingle` — switch automático del Oracle de mock a real.

---

**Fin source. Subir a NotebookLM cuando vuelva la auth.**
