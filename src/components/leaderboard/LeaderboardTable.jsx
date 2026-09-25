// src/components/leaderboard/LeaderboardTable.jsx
import { motion } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import LeaderboardRow from './LeaderboardRow';

const EASE = [0.22, 1, 0.36, 1];

/* ─── Таблетка общей статистики ─── */
function StatPill({ label, value, color, accent }) {
  return (
    <div className="inline-flex items-center gap-2.5 px-4 py-2.5 rounded-2xl
                    bg-white/80 backdrop-blur-sm
                    border border-[#F0E4D2]
                    shadow-[0_8px_20px_-14px_rgba(120,60,0,0.35)]">
      <span
        className="w-2 h-2 rounded-full shrink-0"
        style={{ background: color }}
      />
      <span className="font-heading font-black text-[18px] leading-none
                       tabular-nums text-[#1A1A22]">
        {value}
      </span>
      <span className="text-[10px] uppercase tracking-[0.22em]
                       font-black text-zinc-400">
        {label}
      </span>
      {accent && <span className="text-[14px]">{accent}</span>}
    </div>
  );
}

export default function LeaderboardTable({ rows, breakdown, lastEvents }) {
  const { user } = useAuth();

  /* Общая статистика */
  const totalPulls = rows.reduce((s, r) => s + (Number(r.total_pulls) || 0), 0);
  const totalSecrets = rows.reduce((s, r) => s + (Number(r.secret_count) || 0), 0);
  const fullCollections = rows.filter((r) => Number(r.unique_count) >= 12).length;

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: EASE }}
      className="relative"
    >
      {/* ─── Заголовок + общая статистика ─── */}
      <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
        <div>
          <div className="inline-flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#E60012]" />
            <span className="text-[10px] uppercase tracking-[0.32em]
                             font-black text-[#1A1A22]">
              Турнирная таблица
            </span>
          </div>
          <p className="mt-2 text-[11px] text-zinc-400 font-medium">
            Клик по игроку — разбивка по редкостям
          </p>
        </div>

        {/* Таблетки со статистикой */}
        <div className="flex flex-wrap items-center gap-2">
          <StatPill label="открытий" value={totalPulls} color="#FF9500" />
          <StatPill
            label="секреток"
            value={totalSecrets}
            color="#B87400"
            accent={totalSecrets > 0 ? '✦' : null}
          />
          <StatPill
            label="собрано"
            value={`${fullCollections}/${rows.length}`}
            color="#1E7A44"
            accent={fullCollections > 0 ? '🏆' : null}
          />
        </div>
      </div>

      {/* ─── Карточка с таблицей ─── */}
      <div className="rounded-[28px] bg-white/80 backdrop-blur-sm
                      border border-[#F0E4D2]
                      shadow-[0_32px_80px_-40px_rgba(120,60,0,0.45)]
                      overflow-hidden">

        {/* Шапка таблицы — только на десктопе */}
        <div className="hidden sm:grid grid-cols-[64px_1fr_130px_90px_110px] gap-3
                        px-6 py-4
                        text-[9px] uppercase tracking-[0.28em] font-black text-zinc-400
                        border-b border-[#F0E4D2]
                        bg-[linear-gradient(180deg,#FFF9F0_0%,#FFF6EA_100%)]">
          <span className="pl-2">#</span>
          <span>Игрок</span>
          <span>Прогресс</span>
          <span className="text-center">Секретки</span>
          <span className="text-right">Очков</span>
        </div>

        {/* Строки */}
        <div className="divide-y divide-[#F5EBD8]">
          {rows.map((row, i) => (
            <LeaderboardRow
              key={row.id}
              row={row}
              rank={i + 1}
              isMe={row.login === user?.login}
              breakdown={breakdown?.[row.id]}
              lastEvent={lastEvents?.[row.id]}
            />
          ))}
        </div>
      </div>
    </motion.section>
  );
}