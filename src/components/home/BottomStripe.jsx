// src/components/home/BottomStripe.jsx
import { motion } from 'framer-motion';

export default function BottomStripe() {
  return (
    <motion.div
      initial={{ y: 60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.7, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="fixed bottom-0 left-1/2 z-50 w-[110vw] -translate-x-1/2 pointer-events-none"
      style={{ transform: 'translateX(-50%) rotate(-1.2deg)' }}
    >
      <div className="relative overflow-hidden bg-[linear-gradient(90deg,#FF8A00,#F36B00_50%,#E55C00)] shadow-[0_-12px_36px_-12px_rgba(200,80,0,0.7)]">
        {/* Диагональные полосы как декор */}
        <div
          className="pointer-events-none absolute inset-0 opacity-30"
          style={{
            backgroundImage:
              'repeating-linear-gradient(-55deg, rgba(255,255,255,.25) 0 10px, transparent 10px 22px)',
          }}
        />

        <div className="relative flex items-center justify-center gap-4 py-4 px-6">
          <span className="text-white/60 text-sm select-none">✦</span>
          <p className="font-heading text-[11px] sm:text-[12px] md:text-[13px] font-black uppercase tracking-[0.32em] text-white text-center">
            Открой секретный бокс и узнай, кто окажется внутри
          </p>
          <span className="text-white/60 text-sm select-none">✦</span>
        </div>
      </div>
    </motion.div>
  );
}