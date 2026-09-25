// src/hooks/useRecentEvents.js
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export function useRecentEvents(limit = 20) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const { data, error } = await supabase
          .from('feed_events')
          .select(`
            id, user_id, collection_id, figure_id, created_at,
            profile:profiles(id, display_name, login),
            figure:figures(id, name, rarity, is_secret, card)
          `)
          .order('created_at', { ascending: false })
          .limit(limit);

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
  }, [limit]);

  return { events, loading };
}