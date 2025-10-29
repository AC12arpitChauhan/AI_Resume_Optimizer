'use client';

import useSWR from 'swr';
import { resumesAPI } from '@/lib/api';

export function useResumes() {
  const { data, error, isLoading, mutate } = useSWR('resumes', resumesAPI.getAll);

  return {
    resumes: data || [],
    isLoading,
    isError: error,
    mutate,
  };
}
