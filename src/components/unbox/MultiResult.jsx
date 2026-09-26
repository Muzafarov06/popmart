// src/components/unbox/MultiResult.jsx
import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getRarity } from '@/data/rarity';

const EASE = [0.22, 1, 0.36, 1];

function getCardWidth(total) {
  if (total === 1) return 'w-48 sm:w-56 md:w-64';
  if (total === 2) return 'w-40 sm:w-48 md:w-56';
  if (total === 3) return 'w-32 sm:w-40 md:w-48 lg:w-56';
  if (total <= 5)  return 'w-28 sm:w-36 md:w-44 lg:w-52';
  if (total <= 8)  return 'w-24 sm:w-32 md:w-40 lg:w-48';
  return 'w-20 sm:w-28 md:w-36 lg:w-44';
}

export default function MultiResult({ results, newCount = 0, collectionId, onClose }) {
  const uniqueCount = useMemo(
    () => new Set(results.map((r) => r.id)).size,
    [results]
  );

  const total = results.length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.6, ease: EASE }}
      onClick={onClose}
      className="flex flex-col items-center w-full
                 cursor-pointer select-none"
    >
      {/* ═══ Заголовок ═══ */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: EASE }}
        className="flex flex-col items-center gap-3"
      >
        

        {/* Заголовок */}
        <h2 className="font-heading font-black text-[28px] sm:text-[36px] md:text-[42px]
                       tracking-[-0.035em] leading-[1.05] text-[#1A1A22] text-center">
          {newCount > 0
            ? newCount === 1
              ? 'Одна новая!'
              : `${newCount} новых!`
            : 'Все повторки'}
        </h2>
      </motion.div>

      {/* ═══ Таблетки статистики ═══ */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.5 }}
        className="mt-5 flex items-center gap-2 flex-wrap justify-center"
      >
        <StatPill label="новых" value={newCount} color="#1E7A44" />
        <StatPill label="уникальных" value={uniqueCount} color="#B87400" />
        <StatPill label="всего" value={total} color="#52525b" />
      </motion.div>

      {/* ═══ Сетка карточек ═══ */}
      <div
        className="mt-10 w-full flex flex-wrap justify-center items-start
                   gap-3 sm:gap-4 max-h-[55vh] overflow-y-auto
                   px-2 pb-2
                   [scrollbar-width:none]
                   [&::-webkit-scrollbar]:hidden"
      >
        {results.map((result, i) => {
          const rarity = getRarity(result.rarity);
          const isNew = result.isNew;

          return (
            <motion.div
              key={`${result.id}-${i}`}
              initial={{ opacity: 0, scale: 0.7, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{
                duration: 0.4,
                delay: Math.min(i * 0.06, 0.6),
                ease: EASE,
              }}
              className={`
                ${getCardWidth(total)}
                relative overflow-hidden aspect-[3/4] shrink-0
                rounded-2xl
                shadow-[0_16px_32px_-16px_rgba(120,60,0,0.4)]
                ${isNew ? 'ring-2 ring-[#1E7A44]' : 'ring-1 ring-[#E7D5BC]/60'}
              `}
            >
              {/* Карточка */}
              {result.card ? (
                <img
                  src={result.card}
                  alt={result.name}
                  className="absolute inset-0 w-full h-full object-cover select-none"
                  loading="lazy"
                  draggable={false}
                />
              ) : (
                <div
                  className="absolute inset-0 flex items-center justify-center p-2"
                  style={{ background: `${rarity.color}15` }}
                >
                  <span className="font-heading font-black text-[10px] sm:text-xs
                                   text-center leading-tight text-[#1A1A22]">
                    {result.name}
                  </span>
                </div>
              )}

              {/* Бейдж NEW — маленький, справа-сверху */}
              {isNew && (
                <motion.span
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.4 + i * 0.06, duration: 0.3 }}
                  className="absolute top-2 right-2 z-10
                             inline-flex items-center gap-1
                             px-2 py-0.5 rounded-md
                             bg-[#1E7A44] text-white
                             text-[7px] sm:text-[8px] font-black uppercase
                             tracking-[0.18em]
                             shadow-[0_6px_14px_-6px_rgba(30,122,68,0.9)]"
                >
                  <span className="w-1 h-1 rounded-full bg-white animate-pulse" />
                  New
                </motion.span>
              )}

              {/* Цветная полоска редкости снизу */}
              <span
                aria-hidden
                className="absolute bottom-0 left-0 right-0 h-1.5 pointer-events-none z-10"
                style={{ background: rarity.color }}
              />
            </motion.div>
          );
        })}
      </div>

      {/* ═══ «В коллекцию» — тихая ссылка ═══ */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.6, ease: EASE }}
        className="mt-14 mb-4"
        onClick={(e) => e.stopPropagation()}
      >
        <Link
          to={collectionId ? `/collection/${collectionId}` : '/'}
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

/* ─── Таблетка статистики ─── */
function StatPill({ label, value, color }) {
  return (
    <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-full
                    bg-white/70 border border-[#F0E4D2] backdrop-blur-sm">
      <span
        className="w-1.5 h-1.5 rounded-full"
        style={{ background: color }}
      />
      <span className="text-[11px] font-black tabular-nums" style={{ color }}>
        {value}
      </span>
      <span className="text-[9px] uppercase tracking-[0.2em] text-zinc-400 font-semibold">
        {label}
      </span>
    </div>
  );
}