// src/hooks/useCollection.js
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

const cache = new Map();
const TTL = 60 * 1000;

function readCache(id) {
  const hit = cache.get(id);
  if (!hit) return null;
  if (Date.now() - hit.ts > TTL) return null;
  return hit.data;
}
function writeCache(id, data) {
  cache.set(id, { data, ts: Date.now() });
}

export function useCollection(collectionId) {
  const cached = collectionId ? readCache(collectionId) : null;

  const [collection, setCollection] = useState(cached || null);
  const [loading, setLoading] = useState(!cached);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!collectionId) {
      setLoading(false);
      return;
    }

    let cancelled = false;
    const hit = readCache(collectionId);

    if (hit) {
      setCollection(hit);
      setLoading(false);
    } else {
      setLoading(true);
    }
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
        if (cancelled) return;

        const sorted = {
          ...data,
          figures: [...(data.figures || [])].sort(
            (a, b) => a.sort_order - b.sort_order
          ),
        };
        setCollection(sorted);
        writeCache(collectionId, sorted);
        setLoading(false);
      } catch (e) {
        if (cancelled) return;
        console.error('[useCollection]', e);
        setError(e.message || 'Ошибка загрузки');
        setLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, [collectionId]);

  return { collection, loading, error };
}