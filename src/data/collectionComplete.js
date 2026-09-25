// src/data/collectionComplete.js

export const COLLECTION_COMPLETE_MESSAGES = [
  {
    title: 'КОЛЛЕКЦИЯ СОБРАНА!',
    subtitle: 'Ты собрал все 12 фигурок. Гордимся тобой.',
  },
  {
    title: '100% ЗАВЕРШЕНО!',
    subtitle: 'Полный сет  — в твоих руках.',
  },
  {
    title: 'ФИНАЛ!',
    subtitle: 'Все фигурки в коллекции. Ты — мастер.',
  },
  {
    title: 'ЛЕГЕНДА КОЛЛЕКЦИИ!',
    subtitle: 'Не каждому удаётся собрать полный набор.',
  },
  {
    title: 'ИДЕАЛЬНО!',
    subtitle: 'Все 12 в твоей коллекции. Впечатляет.',
  },
];

export function getCollectionCompleteMessage() {
  return COLLECTION_COMPLETE_MESSAGES[
    Math.floor(Math.random() * COLLECTION_COMPLETE_MESSAGES.length)
  ];
}

/**
 * Спец-конфетти для завершения коллекции.
 */
export function fireCollectionCompleteConfetti() {
  if (typeof window === 'undefined') return;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduced) return;

  // Импортируем конфетти (динамически, чтобы не дублировать)
  import('canvas-confetti').then(({ default: confetti }) => {
    const duration = 4 * 1000;
    const end = Date.now() + duration;
    const colors = ['#FFD24C', '#FFB800', '#F59E0B', '#FFFFFF', '#FF6B00'];

    (function frame() {
      confetti({
        particleCount: 6,
        angle: 60,
        spread: 65,
        origin: { x: 0, y: 0.7 },
        colors,
      });
      confetti({
        particleCount: 6,
        angle: 120,
        spread: 65,
        origin: { x: 1, y: 0.7 },
        colors,
      });
      if (Date.now() < end) requestAnimationFrame(frame);
    })();

    // Финальный мега-залп
    setTimeout(() => {
      confetti({
        particleCount: 400,
        spread: 360,
        startVelocity: 45,
        origin: { y: 0.5 },
        colors,
        shapes: ['star', 'circle'],
        scalar: 1.6,
        ticks: 300,
      });
    }, 800);
  });
}