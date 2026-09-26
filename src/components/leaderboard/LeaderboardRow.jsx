// src/components/leaderboard/LeaderboardRow.jsx
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { findUserByLogin } from '@/data/users';
import { getRarity } from '@/data/rarity';

const EASE = [0.22, 1, 0.36, 1];

/* «2 мин назад» */
function humanTime(iso) {
  if (!iso) return '';
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (diff < 30)  return 'только что';
  if (diff < 60)  return `${diff} сек назад`;
  const m = Math.floor(diff / 60);
  if (m < 60)     return `${m} мин назад`;
  const h = Math.floor(m / 60);
  if (h < 24)     return `${h} ч назад`;
  const d = Math.floor(h / 24);
  if (d < 7)      return `${d} дн назад`;
  return new Date(iso).toLocaleDateString('ru-RU');
}

/* Цвет ранга */
function rankColor(rank) {
  if (rank === 1) return '#D4A017';
  if (rank === 2) return '#8B8B8B';
  if (rank === 3) return '#B87333';
  return '#D4D4D8';
}

export default function LeaderboardRow({
  row,
  rank,
  isMe,
  lastEvent,
  figures = [],
  collectionId,
  totalFiguresAll = 0,
}) {
  const meta = findUserByLogin(row.login);
  const emoji = meta?.emoji || '🐾';
  const color = meta?.color || '#FFB800';

  const points = Number(row.total_points) || 0;
  const uniqueCount = Number(row.unique_count) || 0;
  const secretCount = Number(row.secret_count) || 0;
  const ownedIds = Array.isArray(row.owned_figure_ids)
    ? row.owned_figure_ids.map(Number)
    : [];
  const ownedSet = new Set(ownedIds);

  const gridFigures = collectionId
    ? figures.filter((f) => !f.is_secret)
    : [];

  const collectionLegendary = collectionId
    ? figures.filter((f) => f.is_secret).length
    : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: rank * 0.04, ease: EASE }}
      className={`relative transition-colors
                  ${isMe ? 'bg-[#FFF9F0]' : 'hover:bg-[#FFF9F0]/60'}`}
    >
      {isMe && (
        <span
          aria-hidden
          className="absolute left-0 top-0 bottom-0 w-[3px]
                     bg-[linear-gradient(180deg,#FFB800,#FF6B00)]"
        />
      )}

      <Link
        to={`/profile/${row.login}`}
        className="block px-4 sm:px-5 py-4
                   focus:outline-none focus-visible:bg-[#FFF9F0]"
      >
        {/* ─── Верхняя строка ─── */}
        <div className="flex items-center gap-3 sm:gap-4">
          <span
            className="font-heading font-black text-[22px] sm:text-[26px]
                       tabular-nums w-8 text-center shrink-0 leading-none"
            style={{ color: rankColor(rank) }}
          >
            {rank}
          </span>

          <span className="relative shrink-0">
            <span
              aria-hidden
              className="absolute inset-0 rounded-full blur-[8px] opacity-50"
              style={{ background: color }}
            />
            <span
              className="relative w-10 h-10 sm:w-11 sm:h-11 rounded-full
                         flex items-center justify-center
                         text-[18px] sm:text-[20px] ring-2 ring-white
                         shadow-[0_4px_12px_-4px_rgba(0,0,0,0.3)]"
              style={{ background: `${color}2E` }}
            >
              {emoji}
            </span>
          </span>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="font-heading font-black text-[14px] sm:text-[15px]
                               text-[#1A1A22] truncate">
                {row.display_name}
              </span>
              {isMe && (
                <span className="text-[9px] uppercase tracking-[0.22em]
                                 font-black text-[#B87400] shrink-0">
                  · ты
                </span>
              )}
            </div>

            {lastEvent ? (
              <div className="text-[10.5px] text-zinc-400 truncate mt-0.5
                              flex items-center gap-1.5">
                <span
                  className="w-1.5 h-1.5 rounded-full shrink-0"
                  style={{ background: getRarity(lastEvent.rarity).color }}
                />
                <span className="truncate">
                  <span
                    className="font-black"
                    style={{ color: getRarity(lastEvent.rarity).color }}
                  >
                    {lastEvent.is_secret && '✦ '}
                    {lastEvent.figure_name}
                  </span>
                  <span className="text-zinc-300"> · </span>
                  <span>{humanTime(lastEvent.created_at)}</span>
                </span>
              </div>
            ) : (
              <div className="text-[10px] font-mono text-zinc-400 truncate mt-0.5">
                @{row.login}
              </div>
            )}
          </div>

          <span className="font-heading font-black text-[17px] sm:text-[20px]
                           tabular-nums text-[#1A1A22] shrink-0">
            {points.toLocaleString('ru-RU')}
          </span>
        </div>

        {/* ─── Сетка фигурок (только конкретная коллекция) ─── */}
        {collectionId && gridFigures.length > 0 && (
          <div className="mt-3 pl-11 sm:pl-12
                          flex items-center justify-between gap-3">
            <div className="flex items-center gap-1.5 flex-wrap">
              {gridFigures.map((f) => {
                const owned = ownedSet.has(Number(f.id));
                const r = getRarity(f.rarity);
                return (
                  <div
                    key={f.id}
                    title={owned ? f.name : '???'}
                    className={`relative w-7 h-7 sm:w-8 sm:h-8 rounded-full
                                overflow-hidden shrink-0 transition-all ${
                      owned
                        ? 'ring-2 ring-white bg-[#FFF1DC]'
                        : 'ring-1 ring-[#EADFCB]/70 bg-[#FAF3E6]'
                    }`}
                  >
                    <img
                      src={f.image}
                      alt=""
                      className={`w-full h-full object-cover ${
                        owned ? '' : 'grayscale opacity-30'
                      }`}
                      loading="lazy"
                      draggable={false}
                    />
                    {owned && (
                      <span
                        aria-hidden
                        className="absolute bottom-0 inset-x-0 h-[2px]"
                        style={{ background: r.color }}
                      />
                    )}
                  </div>
                );
              })}
            </div>

            {collectionLegendary > 0 && (
              <div
                className="shrink-0 inline-flex items-center gap-1.5
                           px-2.5 py-1 rounded-full
                           bg-[linear-gradient(110deg,#FFF6DC,#FFE9A8)]
                           border border-[#FFD24C]/60
                           shadow-[0_4px_12px_-6px_rgba(255,180,60,0.65)]"
              >
                <span className="text-[12px] leading-none">✦</span>
                <span className="font-heading font-black text-[11px]
                                 text-[#8B5A00] tabular-nums leading-none">
                  {secretCount}
                  <span className="text-[#8B5A00]/45 mx-0.5">/</span>
                  {collectionLegendary}
                </span>
              </div>
            )}
          </div>
        )}

        {/* ─── Сводка (режим «Все коллекции») ─── */}
        {!collectionId && (
          <div className="mt-3 pl-11 sm:pl-12
                          flex items-center gap-3 text-[12px] text-zinc-400 font-medium
                          flex-wrap">
            <span>
              <span className="font-heading font-black text-[#1A1A22] tabular-nums">
                {uniqueCount}
              </span>
              <span> / </span>
              <span className="tabular-nums">{totalFiguresAll}</span>
              <span> фигурок</span>
            </span>
            {secretCount > 0 && (
              <>
                <span className="w-1 h-1 rounded-full bg-zinc-300" />
                <span className="inline-flex items-center gap-1 font-black text-[#B87400]">
                  <span className="text-[11px] leading-none">✦</span>
                  <span className="tabular-nums">{secretCount}</span>
                  <span className="font-medium text-[#B87400]/70">легендарных</span>
                </span>
              </>
            )}
          </div>
        )}
      </Link>
    </motion.div>
  );
}