// src/hooks/useUserFigures.js
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';

/**
 * Загружает фигурки текущего юзера из user_figures
 * + данные о самих фигурках.
 *
 * Возвращает:
 *   {
 *     owned: { [figureId]: count },
 *     loading,
 *     error,
 *     refresh,
 *   }
 */
export function useUserFigures(collectionId) {
  const { user } = useAuth();
  const [owned, setOwned] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (!user || !collectionId) {
      setOwned({});
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    (async () => {
      try {
        const { data, error: err } = await supabase
          .from('user_figures')
          .select('figure_id, count')
          .eq('collection_id', collectionId);

        if (err) throw err;

        if (!cancelled) {
          const map = {};
          (data || []).forEach((row) => {
            map[row.figure_id] = row.count;
          });
          setOwned(map);
          setLoading(false);
        }
      } catch (e) {
        if (!cancelled) {
          console.error('[useUserFigures]', e);
          setError(e.message || 'Ошибка загрузки');
          setLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [user, collectionId, tick]);

  const refresh = () => setTick((t) => t + 1);

  return { owned, loading, error, refresh };
}