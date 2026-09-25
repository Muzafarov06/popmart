// src/hooks/useUserBreakdown.js
import { useCallback, useEffect, useMemo, useState } from 'react';
import { supabase } from '@/lib/supabase';

/**
 * Возвращает разбивку по редкостям для каждого юзера:
 *   { [userId]: { D: {...}, C: {...}, ..., total: {...} } }
 */
export function useUserBreakdown() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const { data, error } = await supabase.from('user_breakdown').select('*');
      if (error) throw error;
      setRows(data || []);
    } catch (e) {
      console.error('[useUserBreakdown]', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    const channel = supabase
      .channel('breakdown-realtime')
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

  const byUser = useMemo(() => {
    const map = {};
    for (const r of rows) {
      if (!map[r.user_id]) {
        map[r.user_id] = {
          D:    { unique: 0, total: 0, points: 0 },
          C:    { unique: 0, total: 0, points: 0 },
          B:    { unique: 0, total: 0, points: 0 },
          A:    { unique: 0, total: 0, points: 0 },
          S:    { unique: 0, total: 0, points: 0 },
          'SS+':{ unique: 0, total: 0, points: 0 },
        };
      }
      map[r.user_id][r.rarity] = {
        unique: Number(r.unique_count) || 0,
        total: Number(r.total_pulls) || 0,
        points: Number(r.points) || 0,
      };
    }
    return map;
  }, [rows]);

  return { byUser, loading, refresh: load };
}