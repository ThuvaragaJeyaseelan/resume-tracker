"""
Data models for job postings (using dataclasses, not Django ORM).
"""

from dataclasses import dataclass
from typing import Optional, List
from datetime import datetime


@dataclass
class JobPosting:
    """Job posting model."""
    id: str
    recruiter_id: str
    title: str
    department: Optional[str] = None
    description: Optional[str] = None
    requirements: Optional[str] = None
    location: Optional[str] = None
    employment_type: str = 'full-time'  # full-time, part-time, contract, internship
    salary_range: Optional[str] = None
    status: str = 'draft'  # draft, active, closed
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None


@dataclass
class JobPostingCreateInput:
    """Input data for creating a job posting."""
    recruiter_id: str
    title: str
    department: Optional[str] = None
    description: Optional[str] = None
    requirements: Optional[str] = None
    location: Optional[str] = None
    employment_type: str = 'full-time'
    salary_range: Optional[str] = None
    status: str = 'draft'


@dataclass
class JobPostingUpdateInput:
    """Input data for updating a job posting."""
    title: Optional[str] = None
    department: Optional[str] = None
    description: Optional[str] = None
    requirements: Optional[str] = None
    location: Optional[str] = None
    employment_type: Optional[str] = None
    salary_range: Optional[str] = None
    status: Optional[str] = None


@dataclass
class JobStats:
    """Job posting statistics."""
    total_jobs: int
    active_jobs: int
    total_applicants: int
    by_status: dict

