// src/hooks/useLeaderboard.js
import { useCallback, useEffect, useRef, useState } from 'react';
import { supabase } from '@/lib/supabase';

const cache = new Map();
const TTL = 30 * 1000;

function readCache(key) {
  const hit = cache.get(key);
  if (!hit) return null;
  if (Date.now() - hit.ts > TTL) return null;
  return hit;
}
function writeCache(key, rows, lastEvents) {
  cache.set(key, { rows, lastEvents, ts: Date.now() });
}

export function useLeaderboard(collectionId = null) {
  const key = collectionId || 'all';
  const hit = readCache(key);

  const [rows, setRows] = useState(hit?.rows || []);
  const [lastEvents, setLastEvents] = useState(hit?.lastEvents || {});
  const [loading, setLoading] = useState(!hit);
  const [error, setError] = useState(null);

  const loadedOnceRef = useRef(Boolean(hit));

  const load = useCallback(async (silent = false) => {
    if (!silent) setError(null);

    try {
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

      let leQuery = supabase.from('last_events_per_user').select('*');
      if (collectionId) {
        leQuery = leQuery.eq('collection_id', collectionId);
      }

      const [lbRes, leRes] = await Promise.all([lbQuery, leQuery]);
      if (lbRes.error) throw lbRes.error;
      if (leRes.error) throw leRes.error;

      const newRows = lbRes.data || [];
      const map = {};
      for (const e of leRes.data || []) map[e.user_id] = e;

      setRows(newRows);
      setLastEvents(map);
      writeCache(key, newRows, map);
    } catch (e) {
      if (!silent) {
        console.error('[useLeaderboard]', e);
        setError(e.message || 'Ошибка загрузки');
      }
    } finally {
      setLoading(false);
      loadedOnceRef.current = true;
    }
  }, [collectionId, key]);

  useEffect(() => {
    const fresh = readCache(key);

    if (fresh) {
      setRows(fresh.rows);
      setLastEvents(fresh.lastEvents);
      setLoading(false);
      loadedOnceRef.current = true;
      load(true); // тихо
    } else {
      if (!loadedOnceRef.current) setLoading(true);
      load(false);
    }

    const channel = supabase
      .channel(`leaderboard-rt-${key}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'feed_events' },
        () => load(true)
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [load, key]);

  return { rows, lastEvents, loading, error, refresh: load };
}