// src/lib/confetti.js
import confetti from 'canvas-confetti';
import { getRarity } from '@/data/rarity';

/**
 * Запускает конфетти в зависимости от редкости фигурки.
 * @param {string} rarityId — 'D' | 'C' | 'B' | 'A' | 'S' | 'SS+'
 */
export function fireConfetti(rarityId) {
  const rarity = getRarity(rarityId);
  if (!rarity.hasConfetti) return;

  // Отключаем для пользователей с prefers-reduced-motion
  if (typeof window !== 'undefined') {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) return;
  }

  const count = rarity.confettiCount;
  const color = rarity.color;
  const isLegendary = rarityId === 'S' || rarityId === 'SS+';

  // ── Базовый залп из центра ──
  confetti({
    particleCount: Math.min(count, 150),
    spread: isLegendary ? 120 : 80,
    origin: { y: 0.6 },
    colors: [color, '#FFB800', '#FFFFFF', '#FF6B00'],
    scalar: isLegendary ? 1.3 : 1,
    ticks: isLegendary ? 250 : 180,
  });

  // ── Боковые залпы для редких ──
  if (count >= 80) {
    setTimeout(() => {
      confetti({
        particleCount: Math.floor(count / 2),
        angle: 60,
        spread: 70,
        origin: { x: 0, y: 0.7 },
        colors: [color, '#FFB800', '#FFFFFF'],
      });
      confetti({
        particleCount: Math.floor(count / 2),
        angle: 120,
        spread: 70,
        origin: { x: 1, y: 0.7 },
        colors: [color, '#FFB800', '#FFFFFF'],
      });
    }, 180);
  }

  // ── Особый залп для секретных ──
  if (isLegendary) {
    setTimeout(() => {
      confetti({
        particleCount: 200,
        spread: 360,
        startVelocity: 45,
        origin: { y: 0.5 },
        colors: ['#FFD24C', '#FFB800', '#F59E0B', '#FFFFFF'],
        shapes: ['star', 'circle'],
        scalar: 1.5,
      });
    }, 400);
  }
}