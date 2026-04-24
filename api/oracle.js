/* =============================================
   APACHETA — /api/oracle
   POST: recibe feedbackBus + keys + intent del usuario
   → consulta NotebookLM (si hay NOTEBOOKLM_NOTEBOOK_ID)
   → responde JSON con variantes de copy por sección
   Fallback: reglas locales si no hay credenciales NLM.
   ============================================= */

import { connectDB }    from './_lib/db.js';
import { User, Nota }   from './_lib/models.js';
import { requireUserId } from './_lib/auth.js';

// ─── APP SECTIONS SCHEMA ──────────────────────
// Mapa de secciones → copy keys → tags semánticos
// Usado para contextualizar la query a NotebookLM
const SECTIONS_SCHEMA = {
  'visualising-wisdom': {
    keys: ['wisdom.top', 'wisdom.bottom'],
    tags: ['filosofia', 'sideral'],
    description: 'Display de frase filosófica grande, pantalla completa',
  },
  'biblioteca': {
    keys: ['biblioteca.title'],
    tags: ['filosofia', 'tech', 'musical'],
    description: 'Galería de tarjetas con referencias culturales y filosóficas',
  },
  'aura-composer': {
    keys: ['aura.kicker', 'aura.title'],
    tags: ['emocional', 'sideral'],
    description: '5 sliders de estado emocional: calma, foco, creatividad, energía, intuición',
  },
  'mandala': {
    keys: ['mandala.title'],
    tags: ['yoga', 'sideral', 'filosofia'],
    description: 'Canvas de dibujo con simetría axial, arte generativo personal',
  },
  'lissajous': {
    keys: ['lissajous.title'],
    tags: ['tech', 'musical', 'sideral'],
    description: 'Curvas de Lissajous interactivas, matemática + estética',
  },
  'fibonacci': {
    keys: ['fibonacci.title'],
    tags: ['tech', 'sideral'],
    description: 'Espiral de Fibonacci, razón áurea animada',
  },
  'morning-journey': {
    keys: ['morning.title', 'morning.invite'],
    tags: ['filosofia', 'yoga'],
    description: 'Ritual matutino guiado: intención, gratitud, acción',
  },
  'meditacion-ojo': {
    keys: ['ojo.title'],
    tags: ['yoga', 'sideral'],
    description: 'Meditación visual de tercer ojo con timer',
  },
  'lofi': {
    keys: ['lofi.title'],
    tags: ['musical'],
    description: 'Reproductor de música lofi para concentración',
  },
  'conexiones': {
    keys: ['conexiones.title'],
    tags: ['filosofia', 'sideral'],
    description: 'Grafo de conexiones entre conceptos y referencias culturales',
  },
  'aura-history': {
    keys: ['aura-history.title'],
    tags: ['emocional'],
    description: 'Timeline de los últimos 7 días de estado emocional',
  },
  'alarma': {
    keys: ['alarma.title'],
    tags: ['yoga', 'filosofia'],
    description: 'Timer y alarma para práctica meditativa',
  },
  'scratch-reveal': {
    keys: ['scratch.title'],
    tags: ['emocional', 'filosofia'],
    description: 'Tarjeta raspadita que revela mensaje filosófico oculto',
  },
  'chakras': {
    keys: [
      'chakras.muladhara.desc', 'chakras.svadhisthana.desc',
      'chakras.manipura.desc',  'chakras.anahata.desc',
      'chakras.vishuddha.desc', 'chakras.ajna.desc',
      'chakras.sahasrara.desc',
    ],
    tags: ['yoga', 'sideral'],
    description: 'Sistema de 7 chakras interactivos con descripciones personalizadas',
  },
  'manifiestos': {
    keys: ['manifiestos.filosofia.title', 'manifiestos.tech.title', 'manifiestos.emocional.title'],
    tags: ['filosofia', 'tech', 'emocional'],
    description: 'Cards de categorías del sistema de manifiestos del usuario',
  },
};

