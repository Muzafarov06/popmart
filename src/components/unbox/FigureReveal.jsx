// src/components/unbox/FigureReveal.jsx
import { useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion, animate, useMotionValue, useTransform } from 'framer-motion';
import { getRarity } from '@/data/rarity';
import { getDuplicateMessage } from '@/data/duplicates';
import { getNewMessage } from '@/data/newMessages';
import { fireConfetti } from '@/lib/confetti';

const EASE = [0.22, 1, 0.36, 1];

export default function FigureReveal({ result, onAgain, backLabel = 'Открыть ещё' }) {
  const rarity = getRarity(result.rarity);
  const isLegendary = result.rarity === 'S' || result.rarity === 'SS+';
  const isNew = result.isNew;

  const message = useMemo(
    () => (isNew ? getNewMessage(result.rarity) : getDuplicateMessage(result.rarity)),
    [result.id, result.rarity, isNew],
  );

  const nameWords = useMemo(() => result.name.split(' '), [result.name]);

  /* ─── Анимированный счётчик очков ─── */
  const pointsMV = useMotionValue(0);
  const pointsText = useTransform(pointsMV, (v) => `${Math.round(v)}`);

  useEffect(() => {
    const t = setTimeout(() => fireConfetti(result.rarity), 250);
    return () => clearTimeout(t);
  }, [result.rarity]);

  useEffect(() => {
    const controls = animate(pointsMV, result.points, {
      duration: 0.9,
      delay: 0.6,
      ease: EASE,
    });
    return () => controls.stop();
  }, [result.points, pointsMV]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.7, ease: EASE }}
      className="relative flex flex-col items-center text-center isolate"
    >
      {/* ═══ СВЕЧЕНИЕ ═══ */}
      <div
        aria-hidden
        className="absolute top-[42%] left-1/2 -translate-x-1/2
                   w-[420px] h-[420px] rounded-full
                   blur-[110px] opacity-50 pointer-events-none -z-10"
        style={{ background: rarity.glow }}
      />

      {/* ═══ ФИГУРКА + БЕЙДЖИ ═══ */}
      <motion.div
        initial={{ scale: 0.7, y: 40 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ duration: 0.8, ease: EASE }}
        className="relative z-10"
      >
        <motion.img
          src={result.image}
          alt={result.name}
          className="w-[220px] sm:w-[280px] md:w-[340px] h-auto select-none"
          style={{ filter: 'drop-shadow(0 30px 55px rgba(120,60,0,0.45))' }}
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
        />

        {/* Бейдж NEW */}
        {isNew && (
          <motion.span
            initial={{ opacity: 0, scale: 0.5, rotate: -22 }}
            animate={{ opacity: 1, scale: 1, rotate: -8 }}
            transition={{ duration: 0.5, delay: 0.45, ease: EASE }}
            className="absolute -top-3 -left-3 px-3.5 py-2 rounded-full
                       bg-[#1E7A44] text-white text-[10px] font-black uppercase tracking-[0.2em]
                       shadow-[0_10px_24px_-8px_rgba(30,122,68,0.8)]
                       ring-2 ring-white z-20"
          >
            NEW
          </motion.span>
        )}

        {/* ═══ ОЧКИ — бейдж как NEW, но в цвете редкости ═══ */}
        <motion.div
          initial={{ opacity: 0, scale: 0.5, rotate: 8 }}
          animate={{ opacity: 1, scale: 1, rotate: 4 }}
          transition={{ duration: 0.5, delay: 0.4, ease: EASE }}
          className="absolute -top-3 -right-3 sm:-top-6 sm:-right-8 z-30"
        >
          <div
            className="relative px-3.5 py-2 rounded-full
                       text-[10px] font-black uppercase tracking-[0.2em]
                       ring-2 ring-white overflow-hidden"
            style={{
              background: rarity.color,
              color: '#FFFFFF',
              boxShadow: `0 10px 24px -8px ${rarity.color}cc`,
            }}
          >
            <motion.span
              aria-hidden
              className="absolute inset-y-0 w-1/3 bg-white/45 blur-md"
              initial={{ x: '-150%' }}
              animate={{ x: '350%' }}
              transition={{
                delay: 1.2,
                duration: 1,
                ease: EASE,
                repeat: Infinity,
                repeatDelay: 3.5,
              }}
            />
            <span className="relative">
              +<motion.span>{pointsText}</motion.span>
            </span>
          </div>
        </motion.div>

        {/* Искры для легендарных */}
        {isLegendary &&
          [...Array(6)].map((_, i) => (
            <motion.span
              key={i}
              className="absolute text-[#FFB800] text-xl select-none pointer-events-none"
              style={{
                top: `${10 + ((i * 15) % 70)}%`,
                left: `${(i * 40) % 90}%`,
              }}
              animate={{
                opacity: [0, 1, 0],
                scale: [0.6, 1.3, 0.6],
                rotate: [0, 180, 360],
              }}
              transition={{
                duration: 2.5,
                repeat: Infinity,
                delay: i * 0.3,
                ease: 'easeInOut',
              }}
            >
              ✦
            </motion.span>
          ))}
      </motion.div>

      {/* ═══ НАЗВАНИЕ ═══ */}
      <motion.h2
        className="relative z-10 mt-7 font-heading font-black
                   text-[34px] sm:text-[46px] tracking-[-0.035em]
                   leading-[0.95] text-[#1A1A22] max-w-2xl"
      >
        {nameWords.map((word, i) => (
          <motion.span
            key={`${word}-${i}`}
            initial={{ opacity: 0, y: 26, filter: 'blur(10px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            transition={{ delay: 0.5 + i * 0.07, duration: 0.65, ease: EASE }}
            className="inline-block mr-[0.28em] last:mr-0"
          >
            {word}
          </motion.span>
        ))}
      </motion.h2>

      {/* ═══ РАНГ ═══ */}
      <div className="relative z-10 mt-4 flex flex-col items-center">
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.5, ease: EASE }}
          className="mt-2 flex items-center gap-3"
        >
          <motion.span
            initial={{ scaleX: 0, opacity: 0 }}
            animate={{ scaleX: 1, opacity: 1 }}
            transition={{ delay: 1.05, duration: 0.5, ease: EASE }}
            className="block w-8 sm:w-12 h-px origin-right"
            style={{
              background: `linear-gradient(90deg, transparent 0%, ${rarity.color}AA 60%, ${rarity.color} 100%)`,
            }}
          />
          <span
            className="font-heading font-black uppercase whitespace-nowrap
                       text-[10px] sm:text-[20px] tracking-[0.34em]"
            style={{
              color: rarity.color,
              textShadow: `0 2px 8px ${rarity.color}44`,
            }}
          >
            {rarity.label}
          </span>
          <motion.span
            initial={{ scaleX: 0, opacity: 0 }}
            animate={{ scaleX: 1, opacity: 1 }}
            transition={{ delay: 1.05, duration: 0.5, ease: EASE }}
            className="block w-8 sm:w-12 h-px origin-left"
            style={{
              background: `linear-gradient(270deg, transparent 0%, ${rarity.color}AA 60%, ${rarity.color} 100%)`,
            }}
          />
        </motion.div>
      </div>

      {/* ═══ ЦИТАТА ═══ */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.15, duration: 0.5, ease: EASE }}
        className="relative z-10 mt-8 max-w-md w-full px-8"
      >
        <span
          aria-hidden
          className="absolute -top-6 left-0 font-heading font-black
                     text-[64px] leading-none select-none"
          style={{ color: isNew ? '#1E7A44' : '#D68A00', opacity: 0.18 }}
        >
          «
        </span>

        <p
          className={`text-[14px] italic leading-relaxed text-center font-medium
                     ${isNew ? 'text-[#1E7A44]' : 'text-[#9A6A00]'}`}
        >
          {message}
        </p>

        <span
          aria-hidden
          className="absolute -bottom-9 right-0 font-heading font-black
                     text-[64px] leading-none select-none"
          style={{ color: isNew ? '#1E7A44' : '#D68A00', opacity: 0.18 }}
        >
          »
        </span>
      </motion.div>

      {/* ═══ КНОПКИ ═══ */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.25, duration: 0.5, ease: EASE }}
        className="relative z-10 mt-14 flex flex-col sm:flex-row gap-3 w-full max-w-sm"
      >
        <button
          onClick={onAgain}
          className="pm-btn group relative flex-1 overflow-hidden rounded-2xl
                     bg-[linear-gradient(90deg,#FFB800,#FF9500_50%,#FF6B00)]
                     py-4 font-heading text-[12px] font-black uppercase tracking-[0.22em] text-white
                     shadow-[0_14px_30px_-12px_rgba(255,140,0,0.9)]
                     hover:shadow-[0_20px_40px_-12px_rgba(255,140,0,1)]
                     transition-shadow"
        >
          <span className="relative z-10">{backLabel}</span>
          <span
            aria-hidden
            className="pm-shine absolute inset-y-0 -left-1/3 w-1/3 bg-white/40 blur-md"
          />
        </button>

        <Link
          to="/"
          className="flex-1 py-4 rounded-2xl border border-[#E7D5BC] bg-white/70
                     text-[#1A1A22] font-heading text-[12px] font-black uppercase
                     tracking-[0.22em] hover:bg-white transition-colors text-center"
        >
          В коллекцию
        </Link>
      </motion.div>
    </motion.div>
  );
}