# PROMPT — APACHETA FRONTEND V1
## Nueva aplicación de mindfulness / hub de conocimiento personal
## Para usar en: VS Code / Claude Code / Agente de implementación
## Carpeta: /apacheta/ (repositorio nuevo, separado de South Hustles)

---

## CONTEXTO DEL PROYECTO

Sos un tech lead full stack creando desde cero el frontend de **Apacheta**, una aplicación de conocimiento personal y mindfulness. Es un proyecto de dos desarrolladores argentinos de Córdoba, 27 años, que están construyendo su propia "biblia" de conocimiento.

**Esto NO es South Hustles.** El stack base es similar (Three.js, HTML modular, shaders) pero la estética es completamente opuesta: blanca, editorial, espiritual, mobile-first.

La referencia visual es: **Antigravity + Gaia + App de yoga iOS + Spotify si fuera todo arte**.

---

## 1. ARQUITECTURA BASE — CREAR DESDE CERO

```
/apacheta/
├── index.html              # Entry point, mobile-first
├── package.json
├── /src/
│   ├── /sections/          # Cada sección = archivo independiente
│   │   ├── onboarding.js
│   │   ├── dashboard-dia.js
│   │   ├── biblioteca.js
│   │   ├── manifiestos.js
│   │   ├── anotacion-rapida.js
│   │   ├── respiracion.js
│   │   ├── chakras.js
│   │   └── conexiones.js
│   ├── /shaders/           # GLSL shaders para fondos y efectos
│   │   ├── nebulosa.glsl   # Degradado cian pastel → rosa pastel
│   │   ├── aura.glsl       # Shader personalizado según colores del usuario
│   │   └── hover-suave.glsl
│   ├── /components/        # Componentes reutilizables
│   │   ├── ventana-modal.js
│   │   ├── post-it.js
│   │   ├── card-obra.js    # Card que gira (Spotify → obra de arte)
│   │   ├── selector-color.js
│   │   └── respiracion-visual.js
│   ├── /assets/
│   │   ├── /svg-animated/  # SVGs animados: chakras, respiración, íconos
│   │   └── /fonts/
│   └── main.js             # Init, Three.js renderer singleton, scroll
├── /styles/
│   ├── variables.css       # Sistema de design tokens
│   ├── global.css
│   └── sections.css
└── ARCHITECTURE.md         # Documentar todo al final
```

---

## 2. DESIGN SYSTEM — TOKENS

### 2.1 Paleta base (white mode)
```css
:root {
  /* Fondos */
  --bg-primary: #FFFFFF;
  --bg-soft: #F8F6F2;        /* cream suave */
  --bg-cream: #F5F0E8;       /* cream cálido */
  
  /* Tipografía */
  --text-primary: #1A1A1A;
  --text-secondary: #555555;
  --text-muted: #999999;
  
  /* Acentos */
  --accent-cyan-pastel: #A8E6E0;
  --accent-rosa-pastel: #F4C2C2;
  --accent-verde-ingles: #2D5016;
  --accent-amarillo-marcador: #FFE44D;
  --accent-azul-tech: #1B2B4B;
  
  /* Por sección */
  --seccion-filosofia-bg: #2D5016;
  --seccion-filosofia-text: #FFE44D;
  --seccion-tech-bg: #1B2B4B;
  --seccion-tech-text: #FFFFFF;
  --seccion-emocional-bg: #E8E8E8;
  --seccion-emocional-text: #1A1A1A;
  --seccion-alucinaje-bg: #F4C2C2;
  --seccion-alucinaje-text: #A8E6E0;
  
  /* Radios */
  --radius-sm: 12px;
  --radius-md: 24px;
  --radius-lg: 48px;
  --radius-full: 9999px;
  
  /* Shadows (iOS-like) */
  --shadow-sm: 0 2px 8px rgba(0,0,0,0.06);
  --shadow-md: 0 8px 32px rgba(0,0,0,0.10);
  --shadow-lg: 0 24px 64px rgba(0,0,0,0.14);
}
```

