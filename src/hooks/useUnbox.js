// src/hooks/useUnbox.js
import { useCallback, useState } from 'react';
import { supabase } from '@/lib/supabase';

function mapRow(row) {
  return {
    id:        row.result_figure_id,
    name:      row.result_name,
    rarity:    row.result_rarity,
    points:    row.result_points,
    image:     row.result_image,
    card:      row.result_card,
    is_secret: row.result_is_secret,
    isNew:     Boolean(row.result_is_new), // ✅ приводим к bool на всякий случай
  };
}

export function useUnbox() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const reset = useCallback(() => {
    setLoading(false);
    setError(null);
  }, []);

  const unbox = useCallback(async (collectionId) => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: rpcError } = await supabase.rpc('open_box', {
        p_collection_id: collectionId,
      });
      if (rpcError) throw rpcError;
      const row = Array.isArray(data) ? data[0] : data;
      if (!row) throw new Error('Пустой ответ от open_box');
      return mapRow(row);
    } catch (e) {
      console.error('[useUnbox]', e);
      setError(e.message || 'Ошибка открытия');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const unboxMany = useCallback(async (collectionId, count = 10) => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: rpcError } = await supabase.rpc('open_box_many', {
        p_collection_id: collectionId,
        p_count: count,
      });
      if (rpcError) throw rpcError;
      if (!Array.isArray(data)) return [];
      return data.map(mapRow);
    } catch (e) {
      console.error('[useUnbox] many', e);
      setError(e.message || 'Ошибка мультиоткрытия');
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  return { unbox, unboxMany, loading, error, reset };
}