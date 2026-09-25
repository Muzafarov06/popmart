// src/components/home/CollectionPanel.jsx
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import OpenBoxButton from './OpenBoxButton';

const EASE = [0.22, 1, 0.36, 1];

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
      className={`relative w-10 h-10 rounded-full overflow-hidden shrink-0 border-2 transition-colors ${
        isOwned
          ? 'border-[#FF9500] bg-[#FFF1DC]'
          : 'border-[#EADFCB] bg-[#FAF3E6]'
      }`}
    >
      <img
        src={src}
        alt=""
        className={`w-full h-full object-cover ${
          isOwned ? '' : 'grayscale opacity-40'
        }`}
      />
      {owned > 1 && (
        <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 rounded-full
                         bg-[#FF6B00] text-white text-[9px] font-bold flex items-center justify-center
                         border border-white">
          {owned}
        </span>
      )}
      {showSilhouette && (
        <span className="absolute inset-0 flex items-center justify-center
                         bg-black/10 backdrop-blur-[1px] text-[10px]">
          🔒
        </span>
      )}
    </motion.div>
  );
}

/* ─── Сегментированный прогресс ─── */
function SegmentProgress({ figures, owned }) {
  return (
    <div className="flex items-center gap-1">
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
            className={`flex-1 h-2 rounded-full origin-bottom transition-all ${
              isOwned
                ? isSecret
                  ? 'bg-[linear-gradient(90deg,#FFD24C,#FF9500)] shadow-[0_0_10px_rgba(255,180,60,0.7)]'
                  : 'bg-[linear-gradient(90deg,#FFB800,#FF6B00)]'
                : isSecret
                  ? 'bg-[#F5E5C8]'
                  : 'bg-[#EFE0CC]'
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
    is_active,
    hasSecret,
  } = collection;

  const canOpen = is_active;
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
      <div className="relative overflow-hidden rounded-[32px] border border-white bg-white/75 p-6 shadow-[0_40px_80px_-40px_rgba(180,110,0,0.5)] backdrop-blur-2xl sm:p-8">

        {/* Декоративные свечения */}
        <div className="pointer-events-none absolute -right-20 -top-20 h-48 w-48 rounded-full bg-[#FFB800]/30 blur-3xl" />
        <div className="pointer-events-none absolute -left-16 -bottom-16 h-40 w-40 rounded-full bg-[#FF6B00]/15 blur-3xl" />

        {/* Диагональная текстура */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.05]"
          style={{
            backgroundImage:
              'repeating-linear-gradient(-55deg, #000 0 1px, transparent 1px 14px)',
          }}
        />

        {/* ─── ШАПКА ─── */}
        <div className="relative">
          <div className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.3em] text-[#B87400]">
            <span className="w-6 h-px bg-[#B87400]/40" />
            Коллекция
          </div>
          <h2 className="mt-2 font-heading text-[26px] sm:text-[32px] font-black leading-[1.05] tracking-[-0.025em] text-[#1A1A22]">
            {name}
          </h2>
        </div>

        {/* ─── СТАТУС ─── */}
        <div className="relative mt-4">
          <AnimatePresence mode="wait" initial={false}>
            <motion.span
              key={isComplete ? 'done' : 'progress'}
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 6 }}
              transition={{ duration: 0.25, ease: EASE }}
              className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.18em] ${
                isComplete
                  ? 'bg-[#E7F7EC] text-[#1E7A44]'
                  : 'bg-[#FFF1DC] text-[#9A6A00]'
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  isComplete ? 'bg-[#1E7A44]' : 'bg-[#FF9500] animate-pulse'
                }`}
              />
              {isComplete ? 'Собрано' : 'В процессе'}
            </motion.span>
          </AnimatePresence>
        </div>

        {/* ─── ПРЕВЬЮ ФИГУРОК ─── */}
        <div className="relative mt-6">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-bold uppercase tracking-[0.28em] text-zinc-400">
              Фигурки
            </span>
            {hasSecret && (
              <span className="inline-flex items-center gap-1.5
                 text-[10px] font-bold uppercase tracking-[0.22em] text-[#B87400]">
                <svg
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="w-3 h-3 shrink-0"
                >
                    <path d="M12 1a5 5 0 0 0-5 5v3H6a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-9a2 2 0 0 0-2-2h-1V6a5 5 0 0 0-5-5zm-3 5a3 3 0 1 1 6 0v3H9V6zm3 9a1.5 1.5 0 0 1 1.5 1.5c0 .6-.35 1.12-.87 1.36V19a.63.63 0 1 1-1.26 0v-1.14A1.5 1.5 0 0 1 12 15z" />
                </svg>
                <span>
                    секретных: <span className="tabular-nums">{secretOwned}/{secretCount}</span>
                </span>
                </span>
            )}
          </div>

          <div className="flex items-center -space-x-2">
            {previewFigures.map((f, i) => (
              <FigureAvatar key={f.id} figure={f} owned={owned[f.id] || 0} index={i} />
            ))}
            {restCount > 0 && (
              <div className="w-10 h-10 rounded-full shrink-0 border-2 border-dashed border-[#E7D5BC] bg-white/60 flex items-center justify-center text-[11px] font-bold text-zinc-400">
                +{restCount}
              </div>
            )}
          </div>
        </div>

        {/* ─── ПРОГРЕСС ─── */}
        <div className="relative mt-7">
          <div className="flex items-end justify-between">
            <div className="flex items-baseline gap-1.5 font-heading leading-none">
              <AnimatePresence mode="wait" initial={false}>
                <motion.span
                  key={`${collection.id}-${ownedCount}`}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -14 }}
                  transition={{ duration: 0.3, ease: EASE }}
                  className="inline-block text-[54px] sm:text-[64px] font-black tracking-tight text-[#1A1A22]"
                >
                  {ownedCount}
                </motion.span>
              </AnimatePresence>
              <span className="text-[22px] font-bold text-zinc-300">/</span>
              <span className="text-[24px] font-bold text-zinc-400">{totalCount}</span>
            </div>

            <span className="text-[10px] font-bold uppercase tracking-[0.28em] text-zinc-400 pb-2">
              {Math.round(progress)}%
            </span>
          </div>

          <div className="mt-3">
            <SegmentProgress figures={figures} owned={owned} />
          </div>
        </div>

        {/* ─── КНОПКИ ─── */}
        <div className="relative mt-8 grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-3 items-stretch">
        <OpenBoxButton
            onClick={onOpen}
            disabled={!canOpen}
            label={canOpen ? 'Открыть' : 'Скоро'}
        />

        <Link
            to={`/collection/${id}`}
            className="inline-flex items-center justify-center gap-2
                    px-6 py-4 rounded-2xl
                    border border-[#E7D5BC] bg-white/70 text-[#1A1A22]
                    font-heading text-[12px] font-black uppercase
                    tracking-[0.22em]
                    hover:bg-white hover:border-[#D5BE9C]
                    transition-colors whitespace-nowrap"
        >
            <span>Коллекция</span>
            <span className="text-[14px] leading-none">→</span>
        </Link>
        </div>

        <p className="mt-3 text-center text-[10px] font-semibold uppercase tracking-[0.25em] text-zinc-400">
        Бесплатно · без ограничений
        </p>
      </div>
    </motion.div>
  );
}