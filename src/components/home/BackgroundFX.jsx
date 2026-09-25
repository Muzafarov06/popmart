// src/components/home/BackgroundFX.jsx
import { motion } from 'framer-motion';

export default function BackgroundFX() {
  const dots = [
    { top: '16%', left: '12%', size: 8, delay: 0 },
    { top: '28%', left: '82%', size: 6, delay: 0.8 },
    { top: '58%', left: '7%', size: 5, delay: 1.6 },
    { top: '70%', left: '88%', size: 9, delay: 0.4 },
    { top: '12%', left: '58%', size: 5, delay: 2.1 },
  ];

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden z-[1]">
      {/* Солнечные лучи */}
      <div
        className="absolute left-1/2 top-[34%] h-[1500px] w-[1500px] -translate-x-1/2 -translate-y-1/2 opacity-55"
        style={{
          background:
            'repeating-conic-gradient(from 0deg at 50% 50%, #FFC93C 0deg 7deg, #FFD96F 7deg 14deg)',
          WebkitMaskImage:
            'radial-gradient(circle at 50% 50%, #000 0%, #000 26%, transparent 60%)',
          maskImage:
            'radial-gradient(circle at 50% 50%, #000 0%, #000 26%, transparent 60%)',
        }}
      />

      {/* Мягкие переходы сверху и снизу */}
      <div className="absolute inset-x-0 top-0 h-[420px] bg-[linear-gradient(180deg,#FFF9F0_0%,transparent_100%)]" />
      <div className="absolute inset-x-0 bottom-0 h-[380px] bg-[linear-gradient(0deg,#FFEBD2_0%,transparent_100%)]" />

      {/* Искры */}
      {dots.map((d, i) => (
        <motion.span
          key={i}
          className="absolute rounded-full bg-white/70 shadow-[0_0_18px_4px_rgba(255,200,80,0.7)]"
          style={{ top: d.top, left: d.left, width: d.size, height: d.size }}
          animate={{ y: [0, -16, 0], opacity: [0.3, 1, 0.3] }}
          transition={{
            duration: 4 + i,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: d.delay,
          }}
        />
      ))}
    </div>
  );
}