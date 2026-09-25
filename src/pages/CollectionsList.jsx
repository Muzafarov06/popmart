// src/pages/CollectionsList.jsx
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useId } from 'react';
import { useCollections } from '@/hooks/useCollections';

const EASE = [0.22, 1, 0.36, 1];

function plural(n, forms) {
  const a = Math.abs(n) % 100;
  const b = a % 10;
  if (a > 10 && a < 20) return forms[2];
  if (b > 1 && b < 5) return forms[1];
  if (b === 1) return forms[0];
  return forms[2];
}

function StatusBadge({ isComplete, is_active }) {
  const config = isComplete
    ? {
        label: 'Собрано',
        dot: 'bg-[#1E7A44]',
        text: 'text-[#1E7A44]',
        ring: 'border-[#1E7A44]/20',
      }
    : is_active
    ? {
        label: 'В процессе',
        dot: 'bg-[#FF9500] animate-pulse',
        text: 'text-[#9A6A00]',
        ring: 'border-[#FF9500]/25',
      }
    : {
        label: 'Скоро',
        dot: 'bg-zinc-400',
        text: 'text-zinc-400',
        ring: 'border-zinc-300/40',
      };

  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border bg-white/40 backdrop-blur-md
                  px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.22em]
                  ${config.ring} ${config.text}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      {config.label}
    </span>
  );
}

