// src/components/leaderboard/FeedItem.jsx
import { motion } from 'framer-motion';
import { findUserByLogin } from '@/data/users';
import { getRarity } from '@/data/rarity';

const EASE = [0.22, 1, 0.36, 1];

/* «2 минуты назад» */
function humanTime(iso) {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (diff < 30)    return 'только что';
  if (diff < 60)    return `${diff} сек назад`;
  const m = Math.floor(diff / 60);
  if (m < 60)       return `${m} мин назад`;
  const h = Math.floor(m / 60);
  if (h < 24)       return `${h} ч назад`;
  const d = Math.floor(h / 24);
  if (d < 7)        return `${d} дн назад`;
  return new Date(iso).toLocaleDateString('ru-RU');
}

export default function FeedItem({ event, index }) {
  const meta = findUserByLogin(event.profile?.login);
  const emoji = meta?.emoji || '🐾';
  const color = meta?.color || '#FFB800';

  const figure = event.figure || {};
  const rarity = getRarity(figure.rarity);
  const isSecret = figure.is_secret;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: Math.min(index * 0.02, 0.3), ease: EASE }}
      className={`relative flex items-center gap-3 sm:gap-3.5 px-5 py-4
                  transition-colors
                  ${isSecret ? 'bg-[linear-gradient(90deg,#FFF9E8_0%,#FFF6EA_60%)]' : ''}
                  hover:bg-[#FFF9F0]`}
    >
      {/* Полоска редкости слева */}
      <span
        aria-hidden
        className="absolute left-0 top-2 bottom-2 w-[3px] rounded-r-full"
        style={{ background: rarity.color }}
      />

      {/* Аватарка со свечением */}
      <div className="relative shrink-0">
        <span
          aria-hidden
          className="absolute inset-0 rounded-full blur-[8px] opacity-50"
          style={{ background: color }}
        />
        <span
          className="relative w-10 h-10 rounded-full flex items-center justify-center text-[18px]
                     ring-2 ring-white shadow-[0_4px_12px_-6px_rgba(0,0,0,0.3)]"
          style={{ background: `${color}2E` }}
        >
          {emoji}
        </span>
      </div>

      {/* Текст */}
      <div className="flex-1 min-w-0">
        <div className="text-[13.5px] leading-snug truncate">
          <span className="font-heading font-black text-[#1A1A22]">
            {event.profile?.display_name || 'Игрок'}
          </span>
          <span className="text-zinc-400 font-medium"> выбил </span>
          <span className="font-heading font-black text-[#1A1A22]">
            {isSecret && '✦ '}
            {figure.name || '—'}
          </span>
        </div>

        <div className="mt-1.5 flex items-center gap-2 flex-wrap">
          {/* Чип редкости */}
          <span
            className="inline-flex items-center gap-1 px-2 py-[3px] rounded-md
                       text-[9px] uppercase tracking-[0.18em] font-black"
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

          {isSecret && (
            <span className="text-[9px] uppercase tracking-[0.22em]
                             font-black text-[#B87400]">
              ✦ секрет
            </span>
          )}

          <span className="text-[10px] text-zinc-400 font-medium">
            {humanTime(event.created_at)}
          </span>
        </div>
      </div>

      {/* Мини-карта с поворотом */}
      {figure.card && (
        <motion.div
          initial={{ rotate: 6, scale: 0.9 }}
          animate={{ rotate: 3, scale: 1 }}
          transition={{ duration: 0.5, ease: EASE }}
          className="relative w-11 h-[60px] shrink-0 rounded-lg overflow-hidden
                     ring-2 ring-white shadow-[0_8px_20px_-10px_rgba(0,0,0,0.4)]
                     transition-transform duration-300 hover:rotate-0 hover:scale-[1.06]"
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
  );
}