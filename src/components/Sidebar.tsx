import { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../lib/AuthContext';

export default function Sidebar() {
  const { logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [desktopCollapsed, setDesktopCollapsed] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.localStorage.getItem('jt-sidebar-collapsed') === '1';
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem('jt-sidebar-collapsed', desktopCollapsed ? '1' : '0');
    document.documentElement.classList.toggle('sidebar-collapsed', desktopCollapsed);

    return () => {
      document.documentElement.classList.remove('sidebar-collapsed');
    };
  }, [desktopCollapsed]);

  const menuItems = [
    {
      name: 'Dashboard',
      path: '/dashboard',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
          />
        </svg>
      ),
    },
    {
      name: 'Job List',
      path: '/jobs',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
          />
        </svg>
      ),
    },
    {
      name: 'Interviews',
      path: '/interviews',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
      ),
    },
    {
      name: 'Stats',
      path: '/stats',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
          />
        </svg>
      ),
    },
    {
      name: 'Settings',
      path: '/settings',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
          />
        </svg>
      ),
    },
  ];

  const renderNavList = (compact: boolean) => (
    <nav className="flex-1 p-3">
      <div className="space-y-1.5 rounded-2xl border border-slate-200/80 bg-white p-2 shadow-sm">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            onClick={() => setMobileOpen(false)}
            className={({ isActive }) =>
              `flex items-center ${compact ? 'justify-center' : 'gap-3'} rounded-xl ${compact ? 'px-2.5 py-2.5' : 'px-3.5 py-2.5'} text-sm font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-cyan-600 text-white shadow-sm shadow-cyan-600/30'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`
            }
            title={compact ? item.name : undefined}
          >
            {item.icon}
            {!compact && <span>{item.name}</span>}
          </NavLink>
        ))}
      </div>
    </nav>
  );

  const renderLogoutButton = (compact: boolean) => (
    <div className="p-3 pt-0">
      <button
        onClick={logout}
        className={`w-full rounded-xl border border-rose-200 bg-rose-50 ${compact ? 'px-2.5 py-2.5' : 'px-4 py-2.5'} text-sm font-semibold text-rose-700 transition hover:bg-rose-100 ${compact ? 'inline-flex items-center justify-center' : ''}`}
        title={compact ? 'Logout' : undefined}
      >
        {compact ? (
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
            />
          </svg>
        ) : (
          'Logout'
        )}
      </button>
    </div>
  );

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-40 border-b border-slate-200/80 bg-white/90 backdrop-blur md:hidden">
        <div className="flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-600 text-white shadow-md shadow-cyan-600/30">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900">Job Tracker</p>
              <p className="text-xs text-slate-500">Career dashboard</p>
            </div>
          </div>
          <button
            onClick={() => setMobileOpen((prev) => !prev)}
            className="rounded-xl border border-slate-200 bg-white p-2 text-slate-700 shadow-sm"
            aria-label="Open menu"
            aria-expanded={mobileOpen}
            aria-controls="mobile-navigation-drawer"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
        </div>
      </header>

      <aside
        className={`fixed left-0 top-0 z-30 hidden h-screen border-r border-slate-200/80 bg-slate-50/90 backdrop-blur md:flex md:flex-col transition-[width] duration-200 ${desktopCollapsed ? 'w-20' : 'w-72'}`}
      >
        <div className="p-3 pb-2">
          <div
            className={`rounded-2xl bg-gradient-to-br from-cyan-700 to-sky-600 p-3 text-white shadow-lg shadow-cyan-700/30 ${desktopCollapsed ? 'text-center' : ''}`}
          >
            <div className="flex items-center justify-between gap-2">
              <div className={desktopCollapsed ? 'mx-auto' : ''}>
                <p className={`font-semibold ${desktopCollapsed ? 'text-base' : 'text-lg'}`}>JT</p>
                {!desktopCollapsed && (
                  <p className="text-xs text-cyan-100">Track your career with focus</p>
                )}
              </div>

              {!desktopCollapsed && (
                <button
                  onClick={() => setDesktopCollapsed(true)}
                  className="rounded-lg bg-white/15 p-1.5 text-cyan-50 hover:bg-white/25"
                  aria-label="Collapse sidebar"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                </button>
              )}
            </div>

            {desktopCollapsed && (
              <button
                onClick={() => setDesktopCollapsed(false)}
                className="mt-2 inline-flex rounded-lg bg-white/15 p-1.5 text-cyan-50 hover:bg-white/25"
                aria-label="Expand sidebar"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>
            )}
          </div>
        </div>
        {renderNavList(desktopCollapsed)}
        {renderLogoutButton(desktopCollapsed)}
      </aside>

      <div
        className={`fixed inset-0 z-50 md:hidden ${mobileOpen ? 'pointer-events-auto' : 'pointer-events-none'}`}
      >
        <div
          onClick={() => setMobileOpen(false)}
          className={`absolute inset-0 bg-slate-900/35 transition-opacity duration-200 ${mobileOpen ? 'opacity-100' : 'opacity-0'}`}
        />
        <aside
          id="mobile-navigation-drawer"
          className={`absolute left-0 top-0 h-full w-72 bg-slate-50 shadow-2xl transition-transform duration-200 ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}
        >
          <div className="flex items-center justify-between border-b border-slate-200 p-4">
            <div>
              <p className="text-base font-semibold text-slate-900">Navigation</p>
              <p className="text-xs text-slate-500">Quick access menu</p>
            </div>
            <button
              onClick={() => setMobileOpen(false)}
              className="rounded-lg border border-slate-200 bg-white p-2 text-slate-600"
              aria-label="Close menu"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
          {renderNavList(false)}
          {renderLogoutButton(false)}
        </aside>
      </div>
    </>
  );
}
