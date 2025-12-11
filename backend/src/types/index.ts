export interface ResumeAnalysis {
  name: string;
  email: string;
  phone: string | null;
  priorityScore: number;
  summary: string;
  keySkills: string[];
  experience: string;
  education: string;
  highlights: string[];
  concerns: string[];
}

export interface ApplicantCreateInput {
  name: string;
  email: string;
  phone?: string;
  resumeFilePath: string;
  resumeText?: string;
  priorityScore?: number;
  summary?: string;
  keySkills?: string;
  experience?: string;
  education?: string;
  highlights?: string;
  concerns?: string;
  jobPostingId?: string;
}

export interface ApplicantUpdateInput {
  status?: string;
  notes?: string;
  priorityScore?: number;
}

export type ApplicantStatus = 'new' | 'reviewed' | 'shortlisted' | 'rejected' | 'hired';
