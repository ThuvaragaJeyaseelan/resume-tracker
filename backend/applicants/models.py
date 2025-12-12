"""
Data models for applicants (using dataclasses, not Django ORM).
"""

from dataclasses import dataclass
from typing import Optional, List
from datetime import datetime


@dataclass
class JobPosting:
    """Job posting model."""
    id: str
    title: str
    department: Optional[str] = None
    description: Optional[str] = None
    requirements: Optional[str] = None
    status: str = 'active'
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None


@dataclass
class Applicant:
    """Applicant model."""
    id: str
    name: str
    email: str
    resume_file_path: str
    phone: Optional[str] = None
    resume_text: Optional[str] = None
    
    # AI Analysis Fields
    priority_score: int = 0
    summary: Optional[str] = None
    key_skills: Optional[List[str]] = None
    experience: Optional[str] = None
    education: Optional[str] = None
    highlights: Optional[List[str]] = None
    concerns: Optional[List[str]] = None
    
    # Status Tracking
    status: str = 'new'
    notes: Optional[str] = None
    
    # Relations
    job_posting_id: Optional[str] = None
    job_posting: Optional[JobPosting] = None
    
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None


@dataclass
class ApplicantStats:
    """Applicant statistics model."""
    total: int
    by_status: dict
    avg_score: float


# Type definitions for input data
@dataclass
class ApplicantCreateInput:
    """Input data for creating an applicant."""
    name: str
    email: str
    resume_file_path: str
    phone: Optional[str] = None
    resume_text: Optional[str] = None
    priority_score: int = 0
    summary: Optional[str] = None
    key_skills: Optional[List[str]] = None
    experience: Optional[str] = None
    education: Optional[str] = None
    highlights: Optional[List[str]] = None
    concerns: Optional[List[str]] = None
    job_posting_id: Optional[str] = None


@dataclass
class ApplicantUpdateInput:
    """Input data for updating an applicant."""
    status: Optional[str] = None
    notes: Optional[str] = None
    priority_score: Optional[int] = None

