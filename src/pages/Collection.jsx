// src/pages/Collection.jsx
import { useMemo, useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { useCollection } from '@/hooks/useCollection';
import { useUserFigures } from '@/hooks/useUserFigures';
import {
  FigureCard,
  CollectionProgress,
  FigureDetailModal,
} from '@/components/collection';

const EASE = [0.22, 1, 0.36, 1];

export default function Collection() {
  const { collectionId } = useParams();

  const { collection, loading: colLoading, error: colError } = useCollection(collectionId);
  const { owned, loading: ownLoading } = useUserFigures(collectionId);

  const [selected, setSelected] = useState(null);

  const ownedCount = useMemo(() => Object.keys(owned).length, [owned]);

  // Загрузка
  if (colLoading || ownLoading) {
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
    return <Navigate to="/" replace />;
  }

  return (
    <div className="relative min-h-screen bg-[#FFF6EA] text-[#1A1A22]">
      {/* Фон */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-[10%] h-[900px] w-[900px] -translate-x-1/2 rounded-full
                        bg-[radial-gradient(circle,rgba(255,180,0,0.18)_0%,transparent_65%)]
                        blur-3xl" />
      </div>

      {/* Контент — выровнен по хедеру */}
      <div className="relative z-10 max-w-7xl mx-auto px-3 sm:px-6 lg:px-10 py-10 md:py-14">

        {/* Навигация назад */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: EASE }}
          className="mb-10"
        >
          <Link
            to="/collections"
            className="group inline-flex items-center gap-2
                       text-[10px] uppercase tracking-[0.28em] font-bold
                       text-zinc-500 hover:text-[#1A1A22] transition-colors"
          >
            <span className="text-base transition-transform group-hover:-translate-x-1">←</span>
            Все коллекции
          </Link>
        </motion.div>

        {/* Заголовок + соты */}
        <CollectionProgress
          collection={collection}
          owned={owned}
          ownedCount={ownedCount}
          onSelect={setSelected}
        />

        {/* Сетка карточек */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3, ease: EASE }}
          className="mt-16"
        >
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3 sm:gap-4">
            {collection.figures.map((figure, i) => (
              <FigureCard
                key={figure.id}
                figure={figure}
                collection={collection}
                owned={owned[figure.id] || 0}
                index={i}
                onClick={() => setSelected(figure)}
              />
            ))}
          </div>
        </motion.section>

        {/* Кнопка «Открыть коробку» */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4, ease: EASE }}
          className="mt-14 flex justify-center"
        >
          <Link
            to={`/unbox/${collection.id}`}
            className="pm-btn group relative inline-flex items-center gap-3
                       px-8 py-4 rounded-full
                       bg-[#1A1A22] text-white
                       font-heading text-[12px] font-black uppercase tracking-[0.22em]
                       shadow-[0_16px_32px_-12px_rgba(26,26,34,0.5)]
                       hover:shadow-[0_22px_44px_-12px_rgba(26,26,34,0.7)]
                       hover:-translate-y-1 active:translate-y-0
                       transition-all duration-200"
          >
            <span className="relative flex w-4 h-4 items-center justify-center">
              <span className="absolute inset-0 rounded-full bg-white/30 group-hover:animate-ping" />
              <span className="relative w-2 h-2 rounded-full bg-white" />
            </span>
            Открыть коробку
            <span
              aria-hidden
              className="pm-shine absolute inset-y-0 -left-1/3 w-1/3 bg-white/25 blur-md rounded-full"
            />
          </Link>
        </motion.div>

      </div>

      {/* Модалка */}
      <AnimatePresence>
        {selected && (
          <FigureDetailModal
            figure={selected}
            collection={collection}
            owned={owned[selected.id] || 0}
            onClose={() => setSelected(null)}
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