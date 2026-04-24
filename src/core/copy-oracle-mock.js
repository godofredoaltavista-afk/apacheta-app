/* =============================================
   APACHETA — COPY ORACLE MOCK
   Variantes curadas por tags y por mood del bus.
   Se usa cuando NotebookLM MCP no está disponible.
   ============================================= */

const VARIANT_POOLS = {
  'wisdom.top': [
    'I AM<br/>NOTHING',
    'SOY<br/>TIERRA',
    'APENAS<br/>UN MOLDE',
    'SIN<br/>BORDES',
    'POLVO<br/>DEL SUR',
  ],
  'wisdom.bottom': [
    'I AM<br/>EVERYTHING',
    'SOY<br/>CAUCE',
    'SOY<br/>UNIVERSO',
    'TODO<br/>A LA VEZ',
    'SOY<br/>MONTAÑA',
  ],
  'biblioteca.title': [
    'Biblioteca', 'Archivo vivo', 'Repertorio', 'Bóveda', 'Corpus', 'Archivador',
  ],
  'scratch.title': [
    'Descubrí', 'Rascá', 'Revelá', 'Asomate', 'Entrá', 'Mirá debajo',
  ],
  'aura.kicker': ['tu', 'la', 'esta', 'mi'],
  'aura.title':  ['aura', 'frecuencia', 'vibra', 'campo', 'halo'],
  'mandala.title': [
    'el mandala', 'el centro', 'la rueda', 'el patrón', 'el espejo simétrico',
  ],
  'lissajous.title': [
    'lissajous.', 'dos ondas.', 'cruce de frecuencias.', 'danza de senos.',
  ],
  'fibonacci.title': [
    'fibonacci.', 'espiral.', 'la sucesión.', 'phi.', 'la curva oro.',
  ],
  'aura-history.title': [
    'historial<br/>de aura.', 'memoria<br/>vibracional.', 'diario<br/>de frecuencia.',
  ],
  'alarma.title': [
    'despertar.', 'levantate.', 'arranca.', 'sol afuera.', 'campana.',
  ],
  'chakras.muladhara.desc': [
    'La raíz. El arraigo. El cuerpo sobre la tierra, el alimento, el refugio, la pertenencia al lugar donde estás.',
    'El suelo debajo de tus pies. Lo que te sostiene antes de que pienses en sostenerte.',
    'La base. Antes del lenguaje, antes del deseo: simplemente estar acá.',
  ],
  'chakras.svadhisthana.desc': [
    'El deseo, el agua que corre, la creatividad que se derrama. El placer como información.',
    'Lo que fluye. Las emociones como corrientes, no como identidad.',
    'El movimiento pélvico del universo. Lo que te saca de la rigidez.',
  ],
  'chakras.manipura.desc': [
    'La voluntad, el poder personal, la capacidad de actuar.',
    'El sol interno. Digestión literal y metafórica de todo lo que te pasa.',
    'El fuego que transforma intención en acto. Sin él, todo queda en idea.',
  ],
  'chakras.anahata.desc': [
    'El corazón como puente. Donde el cuerpo se abre al otro sin pedir nada.',
    'El aire. El amor que no necesita objeto. La compasión como atmósfera.',
    'La bisagra entre los chakras terrenales y los espirituales. El punto de equilibrio.',
  ],
  'chakras.vishuddha.desc': [
    'La voz. La verdad que no se puede tragar más. Lo que tenés que decir.',
    'El éter. La palabra como puente entre lo interno y el mundo.',
    'Garganta abierta. Decir lo difícil sin defenderse.',
  ],
  'chakras.ajna.desc': [
    'El tercer ojo. La visión que no depende de los ojos físicos. Intuición.',
    'La luz interna. Saber sin argumentar.',
    'El patrón detrás del patrón. Lo que ves cuando mirás despacio.',
  ],
  'chakras.sahasrara.desc': [
    'La corona. La conexión con lo que excede lo personal.',
    'El vacío que no está vacío. La consciencia sin objeto.',
    'Arriba del arriba. El punto donde el yo se vuelve transparente.',
  ],
  'manifiestos.filosofia.title': ['Filosofía', 'Pensamiento', 'Ideas', 'Marcos mentales'],
  'manifiestos.tech.title':      ['Tech', 'Código', 'Herramientas', 'Máquina'],
  'manifiestos.emocional.title': ['Emocional', 'Adentro', 'Sentir', 'Corazón'],
  'frases.kicker': ['FRASE DEL DÍA', 'HOY', 'MANTRA', 'SENTIDO DEL DÍA'],
  'morning.title': ['la mañana', 'arranque', 'primera hora', 'al amanecer', 'frío del sur'],
  'morning.invite': ['escribí tu mañana', 'contame cómo arrancaste', 'anotá lo primero', 'descargá la cabeza'],
  'ojo.title': ['el ojo', 'la mirada', 'tercera lente', 'contemplá'],
  'lofi.title': ['sonidos', 'ambiente', 'aire sonoro', 'capa acústica'],
  'conexiones.title': ['conexiones', 'hilos', 'puentes culturales', 'enlaces'],
};

function seedForToday() {
  const d = new Date();
  return d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate();
}

function pickFromPool(pool, seed = 0) {
  if (!pool || !pool.length) return null;
  return pool[(seed + Math.floor(Math.random() * pool.length)) % pool.length];
}

export function mockAskSingle(key, { intent = '' } = {}) {
  const pool = VARIANT_POOLS[key] || [];
  if (!pool.length) return [];
  const variants = [];
  const used = new Set();
  const seed = seedForToday() + intent.length;
  while (variants.length < Math.min(3, pool.length)) {
    const v = pool[(seed + variants.length + Math.floor(Math.random() * pool.length)) % pool.length];
    if (!used.has(v)) { used.add(v); variants.push(v); }
  }
  return variants;
}

export function mockRegenerateAll(feedbackBus, registryKeys) {
  const tagFreq = {};
  (feedbackBus || []).forEach(e => {
    (e.payload?.tags || []).forEach(t => { tagFreq[t] = (tagFreq[t] || 0) + 1; });
    if (e.type === 'chakra-tapped' && e.payload?.nombre) {
      tagFreq['yoga'] = (tagFreq['yoga'] || 0) + 1;
    }
    if (e.type === 'aura-saved') tagFreq['emocional'] = (tagFreq['emocional'] || 0) + 1;
    if (e.type === 'mandala-saved') tagFreq['sideral'] = (tagFreq['sideral'] || 0) + 1;
  });

  const topTags = Object.entries(tagFreq).sort((a,b) => b[1]-a[1]).slice(0, 3).map(([t]) => t);

  const out = {};
  const seed = seedForToday() + (feedbackBus?.length || 0);
  registryKeys.forEach((key, i) => {
    const pool = VARIANT_POOLS[key];
    if (!pool || !pool.length) return;
    out[key] = pool[(seed + i + topTags.length) % pool.length];
  });

  return {
    copys: out,
    topTags,
    source: 'mock',
    ts: Date.now(),
  };
}
