// Job Status Options (like Teal)
export const JOB_STATUSES = [
  'Bookmarked',
  'Applying',
  'Applied',
  'Interviewing',
  'Negotiating',
  'Accepted',
  'I Withdrew',
  'Not Selected',
  'No Response',
  'Archived',
] as const;

export type JobStatus = (typeof JOB_STATUSES)[number];

// Pipeline statuses (main workflow)
export const PIPELINE_STATUSES = [
  'Bookmarked',
  'Applying',
  'Applied',
  'Interviewing',
  'Negotiating',
  'Accepted',
] as const;

export type PipelineStatus = (typeof PIPELINE_STATUSES)[number];

// Job interface
export interface Job {
  id: number;
  position: string;
  company: string;
  location: string | null;
  minSalary: number | null;
  maxSalary: number | null;
  status: JobStatus;
  dateSaved: string;
  deadline: string | null;
  dateApplied: string | null;
  followUp: string | null;
  excitement: number;
  jobDescription: string | null;
  keywords: string[];
  link: string | null;
  notes: string | null;
  archived: boolean;
  createdAt: string;
  updatedAt: string;
}

// Create/Update job input
export interface JobInput {
  position: string;
  company: string;
  location?: string | null;
  minSalary?: number | null;
  maxSalary?: number | null;
  status?: JobStatus;
  dateSaved?: string;
  deadline?: string | null;
  dateApplied?: string | null;
  followUp?: string | null;
  excitement?: number;
  jobDescription?: string | null;
  keywords?: string[];
  link?: string | null;
  notes?: string | null;
  archived?: boolean;
}

// API Response types
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
  archived?: boolean;
  sort?: string;
}

export interface Stats {
  total: number;
  byStatus: Record<string, number>;
  byMonth: { month: string; count: number }[];
}

// Table column definition
export interface TableColumn {
  key: keyof Job | 'select';
  label: string;
  visible: boolean;
  sortable: boolean;
  width?: string;
}

// Default visible columns
export const DEFAULT_COLUMNS: TableColumn[] = [
  { key: 'select', label: '', visible: true, sortable: false, width: '40px' },
  { key: 'position', label: 'Job Position', visible: true, sortable: true },
  { key: 'company', label: 'Company', visible: true, sortable: true },
  { key: 'minSalary', label: 'Min. Salary', visible: false, sortable: true },
  { key: 'maxSalary', label: 'Max. Salary', visible: true, sortable: true },
  { key: 'location', label: 'Location', visible: true, sortable: true },
  { key: 'status', label: 'Status', visible: true, sortable: true },
  { key: 'dateSaved', label: 'Date Saved', visible: true, sortable: true },
  { key: 'deadline', label: 'Deadline', visible: true, sortable: true },
  { key: 'dateApplied', label: 'Date Applied', visible: true, sortable: true },
  { key: 'followUp', label: 'Follow up', visible: true, sortable: true },
  { key: 'excitement', label: 'Excitement', visible: true, sortable: true },
];
