// src/components/leaderboard/RankBadge.jsx
import { motion } from 'framer-motion';

const EASE = [0.22, 1, 0.36, 1];

/* Палитры для топ-3 */
const TOP_STYLES = {
  1: {
    // Золото — тёплое, не кислотное
    gradient: 'linear-gradient(135deg, #FFE58A 0%, #FFB800 45%, #C47A00 100%)',
    ring: 'rgba(255,255,255,0.55)',
    shine: 'rgba(255,255,255,0.75)',
    shadow: '0 10px 24px -10px rgba(196,122,0,0.85)',
    text: '#3A2100',
  },
  2: {
    // Серебро — холодное, с лёгким синим подтоном
    gradient: 'linear-gradient(135deg, #F4F7FB 0%, #C7CFD9 45%, #7E8794 100%)',
    ring: 'rgba(255,255,255,0.55)',
    shine: 'rgba(255,255,255,0.85)',
    shadow: '0 10px 24px -10px rgba(120,130,150,0.75)',
    text: '#1F2733',
  },
  3: {
    // Бронза — приглушённая, без «кирпича»
    gradient: 'linear-gradient(135deg, #E8C39E 0%, #B88252 45%, #6E4318 100%)',
    ring: 'rgba(255,255,255,0.45)',
    shine: 'rgba(255,240,220,0.7)',
    shadow: '0 10px 24px -10px rgba(110,67,24,0.75)',
    text: '#2B1806',
  },
};

export default function RankBadge({ rank, size = 'md' }) {
  const s = TOP_STYLES[rank];

  /* ─── Топ-3: монетка ─── */
  if (s) {
    const dimensions = size === 'sm' ? 'w-9 h-9' : 'w-11 h-11';
    const textSize = size === 'sm' ? 'text-[14px]' : 'text-[17px]';
    const shineSize = size === 'sm' ? 'w-3 h-1' : 'w-4 h-1.5';

    return (
      <motion.div
        initial={{ scale: 0.6, rotate: -12, opacity: 0 }}
        animate={{ scale: 1, rotate: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: rank * 0.08, ease: EASE }}
        className={`relative ${dimensions} rounded-full flex items-center justify-center
                    select-none shrink-0`}
        style={{
          background: s.gradient,
          boxShadow: s.shadow,
        }}
      >
        {/* Тонкое внутреннее кольцо */}
        <span
          aria-hidden
          className="absolute inset-[3px] rounded-full pointer-events-none"
          style={{ boxShadow: `inset 0 0 0 1px ${s.ring}` }}
        />

        {/* Верхний блеск — как блик на металле */}
        <span
          aria-hidden
          className={`absolute top-[5px] left-[8px] ${shineSize} rounded-full
                      blur-[3px] rotate-[-28deg] pointer-events-none`}
          style={{ background: s.shine }}
        />

        {/* Нижний тёмный край — объём */}
        <span
          aria-hidden
          className="absolute inset-x-2 bottom-[3px] h-1 rounded-full
                     blur-[2px] opacity-30 pointer-events-none"
          style={{ background: '#000' }}
        />

        {/* Цифра */}
        <span
          className={`relative font-heading font-black ${textSize} leading-none
                      tabular-nums`}
          style={{
            color: s.text,
            textShadow: '0 1px 0 rgba(255,255,255,0.35)',
          }}
        >
          {rank}
        </span>
      </motion.div>
    );
  }

  /* ─── Остальные: минималистичный нейтральный номер ─── */
  return (
    <div
      className="w-11 h-11 rounded-full flex items-center justify-center
                 bg-white/60 border border-[#F0E4D2] select-none shrink-0"
    >
      <span className="font-heading font-black text-[14px] leading-none
                       tabular-nums text-zinc-400">
        {rank}
      </span>
    </div>
  );
}