// ─── FALLBACK LOCAL ────────────────────────────
// Reglas locales cuando no hay NotebookLM configurado.
// Analiza feedbackBus y genera copys coherentes.
function localOracle(bus, keys, intent, userData) {
  const tagCounts = {};
  (bus || []).forEach(ev => {
    const tags = ev.payload?.tags || [];
    tags.forEach(t => { tagCounts[t] = (tagCounts[t] || 0) + 1; });
    // Inferir tags desde tipo de evento
    if (ev.type === 'chakra-tapped') tagCounts['yoga'] = (tagCounts['yoga'] || 0) + 2;
    if (ev.type === 'aura-saved')    tagCounts['emocional'] = (tagCounts['emocional'] || 0) + 3;
    if (ev.type === 'mandala-saved') tagCounts['sideral'] = (tagCounts['sideral'] || 0) + 2;
    if (ev.type === 'note-written')  tagCounts['filosofia'] = (tagCounts['filosofia'] || 0) + 1;
  });

  const topTag = Object.entries(tagCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'filosofia';
  const nombre = userData?.nombre || 'viajero';

  const VARIANTS = {
    filosofia: {
      'wisdom.top':    'EL SER<br/>ES TODO',
      'wisdom.bottom': 'TODO<br/>ES NADA',
      'morning.title': 'RITUAL MATUTINO',
      'morning.invite': `escribí tu intención, ${nombre}`,
      'conexiones.title': 'constelaciones',
      'scratch.title': 'revelá',
    },
    emocional: {
      'wisdom.top':    'SENTIR<br/>ES SABER',
      'wisdom.bottom': 'EL CUERPO<br/>HABLA',
      'aura.kicker':   'tu',
      'aura.title':    'estado',
      'morning.invite': `¿cómo estás hoy, ${nombre}?`,
      'scratch.title': 'descubrí',
    },
    sideral: {
      'wisdom.top':    'SOMOS<br/>POLVO DE ESTRELLAS',
      'wisdom.bottom': 'EN EL COSMOS<br/>YA ESTABA',
      'fibonacci.title': 'la espiral.',
      'lissajous.title': 'armónicas.',
      'mandala.title': 'el mandala cósmico',
      'ojo.title':     'el tercer ojo',
    },
    yoga: {
      'wisdom.top':    'RESPIRA<br/>YA LLEGASTE',
      'ojo.title':     'ajna',
      'alarma.title':  'el despertar.',
      'morning.title': 'SADHANA MATUTINO',
    },
    tech: {
      'wisdom.top':    'EL CÓDIGO<br/>ES POESÍA',
      'lissajous.title': 'frecuencias.',
      'fibonacci.title': 'recursión.',
      'biblioteca.title': 'referencias',
    },
    musical: {
      'wisdom.top':    'EL RITMO<br/>ES VERDAD',
      'lofi.title':    'flujo',
      'lissajous.title': 'oscilaciones.',
      'biblioteca.title': 'resonancias',
    },
  };

  const variantSet = VARIANTS[topTag] || VARIANTS.filosofia;
  const copys = {};
  (keys || []).forEach(k => {
    if (variantSet[k]) copys[k] = variantSet[k];
  });

  return {
    copys,
    topTags:  Object.entries(tagCounts).sort((a, b) => b[1] - a[1]).slice(0, 4).map(([t]) => t),
    source:   'local-oracle',
    topTag,
    busLen:   (bus || []).length,
  };
}

// ─── NOTEBOOKLM QUERY ─────────────────────────
async function queryNotebookLM({ bus, keys, intent, sectionsSchema, userData }) {
  const notebookId = process.env.NOTEBOOKLM_NOTEBOOK_ID;
  const apiKey     = process.env.NOTEBOOKLM_API_KEY;

  if (!notebookId || !apiKey) return null;

  // Construir el prompt para NotebookLM basado en el feedbackBus del usuario
  const recentEvents = (bus || []).slice(-30);
  const eventSummary = recentEvents.map(e =>
    `- ${e.type}${e.payload?.tags?.length ? ` [${e.payload.tags.join(',')}]` : ''}${e.payload?.titulo ? `: "${e.payload.titulo}"` : ''}`
  ).join('\n');

  const keysList = (keys || []).slice(0, 20).join(', ');
  const nombre   = userData?.nombre || 'usuario';

  const prompt = `
Sos el Copy Oracle de Apacheta, una app de bienestar personal para ${nombre}.

ACTIVIDAD RECIENTE DEL USUARIO:
${eventSummary || 'Sin eventos recientes'}

INTENCIÓN DEL USUARIO: ${intent || 'regeneración automática'}

SECCIONES DE LA APP Y SUS COPY KEYS:
${JSON.stringify(sectionsSchema, null, 2)}

KEYS A REGENERAR: ${keysList}

Generá variantes de copy personalizadas para estas keys.
Respondé SOLO con un JSON válido en este formato exacto:
{
  "copys": {
    "wisdom.top": "TEXTO NUEVO",
    "wisdom.bottom": "TEXTO NUEVO",
    ...solo las keys que puedas personalizar...
  },
  "topTags": ["tag1", "tag2", "tag3"],
  "rationale": "Una oración sobre por qué estas variantes para este usuario"
}

Reglas:
- Los copys deben ser cortos (1-5 palabras), poéticos, en español o inglés mezclado
- Usá <br/> para saltos de línea en los que lo necesiten
- Basate en los eventos del usuario para personalizar
- No inventes keys que no existan en la lista
`.trim();

  try {
    const response = await fetch(
      `https://notebooklm.googleapis.com/v1/notebooks/${notebookId}:query`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: prompt }),
      }
    );

    if (!response.ok) return null;
    const data = await response.json();

    // NotebookLM devuelve el texto en data.answer o data.response
    const rawText = data.answer || data.response || '';
    const jsonMatch = rawText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return null;

    const parsed = JSON.parse(jsonMatch[0]);
    return {
      copys:    parsed.copys    || {},
      topTags:  parsed.topTags  || [],
      rationale: parsed.rationale || '',
      source:   'notebooklm',
      busLen:   (bus || []).length,
    };
  } catch (err) {
    console.error('[oracle] NotebookLM query failed:', err.message);
    return null;
  }
}

// ─── HANDLER ──────────────────────────────────
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Solo POST' });
  }

  await connectDB();

  const userId = requireUserId(req, res);
  if (!userId) return;

  const { bus = [], keys = [], intent = '', useMock = false } = req.body || {};

  // Obtener datos del usuario para personalización
  let userData = null;
  try {
    const { User } = await import('./_lib/models.js');
    userData = await User.findOne({ userId }).lean();
  } catch (_) {}

  // Intentar NotebookLM si está configurado y no se fuerza mock
  let result = null;
  if (!useMock) {
    result = await queryNotebookLM({
      bus,
      keys: keys.length ? keys : Object.values(SECTIONS_SCHEMA).flatMap(s => s.keys),
      intent,
      sectionsSchema: SECTIONS_SCHEMA,
      userData,
    });
  }

  // Fallback local
  if (!result || !result.copys || Object.keys(result.copys).length === 0) {
    result = localOracle(
      bus,
      keys.length ? keys : Object.values(SECTIONS_SCHEMA).flatMap(s => s.keys),
      intent,
      userData
    );
  }

  return res.status(200).json({
    ok: true,
    ...result,
    sectionsSchema: SECTIONS_SCHEMA,
  });
}
