/* =============================================
   APACHETA — CONEXIONES CULTURALES
   Selector de culturas + perspectivas
   ============================================= */

const CONEXIONES_DATA = {
  naranja: {
    concepto: 'El naranja fue el primer pigmento humano',
    perspectivas: {
      oriental:  'En el budismo, el naranja es el color de los monjes que renunciaron al ego. El pigmento más primitivo tomado como el símbolo de la mayor transformación espiritual.',
      griega:    'Los griegos no tenían palabra para "naranja". Lo llamaban ξανθός — entre amarillo y dorado. El lenguaje crea la percepción, no al revés.',
      azteca:    'En Mesoamérica, el amarillo-naranja era el color del sol y del maíz: el dador de vida. Pintaban sus templos con cempasúchil, la flor que une mundos.',
      andina:    'El achiote, pigmento anaranjado de la selva amazónica, era usado en rituales para conectar mundos. El color como puente, no como decoración.',
      africana:  'Las tribus yoruba del oeste de África usan el naranja en ceremonias de transición: nacimiento, pubertad, muerte. El color del fuego que transforma.',
    },
  },
  agua: {
    concepto: 'El agua tiene memoria',
    perspectivas: {
      oriental:  'Masaru Emoto fotografió cristales de agua expuesta a palabras positivas y negativas. La ciencia lo refuta, pero el budismo lleva siglos diciendo que la intención modifica la realidad.',
      griega:    'Tales de Mileto creía que todo surgió del agua. No como metáfora: como hecho material. El primer filósofo occidental tenía una cosmología que cualquier chamán reconocería.',
      azteca:    'Tlaloc, dios de la lluvia, no era solo proveedor de agua: era guardián del ciclo muerte-renacimiento. El agua que cae es la misma que subió.',
      andina:    'En la cosmovisión andina, el agua es el hilo que conecta la Pachamama con el Hanan Pacha (mundo de arriba). Los ríos son venas del mundo.',
      africana:  'Mami Wata, espíritu acuático de África Occidental, es mitad pez, mitad humana. Representa la dualidad: el agua da vida y ahoga.',
    },
  },
  tiempo: {
    concepto: '¿Existe el presente?',
    perspectivas: {
      oriental:  'El budismo zen dice que el presente no existe como punto fijo: surge y desaparece en cada instante. El "ahora" es una ilusión conveniente.',
      griega:    'Heráclito: no podés entrar dos veces al mismo río. Aristóteles respondió: el tiempo es el número del movimiento según el antes y el después.',
      azteca:    'El calendario azteca tiene 18 meses de 20 días + 5 días "fuera del tiempo" (nemontemi). El tiempo no es lineal: es cíclico y sagrado.',
      andina:    'El quechua tiene una concepción del tiempo donde el pasado está adelante (porque ya lo viste) y el futuro atrás (porque aún no llegó). El tiempo como espacio.',
      africana:  'En la filosofía Ubuntu, el tiempo es comunitario: lo que hacés hoy determina quiénes fueron tus ancestros. El futuro construye el pasado.',
    },
  },
};

let currentCulturas   = ['oriental'];
let currentConcepto   = 'naranja';

export function initConexiones() {
  const culturaBtns = document.querySelectorAll('.cultura-orb');
  const conceptoEl  = document.getElementById('conexion-concepto');
  const perspContainer = document.querySelector('.conexion-perspectivas');

  if (!perspContainer) return;

  // ─── Selector de culturas ─────────────────
  culturaBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const cultura = btn.dataset.cultura;

      if (btn.classList.contains('selected')) {
        // Deseleccionar solo si hay más de 1
        if (currentCulturas.length > 1) {
          btn.classList.remove('selected');
          currentCulturas = currentCulturas.filter(c => c !== cultura);
        }
      } else if (currentCulturas.length < 3) {
        btn.classList.add('selected');
        currentCulturas.push(cultura);
      }

      renderPerspectivas();
    });
  });

  // ─── Concepto del día (rotativo por fecha) ─
  const conceptos = Object.keys(CONEXIONES_DATA);
  const today     = new Date();
  const idx       = (today.getDate() + today.getMonth()) % conceptos.length;
  currentConcepto = conceptos[idx];

  const data = CONEXIONES_DATA[currentConcepto];
  if (conceptoEl) conceptoEl.textContent = data.concepto;

  renderPerspectivas();

  function renderPerspectivas() {
    const data   = CONEXIONES_DATA[currentConcepto];
    if (!data) return;

    perspContainer.innerHTML = currentCulturas.map(cultura => {
      const texto = data.perspectivas[cultura];
      if (!texto) return '';
      return `
        <div class="perspectiva-card" style="animation:fadeUp 0.5s ease both;">
          <p class="perspectiva-card__cultura">${capitalize(cultura)}</p>
          <p class="perspectiva-card__text">${texto}</p>
        </div>
      `;
    }).join('');
  }
}

function capitalize(s) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
