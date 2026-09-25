// src/components/collection/CollectionProgress.jsx
import { motion } from 'framer-motion';
import HoneycombDisplay from './HoneycombDisplay';

const EASE = [0.22, 1, 0.36, 1];

export default function CollectionProgress({
  collection,
  owned,
  ownedCount,
  onSelect,
}) {
  const total = collection.figures.length;
  const progress = total ? (ownedCount / total) * 100 : 0;
  const isComplete = ownedCount >= total;

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: EASE }}
      className="relative"
    >
      {/* Ленточка Pop Mart */}
      

      {/* Название + прогресс */}
      <div className="flex flex-wrap items-end justify-between gap-6">
        <h1 className="font-heading font-black text-[34px] sm:text-[46px] md:text-[56px]
                       tracking-[-0.035em] leading-[0.95] text-[#1A1A22]">
          {collection.name}
        </h1>

        <div className="flex items-center gap-4">
          <div className="flex items-baseline gap-1.5 font-heading leading-none">
            <span className="text-[32px] sm:text-[38px] font-black tabular-nums text-[#1A1A22]">
              {ownedCount}
            </span>
            <span className="text-[20px] font-bold text-zinc-300">/</span>
            <span className="text-[22px] font-bold text-zinc-400">{total}</span>
          </div>

          {isComplete ? (
            <div className="inline-flex items-center gap-2 px-4 py-2
                            rounded-full bg-[#1E7A44] text-white
                            text-[10px] font-black uppercase tracking-[0.22em]
                            shadow-[0_10px_20px_-8px_rgba(30,122,68,0.6)]">
              Собрано
            </div>
          ) : (
            <span className="text-[11px] font-black uppercase tracking-[0.24em]
                             text-zinc-400 tabular-nums pb-1">
              {Math.round(progress)}%
            </span>
          )}
        </div>
      </div>

      {/* Соты — слева, крупнее */}
      <div className="mt-14">
        <HoneycombDisplay
          figures={collection.figures}
          owned={owned}
          onSelect={onSelect}
        />
      </div>
    </motion.section>
  );
}