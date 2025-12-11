import { Request, Response } from 'express';
export declare function uploadResume(req: Request, res: Response): Promise<void>;
export declare function getAllApplicants(req: Request, res: Response): Promise<void>;
export declare function getApplicantById(req: Request, res: Response): Promise<void>;
export declare function updateApplicant(req: Request, res: Response): Promise<void>;
export declare function deleteApplicant(req: Request, res: Response): Promise<void>;
export declare function getStats(req: Request, res: Response): Promise<void>;
export declare function downloadResume(req: Request, res: Response): Promise<void>;
