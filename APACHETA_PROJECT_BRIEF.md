# APACHETA — Project Brief
## Tu biblia. Tu lenguaje. Tu frecuencia.

**Marca:** AJETREOS DEL SUR · CBA · 2026  
**Stack:** React + Vite · Puerto 3005 · PWA mobile-first  
**Autor/usuario principal:** Godofredo / Franco

---

## 1. VISIÓN Y FILOSOFÍA

Apacheta es una Progressive Web App de bienestar personal y sistema operativo filosófico. No es una app de meditación genérica ni un diario digital convencional: es un **dashboard espiritual/intelectual personalizado** que refleja la frecuencia mental, emocional y creativa del usuario.

El nombre "Apacheta" refiere a las acumulaciones de piedras andinas que los viajeros construyen en las cimas de los cerros —cada piedra es una intención, un registro, una marca de presencia. La app funciona igual: es una acumulación de lo que el usuario lee, piensa, respira y siente.

### Principios fundacionales

- **Personal OS:** No es para todos. Es para un usuario. Toda decisión de UX debe servir a Franco/Godofredo.
- **Time-aware:** La app cambia con el tiempo del día. No es estática. Respira con el usuario.
- **Anti-ruido:** Sin notificaciones agresivas, sin gamificación vacía. Solo lo esencial, bien hecho.
- **Profundidad sobre amplitud:** Menos features, más intención en cada una.
- **Escritura propia como pilar:** El sistema organiza, pero el contenido lo genera el usuario. "Escribí tu propia Biblia."

---

## 2. DESIGN SYSTEM

### Paleta de colores

| Token | Valor HEX | Uso |
|---|---|---|
| `--color-cream` | `#f5f0e8` | Fondo base / Modo Mañana |
| `--color-dark-green` | `#2d4a1e` | Fondo Modo Tarde |
| `--color-navy` | `#1a1f3a` | Fondo Modo Noche |
| `--color-pink-light` | `#f0c4c4` | Modo Alucinaje / Sección cuántica |
| `--color-pink-mid` | `#e8a0a0` | Acentos rosa |
| `--color-yellow` | `#f5d848` | Texto sobre verde oscuro |
| `--color-sage` | `#7a9e8a` | Formas orgánicas / Contextos |
| `--color-text-dark` | `#1a1a1a` | Texto principal sobre crema |
| `--color-text-light` | `#f5f0e8` | Texto sobre fondos oscuros |

### Tipografía

- **Headers:** Serif editorial, tamaño grande (mínimo 2rem). Peso medio/bold. Transmite autoridad intelectual.
- **Body:** Sans-serif limpia. Tamaño legible en mobile (mínimo 16px).
- **Quotes:** Italic, serif, tamaño destacado.
- **Tags/Pills:** Uppercase, letter-spacing amplio, tamaño pequeño.

### Componentes base

- **Cards:** `border-radius` grande (≥16px), sombra suave (`box-shadow: 0 4px 20px rgba(0,0,0,0.08)`), padding generoso.
- **Bottom Nav:** Fija, 4 ítems (Inicio | Biblioteca | Respirar | Chakras).
- **FAB "+":** Flotante, centrado sobre bottom nav. Punto de entrada para crear contenido.
- **Pills/Tags:** Rounded, fondo semitransparente, texto en mayúscula.
- **Viewport base:** 375px (iPhone SE). Mobile-first siempre.

### Principios de UX

- Sin scroll horizontal.
- Animaciones suaves y con propósito (no decorativas).
- Gestos: swipe para navegación en carousels y contextos.
- Feedback visual inmediato en interacciones.

---

## 3. SECCIONES IMPLEMENTADAS

### 3.1 INICIO (Home)

El hub central. Se actualiza según la hora del día.

