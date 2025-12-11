import { PrismaClient, Applicant } from '@prisma/client';
import { ApplicantCreateInput, ApplicantUpdateInput } from '../types';

const prisma = new PrismaClient();

export async function createApplicant(data: ApplicantCreateInput): Promise<Applicant> {
  return prisma.applicant.create({
    data: {
      name: data.name,
      email: data.email,
      phone: data.phone,
      resumeFilePath: data.resumeFilePath,
      resumeText: data.resumeText,
      priorityScore: data.priorityScore || 0,
      summary: data.summary,
      keySkills: data.keySkills,
      experience: data.experience,
      education: data.education,
      highlights: data.highlights,
      concerns: data.concerns,
      jobPostingId: data.jobPostingId,
    },
  });
}

export async function getAllApplicants(
  sortBy: 'priorityScore' | 'createdAt' = 'priorityScore',
  order: 'asc' | 'desc' = 'desc',
  status?: string
): Promise<Applicant[]> {
  return prisma.applicant.findMany({
    where: status ? { status } : undefined,
    orderBy: { [sortBy]: order },
    include: {
      jobPosting: true,
    },
  });
}

export async function getApplicantById(id: string): Promise<Applicant | null> {
  return prisma.applicant.findUnique({
    where: { id },
    include: {
      jobPosting: true,
    },
  });
}

export async function updateApplicant(id: string, data: ApplicantUpdateInput): Promise<Applicant> {
  return prisma.applicant.update({
    where: { id },
    data,
  });
}

export async function deleteApplicant(id: string): Promise<Applicant> {
  return prisma.applicant.delete({
    where: { id },
  });
}

export async function getApplicantStats(): Promise<{
  total: number;
  byStatus: Record<string, number>;
  avgScore: number;
}> {
  const [total, byStatusRaw, avgScoreResult] = await Promise.all([
    prisma.applicant.count(),
    prisma.applicant.groupBy({
      by: ['status'],
      _count: true,
    }),
    prisma.applicant.aggregate({
      _avg: {
        priorityScore: true,
      },
    }),
  ]);

  const byStatus: Record<string, number> = {};
  byStatusRaw.forEach((item) => {
    byStatus[item.status] = item._count;
  });

  return {
    total,
    byStatus,
    avgScore: avgScoreResult._avg.priorityScore || 0,
  };
}
