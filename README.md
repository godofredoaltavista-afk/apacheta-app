<div align="center">
<img src="docs/banner.svg" width="100%" alt="APACHETA"/>
</div>

<br/>

<div align="center">

[![Three.js](https://img.shields.io/badge/Three.js-v0.160-black?style=flat-square&logo=threedotjs)](https://threejs.org)
[![Vite](https://img.shields.io/badge/Vite-5.0-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev)
[![Vercel](https://img.shields.io/badge/API-Vercel-black?style=flat-square&logo=vercel)](https://vercel.com)
[![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-47A248?style=flat-square&logo=mongodb&logoColor=white)](https://mongoosejs.com)
[![NotebookLM](https://img.shields.io/badge/Oracle-NotebookLM-4285F4?style=flat-square&logo=google&logoColor=white)](#)

</div>

---

## Qué es esto

**Apacheta** — en Quechua, una acumulación de piedras que los viajeros dejan en los cruces de caminos de montaña. Cada piedra es una ofrenda, una marca de paso, un registro de que alguien estuvo ahí. Eso es esta app.

Un hub de conocimiento personal construido como webapp. No un productivity tool, no un notetaker. Algo más parecido a una **biblia digital propia**: un espacio donde tu sabiduría acumulada, tu estado emocional, tus manifiestos personales y tus prácticas de mindfulness conviven en un mismo lugar, con coherencia visual y filosófica.

El **Oracle** conecta con NotebookLM para generar copy dinámico adaptado a cada sección según tu estado emocional y los tags semánticos del momento. Si no hay credenciales de NLM, el fallback local usa las reglas del `SECTIONS_SCHEMA` para generar respuestas coherentes igual.

> *"Las unidades más pequeñas de la materia no son objetos físicos en el sentido ordinario; son formas, ideas que solo pueden expresarse de manera inequívoca en el lenguaje matemático."*
> — W. Heisenberg

<img src="docs/divider.svg" width="100%"/>

## Sections

<table>
<tr>
<td align="center" width="25%">
<br/>
<b>🌌 Visualising Wisdom</b>
<br/><br/>
<sub>Una frase filosófica toma la pantalla completa con fondo sideral. El Oracle la elige según tu estado emocional del momento — no es aleatoria, es contextual. Tags: filosofía, sideral.</sub>
<br/><br/>
</td>
<td align="center" width="25%">
<br/>
<b>📚 Biblioteca</b>
<br/><br/>
<sub>Galería de tarjetas con referencias culturales, filosóficas y técnicas. Cada card tiene tags semánticos que alimentan al Oracle para sugerencias cruzadas. El conocimiento organizado como museo personal.</sub>
<br/><br/>
</td>
<td align="center" width="25%">
<br/>
<b>✨ Aura Composer</b>
<br/><br/>
<sub>Cinco sliders de estado emocional: calma, foco, creatividad, energía, intuición. El resultado se guarda con timestamp y alimenta el historial de aura. El Oracle usa este estado para personalizar todo el contenido.</sub>
<br/><br/>
</td>
<td align="center" width="25%">
<br/>
<b>🔮 Oracle</b>
<br/><br/>
<sub>El cerebro de la app. Recibe tu `feedbackBus` (estado emocional + historial), los keys de la sección activa y el intent. Consulta NotebookLM y devuelve copy en JSON por sección. Fallback local con reglas semánticas si no hay API key.</sub>
<br/><br/>
</td>
</tr>
<tr>
<td align="center" width="25%">
<br/>
<b>🌀 Mandala</b>
<br/><br/>
<sub>Canvas de dibujo generativo con simetría axial configurable. Cada trazo se replica en todos los ejes. El resultado es exportable como PNG. Arte personal, ritual de concentración.</sub>
<br/><br/>
</td>
<td align="center" width="25%">
<br/>
<b>〜 Lissajous</b>
<br/><br/>
<sub>Curvas de Lissajous interactivas — frecuencia, fase y amplitud en tiempo real. Matemática hecha visible. El punto donde la razón áurea y la música se tocan.</sub>
<br/><br/>
</td>
<td align="center" width="25%">
<br/>
<b>🌅 Morning Journey</b>
<br/><br/>
<sub>Ritual matutino guiado en tres pasos: intención del día, práctica de gratitud, primera acción concreta. Simple, repetible, efectivo. El Oracle puede personalizar el texto del ritual según tu aura.</sub>
<br/><br/>
</td>
<td align="center" width="25%">
<br/>
<b>👁 Meditación Ojo</b>
<br/><br/>
<sub>Visualización de tercer ojo con timer configurable, contador de respiraciones y guía sonora opcional. Minimalista por diseño — el foco es la práctica, no la interfaz.</sub>
<br/><br/>
</td>
</tr>
<tr>
<td align="center" width="25%">
<br/>
<b>🎵 LoFi</b>
<br/><br/>
<sub>Reproductor de música lofi para estados de concentración y flujo profundo. Se integra con el Aura Composer — si tu energía está alta, sugiere tracks más activos.</sub>
<br/><br/>
</td>
<td align="center" width="25%">
<br/>
<b>🕸 Conexiones</b>
<br/><br/>
<sub>Grafo interactivo de conceptos y referencias culturales renderizado con Three.js. Los nodos son ideas, las aristas son relaciones. Tu mapa mental externalizado y navegable.</sub>
<br/><br/>
</td>
<td align="center" width="25%">
<br/>
<b>🌀 Fibonacci</b>
<br/><br/>
<sub>La espiral de Fibonacci y la razón áurea φ=1.618... animadas e interactivas. El patrón universal que aparece en las galaxias, los caracoles y la disposición de las semillas de girasol.</sub>
<br/><br/>
</td>
<td align="center" width="25%">
<br/>
<b>📝 Manifiestos</b>
<br/><br/>
<sub>Manifiestos personales con versionado. Tu verdad escrita, revisada y actualizada. Cada versión queda en la base de datos — podés ver cómo evolucionó tu pensamiento con el tiempo.</sub>
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

## API

```
POST /api/oracle          → Copy dinámico por sección (NotebookLM / fallback local)
GET  /api/aura            → Estado emocional actual del usuario
POST /api/aura            → Guardar nuevo estado emocional con timestamp
GET  /api/notes           → Lista de notas con tags semánticos
POST /api/notes           → Nueva nota
GET  /api/notes/[id]      → Nota específica
PUT  /api/notes/[id]      → Actualizar nota
GET  /api/manifiestos     → Lista de manifiestos con versiones
POST /api/manifiestos     → Nuevo manifiesto
GET  /api/manifiestos/[id]→ Manifiesto específico
GET  /api/user            → Perfil de usuario
POST /api/app-schema      → Schema completo de la app para el Oracle
```

## Stack

```
Three.js v0.160     →  Visualizaciones 3D (Conexiones, Lissajous, Fibonacci)
Vite 5.0            →  Dev server + bundler
Vercel              →  Serverless API + deploy edge functions
MongoDB/Mongoose    →  Base de datos — notas, aura history, manifiestos
NotebookLM          →  Oracle AI — copy adaptativo (opcional, con fallback)
```

## Arquitectura

```
apacheta/
├── index.html                # Shell de la app
├── src/                      # Frontend Vite — UI, Three.js, canvas
├── api/
│   ├── _lib/
│   │   ├── auth.js           # Auth middleware — userId header
│   │   ├── db.js             # Conexión MongoDB singleton
│   │   └── models.js         # Mongoose: User, Nota, Manifiesto
│   ├── oracle.js             # Oracle — NotebookLM + SECTIONS_SCHEMA fallback
│   ├── aura.js               # Estado emocional — GET/POST con historial
│   ├── notes.js              # Notas con tags semánticos
│   ├── notes/[id].js         # CRUD individual de notas
│   ├── manifiestos.js        # Manifiestos versionados
│   ├── manifiestos/[id].js   # CRUD individual de manifiestos
│   ├── user.js               # Perfil de usuario
│   └── app-schema.js         # Schema completo → contexto para Oracle
└── public/
    ├── glb/                  # Modelos 3D (grafo de conexiones)
    └── banners/              # Assets visuales de la app
```

## Run local

```bash
npm install
npm run dev    # → http://localhost:3005
npm run build  # → dist/
```

Variables de entorno opcionales:
```
NOTEBOOKLM_NOTEBOOK_ID=tu_notebook_id   # Oracle con NotebookLM
MONGODB_URI=tu_connection_string        # Base de datos
```

<br/>

<img src="docs/footer.svg" width="100%"/>
