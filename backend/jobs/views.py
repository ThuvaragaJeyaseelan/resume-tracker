"""
API views for job posting management.
"""

from rest_framework.views import APIView
from rest_framework import status

from core.responses import (
    create_success_response,
    create_error_response,
    create_not_found_response,
    create_server_error_response,
)
from auth.decorators import require_auth
from . import services
from .models import JobPostingCreateInput, JobPostingUpdateInput
from .serializers import JobPostingCreateSerializer, JobPostingUpdateSerializer


class JobListCreateView(APIView):
    """List and create job postings for authenticated recruiters."""
    
    @require_auth
    def get(self, request):
        """
        List all job postings for the authenticated recruiter.
        
        GET /api/jobs/?status=active&sortBy=created_at&order=desc
        """
        try:
            status_filter = request.query_params.get('status')
            sort_by = request.query_params.get('sortBy', 'created_at')
            order = request.query_params.get('order', 'desc')
            
            jobs = services.get_jobs_by_recruiter(
                request.recruiter_id,
                status=status_filter,
                sort_by=sort_by,
                order=order
            )
            
            return create_success_response(
                "Jobs retrieved successfully",
                {"jobs": jobs},
                request
            )
            
        except Exception as e:
            print(f"Error fetching jobs: {e}")
            return create_server_error_response(
                "Failed to fetch jobs",
                request
            )
    
    @require_auth
    def post(self, request):
        """
        Create a new job posting.
        
        POST /api/jobs/
        """
        try:
            # Validate input
            serializer = JobPostingCreateSerializer(data=request.data)
            if not serializer.is_valid():
                return create_error_response(
                    "Validation failed",
                    request,
                    errors=[
                        {"field": field, "message": str(errors[0]), "code": "VALIDATION_ERROR"}
                        for field, errors in serializer.errors.items()
                    ],
                    status_code=status.HTTP_422_UNPROCESSABLE_ENTITY
                )
            
            # Create job posting
            input_data = JobPostingCreateInput(
                recruiter_id=request.recruiter_id,
                title=serializer.validated_data['title'],
                department=serializer.validated_data.get('department'),
                description=serializer.validated_data.get('description'),
                requirements=serializer.validated_data.get('requirements'),
                location=serializer.validated_data.get('location'),
                employment_type=serializer.validated_data.get('employment_type', 'full-time'),
                salary_range=serializer.validated_data.get('salary_range'),
                status=serializer.validated_data.get('status', 'draft'),
            )
            
            job = services.create_job_posting(input_data)
            
            return create_success_response(
                "Job posting created successfully",
                {"job": job},
                request,
                status_code=status.HTTP_201_CREATED
            )
            
        except Exception as e:
            print(f"Error creating job: {e}")
            return create_server_error_response(
                "Failed to create job posting",
                request
            )


