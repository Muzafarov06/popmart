// src/components/profile/AchievementsGrid.jsx
import { motion } from 'framer-motion';
import AchievementCard from './AchievementCard';

const EASE = [0.22, 1, 0.36, 1];

export default function AchievementsGrid({ achievements }) {
  const earned = achievements.filter((a) => a.earned).length;
  const total = achievements.length;

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: EASE }}
      className="relative"
    >
      {/* Заголовок */}
      <div className="flex items-end justify-between gap-4 mb-4">
        <div>
          <div className="inline-flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#E60012]" />
            <span className="text-[10px] uppercase tracking-[0.32em]
                             font-black text-[#1A1A22]">
              Достижения
            </span>
          </div>
        </div>

        {/* Счётчик */}
        <div className="flex items-baseline gap-1.5">
          <span className="font-heading font-black text-[22px]
                           leading-none tabular-nums text-[#1A1A22]">
            {earned}
          </span>
          <span className="font-heading font-black text-[14px]
                           text-zinc-300 tabular-nums">
            / {total}
          </span>
        </div>
      </div>

      {/* Прогресс-линия */}
      <div className="h-1 rounded-full bg-[#EFE1CC] overflow-hidden mb-5">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${(earned / total) * 100}%` }}
          transition={{ duration: 0.6, ease: EASE }}
          className="h-full rounded-full
                     bg-[linear-gradient(90deg,#FFB800,#FF6B00)]"
        />
      </div>

      {/* Сетка */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2.5">
        {achievements.map((a, i) => (
          <AchievementCard key={a.id} achievement={a} index={i} />
        ))}
      </div>
    </motion.section>
  );
}