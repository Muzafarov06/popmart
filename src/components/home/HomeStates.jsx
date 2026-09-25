// src/components/home/HomeStates.jsx
import { motion } from 'framer-motion';

export function HomeLoading() {
  return (
    <div className="min-h-screen bg-[#FFF6EA] flex flex-col items-center justify-center px-6">
      <div className="flex items-center gap-3 mb-8">
        <span className="w-2 h-2 rounded-full bg-[#FFB800] animate-pulse" />
        <span className="font-heading font-black tracking-[0.3em] text-[11px] uppercase text-[#B87400]">
          Pop Mart
        </span>
      </div>
      <div className="h-1.5 w-40 rounded-full bg-[#F3E6D3] overflow-hidden">
        <motion.div
          animate={{ x: ['-100%', '100%'] }}
          transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
          className="h-full w-1/2 bg-[linear-gradient(90deg,#FFB800,#FF6B00)]"
        />
      </div>
      <p className="mt-4 text-[10px] uppercase tracking-[0.3em] text-zinc-400 font-semibold">
        Загружаем коллекции
      </p>
    </div>
  );
}

export function HomeError({ message }) {
  return (
    <div className="min-h-screen bg-[#FFF6EA] flex flex-col items-center justify-center px-6 text-center">
      <span className="text-5xl">⚠</span>
      <h2 className="mt-4 font-heading font-black text-2xl">Что-то пошло не так</h2>
      <p className="mt-2 text-sm text-zinc-500 max-w-md">{message}</p>
    </div>
  );
}

export function HomeEmpty() {
  return (
    <div className="min-h-screen bg-[#FFF6EA] flex flex-col items-center justify-center px-6 text-center">
      <span className="text-6xl">📦</span>
      <h2 className="mt-6 font-heading font-black text-3xl tracking-tight">
        Коллекций пока нет
      </h2>
      <p className="mt-3 text-sm text-zinc-500 max-w-sm">
        Скоро здесь появятся коробки. Следи за обновлениями!
      </p>
    </div>
  );
}