**Elementos:**
- **Saludo dinámico** según horario: "Buenos Días / Buenas Tardes / Buenas Noches" + nombre "godofredo" (minúscula, estilo propio).
- **Tarjeta de fecha:** Día de la semana + fecha completa, texto en rosa (`#e8a0a0`).
- **Frase del día:** Quote destacada con autor. Ejemplo: *"La restricción crea libertad."* — Nisargadatta / Miles Davis.
- **Contador de obras exploradas:** "Obras exploradas: 01/12" — progreso visual del usuario en la Biblioteca.
- **Dashboard de modo:** Pill/tag indicando el modo activo (Mañana / Tarde / Noche).

---

### 3.2 MODOS TEMPORALES (Time-aware Theming)

La app adapta colores, tipografía, prompts y quotes según el horario. Es el corazón de la experiencia.

#### MODO MAÑANA (06:00 → 12:00)
- **Fondo:** Crema / warm (`#f5f0e8`)
- **Tipografía:** Negra sobre crema
- **Header:** "no espera."
- **Quote:** *"Empieza donde estás. Usa lo que tenés. Hacé lo que podés."*
- **Sugerencia:** "10 minutos de movimiento antes de la pantalla"
- **Tono:** Activación, intención, arranque.

#### MODO TARDE (12:00 → 20:00)
- **Fondo:** Verde oscuro (`#2d4a1e`)
- **Tipografía:** Amarillo (`#f5d848`)
- **Header:** "Conectar las ideas."
- **Quote:** *"Todo lo que existe está conectado. Basta con mirar."*
- **Challenge:** "Encontrá una conexión entre algo técnico y algo espiritual"
- **Tono:** Concentración, síntesis, flujo creativo.

#### MODO NOCHE (20:00 → 06:00)
- **Fondo:** Navy azul oscuro (`#1a1f3a`)
- **Tipografía:** Crema / blanco suave
- **Header:** "El día cerró."
- **Quote:** *"No podés resolver un problema con el mismo nivel de consciencia que lo creó."*
- **Prompt:** "¿Qué fue lo mejor del día?"
- **Tono:** Reflexión, cierre, gratitud.

---

### 3.3 MODO ALUCINAJE

Un estado alterado de la UI activado mediante toggle switch.

- **Fondo:** Rosa (`#f0c4c4`)
- **Símbolo:** Infinito animado (∞)
- **Texto central:** *"La percepción no tiene pausa cuando la observás. ¿Y vos?"*
- **Tags:** neuroplasticidad, fractal
- **Feature integrada:** Guía de respiración 4-7-8

---

### 3.4 SECCIÓN "NOTHING / I AM EVERYTHING"

Inspirada en Nisargadatta Maharaj.

- **Visual:** Tarjeta con gradiente rosa-amarillo.
- **Texto animado (poema):** "Between / Two / My / Life / Moves" — aparece palabra por palabra o línea por línea.
- **Quote completa:** *"Wisdom is knowing I am nothing, love is knowing I am everything, and between the two my life moves."* — Nisargadatta Maharaj
- **Paleta de colores:** 10 swatches de color debajo de la tarjeta (inspiración cromática).

---

### 3.5 CONTEXTOS

Exploración de ideas a través de formas orgánicas.

- **Visual:** Formas abstractas superpuestas — círculos sage green (`#7a9e8a`) y rosa pálido sobre fondo crema.
- **Navegación:** Flechas ← → para navegar entre contextos.
- **Fondo:** Crema.

---

### 3.6 BIBLIOTECA

El catálogo de obras que moldean la frecuencia del usuario.

- **Título:** "Obras que definen tu frecuencia"
- **Filtros:** Todos | Filosofía | Música
- **Layout:** Grid 2 columnas con covers visuales

| Obra | Autor | Año |
|---|---|---|
| Kind of Blue | Miles Davis | 1959 |
| Gödel Escher Bach | Douglas Hofstadter | 1979 |
| Meditaciones | Marco Aurelio | s. II d.C. |
| A Love Supreme | John Coltrane | 1965 |

