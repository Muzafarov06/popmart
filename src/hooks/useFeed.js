// src/hooks/useFeed.js
import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

const FEED_LIMIT = 30;

export function useFeed(limit = FEED_LIMIT) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      const { data, error: err } = await supabase
        .from('feed_events')
        .select(`
          id, user_id, collection_id, figure_id, created_at,
          profile:profiles(id, display_name, login),
          figure:figures(id, name, rarity, is_secret, card)
        `)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (err) throw err;
      setEvents(data || []);
    } catch (e) {
      console.error('[useFeed]', e);
      setError(e.message || 'Ошибка загрузки');
    } finally {
      setLoading(false);
    }
  }, [limit]);

  useEffect(() => {
    load();

    const channel = supabase
      .channel('feed-realtime')
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

  return { events, loading, error, refresh: load };
}