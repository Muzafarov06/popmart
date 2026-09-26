// src/hooks/useProfile.js
import { useEffect, useRef, useState } from 'react';
import { supabase } from '@/lib/supabase';

/* ─── Кэш справочника ачивок ─── */
let achievementsRefPromise = null;
function loadAchievementsRef() {
  if (!achievementsRefPromise) {
    achievementsRefPromise = supabase
      .from('achievements')
      .select('*')
      .order('sort_order')
      .then(({ data, error }) => {
        if (error) throw error;
        return data || [];
      })
      .catch((e) => {
        achievementsRefPromise = null;
        throw e;
      });
  }
  return achievementsRefPromise;
}

/* ─── Кэш результатов ─── */
const resultCache = new Map();
const CACHE_TTL = 60 * 1000;

function readCache(key) {
  const hit = resultCache.get(key);
  if (!hit) return null;
  if (Date.now() - hit.ts > CACHE_TTL) return null;
  return hit.data;
}

function writeCache(key, data) {
  resultCache.set(key, { data, ts: Date.now() });
}

/* Сброс кэша профиля (вызывать после кручения) */
export function invalidateProfileCache(login) {
  if (!login) {
    resultCache.clear();
    return;
  }
  for (const key of resultCache.keys()) {
    if (key.startsWith(`${login}:`)) resultCache.delete(key);
  }
}

export function useProfile(login, collectionId = null) {
  const cacheKey = login ? `${login}:${collectionId || 'all'}` : null;
  const initialHit = cacheKey ? readCache(cacheKey) : null;

  const [data, setData] = useState(
    initialHit || { profile: null, stats: null, achievements: [], breakdown: {} }
  );
  const [loading, setLoading] = useState(!initialHit);
  const [error, setError] = useState(null);

  const loadedOnceRef = useRef(Boolean(initialHit));

  useEffect(() => {
    if (!login) return;
    let cancelled = false;

    const key = `${login}:${collectionId || 'all'}`;
    const hit = readCache(key);

    if (hit) {
      setData(hit);
      setLoading(false);
      loadedOnceRef.current = true;
    } else if (!loadedOnceRef.current) {
      setLoading(true);
    }
    setError(null);

    (async () => {
      try {
        const { data: profile, error: pErr } = await supabase
          .from('profiles')
          .select('id, login, display_name, role')
          .eq('login', login)
          .maybeSingle();

        if (pErr) throw pErr;
        if (!profile) {
          if (!cancelled) {
            const empty = { profile: null, stats: null, achievements: [], breakdown: {} };
            setData(empty);
            setLoading(false);
            loadedOnceRef.current = true;
          }
          return;
        }
        if (cancelled) return;

        const [achRef, userAchRes] = await Promise.all([
          loadAchievementsRef(),
          supabase
            .from('user_achievements')
            .select('achievement_id, collection_id')
            .eq('user_id', profile.id),
        ]);

        const earnedSet = new Set();
        for (const r of userAchRes.data || []) {
          if (!collectionId) {
            earnedSet.add(r.achievement_id);
          } else {
            if (r.collection_id === collectionId || r.collection_id === null) {
              earnedSet.add(r.achievement_id);
            }
          }
        }

        const achievements = achRef.map((a) => ({
          ...a,
          earned: earnedSet.has(a.id),
        }));

        const [statsRes, bdRes] = await Promise.all([
          collectionId
            ? supabase
                .from('leaderboard_by_collection')
                .select('*')
                .eq('id', profile.id)
                .eq('collection_id', collectionId)
                .maybeSingle()
            : supabase
                .from('leaderboard')
                .select('*')
                .eq('id', profile.id)
                .maybeSingle(),
          supabase
            .from('user_breakdown')
            .select('*')
            .eq('user_id', profile.id),
        ]);

        const stats =
          statsRes.data ||
          (collectionId
            ? { unique_count: 0, total_pulls: 0, secret_count: 0, total_points: 0 }
            : {
                unique_count: 0,
                total_pulls: 0,
                secret_count: 0,
                figure_points: 0,
                achievement_count: 0,
                achievement_points: 0,
                total_points: 0,
              });

        const breakdown = {};
        for (const r of bdRes.data || []) {
          breakdown[r.rarity] = {
            unique: Number(r.unique_count) || 0,
            total: Number(r.total_pulls) || 0,
            points: Number(r.points) || 0,
          };
        }

        if (cancelled) return;

        const fresh = { profile, stats, achievements, breakdown };
        setData(fresh);
        writeCache(key, fresh);
        setLoading(false);
        loadedOnceRef.current = true;
      } catch (e) {
        if (cancelled) return;
        console.error('[useProfile]', e);
        setError(e.message || 'Ошибка загрузки');
        setLoading(false);
        loadedOnceRef.current = true;
      }
    })();

    return () => { cancelled = true; };
  }, [login, collectionId]);

  return { ...data, loading, error };
}