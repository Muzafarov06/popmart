// src/components/collection/FigureDetailModal.jsx
import { useState } from 'react';
import { motion } from 'framer-motion';
import { getRarity } from '@/data/rarity';

const EASE = [0.22, 1, 0.36, 1];

/* Фильтр «не собрано» — серый, но фигурку/карточку видно */
const DIM_FILTER = 'grayscale(1) brightness(0.55) opacity(0.85)';

/* ─────────────────── Секретная логика ─────────────────── */
function getSecretIndex(figure) {
  const s = (figure.silhouette || '').toLowerCase();
  if (s.includes('secret-2')) return 2;
  if (s.includes('secret-1')) return 1;
  if (figure.sort_order === 11) return 1;
  if (figure.sort_order === 12) return 2;
  return 1;
}

function extractUrl(v) {
  if (!v) return '';
  if (typeof v === 'string') return v.trim();
  if (typeof v === 'object') {
    if (typeof v.url === 'string') return v.url.trim();
    if (typeof v.src === 'string') return v.src.trim();
    if (typeof v.cover === 'string') return v.cover.trim();
  }
  return '';
}

function getDbSecretCover(collection, idx) {
  if (!collection) return '';
  const keys =
    idx === 1
      ? ['secret_1_cover', 'secret1_cover', 'secret_cover_1', 'secretCover1', 'secret_1', 'secret1']
      : ['secret_2_cover', 'secret2_cover', 'secret_cover_2', 'secretCover2', 'secret_2', 'secret2'];
  for (const key of keys) {
    const url = extractUrl(collection[key]);
    if (url) return url;
  }
  const arr = collection.secret_covers || collection.secrets || collection.secretCovers;
  if (Array.isArray(arr)) {
    const url = extractUrl(arr[idx - 1]);
    if (url) return url;
  }
  return '';
}

function getSecretSrc(figure, collection) {
  const fromFigure = extractUrl(figure?.silhouette);
  if (fromFigure) return fromFigure;
  const idx = getSecretIndex(figure);
  const fromCollection = getDbSecretCover(collection, idx);
  if (fromCollection) return fromCollection;
  return `/box/secret-${idx}.jpg`;
}

/* ─────────────────── Белый SVG-замок ─────────────────── */
function LockIcon({ className = 'w-11 h-11' }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="white"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      style={{ filter: 'drop-shadow(0 3px 6px rgba(0,0,0,0.45))' }}
    >
      <rect x="5" y="11" width="14" height="10" rx="2" />
      <path d="M8 11V7a4 4 0 0 1 8 0v4" />
    </svg>
  );
}

function LockOverlay() {
  return (
    <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none">
      <div className="flex items-center justify-center
                      w-24 h-24 rounded-full
                      bg-black/35 backdrop-blur-[2px]
                      ring-1 ring-white/25
                      shadow-[0_8px_24px_-6px_rgba(0,0,0,0.55)]">
        <LockIcon className="w-11 h-11" />
      </div>
    </div>
  );
}

function LockOverlaySmall() {
  return (
    <div className="absolute inset-0 z-10 flex items-center justify-center
                    rounded-xl bg-black/30 pointer-events-none">
      <LockIcon className="w-8 h-8" />
    </div>
  );
}

/* ─────────────────── Бейдж редкости (тёмный текст!) ─────────────────── */
function RarityBadge({ label, rank, color }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2, duration: 0.5, ease: EASE }}
      className="inline-flex items-center gap-3 self-start
                 px-4 py-2 rounded-full bg-white
                 shadow-[0_6px_18px_-10px_rgba(120,60,0,0.3)]"
      style={{ border: `1.5px solid ${color}66` }}
    >
      {/* Цветная точка с ореолом */}
      <span
        className="w-2.5 h-2.5 rounded-full shrink-0"
        style={{
          background: color,
          boxShadow: `0 0 0 3px ${color}33`,
        }}
      />
      {/* Тёмный текст — читается при любом цвете редкости */}
      <span className="font-heading text-[11px] font-black uppercase tracking-[0.22em] text-[#1A1A22]">
        {label}
      </span>
      <span className="w-px h-3.5 bg-[#E7D5BC]" />
      <span className="font-heading text-[11px] font-black uppercase tracking-[0.22em] text-[#1A1A22]">
        {rank}
      </span>
    </motion.div>
  );
}

