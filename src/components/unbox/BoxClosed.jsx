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
        className="relative group cursor-pointer"
      >
        {/* Внешнее свечение */}
        <motion.span
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.4, 0.7, 0.4],
          }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute inset-0 rounded-full bg-[#FF9500]/40 blur-3xl -z-10"
        />

        {/* Коробка */}
        <motion.img
          src={cover || '/box/box-front.png'}
          alt={name}
          animate={{ y: [0, -14, 0] }}
          transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}
          className="w-[260px] sm:w-[320px] md:w-[380px] h-auto select-none pointer-events-none"
          style={{ filter: 'drop-shadow(0 30px 50px rgba(120,60,0,0.4))' }}
        />

        {/* Тень под коробкой */}
        <motion.span
          animate={{ scaleX: [1, 0.85, 1], opacity: [0.35, 0.55, 0.35] }}
          transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute left-1/2 -bottom-2 h-4 w-[60%] -translate-x-1/2 rounded-[50%] bg-[#7A3D00]/30 blur-md"
        />
      </motion.button>

      {/* Подпись */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="mt-12 text-center text-[12px] uppercase tracking-[0.32em] font-bold text-[#B87400]"
      >
        Нажми, чтобы открыть
      </motion.p>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.5 }}
        className="mt-2 text-[10px] uppercase tracking-[0.25em] text-zinc-400"
      >
        Space / Enter — быстрый тап
      </motion.p>
    </motion.div>
  );
}