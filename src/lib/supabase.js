// src/lib/supabase.js
import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!url || !key) {
  throw new Error('Missing Supabase env variables. Check .env file.');
}

/* Preconnect — ускорит первый запрос */
if (typeof document !== 'undefined') {
  const link = document.createElement('link');
  link.rel = 'preconnect';
  link.href = url;
  link.crossOrigin = 'anonymous';
  document.head.appendChild(link);

  const dns = document.createElement('link');
  dns.rel = 'dns-prefetch';
  dns.href = url;
  document.head.appendChild(dns);
}

export const supabase = createClient(url, key, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});