// src/hooks/useHeaderData.js
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';

const LAST_SEEN_KEY = 'popmart_last_seen_feed_id';
const ACTIVE_COL_KEY = 'popmart_active_collection_id';
const ACTIVE_COL_EVENT = 'popmart:active-collection-changed';

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

/* Считаем, доступна ли коллекция игроку */
function computeIsLocked(col, isAdmin) {
  if (!col) return true;
  const isActive = col.is_active !== false;
  // null / undefined трактуем как "опубликована" (страховка от старых записей)
  const isPublished = col.is_published !== false;
  const canPlay = isActive && (isPublished || isAdmin);
  return !canPlay;
}

export function useHeaderData() {
  const { user } = useAuth();
  const userId = user?.supabaseId || user?.login;
  const isAdmin = user?.role === 'admin';

  const cached = userId ? readCache(userId) : null;

  const [activeCollectionId, setActiveCollectionId] = useState(
    cached?.activeCollectionId ||
      (typeof window !== 'undefined' ? localStorage.getItem(ACTIVE_COL_KEY) : null) ||
      null
  );
  const [progress, setProgress] = useState(
    cached?.progress || { owned: 0, total: 0 }
  );
  const [newEventsCount, setNewEventsCount] = useState(
    cached?.newEventsCount || 0
  );
  // карта: { [collectionId]: isLocked }
  const [locksMap, setLocksMap] = useState(cached?.locksMap || {});

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
          .select('id, is_active, is_published, figures:figures(id)')
          .eq('is_active', true)
          .order('sort_order'),
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

      // Считаем карту блокировок
      const nextLocksMap = {};
      for (const c of cols) {
        nextLocksMap[c.id] = computeIsLocked(c, isAdmin);
      }

      // Уважаем выбор пользователя на главной, если он валиден
      const storedId = localStorage.getItem(ACTIVE_COL_KEY);
      const col = cols.find((c) => c.id === storedId) || cols[0];
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
      setLocksMap(nextLocksMap);

      writeCache(userId, {
        activeCollectionId: col.id,
        progress: { owned, total },
        newEventsCount: count,
        locksMap: nextLocksMap,
      });
    } catch (e) {
      console.error('[useHeaderData]', e);
    }
  }, [user, userId, isAdmin]);

  /* ── Первая загрузка + Realtime ── */
  useEffect(() => {
    if (!user) return;

    const fresh = userId ? readCache(userId) : null;

    if (fresh) {
      setActiveCollectionId(fresh.activeCollectionId);
      setProgress(fresh.progress);
      setNewEventsCount(fresh.newEventsCount);
      setLocksMap(fresh.locksMap || {});
      load();
    } else {
      load();
    }

    return () => abortRef.current?.abort();
  }, [user, userId, load]);

  /* ── Синхронизация с каруселью на главной ── */
  useEffect(() => {
    const handler = (e) => {
      const id = e?.detail?.id || localStorage.getItem(ACTIVE_COL_KEY);
      if (id) setActiveCollectionId(id);
    };
    const onStorage = (e) => {
      if (e.key === ACTIVE_COL_KEY && e.newValue) {
        setActiveCollectionId(e.newValue);
      }
    };

    window.addEventListener(ACTIVE_COL_EVENT, handler);
    window.addEventListener('storage', onStorage);
    return () => {
      window.removeEventListener(ACTIVE_COL_EVENT, handler);
      window.removeEventListener('storage', onStorage);
    };
  }, []);

  /* ── Realtime ── */
  useEffect(() => {
    if (!user || !activeCollectionId) return;

    const channel = supabase
      .channel(`header-data-${activeCollectionId}`)
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
            locksMap,
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
              locksMap,
            });
            return next;
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, activeCollectionId, userId, progress, newEventsCount, locksMap]);

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

  /* ── Активная коллекция заблокирована? ── */
  const activeCollectionLocked = useMemo(() => {
    if (!activeCollectionId) return true;
    if (locksMap[activeCollectionId] === undefined) return false; // ещё не знаем — не блокируем
    return locksMap[activeCollectionId];
  }, [activeCollectionId, locksMap]);

  return {
    activeCollectionId,
    activeCollectionLocked,
    progress,
    newEventsCount,
    markAsRead,
  };
}