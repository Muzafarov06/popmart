// src/hooks/useUserFigures.js
import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';

const cache = new Map();
const TTL = 30 * 1000;

const cacheKey = (userId, collectionId) => `${userId}:${collectionId}`;

function readCache(key) {
  const hit = cache.get(key);
  if (!hit) return null;
  if (Date.now() - hit.ts > TTL) return null;
  return hit.data;
}
function writeCache(key, data) {
  cache.set(key, { data, ts: Date.now() });
}

export function invalidateUserFigures(userId, collectionId) {
  if (!userId) {
    cache.clear();
    return;
  }
  if (collectionId) {
    cache.delete(cacheKey(userId, collectionId));
    return;
  }
  for (const key of cache.keys()) {
    if (key.startsWith(`${userId}:`)) cache.delete(key);
  }
}

export function useUserFigures(collectionId) {
  const { user } = useAuth();
  const userId = user?.supabaseId || user?.login;
  const key = userId && collectionId ? cacheKey(userId, collectionId) : null;
  const cached = key ? readCache(key) : null;

  const [owned, setOwned] = useState(cached || {});
  const [loading, setLoading] = useState(!cached);
  const [error, setError] = useState(null);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (!user || !collectionId) {
      setOwned({});
      setLoading(false);
      return;
    }

    let cancelled = false;
    const hit = readCache(key);

    if (hit) {
      setOwned(hit);
      setLoading(false);
    } else {
      setLoading(true);
    }
    setError(null);

    (async () => {
      try {
        const { data, error: err } = await supabase
          .from('user_figures')
          .select('figure_id, count')
          .eq('collection_id', collectionId);

        if (err) throw err;
        if (cancelled) return;

        const map = {};
        (data || []).forEach((row) => {
          map[row.figure_id] = row.count;
        });

        setOwned(map);
        if (key) writeCache(key, map);
        setLoading(false);
      } catch (e) {
        if (cancelled) return;
        console.error('[useUserFigures]', e);
        setError(e.message || 'Ошибка загрузки');
        setLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, [user, collectionId, tick, key]);

  const refresh = useCallback(() => {
    if (key) cache.delete(key);
    setTick((t) => t + 1);
  }, [key]);

  return { owned, loading, error, refresh };
}