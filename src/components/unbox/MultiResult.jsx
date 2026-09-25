// src/components/unbox/MultiResult.jsx
import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { getRarity } from '@/data/rarity';

const EASE = [0.22, 1, 0.36, 1];

function getCardWidth(total) {
  if (total <= 3)  return 'w-32 sm:w-40 md:w-48';
  if (total <= 6)  return 'w-24 sm:w-32 md:w-40';
  if (total <= 8)  return 'w-20 sm:w-28 md:w-36';
  if (total <= 12) return 'w-16 sm:w-24 md:w-32';
  if (total <= 20) return 'w-14 sm:w-20 md:w-28';
  if (total <= 40) return 'w-12 sm:w-16 md:w-24';
  return 'w-10 sm:w-14 md:w-20';
}

export default function MultiResult({ results, newCount = 0, onClose }) {
  const uniqueCount = useMemo(
    () => new Set(results.map((r) => r.id)).size,
    [results]
  );

  const enhanced = useMemo(() => {
    const seen = new Set();
    return results.map((r) => {
      const firstInBatch = !seen.has(r.id);
      seen.add(r.id);
      return { ...r, firstInBatch };
    });
  }, [results]);

  const cardWidth = getCardWidth(results.length);
  const total = results.length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.6, ease: EASE }}
      className="flex flex-col items-center w-full"
    >
      {/* Заголовок — аккуратный, POP MART-стиль */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: EASE }}
        className="flex flex-col items-center gap-3"
      >


        <h2 className="font-heading font-black text-[30px] sm:text-[40px] md:text-[48px]
                       tracking-[-0.035em] leading-[1.05] text-[#1A1A22] text-center">
          {newCount > 0
            ? newCount === 1
              ? 'Одна новая!'
              : `+${newCount} новых!`
            : 'Все повторки'}
        </h2>

        <p className="text-[11px] uppercase tracking-[0.3em] text-zinc-400 font-bold text-center">
          {newCount > 0
            ? 'Новые просмотрены — вот что ты выбил'
            : 'Ничего нового, но прогресс копится'}
        </p>
      </motion.div>

      {/* Статистика — в таблетках */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="mt-6 flex items-center gap-2 flex-wrap justify-center"
      >
        <StatPill label="Новых" value={newCount} color="#1E7A44" />
        <StatPill label="Уникальных" value={uniqueCount} color="#B87400" />
        <StatPill label="Всего" value={total} color="#52525b" />
      </motion.div>

      {/* Сетка карточек */}
      <div
        className="mt-10 w-full flex flex-wrap justify-center items-start
                   gap-2 sm:gap-3 max-h-[55vh] overflow-y-auto overflow-x-hidden
                   px-2 pb-2"
        style={{ scrollbarWidth: 'thin' }}
      >
        {enhanced.map((result, i) => {
          const rarity = getRarity(result.rarity);
          const isNew = result.isNew;
          const isFirstInBatch = result.firstInBatch;

          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.7 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{
                duration: 0.35,
                delay: Math.min(i * 0.015, 1),
                ease: EASE,
              }}
              className={`
                ${cardWidth}
                relative overflow-hidden aspect-[3/4] shrink-0
                rounded-xl sm:rounded-2xl
                ${
                  isNew
                    ? 'ring-2 ring-[#1E7A44] shadow-[0_12px_24px_-12px_rgba(30,122,68,0.6)]'
                    : isFirstInBatch
                    ? 'ring-1 ring-[#E7D5BC] shadow-[0_6px_12px_-6px_rgba(120,60,0,0.25)]'
                    : 'ring-1 ring-[#E7D5BC]/50 opacity-60'
                }
              `}
              style={{
                background: `linear-gradient(160deg, ${rarity.color}10, ${rarity.color}25)`,
              }}
            >
              {result.card ? (
                <img
                  src={result.card}
                  alt={result.name}
                  className="absolute inset-0 w-full h-full object-cover select-none"
                  loading="lazy"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center p-2">
                  <span className="font-heading font-black text-[10px] sm:text-xs text-center leading-tight">
                    {result.name}
                  </span>
                </div>
              )}

              {/* NEW бейдж — статичный, без пульсации */}
              {isNew && (
                <span
                  className="absolute top-1 right-1 px-1.5 py-0.5 rounded-md
                             bg-[#1E7A44] text-white text-[7px] sm:text-[8px]
                             font-black tracking-wider shadow-md z-10"
                >
                  NEW
                </span>
              )}

              {/* Полоска редкости снизу */}
              <span
                aria-hidden
                className="absolute bottom-0 left-0 right-0 h-1 pointer-events-none z-10"
                style={{ background: rarity.color }}
              />
            </motion.div>
          );
        })}
      </div>

      {/* Кнопка */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.5 }}
        className="mt-10 w-full max-w-sm"
      >
        <button
          onClick={onClose}
          className="pm-btn group relative w-full overflow-hidden rounded-2xl
                     bg-[linear-gradient(90deg,#FFB800,#FF9500_50%,#FF6B00)]
                     py-4 font-heading text-[12px] font-black uppercase tracking-[0.22em] text-white
                     shadow-[0_14px_30px_-12px_rgba(255,140,0,0.9)]
                     hover:shadow-[0_20px_40px_-12px_rgba(255,140,0,1)]
                     transition-shadow"
        >
          <span className="relative z-10">Ещё раз</span>
          <span
            aria-hidden
            className="pm-shine absolute inset-y-0 -left-1/3 w-1/3 bg-white/40 blur-md"
          />
        </button>
      </motion.div>
    </motion.div>
  );
}

/* ─── Таблетка статистики ─── */
function StatPill({ label, value, color }) {
  return (
    <div
      className="inline-flex items-center gap-2 px-3.5 py-2 rounded-full
                 bg-white/70 border border-[#F0E4D2] backdrop-blur-sm"
    >
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