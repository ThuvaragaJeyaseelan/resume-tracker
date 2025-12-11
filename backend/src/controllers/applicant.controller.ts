import { Request, Response } from 'express';
import * as applicantService from '../services/applicant.service';
import { analyzeResumeFromFile } from '../services/gemini.service';
import { config } from '../config';
import path from 'path';
import fs from 'fs';

export async function uploadResume(req: Request, res: Response): Promise<void> {
  try {
    if (!req.file) {
      res.status(400).json({ error: 'No file uploaded' });
      return;
    }

    const filePath = req.file.path;

    // Analyze the resume using Gemini
    const analysis = await analyzeResumeFromFile(filePath);

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
  } catch (error) {
    console.error('Error uploading resume:', error);
    res.status(500).json({ error: 'Failed to process resume' });
  }
}

export async function getAllApplicants(req: Request, res: Response): Promise<void> {
  try {
    const sortBy = (req.query.sortBy as 'priorityScore' | 'createdAt') || 'priorityScore';
    const order = (req.query.order as 'asc' | 'desc') || 'desc';
    const status = req.query.status as string | undefined;

    const applicants = await applicantService.getAllApplicants(sortBy, order, status);

    // Parse JSON fields for response
    const parsedApplicants = applicants.map((applicant) => ({
      ...applicant,
      keySkills: applicant.keySkills ? JSON.parse(applicant.keySkills) : [],
      highlights: applicant.highlights ? JSON.parse(applicant.highlights) : [],
      concerns: applicant.concerns ? JSON.parse(applicant.concerns) : [],
    }));

    res.json({ applicants: parsedApplicants });
  } catch (error) {
    console.error('Error fetching applicants:', error);
    res.status(500).json({ error: 'Failed to fetch applicants' });
  }
}

export async function getApplicantById(req: Request, res: Response): Promise<void> {
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
  } catch (error) {
    console.error('Error fetching applicant:', error);
    res.status(500).json({ error: 'Failed to fetch applicant' });
  }
}

export async function updateApplicant(req: Request, res: Response): Promise<void> {
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
  } catch (error) {
    console.error('Error updating applicant:', error);
    res.status(500).json({ error: 'Failed to update applicant' });
  }
}

export async function deleteApplicant(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;

    // Get applicant to find resume file path
    const applicant = await applicantService.getApplicantById(id);
    if (!applicant) {
      res.status(404).json({ error: 'Applicant not found' });
      return;
    }

    // Delete the file
    if (fs.existsSync(applicant.resumeFilePath)) {
      fs.unlinkSync(applicant.resumeFilePath);
    }

    // Delete the record
    await applicantService.deleteApplicant(id);

    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting applicant:', error);
    res.status(500).json({ error: 'Failed to delete applicant' });
  }
}

export async function getStats(req: Request, res: Response): Promise<void> {
  try {
    const stats = await applicantService.getApplicantStats();
    res.json(stats);
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
}

export async function downloadResume(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const applicant = await applicantService.getApplicantById(id);

    if (!applicant) {
      res.status(404).json({ error: 'Applicant not found' });
      return;
    }

    if (!fs.existsSync(applicant.resumeFilePath)) {
      res.status(404).json({ error: 'Resume file not found' });
      return;
    }

    res.download(applicant.resumeFilePath);
  } catch (error) {
    console.error('Error downloading resume:', error);
    res.status(500).json({ error: 'Failed to download resume' });
  }
}