/* ─────────────────── Инфо-блок: тёмный или с цветной полоской ─────────────────── */
function InfoBlock({ label, value, accent, dark }) {
  if (dark) {
    return (
      <div className="relative p-5 rounded-2xl bg-[#1A1A22] text-white
                      shadow-[0_10px_28px_-18px_rgba(26,26,34,0.6)]">
        <div className="text-[9px] uppercase tracking-[0.3em] text-white/55 font-black">
          {label}
        </div>
        <div className="mt-2 font-heading font-black text-[30px] leading-none tabular-nums text-white">
          {value}
        </div>
      </div>
    );
  }
  return (
    <div className="relative rounded-2xl bg-white border border-[#F0E4D2]
                    overflow-hidden
                    shadow-[0_10px_28px_-18px_rgba(120,60,0,0.35)]">
      {/* Цветная полоска сверху — акцент, не текст */}
      {accent && (
        <span
          aria-hidden
          className="absolute inset-x-0 top-0 h-1"
          style={{ background: accent }}
        />
      )}
      <div className="p-5">
        <div className="text-[9px] uppercase tracking-[0.3em] text-zinc-400 font-black">
          {label}
        </div>
        {/* Тёмный текст — контраст независимо от цвета редкости */}
        <div className="mt-2 font-heading font-black text-[30px] leading-none tabular-nums text-[#1A1A22]">
          {value}
        </div>
      </div>
    </div>
  );
}

