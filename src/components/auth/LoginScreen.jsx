// src/components/auth/LoginScreen.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';

const EASE = [0.22, 1, 0.36, 1];

/* ─────────── Иконки ─────────── */
function EyeIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"
      strokeLinecap="round" strokeLinejoin="round" className="w-[18px] h-[18px]">
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"
      strokeLinecap="round" strokeLinejoin="round" className="w-[18px] h-[18px]">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
      <path d="M1 1l22 22" />
    </svg>
  );
}

function Sparkle({ className = '' }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M12 0c.62 6.2 5.18 10.76 11.38 11.38C17.18 12 12.62 16.56 12 22.76 11.38 16.56 6.82 12 .62 11.38 6.82 10.76 11.38 6.2 12 0z" />
    </svg>
  );
}

/* ─────────── Экран ─────────── */
export default function LoginScreen() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) return;
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/', { replace: true });
    } catch (err) {
      setError(err.message || 'Ошибка входа');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-[#FFF8EE] antialiased">

      {/* локальные кейфреймы */}
      <style>{`
        @keyframes pm-float { 0%,100% { transform: translateY(0) } 50% { transform: translateY(-12px) } }
        @keyframes pm-float-slow { 0%,100% { transform: translateY(0) rotate(0deg) } 50% { transform: translateY(-16px) rotate(6deg) } }
        @keyframes pm-shine { to { transform: translateX(340%) skewX(-20deg); } }
        .pm-btn .pm-shine { transform: translateX(-160%) skewX(-20deg); }
        .pm-btn:hover:not(:disabled) .pm-shine { animation: pm-shine .85s ease; }
      `}</style>

      {/* ═══════════ ЛЕВАЯ ЧАСТЬ — БРЕНД ═══════════ */}
      <div className="relative lg:w-[46%] overflow-hidden flex flex-col
                      min-h-[320px] sm:min-h-[380px] lg:min-h-screen
                      bg-[linear-gradient(155deg,#FFD24C_0%,#FFB800_38%,#FF9500_72%,#FF6B00_100%)]">

        {/* ── Декор ── */}
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <div className="absolute -top-32 -left-28 w-[480px] h-[480px] rounded-full bg-white/25 blur-[110px]" />
          <div className="absolute -bottom-40 -right-24 w-[520px] h-[520px] rounded-full bg-[#FF3D00]/35 blur-[130px]" />

          <div className="absolute inset-0 opacity-[0.08]"
            style={{
              backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)',
              backgroundSize: '26px 26px',
            }} />

          <div className="hidden lg:block absolute -right-24 top-[14%] w-72 h-72 rounded-full
                          bg-gradient-to-br from-white/30 to-transparent
                          animate-[pm-float-slow_9s_ease-in-out_infinite]" />
          <div className="hidden lg:block absolute right-[18%] bottom-[12%] w-40 h-40 rounded-full
                          bg-gradient-to-br from-[#FFD24C]/70 to-transparent
                          animate-[pm-float_7s_ease-in-out_infinite]" />

          <Sparkle className="absolute top-[20%] left-[18%] w-4 h-4 text-white/90 animate-[pm-float_6s_ease-in-out_infinite]" />
          <Sparkle className="absolute top-[68%] right-[26%] w-3 h-3 text-white/70 animate-[pm-float_8s_ease-in-out_infinite_1s]" />
        </div>

        {/* ── Контент ── */}
        <div className="relative z-10 flex-1 flex flex-col px-6 sm:px-12 lg:px-16 py-8 sm:py-10 lg:py-14">

          {/* Лого — только текст, без квадрата */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: EASE }}
            className="self-start"
          >
            <span className="font-heading font-black tracking-[0.34em] text-[15px] sm:text-[17px] uppercase text-white
                             [text-shadow:0_2px_0_rgba(170,60,0,0.18)]">
              Pop&nbsp;Mart
            </span>
          </motion.div>

          {/* Центр */}
          <div className="flex-1 flex flex-col justify-center pt-10 lg:pt-0">

            <motion.h1
              initial={{ opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, ease: EASE }}
              className="font-heading font-black text-white leading-[0.92] tracking-[-0.04em]"
              style={{ fontSize: 'clamp(34px, 8.5vw, 76px)' }}
            >
              Кто
              <br />
              <span className="relative inline-block my-2">
                <span className="absolute inset-x-[-10px] inset-y-[6%] bg-[#FFF8EE] rounded-2xl -rotate-[1.6deg]
                                 shadow-[0_14px_34px_-12px_rgba(120,40,0,0.5)]" />
                <span className="relative z-10 text-[#1A1A22] px-1">попадётся</span>
              </span>
              <br />
              тебе?
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2, ease: EASE }}
              className="mt-7 text-[13px] sm:text-sm lg:text-[15px] text-white/90 leading-relaxed max-w-[340px]"
            >
              Войдите в аккаунт, чтобы открыть свою коллекцию фигурок,
              следить за новинками и охотиться за секретными.
            </motion.p>
          </div>
        </div>
      </div>

      {/* ═══════════ ПРАВАЯ ЧАСТЬ — ФОРМА ═══════════ */}
      <div className="relative flex-1 flex items-center justify-center px-5 sm:px-10 lg:px-16 py-10 sm:py-14 lg:py-20 bg-[#FFF8EE] overflow-hidden">

        <div aria-hidden className="absolute inset-0 opacity-50"
          style={{
            backgroundImage: 'radial-gradient(#EADFCB 1px, transparent 1px)',
            backgroundSize: '22px 22px',
          }} />
        <div aria-hidden className="absolute -top-32 right-[-15%] w-[420px] h-[420px] rounded-full bg-[#FFB800]/25 blur-[130px]" />
        <div aria-hidden className="absolute -bottom-32 left-[-15%] w-[380px] h-[380px] rounded-full bg-[#FF6B00]/15 blur-[130px]" />

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.15, ease: EASE }}
          className="relative w-full max-w-[400px]"
        >
          {/* Заголовок */}
          <div className="mb-8">
            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full
                             bg-[#FFB800]/15 text-[#B87400]
                             text-[10px] uppercase tracking-[0.28em] font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-[#FFB800]" />
              Вход
            </span>

            <h2 className="mt-4 font-heading font-black text-[30px] sm:text-[34px] tracking-[-0.02em] leading-[1.05] text-[#1A1A22]">
              Собери свою {' '}
              <span className="bg-[linear-gradient(90deg,#FFB800,#FF6B00)] bg-clip-text text-transparent">
                коллекцию
              </span>
            </h2>
          </div>

          {/* Форма */}
          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Email */}
            <div>
              <label className="block text-[10px] uppercase tracking-[0.26em] text-zinc-400 font-bold mb-2">
                Email
              </label>
              <input
                type="email"
                placeholder="muzafon@popmart.local"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(''); }}
                autoComplete="email"
                className="w-full px-4 py-3.5 bg-white border-2 border-transparent rounded-2xl
                           text-sm text-[#1A1A22] placeholder:text-zinc-300 outline-none
                           shadow-[0_2px_0_rgba(180,100,0,0.04)]
                           transition-all duration-200
                           focus:border-[#FFB800]
                           focus:shadow-[0_0_0_5px_rgba(255,184,0,0.16)]"
              />
            </div>

            {/* Пароль */}
            <div>
              <label className="block text-[10px] uppercase tracking-[0.26em] text-zinc-400 font-bold mb-2">
                Пароль
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(''); }}
                  autoComplete="current-password"
                  className="w-full px-4 pr-12 py-3.5 bg-white border-2 border-transparent rounded-2xl
                             text-sm text-[#1A1A22] placeholder:text-zinc-300 outline-none
                             shadow-[0_2px_0_rgba(180,100,0,0.04)]
                             transition-all duration-200
                             focus:border-[#FFB800]
                             focus:shadow-[0_0_0_5px_rgba(255,184,0,0.16)]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? 'Скрыть пароль' : 'Показать пароль'}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 w-9 h-9 flex items-center justify-center
                             rounded-xl text-zinc-400 hover:text-[#FF9500] hover:bg-[#FFB800]/10
                             transition-colors"
                >
                  {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
            </div>

            {/* Ошибка */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-start gap-2.5 px-4 py-3 rounded-2xl
                           bg-red-50 border border-red-100 text-red-600 text-[13px] leading-snug"
              >
                <span className="mt-px shrink-0">⚠</span>
                <span>{error}</span>
              </motion.div>
            )}

            {/* Кнопка */}
            <motion.button
              whileTap={{ scale: 0.985 }}
              type="submit"
              disabled={loading || !email || !password}
              className="pm-btn group relative w-full mt-1 py-4 rounded-2xl overflow-hidden
                         font-heading font-bold text-[12px] uppercase tracking-[0.22em] text-white
                         bg-[linear-gradient(90deg,#FFB800,#FF9500_50%,#FF6B00)]
                         shadow-[0_14px_30px_-10px_rgba(255,140,0,0.85)]
                         hover:shadow-[0_18px_38px_-10px_rgba(255,140,0,0.95)]
                         disabled:opacity-35 disabled:shadow-none disabled:cursor-not-allowed
                         transition-all duration-200"
            >
              <span className="relative z-10 inline-flex items-center justify-center gap-2">
                {loading && (
                  <span className="w-3.5 h-3.5 rounded-full border-2 border-white/40 border-t-white animate-spin" />
                )}
                {loading ? 'Вход...' : 'Войти'}
              </span>
              <span aria-hidden className="pm-shine absolute inset-y-0 -left-1/3 w-1/3 bg-white/35 blur-md" />
            </motion.button>
          </form>

          {/* Футер */}
          <div className="mt-8 flex items-center justify-between
                          text-[10px] uppercase tracking-[0.26em] text-zinc-400 font-semibold">
            <span>Pop Mart</span>
            <span>2026</span>
          </div>
        </motion.div>
      </div>
    </div>
  );
}