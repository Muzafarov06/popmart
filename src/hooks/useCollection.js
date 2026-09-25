// src/hooks/useCollection.js
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export function useCollection(collectionId) {
  const [collection, setCollection] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!collectionId) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(null);

    (async () => {
      try {
        const { data, error: err } = await supabase
            .from('collections')
            .select(`
                id, name, description, cover, hero_cover, display_cover, is_active,
                figures:figures(
                id, name, rarity, weight, points,
                image, card, silhouette, is_secret, sort_order
                )
            `)
            .eq('id', collectionId)
            .single();

        if (err) throw err;

        if (!cancelled) {
          const sorted = {
            ...data,
            figures: [...(data.figures || [])].sort(
              (a, b) => a.sort_order - b.sort_order
            ),
          };
          setCollection(sorted);
          setLoading(false);
        }
      } catch (e) {
        if (!cancelled) {
          console.error('[useCollection]', e);
          setError(e.message || 'Ошибка загрузки');
          setLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [collectionId]);

  return { collection, loading, error };
}