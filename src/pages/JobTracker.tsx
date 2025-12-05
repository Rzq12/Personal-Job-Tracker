import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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

  // State
  const [columns, setColumns] = useState<TableColumn[]>(DEFAULT_COLUMNS);
  const [groupBy, setGroupBy] = useState<'None' | 'Status'>('None');
  const [showArchived, setShowArchived] = useState(false);
  const [selectedJobs, setSelectedJobs] = useState<number[]>([]);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<Job | null>(null);
  const [deletingJob, setDeletingJob] = useState<Job | null>(null);
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
        archived: showArchived ? undefined : false,
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      setSelectedJob(null);
      setEditingJob(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      console.log('Deleting job with ID:', id);
      return api.deleteJob(id);
    },
    onSuccess: () => {
      console.log('Delete successful');
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      setDeletingJob(null);
      setSelectedJob(null);
    },
    onError: (error) => {
      console.error('Delete failed:', error);
      alert('Gagal menghapus job. Silakan coba lagi.');
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

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: 'numeric',
    });
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
    <div className="min-h-screen bg-gray-50 flex">
      {/* Main Content */}
      <div className={`flex-1 flex flex-col ${selectedJob ? 'mr-96' : ''}`}>
        {/* Pipeline Status Bar */}
        <div className="p-6 pb-0">
          <PipelineStatusBar
            counts={pipelineCounts}
            onStatusClick={handlePipelineClick}
            activeStatus={pipelineFilter}
          />
        </div>

        {/* Toolbar */}
        <div className="p-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-500">{selectedJobs.length} selected</span>
            <GroupByDropdown value={groupBy} onChange={setGroupBy} />
          </div>

          <div className="flex items-center gap-2">
            <ColumnsDropdown columns={columns} onChange={setColumns} />
            <MenuDropdown
              onExportReport={handleExport}
              onDownloadData={handleExport}
              onToggleArchived={() => setShowArchived(!showArchived)}
              showArchived={showArchived}
            />
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="px-4 py-2 bg-teal-600 text-white rounded-lg text-sm font-medium hover:bg-teal-700 flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Add a New Job
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="flex-1 px-6 pb-6 overflow-auto">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600" />
            </div>
          ) : (
            Object.entries(groupedJobs).map(([group, groupJobs]) => (
              <div key={group} className="mb-6">
                {groupBy === 'Status' && (
                  <h3 className="text-sm font-medium text-gray-500 mb-2 px-2">
                    {group} ({groupJobs.length})
                  </h3>
                )}
                <div className="bg-white rounded-lg border border-gray-200 overflow-x-auto overflow-y-visible">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-200">
                        {visibleColumns.map((col) => (
                          <th
                            key={col.key}
                            className={`px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${col.sortable ? 'cursor-pointer hover:bg-gray-100' : ''}`}
                            style={{ width: col.width }}
                            onClick={() =>
                              col.sortable && col.key !== 'select' && handleSort(col.key as string)
                            }
                          >
                            {col.key === 'select' ? (
                              <input
                                type="checkbox"
                                checked={
                                  selectedJobs.length === groupJobs.length && groupJobs.length > 0
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
                                      d={sortOrder === 'asc' ? 'M5 15l7-7 7 7' : 'M19 9l-7 7-7-7'}
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
                          onClick={() => setSelectedJob(job)}
                        >
                          {visibleColumns.map((col) => (
                            <td key={col.key} className="px-4 py-3 text-sm">
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
                                <span className="font-medium text-gray-900">{job.position}</span>
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
                              {col.key === 'dateSaved' && formatDate(job.dateSaved)}
                              {col.key === 'deadline' && formatDate(job.deadline)}
                              {col.key === 'dateApplied' && formatDate(job.dateApplied)}
                              {col.key === 'followUp' && formatDate(job.followUp)}
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
            ))
          )}
        </div>
      </div>

      {/* Detail Panel */}
      {selectedJob && (
        <div className="fixed right-0 top-0 h-full">
          <JobDetailPanel
            job={selectedJob}
            onClose={() => setSelectedJob(null)}
            onUpdate={(data) => updateMutation.mutate({ id: selectedJob.id, data })}
            onDelete={() => setDeletingJob(selectedJob)}
          />
        </div>
      )}

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
