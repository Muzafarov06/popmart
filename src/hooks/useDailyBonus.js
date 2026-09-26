// src/hooks/useDailyBonus.js
import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { mapRow } from './useUnbox';

export function useDailyBonus() {
  const [available, setAvailable] = useState(false);
  const [nextReset, setNextReset] = useState(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const { data, error } = await supabase.rpc('daily_bonus_status');
      if (error) throw error;
      const row = data?.[0];
      setAvailable(Boolean(row?.available));
      setNextReset(row?.next_reset_at || null);
    } catch (e) {
      console.error('[useDailyBonus]', e);
      setAvailable(false);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const claim = useCallback(async (collectionId) => {
    const { data, error } = await supabase.rpc('claim_daily_bonus', {
      p_collection_id: collectionId,
    });
    if (error) {
      console.error('[useDailyBonus] claim', error);
      return { data: null, error };
    }
    setAvailable(false);

    // ⚠️ Преобразуем поля result_* → id/name/card/...
    const mapped = Array.isArray(data) ? data.map(mapRow) : [];
    return { data: mapped, error: null };
  }, []);

  return { available, nextReset, loading, claim, refresh };
}