import axios, { AxiosError } from 'axios';
import type { 
  Applicant, 
  ApplicantStats, 
  ApplicantStatus,
  ApiResponse,
  ApplicantData,
  ApplicantsData,
  StatsData,
  ApiError 
} from '../types';

const API_BASE = 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_BASE,
});

/**
 * Custom error class for API errors with standardized response structure
 */
export class ApiResponseError extends Error {
  public errors: ApiError[];
  public requestId: string;

  constructor(message: string, errors: ApiError[] = [], requestId: string = 'unknown') {
    super(message);
    this.name = 'ApiResponseError';
    this.errors = errors;
    this.requestId = requestId;
  }
}

/**
 * Handle API response and extract data or throw error
 */
function handleResponse<T>(response: ApiResponse<T>): T {
  if (!response.success) {
    throw new ApiResponseError(
      response.message,
      response.errors || [],
      response.meta?.requestId || 'unknown'
    );
  }
  return response.data;
}

/**
 * Handle axios errors and convert to ApiResponseError
 */
function handleAxiosError(error: AxiosError<ApiResponse<unknown>>): never {
  if (error.response?.data) {
    const data = error.response.data;
    throw new ApiResponseError(
      data.message || 'An error occurred',
      data.errors || [],
      data.meta?.requestId || 'unknown'
    );
  }
  throw new ApiResponseError(error.message || 'Network error');
}

/**
 * Upload a resume file and create an applicant with AI analysis
 */
export async function uploadResume(file: File): Promise<Applicant> {
  try {
    const formData = new FormData();
    formData.append('resume', file);

    const response = await api.post<ApiResponse<ApplicantData>>('/applicants/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    const data = handleResponse(response.data);
    return data.applicant;
  } catch (error) {
    if (error instanceof ApiResponseError) throw error;
    handleAxiosError(error as AxiosError<ApiResponse<unknown>>);
  }
}

/**
 * Get all applicants with optional filtering and sorting
 */
export async function getApplicants(
  sortBy: 'priorityScore' | 'createdAt' = 'priorityScore',
  order: 'asc' | 'desc' = 'desc',
  status?: ApplicantStatus
): Promise<Applicant[]> {
  try {
    const params = new URLSearchParams();
    params.append('sortBy', sortBy);
    params.append('order', order);
    if (status) params.append('status', status);

    const response = await api.get<ApiResponse<ApplicantsData>>(`/applicants?${params.toString()}`);
    
    const data = handleResponse(response.data);
    return data.applicants;
  } catch (error) {
    if (error instanceof ApiResponseError) throw error;
    handleAxiosError(error as AxiosError<ApiResponse<unknown>>);
  }
}

/**
 * Get a single applicant by ID
 */
export async function getApplicant(id: string): Promise<Applicant> {
  try {
    const response = await api.get<ApiResponse<ApplicantData>>(`/applicants/${id}/`);
    
    const data = handleResponse(response.data);
    return data.applicant;
  } catch (error) {
    if (error instanceof ApiResponseError) throw error;
    handleAxiosError(error as AxiosError<ApiResponse<unknown>>);
  }
}

/**
 * Update an applicant's status and/or notes
 */
export async function updateApplicantStatus(
  id: string,
  status: ApplicantStatus,
  notes?: string
): Promise<Applicant> {
  try {
    const response = await api.patch<ApiResponse<ApplicantData>>(`/applicants/${id}/`, { status, notes });
    
    const data = handleResponse(response.data);
    return data.applicant;
  } catch (error) {
    if (error instanceof ApiResponseError) throw error;
    handleAxiosError(error as AxiosError<ApiResponse<unknown>>);
  }
}

/**
 * Delete an applicant and their resume file
 */
export async function deleteApplicant(id: string): Promise<void> {
  try {
    const response = await api.delete<ApiResponse<null>>(`/applicants/${id}/`);
    
    handleResponse(response.data);
  } catch (error) {
    if (error instanceof ApiResponseError) throw error;
    handleAxiosError(error as AxiosError<ApiResponse<unknown>>);
  }
}

/**
 * Get applicant statistics
 */
export async function getStats(): Promise<ApplicantStats> {
  try {
    const response = await api.get<ApiResponse<StatsData>>('/applicants/stats/');
    
    const data = handleResponse(response.data);
    return data.stats;
  } catch (error) {
    if (error instanceof ApiResponseError) throw error;
    handleAxiosError(error as AxiosError<ApiResponse<unknown>>);
  }
}

/**
 * Get the URL for downloading a resume
 */
export function getResumeDownloadUrl(id: string): string {
  return `${API_BASE}/applicants/${id}/resume/`;
}
