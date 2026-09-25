// src/components/leaderboard/LiveTicker.jsx
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { findUserByLogin } from '@/data/users';
import { getRarity } from '@/data/rarity';

const EASE = [0.22, 1, 0.36, 1];
const ROTATE_MS = 4500;

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
  return `${d} дн назад`;
}

export default function LiveTicker({ events = [] }) {
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    if (events.length < 2) return;
    const t = setInterval(() => setIdx((i) => (i + 1) % events.length), ROTATE_MS);
    return () => clearInterval(t);
  }, [events.length]);

  if (events.length === 0) return null;

  const ev = events[idx];
  const meta = findUserByLogin(ev.profile?.login);
  const emoji = meta?.emoji || '🐾';
  const userColor = meta?.color || '#FFB800';

  const figure = ev.figure || {};
  const rarity = getRarity(figure.rarity);
  const isSecret = figure.is_secret;

  return (
    <Link
      to="/leaderboard"
      className="group relative block w-full"
    >
      <div
        className="relative overflow-hidden rounded-[26px]
                   bg-white/92 backdrop-blur-xl
                   border border-[#F0E4D2]
                   shadow-[0_24px_60px_-30px_rgba(120,60,0,0.45)]
                   transition-all duration-300
                   group-hover:-translate-y-1
                   group-hover:shadow-[0_32px_70px_-30px_rgba(120,60,0,0.6)]"
      >
        {/* Цветная полоса редкости — слева */}
        <span
          aria-hidden
          className="absolute left-0 top-0 bottom-0 w-[3px]"
          style={{ background: rarity.color }}
        />

        {/* Градиентная полоска сверху */}
        <span
          aria-hidden
          className="absolute inset-x-0 top-0 h-px opacity-60"
          style={{
            background: `linear-gradient(90deg, transparent 0%, ${rarity.color} 50%, transparent 100%)`,
          }}
        />

        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={ev.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.55, ease: EASE }}
            className="flex items-center gap-4 sm:gap-5
                       pl-5 pr-5 sm:pl-7 sm:pr-7 py-4 sm:py-5"
          >
            {/* Аватарка игрока */}
            <div className="relative shrink-0">
              <span
                aria-hidden
                className="absolute inset-0 rounded-full blur-[10px] opacity-60"
                style={{ background: userColor }}
              />
              <span
                className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-full
                           flex items-center justify-center text-[22px] sm:text-[26px]
                           ring-2 ring-white shadow-[0_6px_16px_-6px_rgba(0,0,0,0.35)]"
                style={{ background: `${userColor}2E` }}
              >
                {emoji}
              </span>
            </div>

            {/* Текст */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 mb-1">
                <span className="relative flex w-1.5 h-1.5">
                  <motion.span
                    animate={{ scale: [1, 2, 1], opacity: [0.6, 0, 0.6] }}
                    transition={{ duration: 1.6, repeat: Infinity, ease: 'easeOut' }}
                    className="absolute inset-0 rounded-full"
                    style={{ background: rarity.color }}
                  />
                  <span
                    className="relative w-full h-full rounded-full"
                    style={{ background: rarity.color }}
                  />
                </span>
                <span
                  className="text-[9px] uppercase tracking-[0.3em] font-black"
                  style={{ color: rarity.color }}
                >
                  сейчас
                </span>
              </div>

              <div className="text-[15px] sm:text-[17px] leading-tight truncate text-[#1A1A22]">
                <span className="font-heading font-black">
                  {ev.profile?.display_name || 'Игрок'}
                </span>
                <span className="text-zinc-400 font-medium"> выбил </span>
                <span className="font-heading font-black">
                  {isSecret && '✦ '}
                  {figure.name || '—'}
                </span>
              </div>

              <div className="mt-1.5 flex items-center gap-2">
                <span
                  className="inline-flex items-center gap-1 px-2 py-[3px] rounded-md
                             text-[9px] font-black uppercase tracking-[0.18em]"
                  style={{
                    background: `${rarity.color}1F`,
                    color: rarity.color,
                    border: `1px solid ${rarity.color}45`,
                  }}
                >
                  <span
                    className="w-1 h-1 rounded-full"
                    style={{ background: rarity.color }}
                  />
                  {rarity.label} · {figure.rarity}
                </span>

                <span className="text-[10px] text-zinc-400 font-medium">
                  {humanTime(ev.created_at)}
                </span>
              </div>
            </div>

            {/* Мини-карта — с поворотом */}
            {figure.card && (
              <motion.div
                initial={{ rotate: 5, scale: 0.9 }}
                animate={{ rotate: 3, scale: 1 }}
                transition={{ duration: 0.5, ease: EASE }}
                className="relative w-[52px] h-[70px] sm:w-[60px] sm:h-[80px]
                           shrink-0 rounded-xl overflow-hidden
                           ring-2 ring-white shadow-[0_10px_24px_-10px_rgba(0,0,0,0.4)]
                           transition-transform duration-300
                           group-hover:rotate-0 group-hover:scale-[1.06]"
              >
                <img
                  src={figure.card}
                  alt=""
                  className="w-full h-full object-cover"
                  loading="lazy"
                  draggable={false}
                />
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Дорожка-индикатор снизу */}
        {events.length > 1 && (
          <div className="relative flex items-center gap-1 px-5 sm:px-7 pb-3">
            {events.slice(0, 8).map((_, i) => (
              <motion.span
                key={i}
                animate={{
                  width: i === idx % 8 ? 22 : 6,
                  background: i === idx % 8 ? rarity.color : '#E7D5BC',
                }}
                transition={{ duration: 0.4, ease: EASE }}
                className="h-[3px] rounded-full"
              />
            ))}
          </div>
        )}
      </div>
    </Link>
  );
}