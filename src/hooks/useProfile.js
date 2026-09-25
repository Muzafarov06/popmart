// src/hooks/useProfile.js
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export function useProfile(login) {
  const [data, setData] = useState({
    profile: null,
    stats: null,
    achievements: [],
    breakdown: {},
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!login) return;
    let cancelled = false;
    setLoading(true);
    setError(null);

    (async () => {
      try {
        // 1. Профиль
        const { data: profile, error: pErr } = await supabase
          .from('profiles')
          .select('id, login, display_name, role')
          .eq('login', login)
          .single();
        if (pErr) throw pErr;
        if (cancelled) return;

        // 2. Все ачивки + какие получены этим игроком
        const [allAchRes, earnedAchRes] = await Promise.all([
          supabase.from('achievements').select('*').order('sort_order'),
          supabase.from('user_achievements')
            .select('achievement_id')
            .eq('user_id', profile.id),
        ]);
        const earnedSet = new Set((earnedAchRes.data || []).map(r => r.achievement_id));
        const achievements = (allAchRes.data || []).map(a => ({
          ...a,
          earned: earnedSet.has(a.id),
        }));

        // 3. Сводная статистика (из leaderboard view)
        const { data: lb } = await supabase
          .from('leaderboard')
          .select('*')
          .eq('id', profile.id)
          .maybeSingle();

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
        setData({
          profile,
          stats: lb || {
            unique_count: 0,
            total_pulls: 0,
            secret_count: 0,
            total_points: 0,
          },
          achievements,
          breakdown,
        });
        setLoading(false);
      } catch (e) {
        if (cancelled) return;
        console.error('[useProfile]', e);
        setError(e.message || 'Ошибка загрузки');
        setLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, [login]);

  return { ...data, loading, error };
}