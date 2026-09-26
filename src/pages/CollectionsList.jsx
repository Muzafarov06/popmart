// src/pages/CollectionsList.jsx
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useId } from 'react';
import { useCollections } from '@/hooks/useCollections';

const EASE = [0.22, 1, 0.36, 1];

/* ─── Плюрализация ─── */
function plural(n, forms) {
  const a = Math.abs(n) % 100;
  const b = a % 10;
  if (a > 10 && a < 20) return forms[2];
  if (b > 1 && b < 5) return forms[1];
  if (b === 1) return forms[0];
  return forms[2];
}

/* ─── Круговой прогресс ─── */
function ProgressRing({ value, isComplete, size = 44 }) {
  const rawId = useId();
  const uid = rawId.replace(/[:]/g, '');
  const stroke = 4;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const safe = Math.min(100, Math.max(0, value || 0));
  const offset = c - (safe / 100) * c;
  const gradId = `ring-${uid}`;
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
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="#EFE1CC"
          strokeWidth={stroke}
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={`url(#${gradId})`}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          initial={{ strokeDashoffset: c }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.1, delay: 0.3, ease: EASE }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="font-heading text-[11px] font-black tabular-nums text-[#1A1A22] leading-none">
          {Math.round(safe)}
          <span className="text-[7px] text-zinc-400 align-super">%</span>
        </span>
      </div>
    </div>
  );
}

/* ─── Карточка коллекции ─── */
function CollectionCard({ collection, index }) {
  const {
    id,
    name,
    display_cover,
    hero_cover,
    cover,
    progress = 0,
    isComplete,
  } = collection;

  const displayImage =
    display_cover || hero_cover || cover || '/box/display-box.png';

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: index * 0.06, ease: EASE }}
      className="relative"
    >
      <Link
        to={`/collection/${id}`}
        className="group relative block focus:outline-none"
      >
        <div className="relative flex items-center justify-center
                        aspect-[4/5] sm:aspect-[1/1] md:aspect-[5/4]">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 flex items-center justify-center"
          >
            <div
              className={`w-[95%] aspect-square rounded-full blur-[60px] transition-all duration-700
                          ${
                            isComplete
                              ? 'bg-[radial-gradient(circle,rgba(255,210,76,0.5),transparent_70%)] opacity-85'
                              : 'bg-[radial-gradient(circle,rgba(255,150,0,0.4),transparent_70%)] opacity-65'
                          }
                          group-hover:opacity-100 group-hover:scale-110`}
            />
          </div>

          <div className="absolute top-1 right-1 z-20">
            <ProgressRing value={progress} isComplete={isComplete} size={42} />
          </div>

          <motion.img
            src={displayImage}
            alt={name}
            className="relative z-10 w-full
                       max-w-[280px] sm:max-w-[320px] md:max-w-[360px]
                       h-auto object-contain select-none
                       drop-shadow-[0_32px_44px_rgba(120,60,0,0.4)]
                       transition-all duration-500 ease-out
                       group-hover:-translate-y-2 group-hover:scale-[1.04]
                       group-hover:drop-shadow-[0_40px_58px_rgba(120,60,0,0.5)]"
            draggable={false}
          />
        </div>

        <h3
          className="mt-3 text-center font-heading font-black
                     text-[14px] sm:text-[15px] md:text-[16px]
                     leading-[1.15] tracking-[-0.02em] text-[#1A1A22]
                     transition-colors duration-300 group-hover:text-[#B87400]
                     line-clamp-2 min-h-[2.3em]"
        >
          {name}
        </h3>
      </Link>
    </motion.div>
  );
}

/* ─── Заглушки ─── */
function Loading() {
  return (
    <div className="min-h-screen bg-[#FFF6EA] flex items-center justify-center">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
        className="w-12 h-12 rounded-full border-4 border-[#FFB800]/20 border-t-[#FFB800]"
      />
    </div>
  );
}

function EmptyState() {
  return (
    <div className="max-w-md mx-auto text-center py-20">
      <span className="text-6xl">📦</span>
      <h2 className="mt-6 font-heading font-black text-2xl tracking-tight">
        Коллекций пока нет
      </h2>
      <p className="mt-3 text-sm text-zinc-500">
        Скоро здесь появятся новые серии
      </p>
      <Link
        to="/"
        className="mt-8 inline-flex items-center gap-2 px-6 py-3 rounded-2xl
                   bg-[#1A1A22] text-white
                   font-heading text-[11px] font-black uppercase tracking-[0.22em]"
      >
        На главную
      </Link>
    </div>
  );
}

/* ─── Страница ─── */
export default function CollectionsList() {
  const { collections, loading, error } = useCollections();

  if (loading) return <Loading />;

  return (
    <div className="relative min-h-screen bg-[#FFF6EA] text-[#1A1A22]">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="absolute left-1/2 top-[20%] h-[900px] w-[900px]
                     -translate-x-1/2 rounded-full
                     bg-[radial-gradient(circle,rgba(255,180,0,0.15)_0%,transparent_65%)]
                     blur-3xl"
        />
        <div
          className="absolute inset-x-0 top-0 h-40
                     bg-[linear-gradient(180deg,#FFF9F0,transparent)]"
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-8 md:py-12">

        {/* ─── Навигация назад ─── */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: EASE }}
          className="mb-6"
        >
          <Link
            to="/"
            className="group inline-flex items-center gap-2
                       text-[10px] uppercase tracking-[0.28em] font-bold
                       text-zinc-500 hover:text-[#1A1A22] transition-colors"
          >
            <span className="text-base transition-transform group-hover:-translate-x-1">←</span>
            На главную
          </Link>
        </motion.div>

        {/* ─── Заголовок + счётчик (просто текст) ─── */}
        <motion.header
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: EASE }}
          className="flex items-end justify-between gap-4 mb-8 sm:mb-10"
        >
          <h1
            className="font-heading font-black
                       text-[28px] sm:text-[36px] md:text-[42px]
                       tracking-[-0.04em] leading-[0.95] text-[#1A1A22]"
          >
            Все коллекции
          </h1>

          {collections.length > 0 && (
            <div className="shrink-0 inline-flex items-center gap-2 pb-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#FF9500]" />
              <span className="text-[12px] font-black text-[#1A1A22] tabular-nums">
                {collections.length}
              </span>
              <span className="text-[10px] uppercase tracking-[0.24em]
                               text-zinc-400 font-bold">
                {plural(collections.length, ['серия', 'серии', 'серий'])}
              </span>
            </div>
          )}
        </motion.header>

        {/* ─── Ошибка ─── */}
        {error && (
          <div className="mt-12 text-center text-red-500 text-sm">
            Ошибка загрузки: {error}
          </div>
        )}

        {!error && collections.length === 0 && <EmptyState />}

        {/* ─── Сетка ─── */}
        {!error && collections.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 md:gap-8">
            {collections.map((collection, i) => (
              <CollectionCard
                key={collection.id}
                collection={collection}
                index={i}
              />
            ))}
          </div>
        )}

        {/* ─── Штамп Pop Mart — просто текст ─── */}
        <div className="mt-14 flex justify-center">
          <div className="inline-flex items-center gap-3">
            <span className="w-1.5 h-1.5 rounded-full bg-[#E60012]" />
            <span className="text-[9px] uppercase tracking-[0.35em] font-black text-zinc-400">
              Pop Mart
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}