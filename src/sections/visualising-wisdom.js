/* =============================================
   APACHETA — VISUALISING WISDOM
   Canvas blur + palabras numeradas
   ============================================= */

export function initVisualisingWisdom() {
  // El canvas ya se maneja en main.js (initWisdomCanvas)
  // Aquí manejamos interactividad de las palabras

  const words = document.querySelectorAll('.wisdom__word');

  words.forEach((word, i) => {
    word.style.opacity = '0';
    word.style.transform = 'translateY(10px)';
    word.style.transition = `opacity 0.6s ease ${i * 0.15}s, transform 0.6s ease ${i * 0.15}s`;
  });

  const obs = new IntersectionObserver(entries => {
    if (entries[0].isIntersecting) {
      words.forEach(w => {
        w.style.opacity = '1';
        w.style.transform = 'translateY(0)';
      });
      obs.disconnect();
    }
  }, { threshold: 0.3 });

  const section = document.getElementById('visualising-wisdom');
  if (section) obs.observe(section);
}
