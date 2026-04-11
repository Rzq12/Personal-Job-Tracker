import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Sidebar from '../components/Sidebar';
import TopBar from '../components/TopBar';
import AddJobModal from '../components/AddJobModal';
import { api } from '../lib/api';
import { useQueryClient } from '@tanstack/react-query';
import type { JobInput } from '../lib/types';

const featureCards = [
  {
    icon: 'bar_chart',
    iconBg: 'rgba(0, 96, 113, 0.08)',
    iconColor: '#006071',
    title: 'Application Trends',
    desc: 'Track your application volume over time with interactive charts',
    eta: 'Coming Q1 2024',
  },
  {
    icon: 'pie_chart',
    iconBg: 'rgba(84, 95, 115, 0.08)',
    iconColor: '#545f73',
    title: 'Success Rate',
    desc: 'Visualize your conversion rate from application to offer',
    eta: 'Coming Q1 2024',
  },
  {
    icon: 'schedule',
    iconBg: 'rgba(0, 94, 128, 0.08)',
    iconColor: '#005e80',
    title: 'Response Time',
    desc: 'Analyze average time between application stages',
    eta: 'Coming Q2 2024',
  },
  {
    icon: 'corporate_fare',
    iconBg: 'rgba(0, 96, 113, 0.08)',
    iconColor: '#006071',
    title: 'Top Companies',
    desc: 'See which companies you\'ve applied to most frequently',
    eta: 'Coming Q2 2024',
  },
  {
    icon: 'psychology',
    iconBg: 'rgba(84, 95, 115, 0.08)',
    iconColor: '#545f73',
    title: 'Skills Analysis',
    desc: 'Identify most requested skills across your applications',
    eta: 'Coming Q3 2024',
  },
  {
    icon: 'summarize',
    iconBg: 'rgba(0, 94, 128, 0.08)',
    iconColor: '#005e80',
    title: 'Monthly Reports',
    desc: 'Get monthly summaries of your job search activity',
    eta: 'Coming Q3 2024',
  },
];

export function Stats() {
  const queryClient = useQueryClient();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const { data: jobsData } = useQuery({
    queryKey: ['jobs'],
    queryFn: () => api.getJobs({ page: 1, size: 100, archived: false }),
  });

  const jobs = jobsData?.data || [];
  const total = jobs.length || 1;

  const statuses = ['Bookmarked', 'Applying', 'Applied', 'Interviewing', 'Negotiating', 'Accepted', 'I Withdrew', 'Not Selected', 'No Response'];
  const statusCounts = statuses.map((s) => ({
    status: s,
    count: jobs.filter((j) => j.status === s).length,
  }));

  const statusColors: Record<string, string> = {
    Bookmarked: '#9ca3af', Applying: '#545f73', Applied: '#006071',
    Interviewing: '#005e80', Negotiating: '#f59e0b', Accepted: '#10b981',
    'I Withdrew': '#9ca3af', 'Not Selected': '#ba1a1a', 'No Response': '#ec4899',
  };

  return (
    <div className="min-h-screen" style={{ background: '#f7f9fb' }}>
      <Sidebar onAddJob={() => setIsAddModalOpen(true)} />

      <div className="sidebar-layout pt-16 md:pt-0">
        <TopBar title="Analytics" />

        <div className="px-8 py-8 max-w-7xl mx-auto space-y-10">
          {/* Quick stats from real data */}
          {jobs.length > 0 && (
            <section className="space-y-6">
              <h3
                className="text-xl font-bold"
                style={{ fontFamily: 'Manrope, sans-serif', color: '#191c1e' }}
              >
                Status Distribution
              </h3>
              <div className="p-6 rounded-2xl shadow-sm" style={{ background: '#ffffff' }}>
                <div className="space-y-4">
                  {statusCounts.filter(s => s.count > 0).map((s) => (
                    <div key={s.status} className="flex items-center gap-4">
                      <div className="w-28 text-sm font-medium truncate" style={{ color: '#545f73' }}>
                        {s.status}
                      </div>
                      <div className="flex-1 h-3 rounded-full overflow-hidden" style={{ background: '#f2f4f6' }}>
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${(s.count / total) * 100}%`,
                            background: statusColors[s.status] || '#9ca3af',
                          }}
                        />
                      </div>
                      <div className="text-sm font-bold w-8 text-right" style={{ color: '#191c1e' }}>
                        {s.count}
                      </div>
                      <div className="text-xs font-medium w-10 text-right" style={{ color: '#6e797c' }}>
                        {Math.round((s.count / total) * 100)}%
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* Hero Coming Soon */}
          <div
            className="relative rounded-2xl overflow-hidden p-12 text-white text-center shadow-sm"
            style={{ background: 'linear-gradient(135deg, #006071 0%, #007b8f 50%, #005e80 100%)' }}
          >
            <div className="absolute inset-0 select-none pointer-events-none flex items-center justify-center" style={{ color: 'rgba(255,255,255,0.05)' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '300px' }}>insights</span>
            </div>
            <div className="relative z-10">
              <span
                className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest inline-block mb-6"
                style={{ background: 'rgba(0,120,163,0.3)', backdropFilter: 'blur(8px)' }}
              >
                Module In Progress
              </span>
              <h2
                className="text-4xl font-extrabold mb-4"
                style={{ fontFamily: 'Manrope, sans-serif' }}
              >
                Advanced Analytics Coming Soon
              </h2>
              <p className="text-lg mb-8 max-w-lg mx-auto opacity-90" style={{ color: '#aaedff' }}>
                Detailed charts, trends, and insights are under development. We're architecting a
                data layer that will transform your job search intelligence.
              </p>
              <div className="flex items-center justify-center gap-2 text-sm font-bold" style={{ color: '#7bd0ff' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>bolt</span>
                More features launching soon!
              </div>
            </div>
          </div>

          {/* Feature Cards */}
          <section className="space-y-6">
            <h3
              className="text-xl font-bold"
              style={{ fontFamily: 'Manrope, sans-serif', color: '#191c1e' }}
            >
              What's Coming
            </h3>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {featureCards.map((card) => (
                <div
                  key={card.title}
                  className="p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow"
                  style={{ background: '#ffffff' }}
                >
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center mb-5"
                    style={{ background: card.iconBg, color: card.iconColor }}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>
                      {card.icon}
                    </span>
                  </div>
                  <h4
                    className="font-bold mb-2"
                    style={{ fontFamily: 'Manrope, sans-serif', color: '#191c1e' }}
                  >
                    {card.title}
                  </h4>
                  <p className="text-sm mb-4 leading-relaxed" style={{ color: '#3e484b' }}>
                    {card.desc}
                  </p>
                  <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#006071' }}>
                    {card.eta}
                  </p>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>

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
