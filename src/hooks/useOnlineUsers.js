// src/hooks/useOnlineUsers.js
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';

/* Кэш shared_users — обновляем раз в 5 минут */
let sharedCache = null;
const SHARED_TTL = 5 * 60 * 1000;

async function loadSharedUsers() {
  if (sharedCache && Date.now() - sharedCache.ts < SHARED_TTL) {
    return sharedCache.data;
  }
  const { data, error } = await supabase.rpc('shared_users');
  if (error) throw error;
  sharedCache = { data: data || [], ts: Date.now() };
  return sharedCache.data;
}

export function useOnlineUsers() {
  const { user } = useAuth();
  const [online, setOnline] = useState([]);
  const [allowed, setAllowed] = useState(null);
  const [lastSeen, setLastSeen] = useState({});

  /* ─── 1. Загружаем разрешённых ─── */
  useEffect(() => {
    if (!user?.supabaseId) {
      setAllowed([]);
      setLastSeen({});
      return;
    }
    let cancelled = false;

    (async () => {
      try {
        const data = await loadSharedUsers();
        if (cancelled) return;

        const logins = data.map((r) => r.login);
        const ls = {};
        for (const r of data) {
          if (r.last_seen_at) ls[r.login] = r.last_seen_at;
        }

        setAllowed(logins);
        setLastSeen(ls);
      } catch (e) {
        if (!cancelled) {
          console.error('[useOnlineUsers] shared_users:', e);
          setAllowed([]);
        }
      }
    })();

    return () => { cancelled = true; };
  }, [user?.supabaseId]);

  /* ─── 2. Realtime Presence ─── */
  useEffect(() => {
    if (!user?.login || !allowed) {
      setOnline([]);
      return;
    }

    const channel = supabase.channel('online-users', {
      config: { presence: { key: user.login } },
    });

    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        const allLogins = Object.keys(state);
        setOnline(allLogins.filter((login) => allowed.includes(login)));
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({
            login: user.login,
            online_at: new Date().toISOString(),
          });
          await supabase.rpc('touch_last_seen');
        }
      });

    return () => { supabase.removeChannel(channel); };
  }, [user?.login, allowed]);

  return { online, allowed, lastSeen };
}