function ProgressRing({ value, isComplete }) {
  const raw = useId();
  const uid = raw.replace(/[:]/g, '');
  const size = 46;
  const stroke = 3.5;
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
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#EFE1CC" strokeWidth={stroke} />
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

function SegmentedBar({ total, owned, isComplete }) {
  const safeTotal = Math.max(total || 0, 1);
  const safeOwned = Math.min(owned || 0, safeTotal);

  return (
    <div className="flex items-center gap-[3px] flex-1 min-w-0">
      {Array.from({ length: safeTotal }).map((_, i) => {
        const filled = i < safeOwned;
        return (
          <motion.span
            key={i}
            initial={{ opacity: 0, scaleY: 0.4 }}
            animate={{ opacity: 1, scaleY: 1 }}
            transition={{ duration: 0.35, delay: 0.32 + i * 0.035, ease: EASE }}
            className={`h-[5px] flex-1 rounded-full origin-center ${
              filled
                ? isComplete
                  ? 'bg-[linear-gradient(90deg,#FFD24C,#FF9500)] shadow-[0_0_6px_rgba(255,180,0,0.45)]'
                  : 'bg-[linear-gradient(90deg,#FFB800,#FF6B00)]'
                : 'bg-[#EFE1CC]'
            }`}
          />
        );
      })}
    </div>
  );
}

function CollectionCard({ collection, index }) {
  const {
    id,
    name,
    description,
    cover,
    hero_cover,
    display_cover,
    ownedCount = 0,
    totalCount = 0,
    progress = 0,
    isComplete,
    is_active,
  } = collection;

  const secretCount =
    collection.secretCount ?? collection.secret_count ?? 0;
  const knownCount =
    collection.knownCount ??
    collection.known_count ??
    Math.max(0, totalCount - secretCount);

  const displayImage =
    display_cover || hero_cover || cover || '/box/display-box.png';

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, delay: index * 0.09, ease: EASE }}
      className="relative"
    >
      <Link to={`/collection/${id}`} className="group relative block focus:outline-none">
        <div className="relative flex items-center justify-center h-[300px] sm:h-[360px]">
          <div
            aria-hidden
            className={`pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2
                        w-[300px] h-[300px] sm:w-[360px] sm:h-[360px] rounded-full blur-[90px]
                        transition-all duration-700
                        ${
                          isComplete
                            ? 'bg-[radial-gradient(circle,rgba(255,210,76,0.55),transparent_70%)] opacity-70'
                            : is_active
                            ? 'bg-[radial-gradient(circle,rgba(255,150,0,0.45),transparent_70%)] opacity-60'
                            : 'bg-[radial-gradient(circle,rgba(180,140,90,0.35),transparent_70%)] opacity-40'
                        }
                        group-hover:opacity-100 group-hover:scale-110`}
          />

          <div className="absolute top-2 right-0 z-20">
            <StatusBadge isComplete={isComplete} is_active={is_active} />
          </div>

          <motion.img
            src={displayImage}
            alt={name}
            className="relative z-10 w-full max-w-[260px] sm:max-w-[320px] h-auto object-contain
                       select-none
                       drop-shadow-[0_45px_60px_rgba(120,60,0,0.35)]
                       transition-all duration-[600ms] ease-out
                       group-hover:-translate-y-3 group-hover:scale-[1.05]
                       group-hover:drop-shadow-[0_60px_80px_rgba(120,60,0,0.45)]"
            draggable={false}
          />
        </div>

        <div className="relative mt-5 px-1">
          <div className="flex items-center justify-between gap-4">
            <h2
              className="font-heading font-black text-[24px] sm:text-[28px]
                         tracking-[-0.03em] leading-[1.05] text-[#1A1A22]
                         transition-colors duration-300 group-hover:text-[#B87400]
                         truncate min-w-0"
            >
              {name}
            </h2>
            <ProgressRing value={progress} isComplete={isComplete} />
          </div>

          <div className="mt-1.5 flex items-center gap-2 text-[10px] uppercase tracking-[0.18em] font-bold text-zinc-400">
            <span>
              {totalCount}{' '}
              {plural(totalCount, ['фигурка', 'фигурки', 'фигурок'])}
            </span>
            {secretCount > 0 && (
              <>
                <span className="w-1 h-1 rounded-full bg-zinc-300" />
                <span className="text-[#B87400]">
                  {secretCount}{' '}
                  {plural(secretCount, ['секретная', 'секретные', 'секретных'])}
                </span>
              </>
            )}
            {secretCount === 0 && knownCount > 0 && (
              <>
                <span className="w-1 h-1 rounded-full bg-zinc-300" />
                <span>{knownCount} известных</span>
              </>
            )}
          </div>

          <div className="mt-3 flex items-center gap-3">
            <SegmentedBar
              total={totalCount}
              owned={ownedCount}
              isComplete={isComplete}
            />
            <span className="font-heading text-[13px] font-black tabular-nums tracking-tight text-[#1A1A22] shrink-0">
              {ownedCount}
              <span className="text-zinc-300 mx-[1px]">/</span>
              <span className="text-zinc-400">{totalCount}</span>
            </span>
          </div>

          {description && (
            <p className="mt-2 text-[12px] text-zinc-400 leading-snug line-clamp-1 max-w-md">
              {description}
            </p>
          )}

          <div className="mt-3 inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.3em] font-black text-zinc-300 group-hover:text-[#E60012] transition-colors duration-300">
            <span>Открыть</span>
            <span className="transition-transform duration-300 group-hover:translate-x-1">
              →
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

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

export default function CollectionsList() {
  const { collections, loading, error } = useCollections();

  if (loading) return <Loading />;

  return (
    <div className="relative min-h-screen bg-[#FFF6EA] text-[#1A1A22]">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="absolute left-1/2 top-[20%] h-[900px] w-[900px]
                        -translate-x-1/2 rounded-full
                        bg-[radial-gradient(circle,rgba(255,180,0,0.18)_0%,transparent_65%)]
                        blur-3xl"
        />
        <div
          className="absolute inset-x-0 top-0 h-40
                        bg-[linear-gradient(180deg,#FFF9F0,transparent)]"
        />
      </div>

      {/* Контент — выровнен по хедеру */}
      <div className="relative z-10 max-w-7xl mx-auto px-3 sm:px-6 lg:px-10 py-10 md:py-16">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: EASE }}
          className="mb-8"
        >
          <Link
            to="/"
            className="group inline-flex items-center gap-2 px-4 py-2 rounded-full
                       bg-white/70 border border-[#F0E4D2] backdrop-blur-sm
                       text-[10px] uppercase tracking-[0.24em] font-bold text-zinc-500
                       hover:bg-white hover:text-[#1A1A22] transition-all"
          >
            <span className="text-base transition-transform group-hover:-translate-x-1">
              ←
            </span>
            На главную
          </Link>
        </motion.div>

        <motion.header
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: EASE }}
          className="max-w-2xl"
        >


          <h1
            className="font-heading font-black text-[40px] sm:text-[56px] md:text-[64px]
                         tracking-[-0.04em] leading-[0.95] text-[#1A1A22]"
          >
            Все коллекции
          </h1>

          <p className="mt-5 text-[15px] sm:text-[16px] text-zinc-500 leading-relaxed">
            Выбери серию, чтобы посмотреть прогресс или открыть новую коробку.
          </p>

          {collections.length > 0 && (
            <div
              className="mt-6 inline-flex items-center gap-3
                            px-4 py-2 rounded-full
                            bg-white/70 border border-[#F0E4D2] backdrop-blur-sm"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#FF9500]" />
              <span className="text-[12px] font-black text-[#1A1A22] tabular-nums">
                {collections.length}
              </span>
              <span className="text-[10px] uppercase tracking-[0.22em] text-zinc-400 font-bold">
                {plural(collections.length, ['серия', 'серии', 'серий'])}
              </span>
            </div>
          )}
        </motion.header>

        {error && (
          <div className="mt-12 text-center text-red-500 text-sm">
            Ошибка загрузки: {error}
          </div>
        )}

        {!error && collections.length === 0 && <EmptyState />}

        {!error && collections.length > 0 && (
          <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-16 md:gap-y-20">
            {collections.map((collection, i) => (
              <CollectionCard
                key={collection.id}
                collection={collection}
                index={i}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}