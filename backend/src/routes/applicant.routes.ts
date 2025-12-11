import { Router } from 'express';
import multer from 'multer';
import crypto from 'crypto';
import path from 'path';
import { config } from '../config';
import * as applicantController from '../controllers/applicant.controller';

const router = Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, config.uploadsDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${crypto.randomUUID()}${ext}`);
  },
});

const fileFilter = (
  req: Express.Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  if (config.allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only PDF, DOC, DOCX, and TXT files are allowed.'));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: config.maxFileSize,
  },
});

// Routes
router.post('/upload', upload.single('resume'), applicantController.uploadResume);
router.get('/', applicantController.getAllApplicants);
router.get('/stats', applicantController.getStats);
router.get('/:id', applicantController.getApplicantById);
router.patch('/:id', applicantController.updateApplicant);
router.delete('/:id', applicantController.deleteApplicant);
router.get('/:id/resume', applicantController.downloadResume);

export default router;
