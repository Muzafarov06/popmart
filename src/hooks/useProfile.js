// src/hooks/useProfile.js
import { useEffect, useRef, useState } from 'react';
import { supabase } from '@/lib/supabase';

export function useProfile(login, collectionId = null) {
  const [data, setData] = useState({
    profile: null,
    stats: null,
    achievements: [],
    breakdown: {},
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Флаг: была ли уже первая успешная загрузка
  const loadedOnceRef = useRef(false);

  useEffect(() => {
    if (!login) return;
    let cancelled = false;

    // Спиннер — только на самой первой загрузке
    if (!loadedOnceRef.current) {
      setLoading(true);
    }
    setError(null);

    (async () => {
      try {
        // 1. Профиль
        const { data: profile, error: pErr } = await supabase
          .from('profiles')
          .select('id, login, display_name, role')
          .eq('login', login)
          .maybeSingle();

        if (pErr) throw pErr;
        if (!profile) {
          if (!cancelled) {
            setData({ profile: null, stats: null, achievements: [], breakdown: {} });
            setLoading(false);
            loadedOnceRef.current = true;
          }
          return;
        }
        if (cancelled) return;

        // 2. Ачивки — фильтруем по коллекции
        const [allAchRes, userAchRes] = await Promise.all([
          supabase.from('achievements').select('*').order('sort_order'),
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

        const achievements = (allAchRes.data || []).map((a) => ({
          ...a,
          earned: earnedSet.has(a.id),
        }));

        // 3. Статистика
        let stats;
        if (collectionId) {
          const { data: lb } = await supabase
            .from('leaderboard_by_collection')
            .select('*')
            .eq('id', profile.id)
            .eq('collection_id', collectionId)
            .maybeSingle();

          stats = lb || {
            unique_count: 0,
            total_pulls: 0,
            secret_count: 0,
            total_points: 0,
          };
        } else {
          const { data: lb } = await supabase
            .from('leaderboard')
            .select('*')
            .eq('id', profile.id)
            .maybeSingle();

          stats = lb || {
            unique_count: 0,
            total_pulls: 0,
            secret_count: 0,
            figure_points: 0,
            achievement_count: 0,
            achievement_points: 0,
            total_points: 0,
          };
        }

        // 4. Разбивка по редкостям
        const { data: bd } = await supabase
          .from('user_breakdown')
          .select('*')
          .eq('user_id', profile.id);

        const breakdown = {};
        for (const r of bd || []) {
          breakdown[r.rarity] = {
            unique: Number(r.unique_count) || 0,
            total: Number(r.total_pulls) || 0,
            points: Number(r.points) || 0,
          };
        }

        if (cancelled) return;
        setData({ profile, stats, achievements, breakdown });
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