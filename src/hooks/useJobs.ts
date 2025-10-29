'use client';

import useSWR from 'swr';
import { jobsAPI, Job } from '@/lib/api';
import { useEffect } from 'react';
import { getSocket } from '@/lib/socket';

export function useJobs(status?: string) {
  const { data, error, isLoading, mutate } = useSWR(
    ['jobs', status],
    () => jobsAPI.getAll({ status: status === 'All' ? undefined : status }),
    {
      refreshInterval: 0,
      revalidateOnFocus: false,
    }
  );

  useEffect(() => {
    const socket = getSocket();

    const handleJobCreated = (job: Job) => {
      mutate();
    };

    const handleJobUpdated = (job: Job) => {
      mutate();
    };

    const handleJobDeleted = () => {
      mutate();
    };

    socket.on('job:created', handleJobCreated);
    socket.on('job:updated', handleJobUpdated);
    socket.on('job:deleted', handleJobDeleted);

    return () => {
      socket.off('job:created', handleJobCreated);
      socket.off('job:updated', handleJobUpdated);
      socket.off('job:deleted', handleJobDeleted);
    };
  }, [mutate]);

  return {
    jobs: data?.jobs || [],
    pagination: data?.pagination,
    isLoading,
    isError: error,
    mutate,
  };
}

export function useJob(id?: string) {
  const { data, error, isLoading, mutate } = useSWR(
    id ? ['job', id] : null,
    () => (id ? jobsAPI.getById(id) : null)
  );

  return {
    job: data,
    isLoading,
    isError: error,
    mutate,
  };
}