/* ─────────────────── Flip-карточка ─────────────────── */
function FlipFigure({ figureSrc, cardSrc, alt, glow, dimmed }) {
  const [flipped, setFlipped] = useState(false);
  const canFlip = !!cardSrc;
  const toggle = () => canFlip && setFlipped((v) => !v);

  const dimStyle = dimmed ? { filter: DIM_FILTER } : undefined;

  return (
    <div className="relative w-full max-w-[560px] flex flex-col items-center gap-7">
      <div className="relative w-full" style={{ perspective: '1600px' }}>
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 flex items-center justify-center"
        >
          <div
            className="w-[75%] aspect-square rounded-full blur-[90px] opacity-60"
            style={{
              background: `radial-gradient(circle, ${glow}66 0%, transparent 70%)`,
            }}
          />
        </div>

        <button
          type="button"
          onClick={toggle}
          disabled={!canFlip}
          className="relative w-full aspect-[4/5] block cursor-pointer
                     disabled:cursor-default focus:outline-none"
        >
          <motion.div
            className="relative w-full h-full"
            style={{
              transformStyle: 'preserve-3d',
              willChange: 'transform',
            }}
            animate={{ rotateY: flipped ? 180 : 0 }}
            transition={{ duration: 0.8, ease: EASE }}
          >
            {/* FRONT — фигурка */}
            <div
              className="absolute inset-0 flex items-center justify-center"
              style={{
                backfaceVisibility: 'hidden',
                WebkitBackfaceVisibility: 'hidden',
                transform: 'rotateY(0deg) translateZ(1px)',
              }}
            >
              <img
                src={figureSrc}
                alt={alt}
                draggable={false}
                className="w-full h-full object-contain select-none"
                style={dimStyle}
              />
              {dimmed && <LockOverlay />}
            </div>

            {/* BACK — карточка */}
            <div
              className="absolute inset-0 flex items-center justify-center"
              style={{
                backfaceVisibility: 'hidden',
                WebkitBackfaceVisibility: 'hidden',
                transform: 'rotateY(180deg) translateZ(1px)',
              }}
            >
              {cardSrc ? (
                <div className="relative w-[88%] max-w-[440px]">
                  <img
                    src={cardSrc}
                    alt=""
                    draggable={false}
                    className="w-full h-auto object-contain select-none
                               rounded-3xl ring-1 ring-white/40
                               shadow-[0_50px_100px_-30px_rgba(0,0,0,0.6)]"
                    style={dimStyle}
                  />
                  {dimmed && <LockOverlay />}
                </div>
              ) : (
                <div className="w-[88%] max-w-[440px] aspect-[3/4] rounded-3xl
                                border-2 border-dashed border-white/30
                                flex items-center justify-center text-white/60
                                text-[11px] uppercase tracking-[0.3em] font-black">
                  Нет карточки
                </div>
              )}
            </div>
          </motion.div>
        </button>
      </div>

      {canFlip && (
        <button
          type="button"
          onClick={toggle}
          className="group inline-flex items-center gap-3
                     px-6 py-3 rounded-full
                     bg-white text-[#1A1A22]
                     border border-[#E7D5BC]
                     shadow-[0_16px_32px_-16px_rgba(120,60,0,0.45)]
                     hover:bg-[#1A1A22] hover:text-white hover:border-[#1A1A22]
                     transition-all duration-300"
        >
          <motion.span
            animate={{ rotate: flipped ? 180 : 0 }}
            transition={{ duration: 0.5, ease: EASE }}
            className="text-[18px] leading-none"
          >
            ⇄
          </motion.span>
          <span className="font-heading text-[11px] font-black uppercase tracking-[0.28em]">
            {flipped ? 'Показать фигурку' : 'Показать карточку'}
          </span>
        </button>
      )}

      {canFlip && (
        <div className="flex items-center gap-2">
          <span
            className={`h-1.5 rounded-full transition-all duration-300 ${
              !flipped ? 'w-6 bg-[#1A1A22]' : 'w-1.5 bg-[#1A1A22]/25'
            }`}
          />
          <span
            className={`h-1.5 rounded-full transition-all duration-300 ${
              flipped ? 'w-6 bg-[#1A1A22]' : 'w-1.5 bg-[#1A1A22]/25'
            }`}
          />
        </div>
      )}
    </div>
  );
}

/* ─────────────────── Модалка ─────────────────── */
export default function FigureDetailModal({
  figure,
  collection,
  owned = 0,
  onClose,
}) {
  const isOwned = owned > 0;
  const isSecret = figure.is_secret;
  const showSilhouette = isSecret && !isOwned;
  const rarity = getRarity(figure.rarity);

  const figureSrc =
    isOwned || !isSecret ? figure.image : getSecretSrc(figure, collection);

  const cardSrc = showSilhouette
    ? getSecretSrc(figure, collection)
    : figure.card || figure.image;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="fixed inset-0 z-[80] bg-[#FFF6EA] overflow-y-auto"
    >
      <div className="fixed inset-x-0 top-0 h-1.5 bg-[#E60012] z-[90]" />

      <motion.button
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.25, duration: 0.4, ease: EASE }}
        onClick={onClose}
        aria-label="Закрыть"
        className="fixed top-5 right-5 z-[95] w-12 h-12 rounded-full
                   bg-[#1A1A22] text-white flex items-center justify-center
                   text-[16px] font-black
                   hover:bg-[#E60012] transition-colors
                   shadow-[0_12px_24px_-8px_rgba(26,26,34,0.5)]"
      >
        ✕
      </motion.button>

      <div className="relative min-h-screen flex flex-col lg:flex-row">
        {/* ─── Левая панель ─── */}
        <div
          className={`relative lg:flex-[1.05] flex items-center justify-center
                      min-h-[70vh] lg:min-h-screen overflow-hidden isolate
                      ${showSilhouette ? '' : 'px-6 py-14 lg:p-14'}`}
          style={
            showSilhouette
              ? { background: '#F5A623' }
              : {
                  background: isOwned
                    ? `radial-gradient(circle at 50% 45%, ${rarity.color}33 0%, ${rarity.color}0d 35%, transparent 75%), linear-gradient(180deg, #FFF9F0 0%, #FBEAD1 100%)`
                    : 'radial-gradient(circle at 50% 45%, #3a3a44 0%, #18181f 70%)',
                }
          }
        >
          {!showSilhouette && (
            <>
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 opacity-[0.18] z-0"
                style={{
                  backgroundImage: isOwned
                    ? 'radial-gradient(rgba(120,60,0,0.35) 1px, transparent 1px)'
                    : 'radial-gradient(rgba(255,255,255,0.25) 1px, transparent 1px)',
                  backgroundSize: '22px 22px',
                }}
              />
              {!isOwned && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
                  <span className="text-[140px] opacity-[0.08] select-none">🔒</span>
                </div>
              )}
            </>
          )}

          {showSilhouette ? (
            <motion.img
              key={figureSrc}
              initial={{ opacity: 0, scale: 1.06 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.9, ease: EASE }}
              src={figureSrc}
              alt={figure.name}
              draggable={false}
              className="absolute inset-0 w-full h-full object-cover select-none z-0"
            />
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 30, scale: 0.94 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.7, delay: 0.1, ease: EASE }}
              className="relative z-10 w-full flex justify-center"
            >
              <FlipFigure
                figureSrc={figureSrc}
                cardSrc={cardSrc}
                alt={figure.name}
                glow={isOwned ? rarity.color : '#8888aa'}
                dimmed={!isOwned}
              />
            </motion.div>
          )}

          <div className="absolute top-6 left-6 z-20 inline-flex items-center gap-2
                          px-3 py-1.5 bg-[#E60012] rounded-sm shadow-[0_6px_18px_-6px_rgba(230,0,18,0.6)]">
            <span className="text-white text-[8px] font-black tracking-[0.35em] uppercase">
              Pop Mart
            </span>
          </div>
        </div>

        {/* ─── Правая панель ─── */}
        <div className="relative lg:flex-1 bg-[#FFF6EA]">
          <div
            className="relative z-10 mx-auto max-w-2xl px-6 sm:px-10 lg:px-14
                       py-12 lg:py-16 flex flex-col gap-8"
          >
            {/* Бейдж редкости — тёмный текст */}
            <RarityBadge
              label={rarity.label}
              rank={figure.rarity}
              color={rarity.color}
            />

            {/* Имя */}
            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.28, duration: 0.6, ease: EASE }}
              className="font-heading font-black
                         text-[44px] sm:text-[60px] lg:text-[72px]
                         tracking-[-0.04em] leading-[0.95] text-[#1A1A22]"
            >
              {showSilhouette ? '???' : figure.name}
            </motion.h1>

            {showSilhouette && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.38, duration: 0.5 }}
                className="-mt-3 text-[14px] leading-relaxed font-medium max-w-md
                           text-[#8B5A00]"
              >
                Секретная фигурка. Собери коллекцию, чтобы узнать, кто это.
              </motion.p>
            )}

            {/* Разделитель */}
            <motion.div
              initial={{ opacity: 0, scaleX: 0 }}
              animate={{ opacity: 1, scaleX: 1 }}
              transition={{ delay: 0.35, duration: 0.6, ease: EASE }}
              className="h-px bg-gradient-to-r from-[#E7D5BC] via-[#E7D5BC] to-transparent origin-left"
            />

            {/* Статистика */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.42, duration: 0.5, ease: EASE }}
              className="grid grid-cols-2 gap-4"
            >
              {isOwned ? (
                <>
                  <InfoBlock label="Копий" value={`×${owned}`} dark />
                  <InfoBlock
                    label="Очков"
                    value={`+${figure.points}`}
                    accent={rarity.color}
                  />
                </>
              ) : (
                <div className="col-span-2 p-6 rounded-2xl
                                border-2 border-dashed border-[#E7D5BC] bg-white/50">
                  <div className="flex items-center gap-3">
                    <div>
                      <div className="text-[10px] uppercase tracking-[0.28em]
                                      text-zinc-400 font-black">
                        Статус
                      </div>
                      <div className="mt-1 font-heading font-black text-[16px] text-[#1A1A22]">
                        Ещё не собрана
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>

            {/* Превью карточки */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.5, ease: EASE }}
              className="p-5 rounded-3xl bg-white border border-[#F0E4D2]
                         shadow-[0_12px_32px_-20px_rgba(120,60,0,0.35)]"
            >
              <div className="flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <div className="text-[9px] uppercase tracking-[0.32em]
                                  text-zinc-400 font-black">
                    Превью карточки
                  </div>
                  <div className="mt-2 font-heading font-black text-[18px] text-[#1A1A22] truncate">
                    {showSilhouette ? 'Секретная' : figure.name}
                  </div>

                  {/* Чип «Ранг»: светлая подложка + тёмный текст */}
                  <div
                    className="mt-2 inline-flex items-center gap-1.5
                               px-2 py-1 rounded-md
                               text-[10px] font-black uppercase tracking-[0.2em]
                               text-[#1A1A22]"
                    style={{
                      background: `${rarity.color}22`,
                      border: `1px solid ${rarity.color}55`,
                    }}
                  >
                    <span
                      className="w-1.5 h-1.5 rounded-full"
                      style={{ background: rarity.color }}
                    />
                    Ранг {figure.rarity}
                  </div>
                </div>

                {cardSrc ? (
                  <div className="relative w-20 h-28 shrink-0">
                    <img
                      src={cardSrc}
                      alt=""
                      draggable={false}
                      className="w-full h-full object-cover rounded-xl ring-1 ring-[#F0E4D2]
                                 shadow-[0_8px_20px_-12px_rgba(120,60,0,0.35)]"
                      style={!isOwned ? { filter: DIM_FILTER } : undefined}
                    />
                    {!isOwned && <LockOverlaySmall />}
                  </div>
                ) : (
                  <div className="w-20 h-28 shrink-0 rounded-xl border-2 border-dashed border-[#E7D5BC]
                                  flex items-center justify-center text-[9px] text-zinc-400
                                  font-black uppercase tracking-[0.2em]">
                    —
                  </div>
                )}
              </div>
            </motion.div>

            {/* CTA */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.5, ease: EASE }}
              className="flex flex-col sm:flex-row gap-3 pt-2"
            >
              <button
                onClick={onClose}
                className="flex-1 py-4 rounded-2xl
                           bg-[#1A1A22] text-white
                           font-heading text-[12px] font-black uppercase
                           tracking-[0.22em]
                           shadow-[0_16px_28px_-16px_rgba(26,26,34,0.55)]
                           hover:bg-[#E60012] hover:shadow-[0_18px_32px_-14px_rgba(230,0,18,0.5)]
                           transition-all"
              >
                Закрыть
              </button>
            </motion.div>

            {/* Штамп */}
            <div className="pt-4 flex items-center gap-3">
              <span className="w-1.5 h-1.5 rounded-full bg-[#E60012]" />
              <span className="text-[9px] uppercase tracking-[0.35em]
                               font-black text-zinc-400">
                Company of Friends
              </span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}