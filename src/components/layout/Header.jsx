// src/components/layout/Header.jsx
import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { useOnlineUsers } from '@/hooks/useOnlineUsers';
import { useHeaderData } from '@/hooks/useHeaderData';
import { findUserByLogin, USERS } from '@/data/users';

const EASE = [0.22, 1, 0.36, 1];

/* ═══════════════════ ИКОНКИ ═══════════════════ */

function HomeIcon({ className = 'w-5 h-5' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M3 10.5L12 3l9 7.5" />
      <path d="M5 9.5V20a1 1 0 001 1h4v-6h4v6h4a1 1 0 001-1V9.5" />
    </svg>
  );
}
function GridIcon({ className = 'w-5 h-5' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" />
    </svg>
  );
}
function TrophyIcon({ className = 'w-5 h-5' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M8 21h8M12 17v4" />
      <path d="M7 4h10v5a5 5 0 01-10 0V4z" />
      <path d="M17 5h2.5a1.5 1.5 0 010 3H17M7 5H4.5a1.5 1.5 0 000 3H7" />
    </svg>
  );
}
function LogoutIcon({ className = 'w-4 h-4' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
      <path d="M16 17l5-5-5-5" />
      <path d="M21 12H9" />
    </svg>
  );
}
function ChevronDownIcon({ className = 'w-3.5 h-3.5' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M6 9l6 6 6-6" />
    </svg>
  );
}
function BellIcon({ className = 'w-5 h-5' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
      <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
    </svg>
  );
}
function BoxIcon({ className = 'w-5 h-5' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M21 8v10a2 2 0 01-2 2H5a2 2 0 01-2-2V8" />
      <path d="M2 8l3-4h14l3 4" />
      <path d="M2 8h20" />
      <path d="M12 22V8" />
    </svg>
  );
}
function MenuIcon({ className = 'w-6 h-6' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M3 6h18M3 12h18M3 18h18" />
    </svg>
  );
}
function CloseIcon({ className = 'w-5 h-5' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  );
}
function UserIcon({ className = 'w-4 h-4' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21a8 8 0 0116 0" />
    </svg>
  );
}

/* ═══════════════════ НАВИГАЦИЯ ═══════════════════ */

const NAV = [
  { to: '/',            label: 'Главная',   Icon: HomeIcon  },
  { to: '/collections', label: 'Коллекции', Icon: GridIcon  },
  { to: '/leaderboard', label: 'Лидеры',    Icon: TrophyIcon },
];

/* ═══════════════════ АВАТАРКА ═══════════════════ */

function UserAvatar({ user, myLogin, size = 'md' }) {
  const dim = size === 'sm' ? 'w-10 h-10 text-[18px]' : 'w-8 h-8 text-[14px]';
  const dot = size === 'sm' ? 'w-3 h-3' : 'w-2.5 h-2.5';
  const isMe = user.login === myLogin;

  return (
    <span
      title={`${user.name}${user.isOnline ? ' · онлайн' : ''}`}
      className={`relative ${dim} rounded-full flex items-center justify-center
                  ring-2 ${isMe ? 'ring-[#FF6B00]' : 'ring-white'}
                  transition-transform hover:scale-110 hover:z-10`}
      style={{ background: `${user.color}2E` }}
    >
      {user.emoji}
      <span
        className={`absolute bottom-0 right-0 ${dot} rounded-full
                    ring-2 ring-white transition-colors
                    ${user.isOnline ? 'bg-[#1E7A44]' : 'bg-zinc-300'}`}
      />
    </span>
  );
}

/* ═══════════════════ ОНЛАЙН-СТЕК ═══════════════════ */

const MAX_VISIBLE = 3;

