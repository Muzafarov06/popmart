// src/components/ui/CollectionTabs.jsx
import { motion } from 'framer-motion';

const EASE = [0.22, 1, 0.36, 1];

export default function CollectionTabs({ collections = [], value, onChange }) {
  const tabs = [
    { id: null, label: 'Все коллекции' },
    ...collections.map((c) => ({ id: c.id, label: c.name })),
  ];

  // Скрываем, если доступна максимум 1 коллекция
  if (tabs.length <= 2) return null;

  return (
    <div className="inline-flex flex-wrap items-center gap-1.5 p-1.5
                    rounded-2xl bg-white/70 backdrop-blur-sm
                    border border-[#F0E4D2]
                    shadow-[0_8px_24px_-16px_rgba(120,60,0,0.3)]">
      {tabs.map((t) => {
        const active = value === t.id;
        return (
          <button
            key={t.id ?? 'all'}
            type="button"
            onClick={() => onChange(t.id)}
            className={`relative px-4 py-2 rounded-xl
                        font-heading text-[11px] font-black uppercase
                        tracking-[0.16em] transition-colors whitespace-nowrap
                        ${active ? 'text-white' : 'text-zinc-500 hover:text-[#1A1A22]'}`}
          >
            {active && (
              <motion.span
                layoutId="collection-tab-bg"
                transition={{ duration: 0.28, ease: EASE }}
                className="absolute inset-0 rounded-xl bg-[#1A1A22]
                           shadow-[0_8px_18px_-8px_rgba(26,26,34,0.7)]"
              />
            )}
            <span className="relative">{t.label}</span>
          </button>
        );
      })}
    </div>
  );
}