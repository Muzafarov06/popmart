// src/pages/Profile.jsx
import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useProfile } from '@/hooks/useProfile';
import { useCollections } from '@/hooks/useCollections';
import { useAuth } from '@/context/AuthContext';
import {
  ProfileHero,
  ProfileStats,
  AchievementsGrid,
} from '@/components/profile';
import { CollectionTabs } from '@/components/ui';

const EASE = [0.22, 1, 0.36, 1];

export default function Profile() {
  const { login } = useParams();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [activeCollection, setActiveCollection] = useState(null);

  const { profile, stats, achievements, loading, error } =
    useProfile(login, activeCollection);
  const { collections } = useCollections();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FFF6EA] flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
          className="w-12 h-12 rounded-full border-4 border-[#FFB800]/20 border-t-[#FFB800]"
        />
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-[#FFF6EA] flex items-center justify-center text-center px-6">
        <div>
          <span className="text-5xl">⚠</span>
          <h1 className="mt-4 font-heading font-black text-2xl">Профиль не найден</h1>
          <Link
            to="/"
            className="mt-6 inline-block px-6 py-3 rounded-2xl bg-[#1A1A22] text-white
                       font-heading text-[11px] font-black uppercase tracking-[0.22em]"
          >
            На главную
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-[#FFF6EA] text-[#1A1A22]">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-[10%] h-[900px] w-[900px] -translate-x-1/2 rounded-full
                        bg-[radial-gradient(circle,rgba(255,180,0,0.15)_0%,transparent_65%)]
                        blur-3xl" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-3 sm:px-6 lg:px-10 py-10 md:py-14">

        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: EASE }}
          className="mb-8"
        >
          <Link
            to="/leaderboard"
            className="group inline-flex items-center gap-2
                       text-[10px] uppercase tracking-[0.28em] font-bold
                       text-zinc-500 hover:text-[#1A1A22] transition-colors"
          >
            <span className="text-base transition-transform group-hover:-translate-x-1">←</span>
            К лидерборду
          </Link>
        </motion.div>

        <ProfileHero profile={profile} stats={stats} />

        {/* Переключатель коллекций */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1, ease: EASE }}
          className="mt-6"
        >
          <CollectionTabs
            collections={collections}
            value={activeCollection}
            onChange={setActiveCollection}
          />
        </motion.div>

        <div className="mt-6">
          <ProfileStats stats={stats} />
        </div>

        {/* Достижения — только когда выбрана конкретная коллекция */}
        {activeCollection && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: EASE }}
            className="mt-12"
          >
            <AchievementsGrid achievements={achievements} />
          </motion.div>
        )}

        {/* ─── Выйти — просто текст (мобилка) ─── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2, ease: EASE }}
          className="mt-12 flex justify-center md:hidden"
        >
          <button
            onClick={handleLogout}
            className="text-[10px] uppercase tracking-[0.28em] font-bold
                       text-zinc-500 hover:text-[#B87400]
                       active:opacity-70 transition-colors"
          >
            Выйти
          </button>
        </motion.div>

        <div className="mt-14 flex justify-center">
          <div className="inline-flex items-center gap-3">
            <span className="w-1.5 h-1.5 rounded-full bg-[#E60012]" />
            <span className="text-[9px] uppercase tracking-[0.35em] font-black text-zinc-400">
              Pop Mart
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}