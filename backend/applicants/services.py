"""
Applicant service - business logic and Supabase database operations.
"""

from typing import List, Optional, Dict, Any
from core.supabase import get_supabase_client
from .models import Applicant, ApplicantStats, ApplicantCreateInput, ApplicantUpdateInput


def _parse_applicant(data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Parse applicant data from Supabase response.
    Converts snake_case to the format expected by the API.
    """
    if not data:
        return None
    
    # Parse job posting if included
    job_posting = None
    if 'job_postings' in data and data['job_postings']:
        jp = data['job_postings']
        job_posting = {
            'id': jp.get('id'),
            'title': jp.get('title'),
            'department': jp.get('department'),
            'description': jp.get('description'),
            'requirements': jp.get('requirements'),
            'status': jp.get('status'),
            'createdAt': jp.get('created_at'),
            'updatedAt': jp.get('updated_at'),
        }
    
    return {
        'id': data.get('id'),
        'name': data.get('name'),
        'email': data.get('email'),
        'phone': data.get('phone'),
        'resumeFilePath': data.get('resume_file_path'),
        'resumeText': data.get('resume_text'),
        'priorityScore': data.get('priority_score', 0),
        'summary': data.get('summary'),
        'keySkills': data.get('key_skills') or [],
        'experience': data.get('experience'),
        'education': data.get('education'),
        'highlights': data.get('highlights') or [],
        'concerns': data.get('concerns') or [],
        # Job-specific fields
        'jobRelevancyScore': data.get('job_relevancy_score', 0),
        'jobMatchSummary': data.get('job_match_summary'),
        'skillMatches': data.get('skill_matches') or [],
        'skillGaps': data.get('skill_gaps') or [],
        # Status and tracking
        'status': data.get('status', 'new'),
        'notes': data.get('notes'),
        'jobPostingId': data.get('job_posting_id'),
        'jobPosting': job_posting,
        'createdAt': data.get('created_at'),
        'updatedAt': data.get('updated_at'),
    }


def create_applicant(input_data: ApplicantCreateInput) -> Dict[str, Any]:
    """
    Create a new applicant record.
    
    Args:
        input_data: Applicant creation data
        
    Returns:
        Created applicant data
        
    Raises:
        Exception: If database operation fails
    """
    supabase = get_supabase_client()
    
    # Prepare data for insertion
    insert_data = {
        'name': input_data.name,
        'email': input_data.email,
        'phone': input_data.phone,
        'resume_file_path': input_data.resume_file_path,
        'resume_text': input_data.resume_text,
        'priority_score': input_data.priority_score or 0,
        'summary': input_data.summary,
        'key_skills': input_data.key_skills,
        'experience': input_data.experience,
        'education': input_data.education,
        'highlights': input_data.highlights,
        'concerns': input_data.concerns,
        'job_posting_id': input_data.job_posting_id,
        # Job-specific fields
        'job_relevancy_score': input_data.job_relevancy_score or 0,
        'job_match_summary': input_data.job_match_summary,
        'skill_matches': input_data.skill_matches,
        'skill_gaps': input_data.skill_gaps,
    }
    
    # Remove None values
    insert_data = {k: v for k, v in insert_data.items() if v is not None}
    
    result = supabase.table('applicants').insert(insert_data).execute()
    
    if result.data and len(result.data) > 0:
        return _parse_applicant(result.data[0])
    
    raise Exception("Failed to create applicant")


def get_all_applicants(
    sort_by: str = 'priority_score',
    order: str = 'desc',
    status: Optional[str] = None
) -> List[Dict[str, Any]]:
    """
    Get all applicants with optional filtering and sorting.
    
    Args:
        sort_by: Field to sort by ('priority_score' or 'created_at')
        order: Sort order ('asc' or 'desc')
        status: Optional status filter
        
    Returns:
        List of applicant data
    """
    supabase = get_supabase_client()
    
    # Map frontend field names to database field names
    field_map = {
        'priorityScore': 'priority_score',
        'priority_score': 'priority_score',
        'createdAt': 'created_at',
        'created_at': 'created_at',
    }
    
    db_sort_field = field_map.get(sort_by, 'priority_score')
    
    # Build query with job posting join
    query = supabase.table('applicants').select('*, job_postings(*)')
    
    # Apply status filter if provided
    if status:
        query = query.eq('status', status)
    
    # Apply sorting
    query = query.order(db_sort_field, desc=(order == 'desc'))
    
    result = query.execute()
    
    return [_parse_applicant(item) for item in (result.data or [])]


def get_applicant_by_id(applicant_id: str) -> Optional[Dict[str, Any]]:
    """
    Get a single applicant by ID.
    
    Args:
        applicant_id: UUID of the applicant
        
    Returns:
        Applicant data or None if not found
    """
    supabase = get_supabase_client()
    
    result = supabase.table('applicants') \
        .select('*, job_postings(*)') \
        .eq('id', applicant_id) \
        .execute()
    
    if result.data and len(result.data) > 0:
        return _parse_applicant(result.data[0])
    
    return None


def update_applicant(applicant_id: str, input_data: ApplicantUpdateInput) -> Dict[str, Any]:
    """
    Update an applicant record.
    
    Args:
        applicant_id: UUID of the applicant
        input_data: Fields to update
        
    Returns:
        Updated applicant data
        
    Raises:
        Exception: If applicant not found or update fails
    """
    supabase = get_supabase_client()
    
    # Prepare update data
    update_data = {}
    if input_data.status is not None:
        update_data['status'] = input_data.status
    if input_data.notes is not None:
        update_data['notes'] = input_data.notes
    if input_data.priority_score is not None:
        update_data['priority_score'] = input_data.priority_score
    
    if not update_data:
        # No fields to update, just return current data
        return get_applicant_by_id(applicant_id)
    
    result = supabase.table('applicants') \
        .update(update_data) \
        .eq('id', applicant_id) \
        .execute()
    
    if result.data and len(result.data) > 0:
        # Fetch fresh data with job posting
        return get_applicant_by_id(applicant_id)
    
    raise Exception("Failed to update applicant")


def delete_applicant(applicant_id: str) -> bool:
    """
    Delete an applicant record.
    
    Args:
        applicant_id: UUID of the applicant
        
    Returns:
        True if deleted successfully
        
    Raises:
        Exception: If delete fails
    """
    supabase = get_supabase_client()
    
    result = supabase.table('applicants') \
        .delete() \
        .eq('id', applicant_id) \
        .execute()
    
    return True


def get_applicant_stats() -> Dict[str, Any]:
    """
    Get aggregated applicant statistics.
    
    Returns:
        Statistics including total, by_status, and avg_score
    """
    supabase = get_supabase_client()
    
    # Get all applicants for statistics
    result = supabase.table('applicants') \
        .select('id, status, priority_score') \
        .execute()
    
    applicants = result.data or []
    
    # Calculate statistics
    total = len(applicants)
    
    # Group by status
    by_status = {}
    total_score = 0
    
    for applicant in applicants:
        status = applicant.get('status', 'new')
        by_status[status] = by_status.get(status, 0) + 1
        total_score += applicant.get('priority_score', 0)
    
    avg_score = total_score / total if total > 0 else 0
    
    return {
        'total': total,
        'byStatus': by_status,
        'avgScore': round(avg_score, 1),
    }


def get_applicants_by_job(
    job_id: str,
    sort_by: str = 'job_relevancy_score',
    order: str = 'desc',
    status: Optional[str] = None
) -> List[Dict[str, Any]]:
    """
    Get all applicants for a specific job posting.
    
    Args:
        job_id: UUID of the job posting
        sort_by: Field to sort by (default: job_relevancy_score)
        order: Sort order ('asc' or 'desc')
        status: Optional status filter
        
    Returns:
        List of applicant data sorted by relevancy
    """
    supabase = get_supabase_client()
    
    # Map frontend field names to database field names
    field_map = {
        'jobRelevancyScore': 'job_relevancy_score',
        'job_relevancy_score': 'job_relevancy_score',
        'priorityScore': 'priority_score',
        'priority_score': 'priority_score',
        'createdAt': 'created_at',
        'created_at': 'created_at',
    }
    
    db_sort_field = field_map.get(sort_by, 'job_relevancy_score')
    
    query = supabase.table('applicants') \
        .select('*, job_postings(*)') \
        .eq('job_posting_id', job_id)
    
    if status:
        query = query.eq('status', status)
    
    query = query.order(db_sort_field, desc=(order == 'desc'))
    
    result = query.execute()
    
    return [_parse_applicant(item) for item in (result.data or [])]


def get_job_applicant_stats(job_id: str) -> Dict[str, Any]:
    """
    Get applicant statistics for a specific job.
    
    Args:
        job_id: UUID of the job posting
        
    Returns:
        Statistics for the job's applicants
    """
    supabase = get_supabase_client()
    
    result = supabase.table('applicants') \
        .select('id, status, job_relevancy_score') \
        .eq('job_posting_id', job_id) \
        .execute()
    
    applicants = result.data or []
    
    total = len(applicants)
    by_status = {}
    total_score = 0
    high_matches = 0  # Score >= 70
    
    for applicant in applicants:
        status = applicant.get('status', 'new')
        by_status[status] = by_status.get(status, 0) + 1
        score = applicant.get('job_relevancy_score', 0)
        total_score += score
        if score >= 70:
            high_matches += 1
    
    avg_score = total_score / total if total > 0 else 0
    
    return {
        'total': total,
        'byStatus': by_status,
        'avgRelevancyScore': round(avg_score, 1),
        'highMatches': high_matches,
    }

