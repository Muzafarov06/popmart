// src/pages/Home.jsx
import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useCollections } from '@/hooks/useCollections';
import { useRefreshOnRoute } from '@/hooks/useRefreshOnFocus';
import { useRecentEvents } from '@/hooks/useRecentEvents';
import {
  BackgroundFX,
  Header,
  BoxCarousel,
  CollectionPanel,
  BottomStripe,
  HomeLoading,
  HomeError,
  HomeEmpty,
} from '@/components/home';
import { LiveTicker } from '@/components/leaderboard';

export default function Home() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { collections, loading, error, refresh } = useCollections();
  const { events } = useRecentEvents(15);

  const [index, setIndex] = useState(0);
  const count = collections.length;

  useRefreshOnRoute(refresh);

  useEffect(() => {
    if (index > count - 1) setIndex(Math.max(0, count - 1));
  }, [count, index]);

  const go = useCallback(
    (dir) => setIndex((i) => Math.min(count - 1, Math.max(0, i + dir))),
    [count]
  );

  useEffect(() => {
    if (count < 2) return;
    const onKey = (e) => {
      if (e.key === 'ArrowRight') go(1);
      if (e.key === 'ArrowLeft') go(-1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [go, count]);

  if (loading) return <HomeLoading />;
  if (error) return <HomeError message={error} />;
  if (!count) return <HomeEmpty />;

  const active = collections[index];

  const handleOpen = () => {
    navigate(`/unbox/${active.id}`);
  };

  return (
    <>
      <div className="relative min-h-screen overflow-hidden bg-[#FFF6EA] text-[#1A1A22]">
        <BackgroundFX />

        {/* main теперь совпадает с хедером: max-w-7xl + px-3 sm:px-6 lg:px-10 */}
        <main className="relative z-10 mx-auto max-w-7xl
                         px-3 sm:px-6 lg:px-10
                         pb-52 pt-4 sm:pt-6 md:pt-8">
          <Header user={user} count={count} active={active} />

          <div className="mt-6 grid items-center gap-10 md:mt-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-14">
            <BoxCarousel
              collections={collections}
              index={index}
              onChange={setIndex}
              onNext={() => go(1)}
              onPrev={() => go(-1)}
            />

            <CollectionPanel collection={active} onOpen={handleOpen} />
          </div>

          {events.length > 0 && (
            <div className="mt-10 sm:mt-12">
              <LiveTicker events={events} />
            </div>
          )}
        </main>
      </div>

      <BottomStripe />

      <style>{`
        @keyframes pm-shine { to { transform: translateX(340%) skewX(-20deg); } }
        .pm-btn .pm-shine { transform: translateX(-160%) skewX(-20deg); }
        .pm-btn:hover:not(.disabled) .pm-shine { animation: pm-shine .85s ease; }
      `}</style>
    </>
  );
}