---

### 3.7 DESCUBRÍ — "Rascá para revelar"

Mechanic de descubrimiento con scratch cards.

- **4 tarjetas** en colores pastel: azul, púrpura, verde, naranja.
- **Interacción:** Scratch-to-reveal táctil (Canvas o CSS clip-path).
- **Conceptos revelados:** Fibonacci, Naturaleza, Siston y otros.

---

### 3.8 RESPIRAR

Guía de respiración consciente con tres modos.

| Modo | Patrón |
|---|---|
| 4-7-8 | Inhalar 4s / Sostener 7s / Exhalar 8s |
| Box | 4s / 4s / 4s / 4s |
| Coherencia Cardíaca | 5s / 5s (o 6s / 6s) |

- **Visual central:** Círculo animado que se expande/contrae según la fase.
- **Fases mostradas:** Inhalar / Sostener / Exhalar (texto dinámico).
- **CTA:** Botón "Iniciar respiración".

---

### 3.9 CHAKRAS

Mapa de los siete centros energéticos.

- **Título:** "Siete centros. Siete mundos."
- **Lista con íconos de color:**

| # | Nombre | Elemento | Descripción |
|---|---|---|---|
| 1 | Muladhara / Raíz | Tierra | Seguridad, instinto de supervivencia |
| 2 | Svadhisthana / Sacro | Agua | Creatividad, placer, emoción fluida |
| 3 | Manipura / Plexo Solar | Fuego | Voluntad, poder personal, acción |
| 4 | Anahata / Corazón | Aire | Amor, compasión, equilibrio |
| 5 | Vishuddha / Garganta | Éter | Expresión, comunicación auténtica |
| 6 | Ajna / Tercer Ojo | Luz | Intuición, visión, sabiduría |
| 7 | Sahasrara / Corona | Consciencia | Conexión universal, consciencia pura |

---

### 3.10 APACHETA (Sección Manifiesto)

El núcleo generativo de la app. Donde el usuario escribe su propia biblia.

- **Taglines:** *"Escribí tu propia Biblia. Nadie más puede hacerlo."* / *"Capturá lo que te mueve, lo que te desafía, lo que te define. El sistema lo organiza solo."*
- **Filtros:** Todos | Filosofía | Tech | Emocional | Cuántico
- **CTA:** Botón "Crear manifiesto →"

**Manifiestos generados (ejemplos):**

| # | Categoría | Título | Extracto |
|---|---|---|---|
| 01 | FILOSOFÍA | "El control es una ilusión útil." | Sobre los estoicos y el cortisol |
| 02 | TECH | "El código es..." | "Programar no es escribir instrucciones. Es estructurar ideas en el único lenguaje que no admite ambigüedad." |
| 03 | EMOCIONAL | "Sentir no es debilidad." | "La inteligencia emocional no es suprimir lo que sentís." |
| 04 | CUÁNTICO | "¿Y si el universo aprendió a verte?" | Física cuántica + espiritualidad |

---

### 3.11 ESTA SEMANA

Vista de la historia personal del usuario en días.

- **Título:** "Tu historia en días"
- **Calendario semanal:** L M X J V S D con días seleccionables/marcados.
- **Notas recientes:** Tarjeta amarilla (`#f5d848`) con la última nota del día.

---

### 3.12 CAROUSEL DE QUOTES

Colección curada de citas. Navegación manual (01/07).

- *"Hacé del presente tu amigo, no tu enemigo."* — Eckhart Tolle
- *"No buscás lo que querés. Buscás lo que sentís que merecés."* — Jim Carrey
- *"Amas lo que no podés controlar. Controlas lo que decidís no amar."* — Marco Aurelio, Meditaciones

---

### 3.13 CONEXIONES

Exploración intercultural de conceptos.

