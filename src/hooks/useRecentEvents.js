// src/hooks/useRecentEvents.js
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

const cache = new Map();
const TTL = 30 * 1000;

const key = (limit, collectionId) => `${limit}:${collectionId || 'all'}`;

function readCache(k) {
  const hit = cache.get(k);
  if (!hit) return null;
  if (Date.now() - hit.ts > TTL) return null;
  return hit.data;
}
function writeCache(k, data) {
  cache.set(k, { data, ts: Date.now() });
}

export function useRecentEvents(limit = 20, collectionId = null) {
  const k = key(limit, collectionId);
  const cached = readCache(k);

  const [events, setEvents] = useState(cached || []);
  const [loading, setLoading] = useState(!cached);

  useEffect(() => {
    let cancelled = false;

    const hit = readCache(k);
    if (hit) {
      setEvents(hit);
      setLoading(false);
    } else {
      setLoading(true);
    }

    (async () => {
      try {
        let query = supabase
          .from('feed_events')
          .select(`
            id, user_id, collection_id, figure_id, created_at,
            profile:profiles(id, display_name, login),
            figure:figures(id, name, rarity, is_secret, card)
          `)
          .order('created_at', { ascending: false })
          .limit(limit);

        if (collectionId) {
          query = query.eq('collection_id', collectionId);
        }

        const { data, error } = await query;
        if (error) throw error;
        if (!cancelled) {
          setEvents(data || []);
          writeCache(k, data || []);
        }
      } catch (e) {
        console.error('[useRecentEvents]', e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, [limit, collectionId, k]);

  return { events, loading };
}