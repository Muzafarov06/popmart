// src/components/leaderboard/LeaderboardRow.jsx
import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { findUserByLogin } from '@/data/users';
import { getRarity } from '@/data/rarity';
import RankBadge from './RankBadge';

const EASE = [0.22, 1, 0.36, 1];

const RARITY_ORDER = ['D', 'C', 'B', 'A', 'S', 'SS+'];
const TOTAL_FIGURES = 12;

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

/* ─── Прогресс-бар: 12 сегментов ─── */
function ProgressBar({ value, max = TOTAL_FIGURES, isComplete }) {
  return (
    <div className="flex items-center gap-1.5">
      <div className="flex items-center gap-[2px]">
        {Array.from({ length: max }).map((_, i) => {
          const filled = i < value;
          return (
            <motion.span
              key={i}
              initial={{ scaleY: 0.4, opacity: 0 }}
              animate={{ scaleY: 1, opacity: 1 }}
              transition={{ duration: 0.25, delay: i * 0.02, ease: EASE }}
              className={`h-1.5 w-1.5 rounded-full origin-center ${
                filled
                  ? isComplete
                    ? 'bg-[linear-gradient(90deg,#FFD24C,#FF9500)] shadow-[0_0_4px_rgba(255,180,0,0.6)]'
                    : 'bg-[#FF9500]'
                  : 'bg-[#EFE1CC]'
              }`}
            />
          );
        })}
      </div>
      <span className="font-heading font-black text-[13px] tabular-nums shrink-0">
        <span className="text-[#1A1A22]">{value}</span>
        <span className="text-zinc-300 mx-[1px]">/</span>
        <span className="text-zinc-400">{max}</span>
      </span>
    </div>
  );
}