function OnlineStack({ users, myLogin }) {
  const [expanded, setExpanded] = useState(false);

  const total = users.length;
  const hasOverflow = total > MAX_VISIBLE;
  const visible = hasOverflow ? users.slice(0, MAX_VISIBLE - 1) : users;
  const rest = hasOverflow ? total - visible.length : 0;

  return (
    <div className="relative">
      <div className="flex items-center gap-1.5">
        {visible.map((u) => (
          <UserAvatar key={u.login} user={u} myLogin={myLogin} />
        ))}

        {hasOverflow && (
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            title="Показать всех"
            className={`relative w-8 h-8 rounded-full
                        flex items-center justify-center
                        text-[11px] font-black tabular-nums
                        ring-2 ring-white
                        transition-all
                        ${expanded
                          ? 'bg-[#1A1A22] text-white'
                          : 'bg-[#FFF6EA] text-[#B87400] border border-[#F0E4D2] hover:bg-white'}`}
          >
            +{rest}
          </button>
        )}
      </div>

      <AnimatePresence>
        {expanded && hasOverflow && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setExpanded(false)} />
            <motion.div
              initial={{ opacity: 0, y: -6, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -6, scale: 0.96 }}
              transition={{ duration: 0.18, ease: EASE }}
              className="absolute right-0 top-[calc(100%+10px)] z-50 w-64 p-2 rounded-2xl
                         bg-white border border-[#F0E4D2]
                         shadow-[0_24px_56px_-24px_rgba(120,60,0,0.4)]
                         overflow-hidden"
            >
              <div className="px-2 py-2 flex items-center justify-between">
                <span className="text-[9px] uppercase tracking-[0.28em]
                                 font-black text-zinc-400">
                  Игроки
                </span>
                <span className="text-[9px] uppercase tracking-[0.24em]
                                 font-black text-[#1E7A44]">
                  {users.filter((u) => u.isOnline).length} онлайн
                </span>
              </div>

              <div className="mt-1 space-y-0.5 max-h-[300px] overflow-y-auto">
                {users.map((u) => (
                  <Link
                    key={u.login}
                    to={`/profile/${u.login}`}
                    onClick={() => setExpanded(false)}
                    className="flex items-center gap-3 px-2 py-2 rounded-xl
                               hover:bg-[#FFF9F0] transition-colors"
                  >
                    <UserAvatar user={u} myLogin={myLogin} />
                    <div className="min-w-0 flex-1">
                      <div className="font-heading font-black text-[13px] text-[#1A1A22] truncate">
                        {u.name}
                        {u.login === myLogin && (
                          <span className="ml-1.5 text-[9px] uppercase tracking-[0.2em]
                                           font-black text-[#B87400]">
                            · ты
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] font-mono text-zinc-400 truncate">
                        @{u.login}
                      </div>
                    </div>
                    <span
                      className={`text-[9px] font-black uppercase tracking-[0.18em]
                                  ${u.isOnline ? 'text-[#1E7A44]' : 'text-zinc-300'}`}
                    >
                      {u.isOnline ? 'online' : 'offline'}
                    </span>
                  </Link>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ═══════════════════ КОМПОНЕНТ ═══════════════════ */

export default function Header() {
  const { user, logout } = useAuth();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const { online, allowed } = useOnlineUsers();
  const { activeCollectionId, newEventsCount, markAsRead } = useHeaderData();

  const meta = findUserByLogin(user?.login);
  const emoji = meta?.emoji || '🐾';
  const userColor = meta?.color || '#FFB800';
  const isAdmin = user?.role === 'admin';

  const visibleUsers = USERS
    .filter((u) => !allowed || allowed.includes(u.login))
    .map((u) => ({
      ...u,
      isOnline: online.includes(u.login),
    }));

  useEffect(() => { setMobileOpen(false); }, [pathname]);
  useEffect(() => {
    if (pathname === '/leaderboard') markAsRead();
  }, [pathname, markAsRead]);
  useEffect(() => {
    if (!mobileOpen) return;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  const showBoxButton = activeCollectionId && !pathname.startsWith('/unbox');
  const handleOpenBox = () => {
    if (activeCollectionId) navigate(`/unbox/${activeCollectionId}`);
    setMobileOpen(false);
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-[#FFF8EE]/85 backdrop-blur-xl border-b border-[#F0E4D2]">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-10 h-16 flex items-center gap-3">

          <Link to="/" className="flex items-center gap-2 group shrink-0">
            <span className="w-2 h-2 rounded-full bg-[#E60012] group-hover:scale-125 transition-transform" />
            <span className="font-heading font-black tracking-[0.28em]
                             text-[11px] sm:text-[12px] uppercase text-[#1A1A22]">
              Pop Mart
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-1 ml-auto">
            {NAV.map((item) => {
              const active = pathname === item.to;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`px-4 py-2 rounded-xl text-[12px] font-semibold uppercase
                              tracking-[0.18em] transition-colors ${
                    active
                      ? 'bg-[#1A1A22] text-white'
                      : 'text-zinc-500 hover:text-[#1A1A22] hover:bg-black/[0.03]'
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="hidden md:flex items-center gap-2 ml-auto md:ml-0">
            {visibleUsers.length > 0 && (
              <div className="hidden lg:block">
                <OnlineStack users={visibleUsers} myLogin={user?.login} />
              </div>
            )}

            {showBoxButton && (
              <button
                onClick={handleOpenBox}
                title="Открыть коробку"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl
                           bg-[linear-gradient(110deg,#FFB800,#FF9500_45%,#FF6B00)]
                           text-white font-heading text-[11px] font-black uppercase
                           tracking-[0.16em]
                           shadow-[0_8px_20px_-10px_rgba(255,140,0,0.9)]
                           hover:shadow-[0_12px_26px_-10px_rgba(255,140,0,1)]
                           transition-shadow"
              >
                <BoxIcon className="w-4 h-4" />
                <span className="hidden lg:inline">Коробка</span>
              </button>
            )}

            <button
              onClick={() => navigate('/leaderboard')}
              title="События"
              className="relative w-9 h-9 rounded-full flex items-center justify-center
                         text-zinc-500 hover:text-[#1A1A22] hover:bg-black/[0.04]
                         transition-colors"
            >
              <BellIcon className="w-[18px] h-[18px]" />
              {newEventsCount > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.3, ease: EASE }}
                  className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1
                             flex items-center justify-center rounded-full
                             bg-[#E60012] text-white
                             text-[9px] font-black tabular-nums ring-2 ring-[#FFF8EE]"
                >
                  {newEventsCount > 9 ? '9+' : newEventsCount}
                </motion.span>
              )}
            </button>

            <div className="relative shrink-0">
              <button
                onClick={() => setOpen((v) => !v)}
                className={`group flex items-center gap-2 pl-1 pr-3 py-1 rounded-full
                            border border-[#F0E4D2] bg-white/60 hover:bg-white
                            transition-colors ${open ? 'bg-white' : ''}`}
              >
                <span className="relative shrink-0">
                  <span
                    aria-hidden
                    className="absolute inset-0 rounded-full blur-[7px] opacity-60"
                    style={{ background: userColor }}
                  />
                  <span
                    className="relative w-8 h-8 rounded-full flex items-center justify-center
                               text-[15px] ring-2 ring-white
                               shadow-[0_4px_10px_-4px_rgba(0,0,0,0.25)]"
                    style={{ background: `${userColor}2E` }}
                  >
                    {emoji}
                  </span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="text-[12px] font-semibold text-[#1A1A22]">
                    {user?.name}
                  </span>
                  <span className={`text-zinc-400 transition-transform duration-200
                                   ${open ? 'rotate-180' : ''}`}>
                    <ChevronDownIcon />
                  </span>
                </span>
              </button>

              <AnimatePresence>
                {open && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
                    <motion.div
                      initial={{ opacity: 0, y: -6, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -6, scale: 0.96 }}
                      transition={{ duration: 0.18, ease: EASE }}
                      className="absolute right-0 top-[calc(100%+10px)] z-50 w-64 p-1.5
                                 rounded-2xl bg-white border border-[#F0E4D2]
                                 shadow-[0_24px_56px_-24px_rgba(120,60,0,0.4)]
                                 overflow-hidden"
                    >
                      <div className="relative px-3.5 py-3.5 border-b border-[#F5EBD8]">
                        <span
                          aria-hidden
                          className="pointer-events-none absolute -top-12 -right-12
                                     w-32 h-32 rounded-full blur-3xl opacity-25"
                          style={{ background: userColor }}
                        />
                        <div className="relative flex items-center gap-3">
                          <span className="relative shrink-0">
                            <span
                              aria-hidden
                              className="absolute inset-0 rounded-full blur-[10px] opacity-55"
                              style={{ background: userColor }}
                            />
                            <span
                              className="relative w-12 h-12 rounded-full flex items-center justify-center
                                         text-[22px] ring-2 ring-white
                                         shadow-[0_6px_14px_-6px_rgba(0,0,0,0.3)]"
                              style={{ background: `${userColor}2E` }}
                            >
                              {emoji}
                            </span>
                          </span>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5">
                              <p className="font-heading font-black text-[14px] text-[#1A1A22] truncate">
                                {user?.name}
                              </p>
                              {isAdmin && (
                                <span className="text-[8px] uppercase tracking-[0.22em]
                                                 font-black px-1.5 py-0.5 rounded-md
                                                 text-[#B87400] bg-[#FFB800]/15">
                                  admin
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-zinc-400 font-mono truncate">
                              @{user?.login}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Профиль */}
                      <Link
                        to={`/profile/${user?.login}`}
                        onClick={() => setOpen(false)}
                        className="w-full mt-1 px-3 py-2.5 rounded-xl flex items-center gap-2.5
                                   text-[12px] font-semibold uppercase tracking-[0.16em]
                                   text-[#1A1A22] hover:bg-[#FFF9F0] transition-colors"
                      >
                        <UserIcon className="w-4 h-4 text-zinc-500" />
                        Профиль
                      </Link>

                      {/* Выход */}
                      <button
                        onClick={async () => { setOpen(false); await logout(); }}
                        className="w-full px-3 py-2.5 rounded-xl flex items-center gap-2.5
                                   text-[12px] font-semibold uppercase tracking-[0.16em]
                                   text-[#B87400] hover:bg-[#FFF4E0] transition-colors"
                      >
                        <LogoutIcon className="w-4 h-4" />
                        Выйти
                      </button>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          </div>

          <div className="flex md:hidden items-center gap-1.5 ml-auto">
            <button
              onClick={() => navigate('/leaderboard')}
              title="События"
              className="relative w-9 h-9 rounded-full flex items-center justify-center
                         text-zinc-500 hover:text-[#1A1A22] transition-colors"
            >
              <BellIcon className="w-[19px] h-[19px]" />
              {newEventsCount > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-0.5 -right-0.5 min-w-[16px] h-[16px] px-1
                             flex items-center justify-center rounded-full
                             bg-[#E60012] text-white text-[8px] font-black tabular-nums
                             ring-2 ring-[#FFF8EE]"
                >
                  {newEventsCount > 9 ? '9+' : newEventsCount}
                </motion.span>
              )}
            </button>

            <button
              onClick={() => setMobileOpen(true)}
              aria-label="Открыть меню"
              className="w-10 h-10 rounded-xl flex items-center justify-center
                         text-[#1A1A22] bg-white/60 border border-[#F0E4D2]
                         hover:bg-white transition-colors"
            >
              <MenuIcon className="w-[22px] h-[22px]" />
            </button>
          </div>
        </div>
      </header>

      {/* МОБИЛЬНОЕ МЕНЮ (DRAWER) */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 z-[60] bg-[#1A1A22]/40 backdrop-blur-sm md:hidden"
            />
            <motion.aside
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ duration: 0.35, ease: EASE }}
              className="fixed top-0 right-0 bottom-0 z-[70] w-[88%] max-w-[380px]
                         bg-[#FFF8EE] border-l border-[#F0E4D2]
                         shadow-[-24px_0_60px_-20px_rgba(120,60,0,0.45)]
                         flex flex-col md:hidden"
            >
              <div className="flex items-center justify-between px-5 py-4
                              border-b border-[#F0E4D2]">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#E60012]" />
                  <span className="font-heading font-black tracking-[0.28em]
                                   text-[11px] uppercase text-[#1A1A22]">
                    Меню
                  </span>
                </div>
                <button
                  onClick={() => setMobileOpen(false)}
                  aria-label="Закрыть"
                  className="w-9 h-9 rounded-xl flex items-center justify-center
                             text-zinc-500 hover:text-[#1A1A22] hover:bg-black/[0.04]
                             transition-colors"
                >
                  <CloseIcon />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto px-5 py-5 space-y-5">
                {/* Профиль — теперь ссылка */}
                <Link
                  to={`/profile/${user?.login}`}
                  onClick={() => setMobileOpen(false)}
                  className="relative block rounded-2xl p-4 overflow-hidden
                             bg-white border border-[#F0E4D2]
                             shadow-[0_12px_28px_-16px_rgba(120,60,0,0.3)]"
                >
                  <span
                    aria-hidden
                    className="pointer-events-none absolute -top-14 -right-14
                               w-36 h-36 rounded-full blur-3xl opacity-25"
                    style={{ background: userColor }}
                  />
                  <div className="relative flex items-center gap-3.5">
                    <span className="relative shrink-0">
                      <span
                        aria-hidden
                        className="absolute inset-0 rounded-full blur-[10px] opacity-55"
                        style={{ background: userColor }}
                      />
                      <span
                        className="relative w-14 h-14 rounded-full flex items-center justify-center
                                   text-[26px] ring-2 ring-white
                                   shadow-[0_6px_16px_-6px_rgba(0,0,0,0.3)]"
                        style={{ background: `${userColor}2E` }}
                      >
                        {emoji}
                      </span>
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <p className="font-heading font-black text-[16px] text-[#1A1A22] truncate">
                          {user?.name}
                        </p>
                        {isAdmin && (
                          <span className="text-[8px] uppercase tracking-[0.22em]
                                           font-black px-1.5 py-0.5 rounded-md
                                           text-[#B87400] bg-[#FFB800]/15">
                            admin
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-zinc-400 font-mono truncate mt-0.5">
                        @{user?.login}
                      </p>
                    </div>
                    <span className="text-zinc-300 text-[16px]">→</span>
                  </div>
                </Link>

                {showBoxButton && (
                  <button
                    onClick={handleOpenBox}
                    className="w-full inline-flex items-center justify-center gap-2.5
                               px-5 py-4 rounded-2xl
                               bg-[linear-gradient(110deg,#FFB800,#FF9500_45%,#FF6B00)]
                               text-white font-heading text-[12px] font-black uppercase
                               tracking-[0.22em]
                               shadow-[0_18px_36px_-12px_rgba(255,140,0,0.9)]"
                  >
                    <BoxIcon className="w-4 h-4" />
                    Открыть коробку
                  </button>
                )}

                <div>
                  <div className="text-[9px] uppercase tracking-[0.3em]
                                  font-black text-zinc-400 mb-2.5 px-1">
                    Навигация
                  </div>
                  <nav className="rounded-2xl bg-white border border-[#F0E4D2] overflow-hidden">
                    {NAV.map((item, i) => {
                      const active = pathname === item.to;
                      const { Icon } = item;
                      return (
                        <Link
                          key={item.to}
                          to={item.to}
                          onClick={() => setMobileOpen(false)}
                          className={`flex items-center gap-3 px-4 py-3.5 transition-colors
                                      ${i > 0 ? 'border-t border-[#F5EBD8]' : ''}
                                      ${active ? 'bg-[#FFF9F0]' : 'hover:bg-[#FFF9F0]/60'}`}
                        >
                          <span
                            className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                              active
                                ? 'bg-[linear-gradient(135deg,#FFB800,#FF6B00)] text-white'
                                : 'bg-[#FFF6EA] text-zinc-500'
                            }`}
                          >
                            <Icon className="w-[18px] h-[18px]" />
                          </span>
                          <span
                            className={`flex-1 font-heading font-black text-[14px]
                                        ${active ? 'text-[#1A1A22]' : 'text-zinc-600'}`}
                          >
                            {item.label}
                          </span>
                          {active && (
                            <span className="w-1.5 h-1.5 rounded-full bg-[#FF6B00]" />
                          )}
                        </Link>
                      );
                    })}
                  </nav>
                </div>

                {visibleUsers.length > 0 && (
                  <div>
                    <div className="flex items-center justify-between mb-2.5 px-1">
                      <span className="text-[9px] uppercase tracking-[0.3em]
                                       font-black text-zinc-400">
                        Кто сейчас на сайте
                      </span>
                      <span className="text-[9px] uppercase tracking-[0.24em]
                                       font-black text-[#1E7A44]">
                        {online.length} онлайн
                      </span>
                    </div>

                    <div className="rounded-2xl bg-white border border-[#F0E4D2] overflow-hidden">
                      {visibleUsers.map((u, i) => (
                        <Link
                          key={u.login}
                          to={`/profile/${u.login}`}
                          onClick={() => setMobileOpen(false)}
                          className={`flex items-center gap-3 px-4 py-3
                                      ${i > 0 ? 'border-t border-[#F5EBD8]' : ''}
                                      hover:bg-[#FFF9F0] transition-colors`}
                        >
                          <UserAvatar user={u} myLogin={user?.login} size="sm" />

                          <div className="min-w-0 flex-1">
                            <div className="font-heading font-black text-[14px] text-[#1A1A22] truncate">
                              {u.name}
                              {u.login === user?.login && (
                                <span className="ml-1.5 text-[9px] uppercase tracking-[0.2em]
                                                 font-black text-[#B87400]">
                                  · ты
                                </span>
                              )}
                            </div>
                            <div className="text-[10px] font-mono text-zinc-400 truncate">
                              @{u.login}
                            </div>
                          </div>

                          <span
                            className={`text-[9px] font-black uppercase tracking-[0.18em] shrink-0
                                        ${u.isOnline ? 'text-[#1E7A44]' : 'text-zinc-300'}`}
                          >
                            {u.isOnline ? 'online' : 'offline'}
                          </span>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="px-5 py-4 border-t border-[#F0E4D2]">
                <button
                  onClick={async () => {
                    setMobileOpen(false);
                    await logout();
                  }}
                  className="w-full inline-flex items-center justify-center gap-2.5
                             py-3.5 rounded-2xl
                             bg-[linear-gradient(110deg,#FFB800,#FF9500_45%,#FF6B00)]
                             text-white font-heading text-[12px] font-black uppercase
                             tracking-[0.22em]
                             shadow-[0_14px_28px_-12px_rgba(255,140,0,0.85)]
                             hover:shadow-[0_18px_34px_-12px_rgba(255,140,0,1)]
                             transition-shadow"
                >
                  <LogoutIcon className="w-4 h-4" />
                  Выйти
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}