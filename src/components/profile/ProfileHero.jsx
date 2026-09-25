// src/components/profile/ProfileHero.jsx
import { motion } from 'framer-motion';
import { findUserByLogin } from '@/data/users';

const EASE = [0.22, 1, 0.36, 1];

export default function ProfileHero({ profile }) {
  const meta = findUserByLogin(profile.login);
  const emoji = meta?.emoji || '🐾';
  const color = meta?.color || '#FFB800';
  const isAdmin = profile.role === 'admin';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: EASE }}
      className="relative rounded-3xl bg-white/80 backdrop-blur-sm
                 border border-[#F0E4D2]
                 shadow-[0_24px_60px_-32px_rgba(120,60,0,0.4)]
                 p-6 sm:p-8 overflow-hidden"
    >
      {/* Свечение сзади */}
      <span
        aria-hidden
        className="pointer-events-none absolute -top-24 -right-24 w-64 h-64
                   rounded-full blur-3xl opacity-30"
        style={{ background: color }}
      />

      <div className="relative flex items-center gap-5">
        <span className="relative shrink-0">
          <span
            aria-hidden
            className="absolute inset-0 rounded-full blur-[16px] opacity-60"
            style={{ background: color }}
          />
          <span
            className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-full
                       flex items-center justify-center text-[40px] sm:text-[48px]
                       ring-4 ring-white shadow-[0_12px_28px_-10px_rgba(0,0,0,0.35)]"
            style={{ background: `${color}2E` }}
          >
            {emoji}
          </span>
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="font-heading font-black text-[28px] sm:text-[36px]
                           tracking-[-0.03em] leading-tight text-[#1A1A22]">
              {profile.display_name}
            </h1>
            {isAdmin && (
              <span className="text-[9px] uppercase tracking-[0.24em]
                               font-black px-2 py-1 rounded-md
                               text-[#B87400] bg-[#FFB800]/15">
                admin
              </span>
            )}
          </div>
          <p className="text-[13px] text-zinc-400 font-mono mt-0.5">
            @{profile.login}
          </p>
        </div>
      </div>
    </motion.div>
  );
}