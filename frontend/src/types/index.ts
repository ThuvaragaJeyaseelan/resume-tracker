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
