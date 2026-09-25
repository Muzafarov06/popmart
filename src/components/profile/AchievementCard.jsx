// src/components/profile/AchievementCard.jsx
import { motion } from 'framer-motion';

const EASE = [0.22, 1, 0.36, 1];

export default function AchievementCard({ achievement, index }) {
  const { icon, name, description, points, earned } = achievement;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.03, ease: EASE }}
      className={`relative rounded-2xl p-4 border transition-all overflow-hidden
                  ${earned
                    ? 'bg-white border-[#F0E4D2] shadow-[0_12px_28px_-16px_rgba(120,60,0,0.4)]'
                    : 'bg-white/50 border-[#F0E4D2]/70'}`}
    >
      {/* Иконка */}
      <div
        className={`w-12 h-12 rounded-2xl flex items-center justify-center
                    text-[24px] mb-3 transition-all
                    ${earned
                      ? 'bg-[linear-gradient(135deg,#FFB800,#FF6B00)] shadow-[0_8px_20px_-10px_rgba(255,140,0,0.8)]'
                      : 'bg-[#F0E4D2]/60 grayscale opacity-40'}`}
      >
        {icon}
      </div>

      {/* Название */}
      <div
        className={`font-heading font-black text-[14px] leading-tight mb-1
                    ${earned ? 'text-[#1A1A22]' : 'text-zinc-400'}`}
      >
        {name}
      </div>

      {/* Описание */}
      <div className={`text-[11px] leading-snug mb-3
                       ${earned ? 'text-zinc-500' : 'text-zinc-400'}`}>
        {description}
      </div>

      {/* Очки */}
      <div
        className={`inline-flex items-center gap-1 px-2 py-1 rounded-md
                    text-[9px] font-black uppercase tracking-[0.18em]
                    ${earned
                      ? 'bg-[#FFB800]/15 text-[#B87400]'
                      : 'bg-zinc-100 text-zinc-400'}`}
      >
        +{points}
      </div>

      {/* Замок для неполученных — SVG */}
      {!earned && (
        <div className="absolute top-3 right-3 opacity-30">
          <svg viewBox="0 0 24 24" fill="none" stroke="#1A1A22"
            strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
            className="w-4 h-4">
            <rect x="5" y="11" width="14" height="10" rx="2" />
            <path d="M8 11V7a4 4 0 0 1 8 0v4" />
          </svg>
        </div>
      )}
    </motion.div>
  );
}