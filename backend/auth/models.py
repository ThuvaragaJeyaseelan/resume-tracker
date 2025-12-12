"""
Data models for authentication (using dataclasses, not Django ORM).
"""

from dataclasses import dataclass
from typing import Optional
from datetime import datetime


@dataclass
class Recruiter:
    """Recruiter account model."""
    id: str
    email: str
    full_name: str
    company_name: Optional[str] = None
    is_active: bool = True
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None


@dataclass
class RecruiterSignupInput:
    """Input data for recruiter signup."""
    email: str
    password: str
    full_name: str
    company_name: Optional[str] = None


@dataclass
class RecruiterLoginInput:
    """Input data for recruiter login."""
    email: str
    password: str


@dataclass
class RecruiterUpdateInput:
    """Input data for updating recruiter profile."""
    full_name: Optional[str] = None
    company_name: Optional[str] = None


@dataclass
class TokenPayload:
    """JWT token payload."""
    recruiter_id: str
    email: str
    exp: int
    iat: int

