/* =============================================
   APACHETA — MODOS DEL DÍA
   Alucinaje: frases rotativas + conexiones
   ============================================= */

const FRASES_ALUCINAJE = [
  { titulo: '¿Y si todo\nes uno?',         frase: '"El universo no te hizo pasar por eso. El universo se pasó por vos."' },
  { titulo: 'El observador\ncrea la ola.',  frase: '"La partícula no tiene posición hasta que la observás. ¿Y vos?"' },
  { titulo: 'Soñás\ncada noche.',           frase: '"Cinco años de tu vida los pasaste soñando. ¿Cuál era más real?"' },
  { titulo: 'El tiempo\nes subjetivo.',     frase: '"Einstein lo formalizó. Los budistas lo practican. ¿Y vos lo vivís?"' },
  { titulo: 'Nada\nes sólido.',             frase: '"El 99.9% de un átomo es espacio vacío. Incluido tu cuerpo ahora mismo."' },
];

const CONEXIONES = [
  'Marco Aurelio + física cuántica + A Love Supreme (1965)',
  'Fibonacci + Coltrane + respiración 4-7-8',
  'Nisargadatta + neuroplasticidad + Kind of Blue',
  'Heráclito + física de partículas + Gödel Escher Bach',
  'Spinoza + coherencia cardíaca + las ruinas de Tiwanaku',
];

let alucinajeTimer = null;
let alucinajeIdx   = 0;

export function initModoAlucinaje() {
  const section   = document.getElementById('modo-alucinaje');
  const titleEl   = document.getElementById('alucinaje-title');
  const fraseEl   = document.getElementById('alucinaje-frase');
  const conexEl   = document.getElementById('alucinaje-conexion');

  if (!section) return;

  function updateAlucinaje() {
    const data = FRASES_ALUCINAJE[alucinajeIdx % FRASES_ALUCINAJE.length];
    const con  = CONEXIONES[alucinajeIdx % CONEXIONES.length];

    if (titleEl) {
      titleEl.style.opacity = '0';
      setTimeout(() => {
        titleEl.innerHTML = data.titulo.replace('\n', '<br/>');
        titleEl.style.opacity = '1';
        titleEl.style.transition = 'opacity 0.8s ease';
      }, 300);
    }

    if (fraseEl) {
      fraseEl.style.opacity = '0';
      setTimeout(() => {
        fraseEl.textContent = data.frase;
        fraseEl.style.opacity = '1';
        fraseEl.style.transition = 'opacity 0.8s ease';
      }, 500);
    }

    if (conexEl) {
      conexEl.style.opacity = '0';
      setTimeout(() => {
        conexEl.textContent = con;
        conexEl.style.opacity = '1';
        conexEl.style.transition = 'opacity 0.8s ease';
      }, 700);
    }

    alucinajeIdx++;
  }

  // Rotar cada 6 segundos cuando la sección es visible
  const obs = new IntersectionObserver(entries => {
    if (entries[0].isIntersecting) {
      updateAlucinaje();
      alucinajeTimer = setInterval(updateAlucinaje, 6000);
    } else {
      clearInterval(alucinajeTimer);
    }
  }, { threshold: 0.3 });

  obs.observe(section);
}
