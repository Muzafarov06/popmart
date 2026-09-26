// src/hooks/useCollections.js
import { useCallback, useEffect, useRef, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';

let cache = null;
const TTL = 60 * 1000;

function readCache(userId) {
  if (!cache) return null;
  if (cache.userId !== userId) return null;
  if (Date.now() - cache.ts > TTL) return null;
  return cache.data;
}
function writeCache(userId, data) {
  cache = { data, ts: Date.now(), userId };
}

function groupOwnedByCollection(rows) {
  const map = {};
  for (const row of rows || []) {
    if (!map[row.collection_id]) map[row.collection_id] = {};
    map[row.collection_id][row.figure_id] = row.count;
  }
  return map;
}

function buildCollection(raw, ownedMap) {
  const figures = [...(raw.figures || [])].sort(
    (a, b) => a.sort_order - b.sort_order
  );
  const owned = ownedMap[raw.id] || {};
  const ownedCount = Object.keys(owned).length;
  const totalCount = figures.length;

  return {
    ...raw,
    figures,
    owned,
    ownedCount,
    totalCount,
    progress: totalCount ? (ownedCount / totalCount) * 100 : 0,
    hasSecret: figures.some((f) => f.is_secret),
    isComplete: totalCount > 0 && ownedCount === totalCount,
  };
}

export function useCollections() {
  const { user } = useAuth();
  const userId = user?.supabaseId || user?.login;

  const cached = userId ? readCache(userId) : null;

  const [collections, setCollections] = useState(cached || []);
  const [loading, setLoading] = useState(!cached);
  const [error, setError] = useState(null);
  const abortRef = useRef(null);

  const load = useCallback(async (silent = false) => {
    if (!user) {
      setCollections([]);
      setLoading(false);
      return;
    }

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    if (!silent) setError(null);

    try {
      const [colsRes, ufRes] = await Promise.all([
        supabase
          .from('collections')
          .select(`
            id, name, description, cover, hero_cover, display_cover,
            is_active, sort_order,
            figures:figures(
              id, name, rarity, weight, points,
              image, card, silhouette, is_secret, sort_order
            )
          `)
          .eq('is_active', true)
          .order('sort_order'),
        supabase.from('user_figures').select('collection_id, figure_id, count'),
      ]);

      if (colsRes.error) throw colsRes.error;
      if (ufRes.error) throw ufRes.error;
      if (controller.signal.aborted) return;

      const ownedMap = groupOwnedByCollection(ufRes.data);
      const result = (colsRes.data || []).map((c) => buildCollection(c, ownedMap));

      setCollections(result);
      writeCache(userId, result);
      setLoading(false);
    } catch (e) {
      if (controller.signal.aborted || e.name === 'AbortError') return;
      if (!silent) {
        console.error('[useCollections]', e);
        setError(e.message || 'Ошибка загрузки');
      }
      setLoading(false);
    }
  }, [user, userId]);

  useEffect(() => {
    const fresh = userId ? readCache(userId) : null;

    if (fresh) {
      setCollections(fresh);
      setLoading(false);
      load(true);
    } else {
      load(false);
    }

    return () => abortRef.current?.abort();
  }, [load, userId]);

  // ⚠️ Без сброса кэша — только фоновое обновление
  const refresh = useCallback(() => {
    load(true);
  }, [load]);

  return { collections, loading, error, refresh };
}