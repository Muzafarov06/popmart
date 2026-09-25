// src/context/AuthContext.jsx
import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { USERS, findUserByEmail } from '@/data/users';

const AuthContext = createContext(null);
const STORAGE_KEY = 'popmart_user';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // ─── Восстановление сессии ───
  useEffect(() => {
    let cancelled = false;

    (async () => {
      // 1. Проверяем: есть ли активная Supabase-сессия?
      const { data: { session } } = await supabase.auth.getSession();

      if (session?.user) {
        // Supabase-сессия есть — подтягиваем локального юзера по email
        const found = findUserByEmail(session.user.email);
        if (found && !cancelled) {
          setUser({
            ...found,
            supabaseId: session.user.id, // UUID
          });
        }
      } else {
        // Supabase-сессии нет — чистим localStorage
        localStorage.removeItem(STORAGE_KEY);
      }

      // 2. Резервный вариант: localStorage (если сессия не подтянулась)
      if (!session?.user) {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          try {
            const parsed = JSON.parse(saved);
            const valid = USERS.find((u) => u.login === parsed.login);
            if (valid && !cancelled) setUser(valid);
            else localStorage.removeItem(STORAGE_KEY);
          } catch {
            localStorage.removeItem(STORAGE_KEY);
          }
        }
      }

      if (!cancelled) setLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  // ─── Логин ───
  const login = async (emailOrLogin, password) => {
    let email = emailOrLogin.trim().toLowerCase();
    if (!email.includes('@')) {
      email = `${email}@popmart.local`;
    }

    const found = findUserByEmail(email);
    if (!found) {
      throw new Error('Пользователь с таким email не найден');
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      if (error.message.includes('Invalid login credentials')) {
        throw new Error('Неверный пароль');
      }
      if (error.message.includes('Email not confirmed')) {
        throw new Error('Email не подтверждён');
      }
      throw new Error(error.message);
    }

    const fullUser = {
      ...found,
      supabaseId: data.user?.id, // ✅ UUID из Supabase
    };

    setUser(fullUser);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(fullUser));
    return fullUser;
  };

  // ─── Выход ───
  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    localStorage.removeItem(STORAGE_KEY);
  };

  const value = useMemo(
    () => ({ user, loading, login, logout, isAdmin: user?.role === 'admin' }),
    [user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}