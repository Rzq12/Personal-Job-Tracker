import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../lib/AuthContext';
import { api } from '../lib/api';
import type { Job, JobInput, TableColumn } from '../lib/types';
import { DEFAULT_COLUMNS, PIPELINE_STATUSES } from '../lib/types';
import PipelineStatusBar from '../components/PipelineStatusBar';
import StarRating from '../components/StarRating';
import StatusDropdown from '../components/StatusDropdown';
import ColumnsDropdown from '../components/ColumnsDropdown';
import MenuDropdown from '../components/MenuDropdown';
import GroupByDropdown from '../components/GroupByDropdown';
import JobDetailPanel from '../components/JobDetailPanel';
import AddJobModal from '../components/AddJobModal';
import DeleteConfirmModal from '../components/DeleteConfirmModal';

export default function JobTracker() {
  const queryClient = useQueryClient();
  const { user, logout } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    // Wait for animation
    setTimeout(() => {
      logout();
    }, 300);
  };

  // State
  const [columns, setColumns] = useState<TableColumn[]>(DEFAULT_COLUMNS);
  const [groupBy, setGroupBy] = useState<'None' | 'Status'>('None');
  const [showArchived, setShowArchived] = useState(false);
  const [selectedJobs, setSelectedJobs] = useState<number[]>([]);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<Job | null>(null);
  const [deletingJob, setDeletingJob] = useState<Job | null>(null);
  const [bulkStatusOpen, setBulkStatusOpen] = useState(false);
  const [bulkDeleting, setBulkDeleting] = useState(false);
  const [sortField, setSortField] = useState<string>('dateSaved');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [pipelineFilter, setPipelineFilter] = useState<string | null>(null);

  // Fetch jobs
  const {
    data: jobsData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['jobs', showArchived, sortField, sortOrder],
    queryFn: () =>
      api.getJobs({
        page: 1,
        size: 100,
        archived: showArchived, // true = show archived, false = show non-archived
        sort: `${sortOrder === 'desc' ? '-' : ''}${sortField}`,
      }),
  });

  const jobs = jobsData?.data || [];

  // Calculate pipeline counts
  const pipelineCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    PIPELINE_STATUSES.forEach((status) => {
      counts[status] = jobs.filter((j) => j.status === status && !j.archived).length;
    });
    return counts;
  }, [jobs]);

  // Filter jobs by pipeline status
  const filteredJobs = useMemo(() => {
    if (pipelineFilter) {
      return jobs.filter((j) => j.status === pipelineFilter);
    }
    return jobs;
  }, [jobs, pipelineFilter]);

  // Group jobs by status if needed
  const groupedJobs = useMemo(() => {
    if (groupBy === 'Status') {
      const groups: Record<string, Job[]> = {};
      filteredJobs.forEach((job) => {
        if (!groups[job.status]) {
          groups[job.status] = [];
        }
        groups[job.status].push(job);
      });
      return groups;
    }
    return { 'All Jobs': filteredJobs };
  }, [filteredJobs, groupBy]);

  // Mutations
  const createMutation = useMutation({
    mutationFn: async (data: JobInput) => {
      console.log('Creating job with data:', data);
      return api.createJob(data);
    },
    onSuccess: (result) => {
      console.log('Create job success:', result);
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      setIsAddModalOpen(false);
      setEditingJob(null);
    },
    onError: (error) => {
      console.error('Create job failed:', error);
      alert('Gagal menambahkan job. Silakan coba lagi.');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<JobInput> }) => api.updateJob(id, data),
    onSuccess: (response, variables) => {
      console.log('[Update Success] Response:', response);
      queryClient.invalidateQueries({ queryKey: ['jobs'] });

      // Update selectedJob with the actual data from server response
      if (selectedJob && selectedJob.id === variables.id && response.data) {
        console.log('[Update Success] Updating selectedJob with:', response.data);
        setSelectedJob(response.data);
      }

      setEditingJob(null);
    },
    onError: (error, variables) => {
      console.error('[Update Error] Failed to update job:', error);
      console.error('[Update Error] Variables:', variables);
      alert(`Gagal mengupdate job: ${error instanceof Error ? error.message : 'Unknown error'}`);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      console.log('[Delete] Deleting job with ID:', id);
      return api.deleteJob(id);
    },
    onSuccess: (response, id) => {
      console.log('[Delete Success] Response:', response);
      console.log('[Delete Success] Deleted job ID:', id);
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      setDeletingJob(null);
      setSelectedJob(null);
    },
    onError: (error, id) => {
      console.error('[Delete Error] Failed to delete job:', error);
      console.error('[Delete Error] Job ID:', id);
      alert(`Gagal menghapus job: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setDeletingJob(null);
    },
  });

  // Handlers
  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedJobs(filteredJobs.map((j) => j.id));
    } else {
      setSelectedJobs([]);
    }
  };

  const handleSelectJob = (id: number, checked: boolean) => {
    if (checked) {
      setSelectedJobs([...selectedJobs, id]);
    } else {
      setSelectedJobs(selectedJobs.filter((i) => i !== id));
    }
  };

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

  const handlePipelineClick = (status: string) => {
    if (pipelineFilter === status) {
      setPipelineFilter(null);
    } else {
      setPipelineFilter(status);
    }
  };

  // Bulk action handlers
  const handleBulkStatusChange = async (newStatus: string) => {
    try {
      await Promise.all(
        selectedJobs.map((id) => api.updateJob(id, { status: newStatus as JobInput['status'] }))
      );
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      setSelectedJobs([]);
      setBulkStatusOpen(false);
    } catch (error) {
      console.error('Bulk status update failed:', error);
      alert('Gagal mengubah status. Silakan coba lagi.');
    }
  };

  const handleBulkArchive = async () => {
    try {
      await Promise.all(selectedJobs.map((id) => api.updateJob(id, { archived: true })));
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      setSelectedJobs([]);
    } catch (error) {
      console.error('Bulk archive failed:', error);
      alert('Gagal mengarsip. Silakan coba lagi.');
    }
  };

  const handleBulkUnarchive = async () => {
    try {
      await Promise.all(selectedJobs.map((id) => api.updateJob(id, { archived: false })));
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      setSelectedJobs([]);
    } catch (error) {
      console.error('Bulk unarchive failed:', error);
      alert('Gagal mengembalikan dari arsip. Silakan coba lagi.');
    }
  };

  const handleBulkDelete = async () => {
    if (!confirm(`Apakah Anda yakin ingin menghapus ${selectedJobs.length} job?`)) return;
    setBulkDeleting(true);
    try {
      await Promise.all(selectedJobs.map((id) => api.deleteJob(id)));
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      setSelectedJobs([]);
    } catch (error) {
      console.error('Bulk delete failed:', error);
      alert('Gagal menghapus. Silakan coba lagi.');
    } finally {
      setBulkDeleting(false);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = String(date.getFullYear()).slice(-2);
    return `${day}/${month}/${year}`;
  };

  const formatSalary = (amount: number | null) => {
    if (!amount) return '$0';
    return '$' + amount.toLocaleString();
  };

  const visibleColumns = columns.filter((col) => col.visible);

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">Failed to load jobs</p>
          <button
            onClick={() => queryClient.invalidateQueries({ queryKey: ['jobs'] })}
            className="px-4 py-2 bg-teal-600 text-white rounded-lg"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header with Logout - Responsive */}
      <header className="bg-white border-b border-gray-200 px-4 sm:px-6 py-3 sm:py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-teal-600 rounded-lg flex items-center justify-center">
              <svg
                className="w-5 h-5 sm:w-6 sm:h-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
            </div>
            <div className="min-w-0">
              <h1 className="text-lg sm:text-xl font-bold text-gray-900">Job Tracker</h1>
              <p className="text-xs sm:text-sm text-gray-500 truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-all duration-200 transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
          >
            {isLoggingOut ? (
              <>
                <svg className="animate-spin h-3 w-3 sm:h-4 sm:w-4" fill="none" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                <span className="hidden xs:inline">Logging out...</span>
              </>
            ) : (
              <>
                <svg
                  className="w-3 h-3 sm:w-4 sm:h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                  />
                </svg>
                <span className="hidden xs:inline">Logout</span>
              </>
            )}
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex flex-col lg:flex-row">
        <div
          className={`flex-1 flex flex-col transition-all duration-300 ${selectedJob ? 'lg:mr-96' : ''}`}
        >
          {/* Pipeline Status Bar */}
          <div className="p-3 sm:p-4 lg:p-6 pb-0">
            <PipelineStatusBar
              counts={pipelineCounts}
              onStatusClick={handlePipelineClick}
              activeStatus={pipelineFilter}
            />
          </div>

          {/* Toolbar */}
          <div className="p-3 sm:p-4 lg:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2 sm:gap-4 flex-wrap w-full sm:w-auto">
              {selectedJobs.length > 0 ? (
                <>
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-teal-50 border border-teal-200 rounded-lg">
                    <input
                      type="checkbox"
                      checked={true}
                      onChange={() => setSelectedJobs([])}
                      className="w-4 h-4 text-teal-600 border-gray-300 rounded"
                    />
                    <span className="text-sm font-medium text-teal-700">
                      {selectedJobs.length} selected
                    </span>
                  </div>

                  {/* Bulk Status Button */}
                  <div className="relative">
                    <button
                      onClick={() => setBulkStatusOpen(!bulkStatusOpen)}
                      className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                        />
                      </svg>
                      Status
                    </button>
                    {bulkStatusOpen && (
                      <div className="absolute left-0 z-50 mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg py-1">
                        {[
                          'Bookmarked',
                          'Applying',
                          'Applied',
                          'Interviewing',
                          'Negotiating',
                          'Accepted',
                          'I Withdrew',
                          'Not Selected',
                          'No Response',
                        ].map((status) => (
                          <button
                            key={status}
                            onClick={() => handleBulkStatusChange(status)}
                            className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50"
                          >
                            {status}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Bulk Archive/Unarchive Button */}
                  <button
                    onClick={showArchived ? handleBulkUnarchive : handleBulkArchive}
                    className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"
                      />
                    </svg>
                    {showArchived ? 'Unarchive' : 'Archive'}
                  </button>

                  {/* Bulk Delete Button */}
                  <button
                    onClick={handleBulkDelete}
                    disabled={bulkDeleting}
                    className="px-3 py-1.5 border border-red-300 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 flex items-center gap-2 disabled:opacity-50"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                    Delete
                  </button>
                </>
              ) : (
                <GroupByDropdown value={groupBy} onChange={setGroupBy} />
              )}
            </div>

            <div className="flex items-center gap-2 flex-wrap w-full sm:w-auto justify-end">
              <ColumnsDropdown columns={columns} onChange={setColumns} />
              <MenuDropdown
                onExportReport={handleExport}
                onDownloadData={handleExport}
                onToggleArchived={() => setShowArchived(!showArchived)}
                showArchived={showArchived}
              />
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="px-3 sm:px-4 py-2 bg-teal-600 text-white rounded-lg text-xs sm:text-sm font-medium hover:bg-teal-700 flex items-center gap-2 whitespace-nowrap"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                <span className="hidden xs:inline">Add a New Job</span>
                <span className="xs:hidden">Add Job</span>
              </button>
            </div>
          </div>

          {/* Table - Responsive with horizontal scroll on mobile */}
          <div className="flex-1 px-3 sm:px-4 lg:px-6 pb-3 sm:pb-4 lg:pb-6 overflow-auto">
            {isLoading ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600" />
              </div>
            ) : (
              Object.entries(groupedJobs).map(([group, groupJobs]) => (
                <div key={group} className="mb-4 sm:mb-6">
                  {groupBy === 'Status' && (
                    <h3 className="text-sm font-medium text-gray-500 mb-2 px-2">
                      {group} ({groupJobs.length})
                    </h3>
                  )}
                  <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full min-w-[640px]">
                        <thead>
                          <tr className="bg-gray-50 border-b border-gray-200">
                            {visibleColumns.map((col) => (
                              <th
                                key={col.key}
                                className={`px-3 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${col.sortable ? 'cursor-pointer hover:bg-gray-100' : ''}`}
                                style={{ width: col.width }}
                                onClick={() =>
                                  col.sortable &&
                                  col.key !== 'select' &&
                                  handleSort(col.key as string)
                                }
                              >
                                {col.key === 'select' ? (
                                  <input
                                    type="checkbox"
                                    checked={
                                      selectedJobs.length === groupJobs.length &&
                                      groupJobs.length > 0
                                    }
                                    onChange={(e) => handleSelectAll(e.target.checked)}
                                    className="w-4 h-4 text-teal-600 border-gray-300 rounded"
                                  />
                                ) : (
                                  <div className="flex items-center gap-1">
                                    {col.label}
                                    {sortField === col.key && (
                                      <svg
                                        className="w-4 h-4"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                      >
                                        <path
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          strokeWidth={2}
                                          d={
                                            sortOrder === 'asc' ? 'M5 15l7-7 7 7' : 'M19 9l-7 7-7-7'
                                          }
                                        />
                                      </svg>
                                    )}
                                  </div>
                                )}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {groupJobs.map((job) => (
                            <tr
                              key={job.id}
                              className={`hover:bg-gray-50 cursor-pointer ${selectedJob?.id === job.id ? 'bg-teal-50' : ''}`}
                              onClick={() =>
                                setSelectedJob(selectedJob?.id === job.id ? null : job)
                              }
                            >
                              {visibleColumns.map((col) => (
                                <td
                                  key={col.key}
                                  className="px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm"
                                >
                                  {col.key === 'select' && (
                                    <input
                                      type="checkbox"
                                      checked={selectedJobs.includes(job.id)}
                                      onChange={(e) => {
                                        e.stopPropagation();
                                        handleSelectJob(job.id, e.target.checked);
                                      }}
                                      onClick={(e) => e.stopPropagation()}
                                      className="w-4 h-4 text-teal-600 border-gray-300 rounded"
                                    />
                                  )}
                                  {col.key === 'position' && (
                                    <span className="font-medium text-gray-900">
                                      {job.position}
                                    </span>
                                  )}
                                  {col.key === 'company' && (
                                    <span className="text-gray-700">{job.company}</span>
                                  )}
                                  {col.key === 'minSalary' && formatSalary(job.minSalary)}
                                  {col.key === 'maxSalary' && formatSalary(job.maxSalary)}
                                  {col.key === 'location' && (
                                    <span className="text-gray-600">{job.location || 'N/A'}</span>
                                  )}
                                  {col.key === 'status' && (
                                    <div onClick={(e) => e.stopPropagation()}>
                                      <StatusDropdown
                                        value={job.status}
                                        onChange={(status) =>
                                          updateMutation.mutate({ id: job.id, data: { status } })
                                        }
                                      />
                                    </div>
                                  )}
                                  {col.key === 'dateSaved' && (
                                    <span className="whitespace-nowrap">
                                      {formatDate(job.dateSaved)}
                                    </span>
                                  )}
                                  {col.key === 'deadline' && (
                                    <span className="whitespace-nowrap">
                                      {formatDate(job.deadline)}
                                    </span>
                                  )}
                                  {col.key === 'dateApplied' && (
                                    <span className="whitespace-nowrap">
                                      {formatDate(job.dateApplied)}
                                    </span>
                                  )}
                                  {col.key === 'followUp' && (
                                    <span className="whitespace-nowrap">
                                      {formatDate(job.followUp)}
                                    </span>
                                  )}
                                  {col.key === 'excitement' && (
                                    <div onClick={(e) => e.stopPropagation()}>
                                      <StarRating
                                        rating={job.excitement}
                                        onChange={(rating) =>
                                          updateMutation.mutate({
                                            id: job.id,
                                            data: { excitement: rating },
                                          })
                                        }
                                        size="sm"
                                      />
                                    </div>
                                  )}
                                </td>
                              ))}
                            </tr>
                          ))}
                          {groupJobs.length === 0 && (
                            <tr>
                              <td
                                colSpan={visibleColumns.length}
                                className="px-4 py-12 text-center text-gray-500"
                              >
                                No jobs found. Add your first job!
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Detail Panel - Full screen on mobile, side panel on desktop */}
        {selectedJob && (
          <div className="fixed inset-0 lg:right-0 lg:left-auto lg:w-96 lg:top-[73px] h-full z-40 bg-black lg:bg-transparent bg-opacity-50 lg:bg-opacity-0">
            <div className="h-full bg-white lg:shadow-xl">
              <JobDetailPanel
                job={selectedJob}
                onClose={() => setSelectedJob(null)}
                onUpdate={(data) => updateMutation.mutate({ id: selectedJob.id, data })}
                onDelete={() => setDeletingJob(selectedJob)}
              />
            </div>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      <AddJobModal
        isOpen={isAddModalOpen || !!editingJob}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingJob(null);
        }}
        onSubmit={(data) => {
          if (editingJob) {
            updateMutation.mutate({ id: editingJob.id, data });
          } else {
            createMutation.mutate(data);
          }
        }}
        initialData={editingJob || undefined}
      />

      {/* Delete Modal */}
      {deletingJob && (
        <DeleteConfirmModal
          job={deletingJob}
          isDeleting={deleteMutation.isPending}
          onConfirm={() => deleteMutation.mutate(deletingJob.id)}
          onCancel={() => setDeletingJob(null)}
        />
      )}
    </div>
  );
}
