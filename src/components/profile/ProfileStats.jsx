// src/components/profile/ProfileStats.jsx
import { motion } from 'framer-motion';

const EASE = [0.22, 1, 0.36, 1];

function Stat({ label, value, suffix, accent, dark }) {
  if (dark) {
    return (
      <div className="relative rounded-2xl p-5 bg-[#1A1A22] text-white overflow-hidden">
        <span
          aria-hidden
          className="absolute inset-x-0 top-0 h-1"
          style={{ background: accent || 'rgba(255,255,255,0.2)' }}
        />
        <div className="text-[9px] uppercase tracking-[0.28em] font-black text-white/55">
          {label}
        </div>
        <div className="mt-2 font-heading font-black text-[30px] leading-none tabular-nums text-white">
          {value}
          {suffix && (
            <span className="text-[14px] ml-1 text-white/40">{suffix}</span>
          )}
        </div>
      </div>
    );
  }
  return (
    <div className="relative rounded-2xl p-5 bg-white border border-[#F0E4D2] overflow-hidden">
      {accent && (
        <span
          aria-hidden
          className="absolute inset-x-0 top-0 h-1"
          style={{ background: accent }}
        />
      )}
      <div className="text-[9px] uppercase tracking-[0.28em] font-black text-zinc-400">
        {label}
      </div>
      <div className="mt-2 font-heading font-black text-[30px] leading-none tabular-nums text-[#1A1A22]">
        {value}
        {suffix && (
          <span className="text-[14px] ml-1 text-zinc-300">{suffix}</span>
        )}
      </div>
    </div>
  );
}

export default function ProfileStats({ stats }) {
  const figurePoints = Number(stats.figure_points) || 0;
  const achPoints = Number(stats.achievement_points) || 0;
  const totalPoints = Number(stats.total_points) || 0;

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1, ease: EASE }}
      className="space-y-3"
    >
      {/* ─── Верхний ряд: 4 плитки базовой статистики ─── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Stat
          label="Уникальных"
          value={stats.unique_count}
          suffix="/ 12"
        />
        <Stat
          label="Открытий"
          value={stats.total_pulls}
        />
        <Stat
          label="Секреток"
          value={stats.secret_count}
          accent={Number(stats.secret_count) > 0 ? '#B87400' : null}
        />
        <Stat
          label="Достижений"
          value={stats.achievement_count || 0}
          suffix="/ 15"
          accent="#FFB800"
        />
      </div>

      {/* ─── Разбивка очков ─── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2, ease: EASE }}
        className="rounded-2xl bg-white border border-[#F0E4D2] p-5
                   shadow-[0_12px_28px_-16px_rgba(120,60,0,0.35)]"
      >
        <div className="flex items-center gap-2 mb-4">
          <span className="w-2 h-2 rounded-full bg-[#E60012]" />
          <span className="text-[10px] uppercase tracking-[0.32em]
                           font-black text-[#1A1A22]">
            Очки
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* За фигурки */}
          <div className="rounded-2xl p-4 bg-[#FFF6EA] border border-[#F0E4D2]">
            <div className="flex items-center gap-1.5">
              <span className="text-[9px] uppercase tracking-[0.24em]
                               font-black text-zinc-500">
                За фигурки
              </span>
            </div>
            <div className="mt-2 font-heading font-black text-[26px]
                            leading-none tabular-nums text-[#1A1A22]">
              {figurePoints.toLocaleString('ru-RU')}
            </div>
          </div>

          {/* За ачивки */}
          <div className="rounded-2xl p-4 bg-[#FFF9E8] border border-[#FFD24C]/40
                          relative overflow-hidden">
            <span
              aria-hidden
              className="absolute inset-x-0 top-0 h-[2px]
                         bg-[linear-gradient(90deg,transparent,#FFB800,transparent)]"
            />
            <div className="flex items-center gap-1.5">
              <span className="text-[9px] uppercase tracking-[0.24em]
                               font-black text-[#B87400]">
                За достижения
              </span>
            </div>
            <div className="mt-2 font-heading font-black text-[26px]
                            leading-none tabular-nums text-[#B87400]">
              {achPoints.toLocaleString('ru-RU')}
            </div>
          </div>

          {/* Всего */}
          <div className="rounded-2xl p-4 bg-[#1A1A22] text-white
                          relative overflow-hidden">
            <span
              aria-hidden
              className="absolute inset-x-0 top-0 h-[2px]
                         bg-[linear-gradient(90deg,#FFB800,#FF6B00)]"
            />
            <div className="flex items-center gap-1.5">
              <span className="text-[9px] uppercase tracking-[0.24em]
                               font-black text-white/55">
                Всего
              </span>
            </div>
            <div className="mt-2 font-heading font-black text-[26px]
                            leading-none tabular-nums text-white">
              {totalPoints.toLocaleString('ru-RU')}
            </div>
          </div>
        </div>
      </motion.div>
    </motion.section>
  );
}