// src/components/unbox/CardReveal.jsx
import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { getRarity } from '@/data/rarity';
import { getDuplicateMessage } from '@/data/duplicates';
import { getNewMessage } from '@/data/newMessages';

const EASE = [0.22, 1, 0.36, 1];

export default function CardReveal({ result, onNext }) {
  const rarity = getRarity(result.rarity);
  const isNew = result.isNew;

  const message = useMemo(() => {
    return isNew
      ? getNewMessage(result.rarity)
      : getDuplicateMessage(result.rarity);
  }, [result.id, result.rarity, isNew]);

  return (
    <motion.div
      initial={{ opacity: 0, rotateY: -90, scale: 0.85 }}
      animate={{ opacity: 1, rotateY: 0, scale: 1 }}
      exit={{ opacity: 0, rotateY: 90, scale: 0.85 }}
      transition={{ duration: 0.7, ease: EASE }}
      className="relative flex flex-col items-center isolate"
      style={{ perspective: 1200, transformStyle: 'preserve-3d' }}
    >
      {/* Свечение под карточкой */}
      <div
        aria-hidden
        className="absolute left-1/2 top-[40%] w-[460px] h-[460px]
                   -translate-x-1/2 -translate-y-1/2
                   rounded-full blur-[110px] opacity-60 pointer-events-none -z-10"
        style={{ background: rarity.glow }}
      />

      {/* ═══ Карточка ═══ */}
      <motion.button
        onClick={onNext}
        whileHover={{ scale: 1.02, y: -4 }}
        whileTap={{ scale: 0.98 }}
        className="relative z-10 cursor-pointer group"
        aria-label="Дальше"
      >
        <img
          src={result.card}
          alt={result.name}
          className="w-[280px] sm:w-[340px] md:w-[400px] h-auto select-none
                     transition-transform duration-300 group-hover:scale-[1.02]"
          style={{ filter: 'drop-shadow(0 40px 70px rgba(120,60,0,0.5))' }}
          draggable={false}
        />

        {/* Пульсирующая рамка */}
        <motion.span
          animate={{ opacity: [0, 0.6, 0], scale: [1, 1.04, 1] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
          aria-hidden
          className="absolute inset-0 rounded-3xl border-2 border-white/60 pointer-events-none"
        />
      </motion.button>

      {/* ═══ Цитата ═══ */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.5, ease: EASE }}
        className="relative z-10 mt-8 max-w-md w-full px-6"
      >
        <div className="relative rounded-2xl bg-white/95 backdrop-blur-md
                        border border-[#F0E4D2]
                        shadow-[0_16px_40px_-20px_rgba(120,60,0,0.35)]
                        px-6 py-5">
          {/* Кавычка */}
          <span
            aria-hidden
            className="absolute -top-3 left-4 text-[44px] leading-none
                       font-heading font-black text-[#B87400] opacity-35 select-none"
          >
            "
          </span>

          <p className="text-[14px] sm:text-[15px] italic text-center
                        leading-relaxed text-[#1A1A22] font-medium">
            {message}
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}