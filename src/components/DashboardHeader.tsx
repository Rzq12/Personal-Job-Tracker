import { useMemo } from 'react';
import { useAuth } from '../lib/AuthContext';

interface DashboardHeaderProps {
  stats: {
    total: number;
    inProgress: number;
    offers: number;
    rejected: number;
  };
}

export default function DashboardHeader({ stats }: DashboardHeaderProps) {
  const { user } = useAuth();

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  }, []);

  const userName = user?.name || user?.email?.split('@')[0] || 'User';

  const statCards = [
    {
      label: 'Total Applications',
      value: stats.total,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
      ),
      color: 'bg-blue-50 text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      label: 'In Progress',
      value: stats.inProgress,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
      color: 'bg-amber-50 text-amber-600',
      bgColor: 'bg-amber-100',
    },
    {
      label: 'Offers',
      value: stats.offers,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
      color: 'bg-emerald-50 text-emerald-600',
      bgColor: 'bg-emerald-100',
    },
    {
      label: 'Rejected',
      value: stats.rejected,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
      color: 'bg-red-50 text-red-600',
      bgColor: 'bg-red-100',
    },
  ];

  return (
    <div className="border-b border-slate-200 bg-white/90 p-4 backdrop-blur sm:p-6 lg:p-8">
      {/* Greeting */}
      <div className="mb-6">
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-700">
          Weekly Snapshot
        </p>
        <h1 className="text-2xl font-bold leading-tight text-slate-900 sm:text-3xl">
          {greeting}, {userName}! 👋
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-slate-600 sm:text-base">
          Here is a concise summary of your job hunt momentum and where to focus next.
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {statCards.map((stat) => (
          <div
            key={stat.label}
            className="group rounded-2xl border border-slate-200 bg-gradient-to-br from-white to-slate-50 p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  {stat.label}
                </p>
                <p className="mt-2 text-3xl font-bold text-slate-900">{stat.value}</p>
              </div>
              <div className={`${stat.color} rounded-xl p-3 shadow-inner`}>{stat.icon}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
