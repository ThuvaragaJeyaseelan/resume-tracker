"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadResume = uploadResume;
exports.getAllApplicants = getAllApplicants;
exports.getApplicantById = getApplicantById;
exports.updateApplicant = updateApplicant;
exports.deleteApplicant = deleteApplicant;
exports.getStats = getStats;
exports.downloadResume = downloadResume;
const applicantService = __importStar(require("../services/applicant.service"));
const gemini_service_1 = require("../services/gemini.service");
const fs_1 = __importDefault(require("fs"));
async function uploadResume(req, res) {
    try {
        if (!req.file) {
            res.status(400).json({ error: 'No file uploaded' });
            return;
        }
        const filePath = req.file.path;
        // Analyze the resume using Gemini
        const analysis = await (0, gemini_service_1.analyzeResumeFromFile)(filePath);
        // Create applicant record
        const applicant = await applicantService.createApplicant({
            name: analysis.name,
            email: analysis.email,
            phone: analysis.phone || undefined,
            resumeFilePath: filePath,
            priorityScore: analysis.priorityScore,
            summary: analysis.summary,
            keySkills: JSON.stringify(analysis.keySkills),
            experience: analysis.experience,
            education: analysis.education,
            highlights: JSON.stringify(analysis.highlights),
            concerns: JSON.stringify(analysis.concerns),
        });
        res.status(201).json({
            success: true,
            applicant: {
                ...applicant,
                keySkills: analysis.keySkills,
                highlights: analysis.highlights,
                concerns: analysis.concerns,
            },
        });
    }
    catch (error) {
        console.error('Error uploading resume:', error);
        res.status(500).json({ error: 'Failed to process resume' });
    }
}
async function getAllApplicants(req, res) {
    try {
        const sortBy = req.query.sortBy || 'priorityScore';
        const order = req.query.order || 'desc';
        const status = req.query.status;
        const applicants = await applicantService.getAllApplicants(sortBy, order, status);
        // Parse JSON fields for response
        const parsedApplicants = applicants.map((applicant) => ({
            ...applicant,
            keySkills: applicant.keySkills ? JSON.parse(applicant.keySkills) : [],
            highlights: applicant.highlights ? JSON.parse(applicant.highlights) : [],
            concerns: applicant.concerns ? JSON.parse(applicant.concerns) : [],
        }));
        res.json({ applicants: parsedApplicants });
    }
    catch (error) {
        console.error('Error fetching applicants:', error);
        res.status(500).json({ error: 'Failed to fetch applicants' });
    }
}
async function getApplicantById(req, res) {
    try {
        const { id } = req.params;
        const applicant = await applicantService.getApplicantById(id);
        if (!applicant) {
            res.status(404).json({ error: 'Applicant not found' });
            return;
        }
        res.json({
            applicant: {
                ...applicant,
                keySkills: applicant.keySkills ? JSON.parse(applicant.keySkills) : [],
                highlights: applicant.highlights ? JSON.parse(applicant.highlights) : [],
                concerns: applicant.concerns ? JSON.parse(applicant.concerns) : [],
            },
        });
    }
    catch (error) {
        console.error('Error fetching applicant:', error);
        res.status(500).json({ error: 'Failed to fetch applicant' });
    }
}
async function updateApplicant(req, res) {
    try {
        const { id } = req.params;
        const { status, notes } = req.body;
        const applicant = await applicantService.updateApplicant(id, { status, notes });
        res.json({
            success: true,
            applicant: {
                ...applicant,
                keySkills: applicant.keySkills ? JSON.parse(applicant.keySkills) : [],
                highlights: applicant.highlights ? JSON.parse(applicant.highlights) : [],
                concerns: applicant.concerns ? JSON.parse(applicant.concerns) : [],
            },
        });
    }
    catch (error) {
        console.error('Error updating applicant:', error);
        res.status(500).json({ error: 'Failed to update applicant' });
    }
}
async function deleteApplicant(req, res) {
    try {
        const { id } = req.params;
        // Get applicant to find resume file path
        const applicant = await applicantService.getApplicantById(id);
        if (!applicant) {
            res.status(404).json({ error: 'Applicant not found' });
            return;
        }
        // Delete the file
        if (fs_1.default.existsSync(applicant.resumeFilePath)) {
            fs_1.default.unlinkSync(applicant.resumeFilePath);
        }
        // Delete the record
        await applicantService.deleteApplicant(id);
        res.json({ success: true });
    }
    catch (error) {
        console.error('Error deleting applicant:', error);
        res.status(500).json({ error: 'Failed to delete applicant' });
    }
}
async function getStats(req, res) {
    try {
        const stats = await applicantService.getApplicantStats();
        res.json(stats);
    }
    catch (error) {
        console.error('Error fetching stats:', error);
        res.status(500).json({ error: 'Failed to fetch stats' });
    }
}
async function downloadResume(req, res) {
    try {
        const { id } = req.params;
        const applicant = await applicantService.getApplicantById(id);
        if (!applicant) {
            res.status(404).json({ error: 'Applicant not found' });
            return;
        }
        if (!fs_1.default.existsSync(applicant.resumeFilePath)) {
            res.status(404).json({ error: 'Resume file not found' });
            return;
        }
        res.download(applicant.resumeFilePath);
    }
    catch (error) {
        console.error('Error downloading resume:', error);
        res.status(500).json({ error: 'Failed to download resume' });
    }
}
//# sourceMappingURL=applicant.controller.js.map