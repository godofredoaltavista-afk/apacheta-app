# APACHETA — MANIFIESTO V1
## Hub de Conocimiento Personal · Mindfulness Tech · Biblia Propia

> *"Desarrolladores argentinos con hambre, 27 años, que confían en la naturaleza y viven en Córdoba."*
> *"Ajetreos del Sur — cada tomada de nota tiene siempre un gráfico conceptual que la explica rápido."*

---

## 1. QUÉ ES APACHETA

Una aplicación de autocuidado y conocimiento personal, mobile-first, white mode, que actúa como **supermanifiesto vivo**. No es una app de notas. No es un diario. Es una **biblia propia** que crece con cada cosa que enviás: mensajes de WhatsApp, PDFs, tweets, repos de GitHub, links, audiolibros, resúmenes.

El sistema aprende tu lenguaje. Entiende tus aristas. Te devuelve conocimiento en el momento justo, en el formato visual correcto, con el tono exacto.

**Nombres candidatos:** Apacheta / Mantra Guru / Visualicy Wisdom / Ajetreo Sur

---

## 2. CONCEPTO CENTRAL

### La Biblia Propia
- Todo lo que leés, escuchás, ves y pensás va entrando al sistema
- El sistema lo organiza en manifiestos temáticos (chakras, física, música, filosofía, neuroplasticidad, etc.)
- Cada día te devuelve una composición visual distinta: frases, datos, conexiones entre autores
- Las conexiones son inesperadas y profundas: Marco Aurelio + neuroplasticidad + un álbum de 1972

### El Aura del Día
- Al entrar, el sistema sabe cómo te sentís según tus últimas 3 anotaciones
- Te da una frase personalizada, no genérica
- Modo mañana: claro, motivador, concreto
- Modo noche (20hs): emocional, expansivo, más experimental
- Modo alucinaje: activa assets que se mueven, frases no probadas, conexiones sidérales

### Personalización Inicial
- Primera vez: ventana friendly → "Buen día, ¿cómo te llamás?"
- Ingresás: nombre, signo zodiacal, fecha de nacimiento
- Elegís 3 colores que te representan (shader de colores, interfaz tipo Google Material pero más suave)
- Eso define tu paleta personal de la app

---

## 3. STACK TÉCNICO

**Mismo stack que South Hustles pero con visual completamente distinto:**

```
Three.js (r183 WebGPU o r128 según sección)
HTML/CSS modular
Shaders GLSL (fondos suaves, hover effects, nebulosas)
SVG animados (íconos, respiración, chacras)
Web Audio API (respiración, pulsos, vibraciones)
LocalStorage → luego Firebase/Supabase (Pulpo)
Bot de ingesta (WhatsApp, Twitter, GitHub, PDF)
```

**Frontend:** Franco — diseño, arquitectura, secciones, shaders, assets
**Backend:** Pulpo — ingesta de datos, clasificación, API propia, modelo de lenguaje propio

---

## 4. ESTÉTICA VISUAL

### Referencia base
- **Antigravity** (blanco, limpio, espiritual)
- **Gaia** (warmth, editorial, contenido profundo)
- **Spotify** (pero todos los álbumes son obras de arte)
- Apps de yoga/mindfulness iOS: sombras suaves, ventanas que abren, botones que se presionan

### Paleta por secciones (cada sección tiene su propio mundo de color)
- Sección filosofía: fondo verde inglés + texto amarillo marcador + negro
- Sección tech: azul oscuro + blanco + detalles eléctricos
- Sección emocional: fondo gris + texto negro + detalles blancos
- Sección alucinaje: rosa + celeste + títulos moviéndose
- Sección mindfulness: cream #F5F0E8 + tipografía serif grande
- Modo nebulosa: degradado cian pastel → rosa pastel, burbujas, shaders suaves

### Tipografía (distinta a South Hustles)
- Display: serif grande, mucho interlineado (tipo editorial meditativo)
- Body: sans-serif limpia (SF Pro / Inter)
- Datos/HUD: monospace (Share Tech Mono puede quedarse)
- Jerarquía: círculos Fibonacci, más grandes abajo, chicos arriba, texto centrado con espacio