### 2.2 Tipografía
```css
/* Display: editorial, mucho aire */
font-family: 'Playfair Display', Georgia, serif;  /* títulos grandes */
font-family: 'Inter', -apple-system, sans-serif;  /* body */
font-family: 'Share Tech Mono', monospace;        /* datos/HUD */

/* Jerarquía de tamaños — mobile */
--text-display: clamp(2.5rem, 8vw, 5rem);
--text-title: clamp(1.5rem, 5vw, 2.5rem);
--text-subtitle: clamp(1rem, 3vw, 1.25rem);
--text-body: 1rem;
--text-small: 0.875rem;

/* Interlineado meditativo */
--leading-display: 1.1;
--leading-body: 1.8;      /* más aire que lo normal */
--leading-quote: 2.0;     /* frases con mucho espacio */
```

### 2.3 Layout Mobile-First
```css
/* Contenedor base */
max-width: 430px;         /* iPhone 15 Pro Max width */
margin: 0 auto;
min-height: 100svh;       /* safe viewport height */
overflow-x: hidden;

/* Grid Fibonacci para layouts */
/* Círculos más grandes abajo, más chicos arriba */
/* Texto centrado con mucho espacio lateral */
```

---

## 3. SECCIONES A IMPLEMENTAR — PRIORIDAD ALTA

### 3.1 ONBOARDING (primera pantalla)
```
- Fondo blanco, micro animación de entrada (fade suave)
- Ventana modal centered: "Buen día 🌱 ¿Cómo te llamás?"
- Input nombre → input signo → input fecha nacimiento
- Selector de 3 colores: 6 opciones con shader preview en vivo
  (los colores elegidos definen --color-personal-1/2/3 del usuario)
- Botón: "Empezar" → guarda en localStorage → nunca más se ve
- Animación de transición al dashboard
```

### 3.2 DASHBOARD DEL DÍA
```
- Header: nombre del usuario + fecha (ej: "Franco · Miércoles")
- Ícono del día: SVG animado (chakra, elemento, tema rotativo)
- Frase del día (hardcoded en MVP, luego dinámico)
- Challenge del día: card con pregunta → dato → acción
- Modo actual (mañana/tarde/noche/alucinaje) visible como badge
- Scroll vertical hacia las secciones debajo
```

### 3.3 BIBLIOTECA / GALERÍA DE OBRAS
```
- Grid de cards cuadradas (2 columnas mobile)
- Cada card = obra de arte / álbum / mantra
- Al tocar: flip 3D (Three.js o CSS transform-style: preserve-3d)
- Frente: imagen/color + título
- Dorso: notas del autor + 2-3 conexiones clickeables + link externo
- Filtros horizontales scrolleables: filosofía / música / neuro / yoga / tech
```

### 3.4 ANOTACIÓN RÁPIDA
```
- Botón flotante (+) siempre visible (bottom right)
- Al tocar: abre modal desde abajo (iOS sheet style)
- Textarea con placeholder poético
- Tags automáticos sugeridos al tipear
- Botón: "Guardar como post-it" → minimiza a esquina
- Post-it minimizado: toca → expande → opciones: convertir a manifiesto / exportar
```

### 3.5 RESPIRACIÓN
```
- Círculo central grande que pulsa (SVG + CSS animation)
- 3 modos: 4-7-8 / box breathing / coherencia cardíaca
- Texto que guía: "Inhalar... Sostener... Exhalar..."
- Fondo shader nebulosa activo durante esta sección
- Opción: vibración (navigator.vibrate API)
- Slide suave entre modos (como pincel horizontal)
```

### 3.6 MODOS DEL DÍA
```
Implementar como overlay o sección dedicada:

🌅 MAÑANA (6-12hs): bg cream, texto oscuro, frase motivadora + acción física
🌆 TARDE (12-20hs): bg verde inglés, texto amarillo, conexión de ideas
🌙 NOCHE (20-24hs): bg gris oscuro, texto blanco, cita profunda, retrospectiva
🍄 ALUCINAJE (toggle manual): 
   - Assets que se mueven solos
   - Degradado nebulosa de fondo
   - Frases no convencionales
   - Conexiones inesperadas entre temas
   - Tipografía que varía su tracking/weight
```

---

## 4. SHADERS — ESPECIFICACIONES

