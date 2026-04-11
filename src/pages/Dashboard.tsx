import { useState, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import { useAuth } from '../lib/AuthContext';
import Sidebar from '../components/Sidebar';
import TopBar from '../components/TopBar';
import AddJobModal from '../components/AddJobModal';
import type { JobInput } from '../lib/types';

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  Bookmarked:    { bg: '#e0e3e5', text: '#3e484b' },
  Applying:      { bg: '#d5e0f8', text: '#545f73' },
  Applied:       { bg: '#e3f9ff', text: '#004e5c' },
  Interviewing:  { bg: '#c4e7ff', text: '#004c69' },
  Negotiating:   { bg: '#fef3c7', text: '#92400e' },
  Accepted:      { bg: '#d1fae5', text: '#065f46' },
  'I Withdrew':  { bg: '#f3f4f6', text: '#6b7280' },
  'Not Selected':{ bg: '#ffdad6', text: '#93000a' },
  'No Response': { bg: '#fce7f3', text: '#9d174d' },
};

function formatDate(dateString: string | null) {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  });
}

export default function Dashboard() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const userName = user?.name || user?.email?.split('@')[0] || 'there';
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  const { data: jobsData } = useQuery({
    queryKey: ['jobs'],
    queryFn: () => api.getJobs({ page: 1, size: 100, archived: false }),
  });

  const jobs = jobsData?.data || [];

  const stats = useMemo(() => {
    const inProgressStatuses = ['Applying', 'Applied', 'Interviewing', 'Negotiating'];
    const rejectedStatuses = ['Not Selected', 'I Withdrew', 'No Response'];
    return {
      total: jobs.length,
      inProgress: jobs.filter((j) => inProgressStatuses.includes(j.status)).length,
      offers: jobs.filter((j) => j.status === 'Accepted').length,
      rejected: jobs.filter((j) => rejectedStatuses.includes(j.status)).length,
    };
  }, [jobs]);

  const recentJobs = useMemo(() =>
    [...jobs]
      .sort((a, b) => new Date(b.dateSaved).getTime() - new Date(a.dateSaved).getTime())
      .slice(0, 5),
    [jobs]
  );

  const statusBreakdown = useMemo(() => {
    const rejectedCount = jobs.filter((j) =>
      ['Not Selected', 'I Withdrew', 'No Response'].includes(j.status)
    ).length;
    const activeCount = jobs.filter((j) =>
      ['Applying', 'Applied', 'Interviewing', 'Negotiating'].includes(j.status)
    ).length;
    const total = jobs.length || 1;
    return {
      rejectedPct: Math.round((rejectedCount / total) * 100),
      activePct: Math.round((activeCount / total) * 100),
      offeredPct: Math.round((stats.offers / total) * 100),
    };
  }, [jobs, stats]);

  const handleExport = async () => {
    try {
      const blob = await api.exportJobs({});
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `job-tracker-export-${new Date().toISOString().split('T')[0]}.xlsx`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  const StatCard = ({
    icon, iconBg, label, value, badge, badgeColor,
  }: {
    icon: string; iconBg: string; label: string; value: number;
    badge?: string; badgeColor?: string;
  }) => (
    <div
      className="p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow group cursor-default"
      style={{ background: '#ffffff' }}
    >
      <div className="flex justify-between items-start mb-4">
        <div
          className="p-2 rounded-lg transition-colors"
          style={{ background: iconBg, color: '#006071' }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '22px' }}>{icon}</span>
        </div>
        {badge && (
          <span
            className="text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider"
            style={{ background: '#f2f4f6', color: badgeColor || '#6e797c' }}
          >
            {badge}
          </span>
        )}
      </div>
      <p className="text-sm font-medium mb-1" style={{ color: '#6e797c' }}>{label}</p>
      <h3 className="text-3xl font-extrabold" style={{ fontFamily: 'Manrope, sans-serif', color: '#191c1e' }}>
        {value}
      </h3>
    </div>
  );

  return (
    <div className="min-h-screen" style={{ background: '#f7f9fb' }}>
      <Sidebar onAddJob={() => setIsAddModalOpen(true)} />

      <div className="sidebar-layout pt-16 md:pt-0">
        <TopBar />

        <div className="p-8 max-w-7xl mx-auto space-y-8">
          {/* Welcome Header */}
          <section className="flex flex-col gap-1">
            <p className="text-sm font-medium" style={{ color: '#006071' }}>Overview Dashboard</p>
            <h2
              className="text-4xl font-extrabold tracking-tight"
              style={{ fontFamily: 'Manrope, sans-serif', color: '#191c1e' }}
            >
              {greeting}, {userName}!
            </h2>
            <p style={{ color: '#6e797c' }}>
              Your career blueprint is updated and ready for review.
            </p>
          </section>

          {/* Stats Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              icon="description"
              iconBg="rgba(0, 96, 113, 0.08)"
              label="Total Applications"
              value={stats.total}
              badge="Lifetime"
            />
            <StatCard
              icon="pending"
              iconBg="rgba(0, 94, 128, 0.08)"
              label="In Progress"
              value={stats.inProgress}
            />
            <StatCard
              icon="stars"
              iconBg="rgba(84, 95, 115, 0.08)"
              label="Offers"
              value={stats.offers}
            />
            <StatCard
              icon="cancel"
              iconBg="rgba(186, 26, 26, 0.08)"
              label="Rejected"
              value={stats.rejected}
              badge="-5%"
              badgeColor="#ba1a1a"
            />
          </div>

          {/* Main Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Recent Applications (2/3) */}
            <div className="lg:col-span-2 space-y-6">
              <div className="flex items-center justify-between">
                <h3
                  className="text-xl font-bold"
                  style={{ fontFamily: 'Manrope, sans-serif', color: '#191c1e' }}
                >
                  Recent Applications
                </h3>
                <button
                  onClick={() => navigate('/jobs')}
                  className="text-sm font-semibold hover:underline"
                  style={{ color: '#006071' }}
                >
                  View All
                </button>
              </div>

              <div className="rounded-2xl shadow-sm overflow-hidden" style={{ background: '#ffffff' }}>
                {recentJobs.length === 0 ? (
                  <div className="flex flex-col items-center py-16 text-center px-6">
                    <span className="material-symbols-outlined text-5xl mb-4" style={{ color: '#bec8cc' }}>
                      inbox
                    </span>
                    <p className="font-medium mb-1" style={{ color: '#191c1e' }}>No applications yet</p>
                    <p className="text-sm mb-6" style={{ color: '#6e797c' }}>
                      Start by adding your first job application
                    </p>
                    <button
                      onClick={() => setIsAddModalOpen(true)}
                      className="px-6 py-3 rounded-xl text-white font-semibold"
                      style={{ background: 'linear-gradient(45deg, #006071, #007b8f)' }}
                    >
                      Add New Job
                    </button>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead style={{ background: '#f2f4f6' }}>
                        <tr>
                          {['Company', 'Position', 'Date', 'Status'].map((h) => (
                            <th
                              key={h}
                              className="px-6 py-4 text-xs font-bold uppercase tracking-wider"
                              style={{ color: '#6e797c' }}
                            >
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {recentJobs.map((job) => {
                          const sc = STATUS_COLORS[job.status] || { bg: '#e0e3e5', text: '#3e484b' };
                          return (
                            <tr
                              key={job.id}
                              onClick={() => navigate('/jobs')}
                              className="cursor-pointer transition-colors"
                              style={{ borderTop: '1px solid #f2f4f6' }}
                              onMouseEnter={(e) =>
                                (e.currentTarget.style.background = 'rgba(242,244,246,0.5)')
                              }
                              onMouseLeave={(e) =>
                                (e.currentTarget.style.background = 'transparent')
                              }
                            >
                              <td className="px-6 py-5">
                                <div className="flex items-center gap-3">
                                  <div
                                    className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm"
                                    style={{ background: '#e0e3e5', color: '#3e484b' }}
                                  >
                                    {job.company.charAt(0).toUpperCase()}
                                  </div>
                                  <span className="font-semibold" style={{ color: '#191c1e' }}>
                                    {job.company}
                                  </span>
                                </div>
                              </td>
                              <td className="px-6 py-5 text-sm" style={{ color: '#191c1e' }}>
                                {job.position}
                              </td>
                              <td className="px-6 py-5 text-sm" style={{ color: '#6e797c' }}>
                                {formatDate(job.dateSaved)}
                              </td>
                              <td className="px-6 py-5">
                                <span
                                  className="px-3 py-1 text-[11px] font-extrabold rounded-full uppercase"
                                  style={{ background: sc.bg, color: sc.text }}
                                >
                                  {job.status}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>

            {/* Right Sidebar: Quick Actions + Status Breakdown */}
            <div className="space-y-8">
              {/* Quick Actions */}
              <section className="space-y-4">
                <h3
                  className="text-xl font-bold"
                  style={{ fontFamily: 'Manrope, sans-serif', color: '#191c1e' }}
                >
                  Quick Actions
                </h3>
                <div className="grid grid-cols-1 gap-4">
                  <button
                    onClick={() => setIsAddModalOpen(true)}
                    className="flex items-center gap-4 p-4 rounded-xl shadow-sm text-left transition-all"
                    style={{ background: '#ffffff', border: 'none' }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = '#f2f4f6')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = '#ffffff')}
                  >
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-lg"
                      style={{ background: 'linear-gradient(45deg, #006071, #007b8f)' }}
                    >
                      <span className="material-symbols-outlined">add_circle</span>
                    </div>
                    <div>
                      <p className="font-bold" style={{ color: '#191c1e' }}>Add New Job</p>
                      <p className="text-xs" style={{ color: '#6e797c' }}>Track a new application</p>
                    </div>
                  </button>

                  <button
                    onClick={handleExport}
                    className="flex items-center gap-4 p-4 rounded-xl shadow-sm text-left transition-all"
                    style={{ background: '#ffffff', border: 'none' }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = '#f2f4f6')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = '#ffffff')}
                  >
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center shadow-sm"
                      style={{ background: '#d5e0f8', color: '#586377' }}
                    >
                      <span className="material-symbols-outlined">ios_share</span>
                    </div>
                    <div>
                      <p className="font-bold" style={{ color: '#191c1e' }}>Export to Excel</p>
                      <p className="text-xs" style={{ color: '#6e797c' }}>Download tracker data</p>
                    </div>
                  </button>
                </div>
              </section>

              {/* Status Breakdown */}
              <section className="space-y-4">
                <h3
                  className="text-xl font-bold"
                  style={{ fontFamily: 'Manrope, sans-serif', color: '#191c1e' }}
                >
                  Status Breakdown
                </h3>
                <div className="p-6 rounded-xl shadow-sm space-y-6" style={{ background: '#ffffff' }}>
                  {[
                    { label: 'Rejections', pct: statusBreakdown.rejectedPct, color: '#ba1a1a' },
                    { label: 'Active Stage', pct: statusBreakdown.activePct, color: '#006071' },
                    { label: 'Offers', pct: statusBreakdown.offeredPct, color: '#065f46' },
                  ].map((item) => (
                    <div key={item.label} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span style={{ color: '#545f73' }}>{item.label}</span>
                        <span className="font-bold" style={{ color: '#191c1e' }}>
                          {item.pct}%
                        </span>
                      </div>
                      <div
                        className="h-2 w-full rounded-full overflow-hidden"
                        style={{ background: '#f2f4f6' }}
                      >
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{ width: `${item.pct}%`, background: item.color }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          </div>

          {/* Quick Tips Section */}
          <section className="space-y-4">
            <h3
              className="text-xl font-bold"
              style={{ fontFamily: 'Manrope, sans-serif', color: '#191c1e' }}
            >
              Architect's Quick Tips
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Large tip card */}
              <div
                className="md:col-span-2 p-8 rounded-xl relative overflow-hidden flex flex-col justify-between"
                style={{
                  background: '#006071',
                  color: '#ffffff',
                  minHeight: '200px',
                }}
              >
                <div className="relative z-10 space-y-2">
                  <h4
                    className="text-2xl font-bold"
                    style={{ fontFamily: 'Manrope, sans-serif' }}
                  >
                    Optimizing your Portfolio
                  </h4>
                  <p style={{ color: '#e3f9ff', maxWidth: '28rem' }}>
                    Data shows that applications with a direct project link have a 40% higher
                    response rate.
                  </p>
                </div>
                <button
                  className="relative z-10 w-fit px-6 py-2 rounded-lg font-bold text-sm transition-colors mt-4"
                  style={{
                    background: 'rgba(255,255,255,0.1)',
                    backdropFilter: 'blur(8px)',
                    color: '#ffffff',
                  }}
                >
                  Read Article
                </button>
                {/* Decorative blobs */}
                <div
                  className="absolute -right-10 -bottom-10 w-48 h-48 rounded-full blur-3xl"
                  style={{ background: 'rgba(255,255,255,0.1)' }}
                />
                <div
                  className="absolute right-10 top-10 select-none pointer-events-none"
                  style={{ color: 'rgba(255,255,255,0.1)' }}
                >
                  <span
                    className="material-symbols-outlined"
                    style={{ fontSize: '120px' }}
                  >
                    lightbulb
                  </span>
                </div>
              </div>
              {/* Daily Goal card */}
              <div
                className="p-6 rounded-xl flex flex-col justify-center items-center text-center space-y-4"
                style={{ background: '#005e80', color: '#ffffff' }}
              >
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center"
                  style={{ background: 'rgba(255,255,255,0.2)' }}
                >
                  <span className="material-symbols-outlined text-3xl">trending_up</span>
                </div>
                <h4 className="font-bold text-lg" style={{ fontFamily: 'Manrope, sans-serif' }}>
                  Daily Goal
                </h4>
                <p className="text-sm" style={{ color: '#c4e7ff' }}>
                  Apply to 3 more positions today to stay on track with your Q4 goals.
                </p>
              </div>
            </div>
          </section>
        </div>
      </div>

      {/* Add Job Modal */}
      <AddJobModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={async (data: JobInput) => {
          try {
            await api.createJob(data);
            queryClient.invalidateQueries({ queryKey: ['jobs'] });
            setIsAddModalOpen(false);
          } catch (error) {
            console.error('Failed to create job:', error);
          }
        }}
      />
    </div>
  );
}
