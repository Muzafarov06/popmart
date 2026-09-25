// src/pages/Unbox.jsx
import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { useCollection } from '@/hooks/useCollection';
import { useUnbox } from '@/hooks/useUnbox';
import {
  BoxClosed,
  BoxOpening,
  CardReveal,
  FigureReveal,
  MultiResult,
  CollectionCompleteModal,
} from '@/components/unbox';

const PHASE = {
  CLOSED: 'closed',
  OPENING: 'opening',
  CARD: 'card',
  FIGURE: 'figure',
  MULTI: 'multi',
  ERROR: 'error',
};

const MULTI_COUNT = 50;
const EASE = [0.22, 1, 0.36, 1];

export default function Unbox() {
  const { collectionId } = useParams();
  const navigate = useNavigate();

  const { collection, loading: colLoading, error: colError } = useCollection(collectionId);
  const { unbox, unboxMany, loading: unboxLoading, error: unboxError } = useUnbox();

  const [phase, setPhase] = useState(PHASE.CLOSED);
  const [result, setResult] = useState(null);
  const [multiResults, setMultiResults] = useState([]);
  const [newQueue, setNewQueue] = useState([]);
  const [newQueueIndex, setNewQueueIndex] = useState(0);
  const [sessionStats, setSessionStats] = useState({ total: 0, new: 0 });
  const [showComplete, setShowComplete] = useState(false);

  const busyRef = useRef(false);

  const initialCheckDoneRef = useRef(false);
  const wasCompleteOnLoadRef = useRef(false);
  const completeShownRef = useRef(false);

  const isMultiSession = multiResults.length > 0;
  const isReviewingNew = isMultiSession && newQueue.length > 0 && phase !== PHASE.MULTI;
  const isLastNew = isReviewingNew && newQueueIndex === newQueue.length - 1;

  // ─── Первичная проверка при заходе ───
  useEffect(() => {
    if (!collection || initialCheckDoneRef.current) return;
    initialCheckDoneRef.current = true;

    (async () => {
      try {
        const { data } = await supabase
          .from('user_figures')
          .select('figure_id')
          .eq('collection_id', collectionId);

        const uniqueCount = new Set((data || []).map((r) => r.figure_id)).size;
        const isComplete = uniqueCount >= collection.figures.length;

        wasCompleteOnLoadRef.current = isComplete;

        if (isComplete) {
          setShowComplete(true);
          completeShownRef.current = true;
        }
      } catch {}
    })();
  }, [collection, collectionId]);

  const checkCompletionOnce = async () => {
    if (completeShownRef.current) return;
    if (wasCompleteOnLoadRef.current) return;

    try {
      const { data } = await supabase
        .from('user_figures')
        .select('figure_id')
        .eq('collection_id', collectionId);

      const uniqueCount = new Set((data || []).map((r) => r.figure_id)).size;

      if (uniqueCount >= collection.figures.length) {
        setShowComplete(true);
        completeShownRef.current = true;
      }
    } catch {}
  };

  const handleOpen = async () => {
    if (busyRef.current) return;
    busyRef.current = true;

    setMultiResults([]);
    setNewQueue([]);
    setNewQueueIndex(0);
    setPhase(PHASE.OPENING);

    try {
      const [figure] = await Promise.all([
        unbox(collectionId),
        new Promise((res) => setTimeout(res, 1700)),
      ]);

      if (!figure) {
        setPhase(PHASE.ERROR);
        return;
      }

      setResult(figure);
      setSessionStats((s) => ({
        total: s.total + 1,
        new: s.new + (figure.isNew ? 1 : 0),
      }));

      setPhase(PHASE.CARD);
    } finally {
      busyRef.current = false;
    }
  };

  const handleMultiOpen = async () => {
    if (busyRef.current) return;
    busyRef.current = true;

    setMultiResults([]);
    setNewQueue([]);
    setNewQueueIndex(0);
    setPhase(PHASE.OPENING);

    try {
      const [results] = await Promise.all([
        unboxMany(collectionId, MULTI_COUNT),
        new Promise((res) => setTimeout(res, 1700)),
      ]);

      if (!results || results.length === 0) {
        setPhase(PHASE.ERROR);
        return;
      }

      const newOnes = [];
      const seen = new Set();
      results.forEach((r) => {
        if (r.isNew && !seen.has(r.id)) {
          seen.add(r.id);
          newOnes.push(r);
        }
      });

      setMultiResults(results);
      setNewQueue(newOnes);
      setNewQueueIndex(0);

      setSessionStats((s) => ({
        total: s.total + results.length,
        new: s.new + newOnes.length,
      }));

      if (newOnes.length > 0) {
        setResult(newOnes[0]);
        setPhase(PHASE.CARD);
      } else {
        setPhase(PHASE.MULTI);
      }
    } finally {
      busyRef.current = false;
    }
  };

  const handleCardNext = () => setPhase(PHASE.FIGURE);

  const handleFigureNext = async () => {
    if (isReviewingNew) {
      const nextIndex = newQueueIndex + 1;

      if (nextIndex < newQueue.length) {
        setNewQueueIndex(nextIndex);
        setResult(newQueue[nextIndex]);
        setPhase(PHASE.CARD);
      } else {
        await checkCompletionOnce();
        setResult(null);
        setPhase(PHASE.MULTI);
      }
      return;
    }

    await checkCompletionOnce();
    setResult(null);
    setPhase(PHASE.CLOSED);
  };

  const handleReset = () => {
    setResult(null);
    setMultiResults([]);
    setNewQueue([]);
    setNewQueueIndex(0);
    setPhase(PHASE.CLOSED);
  };

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') navigate('/');
      if ((e.key === ' ' || e.key === 'Enter') && phase === PHASE.CLOSED) {
        e.preventDefault();
        handleOpen();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  if (colLoading) {
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

  if (colError || !collection) {
    return (
      <div className="min-h-screen bg-[#FFF6EA] flex flex-col items-center justify-center text-center px-6">
        <span className="text-5xl">⚠</span>
        <h1 className="mt-4 font-heading font-black text-2xl">Коллекция не найдена</h1>
        <p className="mt-2 text-zinc-500 text-sm">{colError || 'Такой коллекции нет'}</p>
        <Link
          to="/"
          className="mt-6 px-6 py-3 rounded-2xl bg-[#FFB800] text-white text-[11px] font-bold uppercase tracking-[0.2em]"
        >
          На главную
        </Link>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#FFF6EA] text-[#1A1A22]">

      {/* ═══════════ ФОН ═══════════ */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {/* Основное свечение */}
        <div className="absolute left-1/2 top-[44%] h-[1000px] w-[1000px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(255,180,0,0.28)_0%,transparent_60%)] blur-3xl" />

        {/* Лучи — мягче */}
        <div
          className="absolute left-1/2 top-[44%] h-[1800px] w-[1800px] -translate-x-1/2 -translate-y-1/2 opacity-[0.045]"
          style={{
            background:
              'repeating-conic-gradient(from 0deg at 50% 50%, #FF9500 0deg 5deg, transparent 5deg 15deg)',
            WebkitMaskImage:
              'radial-gradient(circle at 50% 50%, #000 0%, #000 24%, transparent 65%)',
            maskImage:
              'radial-gradient(circle at 50% 50%, #000 0%, #000 24%, transparent 65%)',
          }}
        />

        {/* Верхний градиент — чистый верх */}
        <div className="absolute inset-x-0 top-0 h-48 bg-[linear-gradient(180deg,#FFF9F0_40%,transparent)]" />

        {/* Нижний градиент */}
        <div className="absolute inset-x-0 bottom-0 h-64 bg-[linear-gradient(0deg,#FFF1DC_40%,transparent)]" />

        {/* Декор: круги-звёзды в углах */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 40, repeat: Infinity, ease: 'linear' }}
          className="absolute top-[12%] left-[8%] w-10 h-10 hidden md:block opacity-[0.15]"
        >
          <svg viewBox="0 0 40 40" fill="none">
            <path
              d="M20 0 L22 18 L40 20 L22 22 L20 40 L18 22 L0 20 L18 18 Z"
              fill="#FF9500"
            />
          </svg>
        </motion.div>
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 50, repeat: Infinity, ease: 'linear' }}
          className="absolute bottom-[18%] right-[10%] w-8 h-8 hidden md:block opacity-[0.12]"
        >
          <svg viewBox="0 0 40 40" fill="none">
            <path
              d="M20 0 L22 18 L40 20 L22 22 L20 40 L18 22 L0 20 L18 18 Z"
              fill="#FF9500"
            />
          </svg>
        </motion.div>
      </div>

      {/* ═══════════ ШАПКА ═══════════ */}
      <header className="relative z-10 max-w-6xl mx-auto px-5 pt-6 sm:px-8">
        {/* Верхняя строка: назад + статистика */}
        <div className="flex items-center justify-between gap-4">
          <Link
            to="/"
            className="group inline-flex items-center gap-2 px-4 py-2 rounded-full
                       bg-white/70 border border-[#F0E4D2] backdrop-blur-sm
                       text-[10px] uppercase tracking-[0.24em] font-bold text-zinc-500
                       hover:bg-white hover:text-[#1A1A22] transition-all"
          >
            <span className="text-base transition-transform group-hover:-translate-x-1">←</span>
            Назад
          </Link>

          <div className="flex items-center gap-2">
            {sessionStats.total > 0 && (
              <>
                <div className="flex items-center gap-2 px-3.5 py-2 rounded-full bg-white/70 border border-[#F0E4D2] backdrop-blur-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#1A1A22]" />
                  <span className="text-[11px] font-black uppercase tracking-[0.15em] text-[#1A1A22] tabular-nums">
                    {sessionStats.total}
                  </span>
                  <span className="text-[9px] uppercase tracking-[0.18em] text-zinc-400 font-semibold">
                    открыто
                  </span>
                </div>
                {sessionStats.new > 0 && (
                  <div className="flex items-center gap-2 px-3.5 py-2 rounded-full bg-[#1E7A44]/10 border border-[#1E7A44]/25 backdrop-blur-sm">
                    <motion.span
                      animate={{ scale: [1, 1.3, 1] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                      className="w-1.5 h-1.5 rounded-full bg-[#1E7A44]"
                    />
                    <span className="text-[11px] font-black uppercase tracking-[0.15em] text-[#1E7A44] tabular-nums">
                      +{sessionStats.new}
                    </span>
                    <span className="text-[9px] uppercase tracking-[0.18em] text-[#1E7A44]/70 font-semibold">
                      новых
                    </span>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Центр: заголовок коллекции / прогресс новых */}
        <div className="mt-10 flex justify-center">
          {isReviewingNew ? (
            <ReviewingBanner
              current={newQueueIndex + 1}
              total={newQueue.length}
              of={MULTI_COUNT}
            />
          ) : (
            <CollectionBanner name={collection.name} />
          )}
        </div>
      </header>

      {/* ═══════════ СЦЕНА ═══════════ */}
      <main className="relative z-10 flex items-center justify-center px-5 py-8 sm:py-12 min-h-[calc(100vh-260px)]">
        <div className="w-full max-w-3xl relative">
          <AnimatePresence mode="wait">

            {phase === PHASE.CLOSED && (
              <motion.div
                key="closed-wrap"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center"
              >
                <BoxClosed
                  cover={collection.cover}
                  name={collection.name}
                  onClick={handleOpen}
                  disabled={unboxLoading}
                />

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5, duration: 0.5, ease: EASE }}
                  className="mt-12 flex flex-col items-center gap-4"
                >
                  {/* Кнопка ×5 */}
                  <button
                    onClick={handleMultiOpen}
                    disabled={unboxLoading}
                    className="pm-btn group relative inline-flex items-center gap-3
                               px-8 py-4 rounded-full
                               bg-[#1A1A22] text-white
                               font-heading text-[12px] font-black uppercase tracking-[0.22em]
                               shadow-[0_16px_32px_-12px_rgba(26,26,34,0.5)]
                               hover:shadow-[0_22px_44px_-12px_rgba(26,26,34,0.7)]
                               hover:-translate-y-1 active:translate-y-0
                               transition-all duration-200
                               disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <span className="relative flex w-4 h-4 items-center justify-center">
                      <span className="absolute inset-0 rounded-full bg-white/30 group-hover:animate-ping" />
                      <span className="relative w-2 h-2 rounded-full bg-white" />
                    </span>
                    Крутить ×{MULTI_COUNT}
                    <span className="pm-shine absolute inset-y-0 -left-1/3 w-1/3 bg-white/25 blur-md rounded-full" />
                  </button>

                  <p className="text-[9px] uppercase tracking-[0.3em] text-zinc-400 font-semibold">
                    без ограничений
                  </p>
                </motion.div>
              </motion.div>
            )}

            {phase === PHASE.OPENING && (
              <BoxOpening
                key="opening"
                cover={collection.cover}
                name={collection.name}
              />
            )}

            {phase === PHASE.CARD && result && (
              <CardReveal
                key={`card-${result.id}-${newQueueIndex}`}
                result={result}
                onNext={handleCardNext}
              />
            )}

            {phase === PHASE.FIGURE && result && (
              <FigureReveal
                key={`figure-${result.id}-${newQueueIndex}`}
                result={result}
                onAgain={handleFigureNext}
                backLabel={
                  isReviewingNew
                    ? isLastNew
                      ? 'К карточкам'
                      : `Следующая (${newQueueIndex + 2} / ${newQueue.length})`
                    : 'Открыть ещё'
                }
              />
            )}

            {phase === PHASE.MULTI && multiResults.length > 0 && (
              <MultiResult
                key="multi"
                results={multiResults}
                newCount={newQueue.length}
                onClose={handleReset}
              />
            )}

            {phase === PHASE.ERROR && (
              <motion.div
                key="error"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="text-center"
              >
                <span className="text-5xl">⚠</span>
                <h2 className="mt-4 font-heading font-black text-2xl">Не получилось</h2>
                <p className="mt-2 text-zinc-500 text-sm">
                  {unboxError || 'Попробуй ещё раз'}
                </p>
                <button
                  onClick={handleReset}
                  className="mt-6 px-6 py-3 rounded-full bg-[#FFB800] text-white text-[11px] font-bold uppercase tracking-[0.2em]"
                >
                  Попробовать снова
                </button>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </main>

      {/* ═══════════ ПОДВАЛ-ШТАМП ═══════════ */}
      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.8 }}
        className="relative z-10 pb-6 flex justify-center pointer-events-none"
      >
        <div className="flex items-center gap-3 px-5 py-2 rounded-full bg-white/50 border border-[#F0E4D2] backdrop-blur-sm">
          <span className="w-1.5 h-1.5 rounded-full bg-[#E60012]" />
          <span className="text-[9px] uppercase tracking-[0.35em] font-black text-zinc-400">
            Pop Mart
          </span>
        </div>
      </motion.footer>

      {/* Модалка завершения */}
      <AnimatePresence>
        {showComplete && (
          <CollectionCompleteModal
            collectionName={collection.name}
            onClose={() => setShowComplete(false)}
          />
        )}
      </AnimatePresence>

      <style>{`
        @keyframes pm-shine { to { transform: translateX(340%) skewX(-20deg); } }
        .pm-btn .pm-shine { transform: translateX(-160%) skewX(-20deg); }
        .pm-btn:hover:not(:disabled) .pm-shine { animation: pm-shine .85s ease; }
      `}</style>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════ */
/*                    ВСПОМОГАТЕЛЬНЫЕ                       */
/* ═══════════════════════════════════════════════════════ */

/** Заголовок: название коллекции в стиле POP MART-плашки */
function CollectionBanner({ name }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: EASE }}
      className="inline-flex flex-col items-center gap-2"
    >
      {/* Ленточка POP MART */}
      <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#E60012] rounded-sm">
        <span className="text-white text-[8px] font-black tracking-[0.35em] uppercase">
          Pop Mart
        </span>
      </div>

      {/* Название коллекции */}
      <h1 className="font-heading font-black text-[28px] sm:text-[36px] md:text-[42px]
                     tracking-[-0.035em] leading-none text-[#1A1A22]">
        {name}
      </h1>

      {/* Разделитель */}
      <div className="flex items-center gap-2 mt-1">
        <span className="w-8 h-px bg-[#B87400]/40" />
        <span className="text-[9px] font-black uppercase tracking-[0.32em] text-[#B87400]">
          Открытие коробки
        </span>
        <span className="w-8 h-px bg-[#B87400]/40" />
      </div>
    </motion.div>
  );
}

/** Баннер: счётчик новых при просмотре */
function ReviewingBanner({ current, total, of }) {
  const progress = (current / total) * 100;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: EASE }}
      className="relative inline-flex flex-col items-center gap-3
                 px-8 py-4 rounded-3xl
                 bg-[#1A1A22] text-white
                 shadow-[0_24px_48px_-16px_rgba(26,26,34,0.6)]"
    >
      {/* Ленточка сверху */}
      <span className="absolute -top-2 left-1/2 -translate-x-1/2 px-3 py-0.5
                       bg-[#E60012] rounded-sm
                       text-[8px] font-black tracking-[0.3em] uppercase">
        Новая
      </span>

      {/* Счётчик */}
      <div className="flex items-baseline gap-2 tabular-nums">
        <span className="text-[36px] font-heading font-black leading-none text-white">
          {current}
        </span>
        <span className="text-[20px] text-white/30 font-bold">/</span>
        <span className="text-[24px] text-white/60 font-bold">{total}</span>
      </div>

      {/* Прогресс-полоска */}
      <div className="w-40 h-1 rounded-full bg-white/15 overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.6, ease: EASE }}
          className="h-full rounded-full bg-[linear-gradient(90deg,#FFB800,#FF6B00)]"
        />
      </div>

      {/* Подпись "из N" */}
      <span className="text-[8px] uppercase tracking-[0.3em] text-white/40 font-bold">
        из {of} открытых
      </span>
    </motion.div>
  );
}