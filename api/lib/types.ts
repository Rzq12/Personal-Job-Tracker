// Shared types for API and frontend
export interface Job {
  id: number;
  appliedDate: string;
  company: string;
  position: string;
  workType: 'WFO' | 'Hybrid' | 'Remote';
  progress: string | null;
  status: 'Waiting' | 'Rejected' | 'Accepted' | 'Interview';
  link: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface JobInput {
  appliedDate: string;
  company: string;
  position: string;
  workType: 'WFO' | 'Hybrid' | 'Remote';
  progress?: string;
  status: 'Waiting' | 'Rejected' | 'Accepted' | 'Interview';
  link?: string;
  notes?: string;
}

export interface ApiResponse<T> {
  data: T;
  meta?: {
    total: number;
    page: number;
    size: number;
    totalPages: number;
  };
}

export interface ApiError {
  error: string;
  message: string;
}

export interface JobsQueryParams {
  page?: number;
  size?: number;
  search?: string;
  status?: string;
  workType?: string;
  fromDate?: string;
  toDate?: string;
  sort?: string;
}

export interface Stats {
  totalApplied: number;
  totalInterview: number;
  totalRejected: number;
  totalAccepted: number;
  totalWaiting: number;
  byWorkType: {
    WFO: number;
    Hybrid: number;
    Remote: number;
  };
  byStatus: {
    Waiting: number;
    Interview: number;
    Rejected: number;
    Accepted: number;
  };
  byMonth: {
    month: string;
    count: number;
  }[];
}

export const WORK_TYPES = ['WFO', 'Hybrid', 'Remote'] as const;
export const STATUSES = ['Waiting', 'Interview', 'Rejected', 'Accepted'] as const;
export const PROGRESS_OPTIONS = [
  'Submitted',
  'Test Passed',
  'Interview Scheduled',
  'Final Round',
] as const;
