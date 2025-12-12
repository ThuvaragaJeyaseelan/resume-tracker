"""
Gemini AI service for resume analysis.
"""

import json
import base64
import os
from typing import TypedDict, List, Optional
from django.conf import settings
import google.generativeai as genai


class ResumeAnalysis(TypedDict):
    """Type definition for resume analysis result."""
    name: str
    email: str
    phone: Optional[str]
    priority_score: int
    summary: str
    key_skills: List[str]
    experience: str
    education: str
    highlights: List[str]
    concerns: List[str]


class JobMatchAnalysis(TypedDict):
    """Type definition for job-specific resume analysis result."""
    job_relevancy_score: int
    job_match_summary: str
    skill_matches: List[str]
    skill_gaps: List[str]
    strengths: List[str]
    recommendations: List[str]


# Configure Gemini API
def _configure_genai():
    """Configure the Gemini API with the API key."""
    api_key = settings.GEMINI_API_KEY
    if not api_key:
        raise ValueError("GEMINI_API_KEY is not configured")
    genai.configure(api_key=api_key)


RESUME_ANALYSIS_PROMPT = """You are an expert HR recruiter assistant. Analyze the following resume and extract structured information.

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
"""


def _parse_gemini_response(text: str) -> ResumeAnalysis:
    """
    Parse and validate Gemini's response.
    
    Args:
        text: Raw text response from Gemini
        
    Returns:
        Validated ResumeAnalysis dictionary
    """
    # Clean the response - remove markdown code blocks if present
    cleaned_text = text.strip()
    if cleaned_text.startswith('```json'):
        cleaned_text = cleaned_text[7:]
    elif cleaned_text.startswith('```'):
        cleaned_text = cleaned_text[3:]
    if cleaned_text.endswith('```'):
        cleaned_text = cleaned_text[:-3]
    cleaned_text = cleaned_text.strip()
    
    # Parse JSON
    analysis = json.loads(cleaned_text)
    
    # Validate and sanitize the response
    return {
        'name': analysis.get('name', 'Unknown'),
        'email': analysis.get('email', 'unknown@example.com'),
        'phone': analysis.get('phone'),
        'priority_score': min(100, max(0, analysis.get('priorityScore', 50))),
        'summary': analysis.get('summary', 'No summary available'),
        'key_skills': (analysis.get('keySkills', []) or [])[:10],
        'experience': analysis.get('experience', 'Not specified'),
        'education': analysis.get('education', 'Not specified'),
        'highlights': (analysis.get('highlights', []) or [])[:5],
        'concerns': (analysis.get('concerns', []) or [])[:3],
    }


def analyze_resume(resume_text: str) -> ResumeAnalysis:
    """
    Analyze resume text using Gemini AI.
    
    Args:
        resume_text: Plain text content of the resume
        
    Returns:
        ResumeAnalysis with extracted information
        
    Raises:
        Exception: If analysis fails
    """
    try:
        _configure_genai()
        
        model = genai.GenerativeModel('gemini-2.0-flash')
        response = model.generate_content(RESUME_ANALYSIS_PROMPT + resume_text)
        
        text = response.text or ''
        return _parse_gemini_response(text)
    except json.JSONDecodeError as e:
        raise Exception(f"Failed to parse AI response: {str(e)}")
    except Exception as e:
        raise Exception(f"Failed to analyze resume: {str(e)}")


