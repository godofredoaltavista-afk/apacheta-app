/* =============================================
   APACHETA — /api/app-schema
   GET: devuelve la arquitectura completa de la app en JSON.
   Sin auth requerida — es documentación pública de la app.
   Usada por NotebookLM, agentes externos y el frontend.
   ============================================= */

const APP_SCHEMA = {
  meta: {
    name:        'Apacheta',
    version:     '2.1',
    description: 'OS espiritual personal — dashboard que cambia con la hora del día',
    stack: {
      frontend: 'Vite 5 SPA · Three.js · CSS puro · ES Modules',
      backend:  'Vercel API Routes · Node.js serverless',
      database: 'MongoDB Atlas (apacheta_prod)',
      devServer: 'http://localhost:3005',
    },
    entryPoint: 'src/main.js',
    buildOutput: 'dist/',
  },

  userModel: {
    description: 'Perfil del usuario — persiste en MongoDB (fase prod) y localStorage (fase offline)',
    fields: {
      userId:             { type: 'string', description: 'Device fingerprint UUID, header X-Apacheta-User-Id' },
      nombre:             { type: 'string' },
      signo:              { type: 'string', example: 'Aries' },
      nacimiento:         { type: 'string', format: 'YYYY-MM-DD' },
      colores:            { type: 'array', items: 'hex string', length: 3, description: 'Colores personales, controlan nebulosa Three.js + CSS vars' },
      alucinajeActivo:    { type: 'boolean', description: 'Activa modo visual alterno + nebulosa Three.js' },
      onboardingCompleto: { type: 'boolean' },
    },
  },

  dataModels: {
    nota: {
      description: 'Nota rápida del usuario (anotacion-rapida + manifiesto-gestor)',
      fields: {
        id:        { type: 'string', description: 'Date.now().toString(36), generado en cliente' },
        userId:    { type: 'string' },
        titulo:    { type: 'string' },
        texto:     { type: 'string' },
        color:     { type: 'string', format: 'hex', description: 'Color visual de la tarjeta' },
        tags:      { type: 'array', items: 'string', example: ['filosofia', 'emocional'] },
        categoria: { type: 'string', description: 'Carpeta en manifiesto-gestor' },
        ts:        { type: 'number', description: 'Unix timestamp del cliente' },
      },
    },
    manifiesto: {
      description: 'Manifiesto personal — texto largo con carpeta y tags',
      fields: {
        id:     { type: 'string' },
        userId: { type: 'string' },
        titulo: { type: 'string' },
        texto:  { type: 'string', description: 'Contenido principal, editado inline en contenteditable' },
        tag:    { type: 'string', description: 'Carpeta principal (filosofia, vision, tech, emocional, lenguaje, sideral, musical)' },
        tags:   { type: 'array', items: 'string' },
        ts:     { type: 'number' },
      },
    },
    auraHistory: {
      description: 'Snapshot diario del estado emocional del usuario',
      fields: {
        userId:      { type: 'string' },
        fecha:       { type: 'string', format: 'YYYY-MM-DD', description: 'Unique per userId — un snapshot por día' },
        calma:       { type: 'number', min: 0, max: 100 },
        foco:        { type: 'number', min: 0, max: 100 },
        creatividad: { type: 'number', min: 0, max: 100 },
        energia:     { type: 'number', min: 0, max: 100 },
        intuicion:   { type: 'number', min: 0, max: 100 },
        colores:     { type: 'array', items: 'hex string', length: 3 },
        savedAt:     { type: 'number' },
      },
    },
  },

  sections: [
    {
      id: 'onboarding',
      file: 'src/sections/onboarding.js',
      description: 'Formulario de primera visita: nombre, signo, nacimiento, 3 colores',
      persistsData: true,
      dataWritten: ['nombre', 'signo', 'nacimiento', 'colores', 'onboardingCompleto'],
      triggersRevealApp: true,
    },
    {
      id: 'hero-morning',
      file: 'src/main.js (inline)',
      description: 'Landing: saludo dinámico por hora, reloj, frase del día, nav con spring physics',
      persistsData: false,
      reactive: ['modoActual', 'nombre', 'alucinajeActivo'],
    },
    {
      id: 'dashboard',
      file: 'src/sections/dashboard-dia.js',
      description: 'Daily stats: modo badge, frase del día, challenge semanal, streak',
      persistsData: true,
      dataWritten: ['streak', 'ultimaNota'],
      dataRead: ['nombre', 'modoActual', 'notasList'],
    },
    {
      id: 'fab-anotacion',
      file: 'src/sections/anotacion-rapida.js',
      description: 'FAB + modal: crear notas con título, color, tags auto-sugeridos. Stack flotante de últimas 5.',
      persistsData: true,
      api: {
        create: 'POST /api/notes',
        update: 'PATCH /api/notes/:id',
        delete: 'DELETE /api/notes/:id',
      },
      dataWritten: ['notasList', 'notas', 'ultimasAnotaciones'],
      emits: ['note-written (feedbackBus)', 'manifiesto:openEditor (CustomEvent)'],
    },
    {
      id: 'manifiesto-gestor',
      file: 'src/sections/manifiesto-gestor.js',
      description: '3 columnas Apple Notes dark: Carpetas / Lista / Visor+Editor contenteditable. 8 carpetas con paletas propias.',
      persistsData: true,
      api: {
        getAll: 'GET /api/manifiestos',
        create: 'POST /api/manifiestos',
        update: 'PATCH /api/manifiestos/:id',
        delete: 'DELETE /api/manifiestos/:id',
      },
      dataWritten: ['notas'],
      dataRead: ['notas'],
      carpetas: ['todas', 'filosofia', 'vision', 'tech', 'emocional', 'lenguaje', 'sideral', 'musical'],
    },
    {
      id: 'aura-composer',
      file: 'src/sections/aura-composer.js',
      description: '5 sliders: calma, foco, creatividad, energía, intuición. Guarda snapshot diario.',
      persistsData: true,
      api: {
        save: 'POST /api/aura',
        history: 'GET /api/aura',
      },
      dataWritten: ['aura', 'auraHistory'],
      emits: ['aura-saved (feedbackBus)'],
    },
    {
      id: 'aura-history',
      file: 'src/sections/aura-history.js',
      description: 'Timeline de los últimos 7 días de aura. Gráfico por dimensión.',
      persistsData: false,
      dataRead: ['auraHistory (GET /api/aura)'],
    },
    {
      id: 'mandala',
      file: 'src/sections/mandala.js',
      description: 'Canvas de dibujo simétrico (2x/4x/6x/8x). Guarda como dataURL.',
      persistsData: true,
      dataWritten: ['mandalas[]'],
      emits: ['mandala-saved (feedbackBus)'],
    },
    {
      id: 'biblioteca',
      file: 'src/sections/biblioteca.js',
      description: 'Galería 3D flip de referencias culturales con filtros de categoría.',
      persistsData: false,
    },
    {
      id: 'respiracion',
      file: 'src/sections/respiracion.js',
      description: 'Guía de respiración + nebulosa Three.js activa por IntersectionObserver.',
      persistsData: false,
      threejs: true,
    },
    {
      id: 'chakras',
      file: 'src/sections/chakras.js',
      description: '7 puntos chakra interactivos (Muladhara → Sahasrara).',
      persistsData: false,
      emits: ['chakra-tapped (feedbackBus)'],
    },
    {
      id: 'visualising-wisdom',
      file: 'src/sections/visualising-wisdom.js',
      description: 'Frase filosófica grande con blur Canvas 2D. Copy editable por Oracle.',
      persistsData: true,
      dataWritten: ['copyOverrides'],
      copyKeys: ['wisdom.top', 'wisdom.bottom'],
    },
    {
      id: 'modo-alucinaje',
      file: 'src/sections/modos-dia.js',
      description: 'Toggle ON/OFF alucinaje: cambia paleta global + activa nebulosa Three.js.',
      persistsData: true,
      dataWritten: ['alucinajeActivo'],
      api: { update: 'PATCH /api/user' },
    },
    {
      id: 'morning-journey',
      file: 'src/sections/morning-journey.js',
      description: 'Ritual matutino guiado: intención / gratitud / acción.',
      persistsData: false,
    },
    {
      id: 'meditacion-ojo',
      file: 'src/sections/meditacion-ojo.js',
      description: 'Meditación de tercer ojo con punto focal y timer.',
      persistsData: false,
    },
    {
      id: 'soplar',
      file: 'src/sections/soplar.js',
      description: 'Práctica de Om / MIDI con visualización de sonido.',
      persistsData: false,
      emits: ['midi-play (feedbackBus)'],
    },
    {
      id: 'lissajous',
      file: 'src/sections/lissajous.js',
      description: 'Curvas de Lissajous interactivas: frecuencia A/B, fase.',
      persistsData: false,
    },
    {
      id: 'fibonacci',
      file: 'src/sections/fibonacci.js',
      description: 'Espiral de Fibonacci animada, razón áurea.',
      persistsData: false,
    },
    {
      id: 'lofi',
      file: 'src/sections/lofi.js',
      description: 'Reproductor lofi (play/pause, volumen, siguiente).',
      persistsData: false,
    },
    {
      id: 'alarma',
      file: 'src/sections/alarma-clock.js',
      description: 'Timer configurable con notificación visual y sonido.',
      persistsData: false,
    },
    {
      id: 'conexiones',
      file: 'src/sections/conexiones-culturales.js',
      description: 'Grafo de conexiones entre conceptos culturales.',
      persistsData: false,
    },
    {
      id: 'scratch-reveal',
      file: 'src/sections/scratch-reveal.js',
      description: 'Tarjeta raspadita Canvas 2D que revela mensaje filosófico.',
      persistsData: false,
      emits: ['scratch-revealed (feedbackBus)'],
    },
    {
      id: 'glb-mate',
      file: 'src/sections/glb-mate.js',
      description: 'Modelo 3D de mate (.glb) con Three.js, GLTFLoader, orbit controls.',
      persistsData: false,
      threejs: true,
    },
    {
      id: 'calendar-section',
      file: 'src/sections/calendar-preview.js',
      description: 'Calendario mensual con puntos de actividad.',
      persistsData: false,
    },
    {
      id: 'mente',
      file: 'src/sections/mente.js',
      description: 'Sección de pensamientos con animación de partículas.',
      persistsData: false,
    },
    {
      id: 'manifiestos',
      file: 'src/sections/manifiestos-particles.js',
      description: 'Animación de partículas sobre texto de manifiestos. Lee notas del usuario.',
      persistsData: false,
      dataRead: ['notas'],
    },
    {
      id: 'ajetreo-sur',
      file: 'src/sections/ajetreo-sur.js',
      description: 'Visualizador de caos/movimiento, Canvas animado.',
      persistsData: false,
    },
    {
      id: 'mandala-archive',
      file: 'src/sections/mandala-archive.js',
      description: 'Galería de mandalas guardados con botón de descarga.',
      persistsData: false,
      dataRead: ['mandalas[]'],
    },
    {
      id: 'ventana2-historial',
      file: 'src/sections/ventana2-historial.js',
      description: 'Timeline del feedbackBus — historial de interacciones del usuario.',
      persistsData: false,
      dataRead: ['feedbackBus'],
    },
  ],

  huds: [
    {
      id: 'color-hud',
      file: 'src/sections/color-hud.js',
      position: 'left sidebar',
      zIndex: 250,
      description: '3 dots arrastrables sobre track vertical. Cambian colores personales en tiempo real.',
      emits: ['apacheta:colorsChanged'],
      api: { update: 'PATCH /api/user (colores)' },
    },
    {
      id: 'telemetry-hud',
      file: 'src/sections/telemetry-hud.js',
      position: 'top right',
      description: 'Display: SYS, MODO, HORA, ALT (giroscopio), SEC (sección actual), NOTAS (count).',
      listens: ['todos los CustomEvents de estado'],
    },
    {
      id: 'nav-drawer',
      file: 'src/core/nav-drawer.js',
      position: 'top right floating',
      description: 'Botón circular con pulso de color cíclico. Drawer con 8 grupos y 2-col grid.',
    },
    {
      id: 'tweaks-panel',
      file: 'src/core/tweaks-panel.js',
      position: 'bottom right',
      description: 'Panel live: colores, fuentes (Playfair/Instrument/Mono), tamaño, layout, tema (nature/dark/hallucination).',
    },
  ],

  coreModules: [
    { file: 'src/core/feedback-bus.js',   type: 'logic',    description: 'Acumulador de eventos del usuario. Max 500 entradas. Alimenta Oracle.' },
    { file: 'src/core/copy-oracle.js',    type: 'logic',    description: 'Lee feedbackBus → consulta NotebookLM → aplica variantes de copy al DOM.' },
    { file: 'src/core/spring.js',         type: 'ui',       description: 'springTo() con stiffness/damping + lerp().' },
    { file: 'src/core/icons.js',          type: 'ui',       description: '87 SVG icons + hydrateIcons() reemplaza [data-icon].' },
    { file: 'src/core/nav-drawer.js',     type: 'ui',       description: 'Drawer de navegación flotante.' },
    { file: 'src/core/draggable.js',      type: 'ui',       description: 'makeDraggable(el) para ventanas flotantes.' },
    { file: 'src/core/section-tint.js',   type: 'ui',       description: 'Tinting de fondo por categoría de sección.' },
    { file: 'src/core/trail-spawn.js',    type: 'ui',       description: 'Partículas que siguen el mouse.' },
    { file: 'src/core/tweaks-panel.js',   type: 'ui',       description: 'Panel de personalización live.' },
    { file: 'src/core/nota-reader.js',    type: 'logic',    description: 'openNoteReader(nota) — modal de lectura.' },
    { file: 'src/core/config-presets.js', type: 'logic',    description: 'Presets de color/tema desde URL params.' },
  ],

  apiEndpoints: [
    { method: 'GET',    path: '/api/user',              auth: true,  description: 'Obtener perfil del usuario' },
    { method: 'POST',   path: '/api/user',              auth: true,  description: 'Crear usuario (onboarding completo)' },
    { method: 'PATCH',  path: '/api/user',              auth: true,  description: 'Actualizar campos del perfil' },
    { method: 'GET',    path: '/api/notes',             auth: true,  description: 'Todas las notas del usuario, ordenadas por ts desc' },
    { method: 'POST',   path: '/api/notes',             auth: true,  description: 'Crear nota (upsert por id)' },
    { method: 'PATCH',  path: '/api/notes/:id',         auth: true,  description: 'Actualizar nota por id' },
    { method: 'DELETE', path: '/api/notes/:id',         auth: true,  description: 'Eliminar nota por id' },
    { method: 'GET',    path: '/api/manifiestos',       auth: true,  description: 'Todos los manifiestos del usuario' },
    { method: 'POST',   path: '/api/manifiestos',       auth: true,  description: 'Crear manifiesto' },
    { method: 'PATCH',  path: '/api/manifiestos/:id',   auth: true,  description: 'Actualizar manifiesto (auto-save on blur)' },
    { method: 'DELETE', path: '/api/manifiestos/:id',   auth: true,  description: 'Eliminar manifiesto' },
    { method: 'GET',    path: '/api/aura',              auth: true,  description: 'Historial de aura (últimos 30 días)' },
    { method: 'POST',   path: '/api/aura',              auth: true,  description: 'Guardar aura del día (upsert por fecha)' },
    { method: 'POST',   path: '/api/oracle',            auth: true,  description: 'Consultar Oracle: feedbackBus → NotebookLM/local → JSON de copys por sección' },
    { method: 'GET',    path: '/api/app-schema',        auth: false, description: 'Arquitectura completa de la app en JSON' },
  ],

  auth: {
    phase: 1,
    mechanism: 'Device fingerprint UUID',
    header: 'X-Apacheta-User-Id',
    storage: 'localStorage key: apacheta_uid',
    description: 'Sin OAuth. El userId es un UUID generado en el primer boot y persistido en localStorage. Enviado en todas las requests.',
    nextPhase: 'Google OAuth via Clerk o Next-Auth — el campo userId en MongoDB ya existe, solo agregar email.',
  },

  events: [
    { name: 'apacheta:colorsChanged',       emitter: 'color-hud.js',         listener: 'main.js (nebulosa), secciones' },
    { name: 'apacheta:feedback',            emitter: 'feedback-bus.js',       listener: 'feedback-bus-panel.js' },
    { name: 'apacheta:oracle:regenerate-all', emitter: 'feedback-bus-panel.js', listener: 'copy-oracle.js' },
    { name: 'apacheta:copy:regenerated',    emitter: 'copy-oracle.js',        listener: 'oracle-modal.js, secciones' },
    { name: 'manifiesto:openEditor',        emitter: 'anotacion-rapida.js',   listener: 'manifiesto-gestor.js' },
    { name: 'nota-edit-request',            emitter: 'nota-reader.js',        listener: 'anotacion-rapida.js' },
    { name: 'nota-delete-request',          emitter: 'nota-reader.js',        listener: 'anotacion-rapida.js' },
  ],

  feedbackBusEventTypes: [
    'like', 'dislike', 'aura-saved', 'mandala-saved', 'note-written',
    'slice', 'midi-play', 'streak-day', 'section-view-long',
    'scratch-revealed', 'chakra-tapped', 'frase-saved',
    'color-changed', 'mode-changed', 'preset-applied', 'copy-regenerated',
  ],

  designTokens: {
    fonts: ['Playfair Display (display)', 'Inter (body)', 'Share Tech Mono (mono)'],
    colorPersonal: ['--color-personal-1', '--color-personal-2', '--color-personal-3'],
    modos: ['manana (6:00-11:59)', 'tarde (12:00-19:59)', 'noche (20:00-5:59)', 'alucinaje (toggle)'],
    temas: ['nature (default)', 'dark', 'hallucination'],
    layouts: ['editorial', 'compact', 'outline'],
  },

  generatedAt: new Date().toISOString(),
};

export default function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Solo GET' });
  }

  res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate');
  return res.status(200).json(APP_SCHEMA);
}
