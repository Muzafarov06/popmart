// src/components/unbox/FigureReveal.jsx
import { useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getRarity } from '@/data/rarity';
import { getDuplicateMessage } from '@/data/duplicates';
import { getNewMessage } from '@/data/newMessages';
import { fireConfetti } from '@/lib/confetti';

const EASE = [0.22, 1, 0.36, 1];

export default function FigureReveal({ result, collectionId, onAgain }) {
  const rarity = getRarity(result.rarity);
  const isNew = result.isNew;
  const isLegendary = result.rarity === 'S' || result.rarity === 'SS+';

  const message = useMemo(
    () => (isNew ? getNewMessage(result.rarity) : getDuplicateMessage(result.rarity)),
    [result.id, result.rarity, isNew],
  );

  const nameWords = useMemo(() => result.name.split(' '), [result.name]);

  useEffect(() => {
    if (!isNew && !isLegendary) return;
    const t = setTimeout(() => fireConfetti(result.rarity), 250);
    return () => clearTimeout(t);
  }, [result.rarity, isNew, isLegendary]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.7, ease: EASE }}
      onClick={onAgain}
      className="relative flex flex-col items-center text-center isolate
                 cursor-pointer select-none w-full"
    >
      {/* Свечение */}
      <div
        aria-hidden
        className="absolute top-[42%] left-1/2 -translate-x-1/2
                   w-[420px] h-[420px] rounded-full
                   blur-[110px] opacity-40 pointer-events-none -z-10"
        style={{ background: rarity.glow }}
      />

      {/* ═══ Фигурка со стикером «Новая фигурка» ═══ */}
      <motion.div
        initial={{ scale: 0.7, y: 40 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ duration: 0.8, ease: EASE }}
        className="relative z-10"
      >
        {/* Зелёный стикер — слева-сверху, без рамки */}
        {isNew && (
          <motion.div
            initial={{ opacity: 0, scale: 0.4, rotate: -20 }}
            animate={{ opacity: 1, scale: 1, rotate: -9 }}
            transition={{ delay: 0.4, duration: 0.5, ease: EASE }}
            className="absolute top-2 -left-3 sm:-left-8 z-20
                       inline-flex items-center gap-2
                       px-3.5 py-1.5 rounded-lg
                       bg-[#1E7A44] text-white
                       shadow-[0_12px_26px_-8px_rgba(30,122,68,0.7)]"
          >
            <motion.span
              animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }}
              transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
              className="w-2 h-2 rounded-full bg-white"
            />
            <span className="text-[10px] font-black uppercase tracking-[0.24em] whitespace-nowrap">
              New
            </span>
          </motion.div>
        )}

        <motion.img
          src={result.image}
          alt={result.name}
          className="w-[300px] sm:w-[380px] md:w-[440px] lg:w-[480px] h-auto select-none"
          style={{ filter: 'drop-shadow(0 34px 60px rgba(120,60,0,0.5))' }}
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
          draggable={false}
        />

        {/* Искры — только для новых */}
        {isNew &&
          [...Array(8)].map((_, i) => (
            <motion.span
              key={`n-${i}`}
              className="absolute text-[#FFB800] select-none pointer-events-none"
              style={{
                top: `${8 + ((i * 17) % 78)}%`,
                left: `${(i * 23) % 95}%`,
                fontSize: 8 + (i % 3) * 4,
              }}
              animate={{
                opacity: [0, 1, 0],
                scale: [0.5, 1.3, 0.5],
                rotate: [0, 180, 360],
              }}
              transition={{
                duration: 2.6,
                repeat: Infinity,
                delay: i * 0.35,
                ease: 'easeInOut',
              }}
            >
              ✦
            </motion.span>
          ))}

        {/* Искры — для легендарных, даже если повтор */}
        {!isNew && isLegendary &&
          [...Array(6)].map((_, i) => (
            <motion.span
              key={`l-${i}`}
              className="absolute text-[#FFB800] text-lg select-none pointer-events-none"
              style={{
                top: `${10 + ((i * 15) % 70)}%`,
                left: `${(i * 40) % 90}%`,
              }}
              animate={{
                opacity: [0, 0.9, 0],
                scale: [0.6, 1.3, 0.6],
                rotate: [0, 180, 360],
              }}
              transition={{
                duration: 2.5,
                repeat: Infinity,
                delay: i * 0.3,
                ease: 'easeInOut',
              }}
            >
              ✦
            </motion.span>
          ))}
      </motion.div>

      {/* ═══ Имя + плашка ранга справа-сверху ═══ */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.55, duration: 0.6, ease: EASE }}
        className="relative z-10 mt-5 inline-block min-w-[220px] px-10"
      >
        {/* Плашка ранга — больше и без рамки */}
        <motion.span
          initial={{ opacity: 0, scale: 0.3, rotate: 15 }}
          animate={{ opacity: 1, scale: 1, rotate: -7 }}
          transition={{ delay: 0.9, duration: 0.5, ease: EASE }}
          className="absolute -top-6 right-0 z-20
                     inline-flex items-center justify-center
                     w-12 h-12 rounded-xl
                     shadow-[0_12px_26px_-8px_rgba(120,60,0,0.5)]"
          style={{ background: rarity.color }}
        >
          <span className="font-heading font-black text-[22px] leading-none text-white">
            {rarity.id}
          </span>
        </motion.span>

        {/* Имя по центру */}
        <h2
          className="font-heading font-black
                     text-[36px] sm:text-[48px] tracking-[-0.035em]
                     leading-[0.95] text-[#1A1A22] text-center"
        >
          {nameWords.map((word, i) => (
            <motion.span
              key={`${word}-${i}`}
              initial={{ opacity: 0, y: 26, filter: 'blur(10px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              transition={{ delay: 0.6 + i * 0.07, duration: 0.65, ease: EASE }}
              className="inline-block mr-[0.28em] last:mr-0"
            >
              {word}
            </motion.span>
          ))}
        </h2>
      </motion.div>

      {/* ═══ Цитата — белая плашка с кавычкой ═══ */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.1, duration: 0.5, ease: EASE }}
        className="relative z-10 mt-11 max-w-md w-full px-6"
      >
        <div className="relative rounded-2xl bg-white px-7 py-6
                        shadow-[0_18px_40px_-22px_rgba(120,60,0,0.4)]">
          <span
            aria-hidden
            className="absolute -top-4 left-5
                       font-heading font-black leading-none select-none"
            style={{
              fontSize: 42,
              color: '#E0B876',
            }}
          >
            "
          </span>

          <p className="text-[15px] sm:text-[16px] italic text-center
                        leading-relaxed text-[#1A1A22] font-medium">
            {message}
          </p>
        </div>
      </motion.div>

      {/* ═══ «В коллекцию» ═══ */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.4, duration: 0.6, ease: EASE }}
        className="relative z-20 mt-12 mb-4"
        onClick={(e) => e.stopPropagation()}
      >
        <Link
          to={`/collection/${collectionId}`}
          className="inline-flex items-center gap-1
                     text-[11px] uppercase tracking-[0.28em] font-medium
                     text-zinc-400 hover:text-[#B87400] transition-colors"
        >
          В коллекцию
          <span className="text-[13px] leading-none">→</span>
        </Link>
      </motion.div>
    </motion.div>
  );
}