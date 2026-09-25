// src/components/home/Header.jsx
import { AnimatePresence, motion } from 'framer-motion';

const EASE = [0.22, 1, 0.36, 1];

function plural(n, forms) {
  const a = Math.abs(n) % 100;
  const b = a % 10;
  if (a > 10 && a < 20) return forms[2];
  if (b > 1 && b < 5) return forms[1];
  if (b === 1) return forms[0];
  return forms[2];
}

function WordPlaque({ children }) {
  return (
    <span className="relative inline-block">
      <span
        aria-hidden
        className="absolute inset-x-[-10px] inset-y-[6%]
                   bg-[linear-gradient(115deg,#FFB800_0%,#FF9500_50%,#FF6B00_100%)]
                   rounded-2xl
                   -rotate-[1.6deg]
                   shadow-[0_16px_36px_-14px_rgba(255,140,0,0.75)]"
      />
      <span className="relative z-10 text-white px-3 md:px-4">
        {children}
      </span>
    </span>
  );
}

export default function Header({ user, count, active }) {
  return (
    <motion.header
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: EASE }}
      className="relative text-center md:text-left"
    >
      {/* ═══ ЗАГОЛОВОК ═══ */}
      <h1
        className="mt-0 sm:mt-1 font-heading font-black
                   tracking-[-0.045em] leading-[0.95]
                   text-[#1A1A22]
                   mx-auto md:mx-0"
        style={{ fontSize: 'clamp(38px, 8.5vw, 68px)' }}
      >
        {/* ── МОБИЛЬНАЯ ВЕРСИЯ: три строки ── */}
        <span className="md:hidden">
          <motion.span
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.15, ease: EASE }}
            className="block"
          >
            Кто
          </motion.span>

          <motion.span
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.3, ease: EASE }}
            className="block mt-2"
          >
            <WordPlaque>попадётся</WordPlaque>
          </motion.span>

          <motion.span
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.45, ease: EASE }}
            className="block mt-2"
          >
            тебе?
          </motion.span>
        </span>

        {/* ── ДЕСКТОПНАЯ ВЕРСИЯ: одна строка ── */}
        <span className="hidden md:inline-flex items-baseline gap-6 flex-nowrap">
          <motion.span
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.15, ease: EASE }}
          >
            Кто
          </motion.span>

          <motion.span
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.3, ease: EASE }}
          >
            <WordPlaque>попадётся</WordPlaque>
          </motion.span>

          <motion.span
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.45, ease: EASE }}
          >
            тебе?
          </motion.span>
        </span>
      </h1>

      {/* ═══ Мини-подпись ═══ */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.9 }}
        className="mt-3 sm:mt-4
                   text-[10px] sm:text-[11px] uppercase
                   tracking-[0.4em] font-black text-zinc-400
                   mx-auto md:mx-0"
      >
        Открой коробку — узнаешь
      </motion.p>

      {/* ═══ Описание коллекции ═══ */}
      <div className="mt-4 sm:mt-5 min-h-[40px]">
        <AnimatePresence mode="wait">
          <motion.p
            key={active?.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.35, ease: EASE }}
            className="mx-auto max-w-md
                       text-[13.5px] sm:text-[15px] md:text-[16px]
                       leading-relaxed text-zinc-500
                       px-4 md:px-0 md:mx-0"
          >
            {active?.description || 'Собери всю коллекцию'}
          </motion.p>
        </AnimatePresence>
      </div>
    </motion.header>
  );
}