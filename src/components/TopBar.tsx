import { useAuth } from '../lib/AuthContext';
import { useNavigate } from 'react-router-dom';

interface TopBarProps {
  title?: string;
}

export default function TopBar({ title }: TopBarProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const userName = user?.name || user?.email?.split('@')[0] || 'User';
  const initial = userName.charAt(0).toUpperCase();

  return (
    <header
      className="sticky top-0 z-40 w-full flex justify-between items-center px-8 py-4"
      style={{ background: '#f7f9fb' }}
    >
      <div className="flex items-center gap-2">
        {title ? (
          <h2
            className="text-2xl font-bold tracking-tight"
            style={{ fontFamily: 'Manrope, sans-serif', color: '#006071' }}
          >
            {title}
          </h2>
        ) : (
          <span
            className="text-2xl font-bold tracking-tight"
            style={{ fontFamily: 'Manrope, sans-serif', color: '#006071' }}
          >
            Digital Architect
          </span>
        )}
      </div>

      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <button
            className="p-2 rounded-full transition-colors"
            style={{ color: '#6e797c' }}
            onMouseEnter={(e) => (e.currentTarget.style.color = '#007B8F')}
            onMouseLeave={(e) => (e.currentTarget.style.color = '#6e797c')}
          >
            <span className="material-symbols-outlined">notifications</span>
          </button>
          <button
            className="p-2 rounded-full transition-colors"
            style={{ color: '#6e797c' }}
            onClick={() => navigate('/settings')}
            onMouseEnter={(e) => (e.currentTarget.style.color = '#007B8F')}
            onMouseLeave={(e) => (e.currentTarget.style.color = '#6e797c')}
          >
            <span className="material-symbols-outlined">settings</span>
          </button>
        </div>

        <div className="h-8 w-px" style={{ background: '#e0e3e5' }} />

        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-sm"
            style={{ background: 'linear-gradient(45deg, #006071, #007b8f)' }}
          >
            {initial}
          </div>
          <span className="font-medium text-sm hidden sm:block" style={{ color: '#191c1e' }}>
            {userName}
          </span>
        </div>
      </div>
    </header>
  );
}