### Geometría
- Círculos dominantes (chacras, mantras, respiración)
- Fibonacci en layouts
- Bordes redondeados, nada sharp
- Assets que giran (como splat al reverso = anotaciones del artista)
- Cuando girás una obra de arte: el dorso tiene notas manuscritas → links → conexiones

---

## 5. SECCIONES DE LA APP (MVP)

### 5.1 Onboarding
- Pantalla blanca, micro-carga de asset
- "Buen día, ¿cómo te llamás?"
- Input nombre + signo + fecha
- Selector de 3 colores personales (shader interactivo)

### 5.2 Dashboard del Día
- Frase personalizada según últimas 3 anotaciones
- Ícono del día (chakra, elemento, tema)
- Dato sideral relacionado
- Challenge del día (ej: "Día de la física cuántica" → 1 pregunta → 1 dato → 1 acción)

### 5.3 Biblioteca / Galería
- Álbumes = obras de arte giratorias
- Cada obra: un mantra / autor / tema
- Al girar: notas del artista + links + conexiones
- Filtros: filosofía / música / neurociencia / yoga / tech / experimental

### 5.4 Manifiestos
- Documentos largos que el sistema va construyendo
- Input: links, PDFs, mensajes, repos GitHub
- Output: texto editorial con gráfico conceptual
- Exportable como PDF propio

### 5.5 Anotación Rápida
- Post-it minimizable
- Texto libre → el sistema lo clasifica y lo integra al manifiesto
- Convertible a HTML/PDF propio

### 5.6 Modos del Día
- 🌅 Mañana: motivador, concreto, físico
- 🌆 Tarde: creativo, conexiones entre ideas
- 🌙 Noche (20hs): emocional, expansivo, citas profundas
- 🍄 Alucinaje: modo experimental, assets animados, frases no probadas

### 5.7 Respiración
- 3 tipos de respiración visualizados
- Pulsos animados (SVG/shader)
- Vibración del celular sincronizada
- Slide suave, como un pincel

### 5.8 Chakras / Chacras
- 7 íconos animados
- Cada chakra = una categoría de conocimiento
- Color, sonido, frase, práctica

### 5.9 Recomendaciones del Sistema
- Top 10 repos para el día (modo tech)
- Álbum + letra + 2 pensadores conectados (modo música)
- Clase de yoga del día (integración con profe/gimnasio)
- Notificaciones periódicas mientras usás la página

### 5.10 Conexiones Culturales
- Elegís 3 culturas (ej: azteca, oriental, griega)
- El sistema explica un concepto desde esas 3 perspectivas
- Por qué el naranja fue el primer pigmento humano
- Por qué el azul no existía como palabra antes del siglo XII

---

## 6. ROADMAP

### Etapa 1 — Frontend (Franco solo)
- Arquitectura base en nueva carpeta
- White mode con todas las secciones visualizadas estáticamente
- Shaders de fondo, SVG animados, tipografía editorial
- Mobile-first, 16:9 vertical

### Etapa 2 — Integración (Franco + Pulpo)
- Bot de ingesta (WhatsApp bot → clasificador → manifiesto)
- API propia para frases, datos, conexiones
- LocalStorage → Firebase

### Etapa 3 — Modelo propio
- Entrenamiento sobre el lenguaje propio
- Respuestas personalizadas basadas en historial
- Modo alucinaje calibrado

### Etapa 4 — iOS
- Diseño en Figma/Adobe XD
- Arquitectura nativa o React Native
- Vibración, notificaciones, widget

### Etapa 5 — Open Source
- Share en Twitter
- Cada persona puede reenviar sus mensajes al bot
- Comunidad de manifiestos compartidos

---

## 7. NOMBRE Y VOZ

**Voz de la app:**
- No es un asistente. Es un espejo.
- Habla en segunda persona, concreto, sin florituras
- A veces poético, a veces técnico, siempre honesto
- Nunca: "experiencia inmersiva", "IA revolucionaria"
- Sí: "hoy leíste a Maquiavelo y sacaste esto", "tu aura hoy tiene que ver con el movimiento"

**Tagline candidato:**
> *"Tu biblia. Tu lenguaje. Tu frecuencia."*
> *"Conocimiento que se organiza solo."*
> *"Ajetreos del Sur — visualizando la sabiduría."*
