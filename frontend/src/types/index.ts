// ============================================
// Auth Types
// ============================================

export interface Recruiter {
  id: string;
  email: string;
  fullName: string;
  companyName: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuthState {
  recruiter: Recruiter | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

// ============================================
// Job Types
// ============================================

export type EmploymentType = 'full-time' | 'part-time' | 'contract' | 'internship';
export type JobStatus = 'draft' | 'active' | 'closed';

export interface Job {
  id: string;
  recruiterId: string;
  title: string;
  department: string | null;
  description: string | null;
  requirements: string | null;
  location: string | null;
  employmentType: EmploymentType;
  salaryRange: string | null;
  status: JobStatus;
  applicantCount?: number;
  recruiter?: {
    id: string;
    fullName: string;
    companyName: string | null;
  };
  createdAt: string;
  updatedAt: string;
}

export interface JobFilters {
  departments: string[];
  locations: string[];
  employmentTypes: EmploymentType[];
}

export interface JobStats {
  totalJobs: number;
  activeJobs: number;
  totalApplicants: number;
  byStatus: Record<string, number>;
}

// ============================================
// Applicant Types
// ============================================

export type ApplicantStatus = 'new' | 'reviewed' | 'shortlisted' | 'rejected' | 'hired';

export interface Applicant {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  resumeFilePath: string;
  resumeText: string | null;
  // General analysis
  priorityScore: number;
  summary: string | null;
  keySkills: string[];
  experience: string | null;
  education: string | null;
  highlights: string[];
  concerns: string[];
  // Job-specific analysis
  jobRelevancyScore: number;
  jobMatchSummary: string | null;
  skillMatches: string[];
  skillGaps: string[];
  // Status and tracking
  status: ApplicantStatus;
  notes: string | null;
  jobPostingId: string | null;
  jobPosting: Job | null;
  createdAt: string;
  updatedAt: string;
}

export interface ApplicantStats {
  total: number;
  byStatus: Record<string, number>;
  avgScore: number;
}

export interface JobApplicantStats {
  total: number;
  byStatus: Record<string, number>;
  avgRelevancyScore: number;
  highMatches: number;
}

// ============================================
// API Response Types
// ============================================

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
export interface AuthData {
  recruiter: Recruiter;
  token: string;
}

export interface RecruiterData {
  recruiter: Recruiter;
}

export interface JobData {
  job: Job;
}

export interface JobsData {
  jobs: Job[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ApplicantData {
  applicant: Applicant;
}

export interface ApplicantsData {
  applicants: Applicant[];
}

export interface JobApplicantsData {
  applicants: Applicant[];
  stats: JobApplicantStats;
  job: Job;
}

export interface StatsData {
  stats: ApplicantStats;
}

export interface JobStatsData {
  stats: JobStats;
}

export interface ApplicationData {
  applicationId: string;
  message: string;
}

// ============================================
// Form Input Types
// ============================================

export interface LoginInput {
  email: string;
  password: string;
}

export interface SignupInput {
  email: string;
  password: string;
  fullName: string;
  companyName?: string;
}

export interface JobInput {
  title: string;
  department?: string;
  description?: string;
  requirements?: string;
  location?: string;
  employmentType?: EmploymentType;
  salaryRange?: string;
  status?: JobStatus;
}

export interface ApplicationInput {
  name: string;
  email: string;
  phone: string;
  resume: File;
}
