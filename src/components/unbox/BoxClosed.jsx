// src/components/unbox/BoxClosed.jsx
import { motion } from 'framer-motion';

const EASE = [0.22, 1, 0.36, 1];

export default function BoxClosed({ cover, name, onClick, disabled }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20, scale: 0.9 }}
      transition={{ duration: 0.5, ease: EASE }}
      className="flex flex-col items-center"
    >
      <motion.button
        onClick={onClick}
        disabled={disabled}
        whileTap={{ scale: 0.97 }}
        whileHover={{ y: -6 }}
        className="relative group cursor-pointer disabled:cursor-not-allowed"
        aria-label="Открыть коробку"
      >
        {/* Внешнее свечение */}
        <motion.span
          animate={{ scale: [1, 1.18, 1], opacity: [0.4, 0.7, 0.4] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute inset-0 rounded-full bg-[#FF9500]/40 blur-3xl -z-10"
        />

        {/* Коробка — крупнее */}
        <motion.img
          src={cover || '/box/box-front.png'}
          alt={name}
          animate={{ y: [0, -14, 0] }}
          transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}
          className="w-[400px] sm:w-[460px] md:w-[540px] lg:w-[600px] h-auto select-none pointer-events-none"
          style={{ filter: 'drop-shadow(0 36px 60px rgba(120,60,0,0.45))' }}
          draggable={false}
        />

        {/* Тень под коробкой */}
        <motion.span
          animate={{ scaleX: [1, 0.85, 1], opacity: [0.35, 0.55, 0.35] }}
          transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute left-1/2 -bottom-3 h-5 w-[65%] -translate-x-1/2
                     rounded-[50%] bg-[#7A3D00]/30 blur-md"
        />
      </motion.button>

      {/* Одна короткая подсказка */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.5 }}
        className="mt-8 text-[11px] uppercase tracking-[0.32em] font-bold text-[#B87400]"
      >
        Нажми на коробку
      </motion.p>
    </motion.div>
  );
}