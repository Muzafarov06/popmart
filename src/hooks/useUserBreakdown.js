// src/hooks/useUserBreakdown.js
import { useCallback, useEffect, useMemo, useState } from 'react';
import { supabase } from '@/lib/supabase';

let cache = null;
const TTL = 60 * 1000;

function readCache() {
  if (!cache) return null;
  if (Date.now() - cache.ts > TTL) return null;
  return cache.data;
}
function writeCache(data) {
  cache = { data, ts: Date.now() };
}

export function invalidateBreakdownCache() {
  cache = null;
}

export function useUserBreakdown() {
  const cached = readCache();

  const [rows, setRows] = useState(cached || []);
  const [loading, setLoading] = useState(!cached);

  const load = useCallback(async (silent = false) => {
    try {
      const { data, error } = await supabase.from('user_breakdown').select('*');
      if (error) throw error;
      setRows(data || []);
      writeCache(data || []);
    } catch (e) {
      if (!silent) console.error('[useUserBreakdown]', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const hit = readCache();
    if (hit) {
      setRows(hit);
      setLoading(false);
      load(true); // тихо
    } else {
      load(false);
    }

    const channel = supabase
      .channel('breakdown-realtime')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'feed_events' },
        () => { cache = null; load(true); }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [load]);

  const byUser = useMemo(() => {
    const map = {};
    for (const r of rows) {
      if (!map[r.user_id]) {
        map[r.user_id] = {
          D: { unique: 0, total: 0, points: 0 },
          C: { unique: 0, total: 0, points: 0 },
          B: { unique: 0, total: 0, points: 0 },
          A: { unique: 0, total: 0, points: 0 },
          S: { unique: 0, total: 0, points: 0 },
          'SS+': { unique: 0, total: 0, points: 0 },
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