// src/hooks/useHeaderData.js
import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';

const LAST_SEEN_KEY = 'popmart_last_seen_feed_id';

/**
 * Возвращает:
 *   activeCollectionId — id первой доступной коллекции (для кнопки «Открыть»)
 *   progress           — { owned, total } текущей активной коллекции
 *   newEventsCount     — сколько чужих событий появилось с последнего визита
 *   markAsRead         — сброс счётчика (вызывается при заходе на /leaderboard)
 */
export function useHeaderData() {
  const { user } = useAuth();
  const [activeCollectionId, setActiveCollectionId] = useState(null);
  const [progress, setProgress] = useState({ owned: 0, total: 0 });
  const [newEventsCount, setNewEventsCount] = useState(0);

  /* ── Первичная загрузка ── */
  useEffect(() => {
    if (!user) return;
    let cancelled = false;

    (async () => {
      // 1. Активная коллекция (первая по sort_order)
      const { data: cols } = await supabase
        .from('collections')
        .select('id, figures:figures(id)')
        .eq('is_active', true)
        .order('sort_order')
        .limit(1);

      if (cancelled || !cols?.length) return;
      const col = cols[0];
      setActiveCollectionId(col.id);
      const total = col.figures?.length || 0;

      // 2. Мой прогресс в этой коллекции
      const { data: uf } = await supabase
        .from('user_figures')
        .select('figure_id')
        .eq('collection_id', col.id);

      if (cancelled) return;
      setProgress({ owned: uf?.length || 0, total });

      // 3. Чужие события после last seen
      const lastSeen = Number(localStorage.getItem(LAST_SEEN_KEY) || 0);
      const { data: events } = await supabase
        .from('feed_events')
        .select('id')
        .gt('id', lastSeen)
        .neq('user_id', user.supabaseId);

      if (cancelled) return;
      setNewEventsCount(events?.length || 0);
    })();

    return () => { cancelled = true; };
  }, [user?.supabaseId]);

  /* ── Realtime: обновляем прогресс и счётчик ── */
  useEffect(() => {
    if (!user || !activeCollectionId) return;

    const channel = supabase
      .channel('header-data')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'feed_events' },
        async () => {
          const lastSeen = Number(localStorage.getItem(LAST_SEEN_KEY) || 0);
          const { data } = await supabase
            .from('feed_events')
            .select('id')
            .gt('id', lastSeen)
            .neq('user_id', user.supabaseId);
          setNewEventsCount(data?.length || 0);
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
          setProgress((p) => ({ ...p, owned: data?.length || 0 }));
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user?.supabaseId, activeCollectionId]);

  /* ── Сброс счётчика ── */
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
  }, []);

  return { activeCollectionId, progress, newEventsCount, markAsRead };
}