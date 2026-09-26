// src/components/home/OpenBoxButton.jsx
import { motion } from 'framer-motion';

function GiftIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
      <path d="M20 12v10H4V12M2 7h20v5H2zM12 22V7" />
      <path d="M12 7H7.5a2.5 2.5 0 010-5C11 2 12 7 12 7zM12 7h4.5a2.5 2.5 0 000-5C13 2 12 7 12 7z" />
    </svg>
  );
}

export default function OpenBoxButton({ onClick, disabled, label }) {
  return (
    <motion.button
      onClick={onClick}
      disabled={disabled}
      whileTap={!disabled ? { scale: 0.98 } : undefined}
      whileHover={!disabled ? { y: -2 } : undefined}
      className="relative w-full overflow-hidden rounded-2xl
                 bg-[linear-gradient(110deg,#FFB800,#FF9500_45%,#FF6B00)]
                 py-4 px-6 font-heading text-[12px] font-black uppercase
                 tracking-[0.22em] text-white
                 shadow-[0_16px_32px_-14px_rgba(255,140,0,0.85)]
                 hover:shadow-[0_20px_40px_-14px_rgba(255,140,0,1)]
                 disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none
                 transition-shadow duration-200"
    >
      <span className="relative z-10 inline-flex items-center justify-center gap-2.5">
        <GiftIcon />
        {label}
      </span>
    </motion.button>
  );
}