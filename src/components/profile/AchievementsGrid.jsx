// src/components/profile/AchievementsGrid.jsx
import { motion } from 'framer-motion';
import AchievementCard from './AchievementCard';

const EASE = [0.22, 1, 0.36, 1];

export default function AchievementsGrid({ achievements }) {
  const earned = achievements.filter(a => a.earned).length;
  const total = achievements.length;

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: EASE }}
      className="relative"
    >
      {/* Заголовок */}
      <div className="flex items-end justify-between gap-4 mb-5">
        <div>
          <div className="inline-flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#E60012]" />
            <span className="text-[10px] uppercase tracking-[0.32em] font-black text-[#1A1A22]">
              Достижения
            </span>
          </div>
          <p className="mt-2 text-[11px] text-zinc-400 font-medium">
            Награды за прогресс в коллекции
          </p>
        </div>

        {/* Счётчик */}
        <div className="text-right shrink-0">
          <div className="font-heading font-black text-[26px] leading-none tabular-nums text-[#1A1A22]">
            {earned}
            <span className="text-[16px] text-zinc-300 mx-0.5">/</span>
            <span className="text-[16px] text-zinc-400">{total}</span>
          </div>
          <div className="mt-1 text-[9px] uppercase tracking-[0.24em] font-black text-zinc-400">
            получено
          </div>
        </div>
      </div>

      {/* Сетка */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {achievements.map((a, i) => (
          <AchievementCard key={a.id} achievement={a} index={i} />
        ))}
      </div>
    </motion.section>
  );
}