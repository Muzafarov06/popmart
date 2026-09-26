// src/hooks/useLeaderboard.js
import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

/**
 * @param {string|null} collectionId — id коллекции или null для общей таблицы
 */
export function useLeaderboard(collectionId = null) {
  const [rows, setRows] = useState([]);
  const [lastEvents, setLastEvents] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      // 1. Основные строки
      let lbQuery;
      if (collectionId) {
        lbQuery = supabase
          .from('leaderboard_by_collection')
          .select('*')
          .eq('collection_id', collectionId)
          .order('total_points', { ascending: false })
          .order('secret_count', { ascending: false });
      } else {
        lbQuery = supabase
          .from('leaderboard')
          .select('*')
          .order('total_points', { ascending: false })
          .order('secret_count', { ascending: false });
      }

      // 2. Последние события (можно фильтровать по коллекции)
      let leQuery = supabase.from('last_events_per_user').select('*');
      if (collectionId) {
        leQuery = leQuery.eq('collection_id', collectionId);
      }

      const [lbRes, leRes] = await Promise.all([lbQuery, leQuery]);
      if (lbRes.error) throw lbRes.error;
      if (leRes.error) throw leRes.error;

      setRows(lbRes.data || []);

      const map = {};
      for (const e of leRes.data || []) map[e.user_id] = e;
      setLastEvents(map);
    } catch (e) {
      console.error('[useLeaderboard]', e);
      setError(e.message || 'Ошибка загрузки');
    } finally {
      setLoading(false);
    }
  }, [collectionId]);

  useEffect(() => {
    setLoading(true);
    load();

    const channel = supabase
      .channel(`leaderboard-realtime-${collectionId || 'all'}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'feed_events' },
        () => load()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [load, collectionId]);

  return { rows, lastEvents, loading, error, refresh: load };
}