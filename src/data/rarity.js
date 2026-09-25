// src/data/rarity.js

export const RARITY = {
  D: {
    id: 'D',
    label: 'Обычная',
    color: '#10b981',
    glow: 'rgba(16,185,129,0.35)',
    confettiColors: ['#10b981', '#34d399', '#6ee7b7', '#a7f3d0'],
    confettiCount: 0,
    hasFlash: false,
  },
  C: {
    id: 'C',
    label: 'Необычная',
    color: '#3b82f6',
    glow: 'rgba(59,130,246,0.4)',
    confettiColors: ['#3b82f6', '#60a5fa', '#93c5fd', '#dbeafe'],
    confettiCount: 40,
    hasFlash: false,
  },
  B: {
    id: 'B',
    label: 'Редкая',
    color: '#cd7f32',
    glow: 'rgba(205,127,50,0.5)',
    confettiColors: ['#b45309', '#cd7f32', '#d97706', '#f59e0b'],
    confettiCount: 90,
    hasFlash: false,
  },
  A: {
    id: 'A',
    label: 'Особо редкая',
    color: '#c0c0c0',
    glow: 'rgba(192,192,192,0.55)',
    confettiColors: ['#94a3b8', '#c0c0c0', '#e2e8f0', '#f1f5f9'],
    confettiCount: 160,
    hasFlash: true,
  },
  S: {
    id: 'S',
    label: 'Секретная',
    color: '#ffd700',
    glow: 'rgba(255,215,0,0.7)',
    confettiColors: ['#fbbf24', '#ffd700', '#fcd34d', '#fef3c7'],
    confettiCount: 280,
    hasFlash: true,
  },
  'SS+': {
    id: 'SS+',
    label: 'Легендарная',
    color: '#ffa500',
    glow: 'rgba(255,165,0,0.85)',
    confettiColors: ['#ff8c00', '#ffa500', '#ffb347', '#fbbf24'],
    confettiCount: 500,
    hasFlash: true,
  },
};

export const getRarity = (id) => RARITY[id] || RARITY.D;