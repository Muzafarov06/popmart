// src/components/collection/FigureCard.jsx
import { motion } from 'framer-motion';

const EASE = [0.22, 1, 0.36, 1];

/* Какой по счёту секрет (1 или 2) */
function getSecretIndex(figure) {
  const s = (figure.silhouette || '').toLowerCase();
  if (s.includes('secret-2')) return 2;
  if (s.includes('secret-1')) return 1;
  if (figure.sort_order === 11) return 1;
  if (figure.sort_order === 12) return 2;
  return 1;
}

/* Достаём URL из строки/объекта */
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

/* Итоговый источник секретной картинки.
   1) figure.silhouette       — уже в БД, приоритетный
   2) collection.secret_N_cover — запасной из БД
   3) /box/secret-N.jpg       — локальный фолбэк */
function getSecretSrc(figure, collection) {
  // 1. silhouette прямо у фигурки
  const fromFigure = extractUrl(figure?.silhouette);
  if (fromFigure) return { src: fromFigure, source: 'figure' };

  // 2. из коллекции
  const idx = getSecretIndex(figure);
  const fromCollection =
    idx === 1
      ? extractUrl(collection?.secret_1_cover)
      : extractUrl(collection?.secret_2_cover);
  if (fromCollection) return { src: fromCollection, source: 'collection' };

  // 3. локальный фолбэк
  return { src: `/box/secret-${idx}.jpg`, source: 'local' };
}

export default function FigureCard({
  figure,
  collection,
  owned = 0,
  index,
  onClick,
}) {
  const isOwned = owned > 0;
  const isSecret = figure.is_secret;
  const showSilhouette = isSecret && !isOwned;

  const secret = showSilhouette
    ? getSecretSrc(figure, collection)
    : { src: '', source: 'n/a' };

  const imageSrc = showSilhouette
    ? secret.src
    : figure.card || figure.image;

  return (
    <motion.button
      type="button"
      onClick={onClick}
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{
        duration: 0.45,
        delay: Math.min(index * 0.03, 0.6),
        ease: EASE,
      }}
      whileTap={{ scale: 0.98 }}
      className={`
        group relative w-full aspect-[3/4]
        rounded-2xl overflow-hidden
        bg-transparent
        transition-shadow duration-300
        ${
          isOwned
            ? 'shadow-[0_16px_32px_-16px_rgba(120,60,0,0.4)]'
            : 'shadow-[0_8px_20px_-12px_rgba(120,60,0,0.25)]'
        }
        hover:shadow-[0_20px_40px_-18px_rgba(120,60,0,0.55)]
      `}
    >
      {imageSrc && (
        <img
          src={imageSrc}
          alt=""
          aria-label={figure.name}
          className={`absolute inset-0 w-full h-full object-cover select-none
                      transition-[filter] duration-300
                      ${
                        isOwned
                          ? 'group-hover:brightness-75'
                          : isSecret
                            ? 'group-hover:brightness-90'
                            : 'grayscale opacity-45 group-hover:brightness-75'
                      }`}
          loading="lazy"
          draggable={false}
        />
      )}

      {!imageSrc && (
        <span className="absolute inset-0 ring-2 ring-red-400/70 rounded-2xl
                         flex items-center justify-center text-[10px] text-red-500
                         font-mono pointer-events-none">
          no src
        </span>
      )}

      {!isOwned && !isSecret && (
        <span className="absolute inset-0 bg-[#1A1A22]/15 pointer-events-none" />
      )}

      {!isOwned && !isSecret && (
        <span className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
          <svg
            viewBox="0 0 24 24"
            className="w-1/3 h-1/3 max-w-[84px] max-h-[84px]"
            fill="none"
            stroke="white"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ filter: 'drop-shadow(0 4px 10px rgba(0,0,0,0.45))' }}
          >
            <rect x="5" y="11" width="14" height="10" rx="2" />
            <path d="M8 11V7a4 4 0 0 1 8 0v4" />
          </svg>
        </span>
      )}

      {isOwned && owned > 1 && (
        <motion.span
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="absolute top-2 right-2 min-w-[26px] h-6 px-1.5
                     flex items-center justify-center
                     rounded-full bg-[#1A1A22] text-white
                     text-[10px] font-black tabular-nums
                     ring-2 ring-white z-20"
        >
          ×{owned}
        </motion.span>
      )}
    </motion.button>
  );
}