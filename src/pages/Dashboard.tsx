import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import Sidebar from '../components/Sidebar';
import DashboardHeader from '../components/DashboardHeader';
import QuickActions from '../components/QuickActions';
import AddJobModal from '../components/AddJobModal';
import type { JobInput } from '../lib/types';

export default function Dashboard() {
  const navigate = useNavigate();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Fetch jobs
  const { data: jobsData } = useQuery({
    queryKey: ['jobs'],
    queryFn: () => api.getJobs({ page: 1, size: 100, archived: false }),
  });

  const jobs = jobsData?.data || [];

  // Calculate stats
  const stats = useMemo(() => {
    const inProgressStatuses = ['Applying', 'Applied', 'Interviewing', 'Negotiating'];
    const offerStatuses = ['Accepted'];
    const rejectedStatuses = ['Not Selected', 'I Withdrew', 'No Response'];

    return {
      total: jobs.length,
      inProgress: jobs.filter((j) => inProgressStatuses.includes(j.status)).length,
      offers: jobs.filter((j) => offerStatuses.includes(j.status)).length,
      rejected: jobs.filter((j) => rejectedStatuses.includes(j.status)).length,
    };
  }, [jobs]);

  // Get recent jobs (last 5)
  const recentJobs = useMemo(() => {
    return [...jobs]
      .sort((a, b) => new Date(b.dateSaved).getTime() - new Date(a.dateSaved).getTime())
      .slice(0, 5);
  }, [jobs]);

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

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      Bookmarked: 'bg-slate-100 text-slate-700',
      Applying: 'bg-blue-100 text-blue-700',
      Applied: 'bg-indigo-100 text-indigo-700',
      Interviewing: 'bg-amber-100 text-amber-700',
      Negotiating: 'bg-purple-100 text-purple-700',
      Accepted: 'bg-emerald-100 text-emerald-700',
      'I Withdrew': 'bg-gray-100 text-gray-500',
      'Not Selected': 'bg-red-100 text-red-700',
      'No Response': 'bg-pink-100 text-pink-700',
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 ml-64 overflow-auto">
        {/* Header */}
        <DashboardHeader stats={stats} />

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Quick Actions */}
          <QuickActions onAddJob={() => setIsAddModalOpen(true)} onExport={handleExport} />

          {/* Recent Applications */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Recent Applications</h2>
              <button
                onClick={() => navigate('/jobs')}
                className="text-sm text-teal-600 hover:text-teal-700 font-medium flex items-center gap-1"
              >
                View all
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>
            </div>

            {recentJobs.length === 0 ? (
              <div className="text-center py-12">
                <svg
                  className="w-16 h-16 text-gray-300 mx-auto mb-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                <p className="text-gray-500 mb-4">No applications yet</p>
                <button
                  onClick={() => setIsAddModalOpen(true)}
                  className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
                >
                  Add Your First Job
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {recentJobs.map((job) => (
                  <div
                    key={job.id}
                    onClick={() => navigate('/jobs')}
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-teal-200 transition-all duration-200 cursor-pointer"
                  >
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-900 truncate">{job.position}</h3>
                      <p className="text-sm text-gray-500 truncate">{job.company}</p>
                    </div>
                    <div className="flex items-center gap-4 ml-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(job.status)}`}
                      >
                        {job.status}
                      </span>
                      <span className="text-sm text-gray-500 whitespace-nowrap">
                        {formatDate(job.dateSaved)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Activity Overview */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Status Breakdown */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Status Breakdown</h2>
              <div className="space-y-3">
                {[
                  {
                    status: 'Bookmarked',
                    count: jobs.filter((j) => j.status === 'Bookmarked').length,
                  },
                  { status: 'Applied', count: jobs.filter((j) => j.status === 'Applied').length },
                  {
                    status: 'Interviewing',
                    count: jobs.filter((j) => j.status === 'Interviewing').length,
                  },
                  { status: 'Accepted', count: jobs.filter((j) => j.status === 'Accepted').length },
                  {
                    status: 'Rejected',
                    count: jobs.filter((j) => ['Not Selected', 'I Withdrew'].includes(j.status))
                      .length,
                  },
                ].map(({ status, count }) => (
                  <div key={status} className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">{status}</span>
                    <div className="flex items-center gap-3">
                      <div className="w-32 h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-teal-500 rounded-full transition-all duration-300"
                          style={{ width: `${stats.total > 0 ? (count / stats.total) * 100 : 0}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium text-gray-900 w-8 text-right">
                        {count}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Tips */}
            <div className="bg-gradient-to-br from-teal-50 to-teal-100 rounded-xl border border-teal-200 p-6">
              <h2 className="text-lg font-semibold text-teal-900 mb-4">💡 Quick Tips</h2>
              <ul className="space-y-3 text-sm text-teal-800">
                <li className="flex items-start gap-2">
                  <span className="text-teal-600 mt-0.5">•</span>
                  <span>Keep your job applications organized with clear status updates</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-teal-600 mt-0.5">•</span>
                  <span>Follow up on applications after 1-2 weeks of no response</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-teal-600 mt-0.5">•</span>
                  <span>Add notes and deadlines to track important information</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-teal-600 mt-0.5">•</span>
                  <span>Export your data regularly to keep a backup</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Add Job Modal */}
      <AddJobModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={async (data: JobInput) => {
          try {
            await api.createJob(data);
            setIsAddModalOpen(false);
          } catch (error) {
            console.error('Failed to create job:', error);
          }
        }}
      />
    </div>
  );
}
