import type { Job, JobInput, JobsQueryParams, ApiResponse, Stats } from './types';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private getAuthToken(): string | null {
    return localStorage.getItem('accessToken');
  }

  private async refreshAccessToken(): Promise<boolean> {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) return false;

    try {
      const response = await fetch(`${this.baseUrl}/auth?action=refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('accessToken', data.accessToken);
        return true;
      }
    } catch (error) {
      console.error('Token refresh failed:', error);
    }

    return false;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const token = this.getAuthToken();

    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    };

    let response = await fetch(url, config);

    // Handle 401 - token expired
    if (response.status === 401 && !endpoint.includes('/auth/')) {
      const refreshed = await this.refreshAccessToken();
      if (refreshed) {
        // Retry request with new token
        const newToken = this.getAuthToken();
        config.headers = {
          ...config.headers,
          ...(newToken && { Authorization: `Bearer ${newToken}` }),
        };
        response = await fetch(url, config);
      } else {
        // Redirect to login
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
        throw new Error('Session expired');
      }
    }

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
