// src/components/collection/HoneycombDisplay.jsx
import { motion } from 'framer-motion';
import { getRarity } from '@/data/rarity';

const EASE = [0.22, 1, 0.36, 1];

const GAP = 0;              // ← уменьшено: полки ближе по горизонтали
const ITEMS_PER_ROW = 4;

const SHELF_WIDTH = '125%'; // размер самой полки
const SHELF_TOP = '23%';    // ниже значение = фигурка ниже (низ фигурки = верх полки)

/* ─── Одна фигурка на своей полке ─── */
function FigureShelf({ figure, owned, onClick, index }) {
  const isOwned = owned > 0;
  const isSecret = figure.is_secret;
  const isHiddenSecret = isSecret && !isOwned;
  const rarity = getRarity(figure.rarity);

  return (
    <motion.button
      type="button"
      onClick={onClick}
      initial={{ opacity: 0, y: 20, scale: 0.94 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: index * 0.04, duration: 0.45, ease: EASE }}
      whileTap={{ scale: 0.97 }}
      className="relative shrink-0 group cursor-pointer"
      style={{
        width: 'var(--item-w)',
        aspectRatio: '100 / 130',
      }}
    >
      {isHiddenSecret ? (
        <span
          className="absolute left-0 right-0 top-0 flex items-center justify-center
                     font-heading font-black select-none pointer-events-none"
          style={{
            height: '74%',
            fontSize: 'clamp(70px, 12vw, 180px)',
            color: `${rarity.color}66`,
            textShadow: '0 6px 18px rgba(0,0,0,0.15)',
            lineHeight: 1,
            zIndex: 6,
          }}
        >
          ?
        </span>
      ) : (
        <div
          className="absolute left-0 right-0 top-0 flex items-end justify-center pointer-events-none"
          style={{
            bottom: SHELF_TOP,
            paddingLeft: '6%',
            paddingRight: '6%',
            zIndex: 6,
          }}
        >
          <img
            src={figure.image}
            alt={figure.name}
            className="w-full h-full object-contain object-bottom"
            style={{
              filter: isOwned
                ? 'drop-shadow(0 8px 14px rgba(0,0,0,0.22))'
                : 'brightness(0) opacity(0.45)',
            }}
            loading="lazy"
            draggable={false}
          />
        </div>
      )}

      {/* ── Полка ── */}
      <img
        src="/resources/polka.png"
        alt=""
        aria-hidden="true"
        draggable={false}
        className="absolute left-1/2 -translate-x-1/2 bottom-0
                   pointer-events-none select-none"
        style={{ width: SHELF_WIDTH, height: 'auto', zIndex: 5 }}
      />
    </motion.button>
  );
}

/* ─── Полки с фигурками ─── */
export default function HoneycombDisplay({ figures, owned, onSelect }) {
  const byRarity = { D: [], C: [], B: [], A: [], S: [], 'SS+': [] };
  figures.forEach((f) => {
    if (byRarity[f.rarity]) byRarity[f.rarity].push(f);
  });

  const midS = Math.floor(byRarity.S.length / 2);
  const topRow = [
    ...byRarity.S.slice(0, midS),
    ...byRarity['SS+'],
    ...byRarity.S.slice(midS),
  ];

  const middleRow = [];
  const maxBA = Math.max(byRarity.B.length, byRarity.A.length);
  for (let i = 0; i < maxBA; i++) {
    if (byRarity.B[i]) middleRow.push(byRarity.B[i]);
    if (byRarity.A[i]) middleRow.push(byRarity.A[i]);
  }

  const bottomRow = [];
  const maxDC = Math.max(byRarity.D.length, byRarity.C.length);
  for (let i = 0; i < maxDC; i++) {
    if (byRarity.D[i]) bottomRow.push(byRarity.D[i]);
    if (byRarity.C[i]) bottomRow.push(byRarity.C[i]);
  }

  const containerStyle = {
    '--gap': `${GAP}px`,
    '--item-w': `calc((100% - ${(ITEMS_PER_ROW - 1) * GAP}px) / ${ITEMS_PER_ROW})`,
  };

  return (
    <div className="w-full" style={containerStyle}>
      {/* ── Верхний ряд ── */}
      <div className="flex w-full" style={{ gap: 'var(--gap)' }}>
        {topRow.map((f, i) => (
          <FigureShelf
            key={f.id}
            figure={f}
            owned={owned[f.id] || 0}
            onClick={() => onSelect?.(f)}
            index={i}
          />
        ))}
      </div>

      {/* ── Средний ряд ── */}
      <div
        className="flex w-full"
        style={{
          gap: 'var(--gap)',
          marginTop: '2%',
          transform: 'translateX(3%)',
        }}
      >
        {middleRow.map((f, i) => (
          <FigureShelf
            key={f.id}
            figure={f}
            owned={owned[f.id] || 0}
            onClick={() => onSelect?.(f)}
            index={i + topRow.length}
          />
        ))}
      </div>

      {/* ── Нижний ряд ── */}
      <div
        className="flex w-full"
        style={{ gap: 'var(--gap)', marginTop: '2%' }}
      >
        {bottomRow.map((f, i) => (
          <FigureShelf
            key={f.id}
            figure={f}
            owned={owned[f.id] || 0}
            onClick={() => onSelect?.(f)}
            index={i + topRow.length + middleRow.length}
          />
        ))}
      </div>
    </div>
  );
}