class JobDetailView(APIView):
    """Get, update, or delete a single job posting."""
    
    @require_auth
    def get(self, request, job_id):
        """
        Get a single job posting by ID.
        
        GET /api/jobs/{id}/
        """
        try:
            job = services.get_job_by_id(str(job_id))
            
            if not job:
                return create_not_found_response(
                    "Job posting not found",
                    request
                )
            
            # Verify ownership
            if job['recruiterId'] != request.recruiter_id:
                return create_error_response(
                    "Not authorized to view this job posting",
                    request,
                    error_code="FORBIDDEN",
                    status_code=status.HTTP_403_FORBIDDEN
                )
            
            return create_success_response(
                "Job posting retrieved successfully",
                {"job": job},
                request
            )
            
        except Exception as e:
            print(f"Error fetching job: {e}")
            return create_server_error_response(
                "Failed to fetch job posting",
                request
            )
    
    @require_auth
    def patch(self, request, job_id):
        """
        Update a job posting.
        
        PATCH /api/jobs/{id}/
        """
        try:
            # Validate input
            serializer = JobPostingUpdateSerializer(data=request.data)
            if not serializer.is_valid():
                return create_error_response(
                    "Validation failed",
                    request,
                    errors=[
                        {"field": field, "message": str(errors[0]), "code": "VALIDATION_ERROR"}
                        for field, errors in serializer.errors.items()
                    ],
                    status_code=status.HTTP_422_UNPROCESSABLE_ENTITY
                )
            
            # Update job posting
            input_data = JobPostingUpdateInput(
                title=serializer.validated_data.get('title'),
                department=serializer.validated_data.get('department'),
                description=serializer.validated_data.get('description'),
                requirements=serializer.validated_data.get('requirements'),
                location=serializer.validated_data.get('location'),
                employment_type=serializer.validated_data.get('employment_type'),
                salary_range=serializer.validated_data.get('salary_range'),
                status=serializer.validated_data.get('status'),
            )
            
            job = services.update_job_posting(str(job_id), request.recruiter_id, input_data)
            
            return create_success_response(
                "Job posting updated successfully",
                {"job": job},
                request
            )
            
        except ValueError as e:
            return create_error_response(
                str(e),
                request,
                error_code="UPDATE_ERROR",
                status_code=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            print(f"Error updating job: {e}")
            return create_server_error_response(
                "Failed to update job posting",
                request
            )
    
    @require_auth
    def delete(self, request, job_id):
        """
        Delete a job posting.
        
        DELETE /api/jobs/{id}/
        """
        try:
            services.delete_job_posting(str(job_id), request.recruiter_id)
            
            return create_success_response(
                "Job posting deleted successfully",
                None,
                request
            )
            
        except ValueError as e:
            return create_error_response(
                str(e),
                request,
                error_code="DELETE_ERROR",
                status_code=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            print(f"Error deleting job: {e}")
            return create_server_error_response(
                "Failed to delete job posting",
                request
            )


class JobStatsView(APIView):
    """Get job statistics for authenticated recruiter."""
    
    @require_auth
    def get(self, request):
        """
        Get job posting statistics.
        
        GET /api/jobs/stats/
        """
        try:
            stats = services.get_job_stats(request.recruiter_id)
            
            return create_success_response(
                "Statistics retrieved successfully",
                {"stats": stats},
                request
            )
            
        except Exception as e:
            print(f"Error fetching stats: {e}")
            return create_server_error_response(
                "Failed to fetch statistics",
                request
            )


class PublicJobListView(APIView):
    """List active job postings for public job board."""
    
    def get(self, request):
        """
        List all active job postings.
        
        GET /api/jobs/public/?search=developer&department=Engineering&page=1&limit=20
        """
        try:
            search = request.query_params.get('search')
            department = request.query_params.get('department')
            location = request.query_params.get('location')
            employment_type = request.query_params.get('employmentType')
            page = int(request.query_params.get('page', 1))
            limit = int(request.query_params.get('limit', 20))
            
            # Limit page size
            limit = min(limit, 50)
            
            result = services.get_public_jobs(
                search=search,
                department=department,
                location=location,
                employment_type=employment_type,
                page=page,
                limit=limit
            )
            
            return create_success_response(
                "Jobs retrieved successfully",
                result,
                request
            )
            
        except Exception as e:
            print(f"Error fetching public jobs: {e}")
            return create_server_error_response(
                "Failed to fetch jobs",
                request
            )


class PublicJobDetailView(APIView):
    """Get a single active job posting for public view."""
    
    def get(self, request, job_id):
        """
        Get a single active job posting.
        
        GET /api/jobs/public/{id}/
        """
        try:
            job = services.get_public_job_by_id(str(job_id))
            
            if not job:
                return create_not_found_response(
                    "Job posting not found or not active",
                    request
                )
            
            return create_success_response(
                "Job posting retrieved successfully",
                {"job": job},
                request
            )
            
        except Exception as e:
            print(f"Error fetching public job: {e}")
            return create_server_error_response(
                "Failed to fetch job posting",
                request
            )


class JobFiltersView(APIView):
    """Get available filter options for job board."""
    
    def get(self, request):
        """
        Get available filter options.
        
        GET /api/jobs/filters/
        """
        try:
            departments = services.get_unique_departments()
            locations = services.get_unique_locations()
            
            return create_success_response(
                "Filters retrieved successfully",
                {
                    "departments": departments,
                    "locations": locations,
                    "employmentTypes": ['full-time', 'part-time', 'contract', 'internship'],
                },
                request
            )
            
        except Exception as e:
            print(f"Error fetching filters: {e}")
            return create_server_error_response(
                "Failed to fetch filters",
                request
            )