def analyze_resume_from_file(file_path: str) -> ResumeAnalysis:
    """
    Analyze a resume file using Gemini AI.
    
    Supports PDF, DOC, DOCX, and TXT files.
    
    Args:
        file_path: Path to the resume file
        
    Returns:
        ResumeAnalysis with extracted information
        
    Raises:
        Exception: If analysis fails
    """
    try:
        _configure_genai()
        
        ext = os.path.splitext(file_path)[1].lower()
        
        # For text files, read content directly
        if ext == '.txt':
            with open(file_path, 'r', encoding='utf-8') as f:
                text_content = f.read()
            return analyze_resume(text_content)
        
        # For binary files (PDF, DOC, DOCX), use file upload
        with open(file_path, 'rb') as f:
            file_data = f.read()
        
        # Determine MIME type
        mime_types = {
            '.pdf': 'application/pdf',
            '.doc': 'application/msword',
            '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        }
        mime_type = mime_types.get(ext, 'application/pdf')
        
        print(f"Processing file: {file_path}, mimeType: {mime_type}")
        
        model = genai.GenerativeModel('gemini-2.0-flash')
        
        # Upload the file
        uploaded_file = genai.upload_file(file_path, mime_type=mime_type)
        
        # Generate content with the file
        response = model.generate_content([
            RESUME_ANALYSIS_PROMPT,
            uploaded_file
        ])
        
        text = response.text or ''
        return _parse_gemini_response(text)
        
    except json.JSONDecodeError as e:
        raise Exception(f"Failed to parse AI response: {str(e)}")
    except Exception as e:
        raise Exception(f"Failed to analyze resume file: {str(e)}")


# Job-specific analysis prompt
JOB_MATCH_PROMPT = """You are an expert HR recruiter assistant. Analyze the following resume against the specific job requirements and determine how well the candidate matches the position.

Job Title: {job_title}

Job Requirements:
{job_requirements}

Job Description:
{job_description}

Resume Content:
{resume_content}

Return a JSON object with EXACTLY this structure (no markdown, just raw JSON):
{{
  "jobRelevancyScore": <number 0-100 based on job-specific fit>,
  "jobMatchSummary": "2-3 sentence summary of how well the candidate matches this specific role",
  "skillMatches": ["skill1", "skill2", ...skills from resume that match job requirements],
  "skillGaps": ["skill1", "skill2", ...skills required by job but missing from resume],
  "strengths": ["strength1", "strength2", ...up to 5 specific strengths for this role],
  "recommendations": ["recommendation1", ...up to 3 suggestions for the recruiter]
}}

Scoring guidelines for jobRelevancyScore:
- 90-100: Excellent match - candidate has most required skills and relevant experience
- 70-89: Good match - candidate has many required skills, some gaps fillable with training
- 50-69: Partial match - candidate has some relevant skills but significant gaps
- 30-49: Weak match - limited relevant experience for this specific role
- 0-29: Poor match - candidate's background doesn't align with job requirements
"""


def _parse_job_match_response(text: str) -> JobMatchAnalysis:
    """
    Parse and validate Gemini's job match response.
    
    Args:
        text: Raw text response from Gemini
        
    Returns:
        Validated JobMatchAnalysis dictionary
    """
    # Clean the response - remove markdown code blocks if present
    cleaned_text = text.strip()
    if cleaned_text.startswith('```json'):
        cleaned_text = cleaned_text[7:]
    elif cleaned_text.startswith('```'):
        cleaned_text = cleaned_text[3:]
    if cleaned_text.endswith('```'):
        cleaned_text = cleaned_text[:-3]
    cleaned_text = cleaned_text.strip()
    
    # Parse JSON
    analysis = json.loads(cleaned_text)
    
    # Validate and sanitize the response
    return {
        'job_relevancy_score': min(100, max(0, analysis.get('jobRelevancyScore', 50))),
        'job_match_summary': analysis.get('jobMatchSummary', 'No match summary available'),
        'skill_matches': (analysis.get('skillMatches', []) or [])[:10],
        'skill_gaps': (analysis.get('skillGaps', []) or [])[:10],
        'strengths': (analysis.get('strengths', []) or [])[:5],
        'recommendations': (analysis.get('recommendations', []) or [])[:3],
    }


def analyze_resume_for_job(
    resume_text: str,
    job_title: str,
    job_requirements: str,
    job_description: str = ""
) -> JobMatchAnalysis:
    """
    Analyze a resume against specific job requirements.
    
    Args:
        resume_text: Plain text content of the resume
        job_title: Title of the job position
        job_requirements: Job requirements text
        job_description: Optional job description
        
    Returns:
        JobMatchAnalysis with job-specific match information
        
    Raises:
        Exception: If analysis fails
    """
    try:
        _configure_genai()
        
        prompt = JOB_MATCH_PROMPT.format(
            job_title=job_title,
            job_requirements=job_requirements or "Not specified",
            job_description=job_description or "Not specified",
            resume_content=resume_text
        )
        
        model = genai.GenerativeModel('gemini-2.0-flash')
        response = model.generate_content(prompt)
        
        text = response.text or ''
        return _parse_job_match_response(text)
    except json.JSONDecodeError as e:
        raise Exception(f"Failed to parse AI response: {str(e)}")
    except Exception as e:
        raise Exception(f"Failed to analyze resume for job: {str(e)}")


def analyze_resume_file_for_job(
    file_path: str,
    job_title: str,
    job_requirements: str,
    job_description: str = ""
) -> JobMatchAnalysis:
    """
    Analyze a resume file against specific job requirements.
    
    Args:
        file_path: Path to the resume file
        job_title: Title of the job position
        job_requirements: Job requirements text
        job_description: Optional job description
        
    Returns:
        JobMatchAnalysis with job-specific match information
        
    Raises:
        Exception: If analysis fails
    """
    try:
        _configure_genai()
        
        ext = os.path.splitext(file_path)[1].lower()
        
        # For text files, read content directly
        if ext == '.txt':
            with open(file_path, 'r', encoding='utf-8') as f:
                text_content = f.read()
            return analyze_resume_for_job(
                text_content, job_title, job_requirements, job_description
            )
        
        # For binary files, upload and analyze
        with open(file_path, 'rb') as f:
            file_data = f.read()
        
        mime_types = {
            '.pdf': 'application/pdf',
            '.doc': 'application/msword',
            '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        }
        mime_type = mime_types.get(ext, 'application/pdf')
        
        prompt = JOB_MATCH_PROMPT.format(
            job_title=job_title,
            job_requirements=job_requirements or "Not specified",
            job_description=job_description or "Not specified",
            resume_content="[See attached resume file]"
        )
        
        model = genai.GenerativeModel('gemini-2.0-flash')
        uploaded_file = genai.upload_file(file_path, mime_type=mime_type)
        
        response = model.generate_content([prompt, uploaded_file])
        
        text = response.text or ''
        return _parse_job_match_response(text)
        
    except json.JSONDecodeError as e:
        raise Exception(f"Failed to parse AI response: {str(e)}")
    except Exception as e:
        raise Exception(f"Failed to analyze resume file for job: {str(e)}")

