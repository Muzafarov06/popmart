// src/components/unbox/CollectionCompleteModal.jsx
import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  getCollectionCompleteMessage,
  fireCollectionCompleteConfetti,
} from '@/data/collectionComplete';

const EASE = [0.22, 1, 0.36, 1];

export default function CollectionCompleteModal({ collectionName, onClose }) {
  const msg = getCollectionCompleteMessage();

  useEffect(() => {
    const t = setTimeout(fireCollectionCompleteConfetti, 400);
    return () => clearTimeout(t);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      className="fixed inset-0 z-[80] flex items-center justify-center px-5 py-10
                 bg-[#1A1A22]/50 backdrop-blur-md"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.85, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        transition={{ duration: 0.7, ease: EASE }}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-md overflow-hidden rounded-[32px]
                   bg-[#FFF6EA] p-8 sm:p-10
                   shadow-[0_40px_100px_-40px_rgba(0,0,0,0.6)]
                   text-center isolate"
      >
        {/* Золотое свечение — только сверху, за контентом */}
        <div
          aria-hidden
          className="pointer-events-none absolute -top-32 left-1/2 -translate-x-1/2
                     w-[380px] h-[380px] rounded-full
                     bg-[#FFD24C]/50 blur-[100px] -z-10"
        />

        {/* Тонкая рамка POP MART */}
        <div className="absolute inset-x-0 top-0 h-1 bg-[#E60012]" />

        {/* Кубок — чёткий, без большого ореола */}
        <motion.div
          initial={{ scale: 0, rotate: -30 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 0.3, duration: 0.7, ease: EASE }}
          className="relative mx-auto w-24 h-24 flex items-center justify-center
                     rounded-full bg-[linear-gradient(160deg,#FFD24C,#FF8C00)]
                     shadow-[0_16px_32px_-12px_rgba(255,140,0,0.7)]"
        >
          <span className="text-5xl select-none leading-none">🏆</span>

          {/* Тонкое пульсирующее кольцо вокруг — не перекрывает */}
          <motion.span
            animate={{ scale: [1, 1.25, 1], opacity: [0.4, 0.15, 0.4] }}
            transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
            aria-hidden
            className="absolute inset-0 rounded-full border-2 border-[#FFB800] pointer-events-none"
          />
        </motion.div>

        {/* Заголовок */}
        <motion.h2
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6, ease: EASE }}
          className="relative mt-7 font-heading font-black
                     text-[28px] sm:text-[34px] tracking-[-0.03em] leading-[1.05]
                     text-[#1A1A22]"
        >
          {msg.title}
        </motion.h2>

        {/* Подзаголовок */}
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.65, duration: 0.5, ease: EASE }}
          className="relative mt-4 text-[14px] text-zinc-600 leading-relaxed"
        >
          {msg.subtitle}
        </motion.p>

        {/* Название коллекции */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.5 }}
          className="relative mt-7 inline-flex items-center gap-2
                     px-4 py-2 rounded-full
                     bg-[#1A1A22] text-white
                     text-[10px] font-black uppercase tracking-[0.22em]"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-[#FFD24C]" />
          {collectionName}
          <span className="w-px h-3 bg-white/25" />
          12 / 12
        </motion.div>

        {/* Кнопки */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9, duration: 0.5 }}
          className="relative mt-9 flex flex-col sm:flex-row gap-3"
        >
          <button
            onClick={onClose}
            className="pm-btn group relative flex-1 overflow-hidden rounded-2xl
                       bg-[linear-gradient(90deg,#FFB800,#FF9500_50%,#FF6B00)]
                       py-4 font-heading text-[12px] font-black uppercase tracking-[0.22em] text-white
                       shadow-[0_14px_30px_-12px_rgba(255,140,0,0.9)]
                       hover:shadow-[0_20px_40px_-12px_rgba(255,140,0,1)]
                       transition-shadow"
          >
            <span className="relative z-10">Продолжить</span>
            <span
              aria-hidden
              className="pm-shine absolute inset-y-0 -left-1/3 w-1/3 bg-white/40 blur-md"
            />
          </button>

          <Link
            to="/collection"
            className="flex-1 py-4 rounded-2xl border border-[#E7D5BC] bg-white/80
                       text-[#1A1A22] font-heading text-[12px] font-black uppercase
                       tracking-[0.22em] hover:bg-white transition-colors text-center"
          >
            В коллекцию
          </Link>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}