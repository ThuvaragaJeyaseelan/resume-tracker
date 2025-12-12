"""
Job posting service - business logic and Supabase database operations.
"""

from typing import List, Optional, Dict, Any
from core.supabase import get_supabase_client
from .models import JobPostingCreateInput, JobPostingUpdateInput


def _parse_job_posting(data: Dict[str, Any], include_recruiter: bool = False) -> Dict[str, Any]:
    """
    Parse job posting data from Supabase response.
    Converts snake_case to camelCase for API response.
    """
    if not data:
        return None
    
    result = {
        'id': data.get('id'),
        'recruiterId': data.get('recruiter_id'),
        'title': data.get('title'),
        'department': data.get('department'),
        'description': data.get('description'),
        'requirements': data.get('requirements'),
        'location': data.get('location'),
        'employmentType': data.get('employment_type', 'full-time'),
        'salaryRange': data.get('salary_range'),
        'status': data.get('status', 'draft'),
        'createdAt': data.get('created_at'),
        'updatedAt': data.get('updated_at'),
    }
    
    # Include recruiter info if available
    if include_recruiter and 'recruiters' in data and data['recruiters']:
        recruiter = data['recruiters']
        result['recruiter'] = {
            'id': recruiter.get('id'),
            'fullName': recruiter.get('full_name'),
            'companyName': recruiter.get('company_name'),
        }
    
    # Include applicant count if available
    if 'applicant_count' in data:
        result['applicantCount'] = data['applicant_count']
    
    return result


def create_job_posting(input_data: JobPostingCreateInput) -> Dict[str, Any]:
    """
    Create a new job posting.
    
    Args:
        input_data: Job posting creation data
        
    Returns:
        Created job posting data
        
    Raises:
        Exception: If database operation fails
    """
    supabase = get_supabase_client()
    
    insert_data = {
        'recruiter_id': input_data.recruiter_id,
        'title': input_data.title,
        'department': input_data.department,
        'description': input_data.description,
        'requirements': input_data.requirements,
        'location': input_data.location,
        'employment_type': input_data.employment_type,
        'salary_range': input_data.salary_range,
        'status': input_data.status,
    }
    
    # Remove None values
    insert_data = {k: v for k, v in insert_data.items() if v is not None}
    
    result = supabase.table('job_postings').insert(insert_data).execute()
    
    if result.data and len(result.data) > 0:
        return _parse_job_posting(result.data[0])
    
    raise Exception("Failed to create job posting")


def get_jobs_by_recruiter(
    recruiter_id: str,
    status: Optional[str] = None,
    sort_by: str = 'created_at',
    order: str = 'desc'
) -> List[Dict[str, Any]]:
    """
    Get all job postings for a recruiter.
    
    Args:
        recruiter_id: UUID of the recruiter
        status: Optional status filter
        sort_by: Field to sort by
        order: Sort order ('asc' or 'desc')
        
    Returns:
        List of job posting data
    """
    supabase = get_supabase_client()
    
    query = supabase.table('job_postings') \
        .select('*') \
        .eq('recruiter_id', recruiter_id)
    
    if status:
        query = query.eq('status', status)
    
    query = query.order(sort_by, desc=(order == 'desc'))
    
    result = query.execute()
    
    jobs = [_parse_job_posting(item) for item in (result.data or [])]
    
    # Get applicant counts for each job
    for job in jobs:
        count_result = supabase.table('applicants') \
            .select('id', count='exact') \
            .eq('job_posting_id', job['id']) \
            .execute()
        job['applicantCount'] = count_result.count or 0
    
    return jobs


def get_job_by_id(job_id: str, include_recruiter: bool = False) -> Optional[Dict[str, Any]]:
    """
    Get a single job posting by ID.
    
    Args:
        job_id: UUID of the job posting
        include_recruiter: Whether to include recruiter info
        
    Returns:
        Job posting data or None if not found
    """
    supabase = get_supabase_client()
    
    select = '*, recruiters(id, full_name, company_name)' if include_recruiter else '*'
    
    result = supabase.table('job_postings') \
        .select(select) \
        .eq('id', job_id) \
        .execute()
    
    if result.data and len(result.data) > 0:
        job = _parse_job_posting(result.data[0], include_recruiter)
        
        # Get applicant count
        count_result = supabase.table('applicants') \
            .select('id', count='exact') \
            .eq('job_posting_id', job_id) \
            .execute()
        job['applicantCount'] = count_result.count or 0
        
        return job
    
    return None


def update_job_posting(
    job_id: str,
    recruiter_id: str,
    input_data: JobPostingUpdateInput
) -> Dict[str, Any]:
    """
    Update a job posting.
    
    Args:
        job_id: UUID of the job posting
        recruiter_id: UUID of the recruiter (for ownership verification)
        input_data: Fields to update
        
    Returns:
        Updated job posting data
        
    Raises:
        ValueError: If job not found or not owned by recruiter
        Exception: If update fails
    """
    supabase = get_supabase_client()
    
    # Verify ownership
    existing = get_job_by_id(job_id)
    if not existing:
        raise ValueError("Job posting not found")
    if existing['recruiterId'] != recruiter_id:
        raise ValueError("Not authorized to update this job posting")
    
    # Build update data
    update_data = {}
    if input_data.title is not None:
        update_data['title'] = input_data.title
    if input_data.department is not None:
        update_data['department'] = input_data.department
    if input_data.description is not None:
        update_data['description'] = input_data.description
    if input_data.requirements is not None:
        update_data['requirements'] = input_data.requirements
    if input_data.location is not None:
        update_data['location'] = input_data.location
    if input_data.employment_type is not None:
        update_data['employment_type'] = input_data.employment_type
    if input_data.salary_range is not None:
        update_data['salary_range'] = input_data.salary_range
    if input_data.status is not None:
        update_data['status'] = input_data.status
    
    if not update_data:
        return existing
    
    result = supabase.table('job_postings') \
        .update(update_data) \
        .eq('id', job_id) \
        .execute()
    
    if result.data and len(result.data) > 0:
        return get_job_by_id(job_id)
    
    raise Exception("Failed to update job posting")


