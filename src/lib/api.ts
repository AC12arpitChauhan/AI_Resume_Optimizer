import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Types
export interface Job {
  _id: string;
  clientName: string;
  companyName: string;
  position: string;
  jobDescription: string;
  jobApplicationLink?: string;
  status: 'Pending Optimization' | 'Optimized';
  baseResume?: Resume;
  latestOptimizedResume?: Resume;
  optimizedOn?: string;
  changesSummary?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Resume {
  _id: string;
  ownerJob?: string;
  baseResumeText: string;
  optimizedResumeText?: string;
  files: Array<{
    filename: string;
    path: string;
    mimeType: string;
    uploadedAt: string;
  }>;
  keywordsAdded?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface OptimizeResponse {
  jobId: string;
  optimizedResumeText: string;
  changesSummary: {
    headline: string;
    summary: string;
    keywordsAdded: string[];
  };
  updatedJob: {
    status: string;
    optimizedOn: string;
    changesSummary: string;
  };
  diff: {
    lineDiff: DiffPart[];
    wordDiff: DiffPart[];
    stats: {
      additions: number;
      deletions: number;
      unchanged: number;
      total: number;
    };
  };
}

export interface DiffPart {
  value: string;
  added?: boolean;
  removed?: boolean;
  count?: number;
}

export interface DiffResponse {
  jobId: string;
  diff: {
    lineDiff: DiffPart[];
    wordDiff: DiffPart[];
    stats: {
      additions: number;
      deletions: number;
      unchanged: number;
      total: number;
    };
  };
  changesSummary?: string;
  keywordsAdded?: string[];
}

// API Functions
export const jobsAPI = {
  getAll: async (params?: { status?: string; page?: number; limit?: number }) => {
    const response = await api.get<{ jobs: Job[]; pagination: any }>('/jobs', { params });
    return response.data;
  },

  getById: async (id: string) => {
    const response = await api.get<Job>(`/jobs/${id}`);
    return response.data;
  },

  create: async (data: Partial<Job> & { baseResumeId?: string }) => {
    const response = await api.post<Job>('/jobs', data);
    return response.data;
  },

  update: async (id: string, data: Partial<Job>) => {
    const response = await api.put<Job>(`/jobs/${id}`, data);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await api.delete(`/jobs/${id}`);
    return response.data;
  },
};

export const resumesAPI = {
  getAll: async () => {
    const response = await api.get<Resume[]>('/resumes');
    return response.data;
  },

  getById: async (id: string) => {
    const response = await api.get<Resume>(`/resumes/${id}`);
    return response.data;
  },

  upload: async (formData: FormData) => {
    const response = await api.post<Resume>('/resumes/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  update: async (id: string, data: { baseResumeText?: string; optimizedResumeText?: string }) => {
    const response = await api.put<Resume>(`/resumes/${id}`, data);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await api.delete(`/resumes/${id}`);
    return response.data;
  },
};

export const optimizeAPI = {
  optimize: async (data: { jobId: string; resumeId?: string }) => {
    const response = await api.post<OptimizeResponse>('/optimize', data);
    return response.data;
  },

  batchOptimize: async (jobIds: string[]) => {
    const response = await api.post('/optimize/batch', { jobIds });
    return response.data;
  },

  getDiff: async (jobId: string) => {
    const response = await api.get<DiffResponse>(`/optimize/diff/${jobId}`);
    return response.data;
  },
};
