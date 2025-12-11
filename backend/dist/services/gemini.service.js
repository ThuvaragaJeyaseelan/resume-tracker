"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.analyzeResume = analyzeResume;
exports.analyzeResumeFromFile = analyzeResumeFromFile;
const generative_ai_1 = require("@google/generative-ai");
const config_1 = require("../config");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const genAI = new generative_ai_1.GoogleGenerativeAI(config_1.config.geminiApiKey);
const RESUME_ANALYSIS_PROMPT = `You are an expert HR recruiter assistant. Analyze the following resume and extract structured information.

Return a JSON object with EXACTLY this structure (no markdown, just raw JSON):
{
  "name": "Full name of the candidate",
  "email": "Email address",
  "phone": "Phone number or null if not found",
  "priorityScore": <number 0-100 based on overall quality>,
  "summary": "2-3 sentence professional summary",
  "keySkills": ["skill1", "skill2", ...up to 10 most relevant skills],
  "experience": "Brief summary of work experience (years, notable companies, roles)",
  "education": "Highest education level and institution",
  "highlights": ["standout achievement 1", "standout achievement 2", ...up to 5],
  "concerns": ["potential concern 1", ...up to 3, or empty array if none]
}

Scoring guidelines for priorityScore:
- 90-100: Exceptional candidate with strong relevant experience and achievements
- 70-89: Strong candidate with good experience
- 50-69: Average candidate, meets basic requirements
- 30-49: Below average, missing key qualifications
- 0-29: Poor fit, major gaps or concerns

Resume content:
`;
async function analyzeResume(resumeText) {
    try {
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
        const result = await model.generateContent(RESUME_ANALYSIS_PROMPT + resumeText);
        const response = result.response;
        const text = response.text();
        // Clean the response - remove markdown code blocks if present
        let cleanedText = text.trim();
        if (cleanedText.startsWith('```json')) {
            cleanedText = cleanedText.slice(7);
        }
        else if (cleanedText.startsWith('```')) {
            cleanedText = cleanedText.slice(3);
        }
        if (cleanedText.endsWith('```')) {
            cleanedText = cleanedText.slice(0, -3);
        }
        cleanedText = cleanedText.trim();
        const analysis = JSON.parse(cleanedText);
        // Validate and sanitize the response
        return {
            name: analysis.name || 'Unknown',
            email: analysis.email || 'unknown@example.com',
            phone: analysis.phone || null,
            priorityScore: Math.min(100, Math.max(0, analysis.priorityScore || 50)),
            summary: analysis.summary || 'No summary available',
            keySkills: Array.isArray(analysis.keySkills) ? analysis.keySkills.slice(0, 10) : [],
            experience: analysis.experience || 'Not specified',
            education: analysis.education || 'Not specified',
            highlights: Array.isArray(analysis.highlights) ? analysis.highlights.slice(0, 5) : [],
            concerns: Array.isArray(analysis.concerns) ? analysis.concerns.slice(0, 3) : [],
        };
    }
    catch (error) {
        console.error('Error analyzing resume with Gemini:', error);
        throw new Error('Failed to analyze resume');
    }
}
async function analyzeResumeFromFile(filePath) {
    try {
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
        const fileBuffer = fs_1.default.readFileSync(filePath);
        const base64Data = fileBuffer.toString('base64');
        const ext = path_1.default.extname(filePath).toLowerCase();
        let mimeType = 'application/pdf';
        if (ext === '.doc')
            mimeType = 'application/msword';
        else if (ext === '.docx')
            mimeType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
        else if (ext === '.txt')
            mimeType = 'text/plain';
        const result = await model.generateContent([
            RESUME_ANALYSIS_PROMPT,
            {
                inlineData: {
                    mimeType,
                    data: base64Data,
                },
            },
        ]);
        const response = result.response;
        const text = response.text();
        // Clean the response
        let cleanedText = text.trim();
        if (cleanedText.startsWith('```json')) {
            cleanedText = cleanedText.slice(7);
        }
        else if (cleanedText.startsWith('```')) {
            cleanedText = cleanedText.slice(3);
        }
        if (cleanedText.endsWith('```')) {
            cleanedText = cleanedText.slice(0, -3);
        }
        cleanedText = cleanedText.trim();
        const analysis = JSON.parse(cleanedText);
        return {
            name: analysis.name || 'Unknown',
            email: analysis.email || 'unknown@example.com',
            phone: analysis.phone || null,
            priorityScore: Math.min(100, Math.max(0, analysis.priorityScore || 50)),
            summary: analysis.summary || 'No summary available',
            keySkills: Array.isArray(analysis.keySkills) ? analysis.keySkills.slice(0, 10) : [],
            experience: analysis.experience || 'Not specified',
            education: analysis.education || 'Not specified',
            highlights: Array.isArray(analysis.highlights) ? analysis.highlights.slice(0, 5) : [],
            concerns: Array.isArray(analysis.concerns) ? analysis.concerns.slice(0, 3) : [],
        };
    }
    catch (error) {
        console.error('Error analyzing resume file with Gemini:', error);
        throw new Error('Failed to analyze resume file');
    }
}
//# sourceMappingURL=gemini.service.js.map