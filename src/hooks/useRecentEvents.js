// src/hooks/useRecentEvents.js
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export function useRecentEvents(limit = 20, collectionId = null) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

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
        if (!cancelled) setEvents(data || []);
      } catch (e) {
        console.error('[useRecentEvents]', e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [limit, collectionId]);

  return { events, loading };
}