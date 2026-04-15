/* =============================================
   APACHETA — ONBOARDING
   Selector de colores + localStorage
   ============================================= */

import { saveUser, applyUserColors, revealApp } from '../main.js';

export function initOnboarding() {
  const section   = document.getElementById('onboarding');
  if (!section) return;

  const submitBtn  = document.getElementById('ob-submit');
  const nombreInput = document.getElementById('ob-nombre');
  const signoInput  = document.getElementById('ob-signo');
  const fechaInput  = document.getElementById('ob-fecha');
  const colorGrid   = document.getElementById('color-grid');
  const colorPreview = document.getElementById('color-preview');

  let selectedColors = [];

  // ─── Color picker ─────────────────────────
  if (colorGrid) {
    colorGrid.querySelectorAll('.color-picker__swatch').forEach(swatch => {
      swatch.addEventListener('click', () => {
        const color = swatch.dataset.color;

        if (swatch.classList.contains('selected')) {
          // Deseleccionar
          swatch.classList.remove('selected');
          selectedColors = selectedColors.filter(c => c !== color);
        } else if (selectedColors.length < 3) {
          // Seleccionar
          swatch.classList.add('selected');
          selectedColors.push(color);
        }

        // Preview gradiente
        updatePreview();
        // Aura en tiempo real
        if (selectedColors.length > 0) {
          applyUserColors([
            selectedColors[0] || '#A8E6E0',
            selectedColors[1] || '#F4C2C2',
            selectedColors[2] || '#FFE44D',
          ]);
        }
      });
    });
  }

  function updatePreview() {
    if (!colorPreview) return;
    if (selectedColors.length === 0) {
      colorPreview.style.background = 'var(--bg-soft)';
    } else if (selectedColors.length === 1) {
      colorPreview.style.background = selectedColors[0];
    } else {
      const stops = selectedColors.map((c, i) =>
        `${c} ${Math.round((i / (selectedColors.length - 1)) * 100)}%`
      ).join(', ');
      colorPreview.style.background = `linear-gradient(90deg, ${stops})`;
    }
  }

  // ─── Submit ───────────────────────────────
  if (submitBtn) {
    submitBtn.addEventListener('click', () => {
      const nombre = nombreInput?.value.trim();

      if (!nombre) {
        nombreInput?.focus();
        shake(nombreInput);
        return;
      }

      const colores = selectedColors.length > 0
        ? [...selectedColors, ...['#A8E6E0', '#F4C2C2', '#FFE44D']].slice(0, 3)
        : ['#A8E6E0', '#F4C2C2', '#FFE44D'];

      saveUser({
        nombre,
        signo:               signoInput?.value.trim() || '',
        nacimiento:          fechaInput?.value || '',
        colores,
        onboardingCompleto:  true,
      });

      // Animación de salida del onboarding
      section.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
      section.style.opacity    = '0';
      section.style.transform  = 'translateY(-20px)';

      setTimeout(() => {
        section.style.display = 'none';
        // Revelar toda la app de una vez
        revealApp();
      }, 600);
    });
  }

  // ─── Shake animation ──────────────────────
  function shake(el) {
    if (!el) return;
    el.style.animation = 'scratchHint 0.4s ease';
    el.style.borderColor = 'rgba(196,98,45,0.5)';
    setTimeout(() => {
      el.style.animation = '';
      el.style.borderColor = '';
    }, 400);
  }

  // ─── Enter key submit ─────────────────────
  [nombreInput, signoInput, fechaInput].forEach(input => {
    input?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') submitBtn?.click();
    });
  });
}
