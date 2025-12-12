"""
Authentication service - business logic and Supabase database operations.
"""

import bcrypt
import jwt
from datetime import datetime, timedelta, timezone
from typing import Dict, Any, Optional, Tuple
from django.conf import settings
from core.supabase import get_supabase_client
from .models import (
    Recruiter,
    RecruiterSignupInput,
    RecruiterLoginInput,
    RecruiterUpdateInput,
)


# JWT Configuration
JWT_SECRET = getattr(settings, 'JWT_SECRET', settings.SECRET_KEY)
JWT_ALGORITHM = 'HS256'
JWT_EXPIRATION_HOURS = 24


def _hash_password(password: str) -> str:
    """Hash a password using bcrypt."""
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(password.encode('utf-8'), salt).decode('utf-8')


def _verify_password(password: str, password_hash: str) -> bool:
    """Verify a password against its hash."""
    return bcrypt.checkpw(password.encode('utf-8'), password_hash.encode('utf-8'))


def _generate_token(recruiter_id: str, email: str) -> str:
    """Generate a JWT token for a recruiter."""
    now = datetime.now(timezone.utc)
    payload = {
        'recruiter_id': recruiter_id,
        'email': email,
        'iat': int(now.timestamp()),
        'exp': int((now + timedelta(hours=JWT_EXPIRATION_HOURS)).timestamp()),
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)


def verify_token(token: str) -> Optional[Dict[str, Any]]:
    """
    Verify a JWT token and return its payload.
    
    Args:
        token: JWT token string
        
    Returns:
        Token payload dict or None if invalid
    """
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None


def _parse_recruiter(data: Dict[str, Any]) -> Dict[str, Any]:
    """Parse recruiter data from Supabase response."""
    if not data:
        return None
    
    return {
        'id': data.get('id'),
        'email': data.get('email'),
        'fullName': data.get('full_name'),
        'companyName': data.get('company_name'),
        'isActive': data.get('is_active', True),
        'createdAt': data.get('created_at'),
        'updatedAt': data.get('updated_at'),
    }


def get_recruiter_by_email(email: str) -> Optional[Dict[str, Any]]:
    """
    Get a recruiter by email.
    
    Args:
        email: Recruiter email address
        
    Returns:
        Recruiter data or None if not found
    """
    supabase = get_supabase_client()
    
    result = supabase.table('recruiters') \
        .select('*') \
        .eq('email', email.lower()) \
        .execute()
    
    if result.data and len(result.data) > 0:
        return result.data[0]  # Return raw data for password check
    
    return None


def get_recruiter_by_id(recruiter_id: str) -> Optional[Dict[str, Any]]:
    """
    Get a recruiter by ID.
    
    Args:
        recruiter_id: Recruiter UUID
        
    Returns:
        Recruiter data or None if not found
    """
    supabase = get_supabase_client()
    
    result = supabase.table('recruiters') \
        .select('*') \
        .eq('id', recruiter_id) \
        .execute()
    
    if result.data and len(result.data) > 0:
        return _parse_recruiter(result.data[0])
    
    return None


def signup(input_data: RecruiterSignupInput) -> Tuple[Dict[str, Any], str]:
    """
    Create a new recruiter account.
    
    Args:
        input_data: Signup data
        
    Returns:
        Tuple of (recruiter data, JWT token)
        
    Raises:
        ValueError: If email already exists
        Exception: If database operation fails
    """
    supabase = get_supabase_client()
    email = input_data.email.lower().strip()
    
    # Check if email already exists
    existing = get_recruiter_by_email(email)
    if existing:
        raise ValueError("Email already registered")
    
    # Validate password
    if len(input_data.password) < 8:
        raise ValueError("Password must be at least 8 characters")
    
    # Hash password
    password_hash = _hash_password(input_data.password)
    
    # Insert recruiter
    insert_data = {
        'email': email,
        'password_hash': password_hash,
        'full_name': input_data.full_name.strip(),
        'company_name': input_data.company_name.strip() if input_data.company_name else None,
        'is_active': True,
    }
    
    result = supabase.table('recruiters').insert(insert_data).execute()
    
    if result.data and len(result.data) > 0:
        recruiter = _parse_recruiter(result.data[0])
        token = _generate_token(recruiter['id'], recruiter['email'])
        return recruiter, token
    
    raise Exception("Failed to create recruiter account")


def login(input_data: RecruiterLoginInput) -> Tuple[Dict[str, Any], str]:
    """
    Authenticate a recruiter and return a token.
    
    Args:
        input_data: Login credentials
        
    Returns:
        Tuple of (recruiter data, JWT token)
        
    Raises:
        ValueError: If credentials are invalid
    """
    email = input_data.email.lower().strip()
    
    # Get recruiter by email
    recruiter_raw = get_recruiter_by_email(email)
    if not recruiter_raw:
        raise ValueError("Invalid email or password")
    
    # Check if account is active
    if not recruiter_raw.get('is_active', True):
        raise ValueError("Account is deactivated")
    
    # Verify password
    if not _verify_password(input_data.password, recruiter_raw['password_hash']):
        raise ValueError("Invalid email or password")
    
    # Parse and return recruiter with token
    recruiter = _parse_recruiter(recruiter_raw)
    token = _generate_token(recruiter['id'], recruiter['email'])
    
    return recruiter, token


def update_recruiter(
    recruiter_id: str,
    input_data: RecruiterUpdateInput
) -> Dict[str, Any]:
    """
    Update a recruiter's profile.
    
    Args:
        recruiter_id: UUID of the recruiter
        input_data: Fields to update
        
    Returns:
        Updated recruiter data
        
    Raises:
        Exception: If update fails
    """
    supabase = get_supabase_client()
    
    update_data = {}
    if input_data.full_name is not None:
        update_data['full_name'] = input_data.full_name.strip()
    if input_data.company_name is not None:
        update_data['company_name'] = input_data.company_name.strip() if input_data.company_name else None
    
    if not update_data:
        return get_recruiter_by_id(recruiter_id)
    
    result = supabase.table('recruiters') \
        .update(update_data) \
        .eq('id', recruiter_id) \
        .execute()
    
    if result.data and len(result.data) > 0:
        return _parse_recruiter(result.data[0])
    
    raise Exception("Failed to update recruiter profile")


def refresh_token(recruiter_id: str) -> Optional[str]:
    """
    Generate a new token for a recruiter.
    
    Args:
        recruiter_id: UUID of the recruiter
        
    Returns:
        New JWT token or None if recruiter not found
    """
    recruiter = get_recruiter_by_id(recruiter_id)
    if not recruiter:
        return None
    
    return _generate_token(recruiter['id'], recruiter['email'])

