# SUPER CONTEXTO — Visión Apacheta Next Level
**Fecha:** 2026-04-18 03:00 AM | **Autor:** Franco Altavista | **Para:** Opus 4.7 + Claude Design

---

## ESTADO VISUAL ACTUAL (screenshots localhost:3005)

### Lo que funciona y está bien
- Hero Morning: "Buenas Noches" con cards fecha/frase — limpio
- Dashboard: stats row (06/3/—), 4 float cards, aura history 7 días, arcano, pills — funciona
- Visualising Wisdom: canvas gradiente + palabras numeradas + "I AM EVERYTHING" — hermoso
- Ajetreo Sur: burbujas grandes superpuestas en cream — limpio
- Biblioteca: cards con emoji/gradiente, filtros Filosofía/Música/Neu — existe
- Scratch Reveal: 4 cards con RASCÁ y gradiente pastel — funciona
- Respiración: modo 4-7-8 con círculo animado — funciona SOLO ese modo
- Manifiestos: 3 secciones (01-FILOSOFÍA verde/amarillo, 02-TECH azul/blanco, 03-EMOCIONAL beige) con partículas — funciona
- Conexiones: 5 culturas + "El naranja fue el primer pigmento humano" — funciona
- breathe: flujo/fractal/origen cards deslizables — funciona
- Om/Soplar: micrófono ritual — existe
- Aura Composer: sliders calma/foco/creatividad/energía/intuición + canvas gradiente — funciona
- Mandala: canvas con simetría — funciona
- Morning Journey: campos gratitud/intención/cuerpo/acción/afirmación/recap — funciona
- Ojo de meditación: SVG animado, cerrar ojos, 7 chakra dots — funciona
- Lofi/Birdsong: 4 ambientes (pájaros, lluvia, océano, fuego), duraciones — funciona
- Aura History: 3 cards día con gradiente — funciona
- Alarma: despertar ritual con countdown — funciona
- Footer: APACHETA · Tu biblia. Tu lenguaje. Tu frecuencia.

