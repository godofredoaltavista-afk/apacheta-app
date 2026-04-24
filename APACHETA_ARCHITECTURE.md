# APACHETA — ARCHITECTURE.md
## Documento de referencia técnica · Actualizar después de cada sesión

---

## STACK

| Capa | Tecnología | Notas |
|------|-----------|-------|
| 3D/Shaders | Three.js r183 WebGPU | Singleton renderer, canvas detrás del HTML |
| Frontend | HTML5 + CSS3 + Vanilla JS | Modular, sin framework |
| Bundler | Vite | Dev server, HMR |
| Estado | localStorage (MVP) | Luego Firebase/Supabase |
| Animación | CSS Transitions + GLSL | Bordes, flips, shaders |
| Fuentes | Google Fonts (Playfair Display, Inter) + Share Tech Mono | |
| Deploy | Vercel (futuro) | Local-first durante desarrollo |

---

## ESTRUCTURA DE CARPETAS

```
/apacheta/
├── index.html
├── package.json
├── vite.config.js
├── ARCHITECTURE.md          ← este archivo
├── APACHETA_MANIFIESTO.md   ← visión del producto
├── /src/
│   ├── main.js              ← entry, Three.js init, IntersectionObserver
│   ├── /sections/           ← una sección = un archivo
│   │   ├── onboarding.js
│   │   ├── dashboard-dia.js
│   │   ├── biblioteca.js
│   │   ├── manifiestos.js
│   │   ├── anotacion-rapida.js
│   │   ├── respiracion.js
│   │   ├── chakras.js
│   │   └── conexiones.js
│   ├── /shaders/
│   │   ├── nebulosa.glsl
│   │   ├── aura.glsl
│   │   └── hover-suave.glsl
│   ├── /components/
│   │   ├── ventana-modal.js
│   │   ├── post-it.js
│   │   ├── card-obra.js
│   │   ├── selector-color.js
│   │   └── respiracion-visual.js
│   ├── /assets/
│   │   └── /svg-animated/
│   └── /data/               ← JSONs estáticos para MVP
│       ├── frases.json
│       ├── obras.json
│       ├── chakras.json
│       └── challenges.json
└── /styles/
    ├── variables.css
    ├── global.css
    └── sections.css
```

---

## PATRONES DE ARQUITECTURA

### Three.js Singleton
```javascript
// src/main.js
export const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
export const scene = new THREE.Scene();
export const camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);

// Cada section importa el renderer y agrega/remueve sus meshes
// IntersectionObserver activa/desactiva shaders por sección visible
```

### Section Pattern
```javascript
// Cada archivo en /sections/ exporta:
export function init() {}      // setup inicial
export function activate() {}  // cuando la sección entra en viewport
export function deactivate() {} // cuando sale del viewport
export function destroy() {}   // cleanup
```

### Estado del Usuario (localStorage)
```javascript
const USER = {
  nombre: '',
  signo: '',
  nacimiento: '',
  colores: ['', '', ''],       // 3 colores personales
  modoActual: 'manana',        // manana/tarde/noche/alucinaje
  ultimasAnotaciones: [],      // array de strings, últimas 3
  onboardingCompleto: false,
}
// Key: 'apacheta_user'
```

### Modo del Día (automático por hora)
```javascript
function getModoActual() {
  const hora = new Date().getHours();
  if (hora >= 6 && hora < 12) return 'manana';
  if (hora >= 12 && hora < 20) return 'tarde';
  if (hora >= 20 || hora < 6) return 'noche';
  // 'alucinaje' solo se activa manualmente
}
```

---

## DESIGN TOKENS — REFERENCIA RÁPIDA

```css
/* Fondos */
--bg-primary: #FFFFFF
--bg-soft: #F8F6F2
--bg-cream: #F5F0E8

/* Acentos pastel */
--accent-cyan-pastel: #A8E6E0
--accent-rosa-pastel: #F4C2C2

/* Secciones con carácter */
--seccion-filosofia-bg: #2D5016    /* verde inglés */
--seccion-filosofia-text: #FFE44D  /* amarillo marcador */
--seccion-tech-bg: #1B2B4B
--seccion-tech-text: #FFFFFF

/* Typography scale */
--text-display: clamp(2.5rem, 8vw, 5rem)
--text-title: clamp(1.5rem, 5vw, 2.5rem)
--leading-body: 1.8
--leading-quote: 2.0

/* Radius iOS-like */
--radius-md: 24px
--radius-lg: 48px

/* Shadows iOS-like */
--shadow-md: 0 8px 32px rgba(0,0,0,0.10)
```

---

## PUERTOS LOCALES

| Proyecto | Puerto | Comando |
|---------|--------|---------|
| South Hustles | 3004 / 5175 | npm run dev |
| Ant on Mars | 3004 / 5175 | (standby) |
| **Apacheta** | **3005** | npm run dev |

---

## REFERENCIAS VISUALES

- **Antigravity** — blanco, limpio, espiritual, iOS
- **Gaia** — editorial warmth, contenido profundo
- **Spotify** — galería de obras giratorias
- Apps de yoga iOS — sombras suaves, ventanas que abren, bordes redondeados
- Pinterest boards: mindfulness apps, yoga UI, fibonacci layouts

---

## REGLAS DEL PROYECTO

1. **Additive only** — nunca eliminar código existente
2. **Mobile-first** — 430px base, escalar hacia arriba
3. **White mode** — no dark mode en MVP
4. **Section isolation** — cada sección no rompe las otras
5. **Performance mobile** — shaders simples, lazy load
6. **Localhost antes de commit** — siempre verificar visual antes de push
7. **Un bug a la vez** — no avanzar sección nueva con bugs abiertos en la anterior

---

## SESIONES — LOG

| Sesión | Fecha | Qué se hizo | Estado |
|--------|-------|-------------|--------|
| 01 | - | Setup + Onboarding + Dashboard básico | Pendiente |
| 02 | - | Biblioteca + Card flip 3D | Pendiente |
| 03 | - | Respiración + Nebulosa shader | Pendiente |
| 04 | - | Modos del día + Alucinaje | Pendiente |
| 05 | - | Manifiestos + Anotación rápida | Pendiente |

---

*Actualizar este archivo al final de cada sesión de implementación.*
