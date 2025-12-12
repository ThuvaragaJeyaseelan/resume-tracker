export interface Applicant {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  resumeFilePath: string;
  resumeText: string | null;
  priorityScore: number;
  summary: string | null;
  keySkills: string[];
  experience: string | null;
  education: string | null;
  highlights: string[];
  concerns: string[];
  status: ApplicantStatus;
  notes: string | null;
  jobPostingId: string | null;
  createdAt: string;
  updatedAt: string;
}

export type ApplicantStatus = 'new' | 'reviewed' | 'shortlisted' | 'rejected' | 'hired';

export interface ApplicantStats {
  total: number;
  byStatus: Record<string, number>;
  avgScore: number;
}

// Standardized API Response Types
export interface ApiMeta {
  timestamp: string;
  requestId: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ApiError {
  field: string | null;
  message: string;
  code: string | null;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  meta: ApiMeta;
  errors: ApiError[] | null;
}

// Specific response data types
export interface ApplicantData {
  applicant: Applicant;
}

export interface ApplicantsData {
  applicants: Applicant[];
}

export interface StatsData {
  stats: ApplicantStats;
}
