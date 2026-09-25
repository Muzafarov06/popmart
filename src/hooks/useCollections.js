// src/hooks/useCollections.js
import { useCallback, useEffect, useRef, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';

/* ─── ХЕЛПЕРЫ ─── */

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

/* ─── ХУК ─── */

export function useCollections() {
  const { user } = useAuth();

  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tick, setTick] = useState(0);

  const abortRef = useRef(null);

  const load = useCallback(async () => {
    if (!user) {
      setCollections([]);
      setLoading(false);
      setError(null);
      return;
    }

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);
    setError(null);

    try {
      // ── 1. Коллекции + фигурки ──
      const { data: cols, error: colErr } = await supabase
        .from('collections')
        .select(`
            id, name, description, cover, hero_cover, display_cover, is_active, sort_order,
            figures:figures(
            id, name, rarity, weight, points,
            image, card, silhouette, is_secret, sort_order
            )
        `)
        .eq('is_active', true)
        .order('sort_order');

      if (colErr) throw colErr;
      if (controller.signal.aborted) return;

      // ── 2. Открытия юзера ──
      // ✅ Убрали .eq('user_id', user.id) — RLS вернёт только свои строки
      const { data: userFigures, error: ufErr } = await supabase
        .from('user_figures')
        .select('collection_id, figure_id, count');

      if (ufErr) throw ufErr;
      if (controller.signal.aborted) return;

      // ── 3. Агрегация ──
      const ownedMap = groupOwnedByCollection(userFigures);
      const result = (cols || []).map((c) => buildCollection(c, ownedMap));

      setCollections(result);
      setLoading(false);
    } catch (e) {
      if (controller.signal.aborted || e.name === 'AbortError') return;
      console.error('[useCollections]', e);
      setError(e.message || 'Ошибка загрузки');
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    load();
    return () => {
      abortRef.current?.abort();
    };
  }, [load]);

  const refresh = useCallback(() => {
    setTick((t) => t + 1);
  }, []);

  useEffect(() => {
    if (tick > 0) load();
  }, [tick, load]);

  return { collections, loading, error, refresh };
}