### 4.1 Nebulosa (fondo principal en sección respiración y alucinaje)
```glsl
/* Degradado animado: cian pastel (#A8E6E0) → rosa pastel (#F4C2C2) */
/* Con burbujas suaves / noise orgánico */
/* Mouse hover: las burbujas responden levemente al cursor */
/* Performance: debe funcionar en mobile sin lag */
```

### 4.2 Aura (personalizado por colores del usuario)
```glsl
/* Usa --color-personal-1/2/3 del usuario */
/* Fondo sutil, casi imperceptible, como aura */
/* Activo en dashboard y onboarding */
```

### 4.3 Hover suave en cards
```glsl
/* Cuando hover en card: iluminación desde el cursor */
/* Color de iluminación: var(--color-personal-1) del usuario */
/* Suave, nada agresivo */
```

---

## 5. COMPONENTES CLAVE — DETALLES

### Card Obra de Arte (flip 3D)
```javascript
// CSS: transform-style: preserve-3d, perspective: 1000px
// Estado: frente / dorso (toggle con click/tap)
// Frente: imagen + título + subtítulo autor
// Dorso: 
//   - 3 notas cortas del autor
//   - 2 conexiones (botones que llevan a otra obra o link externo)
//   - Tag de categoría
// Animación: rotateY(180deg) con ease suave (0.6s)
```

### Ventana Modal (iOS sheet style)
```javascript
// Sube desde abajo, 90% de la altura de pantalla
// Handle bar arriba para cerrar arrastrando
// Backdrop blur suave detrás
// Bordes redondeados arriba (radius 24px)
// Nunca es fullscreen, siempre se ve el contexto detrás
```

### Selector de Color (onboarding)
```javascript
// 6 círculos grandes con shader preview
// Al tocar: se marca con check, se actualiza el preview global
// Máximo 3 seleccionados
// Los colores se guardan en localStorage como --color-personal-1/2/3
// Se aplican inmediatamente al aura shader del fondo
```

---

## 6. THREE.JS — SINGLETON

```javascript
// Un solo renderer para toda la app
// Canvas fullscreen detrás del contenido HTML
// Z-index: -1 (el HTML va por encima)
// Sections pueden activar/desactivar shaders por IntersectionObserver
// Lazy loading: el shader de nebulosa solo carga cuando su sección es visible

// Init en main.js:
const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
// Compartido entre todas las secciones via export
```

---

## 7. REGLAS ABSOLUTAS

```
✅ Mobile-first — diseñar para 430px, escalar hacia arriba
✅ White mode principal — sin dark mode en MVP
✅ Additive only — nunca eliminar código
✅ Cada sección = archivo separado en /src/sections/
✅ localStorage para estado del usuario en MVP
✅ Bordes redondeados en todo (nada sharp)
✅ Mucho interlineado — la app respira
✅ Performance mobile — shaders simples, lazy load de assets
✅ Paleta por sección — cada sección tiene su mundo de color
❌ No dark mode en MVP
❌ No copiar estética de South Hustles (nada de lime #B4FF50 acá)
❌ No tipografía Bebas Neue acá (demasiado heavy para este contexto)
❌ No instalar dependencias no confirmadas
❌ No crear archivos HTML sueltos fuera de la arquitectura
```

---

## 8. PRIMERA SESIÓN — SCOPE ACOTADO

En la primera sesión de implementación, entregar solo:

1. **Estructura de carpetas completa** creada y documentada
2. **Design tokens** (variables.css) completo y funcional
3. **Onboarding** funcionando en localhost (selector de colores + localStorage)
4. **Dashboard del día** con frase hardcoded y modo del día por hora
5. **Una card de biblioteca** con flip 3D funcionando
6. **Shader nebulosa** básico en la sección de respiración

No implementar todo de una. Confirmar cada sección antes de avanzar.

**Localhost en puerto diferente a South Hustles para correr en paralelo.**

---

## 9. OUTPUT ESPERADO SESIÓN 1

- Localhost corriendo (ej: puerto 3005)
- Onboarding completo y funcional
- Dashboard básico con modo del día
- Una card que flipea
- Nebulosa shader visible
- ARCHITECTURE.md generado automáticamente al final

**Mostrar en localhost antes de cualquier commit o deploy.**
