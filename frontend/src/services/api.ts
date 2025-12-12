import axios from 'axios';
import type { AxiosInstance, AxiosError } from 'axios';
import type {
  ApiResponse,
  AuthData,
  RecruiterData,
  JobData,
  JobsData,
  JobFilters,
  JobStatsData,
  ApplicantData,
  ApplicantsData,
  JobApplicantsData,
  StatsData,
  ApplicationData,
  Applicant,
  ApplicantStatus,
  Job,
  Recruiter,
  LoginInput,
  SignupInput,
  JobInput,
} from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// Create axios instance
const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Token management
const TOKEN_KEY = 'ats_token';
const RECRUITER_KEY = 'ats_recruiter';

export const getStoredToken = (): string | null => {
  return localStorage.getItem(TOKEN_KEY);
};

export const getStoredRecruiter = (): Recruiter | null => {
  const stored = localStorage.getItem(RECRUITER_KEY);
  return stored ? JSON.parse(stored) : null;
};

export const setAuthData = (token: string, recruiter: Recruiter): void => {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(RECRUITER_KEY, JSON.stringify(recruiter));
};

export const clearAuthData = (): void => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(RECRUITER_KEY);
};

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = getStoredToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiResponse<null>>) => {
    if (error.response?.status === 401) {
      clearAuthData();
      // Optionally redirect to login
      if (window.location.pathname !== '/login' && window.location.pathname !== '/signup') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// ============================================
// Auth API
// ============================================

export const login = async (input: LoginInput): Promise<{ recruiter: Recruiter; token: string }> => {
  const response = await api.post<ApiResponse<AuthData>>('/api/auth/login', input);
  const { recruiter, token } = response.data.data;
  setAuthData(token, recruiter);
  return { recruiter, token };
};

export const signup = async (input: SignupInput): Promise<{ recruiter: Recruiter; token: string }> => {
  const response = await api.post<ApiResponse<AuthData>>('/api/auth/signup', {
    email: input.email,
    password: input.password,
    full_name: input.fullName,
    company_name: input.companyName,
  });
  const { recruiter, token } = response.data.data;
  setAuthData(token, recruiter);
  return { recruiter, token };
};

export const logout = (): void => {
  clearAuthData();
};

export const getProfile = async (): Promise<Recruiter> => {
  const response = await api.get<ApiResponse<RecruiterData>>('/api/auth/profile');
  return response.data.data.recruiter;
};

export const updateProfile = async (data: { fullName?: string; companyName?: string }): Promise<Recruiter> => {
  const response = await api.patch<ApiResponse<RecruiterData>>('/api/auth/profile', {
    full_name: data.fullName,
    company_name: data.companyName,
  });
  const recruiter = response.data.data.recruiter;
  const token = getStoredToken();
  if (token) {
    setAuthData(token, recruiter);
  }
  return recruiter;
};

export const refreshToken = async (): Promise<string> => {
  const response = await api.post<ApiResponse<{ token: string }>>('/api/auth/refresh');
  const { token } = response.data.data;
  const recruiter = getStoredRecruiter();
  if (recruiter) {
    setAuthData(token, recruiter);
  }
  return token;
};

// ============================================
// Jobs API (Authenticated)
// ============================================

export const getRecruiterJobs = async (
  status?: string,
  sortBy: string = 'created_at',
  order: string = 'desc'
): Promise<Job[]> => {
  const params = new URLSearchParams();
  if (status) params.append('status', status);
  params.append('sortBy', sortBy);
  params.append('order', order);
  
  const response = await api.get<ApiResponse<{ jobs: Job[] }>>(`/api/jobs/?${params}`);
  return response.data.data.jobs;
};

export const getJob = async (jobId: string): Promise<Job> => {
  const response = await api.get<ApiResponse<JobData>>(`/api/jobs/${jobId}/`);
  return response.data.data.job;
};

export const createJob = async (input: JobInput): Promise<Job> => {
  const response = await api.post<ApiResponse<JobData>>('/api/jobs/', {
    title: input.title,
    department: input.department,
    description: input.description,
    requirements: input.requirements,
    location: input.location,
    employment_type: input.employmentType,
    salary_range: input.salaryRange,
    status: input.status || 'draft',
  });
  return response.data.data.job;
};

export const updateJob = async (jobId: string, input: Partial<JobInput>): Promise<Job> => {
  const payload: Record<string, unknown> = {};
  if (input.title !== undefined) payload.title = input.title;
  if (input.department !== undefined) payload.department = input.department;
  if (input.description !== undefined) payload.description = input.description;
  if (input.requirements !== undefined) payload.requirements = input.requirements;
  if (input.location !== undefined) payload.location = input.location;
  if (input.employmentType !== undefined) payload.employment_type = input.employmentType;
  if (input.salaryRange !== undefined) payload.salary_range = input.salaryRange;
  if (input.status !== undefined) payload.status = input.status;
  
  const response = await api.patch<ApiResponse<JobData>>(`/api/jobs/${jobId}/`, payload);
  return response.data.data.job;
};

export const deleteJob = async (jobId: string): Promise<void> => {
  await api.delete(`/api/jobs/${jobId}/`);
};

export const getJobStats = async (): Promise<{ stats: { totalJobs: number; activeJobs: number; totalApplicants: number; byStatus: Record<string, number> } }> => {
  const response = await api.get<ApiResponse<JobStatsData>>('/api/jobs/stats/');
  return response.data.data;
};

export const getJobApplicants = async (
  jobId: string,
  sortBy: string = 'jobRelevancyScore',
  order: string = 'desc',
  status?: string
): Promise<JobApplicantsData> => {
  const params = new URLSearchParams();
  params.append('sortBy', sortBy);
  params.append('order', order);
  if (status) params.append('status', status);
  
  const response = await api.get<ApiResponse<JobApplicantsData>>(`/api/jobs/${jobId}/applicants/?${params}`);
  return response.data.data;
};

// ============================================
// Jobs API (Public)
// ============================================

export const getPublicJobs = async (
  page: number = 1,
  limit: number = 20,
  filters?: { search?: string; department?: string; location?: string; employmentType?: string }
): Promise<JobsData> => {
  const params = new URLSearchParams();
  params.append('page', page.toString());
  params.append('limit', limit.toString());
  if (filters?.search) params.append('search', filters.search);
  if (filters?.department) params.append('department', filters.department);
  if (filters?.location) params.append('location', filters.location);
  if (filters?.employmentType) params.append('employmentType', filters.employmentType);
  
  const response = await api.get<ApiResponse<JobsData>>(`/api/jobs/public/?${params}`);
  return response.data.data;
};

export const getPublicJob = async (jobId: string): Promise<Job> => {
  const response = await api.get<ApiResponse<JobData>>(`/api/jobs/public/${jobId}/`);
  return response.data.data.job;
};

export const getJobFilters = async (): Promise<JobFilters> => {
  const response = await api.get<ApiResponse<JobFilters>>('/api/jobs/filters/');
  return response.data.data;
};

// ============================================
// Application API (Public)
// ============================================

export const submitApplication = async (
  jobId: string,
  data: { name: string; email: string; phone: string; resume: File }
): Promise<ApplicationData> => {
  const formData = new FormData();
  formData.append('name', data.name);
  formData.append('email', data.email);
  formData.append('phone', data.phone);
  formData.append('resume', data.resume);
  
  const response = await api.post<ApiResponse<ApplicationData>>(
    `/api/jobs/${jobId}/apply/`,
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  );
  return response.data.data;
};

// ============================================
// Applicants API (Authenticated)
// ============================================

export const getApplicants = async (
  sortBy: string = 'priorityScore',
  order: string = 'desc',
  status?: string
): Promise<Applicant[]> => {
  const params = new URLSearchParams();
  params.append('sortBy', sortBy);
  params.append('order', order);
  if (status) params.append('status', status);
  
  const response = await api.get<ApiResponse<ApplicantsData>>(`/api/applicants/?${params}`);
  return response.data.data.applicants;
};

export const getApplicant = async (applicantId: string): Promise<Applicant> => {
  const response = await api.get<ApiResponse<ApplicantData>>(`/api/applicants/${applicantId}/`);
  return response.data.data.applicant;
};

export const updateApplicantStatus = async (
  applicantId: string,
  status: ApplicantStatus,
  notes?: string
): Promise<Applicant> => {
  const payload: Record<string, unknown> = { status };
  if (notes !== undefined) payload.notes = notes;
  
  const response = await api.patch<ApiResponse<ApplicantData>>(`/api/applicants/${applicantId}/`, payload);
  return response.data.data.applicant;
};

export const deleteApplicant = async (applicantId: string): Promise<void> => {
  await api.delete(`/api/applicants/${applicantId}/`);
};

export const getStats = async (): Promise<{ total: number; byStatus: Record<string, number>; avgScore: number }> => {
  const response = await api.get<ApiResponse<StatsData>>('/api/applicants/stats/');
  return response.data.data.stats;
};

export const downloadResume = async (applicantId: string): Promise<Blob> => {
  const response = await api.get(`/api/applicants/${applicantId}/resume/`, {
    responseType: 'blob',
  });
  return response.data;
};

// ============================================
// Health Check
// ============================================

export const healthCheck = async (): Promise<boolean> => {
  try {
    await api.get('/api/health/');
    return true;
  } catch {
    return false;
  }
};

export default api;
