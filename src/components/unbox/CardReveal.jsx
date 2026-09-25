// src/components/unbox/CardReveal.jsx
import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { getRarity } from '@/data/rarity';
import { getDuplicateMessage } from '@/data/duplicates';
import { getNewMessage } from '@/data/newMessages';

const EASE = [0.22, 1, 0.36, 1];

export default function CardReveal({ result, onNext }) {
  const rarity = getRarity(result.rarity);

  const message = useMemo(() => {
    return result.isNew
      ? getNewMessage(result.rarity)
      : getDuplicateMessage(result.rarity);
  }, [result.id, result.rarity, result.isNew]);

  return (
    <motion.div
      initial={{ opacity: 0, rotateY: -90, scale: 0.85 }}
      animate={{ opacity: 1, rotateY: 0, scale: 1 }}
      exit={{ opacity: 0, rotateY: 90, scale: 0.85 }}
      transition={{ duration: 0.7, ease: EASE }}
      className="relative flex flex-col items-center isolate"
      style={{ perspective: 1200, transformStyle: 'preserve-3d' }}
    >
      {/* Свечение под карточкой — ограниченное, на -z-10 */}
      <div
        aria-hidden
        className="absolute left-1/2 top-1/2 w-[380px] h-[380px]
                   -translate-x-1/2 -translate-y-1/2
                   rounded-full blur-[90px] opacity-60 pointer-events-none -z-10"
        style={{ background: rarity.glow }}
      />

      {/* Кликабельная карточка */}
      <motion.button
        onClick={onNext}
        whileHover={{ scale: 1.02, y: -4 }}
        whileTap={{ scale: 0.98 }}
        className="relative z-10 cursor-pointer group"
      >
        {result.card ? (
          <img
            src={result.card}
            alt={result.name}
            className="w-[260px] sm:w-[320px] md:w-[360px] h-auto select-none
                       transition-transform duration-300 group-hover:scale-[1.02]"
            style={{ filter: 'drop-shadow(0 30px 55px rgba(120,60,0,0.45))' }}
          />
        ) : (
          <div className="w-[260px] sm:w-[320px] md:w-[360px] aspect-[3/4]
                          rounded-3xl bg-[linear-gradient(160deg,#FFD24C,#FF6B00)]
                          shadow-2xl flex items-center justify-center">
            <span className="text-white font-heading font-black text-4xl text-center px-6">
              {result.name}
            </span>
          </div>
        )}

        {/* Тонкая пульсирующая рамка — не перекрывает контент */}
        <motion.span
          animate={{ opacity: [0, 0.7, 0], scale: [1, 1.06, 1] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
          aria-hidden
          className="absolute inset-0 rounded-[24px] border border-white/60 pointer-events-none"
        />
      </motion.button>

      {/* Подсказка под карточкой */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.5, ease: EASE }}
        className="relative z-10 mt-8 flex flex-col items-center gap-3"
      >
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full
                        bg-white/70 border border-[#F0E4D2] backdrop-blur-sm">
          <motion.span
            animate={{ scale: [1, 1.3, 1], opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.6, repeat: Infinity }}
            className="w-1.5 h-1.5 rounded-full bg-[#FF9500]"
          />
          <span className="text-[10px] font-black uppercase tracking-[0.28em] text-[#B87400]">
            Нажми на карточку
          </span>
        </div>
      </motion.div>

      {/* Бейдж NEW */}
      {result.isNew && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.6 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: 0.4, duration: 0.5, ease: EASE }}
          className="relative z-10 mt-4 inline-flex items-center gap-2
                     px-4 py-2 rounded-full bg-[#1E7A44] text-white
                     text-[10px] font-black uppercase tracking-[0.22em]
                     shadow-[0_10px_20px_-10px_rgba(30,122,68,0.7)]"
        >
          <span>✦</span>
          Новая фигурка
        </motion.div>
      )}

      {/* Сообщение — на верхнем слое, читаемое */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.5, ease: EASE }}
        className={`relative z-10 mt-5 max-w-md px-6 py-3.5 rounded-2xl
                    border-2 backdrop-blur-md
                    ${
                      result.isNew
                        ? 'bg-[#E7F7EC]/95 border-[#1E7A44]/25'
                        : 'bg-[#FFF6E0]/95 border-[#F5C97A]/40'
                    }`}
      >
        <p
          className={`text-[13.5px] italic text-center leading-snug font-medium
                     ${result.isNew ? 'text-[#1E7A44]' : 'text-[#9A6A00]'}`}
        >
          «{message}»
        </p>
      </motion.div>
    </motion.div>
  );
}