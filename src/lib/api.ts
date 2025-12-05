import type { Job, JobInput, JobsQueryParams, ApiResponse, Stats } from './types';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    const response = await fetch(url, config);

    if (!response.ok) {
      const error = await response.json().catch(() => ({
        error: 'Request failed',
        message: response.statusText,
      }));
      throw new Error(error.message || 'Request failed');
    }

    return response.json();
  }

  // Jobs endpoints
  async getJobs(params: JobsQueryParams = {}): Promise<ApiResponse<Job[]>> {
    const searchParams = new URLSearchParams();

    if (params.page) searchParams.set('page', params.page.toString());
    if (params.size) searchParams.set('size', params.size.toString());
    if (params.search) searchParams.set('search', params.search);
    if (params.status) searchParams.set('status', params.status);
    if (params.archived !== undefined) searchParams.set('archived', params.archived.toString());
    if (params.sort) searchParams.set('sort', params.sort);

    const query = searchParams.toString();
    return this.request<ApiResponse<Job[]>>(`/jobs${query ? `?${query}` : ''}`);
  }

  async getJob(id: number): Promise<ApiResponse<Job>> {
    return this.request<ApiResponse<Job>>(`/jobs/${id}`);
  }

  async createJob(data: JobInput): Promise<ApiResponse<Job>> {
    return this.request<ApiResponse<Job>>('/jobs', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateJob(id: number, data: Partial<JobInput>): Promise<ApiResponse<Job>> {
    return this.request<ApiResponse<Job>>(`/jobs/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteJob(id: number): Promise<ApiResponse<{ message: string }>> {
    return this.request<ApiResponse<{ message: string }>>(`/jobs/${id}`, {
      method: 'DELETE',
    });
  }

  // Stats endpoint
  async getStats(): Promise<ApiResponse<Stats>> {
    return this.request<ApiResponse<Stats>>('/stats');
  }

  // Export endpoint
  async exportJobs(params: Partial<JobsQueryParams> = {}): Promise<Blob> {
    const searchParams = new URLSearchParams();

    if (params.search) searchParams.set('search', params.search);
    if (params.status) searchParams.set('status', params.status);

    const query = searchParams.toString();
    const url = `${this.baseUrl}/jobs/export${query ? `?${query}` : ''}`;

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Export failed');
    }
    return response.blob();
  }
}

export const api = new ApiClient(API_BASE_URL);
export default api;
