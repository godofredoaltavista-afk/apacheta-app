/* =============================================
   APACHETA — BIBLIOTECA
   Card flip 3D + filtros
   ============================================= */

export function initBiblioteca() {
  // ─── Card flip 3D ─────────────────────────
  document.querySelectorAll('.obra-card.card-flip').forEach(card => {
    card.addEventListener('click', () => {
      card.classList.toggle('flipped');
    });

    // Touch: evitar flip accidental en scroll
    let startY = 0;
    card.addEventListener('touchstart', e => { startY = e.touches[0].clientY; }, { passive: true });
    card.addEventListener('touchend', e => {
      const delta = Math.abs(e.changedTouches[0].clientY - startY);
      if (delta < 8) card.classList.toggle('flipped');
    });
  });

  // ─── Filtros ──────────────────────────────
  const filterBtns = document.querySelectorAll('[data-filter]');
  const cards      = document.querySelectorAll('.obra-card[data-filter]');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const filter = btn.dataset.filter;

      // Active state
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      // Mostrar/ocultar cards
      cards.forEach(card => {
        const match = filter === 'todos' || card.dataset.filter === filter;
        card.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
        card.style.opacity    = match ? '1' : '0.2';
        card.style.transform  = match ? 'scale(1)' : 'scale(0.95)';
        card.style.pointerEvents = match ? 'auto' : 'none';
      });
    });
  });

  // ─── Hover glow efecto (cursor position) ──
  // BUG 1.6: skip si la carta está flipped (el transform sobreescribe el rotateY del flip)
  document.querySelectorAll('.obra-card').forEach(card => {
    card.addEventListener('mousemove', (e) => {
      if (card.classList.contains('flipped')) return;
      const rect = card.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width  - 0.5) * 20;
      const y = ((e.clientY - rect.top)  / rect.height - 0.5) * 20;
      card.style.transform = `perspective(600px) rotateY(${x}deg) rotateX(${-y}deg) translateY(-2px)`;
    });
    card.addEventListener('mouseleave', () => {
      if (card.classList.contains('flipped')) return;
      card.style.transform = '';
      card.style.transition = 'transform 0.4s ease';
    });
  });
}
