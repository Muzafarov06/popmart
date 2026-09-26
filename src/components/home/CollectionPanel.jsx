// src/components/home/CollectionPanel.jsx
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { useId } from 'react';

const EASE = [0.22, 1, 0.36, 1];

/* ─── Круговой прогресс ─── */
function ProgressRing({ value, isComplete }) {
  const rawId = useId();
  const uid = rawId.replace(/[:]/g, '');
  const size = 96;
  const stroke = 8;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const safe = Math.min(100, Math.max(0, value || 0));
  const offset = c - (safe / 100) * c;
  const gradId = `pr-${uid}`;
  const from = isComplete ? '#FFD24C' : '#FFB800';
  const to = isComplete ? '#FF9500' : '#FF6B00';

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90 block">
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={from} />
            <stop offset="100%" stopColor={to} />
          </linearGradient>
        </defs>
        <circle cx={size / 2} cy={size / 2} r={r}
          fill="none" stroke="#F5E7CF" strokeWidth={stroke} />
        <motion.circle
          cx={size / 2} cy={size / 2} r={r}
          fill="none" stroke={`url(#${gradId})`}
          strokeWidth={stroke} strokeLinecap="round" strokeDasharray={c}
          initial={{ strokeDashoffset: c }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.1, delay: 0.3, ease: EASE }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-heading text-[26px] font-black tabular-nums
                         text-[#1A1A22] leading-none">
          {Math.round(safe)}
          <span className="text-[14px] text-zinc-400 align-super">%</span>
        </span>
      </div>
    </div>
  );
}

/* ─── Мини-аватар фигурки ─── */
function FigureAvatar({ figure, owned, index }) {
  const isOwned = owned > 0;
  const isSecret = figure.is_secret;
  const showSilhouette = isSecret && !isOwned;
  const src = showSilhouette
    ? figure.silhouette || '/box/secret-1.png'
    : figure.image;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.04, ease: EASE }}
      className={`relative w-12 h-12 rounded-full overflow-visible shrink-0
                  ${isOwned ? 'bg-[#FFF1DC]' : 'bg-[#FAF3E6]'}`}
    >
      <div className="absolute inset-0 rounded-full overflow-hidden">
        <img src={src} alt=""
          className={`w-full h-full object-cover ${
            isOwned ? '' : 'grayscale opacity-40'
          }`}
          draggable={false} />
        {showSilhouette && (
          <span className="absolute inset-0 flex items-center justify-center
                           bg-black/20 backdrop-blur-[1px]">
            <svg viewBox="0 0 24 24" fill="white" className="w-5 h-5">
              <path d="M12 1a5 5 0 0 0-5 5v3H6a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-9a2 2 0 0 0-2-2h-1V6a5 5 0 0 0-5-5zm-3 5a3 3 0 1 1 6 0v3H9V6zm3 9a1.5 1.5 0 0 1 1.5 1.5c0 .6-.35 1.12-.87 1.36V19a.63.63 0 1 1-1.26 0v-1.14A1.5 1.5 0 0 1 12 15z" />
            </svg>
          </span>
        )}
      </div>
      {owned > 1 && (
        <motion.span
          initial={{ scale: 0 }} animate={{ scale: 1 }}
          transition={{ duration: 0.3, delay: 0.2, ease: EASE }}
          className="absolute -top-1.5 -right-1.5 z-10
                     min-w-[22px] h-[22px] px-1.5
                     rounded-full bg-[#FF6B00] text-white
                     text-[11px] font-black leading-none
                     flex items-center justify-center
                     border-2 border-white
                     shadow-[0_4px_10px_-2px_rgba(255,107,0,0.8)]"
        >
          {owned}
        </motion.span>
      )}
    </motion.div>
  );
}

