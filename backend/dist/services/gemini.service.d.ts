import { ResumeAnalysis } from '../types';
export declare function analyzeResume(resumeText: string): Promise<ResumeAnalysis>;
export declare function analyzeResumeFromFile(filePath: string): Promise<ResumeAnalysis>;
