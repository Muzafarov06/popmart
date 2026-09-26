// src/hooks/useHeaderData.js
import { useCallback, useEffect, useRef, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';

const LAST_SEEN_KEY = 'popmart_last_seen_feed_id';

/* Глобальный кэш */
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

export function useHeaderData() {
  const { user } = useAuth();
  const userId = user?.supabaseId || user?.login;

  const cached = userId ? readCache(userId) : null;

  const [activeCollectionId, setActiveCollectionId] = useState(
    cached?.activeCollectionId || null
  );
  const [progress, setProgress] = useState(
    cached?.progress || { owned: 0, total: 0 }
  );
  const [newEventsCount, setNewEventsCount] = useState(
    cached?.newEventsCount || 0
  );

  const abortRef = useRef(null);

  /* ── Загрузка ── */
  const load = useCallback(async () => {
    if (!user) return;

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const [colsRes, eventsCountRes] = await Promise.all([
        supabase
          .from('collections')
          .select('id, figures:figures(id)')
          .eq('is_active', true)
          .order('sort_order')
          .limit(1),
        (async () => {
          const lastSeen = Number(localStorage.getItem(LAST_SEEN_KEY) || 0);
          return supabase
            .from('feed_events')
            .select('id', { count: 'exact', head: true })
            .gt('id', lastSeen)
            .neq('user_id', user.supabaseId);
        })(),
      ]);

      if (controller.signal.aborted) return;

      const cols = colsRes.data;
      if (!cols?.length) return;

      const col = cols[0];
      const total = col.figures?.length || 0;

      const { data: uf } = await supabase
        .from('user_figures')
        .select('figure_id')
        .eq('collection_id', col.id);

      if (controller.signal.aborted) return;

      const owned = uf?.length || 0;
      const count = eventsCountRes.count || 0;

      setActiveCollectionId(col.id);
      setProgress({ owned, total });
      setNewEventsCount(count);

      writeCache(userId, {
        activeCollectionId: col.id,
        progress: { owned, total },
        newEventsCount: count,
      });
    } catch (e) {
      console.error('[useHeaderData]', e);
    }
  }, [user, userId]);

  /* ── Первая загрузка + Realtime ── */
  useEffect(() => {
    if (!user) return;

    const fresh = userId ? readCache(userId) : null;

    if (fresh) {
      setActiveCollectionId(fresh.activeCollectionId);
      setProgress(fresh.progress);
      setNewEventsCount(fresh.newEventsCount);
      // тихое обновление
      load();
    } else {
      load();
    }

    return () => abortRef.current?.abort();
  }, [user, userId, load]);

  /* ── Realtime ── */
  useEffect(() => {
    if (!user || !activeCollectionId) return;

    const channel = supabase
      .channel('header-data')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'feed_events' },
        async () => {
          const lastSeen = Number(localStorage.getItem(LAST_SEEN_KEY) || 0);
          const { count } = await supabase
            .from('feed_events')
            .select('*', { count: 'exact', head: true })
            .gt('id', lastSeen)
            .neq('user_id', user.supabaseId);

          const newCount = count || 0;
          setNewEventsCount(newCount);
          writeCache(userId, {
            activeCollectionId,
            progress,
            newEventsCount: newCount,
          });
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'user_figures' },
        async () => {
          const { data } = await supabase
            .from('user_figures')
            .select('figure_id')
            .eq('collection_id', activeCollectionId);
          setProgress((p) => {
            const next = { ...p, owned: data?.length || 0 };
            writeCache(userId, {
              activeCollectionId,
              progress: next,
              newEventsCount,
            });
            return next;
          });
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user, activeCollectionId, userId]);

  const markAsRead = useCallback(async () => {
    const { data } = await supabase
      .from('feed_events')
      .select('id')
      .order('id', { ascending: false })
      .limit(1);
    if (data?.[0]) {
      localStorage.setItem(LAST_SEEN_KEY, String(data[0].id));
    }
    setNewEventsCount(0);
    if (cache) {
      cache.data.newEventsCount = 0;
      cache.ts = Date.now();
    }
  }, []);

  return { activeCollectionId, progress, newEventsCount, markAsRead };
}