export default function LeaderboardRow({
  row,
  rank,
  isMe,
  breakdown,
  lastEvent,
}) {
  const [open, setOpen] = useState(false);
  const meta = findUserByLogin(row.login);
  const emoji = meta?.emoji || '🐾';
  const color = meta?.color || '#FFB800';

  const totalPoints = Number(row.total_points) || 0;
  const totalUniq = Number(row.unique_count) || 0;
  const secretCount = Number(row.secret_count) || 0;
  const isComplete = totalUniq >= TOTAL_FIGURES;

  const lastRarity = lastEvent ? getRarity(lastEvent.rarity) : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: rank * 0.05, ease: EASE }}
      className={`relative transition-colors ${
        isMe ? 'bg-[#FFF9F0]' : 'hover:bg-[#FFF9F0]/70'
      }`}
    >
      {/* Полоска слева — у себя золотая, у лидера оранжевая */}
      {(isMe || rank === 1) && (
        <span
          aria-hidden
          className="absolute left-0 top-0 bottom-0 w-[3px]"
          style={{
            background: isComplete
              ? 'linear-gradient(180deg,#FFD24C,#FF6B00)'
              : isMe
              ? 'linear-gradient(180deg,#FFB800,#FF6B00)'
              : '#FF9500',
          }}
        />
      )}

      {/* Мягкое свечение для полного сбора */}
      {isComplete && (
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-30"
          style={{
            background:
              'linear-gradient(90deg, rgba(255,210,76,0.35) 0%, transparent 40%)',
          }}
        />
      )}

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full text-left relative z-10"
      >
        {/* ═══ Мобильная раскладка ═══ */}
        <div className="sm:hidden px-4 py-4 flex items-center gap-3">
          {/* Ранг */}
          <RankBadge rank={rank} size="sm" />

          {/* Аватарка со свечением */}
          <div className="relative shrink-0">
            <span
              aria-hidden
              className="absolute inset-0 rounded-full blur-[8px] opacity-50"
              style={{ background: color }}
            />
            <span
              className="relative w-11 h-11 rounded-full flex items-center justify-center text-[20px]
                         ring-2 ring-white shadow-[0_6px_14px_-6px_rgba(0,0,0,0.3)]"
              style={{ background: `${color}2E` }}
            >
              {emoji}
            </span>
          </div>

          <div className="flex-1 min-w-0">
            <div className="font-heading font-black text-[15px] text-[#1A1A22] truncate flex items-center gap-1.5">
              <span className="truncate">{row.display_name}</span>
              {isComplete && <span className="text-[13px]">👑</span>}
            </div>
            {lastEvent ? (
              <div className="text-[10px] text-zinc-400 truncate mt-0.5">
                <span className="font-black" style={{ color: lastRarity.color }}>
                  {lastEvent.is_secret && '✦ '}
                  {lastEvent.figure_name}
                </span>
                <span className="text-zinc-300"> · </span>
                <span>{humanTime(lastEvent.created_at)}</span>
              </div>
            ) : (
              <div className="text-[10px] text-zinc-400 mt-0.5">
                ещё ничего не выбил
              </div>
            )}
          </div>

          <div className="flex flex-col items-end gap-1 shrink-0">
            <span className="font-heading font-black text-[18px] tabular-nums text-[#1A1A22]">
              {totalPoints.toLocaleString('ru-RU')}
            </span>
            <span className="text-[9px] uppercase tracking-[0.2em] font-bold text-zinc-400">
              очков
            </span>
          </div>
        </div>

        {/* ═══ Десктопная раскладка ═══ */}
        <div className="hidden sm:grid grid-cols-[64px_1fr_130px_90px_110px] gap-3
                        items-center px-6 py-5">
          {/* Ранг */}
          <div className="flex justify-start pl-2">
            <RankBadge rank={rank} size="md" />
          </div>

          {/* Игрок + последнее событие */}
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="relative shrink-0">
              <span
                aria-hidden
                className="absolute inset-0 rounded-full blur-[10px] opacity-55"
                style={{ background: color }}
              />
              <span
                className="relative w-12 h-12 rounded-full flex items-center justify-center text-[22px]
                           ring-2 ring-white shadow-[0_6px_16px_-6px_rgba(0,0,0,0.35)]"
                style={{ background: `${color}2E` }}
              >
                {emoji}
              </span>
            </div>

            <div className="min-w-0">
              <div className="font-heading font-black text-[15px] text-[#1A1A22] truncate flex items-center gap-2">
                <span className="truncate">{row.display_name}</span>
                {isComplete && (
                  <span className="text-[13px] shrink-0" title="Собрал всю коллекцию">
                    👑
                  </span>
                )}
                {isMe && (
                  <span className="text-[9px] uppercase tracking-[0.22em]
                                   font-black text-[#B87400] shrink-0">
                    · ты
                  </span>
                )}
              </div>

              {lastEvent ? (
                <div className="text-[11px] text-zinc-400 truncate flex items-center gap-1.5 mt-0.5">
                  <span
                    className="w-1.5 h-1.5 rounded-full shrink-0"
                    style={{ background: lastRarity.color }}
                  />
                  <span className="truncate">
                    <span className="font-black" style={{ color: lastRarity.color }}>
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
          </div>

          {/* Прогресс */}
          <ProgressBar value={totalUniq} isComplete={isComplete} />

          {/* Секреток */}
          <div className="flex items-center justify-center gap-1.5">
            {secretCount > 0 && <span className="text-[12px]">✦</span>}
            <span
              className="font-heading font-black text-[18px] tabular-nums"
              style={{ color: secretCount > 0 ? '#B87400' : '#D4D4D8' }}
            >
              {secretCount}
            </span>
          </div>

          {/* Очки */}
          <span className={`text-right font-heading font-black text-[20px] tabular-nums ${
            isComplete ? 'text-[#B87400]' : 'text-[#1A1A22]'
          }`}>
            {totalPoints.toLocaleString('ru-RU')}
          </span>
        </div>
      </button>

      {/* ═══ Раскрытие: разбивка по редкостям ═══ */}
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.4, ease: EASE }}
            className="overflow-hidden"
          >
            <div className="px-5 sm:px-6 pb-6 pt-2">

              {/* Заголовок раскрытия */}
              <div className="flex items-center gap-2 mb-3 px-1">
                <span className="w-6 h-px bg-[#E7D5BC]" />
                <span className="text-[9px] uppercase tracking-[0.32em]
                                 font-black text-zinc-400">
                  разбивка по редкостям
                </span>
                <span className="flex-1 h-px bg-[#E7D5BC]" />
              </div>

              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                {RARITY_ORDER.map((rid) => {
                  const data = breakdown?.[rid] || { unique: 0, total: 0, points: 0 };
                  const r = getRarity(rid);
                  const empty = data.unique === 0;

                  return (
                    <motion.div
                      key={rid}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: empty ? 0.5 : 1, scale: 1 }}
                      transition={{ duration: 0.25 }}
                      className="relative rounded-2xl p-3 border overflow-hidden"
                      style={{
                        background: `linear-gradient(160deg, ${r.color}18 0%, ${r.color}08 100%)`,
                        borderColor: `${r.color}40`,
                      }}
                    >
                      {/* Тонкая полоска сверху */}
                      <span
                        aria-hidden
                        className="absolute inset-x-0 top-0 h-[2px]"
                        style={{ background: r.color }}
                      />

                      <div className="flex items-center gap-1.5">
                        <span
                          className="w-1.5 h-1.5 rounded-full"
                          style={{ background: r.color }}
                        />
                        <span
                          className="text-[9px] uppercase tracking-[0.22em] font-black"
                          style={{ color: r.color }}
                        >
                          {rid}
                        </span>
                      </div>

                      <div className="mt-2 font-heading font-black text-[20px]
                                      leading-none tabular-nums text-[#1A1A22]">
                        {data.unique}
                      </div>

                      <div className="mt-1 flex items-center justify-between">
                        <span className="text-[9px] uppercase tracking-[0.2em]
                                         font-bold text-zinc-400">
                          ×{data.total}
                        </span>
                        {data.points > 0 && (
                          <span className="text-[9px] font-black tabular-nums"
                                style={{ color: r.color }}>
                            +{data.points}
                          </span>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}