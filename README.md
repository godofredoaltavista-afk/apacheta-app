<div align="center">
<img src="docs/banner.svg" width="100%" alt="APACHETA"/>
</div>

<br/>

<div align="center">

[![Three.js](https://img.shields.io/badge/Three.js-r183_WebGPU-black?style=flat-square&logo=threedotjs)](https://threejs.org)
[![Vanilla](https://img.shields.io/badge/Vanilla--first-sin_frameworks-c8f135?style=flat-square&logoColor=black)](#)
[![Vercel](https://img.shields.io/badge/Deploy-Vercel-black?style=flat-square&logo=vercel)](https://vercel.com)
[![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-47A248?style=flat-square&logo=mongodb&logoColor=white)](https://mongoosejs.com)

</div>

---

## *"Tu biblia. Tu lenguaje. Tu frecuencia."*

**Apacheta** — del término andino: la acumulación de piedras en equilibrio que los viajeros dejan en los cruces de caminos de montaña. Los cimientos más pesados abajo. Las ideas más ligeras arriba. Eso hace esta app.

No es una app de notas. No es un Notion espiritual. No es un Headspace con skin nueva. Es un **espejo biotecnológico** — un sistema de **telemetría para el cerebro humano** desarrollado en Córdoba, Argentina. La persona se carga a sí misma — colores del día, mandala, notas, likes a frases — y la app le devuelve su propia esencia organizada, visualizada, más profunda.

El sistema rechaza categóricamente los patrones de diseño adictivos: no hay algoritmos de dopamina, no hay feeds sociales, no hay modo oscuro infinito. La interfaz **respira con el usuario**, adaptando su estética al ritmo circadiano. **Additive Only** — el código nunca se elimina, se apila en capas, igual que las piedras de una apacheta real.

> *"El sistema aprende tu lenguaje. Entiende tus aristas. Te devuelve conocimiento en el momento justo, en el formato visual correcto, con el tono exacto."*

> *"La soberanía no se declama, se codea."*

<img src="docs/divider.svg" width="100%"/>

## Modos Circadianos

La interfaz adapta su ADN visual al reloj biológico del usuario:

| Modo | Horario | Estética | Tono |
|---|---|---|---|
| **NATURE** · Mañana | 06:00 – 12:00 | Crema / Blanco (Antigravity) | Claridad, energía física, concreción suave |
| **ACTION** · Tarde | 12:00 – 20:00 | Verde / Amarillo lima | Creatividad, acción, conexión de ideas |
| **DARK** · Noche | 20:00 – 06:00 | Azul marino profundo | Expansión emocional, introspección, silencio |
| **HALLUCINATION** | Experimental | Rosa, celeste, activos animados | *"¿Y si el universo aprendió a verte?"* |

<img src="docs/divider.svg" width="100%"/>

## Sections

<table>
<tr>
<td align="center" width="25%">
<br/>
<b>🌌 Visualising Wisdom</b>
<br/><br/>
<sub>Una frase filosófica toma la pantalla completa con fondo sideral. El Oracle la elige según tu estado emocional del momento — no es aleatoria, es contextual. <em>"La sabiduría es saber que soy nada, el amor es saber que soy todo."</em> — Nisargadatta Maharaj</sub>
<br/><br/>
</td>
<td align="center" width="25%">
<br/>
<b>📚 Biblioteca</b>
<br/><br/>
<sub>Galería de referencias culturales, filosóficas y técnicas. Cada obra es un portal — al girarla revelás las "notas del artista" y conexiones profundas. <em>"Obras que definen tu frecuencia."</em> Tags semánticos que alimentan al Oracle para sugerencias cruzadas inesperadas.</sub>
<br/><br/>
</td>
<td align="center" width="25%">
<br/>
<b>✨ Aura Composer</b>
<br/><br/>
<sub>Cinco sliders de estado: calma, foco, creatividad, energía, intuición. El resultado se guarda con timestamp — el Oracle usa este estado para personalizar todo el contenido de la sesión. Tu estado emocional convertido en telemetría cromática.</sub>
<br/><br/>
</td>
<td align="center" width="25%">
<br/>
<b>🔮 Oracle</b>
<br/><br/>
<sub>Recibe tu `feedbackBus` (aura + historial de 7 días), los keys de la sección activa y el intent. Consulta NotebookLM y devuelve copy en JSON adaptado por sección. Fallback local con `SECTIONS_SCHEMA` semántico si no hay API key.</sub>
<br/><br/>
</td>
</tr>
<tr>
<td align="center" width="25%">
<br/>
<b>🌀 Mandala</b>
<br/><br/>
<sub>Canvas de dibujo simétrico — tu trazo se multiplica en 4, 6, 8 o 12 ejes. Exportable como PNG. <em>"Trazá · repetí · trascendé."</em> Puede convertirse en el fondo dinámico de tu interfaz personal.</sub>
<br/><br/>
</td>
<td align="center" width="25%">
<br/>
<b>〜 Lissajous</b>
<br/><br/>
<sub>Dos frecuencias en danza. Curvas matemáticas interactivas — frecuencia X/Y, fase y amplitud en tiempo real. La visualización de tu frecuencia interna. El punto donde la razón áurea y la música se tocan.</sub>
<br/><br/>
</td>
<td align="center" width="25%">
<br/>
<b>🌅 Morning Journey</b>
<br/><br/>
<sub>Ritual matutino en tres pasos: intención del día, gratitud, primera acción concreta. <em>"La mañana no espera. Hacé lo que podés."</em> El Oracle personaliza el texto según tu aura del momento.</sub>
<br/><br/>
</td>
<td align="center" width="25%">
<br/>
<b>👁 Meditación Ojo</b>
<br/><br/>
<sub>Visualización de tercer ojo con timer configurable, guía de respiración (4-7-8, Box Breathing, Coherencia Cardíaca 5.5 rpm). Pulsos animados con shaders. Minimalista por diseño.</sub>
<br/><br/>
</td>
</tr>
<tr>
<td align="center" width="25%">
<br/>
<b>🎵 LoFi</b>
<br/><br/>
<sub>Reproductor para estados de concentración y flujo profundo. Integrado con Aura Composer — si tu energía está alta, el Oracle sugiere tracks con mayor tempo.</sub>
<br/><br/>
</td>
<td align="center" width="25%">
<br/>
<b>🕸 Conexiones</b>
<br/><br/>
<sub>Grafo interactivo renderizado con Three.js WebGPU. Los nodos son ideas, las aristas son relaciones. <em>"Todo lo que existe está conectado. Basta con mirar."</em> Marco Aurelio + neuroplasticidad + un álbum de 1972.</sub>
<br/><br/>
</td>
<td align="center" width="25%">
<br/>
<b>🌀 Fibonacci</b>
<br/><br/>
<sub>La espiral de Fibonacci y φ=1.618 animadas. Tipografía en jerarquía de Círculos Fibonacci — los elementos más grandes en la base del pulgar, decreciendo hacia arriba. El patrón universal visible.</sub>
<br/><br/>
</td>
<td align="center" width="25%">
<br/>
<b>📝 Manifiestos</b>
<br/><br/>
<sub><em>"Escribí tu propia Biblia. Nadie más puede hacerlo."</em> Manifiestos con versionado completo. El sistema analiza lo que escribís para personalizar el copy de toda la app. Exportable como PDF editorial.</sub>
<br/><br/>
</td>
</tr>
</table>

<img src="docs/divider.svg" width="100%"/>

## Visual

<div align="center">
<img src="docs/icon-circle.svg" width="120" height="120"/>
</div>

<br/>

<table>
<tr>
<td width="40%"><img src="docs/art-crista.svg" width="100%"/></td>
<td width="60%"><img src="docs/art-warrior.svg" width="100%"/></td>
</tr>
</table>

<br/>

<table>
<tr>
<td width="33%"><img src="docs/sq-01.svg" width="100%"/></td>
<td width="33%"><img src="docs/sq-02.svg" width="100%"/></td>
<td width="33%"><img src="docs/sq-03.svg" width="100%"/></td>
</tr>
</table>

<img src="docs/divider.svg" width="100%"/>

## Ingeniería Soberana

**Vanilla-first** — sin frameworks, sin framework treadmill. HTML5 + CSS3 + Vanilla JS puro. El código es un activo estratégico que no requiere reescritura cada 18 meses.

**Zero Lag** — Singleton Three.js Renderer WebGPU r183. Un único canvas global detrás del DOM. Spring Physics para toda la navegación: `velocity += (target - current) * stiffness; velocity *= damping`. Fluidez táctil de app nativa iOS a 60 FPS estables.

**Section Isolation** — IntersectionObserver orquesta el ciclo de vida de cada módulo 3D. Cuando una sección sale del viewport: requestAnimationFrame bloqueado, GPU al 0%. Escalable a infinitas secciones sin comprometer el hilo principal.

**Additive Only** — el código no se elimina, se apila en capas de complejidad. Igual que las piedras de una apacheta real.

## API

```
POST /api/oracle          → Copy dinámico por sección (NotebookLM / fallback SECTIONS_SCHEMA)
GET  /api/aura            → Estado emocional actual del usuario
POST /api/aura            → Guardar estado emocional con timestamp
GET  /api/notes           → Lista de notas con tags semánticos
POST /api/notes           → Nueva nota
GET  /api/notes/[id]      → Nota específica
PUT  /api/notes/[id]      → Actualizar nota
GET  /api/manifiestos     → Lista de manifiestos con versiones
POST /api/manifiestos     → Nuevo manifiesto
GET  /api/manifiestos/[id]→ Manifiesto específico
GET  /api/user            → Perfil de usuario
POST /api/app-schema      → Schema completo para contexto del Oracle
```

## Stack

```
Three.js r183 WebGPU  →  Singleton renderer, canvas detrás del HTML
Vite 5.0              →  Dev server + bundler (puerto 3005)
Vercel                →  Serverless API + deploy edge
MongoDB/Mongoose      →  Notas, aura history, manifiestos
NotebookLM            →  Oracle AI — copy adaptativo (con fallback local)
Spring Physics        →  stiffness: 0.12, damping: 0.75 — navegación táctil
```

## Run local

```bash
npm install
npm run dev    # → http://localhost:3005
npm run build  # → dist/
```

```
# Variables de entorno opcionales:
NOTEBOOKLM_NOTEBOOK_ID=tu_notebook_id
MONGODB_URI=tu_connection_string
```

<br/>

<img src="docs/footer.svg" width="100%"/>