/* ─── Сегментный прогресс ─── */
function SegmentProgress({ figures, owned }) {
  return (
    <div className="flex items-center gap-[3px]">
      {figures.map((f, i) => {
        const count = owned[f.id] || 0;
        const isOwned = count > 0;
        const isSecret = f.is_secret;
        return (
          <motion.div
            key={f.id}
            initial={{ scaleY: 0.4, opacity: 0 }}
            animate={{ scaleY: 1, opacity: 1 }}
            transition={{ duration: 0.35, delay: i * 0.03, ease: EASE }}
            className={`flex-1 h-[6px] rounded-full origin-bottom transition-all ${
              isOwned
                ? isSecret
                  ? 'bg-[linear-gradient(90deg,#FFD24C,#FF9500)] shadow-[0_0_10px_rgba(255,180,60,0.7)]'
                  : 'bg-[linear-gradient(90deg,#FFB800,#FF6B00)]'
                : isSecret ? 'bg-[#F5E5C8]' : 'bg-[#EFE0CC]'
            }`}
            title={isSecret && !isOwned ? '???' : f.name}
          />
        );
      })}
    </div>
  );
}

/* ─── Основная карточка ─── */
export default function CollectionPanel({ collection, onOpen }) {
  const {
    id,
    name,
    figures = [],
    owned = {},
    ownedCount,
    totalCount,
    progress,
    isComplete,
    hasSecret,
    canPlay,     // ← из buildCollection
    isLocked,    // ← из buildCollection
  } = collection;

  const previewFigures = figures.slice(0, 6);
  const restCount = Math.max(0, figures.length - previewFigures.length);
  const secretCount = figures.filter((f) => f.is_secret).length;
  const secretOwned = figures.filter((f) => f.is_secret && owned[f.id]).length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, delay: 0.2, ease: EASE }}
      className="relative"
    >
      <div className="relative overflow-hidden rounded-[32px]
                      border border-[#F0E4D2] bg-white
                      p-6 sm:p-8
                      shadow-[0_30px_60px_-30px_rgba(180,110,0,0.4)]">

        {/* ─── СТАТУС / «СКОРО» ─── */}
        <div className="flex items-center justify-between gap-3">
          {isLocked ? (
            <span className="inline-flex items-center gap-2 rounded-full px-3 py-1.5
                             text-[10px] font-black uppercase tracking-[0.2em]
                             bg-[#E8E4DC] text-zinc-500">
              <span className="w-1.5 h-1.5 rounded-full bg-zinc-400" />
              Скоро
            </span>
          ) : (
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={isComplete ? 'done' : 'progress'}
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 6 }}
                transition={{ duration: 0.25, ease: EASE }}
                className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5
                            text-[10px] font-black uppercase tracking-[0.2em]
                            ${
                              isComplete
                                ? 'bg-[#E7F7EC] text-[#1E7A44]'
                                : 'bg-[#FFF1DC] text-[#9A6A00]'
                            }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${
                  isComplete ? 'bg-[#1E7A44]' : 'bg-[#FF9500] animate-pulse'
                }`} />
                {isComplete ? 'Собрано' : 'В процессе'}
              </motion.span>
            </AnimatePresence>
          )}

          <span className="text-[10px] font-black uppercase tracking-[0.28em] text-zinc-400">
            Коллекция
          </span>
        </div>

        {/* ─── ИМЯ + КРУГ ─── */}
        <div className="mt-5 flex items-center gap-5">
          <div className="min-w-0 flex-1">
            <h2 className="font-heading text-[26px] sm:text-[32px] font-black
                           leading-[1.05] tracking-[-0.025em] text-[#1A1A22]">
              {name}
            </h2>
            <p className="mt-1.5 text-[12px] text-zinc-400 font-medium">
              {totalCount} фигурок в серии
            </p>
          </div>

          {/* Круг прогресса — только если не заблокировано */}
          {!isLocked && <ProgressRing value={progress} isComplete={isComplete} />}
        </div>

        {/* ─── ПРОГРЕСС-БАР ─── */}
        <div className="mt-6">
          <SegmentProgress figures={figures} owned={owned} />

          <div className="mt-3 flex items-baseline justify-between">
            <div className="font-heading font-black tabular-nums">
              <span className="text-[28px] leading-none text-[#1A1A22]">
                {ownedCount}
              </span>
              <span className="text-[18px] text-zinc-300 mx-1.5">/</span>
              <span className="text-[18px] text-zinc-400">{totalCount}</span>
            </div>
            <span className="text-[10px] uppercase tracking-[0.28em] font-black text-zinc-400">
              открыто
            </span>
          </div>
        </div>

        {/* ─── ФИГУРКИ (заблюрены если locked) ─── */}
        <div className="mt-6 pt-6 border-t border-[#F5EBD8]">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[10px] font-black uppercase tracking-[0.28em] text-zinc-400">
              Фигурки
            </span>
            {hasSecret && !isLocked && (
              <span className="inline-flex items-center gap-1.5
                               text-[10px] font-black uppercase tracking-[0.22em] text-[#B87400]">
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3 shrink-0">
                  <path d="M12 1a5 5 0 0 0-5 5v3H6a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-9a2 2 0 0 0-2-2h-1V6a5 5 0 0 0-5-5zm-3 5a3 3 0 1 1 6 0v3H9V6zm3 9a1.5 1.5 0 0 1 1.5 1.5c0 .6-.35 1.12-.87 1.36V19a.63.63 0 1 1-1.26 0v-1.14A1.5 1.5 0 0 1 12 15z" />
                </svg>
                <span>секретных: <span className="tabular-nums">{secretOwned}/{secretCount}</span></span>
              </span>
            )}
          </div>

          <div className={`flex items-center -space-x-2 transition-all ${
            isLocked ? 'blur-[6px] opacity-60 pointer-events-none select-none' : ''
          }`}>
            {previewFigures.map((f, i) => (
              <FigureAvatar key={f.id} figure={f} owned={owned[f.id] || 0} index={i} />
            ))}
            {restCount > 0 && (
              <div className="w-12 h-12 rounded-full shrink-0
                              border-2 border-dashed border-[#E7D5BC]
                              bg-white/60 flex items-center justify-center
                              text-[11px] font-bold text-zinc-400">
                +{restCount}
              </div>
            )}
          </div>
        </div>

        {/* ─── КНОПКА «ОТКРЫТЬ» ─── */}
        <button
          type="button"
          onClick={canPlay ? onOpen : undefined}
          disabled={!canPlay}
          className={`w-full mt-6 py-5 rounded-2xl
                     font-heading text-[13px] font-black uppercase tracking-[0.24em]
                     transition-all duration-200
                     ${
                       canPlay
                         ? 'bg-[#1A1A22] text-white shadow-[0_16px_32px_-14px_rgba(26,26,34,0.55)] hover:bg-[#FF9500] hover:shadow-[0_20px_40px_-14px_rgba(255,140,0,0.7)] hover:-translate-y-0.5 active:translate-y-0'
                         : 'bg-[#E8E4DC] text-zinc-400 cursor-not-allowed'
                     }`}
        >
          {canPlay ? 'Открыть коробку' : 'Скоро'}
        </button>

        {/* ─── ССЫЛКА «В КОЛЛЕКЦИЮ» ─── */}
        <div className="mt-4 flex justify-center">
          {canPlay ? (
            <Link
              to={`/collection/${id}`}
              className="inline-flex items-center gap-1.5
                         text-[11px] uppercase tracking-[0.28em] font-medium
                         text-zinc-400 hover:text-[#B87400] transition-colors"
            >
              В коллекцию
              <span className="text-[13px] leading-none">→</span>
            </Link>
          ) : (
            <span className="inline-flex items-center gap-1.5
                             text-[11px] uppercase tracking-[0.28em] font-medium
                             text-zinc-300 cursor-not-allowed select-none">
              В коллекцию
              <span className="text-[13px] leading-none">→</span>
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}