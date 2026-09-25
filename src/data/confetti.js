// src/lib/confetti.js
import confetti from 'canvas-confetti';
import { getRarity } from '@/data/rarity';

export function fireConfetti(rarityId) {
  const rarity = getRarity(rarityId);
  if (!rarity.confettiCount) return;

  if (typeof window !== 'undefined') {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) return;
  }

  const count = rarity.confettiCount;
  const colors = rarity.confettiColors;
  const isLegendary = rarityId === 'S' || rarityId === 'SS+';

  // Базовый залп
  confetti({
    particleCount: Math.min(count, 150),
    spread: isLegendary ? 130 : 80,
    origin: { y: 0.6 },
    colors,
    scalar: isLegendary ? 1.3 : 1,
    ticks: isLegendary ? 250 : 180,
  });

  // Боковые залпы
  if (count >= 90) {
    setTimeout(() => {
      confetti({
        particleCount: Math.floor(count / 2),
        angle: 60,
        spread: 70,
        origin: { x: 0, y: 0.7 },
        colors,
      });
      confetti({
        particleCount: Math.floor(count / 2),
        angle: 120,
        spread: 70,
        origin: { x: 1, y: 0.7 },
        colors,
      });
    }, 180);
  }

  // Особый залп для легендарных
  if (isLegendary) {
    setTimeout(() => {
      confetti({
        particleCount: 200,
        spread: 360,
        startVelocity: 45,
        origin: { y: 0.5 },
        colors,
        shapes: ['star', 'circle'],
        scalar: 1.5,
      });
    }, 400);
  }
}