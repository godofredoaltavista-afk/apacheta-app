/* =============================================
   APACHETA — BANNER REGISTRY
   Paths de /banners/ con tags semánticos.
   El Oracle elige banners según el feedback bus
   (match de tags con eventos recientes).
   ============================================= */

export const BANNERS = [
  { path: '/banners/WhatsApp Image 2026-04-17 at 13.00.29.jpeg', tags: ['filosofia', 'editorial'] },
  { path: '/banners/WhatsApp Image 2026-04-17 at 13.00.55.jpeg', tags: ['sideral', 'editorial'] },
  { path: '/banners/WhatsApp Image 2026-04-17 at 13.01.08.jpeg', tags: ['emocional', 'natural'] },
  { path: '/banners/WhatsApp Image 2026-04-17 at 13.02.49.jpeg', tags: ['filosofia', 'natural'] },
  { path: '/banners/WhatsApp Image 2026-04-17 at 13.05.10.jpeg', tags: ['tech', 'editorial'] },
  { path: '/banners/WhatsApp Image 2026-04-17 at 13.07.15.jpeg', tags: ['musical', 'natural'] },
  { path: '/banners/WhatsApp Image 2026-04-17 at 13.07.41.jpeg', tags: ['yoga', 'natural'] },
  { path: '/banners/WhatsApp Image 2026-04-17 at 13.08.15.jpeg', tags: ['sideral', 'tech'] },
  { path: '/banners/apacheta-mandala (4).png',                   tags: ['yoga', 'sideral', 'mandala'] },
  { path: '/banners/crypto-inheritance.jpg',                     tags: ['tech', 'filosofia'] },
  { path: '/banners/dead-mans-switch-inheritance.jpg',           tags: ['tech', 'emocional'] },
  { path: '/banners/downloadedImage - 2026-04-17T153008.946.png', tags: ['sideral'] },
  { path: '/banners/downloadedImage - 2026-04-17T161028.722.png', tags: ['emocional'] },
  { path: '/banners/downloadedImage - 2026-04-17T161120.996.png', tags: ['filosofia'] },
  { path: '/banners/downloadedImage - 2026-04-17T161152.841.png', tags: ['natural'] },
  { path: '/banners/downloadedImage - 2026-04-17T161215.422.png', tags: ['musical'] },
  { path: '/banners/downloadedImage - 2026-04-17T161419.858.png', tags: ['editorial'] },
  { path: '/banners/seed-phrase-storage.jpg',                    tags: ['tech'] },
  { path: '/banners/shamirs-secret-sharing.jpg',                 tags: ['tech', 'filosofia'] },
];

export function findByTags(targetTags = [], count = 3) {
  if (!targetTags.length) return BANNERS.slice(0, count);
  const scored = BANNERS.map(b => ({
    banner: b,
    score: b.tags.filter(t => targetTags.includes(t)).length + Math.random() * 0.3,
  }));
  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, count).map(s => s.banner);
}

export function randomBanner() {
  return BANNERS[Math.floor(Math.random() * BANNERS.length)];
}
