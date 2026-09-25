// src/hooks/useOnlineUsers.js
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';

/**
 * Возвращает:
 *   online      — массив логинов, кто сейчас в сети (присутствие)
 *   allowed     — массив логинов, с кем у меня есть общая коллекция
 *                 (или админ, или я сам). null пока грузится.
 */
export function useOnlineUsers() {
  const { user } = useAuth();
  const [online, setOnline] = useState([]);
  const [allowed, setAllowed] = useState(null);

  /* ─── 1. Список разрешённых логинов ─── */
  useEffect(() => {
    if (!user?.supabaseId) {
      setAllowed([]);
      return;
    }
    let cancelled = false;

    (async () => {
      const { data, error } = await supabase.rpc('shared_users');
      if (cancelled) return;

      if (error) {
        console.error('[useOnlineUsers] shared_users:', error);
        setAllowed([]);
        return;
      }
      setAllowed((data || []).map((r) => r.login));
    })();

    return () => {
      cancelled = true;
    };
  }, [user?.supabaseId]);

  /* ─── 2. Realtime Presence + фильтр ─── */
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
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.login, allowed]);

  return { online, allowed };
}