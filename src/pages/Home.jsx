// src/pages/Home.jsx
import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useCollections } from '@/hooks/useCollections';
import { useRefreshOnRoute } from '@/hooks/useRefreshOnFocus';
import {
  BackgroundFX,
  Header,
  BoxCarousel,
  CollectionPanel,
  HomeLoading,
  HomeError,
  HomeEmpty,
} from '@/components/home';

const ACTIVE_COL_KEY = 'popmart_active_collection_id';
const ACTIVE_COL_EVENT = 'popmart:active-collection-changed';

export default function Home() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { collections, loading, error, refresh } = useCollections();

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

  const activeId = collections[index]?.id;

  /* ── Сообщаем хедеру, какая коллекция выбрана ── */
  useEffect(() => {
    if (!activeId) return;
    localStorage.setItem(ACTIVE_COL_KEY, activeId);
    window.dispatchEvent(
      new CustomEvent(ACTIVE_COL_EVENT, { detail: { id: activeId } })
    );
  }, [activeId]);

  if (loading) return <HomeLoading />;
  if (error) return <HomeError message={error} />;
  if (!count) return <HomeEmpty />;

  const active = collections[index];

  const handleOpen = () => {
    navigate(`/unbox/${active.id}`);
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#FFF6EA] text-[#1A1A22]">
      <BackgroundFX />

      <main className="relative z-10 mx-auto max-w-7xl
                       px-3 sm:px-6 lg:px-10
                       pt-4 sm:pt-6 md:pt-8 pb-10">
        <Header />

        <div className="mt-8 grid items-center gap-10 md:mt-12
                        lg:grid-cols-[1.05fr_0.95fr] lg:gap-14">
          <BoxCarousel
            collections={collections}
            index={index}
            onChange={setIndex}
            onNext={() => go(1)}
            onPrev={() => go(-1)}
          />

          <CollectionPanel collection={active} onOpen={handleOpen} />
        </div>

        <div className="mt-14 flex justify-center">
          <div className="inline-flex items-center gap-3">
            <span className="w-1.5 h-1.5 rounded-full bg-[#E60012]" />
            <span className="text-[9px] uppercase tracking-[0.35em] font-black text-zinc-400">
              Pop Mart
            </span>
          </div>
        </div>
      </main>
    </div>
  );
}