- **Tagline:** "Un concepto, tres culturas"
- **Filtros:** Griega | Azteca | Oriental | Andina | Africana
- **Concepto del día:** *"El naranja fue el primer pigmento humano"* — con conexión a monje budista y ofrenda andina.

---

## 4. NAVEGACIÓN Y ESTRUCTURA

### Bottom Nav (fija)
```
[ Inicio ]  [ Biblioteca ]  [ + FAB ]  [ Respirar ]  [ Chakras ]
```

### FAB "+"
Botón flotante centrado. Acción primaria: crear nuevo contenido (manifiesto, nota, registro).

### Footer
```
APACHETA — Tu biblia. Tu lenguaje. Tu frecuencia.
Nav: Inicio | Biblioteca | Manifiestos
```

---

## 5. REFERENCIAS FILOSÓFICAS Y CULTURALES

Estas influencias atraviesan toda la app en quotes, conceptos y diseño:

- **Nisargadatta Maharaj** — "I Am That". Advaita Vedanta. Nada/Todo.
- **Marco Aurelio** — Meditaciones. Estoicismo práctico.
- **Eckhart Tolle** — El poder del ahora. Presencia.
- **Miles Davis / John Coltrane** — Jazz como filosofía del flujo y la restricción creativa.
- **Douglas Hofstadter** — Gödel Escher Bach. Patrones, loops, metacognición.
- **Física cuántica** — No como pseudociencia, sino como metáfora de la interconexión.
- **Cosmología andina** — Apacheta, Pachamama, ciclos, reciprocidad.

---

## 6. PARA EL DESARROLLADOR / AGENTE

### Estructura de archivos sugerida (React + Vite)

```
src/
├── components/
│   ├── Nav/
│   │   ├── BottomNav.jsx
│   │   └── FAB.jsx
│   ├── Home/
│   │   ├── Greeting.jsx
│   │   ├── DateCard.jsx
│   │   ├── DailyQuote.jsx
│   │   └── ModeTag.jsx
│   ├── Modes/
│   │   ├── MorningMode.jsx
│   │   ├── AfternoonMode.jsx
│   │   ├── NightMode.jsx
│   │   └── AlucinajeMode.jsx
│   ├── Library/
│   │   ├── LibraryGrid.jsx
│   │   └── BookCard.jsx
│   ├── Breathe/
│   │   ├── BreatheCircle.jsx
│   │   └── BreatheControls.jsx
│   ├── Chakras/
│   │   └── ChakraList.jsx
│   ├── Manifesto/
│   │   ├── ManifestoCard.jsx
│   │   └── ManifestoForm.jsx
│   ├── Quotes/
│   │   └── QuoteCarousel.jsx
│   └── Connections/
│       └── ConnectionsView.jsx
├── hooks/
│   ├── useTimeMode.js       ← detecta modo según hora
│   └── useLocalStorage.js   ← persistencia local
├── utils/
│   └── timeHelpers.js
├── styles/
│   ├── tokens.css           ← variables CSS
│   └── global.css
└── App.jsx
```

### Hook clave: `useTimeMode`

```js
// src/hooks/useTimeMode.js
export function useTimeMode() {
  const hour = new Date().getHours();
  if (hour >= 6 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 20) return 'afternoon';
  return 'night';
}
```

### Variables CSS de temas

```css
/* src/styles/tokens.css */
:root {
  --cream: #f5f0e8;
  --dark-green: #2d4a1e;
  --navy: #1a1f3a;
  --pink-light: #f0c4c4;
  --pink-mid: #e8a0a0;
  --yellow: #f5d848;
  --sage: #7a9e8a;
}

[data-mode="morning"] {
  --bg: var(--cream);
  --text: #1a1a1a;
}

[data-mode="afternoon"] {
  --bg: var(--dark-green);
  --text: var(--yellow);
}

[data-mode="night"] {
  --bg: var(--navy);
  --text: var(--cream);
}
```

---

*Última actualización: Abril 2026 — AJETREOS DEL SUR · CBA*
