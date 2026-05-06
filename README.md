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

**Apacheta** es tu biblia digital personal. Un hub de conocimiento, bienestar y filosofía como webapp — con secciones que van desde visualización de sabiduría hasta composición de aura emocional, mandalas generativos, curvas de Lissajous y rituales matutinos. Backend serverless con API Oracle que conecta a NotebookLM para copy dinámico.

> *"Las unidades más pequeñas de la materia no son objetos físicos en el sentido ordinario; son formas, ideas que solo pueden expresarse de manera inequívoca en el lenguaje matemático."*
> — W. Heisenberg

---

## Sections

<table>
<tr>
<td align="center" width="25%">
<br/>
<b>🌌 Visualising Wisdom</b>
<br/><br/>
<sub>Frases filosóficas full-screen con fondo sideral. Copy dinámico via Oracle.</sub>
<br/><br/>
</td>
<td align="center" width="25%">
<br/>
<b>📚 Biblioteca</b>
<br/><br/>
<sub>Cards de referencias culturales, filosóficas y técnicas con tags semánticos.</sub>
<br/><br/>
</td>
<td align="center" width="25%">
<br/>
<b>✨ Aura Composer</b>
<br/><br/>
<sub>5 sliders de estado: calma, foco, creatividad, energía, intuición. Con historial.</sub>
<br/><br/>
</td>
<td align="center" width="25%">
<br/>
<b>🔮 Oracle</b>
<br/><br/>
<sub>NotebookLM API — copy dinámico adaptado por sección, estado y tags.</sub>
<br/><br/>
</td>
</tr>
<tr>
<td align="center" width="25%">
<br/>
<b>🌀 Mandala</b>
<br/><br/>
<sub>Canvas generativo con simetría axial. Arte personal exportable.</sub>
<br/><br/>
</td>
<td align="center" width="25%">
<br/>
<b>〜 Lissajous</b>
<br/><br/>
<sub>Curvas matemáticas interactivas. Frecuencia, fase, amplitud en tiempo real.</sub>
<br/><br/>
</td>
<td align="center" width="25%">
<br/>
<b>🌅 Morning Journey</b>
<br/><br/>
<sub>Ritual matutino guiado: intención del día, gratitud, primera acción.</sub>
<br/><br/>
</td>
<td align="center" width="25%">
<br/>
<b>👁 Meditación Ojo</b>
<br/><br/>
<sub>Visualización de tercer ojo con timer configurable y guía de respiración.</sub>
<br/><br/>
</td>
</tr>
<tr>
<td align="center" width="25%">
<br/>
<b>🎵 LoFi</b>
<br/><br/>
<sub>Reproductor de música lofi para concentración y estados de flujo.</sub>
<br/><br/>
</td>
<td align="center" width="25%">
<br/>
<b>🕸 Conexiones</b>
<br/><br/>
<sub>Grafo interactivo de conceptos y referencias culturales. Three.js.</sub>
<br/><br/>
</td>
<td align="center" width="25%">
<br/>
<b>🌀 Fibonacci</b>
<br/><br/>
<sub>Espiral de Fibonacci y razón áurea animada. Matemática + estética.</sub>
<br/><br/>
</td>
<td align="center" width="25%">
<br/>
<b>📝 Manifiestos</b>
<br/><br/>
<sub>Manifiestos personales con versiones. Tu verdad escrita y versionada.</sub>
<br/><br/>
</td>
</tr>
</table>

---

## API

```
POST /api/oracle          → Copy dinámico por sección (NotebookLM / fallback local)
GET  /api/aura            → Estado emocional actual del usuario
POST /api/aura            → Guardar nuevo estado emocional
GET  /api/notes           → Lista de notas con tags
POST /api/notes           → Nueva nota
GET  /api/notes/[id]      → Nota específica
PUT  /api/notes/[id]      → Actualizar nota
GET  /api/manifiestos     → Lista de manifiestos
POST /api/manifiestos     → Nuevo manifiesto
GET  /api/manifiestos/[id]→ Manifiesto específico
GET  /api/user            → Perfil de usuario
POST /api/app-schema      → Schema completo de la app
```

---

## Stack

```
Three.js v0.160     →  Visualizaciones 3D (Conexiones, Lissajous, Fibonacci)
Vite 5.0            →  Dev server + bundler
Vercel              →  Serverless API + deploy edge
MongoDB/Mongoose    →  Base de datos — notas, aura, manifiestos
NotebookLM          →  Oracle AI — copy adaptativo (opcional)
```

---

## Arquitectura

```
apacheta/
├── index.html                # Shell de la app
├── src/                      # Frontend Vite
├── api/
│   ├── _lib/
│   │   ├── auth.js           # Auth middleware
│   │   ├── db.js             # Conexión MongoDB
│   │   └── models.js         # User, Nota, Manifiesto
│   ├── oracle.js             # Oracle — NotebookLM + fallback local
│   ├── aura.js               # Estado emocional
│   ├── notes.js              # Notas personales
│   ├── notes/[id].js         # CRUD nota
│   ├── manifiestos.js        # Manifiestos
│   ├── manifiestos/[id].js   # CRUD manifiesto
│   ├── user.js               # Perfil
│   └── app-schema.js         # Schema completo
└── public/
    ├── glb/                  # Modelos 3D (manos en montaña, mate)
    └── banners/              # Assets visuales
```

---

## Run local

```bash
npm install
npm run dev    # → http://localhost:3005
npm run build  # → dist/
```

Para el Oracle con NotebookLM, configurar en `.env`:
```
NOTEBOOKLM_NOTEBOOK_ID=tu_notebook_id
```

---

<div align="center">
<sub>Built in Córdoba, Argentina · <b>South Hustles Studio</b></sub>
</div>
