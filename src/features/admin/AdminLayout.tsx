import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, Navigate } from 'react-router-dom';
import {
  LayoutDashboard, Film, MonitorPlay, CalendarDays,
  Ticket, Users, LogOut, Menu, ChevronRight, Grid3X3, MapPin, ExternalLink,
} from 'lucide-react';
import { useAuthStore } from '../auth/useAuthStore';

const NAV_GROUPS = [
  {
    label: 'Overview',
    items: [
      { to: '/admin', label: 'Dashboard', Icon: LayoutDashboard, exact: true },
    ],
  },
  {
    label: 'Cinema',
    items: [
      { to: '/admin/locations', label: 'Locations',  Icon: MapPin },
      { to: '/admin/movies',    label: 'Movies',     Icon: Film },
      { to: '/admin/halls',     label: 'Halls',      Icon: MonitorPlay },
      { to: '/admin/seats',     label: 'Seat Maps',  Icon: Grid3X3 },
      { to: '/admin/showtimes', label: 'Showtimes',  Icon: CalendarDays },
    ],
  },
  {
    label: 'Operations',
    items: [
      { to: '/admin/bookings', label: 'Bookings', Icon: Ticket },
      { to: '/admin/users',    label: 'Users',    Icon: Users },
    ],
  },
];

const ALL_NAV = NAV_GROUPS.flatMap(g => g.items);

