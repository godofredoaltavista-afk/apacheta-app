/* =============================================
   SPRING — Physics utility
   stiffness: 0.08–0.15 (mayor = más rígido)
   damping:   0.70–0.85 (mayor = menos bounce)
   ============================================= */

export function springTo(opts) {
  const {
    from       = 0,
    to         = 1,
    stiffness  = 0.12,
    damping    = 0.75,
    onUpdate,
    onDone,
    precision  = 0.001,
  } = opts;

  let current  = from;
  let velocity = 0;
  let rafId;

  function tick() {
    const force    = (to - current) * stiffness;
    velocity       = (velocity + force) * damping;
    current       += velocity;

    onUpdate(current);

    if (Math.abs(velocity) < precision && Math.abs(to - current) < precision) {
      current = to;
      onUpdate(current);
      if (onDone) onDone();
      return;
    }

    rafId = requestAnimationFrame(tick);
  }

  rafId = requestAnimationFrame(tick);

  return {
    cancel: () => { if (rafId) cancelAnimationFrame(rafId); },
    setTarget: (newTo) => { to = newTo; },
  };
}

// Utility: lerp (linear interpolation)
export function lerp(a, b, t) {
  return a + (b - a) * t;
}