def delete_job_posting(job_id: str, recruiter_id: str) -> bool:
    """
    Delete a job posting.
    
    Args:
        job_id: UUID of the job posting
        recruiter_id: UUID of the recruiter (for ownership verification)
        
    Returns:
        True if deleted successfully
        
    Raises:
        ValueError: If job not found or not owned by recruiter
    """
    supabase = get_supabase_client()
    
    # Verify ownership
    existing = get_job_by_id(job_id)
    if not existing:
        raise ValueError("Job posting not found")
    if existing['recruiterId'] != recruiter_id:
        raise ValueError("Not authorized to delete this job posting")
    
    # Delete the job (cascade will delete applicants)
    supabase.table('job_postings') \
        .delete() \
        .eq('id', job_id) \
        .execute()
    
    return True


def get_public_jobs(
    search: Optional[str] = None,
    department: Optional[str] = None,
    location: Optional[str] = None,
    employment_type: Optional[str] = None,
    page: int = 1,
    limit: int = 20
) -> Dict[str, Any]:
    """
    Get active job postings for public job board.
    
    Args:
        search: Search query for title/description
        department: Department filter
        location: Location filter
        employment_type: Employment type filter
        page: Page number (1-indexed)
        limit: Items per page
        
    Returns:
        Dict with jobs list and pagination info
    """
    supabase = get_supabase_client()
    
    query = supabase.table('job_postings') \
        .select('*, recruiters(id, full_name, company_name)', count='exact') \
        .eq('status', 'active')
    
    if department:
        query = query.eq('department', department)
    if location:
        query = query.ilike('location', f'%{location}%')
    if employment_type:
        query = query.eq('employment_type', employment_type)
    if search:
        query = query.or_(f'title.ilike.%{search}%,description.ilike.%{search}%')
    
    # Calculate offset
    offset = (page - 1) * limit
    
    query = query.order('created_at', desc=True) \
        .range(offset, offset + limit - 1)
    
    result = query.execute()
    
    jobs = [_parse_job_posting(item, include_recruiter=True) for item in (result.data or [])]
    total = result.count or 0
    
    return {
        'jobs': jobs,
        'pagination': {
            'page': page,
            'limit': limit,
            'total': total,
            'totalPages': (total + limit - 1) // limit if total > 0 else 0,
        }
    }


def get_public_job_by_id(job_id: str) -> Optional[Dict[str, Any]]:
    """
    Get a single active job posting for public view.
    
    Args:
        job_id: UUID of the job posting
        
    Returns:
        Job posting data or None if not found/not active
    """
    supabase = get_supabase_client()
    
    result = supabase.table('job_postings') \
        .select('*, recruiters(id, full_name, company_name)') \
        .eq('id', job_id) \
        .eq('status', 'active') \
        .execute()
    
    if result.data and len(result.data) > 0:
        return _parse_job_posting(result.data[0], include_recruiter=True)
    
    return None


def get_job_stats(recruiter_id: str) -> Dict[str, Any]:
    """
    Get job posting statistics for a recruiter.
    
    Args:
        recruiter_id: UUID of the recruiter
        
    Returns:
        Statistics including total jobs, by status, and applicant count
    """
    supabase = get_supabase_client()
    
    # Get all jobs for this recruiter
    result = supabase.table('job_postings') \
        .select('id, status') \
        .eq('recruiter_id', recruiter_id) \
        .execute()
    
    jobs = result.data or []
    
    # Calculate stats
    total_jobs = len(jobs)
    by_status = {}
    job_ids = []
    
    for job in jobs:
        status = job.get('status', 'draft')
        by_status[status] = by_status.get(status, 0) + 1
        job_ids.append(job['id'])
    
    active_jobs = by_status.get('active', 0)
    
    # Get total applicant count
    total_applicants = 0
    if job_ids:
        for job_id in job_ids:
            count_result = supabase.table('applicants') \
                .select('id', count='exact') \
                .eq('job_posting_id', job_id) \
                .execute()
            total_applicants += count_result.count or 0
    
    return {
        'totalJobs': total_jobs,
        'activeJobs': active_jobs,
        'totalApplicants': total_applicants,
        'byStatus': by_status,
    }


def get_unique_departments() -> List[str]:
    """Get list of unique departments for filtering."""
    supabase = get_supabase_client()
    
    result = supabase.table('job_postings') \
        .select('department') \
        .eq('status', 'active') \
        .execute()
    
    departments = set()
    for item in (result.data or []):
        if item.get('department'):
            departments.add(item['department'])
    
    return sorted(list(departments))


def get_unique_locations() -> List[str]:
    """Get list of unique locations for filtering."""
    supabase = get_supabase_client()
    
    result = supabase.table('job_postings') \
        .select('location') \
        .eq('status', 'active') \
        .execute()
    
    locations = set()
    for item in (result.data or []):
        if item.get('location'):
            locations.add(item['location'])
    
    return sorted(list(locations))

