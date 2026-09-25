// src/components/unbox/BoxOpening.jsx
import { motion } from 'framer-motion';

export default function BoxOpening({ cover, name }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="relative flex flex-col items-center isolate"
    >
      {/* Вспышка на весь экран — быстрая, не перекрывает долго */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 0, 0.7, 0.35, 0] }}
        transition={{ duration: 1.6, times: [0, 0.5, 0.65, 0.8, 1] }}
        aria-hidden
        className="fixed inset-0 bg-[radial-gradient(circle,rgba(255,255,255,0.9)_0%,rgba(255,210,76,0.35)_45%,transparent_90%)] pointer-events-none -z-10"
      />

      {/* Расходящиеся кольца */}
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0.7, scale: 0.3 }}
          animate={{ opacity: 0, scale: 2.6 }}
          transition={{
            duration: 1.6,
            delay: 0.4 + i * 0.14,
            ease: 'easeOut',
          }}
          aria-hidden
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
                     rounded-full border border-[#FFB800]/60 pointer-events-none -z-10"
          style={{ width: 200, height: 200 }}
        />
      ))}

      {/* Лучи — на фоне */}
      <motion.div
        initial={{ opacity: 0, scale: 0.4, rotate: 0 }}
        animate={{
          opacity: [0, 0.4, 0.7, 0.45],
          scale: [0.4, 1.1, 1.5, 2],
          rotate: [0, 45, 90, 120],
        }}
        transition={{ duration: 1.8, delay: 0.4, ease: 'easeOut' }}
        aria-hidden
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none -z-10"
      >
        <div
          className="w-[640px] h-[640px] opacity-60"
          style={{
            background:
              'repeating-conic-gradient(from 0deg at 50% 50%, rgba(255,200,60,0.75) 0deg 5deg, transparent 5deg 15deg)',
            WebkitMaskImage:
              'radial-gradient(circle at 50% 50%, #000 0%, #000 26%, transparent 68%)',
            maskImage:
              'radial-gradient(circle at 50% 50%, #000 0%, #000 26%, transparent 68%)',
          }}
        />
      </motion.div>

      {/* Центральное свечение — ограниченное */}
      <motion.div
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: [0, 0.4, 0.65, 0.3], scale: [0.5, 1.1, 1.4, 1.8] }}
        transition={{ duration: 1.8, delay: 0.4 }}
        aria-hidden
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none -z-10"
      >
        <div className="w-[420px] h-[420px] rounded-full bg-[#FFD24C]/70 blur-[100px]" />
      </motion.div>

      {/* Коробка — ГЛАВНАЯ, поверх всего */}
      <motion.div
        animate={{
          x: [0, -8, 8, -10, 10, -12, 12, -14, 14, 0],
          y: [0, -4, 4, -6, 6, -8, 8, -10, 10, -12],
          rotate: [0, -5, 5, -6, 6, -7, 7, -8, 8, 0],
          scale: [1, 1.03, 1.06, 1.1, 1.14, 1.18, 1.22, 1.26, 1.3, 1.4],
        }}
        transition={{ duration: 1.6, ease: 'easeInOut' }}
        className="relative z-10"
      >
        <img
          src={cover || '/box/box-front.png'}
          alt={name}
          className="w-[260px] sm:w-[320px] md:w-[380px] h-auto select-none pointer-events-none"
          style={{
            filter:
              'drop-shadow(0 30px 60px rgba(120,60,0,0.5)) brightness(1.25) saturate(1.25)',
          }}
        />
      </motion.div>

      {/* Частицы — лёгкие, не перекрывают */}
      {[...Array(10)].map((_, i) => {
        const angle = (i * 360) / 10;
        const distance = 180;
        return (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: 0, y: 0, scale: 0 }}
            animate={{
              opacity: [0, 0.9, 0.9, 0],
              x: Math.cos((angle * Math.PI) / 180) * distance,
              y: Math.sin((angle * Math.PI) / 180) * distance,
              scale: [0, 1.2, 1, 0],
            }}
            transition={{ duration: 1.3, delay: 0.7 + i * 0.03, ease: 'easeOut' }}
            aria-hidden
            className="absolute top-1/2 left-1/2 w-1.5 h-1.5 rounded-full bg-[#FFD24C] shadow-[0_0_8px_2px_rgba(255,210,76,0.7)] pointer-events-none z-20"
          />
        );
      })}

      {/* Текст */}
      <motion.p
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.5 }}
        className="relative z-10 mt-12 text-center text-[12px] uppercase tracking-[0.32em] font-black text-[#B87400]"
      >
        <motion.span
          animate={{ opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
        >
          Открываем…
        </motion.span>
      </motion.p>
    </motion.div>
  );
}