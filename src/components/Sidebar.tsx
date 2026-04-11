import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/AuthContext';

interface SidebarProps {
  onAddJob?: () => void;
}

export default function Sidebar({ onAddJob }: SidebarProps) {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const menuItems = [
    { name: 'Dashboard', path: '/dashboard', icon: 'dashboard' },
    { name: 'Job Tracker', path: '/jobs', icon: 'work_outline' },
    { name: 'Interviews', path: '/interviews', icon: 'event_available' },
    { name: 'Stats', path: '/stats', icon: 'insights' },
    { name: 'Settings', path: '/settings', icon: 'settings' },
  ];

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-6 mb-8 pt-6">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center text-white shadow-lg"
            style={{ background: 'linear-gradient(45deg, #006071, #007b8f)' }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>
              architecture
            </span>
          </div>
          <div>
            <h1
              className="text-lg font-bold leading-tight"
              style={{ fontFamily: 'Manrope, sans-serif', color: '#006071' }}
            >
              Career Blueprint
            </h1>
            <p
              className="text-[10px] uppercase tracking-widest font-bold"
              style={{ color: '#545f73', opacity: 0.7 }}
            >
              Management Suite
            </p>
          </div>
        </div>
      </div>

      {/* Nav Links */}
      <nav className="flex-1 px-4 space-y-1">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            onClick={() => setMobileOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-sm font-medium ${
                isActive
                  ? 'text-[#006071] font-bold border-r-4 border-[#006071] bg-white/50'
                  : 'text-slate-500 hover:text-[#007B8F] hover:bg-[#e0e3e5]'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <span
                  className="material-symbols-outlined"
                  style={{
                    fontSize: '22px',
                    fontVariationSettings: isActive
                      ? "'FILL' 1, 'wght' 400"
                      : "'FILL' 0, 'wght' 400",
                  }}
                >
                  {item.icon}
                </span>
                <span>{item.name}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Add Job Button */}
      <div className="px-4 mt-6">
        <button
          onClick={() => {
            setMobileOpen(false);
            onAddJob?.();
          }}
          className="w-full text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all active:scale-95"
          style={{ background: 'linear-gradient(45deg, #006071, #007b8f)' }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
            add
          </span>
          Add New Job
        </button>
      </div>

      {/* Bottom links */}
      <div className="mt-6 px-4 space-y-1 pb-6">
        <a
          href="#"
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-500 hover:text-[#007B8F] hover:bg-[#e0e3e5] transition-all text-sm font-medium"
        >
          <span className="material-symbols-outlined" style={{ fontSize: '22px' }}>
            help_outline
          </span>
          Help Center
        </a>
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-500 hover:text-[#007B8F] hover:bg-[#e0e3e5] transition-all text-sm font-medium text-left"
        >
          <span className="material-symbols-outlined" style={{ fontSize: '22px' }}>
            logout
          </span>
          Log Out
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className="h-screen w-64 fixed left-0 top-0 flex-col hidden md:flex z-50 shadow-sm"
        style={{ background: '#f2f4f6' }}
      >
        <SidebarContent />
      </aside>

      {/* Mobile Top Bar */}
      <header
        className="fixed inset-x-0 top-0 z-40 border-b md:hidden flex items-center justify-between px-4 h-16"
        style={{ background: '#f7f9fb', borderColor: '#e0e3e5' }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center text-white"
            style={{ background: 'linear-gradient(45deg, #006071, #007b8f)' }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
              architecture
            </span>
          </div>
          <span
            className="text-base font-bold"
            style={{ fontFamily: 'Manrope, sans-serif', color: '#006071' }}
          >
            Career Blueprint
          </span>
        </div>
        <button
          onClick={() => setMobileOpen(true)}
          className="p-2 rounded-xl"
          style={{ background: '#e0e3e5', color: '#3e484b' }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '22px' }}>
            menu
          </span>
        </button>
      </header>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 bg-black/30"
            onClick={() => setMobileOpen(false)}
          />
          <aside
            className="absolute left-0 top-0 h-full w-64 shadow-2xl"
            style={{ background: '#f2f4f6' }}
          >
            <div className="flex items-center justify-end px-4 pt-4">
              <button
                onClick={() => setMobileOpen(false)}
                className="p-2 rounded-xl"
                style={{ color: '#6e797c' }}
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <SidebarContent />
          </aside>
        </div>
      )}
    </>
  );
}
