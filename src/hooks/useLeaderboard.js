// src/hooks/useLeaderboard.js
import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export function useLeaderboard() {
  const [rows, setRows] = useState([]);
  const [lastEvents, setLastEvents] = useState({}); // { [userId]: event }
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      const [lbRes, leRes] = await Promise.all([
        supabase
          .from('leaderboard')
          .select('*')
          .order('total_points', { ascending: false })
          .order('secret_count', { ascending: false }),
        supabase.from('last_events_per_user').select('*'),
      ]);

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
  }, []);

  useEffect(() => {
    load();

    const channel = supabase
      .channel('leaderboard-realtime')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'feed_events' },
        () => load()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [load]);

  return { rows, lastEvents, loading, error, refresh: load };
}