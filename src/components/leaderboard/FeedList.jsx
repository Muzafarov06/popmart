// src/components/leaderboard/FeedList.jsx
import { AnimatePresence, motion } from 'framer-motion';
import FeedItem from './FeedItem';

const EASE = [0.22, 1, 0.36, 1];

export default function FeedList({ events = [], loading }) {
  const isEmpty = !loading && events.length === 0;

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.1, ease: EASE }}
      className="relative"
    >
      {/* ───── Заголовок секции ───── */}
      <div className="flex items-end justify-between mb-5">
        <div>
          <div className="inline-flex items-center gap-2">
            {/* Живой пульс */}
            <span className="relative flex w-2.5 h-2.5">
              <motion.span
                animate={{ scale: [1, 2.2, 1], opacity: [0.55, 0, 0.55] }}
                transition={{ duration: 1.8, repeat: Infinity, ease: 'easeOut' }}
                className="absolute inset-0 rounded-full bg-[#1E7A44]"
              />
              <span className="relative w-full h-full rounded-full bg-[#1E7A44]" />
            </span>

            <span className="text-[10px] uppercase tracking-[0.32em] font-black text-[#1A1A22]">
              Лента событий
            </span>
          </div>

          <p className="mt-2 text-[11px] text-zinc-400 font-medium">
            Что выбивают прямо сейчас
          </p>
        </div>

        {/* Счётчик событий */}
        <div className="text-right">
          <div className="font-heading font-black text-[24px] leading-none
                          tabular-nums text-[#1A1A22]">
            {events.length}
          </div>
          <div className="mt-1 text-[9px] uppercase tracking-[0.24em]
                          font-black text-zinc-400">
            событий
          </div>
        </div>
      </div>

      {/* ───── Карточка ленты ───── */}
      <div className="relative rounded-3xl bg-white/80 backdrop-blur-sm
                      border border-[#F0E4D2]
                      shadow-[0_24px_60px_-32px_rgba(120,60,0,0.4)]
                      overflow-hidden">

        {/* Липкая шапка с меткой LIVE */}
        <div className="relative z-10 flex items-center justify-between gap-3
                        px-5 py-3
                        bg-gradient-to-b from-[#FFF9F0] to-[#FFF9F0]/60
                        border-b border-[#F5EBD8]">
          <span className="inline-flex items-center gap-1.5
                           text-[9px] uppercase tracking-[0.3em] font-black text-[#1E7A44]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#1E7A44] animate-pulse" />
            LIVE
          </span>
          <span className="text-[9px] uppercase tracking-[0.24em]
                           font-bold text-zinc-400">
            новые сверху
          </span>
        </div>

        {/* Область со скроллом */}
        <div
          className="relative max-h-[560px] overflow-y-auto
                     [scrollbar-width:thin]
                     [scrollbar-color:#E7D5BC_transparent]
                     [&::-webkit-scrollbar]:w-1.5
                     [&::-webkit-scrollbar-thumb]:rounded-full
                     [&::-webkit-scrollbar-thumb]:bg-[#E7D5BC]
                     [&::-webkit-scrollbar-track]:bg-transparent"
        >
          {/* Загрузка */}
          {loading && events.length === 0 && (
            <div className="flex flex-col items-center justify-center gap-3 py-16">
              <motion.span
                animate={{ rotate: 360 }}
                transition={{ duration: 1.4, repeat: Infinity, ease: 'linear' }}
                className="w-8 h-8 rounded-full border-3 border-[#FFB800]/20 border-t-[#FFB800]"
              />
              <span className="text-[10px] uppercase tracking-[0.3em]
                               text-zinc-400 font-black">
                Загружаем
              </span>
            </div>
          )}

          {/* Пусто */}
          {isEmpty && (
            <div className="flex flex-col items-center justify-center py-14 px-6 text-center">
              <span className="text-4xl opacity-80 select-none">📦</span>
              <p className="mt-4 font-heading font-black text-[15px] text-[#1A1A22]">
                Пока тихо
              </p>
              <p className="mt-1.5 text-[11px] text-zinc-400 leading-relaxed max-w-[240px]">
                Открой первую коробку — и событие появится здесь
              </p>
            </div>
          )}

          {/* События */}
          {events.length > 0 && (
            <div className="divide-y divide-[#F5EBD8]/70">
              <AnimatePresence initial={false}>
                {events.map((ev, i) => (
                  <FeedItem key={ev.id} event={ev} index={i} />
                ))}
              </AnimatePresence>
            </div>
          )}

          {/* Фейд-подсказка снизу (только если есть что скроллить) */}
          {events.length > 6 && (
            <div
              aria-hidden
              className="pointer-events-none sticky bottom-0 h-12
                         bg-gradient-to-t from-white/95 to-transparent"
            />
          )}
        </div>
      </div>
    </motion.section>
  );
}