// src/pages/Leaderboard.jsx
import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { useLeaderboard } from '@/hooks/useLeaderboard';
import { useCollections } from '@/hooks/useCollections';
import { LeaderboardTable } from '@/components/leaderboard';
import { CollectionTabs } from '@/components/ui';

const EASE = [0.22, 1, 0.36, 1];

export default function Leaderboard() {
  const [activeCollection, setActiveCollection] = useState(null);

  const { rows, lastEvents, loading: lbLoading, error: lbError } =
    useLeaderboard(activeCollection);
  const { collections } = useCollections();

  const activeFigures = useMemo(() => {
    if (!activeCollection) return [];
    return collections.find((c) => c.id === activeCollection)?.figures || [];
  }, [collections, activeCollection]);

  const totalFiguresAll = useMemo(
    () => collections.reduce((s, c) => s + (c.figures?.length || 0), 0),
    [collections]
  );

  return (
    <div className="relative min-h-screen bg-[#FFF6EA] text-[#1A1A22] overflow-hidden">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-[15%] h-[900px] w-[900px]
                        -translate-x-1/2 rounded-full
                        bg-[radial-gradient(circle,rgba(255,180,0,0.18)_0%,transparent_65%)]
                        blur-3xl" />
        <div className="absolute inset-x-0 top-0 h-40
                        bg-[linear-gradient(180deg,#FFF9F0,transparent)]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-3 sm:px-6 lg:px-10 py-10 md:py-14">

        <motion.header
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: EASE }}
          className="max-w-2xl mb-8"
        >
          <h1 className="font-heading font-black text-[40px] sm:text-[56px] md:text-[64px]
                         tracking-[-0.04em] leading-[0.95] text-[#1A1A22]">
            Кто впереди?
          </h1>
        </motion.header>

        {/* Переключатель коллекций */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1, ease: EASE }}
          className="mb-6"
        >
          <CollectionTabs
            collections={collections}
            value={activeCollection}
            onChange={setActiveCollection}
          />
        </motion.div>

        {lbError && (
          <div className="mb-8 text-center text-red-500 text-sm">
            Ошибка загрузки: {lbError}
          </div>
        )}

        {!lbError && !lbLoading && rows.length > 0 && (
          <LeaderboardTable
            rows={rows}
            lastEvents={lastEvents}
            figures={activeFigures}
            collectionId={activeCollection}
            totalFiguresAll={totalFiguresAll}
          />
        )}

        {!lbError && !lbLoading && rows.length === 0 && (
          <div className="text-center text-zinc-400 py-16 text-sm">
            Пока никто не играл
          </div>
        )}

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