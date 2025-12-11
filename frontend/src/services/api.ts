import axios from 'axios';
import type { Applicant, ApplicantStats, ApplicantStatus } from '../types';

const API_BASE = 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_BASE,
});

export async function uploadResume(file: File): Promise<Applicant> {
  const formData = new FormData();
  formData.append('resume', file);

  const response = await api.post('/applicants/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data.applicant;
}

export async function getApplicants(
  sortBy: 'priorityScore' | 'createdAt' = 'priorityScore',
  order: 'asc' | 'desc' = 'desc',
  status?: ApplicantStatus
): Promise<Applicant[]> {
  const params = new URLSearchParams();
  params.append('sortBy', sortBy);
  params.append('order', order);
  if (status) params.append('status', status);

  const response = await api.get(`/applicants?${params.toString()}`);
  return response.data.applicants;
}

export async function getApplicant(id: string): Promise<Applicant> {
  const response = await api.get(`/applicants/${id}`);
  return response.data.applicant;
}

export async function updateApplicantStatus(
  id: string,
  status: ApplicantStatus,
  notes?: string
): Promise<Applicant> {
  const response = await api.patch(`/applicants/${id}`, { status, notes });
  return response.data.applicant;
}

export async function deleteApplicant(id: string): Promise<void> {
  await api.delete(`/applicants/${id}`);
}

export async function getStats(): Promise<ApplicantStats> {
  const response = await api.get('/applicants/stats');
  return response.data;
}

export function getResumeDownloadUrl(id: string): string {
  return `${API_BASE}/applicants/${id}/resume`;
}