### Modo Hallucination (screenshot 2)
- Toda la app se tiñe con `--color-personal-2` (rosa #F4C2C2) y `--color-personal-1` (cian)
- El nav home button se vuelve cian
- Las cards del dashboard se tiñen en rosa
- **PROBLEMA: No todas las secciones respetan los colores del HUD en tiempo real**

---

## PROBLEMAS IDENTIFICADOS (prioridad)

### P0 — Bugs que rompen UX
1. **Respiración**: Box y Coherencia NO funcionan — solo 4-7-8 activo
2. **Biblioteca**: filtros no visibles, las 4 cards no se pueden tap para abrir sub-sección
3. **Contextos (Ajetreo Sur)**: burbujas no tienen botón ni texto interactivo — solo visuales
4. **Color HUD**: no todas las secciones reaccionan a cambios en tiempo real

### P1 — Features incompletos críticos
5. **Frases del día**: no hay like/dislike — sin feedback para guardar
6. **Scratch Reveal**: el tiempo de rascado es muy corto — necesita ~80% de scratch antes de revelar
7. **Om ritual**: cuando completás el Om no pasa nada — debería mostrar el aura
8. **Calendar window**: la ventana de notas aparece desde abajo — debería aparecer desde arriba
9. **Manifiestos "Crear manifiesto"**: el botón no hace nada — debería abrir pizarra

### P2 — Mejoras visuales importantes
10. **Clock/Hero**: solo muestra hora y fecha — necesita asset visual del modo del día
11. **Editorial sections**: no son editables — el texto debería ser seleccionable y guardable
12. **Lissajous**: no hay botón de guardar la forma — sin persistencia
13. **Fibonacci**: textos no están orientados sobre los cuadrados — espiral descentrada
14. **Morning Journey**: campos de texto sin micro-visuales — necesita emojis/SVG contextuales

---

## VISIÓN DETALLADA POR SECCIÓN

### HERO MORNING
**Hoy:** Hora + "Buenas Noches" + 2 cards (fecha, frase)
**Next:**
- Reloj 3D circular tipo arena: muestra el atardecer/amanecer/noche
- Paisaje que cambia: de noche (estudio de chapa/madera/vidrio con luna), de día (granja con perros y molino, sol)
- La frase del día tiene 3 slides deslizables izquierda/derecha entre frases
- Cada frase tiene botón ♥ (guardar → sube animado al FAB) y ✗ (skip)
- Al guardar: partícula sube desde la card hasta el FAB con spring physics

### DASHBOARD
**Hoy:** Stats + float cards + aura history + arcano + pills
**Next:**
- El heartbeat SVG → más grande, horizontal, con color del HUD
- Aura history row → tap en un día → se abre panel con conclusión (query a NotebookLM)
- Arcano card → cambia color de fondo con cada día
- El ticker horizontal de secciones → items en color del HUD

### BIBLIOTECA
**Hoy:** 4 cards con emoji + filtros (Todos/Filosofía/Música/Neu)
**Next:**
- 8 cards en lugar de 4, más horizontales
- Al tap en una card de MÚSICA → se abre panel tipo Spotify:
  - Vinilo animado girando (CSS radial + rotate)
  - Nombre del artista + año
  - Preview de 30seg via AudioContext
- Al tap en FILOSOFÍA → se abre panel tipo Editorial:
  - Hojas amarillas con puntitos (background: radial-gradient)
  - Texto en máquina de escribir (typewriter effect)
  - Sellos de colores del usuario
  - Texto seleccionable y guardable
- Al tap en NEUROCIENCIA → se abre panel tipo Dashboard técnico
- Cada panel emerge desde abajo con spring overshoot

### SCRATCH REVEAL
**Hoy:** 80% de scratch revela el texto
**Next:**
- Primera card: debe rascar el 85% para revelar el fragmento
- Segunda card se desbloquea cuando la primera fue 100% revelada
- Texto revelado tiene botón ♥ para guardar
- Al guardar: el texto se convierte en nota con tag `descubrimiento`

### RESPIRACIÓN
**Hoy:** Solo 4-7-8 funciona
**Next:**
- Box breathing: animación de cuadrado que se expande/contrae (4 lados en secuencia)
- Coherencia: animación de ola suave continua (sinusoidal)
- Botón "Iniciar respiración" → tiene efecto de aire soplando (partículas que flotan)
- Fondo cambia de color según el modo: 4-7-8 (cian), Box (verde), Coherencia (lavanda)

### EDITORIAL SECTIONS (La mañana no espera / Conectar las ideas / El día cerró)
**Hoy:** Solo texto hardcodeado con partículas
**Next:**
- Texto seleccionable con `contenteditable="true"`
- Al seleccionar → aparece mini toolbar: ✏️ editar | ♥ guardar | 📌 fijar
- Al guardar → va a manifiestos con el tag de esa sección
- Cada sección tiene un asset Three.js lateral (líneas, esferas, geometría)

### OM / SOPLAR
**Hoy:** Micrófono detecta volumen, barra de energía
**Next:**
- Al llegar al 100% de energía: FLASH de pantalla en color del HUD
- El logo de Apacheta aparece gigante en el centro, respira 3 veces
- Mensaje: "Qué bien. Ahora cerrá los ojos."
- Transición suave al aura composer
- Sonido de campana tibetana (Web Audio: osc de 440hz con decay largo)

### AURA COMPOSER
**Hoy:** Sliders + canvas + guardar
**Next:**
- Al tap en aura history row → abre conclusión:
  - Loading 1.5seg con animación
  - Query a NotebookLM cuaderno APACHETA_PRODUCT: "dado aura {valores}, ¿qué refleja?"
  - Resultado en card con color del día
- El color del mandala se inicializa con `--color-personal-1/2/3` del usuario

### LISSAJOUS
**Hoy:** Canvas negro + 2 sliders de frecuencia
**Next:**
- Botón "Guardar esta frecuencia" en color del HUD
- Al guardar: la curva se convierte en imagen blanco/negro (grayscale canvas)
- Hover/touch sobre la imagen → sombra 3D suave (CSS perspective transform)
- La forma guardada aparece en el dashboard como mini-preview

### FIBONACCI
**Hoy:** Animación de espiral sobre negro
**Next:**
- Textos orientados y rotados sobre cada cuadrado de la espiral
- Espiral centrada y más grande (ocupa 90% del canvas)
- Animación continua de afuera hacia adentro
- Número de Fibonacci actual mostrado en mono font grande en el centro

### MORNING JOURNEY
**Hoy:** Campos de texto simples con labels en mono font
**Next:**
- "algo pequeño de hoy" → aparece una ☀️ SVG animada al lado
- "una persona" → aparece silueta SVG (hombre/mujer/perrito) que vos podés rotar con el dedo
- "algo de mi cuerpo o mente" → aparece corazón y cerebro conectados por líneas grises
- "una intención" → aparece velita SVG + manitos + playa minimalista
- Todos los íconos son líneas grises SVG, no emojis
- Al tap en el ícono → cambia entre 3 variantes

### MANIFIESTOS (Crear Manifiesto button)
**Hoy:** Botón que no hace nada
**Next:**
- Tap → se abre pizarra lateral desde la derecha (spring)
- La pizarra tiene:
  - Texto libre con Playfair Display
  - Herramienta de dibujo (círculos y nodos)
  - Líneas conectoras entre nodos
  - Al cerrar → el sistema analiza qué nodos se conectaron
  - Texto generado: "conectaste X con Y — eso dice que..."
  - Todo se guarda en `user.manifiestos`
- Esto es el "micro-figma de ideas"

### SONIDOS / LOFI
**Hoy:** 4 ambientes + duración + comenzar
**Next:**
- Sonido de lluvia → mejorar con Web Audio (noise buffer + filtro)
- Sonido de fuego → mejorar (noise buffer + LFO para chisporroteo)
- Pájaros → slider para controlar el timing entre cantos
- Al reproducir → partículas temáticas flotan por la sección (gotitas para lluvia, chispas para fuego, pájaritos para birdsong)
- Modo Estudio (swipe derecho): vinilo + octapad + VU meter

### CONTEXTOS (Ajetreo Sur)
**Hoy:** Burbujas visuales sin interacción
**Next:**
- Tap en burbuja → se abre modal con el tema de esa burbuja
- Cada burbuja tiene label visible (HOME, JOURNALING, etc.)
- Las burbujas se pueden agregar: botón + abre prompt "¿qué contexto nuevo?"
- Al agregar → nueva burbuja aparece con spring desde el centro

---

## COLOR HUD — Mejoras requeridas

El slider actual (borde izquierdo, 3 dots) funciona pero:
1. Necesita versión **horizontal** tipo el onboarding original:
   - Un slider que mezcla colores en degradé a tiempo real
   - Aparece en secciones clave al hacer swipe desde borde izquierdo
2. El degradé tiene que ser visible en **más secciones**:
   - Ticker del dashboard → letras en color del HUD
   - Botones de acción primaria → background del HUD
   - Cards de arcano → border en color del HUD
   - La nav pill → home button en color-personal-1

---

## ARQUITECTURA TÉCNICA PARA CLAUDE DESIGN

### Stack actual (NO CAMBIAR)
```
Vanilla JS + Three.js r160 + Vite 5
CSS Custom Properties para colores
localStorage como DB
IntersectionObserver para canvas
Spring physics: velocity += (to-current)*stiffness; velocity*=damping
```

### Patrón de sección que se abre (REPLICAR EN TODAS)
```javascript
// Spring desde la derecha
section.style.transform = 'translateX(100%)';
springTo({ from: 100, to: 0, stiffness: 0.12, damping: 0.75,
  onUpdate: v => section.style.transform = `translateX(${v}%)` });
```

### Patrón de feedback de guardado
```javascript
// Partícula que sube al FAB
const dot = document.createElement('div');
dot.style.cssText = `position:fixed;width:8px;height:8px;border-radius:50%;
  background:var(--color-personal-1);left:${x}px;top:${y}px;z-index:500`;
document.body.appendChild(dot);
springTo({ from: y, to: fabY, stiffness: 0.08, damping: 0.7,
  onUpdate: v => { dot.style.top = v + 'px'; dot.style.left = lerp(x, fabX, progress) + 'px'; },
  onDone: () => dot.remove() });
```

### Nuevo: Panel emergente desde arriba
```javascript
// Para calendar y notas — aparece desde top
panel.style.transform = 'translateY(-100%)';
springTo({ from: -100, to: 0, stiffness: 0.10, damping: 0.72,
  onUpdate: v => panel.style.transform = `translateY(${v}%)` });
```

---

## PROMPT PARA OPUS 4.7 EN CLAUDE DESIGN

Ver archivo: `PROMPT_OPUS47_CLAUDE_DESIGN.md`
