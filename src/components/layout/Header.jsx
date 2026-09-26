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
function GiftIcon({ className = 'w-5 h-5' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M20 12v10H4V12M2 7h20v5H2zM12 22V7" />
      <path d="M12 7H7.5a2.5 2.5 0 010-5C11 2 12 7 12 7zM12 7h4.5a2.5 2.5 0 000-5C13 2 12 7 12 7z" />
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

/* ═══════════════════ УТИЛИТА ═══════════════════ */

function formatLastSeen(iso, isOnline) {
  if (isOnline) return 'в сети';
  if (!iso) return '';

  const d = new Date(iso);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const day = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const diffDays = Math.round((today - day) / 86400000);

  if (diffDays === 0) {
    return d.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
  }
  if (diffDays === 1) return 'вчера';

  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yyyy = d.getFullYear();
  return `${dd}.${mm}.${yyyy}`;
}

/* ═══════════════════ АВАТАР ═══════════════════ */

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

/* ═══════════════════ ОНЛАЙН-СТЕК (десктоп) ═══════════════════ */

const MAX_VISIBLE = 3;

function OnlineStack({ users, myLogin, lastSeen = {} }) {
  const [expanded, setExpanded] = useState(false);

  const total = users.length;
  const hasOverflow = total > MAX_VISIBLE;
  const visible = hasOverflow ? users.slice(0, MAX_VISIBLE - 1) : users;
  const rest = hasOverflow ? total - visible.length : 0;

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        title="Показать игроков"
        className={`flex items-center gap-1.5 pr-2 pl-1 py-1 rounded-full
                    transition-colors ${
          expanded ? 'bg-white' : 'hover:bg-white/60'
        }`}
      >
        {visible.map((u) => (
          <UserAvatar key={u.login} user={u} myLogin={myLogin} />
        ))}

        {hasOverflow && (
          <span
            className={`w-8 h-8 rounded-full flex items-center justify-center
                        text-[11px] font-black tabular-nums ring-2 ring-white
                        transition-all ${
              expanded
                ? 'bg-[#1A1A22] text-white'
                : 'bg-[#FFF6EA] text-[#B87400] border border-[#F0E4D2]'
            }`}
          >
            +{rest}
          </span>
        )}
      </button>

      <AnimatePresence>
        {expanded && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setExpanded(false)} />
            <motion.div
              initial={{ opacity: 0, y: -6, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -6, scale: 0.96 }}
              transition={{ duration: 0.18, ease: EASE }}
              className="absolute right-0 top-[calc(100%+10px)] z-50 w-72 p-2 rounded-2xl
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

              <div className="mt-1 space-y-0.5 max-h-[300px] overflow-y-auto
                              [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {users.map((u) => {
                  const lastLabel = formatLastSeen(lastSeen[u.login], u.isOnline);
                  return (
                    <Link
                      key={u.login}
                      to={`/profile/${u.login}`}
                      onClick={() => setExpanded(false)}
                      className="flex items-center gap-3 px-2 py-2 rounded-xl
                                 hover:bg-[#FFF9F0] transition-colors"
                    >
                      <UserAvatar user={u} myLogin={myLogin} />
                      <div className="min-w-0 flex-1">
                        <div className="font-heading font-black text-[13px]
                                        text-[#1A1A22] truncate">
                          {u.name}
                          {u.login === myLogin && (
                            <span className="ml-1.5 text-[9px] uppercase
                                             tracking-[0.2em] font-black text-[#B87400]">
                              · ты
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] font-mono text-zinc-400 truncate">
                          @{u.login}
                        </div>
                      </div>
                      <span className={`text-[10px] font-black uppercase
                                        tracking-[0.16em] shrink-0 ${
                        u.isOnline ? 'text-[#1E7A44]' : 'text-zinc-400'
                      }`}>
                        {lastLabel}
                      </span>
                    </Link>
                  );
                })}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ═══════════════════ МОБИЛЬНЫЙ ОНЛАЙН-СТЕК ═══════════════════ */

function MobileOnlineStack({ users, myLogin, lastSeen = {} }) {
  const [expanded, setExpanded] = useState(false);

  if (users.length === 0) return null;

  const onlineCount = users.filter((u) => u.isOnline).length;

  const visible = users.slice(0, 3);
  const rest = users.length - visible.length;

  return (
    <>
      <button
        type="button"
        onClick={() => setExpanded(true)}
        aria-label="Кто онлайн"
        className="relative flex items-center gap-1.5 active:opacity-80
                   transition-opacity"
      >
        <span className="flex items-center gap-1.5">
          {visible.map((u, i) => {
            const isMe = u.login === myLogin;
            const isLast = i === visible.length - 1 && rest === 0;
            // Белая подложка — только вокруг последней (единорога)
            const withBackdrop = isLast;

            return (
              <span
                key={u.login}
                className={`relative rounded-full flex items-center justify-center
                            transition-all ${
                  withBackdrop
                    ? 'w-9 h-9 bg-white/90 shadow-[0_2px_8px_-2px_rgba(120,60,0,0.15)]'
                    : ''
                }`}
              >
                <span
                  className={`relative w-7 h-7 rounded-full flex items-center justify-center
                              text-[13px] ring-2 ${
                    isMe ? 'ring-[#FF6B00]' : 'ring-white'
                  }`}
                  style={{ background: `${u.color}2E` }}
                >
                  {u.emoji}
                  <span
                    className={`absolute bottom-0 right-0 w-2 h-2 rounded-full
                                ring-1 ring-white ${
                      u.isOnline ? 'bg-[#1E7A44]' : 'bg-zinc-300'
                    }`}
                  />
                </span>
              </span>
            );
          })}
        </span>

        {rest > 0 ? (
          <span className="text-[10px] font-black text-[#B87400] tabular-nums leading-none">
            +{rest}
          </span>
        ) : onlineCount > 0 ? (
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#1E7A44] animate-pulse" />
            <span className="text-[10px] font-black text-[#1E7A44] tabular-nums leading-none">
              {onlineCount}
            </span>
          </span>
        ) : null}
      </button>

      <AnimatePresence>
        {expanded && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setExpanded(false)}
              className="fixed inset-0 z-[80] bg-[#1A1A22]/40 backdrop-blur-sm md:hidden"
            />
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.96 }}
              transition={{ duration: 0.25, ease: EASE }}
              className="fixed inset-x-4 top-20 z-[81] md:hidden
                         rounded-3xl bg-white border border-[#F0E4D2]
                         shadow-[0_24px_56px_-20px_rgba(120,60,0,0.4)]
                         overflow-hidden"
            >
              <div className="flex items-center justify-between px-4 py-3
                              border-b border-[#F5EBD8]">
                <span className="text-[10px] uppercase tracking-[0.28em]
                                 font-black text-zinc-400">
                  Игроки
                </span>
                <span className="text-[10px] uppercase tracking-[0.24em]
                                 font-black text-[#1E7A44]">
                  {onlineCount} онлайн
                </span>
              </div>

              <div className="p-1.5 max-h-[70vh] overflow-y-auto
                              [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {users.map((u) => {
                  const lastLabel = formatLastSeen(lastSeen[u.login], u.isOnline);
                  return (
                    <Link
                      key={u.login}
                      to={`/profile/${u.login}`}
                      onClick={() => setExpanded(false)}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-2xl
                                 active:bg-[#FFF9F0] transition-colors"
                    >
                      <UserAvatar user={u} myLogin={myLogin} />
                      <div className="min-w-0 flex-1">
                        <div className="font-heading font-black text-[14px]
                                        text-[#1A1A22] truncate">
                          {u.name}
                          {u.login === myLogin && (
                            <span className="ml-1.5 text-[9px] uppercase
                                             tracking-[0.2em] font-black text-[#B87400]">
                              · ты
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] font-mono text-zinc-400 truncate">
                          @{u.login}
                        </div>
                      </div>
                      <span className={`text-[10px] font-black uppercase
                                        tracking-[0.16em] shrink-0 ${
                        u.isOnline ? 'text-[#1E7A44]' : 'text-zinc-400'
                      }`}>
                        {lastLabel}
                      </span>
                    </Link>
                  );
                })}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

/* ═══════════════════ КОМПОНЕНТ ═══════════════════ */

export default function Header() {
  const { user, logout } = useAuth();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const { online, allowed, lastSeen } = useOnlineUsers();
  const { activeCollectionId, newEventsCount, markAsRead } = useHeaderData();

  const meta = findUserByLogin(user?.login);
  const emoji = meta?.emoji || '🐾';
  const userColor = meta?.color || '#FFB800';
  const isAdmin = user?.role === 'admin';

  const visibleUsers = USERS
    .filter((u) => !allowed || allowed.includes(u.login))
    .map((u) => ({ ...u, isOnline: online.includes(u.login) }));

  useEffect(() => {
    if (pathname === '/leaderboard') markAsRead();
  }, [pathname, markAsRead]);

  const showBoxButton = activeCollectionId && !pathname.startsWith('/unbox');
  const handleOpenBox = () => {
    if (activeCollectionId) navigate(`/unbox/${activeCollectionId}`);
  };

  return (
    <>
      {/* ═══════════════════ ВЕРХНИЙ ХЕДЕР ═══════════════════ */}
      <header className="sticky top-0 z-40 bg-[#FFF8EE]/85 backdrop-blur-xl
                         border-b border-[#F0E4D2]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 h-16
                        flex items-center gap-3">

          {/* ─── Лого: красный квадрат POP MART ─── */}
          <Link to="/" className="group shrink-0">
            <span
              className="inline-flex items-center px-2.5 py-1.5 rounded-md
                         bg-[#E60012]
                         shadow-[0_4px_10px_-4px_rgba(230,0,18,0.5)]
                         transition-transform duration-200 group-hover:scale-[1.03]"
            >
              <span className="text-white font-heading font-black
                               tracking-[0.28em] text-[9px] sm:text-[10px] uppercase">
                Pop Mart
              </span>
            </span>
          </Link>

          {/* Десктоп: навигация по центру */}
          <nav className="hidden md:flex items-center gap-1 mx-auto">
            {NAV.map((item) => {
              const active = pathname === item.to;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`px-4 py-2 rounded-xl text-[12px] font-bold uppercase
                              tracking-[0.18em] transition-colors ${
                    active
                      ? 'bg-[#1A1A22] text-white'
                      : 'text-zinc-500 hover:text-[#1A1A22] hover:bg-black/[0.04]'
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Десктоп: правая часть */}
          <div className="hidden md:flex items-center gap-1.5 shrink-0">
            {visibleUsers.length > 0 && (
              <div className="hidden lg:block">
                <OnlineStack
                  users={visibleUsers}
                  myLogin={user?.login}
                  lastSeen={lastSeen}
                />
              </div>
            )}

            

            {/* Юзер */}
            <div className="relative shrink-0">
              <button
                onClick={() => setOpen((v) => !v)}
                className={`flex items-center gap-2 pl-1 pr-3 py-1 rounded-full
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
                  <span className={`text-zinc-400 transition-transform duration-200 ${
                    open ? 'rotate-180' : ''
                  }`}>
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
                              className="relative w-12 h-12 rounded-full
                                         flex items-center justify-center text-[22px]
                                         ring-2 ring-white
                                         shadow-[0_6px_14px_-6px_rgba(0,0,0,0.3)]"
                              style={{ background: `${userColor}2E` }}
                            >
                              {emoji}
                            </span>
                          </span>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5">
                              <p className="font-heading font-black text-[14px]
                                            text-[#1A1A22] truncate">
                                {user?.name}
                              </p>
                              {isAdmin && (
                                <span className="text-[8px] uppercase
                                                 tracking-[0.22em] font-black
                                                 px-1.5 py-0.5 rounded-md
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

                      <Link
                        to={`/profile/${user?.login}`}
                        onClick={() => setOpen(false)}
                        className="w-full mt-1 px-3 py-2.5 rounded-xl flex
                                   items-center gap-2.5 text-[12px] font-semibold
                                   uppercase tracking-[0.16em] text-[#1A1A22]
                                   hover:bg-[#FFF9F0] transition-colors"
                      >
                        <UserIcon className="w-4 h-4 text-zinc-500" />
                        Профиль
                      </Link>

                      <button
                        onClick={async () => { setOpen(false); await logout(); }}
                        className="w-full px-3 py-2.5 rounded-xl flex items-center
                                   gap-2.5 text-[12px] font-semibold uppercase
                                   tracking-[0.16em] text-[#B87400]
                                   hover:bg-[#FFF4E0] transition-colors"
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

          {/* Мобилка: только онлайн-стек, без колокольчика */}
          <div className="flex md:hidden items-center ml-auto">
            <MobileOnlineStack
              users={visibleUsers}
              myLogin={user?.login}
              lastSeen={lastSeen}
            />
          </div>
        </div>
      </header>

      {/* ═══════════════════ BOTTOM NAV (мобилка) ═══════════════════ */}
      <nav className="fixed bottom-0 inset-x-0 z-40 md:hidden
                      bg-[#FFF8EE]/95 backdrop-blur-xl
                      border-t border-[#F0E4D2]
                      pb-[env(safe-area-inset-bottom)]">
        <div className="grid grid-cols-5 h-14 items-center">

          <BottomNavIcon
            to="/"
            Icon={HomeIcon}
            active={pathname === '/'}
            label="Главная"
          />

          <BottomNavIcon
            to="/collections"
            Icon={GridIcon}
            active={
              pathname.startsWith('/collections') ||
              pathname.startsWith('/collection')
            }
            label="Коллекции"
          />

          <div className="flex justify-center items-center">
            <button
              onClick={handleOpenBox}
              disabled={!activeCollectionId || pathname.startsWith('/unbox')}
              aria-label="Открыть коробку"
              className="text-[#FF9500] active:text-[#FF6B00]
                         disabled:opacity-30 disabled:cursor-not-allowed
                         transition-colors"
            >
              <GiftIcon className="w-[24px] h-[24px]" />
            </button>
          </div>

          <BottomNavIcon
            to="/leaderboard"
            Icon={TrophyIcon}
            active={pathname === '/leaderboard'}
            badge={newEventsCount > 0 ? newEventsCount : null}
            label="Лидеры"
          />

          <Link
            to={`/profile/${user?.login}`}
            aria-label="Профиль"
            className="relative flex items-center justify-center w-full h-full"
          >
            <span className="relative shrink-0">
              <span
                aria-hidden
                className={`absolute inset-0 rounded-full blur-[6px]
                            transition-opacity ${
                  pathname.startsWith('/profile') ? 'opacity-60' : 'opacity-35'
                }`}
                style={{ background: userColor }}
              />
              <span
                className={`relative w-7 h-7 rounded-full flex items-center
                            justify-center text-[15px] transition-all ${
                  pathname.startsWith('/profile')
                    ? 'ring-2 ring-[#FF6B00] scale-105'
                    : 'ring-2 ring-white'
                }`}
                style={{ background: `${userColor}2E` }}
              >
                {emoji}
              </span>
            </span>

            {pathname.startsWith('/profile') && (
              <motion.span
                layoutId="bottom-nav-indicator"
                transition={{ duration: 0.28, ease: EASE }}
                className="absolute top-0 left-1/2 -translate-x-1/2
                           w-6 h-[3px] rounded-b-full
                           bg-[linear-gradient(90deg,#FFB800,#FF6B00)]"
              />
            )}
          </Link>
        </div>
      </nav>
    </>
  );
}

/* ─── Bottom nav icon ─── */
function BottomNavIcon({ to, Icon, active, badge, label }) {
  return (
    <Link
      to={to}
      aria-label={label}
      className="relative flex items-center justify-center
                 w-full h-full transition-colors"
    >
      <span className={`relative transition-colors duration-200 ${
        active ? 'text-[#1A1A22]' : 'text-zinc-400'
      }`}>
        <Icon className="w-[24px] h-[24px]" />

        {badge && (
          <span className="absolute -top-1.5 -right-2 min-w-[14px] h-[14px] px-1
                           flex items-center justify-center rounded-full
                           bg-[#E60012] text-white text-[8px] font-black
                           ring-2 ring-[#FFF8EE]">
            {badge > 9 ? '9+' : badge}
          </span>
        )}
      </span>

      {active && (
        <motion.span
          layoutId="bottom-nav-indicator"
          transition={{ duration: 0.28, ease: EASE }}
          className="absolute top-0 left-1/2 -translate-x-1/2
                     w-6 h-[3px] rounded-b-full
                     bg-[linear-gradient(90deg,#FFB800,#FF6B00)]"
        />
      )}
    </Link>
  );
}