import { useEffect, useState, useMemo, useRef } from 'react';
import type { DragEvent, TouchEvent } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../lib/AuthContext';
import { api } from '../lib/api';
import type { Job, JobInput, TableColumn } from '../lib/types';
import { DEFAULT_COLUMNS, PIPELINE_STATUSES } from '../lib/types';
import Sidebar from '../components/Sidebar';
import PipelineStatusBar from '../components/PipelineStatusBar';
import StarRating from '../components/StarRating';
import StatusDropdown from '../components/StatusDropdown';
import ColumnsDropdown from '../components/ColumnsDropdown';
import MenuDropdown from '../components/MenuDropdown';
import GroupByDropdown from '../components/GroupByDropdown';
import JobDetailPanel from '../components/JobDetailPanel';
import AddJobModal from '../components/AddJobModal';
import DeleteConfirmModal from '../components/DeleteConfirmModal';

type TrackerTab = 'Jobs' | 'People' | 'Companies';
type ViewMode = 'table' | 'board';

export default function JobTracker() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  const initialTabParam = searchParams.get('tab');
  const initialViewParam = searchParams.get('view');
  const initialGroupParam = searchParams.get('group');
  const initialOrderParam = searchParams.get('order');
  const initialSortParam = searchParams.get('sort');
  const initialStatusParam = searchParams.get('status');
  const initialSearchParam = searchParams.get('q') || '';
  const initialArchivedParam = searchParams.get('archived') === '1';
  const initialJobParam = Number(searchParams.get('job') || '');

  // State
  const [columns, setColumns] = useState<TableColumn[]>(DEFAULT_COLUMNS);
  const [groupBy, setGroupBy] = useState<'None' | 'Status'>(() =>
    initialGroupParam === 'Status' ? 'Status' : 'None'
  );
  const [showArchived, setShowArchived] = useState(initialArchivedParam);
  const [selectedJobs, setSelectedJobs] = useState<number[]>([]);
  const [selectedJobId, setSelectedJobId] = useState<number | null>(
    Number.isFinite(initialJobParam) ? initialJobParam : null
  );
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<Job | null>(null);
  const [deletingJob, setDeletingJob] = useState<Job | null>(null);
  const [bulkStatusOpen, setBulkStatusOpen] = useState(false);
  const [bulkDeleting, setBulkDeleting] = useState(false);
  const [sortField, setSortField] = useState<string>(initialSortParam || 'dateSaved');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>(
    initialOrderParam === 'asc' ? 'asc' : 'desc'
  );
  const [pipelineFilter, setPipelineFilter] = useState<string | null>(initialStatusParam || null);
  const [activeTab, setActiveTab] = useState<TrackerTab>(
    initialTabParam === 'People' || initialTabParam === 'Companies' ? initialTabParam : 'Jobs'
  );
  const [viewMode, setViewMode] = useState<ViewMode>(
    initialViewParam === 'board' ? 'board' : 'table'
  );
  const [searchOpen, setSearchOpen] = useState(Boolean(initialSearchParam));
  const [searchQuery, setSearchQuery] = useState(initialSearchParam);
  const [draggingJobId, setDraggingJobId] = useState<number | null>(null);
  const [dragOverStatus, setDragOverStatus] = useState<string | null>(null);
  const [touchDragging, setTouchDragging] = useState(false);
  const [touchDragJobId, setTouchDragJobId] = useState<number | null>(null);
  const [touchDropStatus, setTouchDropStatus] = useState<string | null>(null);
  const boardColumnRefs = useRef<Record<string, HTMLElement | null>>({});
  const touchStartPoint = useRef<{ x: number; y: number } | null>(null);

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

  const selectedJob = selectedJobId ? jobs.find((job) => job.id === selectedJobId) || null : null;

  useEffect(() => {
    const nextParams = new URLSearchParams();

    if (activeTab !== 'Jobs') nextParams.set('tab', activeTab);
    if (viewMode === 'board') nextParams.set('view', 'board');
    if (groupBy === 'Status') nextParams.set('group', 'Status');
    if (sortField !== 'dateSaved') nextParams.set('sort', sortField);
    if (sortOrder !== 'desc') nextParams.set('order', sortOrder);
    if (pipelineFilter) nextParams.set('status', pipelineFilter);
    if (showArchived) nextParams.set('archived', '1');
    if (searchQuery.trim()) nextParams.set('q', searchQuery.trim());
    if (selectedJobId && activeTab === 'Jobs') nextParams.set('job', String(selectedJobId));

    if (searchParams.toString() !== nextParams.toString()) {
      setSearchParams(nextParams, { replace: true });
    }
  }, [
    activeTab,
    groupBy,
    pipelineFilter,
    searchParams,
    searchQuery,
    selectedJobId,
    setSearchParams,
    showArchived,
    sortField,
    sortOrder,
    viewMode,
  ]);

  // Calculate pipeline counts
  const pipelineCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    PIPELINE_STATUSES.forEach((status) => {
      counts[status] = jobs.filter((j) => j.status === status && !j.archived).length;
    });
    return counts;
  }, [jobs]);

  const matchesSearch = (job: Job) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.trim().toLowerCase();
    return (
      job.position.toLowerCase().includes(q) ||
      job.company.toLowerCase().includes(q) ||
      (job.location || '').toLowerCase().includes(q) ||
      job.status.toLowerCase().includes(q)
    );
  };

  // Filter jobs by search + pipeline status
  const filteredJobs = useMemo(() => {
    return jobs.filter((job) => {
      if (pipelineFilter && job.status !== pipelineFilter) return false;
      return matchesSearch(job);
    });
  }, [jobs, pipelineFilter, searchQuery]);

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

  const jobsByPipeline = useMemo(() => {
    const groups: Record<string, Job[]> = {};
    PIPELINE_STATUSES.forEach((status) => {
      groups[status] = filteredJobs.filter((job) => job.status === status);
    });
    return groups;
  }, [filteredJobs]);

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
    onSuccess: (response) => {
      console.log('[Update Success] Response:', response);
      queryClient.invalidateQueries({ queryKey: ['jobs'] });

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
      setSelectedJobId(null);
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

  const handleBoardDragStart = (job: Job) => (event: DragEvent<HTMLButtonElement>) => {
    setDraggingJobId(job.id);
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('text/plain', String(job.id));
  };

  const handleBoardDragEnd = () => {
    setDraggingJobId(null);
    setDragOverStatus(null);
  };

  const handleBoardDragOver = (status: string) => (event: DragEvent<HTMLElement>) => {
    event.preventDefault();
    if (draggingJobId !== null) {
      event.dataTransfer.dropEffect = 'move';
      setDragOverStatus(status);
    }
  };

  const handleBoardDragLeave = (status: string) => () => {
    setDragOverStatus((current) => (current === status ? null : current));
  };

  const moveJobToStatus = (jobId: number, status: string) => {
    const movedJob = jobs.find((job) => job.id === jobId);
    if (!movedJob || movedJob.status === status) return;
    updateMutation.mutate({ id: movedJob.id, data: { status: status as JobInput['status'] } });
  };

  const resetBoardDragState = () => {
    setDraggingJobId(null);
    setDragOverStatus(null);
    setTouchDragging(false);
    setTouchDragJobId(null);
    setTouchDropStatus(null);
    touchStartPoint.current = null;
  };

  const handleBoardDrop = (status: string) => (event: DragEvent<HTMLElement>) => {
    event.preventDefault();

    const idFromTransfer = Number(event.dataTransfer.getData('text/plain'));
    const movedJobId =
      Number.isFinite(idFromTransfer) && idFromTransfer > 0 ? idFromTransfer : draggingJobId;

    resetBoardDragState();

    if (!movedJobId) return;

    moveJobToStatus(movedJobId, status);
  };

  const handleBoardTouchStart = (job: Job) => (event: TouchEvent<HTMLButtonElement>) => {
    const touch = event.touches[0];
    if (!touch) return;

    touchStartPoint.current = { x: touch.clientX, y: touch.clientY };
    setTouchDragJobId(job.id);
    setDraggingJobId(job.id);
    setTouchDragging(false);
    setTouchDropStatus(null);
  };

  const handleBoardTouchMove = (event: TouchEvent<HTMLButtonElement>) => {
    if (!touchDragJobId) return;
    const touch = event.touches[0];
    if (!touch) return;

    const start = touchStartPoint.current;
    if (start) {
      const movedDistance = Math.hypot(touch.clientX - start.x, touch.clientY - start.y);
      if (!touchDragging && movedDistance > 8) {
        setTouchDragging(true);
      }
    }

    if (event.cancelable) {
      event.preventDefault();
    }

    let hoveredStatus: string | null = null;
    for (const status of PIPELINE_STATUSES) {
      const el = boardColumnRefs.current[status];
      if (!el) continue;
      const rect = el.getBoundingClientRect();
      const isInside =
        touch.clientX >= rect.left &&
        touch.clientX <= rect.right &&
        touch.clientY >= rect.top &&
        touch.clientY <= rect.bottom;

      if (isInside) {
        hoveredStatus = status;
        break;
      }
    }

    setTouchDropStatus(hoveredStatus);
    setDragOverStatus(hoveredStatus);
  };

  const handleBoardTouchEnd = () => {
    if (!touchDragJobId) {
      resetBoardDragState();
      return;
    }

    if (touchDragging && touchDropStatus) {
      moveJobToStatus(touchDragJobId, touchDropStatus);
    }

    resetBoardDragState();
  };

  const handleBoardTouchCancel = () => {
    resetBoardDragState();
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
      setSelectedJobId(null);
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

  const getStatusBadgeStyle = (status: string) => {
    const map: Record<string, string> = {
      Bookmarked: 'bg-slate-100 text-slate-700',
      Applying: 'bg-sky-100 text-sky-700',
      Applied: 'bg-blue-100 text-blue-700',
      Interviewing: 'bg-amber-100 text-amber-700',
      Negotiating: 'bg-fuchsia-100 text-fuchsia-700',
      Accepted: 'bg-emerald-100 text-emerald-700',
      'I Withdrew': 'bg-zinc-200 text-zinc-700',
      'Not Selected': 'bg-rose-100 text-rose-700',
      'No Response': 'bg-violet-100 text-violet-700',
    };
    return map[status] || 'bg-slate-100 text-slate-700';
  };

  const visibleColumns = columns.filter((col) => col.visible);

  const handleJobOpen = (job: Job) => {
    setSelectedJobId(job.id);
  };

  const closeDetailPanel = () => {
    setSelectedJobId(null);
  };

  if (error) {
    return (
      <div className="min-h-screen bg-slate-100/60">
        <Sidebar />
        <div className="flex min-h-screen flex-1 items-center justify-center pt-16 sidebar-layout-shift md:pt-0">
          <div className="text-center">
            <p className="text-red-500 mb-4">Failed to load jobs</p>
            <button
              onClick={() => queryClient.invalidateQueries({ queryKey: ['jobs'] })}
              className="rounded-xl bg-cyan-600 px-4 py-2 font-medium text-white transition hover:bg-cyan-700"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100/60">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex min-h-screen flex-1 flex-col overflow-hidden pt-16 sidebar-layout-shift md:pt-0">
        <header className="sticky top-16 z-20 border-b border-slate-200 bg-white/90 px-4 py-3 backdrop-blur sm:px-6 sm:py-4 md:top-0">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h1 className="text-lg sm:text-xl font-bold text-gray-900">Tracker Workspace</h1>
              <p className="text-xs sm:text-sm text-gray-500">{user?.email}</p>
            </div>

            <div className="hidden md:flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 p-1">
              {(['Jobs', 'People', 'Companies'] as TrackerTab[]).map((tab) => (
                <button
                  key={tab}
                  onClick={() => {
                    setActiveTab(tab);
                    setSelectedJobs([]);
                    setPipelineFilter(null);
                    if (tab !== 'Jobs') {
                      setSelectedJobId(null);
                    }
                  }}
                  className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                    activeTab === tab
                      ? 'bg-white text-teal-700 shadow-sm border border-slate-200'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-3 flex md:hidden items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 p-1">
            {(['Jobs', 'People', 'Companies'] as TrackerTab[]).map((tab) => (
              <button
                key={tab}
                onClick={() => {
                  setActiveTab(tab);
                  setSelectedJobs([]);
                  setPipelineFilter(null);
                  if (tab !== 'Jobs') {
                    setSelectedJobId(null);
                  }
                }}
                className={`flex-1 rounded-lg px-2 py-1.5 text-xs font-semibold transition ${
                  activeTab === tab
                    ? 'bg-white text-teal-700 shadow-sm border border-slate-200'
                    : 'text-slate-600'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </header>

        <div className="flex flex-1 flex-col overflow-auto lg:flex-row">
          <div className="flex-1 flex flex-col transition-all duration-300">
            {activeTab === 'Jobs' &&
              (selectedJob ? (
                <div className="flex-1 p-3 sm:p-4 lg:p-6">
                  <div className="h-full overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                    <JobDetailPanel
                      mode="page"
                      job={selectedJob}
                      onClose={closeDetailPanel}
                      onUpdate={(data) => updateMutation.mutate({ id: selectedJob.id, data })}
                      onDelete={() => setDeletingJob(selectedJob)}
                    />
                  </div>
                </div>
              ) : (
                <>
                  <div className="p-3 pb-0 sm:p-4 sm:pb-0 lg:p-6 lg:pb-0">
                    <PipelineStatusBar
                      counts={pipelineCounts}
                      onStatusClick={handlePipelineClick}
                      activeStatus={pipelineFilter}
                    />
                  </div>

                  <div className="flex flex-col items-start justify-between gap-3 p-3 sm:flex-row sm:items-center sm:p-4 lg:p-6">
                    <div className="flex items-center gap-2 sm:gap-4 flex-wrap w-full sm:w-auto">
                      {searchOpen ? (
                        <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2">
                          <input
                            value={searchQuery}
                            onChange={(event) => setSearchQuery(event.target.value)}
                            placeholder="Filter jobs"
                            className="w-44 bg-transparent text-sm outline-none placeholder:text-slate-400"
                          />
                          <button
                            onClick={() => {
                              setSearchOpen(false);
                              setSearchQuery('');
                            }}
                            className="text-slate-500 hover:text-slate-700"
                            aria-label="Close search"
                          >
                            ✕
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setSearchOpen(true)}
                          className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                        >
                          Search
                        </button>
                      )}

                      {selectedJobs.length > 0 ? (
                        <>
                          <div className="flex items-center gap-2 px-3 py-2 bg-teal-50 border border-teal-200 rounded-xl">
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

                          <div className="relative">
                            <button
                              onClick={() => setBulkStatusOpen(!bulkStatusOpen)}
                              className="px-3 py-2 border border-gray-300 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50"
                            >
                              Change Status
                            </button>
                            {bulkStatusOpen && (
                              <div className="absolute left-0 z-50 mt-1 w-52 bg-white border border-gray-200 rounded-xl shadow-lg py-1">
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

                          <button
                            onClick={showArchived ? handleBulkUnarchive : handleBulkArchive}
                            className="px-3 py-2 border border-gray-300 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50"
                          >
                            {showArchived ? 'Unarchive' : 'Archive'}
                          </button>

                          <button
                            onClick={handleBulkDelete}
                            disabled={bulkDeleting}
                            className="px-3 py-2 border border-red-300 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
                          >
                            Delete
                          </button>
                        </>
                      ) : (
                        <GroupByDropdown value={groupBy} onChange={setGroupBy} />
                      )}
                    </div>

                    <div className="flex items-center gap-2 flex-wrap w-full sm:w-auto justify-end">
                      <div className="flex items-center rounded-lg border border-slate-200 bg-white p-1">
                        <button
                          onClick={() => setViewMode('table')}
                          className={`rounded-md px-2 py-1 text-xs font-semibold ${
                            viewMode === 'table'
                              ? 'bg-teal-600 text-white'
                              : 'text-slate-600 hover:bg-slate-100'
                          }`}
                        >
                          Table
                        </button>
                        <button
                          onClick={() => setViewMode('board')}
                          className={`rounded-md px-2 py-1 text-xs font-semibold ${
                            viewMode === 'board'
                              ? 'bg-teal-600 text-white'
                              : 'text-slate-600 hover:bg-slate-100'
                          }`}
                        >
                          Board
                        </button>
                      </div>

                      {viewMode === 'table' && (
                        <ColumnsDropdown columns={columns} onChange={setColumns} />
                      )}

                      <MenuDropdown
                        onExportReport={handleExport}
                        onDownloadData={handleExport}
                        onToggleArchived={() => setShowArchived(!showArchived)}
                        showArchived={showArchived}
                      />

                      <button
                        onClick={() => setIsAddModalOpen(true)}
                        className="px-3 sm:px-4 py-2 bg-teal-700 text-white rounded-lg text-xs sm:text-sm font-semibold hover:bg-teal-800 flex items-center gap-2 whitespace-nowrap"
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
                            d="M12 4v16m8-8H4"
                          />
                        </svg>
                        <span className="hidden xs:inline">Add Job</span>
                        <span className="xs:hidden">Add</span>
                      </button>
                    </div>
                  </div>

                  <div className="flex-1 px-3 sm:px-4 lg:px-6 pb-3 sm:pb-4 lg:pb-6 overflow-auto">
                    {isLoading ? (
                      <div className="flex items-center justify-center h-64">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600" />
                      </div>
                    ) : viewMode === 'table' ? (
                      Object.entries(groupedJobs).map(([group, groupJobs]) => (
                        <div key={group} className="mb-4 sm:mb-6">
                          {groupBy === 'Status' && (
                            <h3 className="text-sm font-medium text-gray-500 mb-2 px-2">
                              {group} ({groupJobs.length})
                            </h3>
                          )}
                          <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm">
                            <div className="space-y-3 p-3 md:hidden">
                              {groupJobs.map((job) => (
                                <article
                                  key={`card-${job.id}`}
                                  onClick={() => handleJobOpen(job)}
                                  className={`rounded-xl border p-3 transition ${
                                    selectedJobId === job.id
                                      ? 'border-cyan-300 bg-cyan-50/60'
                                      : 'border-slate-200 bg-white hover:border-slate-300'
                                  }`}
                                >
                                  <div className="mb-2 flex items-start justify-between gap-2">
                                    <div className="min-w-0">
                                      <h3 className="truncate text-sm font-semibold text-slate-900">
                                        {job.position}
                                      </h3>
                                      <p className="truncate text-xs text-slate-500">
                                        {job.company}
                                      </p>
                                    </div>
                                    <input
                                      type="checkbox"
                                      checked={selectedJobs.includes(job.id)}
                                      onChange={(e) => {
                                        e.stopPropagation();
                                        handleSelectJob(job.id, e.target.checked);
                                      }}
                                      onClick={(e) => e.stopPropagation()}
                                      className="mt-0.5 h-4 w-4 rounded border-slate-300 text-cyan-600"
                                    />
                                  </div>

                                  <div className="mb-2 flex items-center justify-between gap-2">
                                    <span
                                      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${getStatusBadgeStyle(job.status)}`}
                                    >
                                      {job.status}
                                    </span>
                                    <span className="text-xs text-slate-500">
                                      Saved {formatDate(job.dateSaved)}
                                    </span>
                                  </div>
                                </article>
                              ))}

                              {groupJobs.length === 0 && (
                                <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center">
                                  <p className="text-sm font-medium text-slate-700">
                                    No jobs found
                                  </p>
                                  <p className="mt-1 text-xs text-slate-500">
                                    Try another filter or add your first job.
                                  </p>
                                </div>
                              )}
                            </div>

                            <div className="hidden overflow-x-auto md:block">
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
                                                    sortOrder === 'asc'
                                                      ? 'M5 15l7-7 7 7'
                                                      : 'M19 9l-7 7-7-7'
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
                                      className={`hover:bg-gray-50 cursor-pointer ${selectedJobId === job.id ? 'bg-teal-50' : ''}`}
                                      onClick={() => handleJobOpen(job)}
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
                                            <span className="text-gray-600">
                                              {job.location || 'N/A'}
                                            </span>
                                          )}
                                          {col.key === 'status' && (
                                            <div onClick={(e) => e.stopPropagation()}>
                                              <StatusDropdown
                                                value={job.status}
                                                onChange={(status) =>
                                                  updateMutation.mutate({
                                                    id: job.id,
                                                    data: { status },
                                                  })
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
                    ) : (
                      <div className="rounded-2xl border border-slate-200 bg-white p-3 sm:p-4 shadow-sm overflow-x-auto">
                        <div className="grid grid-flow-col auto-cols-[280px] gap-4 min-w-max">
                          {PIPELINE_STATUSES.map((status) => {
                            const columnJobs = jobsByPipeline[status] || [];
                            return (
                              <section
                                key={status}
                                ref={(el) => {
                                  boardColumnRefs.current[status] = el;
                                }}
                                onDragOver={handleBoardDragOver(status)}
                                onDragLeave={handleBoardDragLeave(status)}
                                onDrop={handleBoardDrop(status)}
                                className={`rounded-xl border p-3 transition ${
                                  dragOverStatus === status
                                    ? 'border-teal-400 bg-teal-50/70 shadow-md'
                                    : 'border-slate-200 bg-slate-50/80'
                                }`}
                              >
                                <div className="mb-3 flex items-center justify-between">
                                  <h3 className="text-sm font-semibold text-slate-800">{status}</h3>
                                  <span className="rounded-full bg-white px-2 py-0.5 text-xs font-semibold text-slate-600 border border-slate-200">
                                    {columnJobs.length}
                                  </span>
                                </div>

                                <div className="space-y-2">
                                  {columnJobs.length > 0 ? (
                                    columnJobs.map((job) => (
                                      <button
                                        key={job.id}
                                        draggable
                                        onDragStart={handleBoardDragStart(job)}
                                        onDragEnd={handleBoardDragEnd}
                                        onTouchStart={handleBoardTouchStart(job)}
                                        onTouchMove={handleBoardTouchMove}
                                        onTouchEnd={handleBoardTouchEnd}
                                        onTouchCancel={handleBoardTouchCancel}
                                        onClick={() => {
                                          if (touchDragging || draggingJobId === job.id) return;
                                          handleJobOpen(job);
                                        }}
                                        className={`w-full rounded-lg border border-slate-200 bg-white p-3 text-left hover:border-teal-300 hover:shadow-sm transition active:cursor-grabbing ${
                                          draggingJobId === job.id
                                            ? 'opacity-60 cursor-grabbing'
                                            : 'cursor-grab'
                                        }`}
                                      >
                                        <p className="text-sm font-semibold text-slate-900 line-clamp-2">
                                          {job.position}
                                        </p>
                                        <p className="mt-1 text-xs text-slate-600 line-clamp-1">
                                          {job.company} · {job.location || 'N/A'}
                                        </p>
                                      </button>
                                    ))
                                  ) : (
                                    <div className="rounded-lg border border-dashed border-slate-300 bg-white px-3 py-6 text-center text-xs text-slate-500">
                                      No jobs
                                    </div>
                                  )}
                                </div>
                              </section>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                </>
              ))}

            {activeTab !== 'Jobs' && (
              <div className="flex-1 p-4 sm:p-6 lg:p-8">
                <div className="mx-auto max-w-2xl rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-slate-500">
                    {activeTab === 'People' ? '👥' : '🏢'}
                  </div>
                  <h2 className="text-xl font-semibold text-slate-900">
                    No {activeTab.toLowerCase()} in your tracker yet
                  </h2>
                  <p className="mt-2 text-sm text-slate-500">
                    Build your workspace like Teal by adding structured data, then use filters,
                    groups, and statuses for better focus.
                  </p>
                  <div className="mt-6 flex flex-wrap justify-center gap-3">
                    <button
                      onClick={() => setIsAddModalOpen(true)}
                      className="rounded-lg bg-teal-700 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-800"
                    >
                      Start with a Job
                    </button>
                    <button
                      onClick={() => setActiveTab('Jobs')}
                      className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                    >
                      Back to Jobs
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
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
