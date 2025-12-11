"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createApplicant = createApplicant;
exports.getAllApplicants = getAllApplicants;
exports.getApplicantById = getApplicantById;
exports.updateApplicant = updateApplicant;
exports.deleteApplicant = deleteApplicant;
exports.getApplicantStats = getApplicantStats;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function createApplicant(data) {
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
async function getAllApplicants(sortBy = 'priorityScore', order = 'desc', status) {
    return prisma.applicant.findMany({
        where: status ? { status } : undefined,
        orderBy: { [sortBy]: order },
        include: {
            jobPosting: true,
        },
    });
}
async function getApplicantById(id) {
    return prisma.applicant.findUnique({
        where: { id },
        include: {
            jobPosting: true,
        },
    });
}
async function updateApplicant(id, data) {
    return prisma.applicant.update({
        where: { id },
        data,
    });
}
async function deleteApplicant(id) {
    return prisma.applicant.delete({
        where: { id },
    });
}
async function getApplicantStats() {
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
    const byStatus = {};
    byStatusRaw.forEach((item) => {
        byStatus[item.status] = item._count;
    });
    return {
        total,
        byStatus,
        avgScore: avgScoreResult._avg.priorityScore || 0,
    };
}
//# sourceMappingURL=applicant.service.js.map