const SidebarContent: React.FC<{
  user: { name: string; email: string; avatarUrl?: string | null };
  loc: { pathname: string };
  onNav: () => void;
  onLogout: () => void;
}> = ({ user, loc, onNav, onLogout }) => {
  const isActive = (item: typeof ALL_NAV[0]) =>
    (item as any).exact ? loc.pathname === item.to : loc.pathname.startsWith(item.to);

  const [popoverOpen, setPopoverOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setPopoverOpen(false);
      }
    };
    if (popoverOpen) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [popoverOpen]);

  const initials = user.name.charAt(0).toUpperCase();

  return (
    <div className="flex flex-col h-full bg-white border-r border-gray-200 dark:bg-gray-900 dark:border-gray-800">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-gray-100 dark:border-gray-800">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-[#00a8cc] flex items-center justify-center shrink-0">
            <Film className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="font-logo text-xl font-normal text-gray-900 tracking-tight leading-none dark:text-gray-100">CINEBOOK</span>
        </Link>
        <p className="text-[10px] text-gray-400 font-medium mt-1 ml-[38px]">Admin Panel</p>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 px-3 space-y-5 overflow-y-auto">
        {NAV_GROUPS.map(group => (
          <div key={group.label}>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 px-2 mb-1.5">{group.label}</p>
            <div className="space-y-0.5">
              {group.items.map(item => {
                const active = isActive(item);
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    onClick={onNav}
                    className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] font-medium transition-colors group ${
                      active
                        ? 'bg-[#00a8cc] text-white'
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-100'
                    }`}
                  >
                    <item.Icon className={`w-[15px] h-[15px] shrink-0 ${active ? 'text-white' : 'text-gray-400 group-hover:text-gray-600'}`} />
                    <span className="flex-1">{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* User button - ChatGPT style popover */}
      <div className="relative p-3 border-t border-gray-100 dark:border-gray-800" ref={popoverRef}>
        {/* Popover menu - opens upward */}
        {popoverOpen && (
          <div className="absolute bottom-[72px] left-3 right-3 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden z-50 dark:bg-gray-900 dark:border-gray-800">
            {/* User info header */}
            <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800">
              <p className="text-xs font-semibold text-gray-900 truncate dark:text-gray-100">{user.name}</p>
              <p className="text-[11px] text-gray-400 truncate">{user.email}</p>
            </div>
            {/* Actions */}
            <div className="p-1">
              <Link
                to="/"
                onClick={() => setPopoverOpen(false)}
                className="flex items-center gap-2.5 w-full px-3 py-2 rounded-lg text-[12px] font-medium text-gray-600 hover:bg-gray-100 transition-colors dark:text-gray-400 dark:hover:bg-gray-800"
              >
                <ExternalLink className="w-3.5 h-3.5 text-gray-400" />
                View Site
              </Link>
              <button
                onClick={() => { setPopoverOpen(false); onLogout(); }}
                className="flex items-center gap-2.5 w-full px-3 py-2 rounded-lg text-[12px] font-medium text-rose-600 hover:bg-rose-50 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                Sign Out
              </button>
            </div>
          </div>
        )}

        {/* Trigger button */}
        <button
          onClick={() => setPopoverOpen(p => !p)}
          className={`w-full flex items-center gap-2.5 px-2 py-2 rounded-xl transition-colors ${
            popoverOpen ? 'bg-gray-100 dark:bg-gray-800' : 'hover:bg-gray-100 dark:hover:bg-gray-800'
          }`}
        >
          {user.avatarUrl ? (
            <img src={user.avatarUrl} alt={user.name} className="w-8 h-8 rounded-full object-cover shrink-0" />
          ) : (
            <div className="w-8 h-8 rounded-full bg-[#00a8cc] flex items-center justify-center text-white text-xs font-bold shrink-0">
              {initials}
            </div>
          )}
          <div className="overflow-hidden flex-1 min-w-0 text-left">
            <p className="text-xs font-semibold text-gray-900 truncate leading-tight dark:text-gray-100">{user.name}</p>
            <p className="text-[10px] text-gray-400 truncate">{user.email}</p>
          </div>
          <ChevronRight className={`w-3.5 h-3.5 text-gray-400 shrink-0 transition-transform duration-200 ${popoverOpen ? '-rotate-90' : 'rotate-90'}`} />
        </button>
      </div>
    </div>
  );
};

export const AdminLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, logout } = useAuthStore();
  const loc = useLocation();
  const [open, setOpen] = useState(false);

  if (!user) return <Navigate to="/admin/login" replace />;
  if (user.role !== 'ADMIN') return <Navigate to="/" replace />;

  const activeItem = ALL_NAV.find(item =>
    (item as any).exact ? loc.pathname === item.to : loc.pathname.startsWith(item.to)
  );

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 flex dark:bg-gray-950 dark:text-gray-100">

      {/* Desktop sidebar */}
      <aside className="hidden md:block w-56 shrink-0 fixed inset-y-0 left-0 z-30">
        <SidebarContent user={user} loc={loc} onNav={() => {}} onLogout={logout} />
      </aside>

      {/* Mobile overlay */}
      {open && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-black/30" onClick={() => setOpen(false)} />
          <aside className="absolute left-0 top-0 bottom-0 w-56">
            <SidebarContent user={user} loc={loc} onNav={() => setOpen(false)} onLogout={logout} />
          </aside>
        </div>
      )}

      {/* Main */}
      <div className="flex-1 md:ml-56 flex flex-col min-h-screen">

        {/* Sticky topbar */}
        <header className="sticky top-0 z-20 bg-white border-b border-gray-200 px-5 md:px-7 py-3.5 flex items-center justify-between gap-4 dark:bg-gray-900 dark:border-gray-800">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setOpen(true)}
              className="md:hidden p-1.5 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700"
            >
              <Menu className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-gray-400 font-medium hidden sm:block">Admin</span>
              {activeItem && (
                <>
                  <ChevronRight className="w-3.5 h-3.5 text-gray-300 hidden sm:block" />
                  <span className="font-semibold text-gray-900 flex items-center gap-1.5 dark:text-gray-100">
                    <activeItem.Icon className="w-3.5 h-3.5 text-[#00a8cc]" />
                    {activeItem.label}
                  </span>
                </>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
          </div>
        </header>

        <main className="flex-1 p-5 md:p-7">{children}</main>
      </div>
    </div>
  );
};
