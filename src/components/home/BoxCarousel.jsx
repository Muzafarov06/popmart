// src/components/home/BoxCarousel.jsx
import { motion } from 'framer-motion';

const EASE = [0.22, 1, 0.36, 1];

export default function BoxCarousel({ collections, index, onChange, onNext, onPrev }) {
  const count = collections.length;
  const canPrev = index > 0;
  const canNext = index < count - 1;

  return (
    <div className="relative">
      <motion.div
        initial={{ opacity: 0, scale: 0.94 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.9, delay: 0.1, ease: EASE }}
        drag={count > 1 ? 'x' : false}
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.16}
        onDragEnd={(_, info) => {
          if (count < 2) return;
          if (info.offset.x < -55 || info.velocity.x < -450) onNext();
          else if (info.offset.x > 55 || info.velocity.x > 450) onPrev();
        }}
        className={`relative h-[380px] sm:h-[480px] md:h-[580px] select-none ${
          count > 1 ? 'cursor-grab active:cursor-grabbing' : ''
        }`}
      >
        {/* Свечение */}
        <div
          className="pointer-events-none absolute left-1/2 top-[68%]
                     h-52 w-[85%] -translate-x-1/2 -translate-y-1/2
                     rounded-[50%] blur-[80px] sm:blur-[90px]"
          style={{ background: 'rgba(255,140,0,0.45)' }}
        />

        {/* Сцена */}
        <div className="absolute inset-0 flex items-center justify-center
                        [perspective:1500px] [transform-style:preserve-3d]">
          {collections.map((c, i) => {
            const offset = i - index;
            const abs = Math.abs(offset);
            if (abs > 2) return null;
            const isActive = offset === 0;
            const src = c.cover || c.hero_cover || '/box/box-front.png';

            return (
              <motion.div
                key={c.id}
                onClick={() => !isActive && onChange(i)}
                className="absolute inset-0 m-auto h-fit w-fit"
                style={{ zIndex: 20 - abs }}
                animate={{
                  x: `${offset * 58}%`,
                  scale: 1 - abs * 0.18,
                  rotateY: offset * -26,
                  opacity: abs > 1 ? 0 : 1 - abs * 0.35,
                  filter: `blur(${abs * 2.5}px)`,
                }}
                transition={{ duration: 0.7, ease: EASE }}
              >
                <motion.img
                  src={src}
                  alt={c.name}
                  draggable={false}
                  animate={isActive ? { y: [0, -14, 0] } : { y: 0 }}
                  transition={
                    isActive
                      ? { duration: 5, repeat: Infinity, ease: 'easeInOut' }
                      : { duration: 0.4 }
                  }
                  className="pointer-events-none h-auto select-none
                             w-[300px] sm:w-[360px] md:w-[440px] lg:w-[480px]"
                  style={{
                    filter: 'drop-shadow(0 36px 55px rgba(120,60,0,0.4))',
                  }}
                />
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* Стрелки */}
      {count > 1 && (
        <>
          <ArrowButton side="left" disabled={!canPrev} onClick={onPrev} />
          <ArrowButton side="right" disabled={!canNext} onClick={onNext} />
        </>
      )}

      {/* Индикаторы */}
      {count > 1 && (
        <div className="mt-4 flex items-center justify-center gap-2.5">
          {collections.map((c, i) => {
            const isActive = i === index;
            return (
              <button
                key={c.id}
                aria-label={c.name}
                onClick={() => onChange(i)}
                className="group relative p-2 -m-1"
              >
                <span
                  className={`block h-2 rounded-full transition-all duration-500 ease-out ${
                    isActive
                      ? 'w-12 bg-[linear-gradient(90deg,#FFB800,#FF6B00)] shadow-[0_2px_10px_-2px_rgba(255,140,0,0.9)]'
                      : 'w-2 bg-[#E6D5BE] group-hover:bg-[#D5C1A5] group-hover:w-3'
                  }`}
                />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function ArrowButton({ side, disabled, onClick }) {
  const isLeft = side === 'left';
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label={isLeft ? 'Предыдущая коллекция' : 'Следующая коллекция'}
      className={`absolute top-1/2 z-30 -translate-y-1/2
                  flex items-center justify-center rounded-full
                  border border-[#F0E0CC]/60 bg-white/60 text-[#B87400]
                  backdrop-blur-md
                  shadow-[0_10px_24px_-12px_rgba(180,120,0,0.45)]
                  transition-all
                  hover:bg-white/90 hover:scale-105 hover:text-[#FF6B00]
                  active:scale-95
                  disabled:pointer-events-none disabled:opacity-0
                  w-10 h-10 sm:w-12 sm:h-12
                  ${isLeft ? 'left-1 sm:left-0' : 'right-1 sm:right-0'}`}
    >
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ transform: isLeft ? 'none' : 'rotate(180deg)' }}
      >
        <path d="M15 18l-6-6 6-6" />
      </svg>
    </button>
  );
}