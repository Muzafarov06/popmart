// src/pages/Unbox.jsx
import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { useCollection } from '@/hooks/useCollection';
import { useUnbox } from '@/hooks/useUnbox';
import { useDailyBonus } from '@/hooks/useDailyBonus';
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

const EASE = [0.22, 1, 0.36, 1];

/* ─── SVG-подарок ─── */
function GiftIcon({ className = 'w-5 h-5' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      className={className}>
      <path d="M20 12v10H4V12M2 7h20v5H2zM12 22V7" />
      <path d="M12 7H7.5a2.5 2.5 0 010-5C11 2 12 7 12 7zM12 7h4.5a2.5 2.5 0 000-5C13 2 12 7 12 7z" />
    </svg>
  );
}

export default function Unbox() {
  const { collectionId } = useParams();
  const navigate = useNavigate();

  const { collection, loading: colLoading, error: colError } = useCollection(collectionId);
  const { unbox, unboxMany, loading: unboxLoading, error: unboxError } = useUnbox();
  const { available: bonusAvailable, claim: claimBonus } = useDailyBonus();

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

  /* Проверка завершённости при заходе */
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

  /* ─── Открытие одной ─── */
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

      if (!figure) { setPhase(PHASE.ERROR); return; }

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

  /* ─── Открытие ×N ─── */
  const handleMultiOpen = async (count = 3) => {
    if (busyRef.current) return;
    busyRef.current = true;

    setMultiResults([]);
    setNewQueue([]);
    setNewQueueIndex(0);
    setPhase(PHASE.OPENING);

    try {
      const [results] = await Promise.all([
        unboxMany(collectionId, count),
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

  /* ─── Бонус дня ×10 ─── */
  const handleBonusOpen = async () => {
    if (busyRef.current || !bonusAvailable) return;
    busyRef.current = true;

    setMultiResults([]);
    setNewQueue([]);
    setNewQueueIndex(0);
    setPhase(PHASE.OPENING);

    try {
      const [res] = await Promise.all([
        claimBonus(collectionId),
        new Promise((r) => setTimeout(r, 1700)),
      ]);

      const results = res?.data || [];

      if (!results.length) { setPhase(PHASE.ERROR); return; }

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
        <div className="absolute left-1/2 top-[44%] h-[1000px] w-[1000px] -translate-x-1/2 -translate-y-1/2
                        rounded-full bg-[radial-gradient(circle,rgba(255,180,0,0.28)_0%,transparent_60%)] blur-3xl" />
        <div
          className="absolute left-1/2 top-[44%] h-[1800px] w-[1800px] -translate-x-1/2 -translate-y-1/2 opacity-[0.045]"
          style={{
            background: 'repeating-conic-gradient(from 0deg at 50% 50%, #FF9500 0deg 5deg, transparent 5deg 15deg)',
            WebkitMaskImage: 'radial-gradient(circle at 50% 50%, #000 0%, #000 24%, transparent 65%)',
            maskImage: 'radial-gradient(circle at 50% 50%, #000 0%, #000 24%, transparent 65%)',
          }}
        />
        <div className="absolute inset-x-0 top-0 h-40 bg-[linear-gradient(180deg,#FFF9F0_40%,transparent)]" />
        <div className="absolute inset-x-0 bottom-0 h-56 bg-[linear-gradient(0deg,#FFF1DC_40%,transparent)]" />
      </div>

      {/* ═══════════ ШАПКА ═══════════ */}
      <header className="relative z-10 max-w-6xl mx-auto px-5 pt-5 sm:px-8">
        <div className="flex items-center justify-between gap-3">
          {/* Назад — просто текст */}
          <Link
            to="/"
            className="group inline-flex items-center gap-2
                       text-[10px] uppercase tracking-[0.28em] font-bold
                       text-zinc-500 hover:text-[#1A1A22] transition-colors"
          >
            <span className="text-base transition-transform group-hover:-translate-x-1">←</span>
            Назад
          </Link>

          {sessionStats.total > 0 && (
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-black tabular-nums text-zinc-500">
                  {sessionStats.total}
                </span>
                <span className="text-[9px] uppercase tracking-[0.18em] text-zinc-400 font-semibold">
                  открыто
                </span>
              </div>
              {sessionStats.new > 0 && (
                <div className="flex items-center gap-2">
                  <motion.span
                    animate={{ opacity: [1, 0.25, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className="w-1.5 h-1.5 rounded-full bg-[#1E7A44]"
                  />
                  <span className="text-[11px] font-black tabular-nums text-[#1E7A44]">
                    +{sessionStats.new}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      </header>

      {/* ═══════════ СЦЕНА ═══════════ */}
      <main className="relative z-10 flex flex-col items-center justify-center px-5 pt-6 pb-12 sm:pt-10
                       min-h-[calc(100vh-140px)]">
        <div className="w-full max-w-3xl flex flex-col items-center">
          <AnimatePresence mode="wait">

            {phase === PHASE.CLOSED && (
              <motion.div
                key="closed-wrap"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center w-full"
              >
                <BoxClosed
                  cover={collection.cover}
                  name={collection.name}
                  onClick={handleOpen}
                  disabled={unboxLoading}
                />

                {/* ─── Кнопка действия ─── */}
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5, duration: 0.5, ease: EASE }}
                  className="mt-9 w-full flex flex-col items-center"
                >
                  {bonusAvailable ? (
                    <>
                      <motion.button
                        onClick={handleBonusOpen}
                        disabled={unboxLoading}
                        whileHover={{ y: -3 }}
                        whileTap={{ scale: 0.97 }}
                        className="group relative inline-flex items-center gap-3
                                   px-8 py-4 rounded-2xl
                                   bg-[linear-gradient(110deg,#FFB800_0%,#FF9500_45%,#FF6B00_100%)]
                                   text-white
                                   font-heading text-[13px] font-black uppercase
                                   tracking-[0.22em]
                                   shadow-[0_20px_40px_-14px_rgba(255,140,0,0.85)]
                                   hover:shadow-[0_24px_48px_-14px_rgba(255,140,0,1)]
                                   disabled:opacity-40 disabled:cursor-not-allowed
                                   transition-shadow duration-200"
                      >
                        <span className="relative flex items-center justify-center
                                         w-6 h-6 shrink-0">
                          <GiftIcon className="w-5 h-5" />
                        </span>
                        <span className="relative">
                          Бонус дня · ×10
                        </span>
                      </motion.button>

                      <p className="mt-3 text-[10px] uppercase tracking-[0.28em]
                                    text-[#B87400] font-black">
                        ✦ раз в сутки
                      </p>
                    </>
                  ) : (
                    <>
                      <motion.button
                        onClick={() => handleMultiOpen(3)}
                        disabled={unboxLoading}
                        whileHover={{ y: -3 }}
                        whileTap={{ scale: 0.97 }}
                        className="group relative inline-flex items-center gap-3
                                   px-8 py-4 rounded-2xl
                                   bg-[#1A1A22] text-white
                                   font-heading text-[13px] font-black uppercase
                                   tracking-[0.22em]
                                   shadow-[0_20px_40px_-14px_rgba(26,26,34,0.6)]
                                   hover:bg-[#E60012]
                                   hover:shadow-[0_24px_48px_-14px_rgba(230,0,18,0.55)]
                                   disabled:opacity-40 disabled:cursor-not-allowed
                                   transition-all duration-200"
                      >
                        <span className="relative">Открыть ×3</span>
                      </motion.button>

                      <p className="mt-3 text-[10px] uppercase tracking-[0.28em]
                                    text-zinc-400 font-bold">
                        три фигурки за раз
                      </p>
                    </>
                  )}
                </motion.div>
              </motion.div>
            )}

            {phase === PHASE.OPENING && (
              <BoxOpening key="opening" cover={collection.cover} name={collection.name} />
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
                collectionId={collectionId}
                onAgain={handleFigureNext}
              />
            )}

            {phase === PHASE.MULTI && multiResults.length > 0 && (
              <MultiResult
                key="multi"
                results={multiResults}
                newCount={newQueue.length}
                collectionId={collectionId}
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

      {/* ═══════════ ШТАМП ═══════════ */}
      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.8 }}
        className="relative z-10 pb-5 flex justify-center pointer-events-none"
      >
        <div className="mt-14 flex justify-center">
          <div className="inline-flex items-center gap-3">
            <span className="w-1.5 h-1.5 rounded-full bg-[#E60012]" />
            <span className="text-[9px] uppercase tracking-[0.35em] font-black text-zinc-400">
              Pop Mart
            </span>
          </div>
        </div>
      </motion.footer>

      <AnimatePresence>
        {showComplete && (
          <CollectionCompleteModal
            collectionName={collection.name}
            onClose={() => setShowComplete(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}