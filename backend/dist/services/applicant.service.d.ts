import { Applicant } from '@prisma/client';
import { ApplicantCreateInput, ApplicantUpdateInput } from '../types';
export declare function createApplicant(data: ApplicantCreateInput): Promise<Applicant>;
export declare function getAllApplicants(sortBy?: 'priorityScore' | 'createdAt', order?: 'asc' | 'desc', status?: string): Promise<Applicant[]>;
export declare function getApplicantById(id: string): Promise<Applicant | null>;
export declare function updateApplicant(id: string, data: ApplicantUpdateInput): Promise<Applicant>;
export declare function deleteApplicant(id: string): Promise<Applicant>;
export declare function getApplicantStats(): Promise<{
    total: number;
    byStatus: Record<string, number>;
    avgScore: number;
}>;
