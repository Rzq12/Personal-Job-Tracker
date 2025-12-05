import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from './api';
import type { JobInput, JobsQueryParams } from './types';

// Query keys
export const queryKeys = {
  jobs: (params?: JobsQueryParams) => ['jobs', params] as const,
  job: (id: number) => ['job', id] as const,
  stats: ['stats'] as const,
};

// Jobs hooks
export function useJobs(params: JobsQueryParams = {}) {
  return useQuery({
    queryKey: queryKeys.jobs(params),
    queryFn: () => api.getJobs(params),
    staleTime: 30000, // 30 seconds
  });
}

export function useJob(id: number) {
  return useQuery({
    queryKey: queryKeys.job(id),
    queryFn: () => api.getJob(id),
    enabled: id > 0,
  });
}

export function useCreateJob() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: JobInput) => api.createJob(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      queryClient.invalidateQueries({ queryKey: ['stats'] });
    },
  });
}

export function useUpdateJob() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<JobInput> }) =>
      api.updateJob(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      queryClient.invalidateQueries({ queryKey: queryKeys.job(id) });
      queryClient.invalidateQueries({ queryKey: ['stats'] });
    },
  });
}

export function useDeleteJob() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => api.deleteJob(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      queryClient.invalidateQueries({ queryKey: ['stats'] });
    },
  });
}

// Stats hook
export function useStats() {
  return useQuery({
    queryKey: queryKeys.stats,
    queryFn: () => api.getStats(),
    staleTime: 60000, // 1 minute
  });
}
