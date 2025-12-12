"""
API views for applicant management.
"""

import os
import uuid
import tempfile
from django.conf import settings
from django.http import FileResponse, Http404, HttpResponseRedirect
from rest_framework.views import APIView
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework import status

from core.responses import (
    create_success_response,
    create_error_response,
    create_not_found_response,
    create_server_error_response,
)
from core.supabase import upload_file_to_storage, get_file_download_url
from . import services
from .models import ApplicantCreateInput, ApplicantUpdateInput
from .ai_service import analyze_resume_from_file, analyze_resume_file_for_job
from auth.decorators import require_auth
from jobs import services as job_services
from .serializers import ApplicantUpdateSerializer


class ApplicantUploadView(APIView):
    """Handle resume uploads with AI analysis."""
    parser_classes = [MultiPartParser, FormParser]
    
    def post(self, request):
        """
        Upload a resume and create an applicant with AI analysis.
        
        POST /api/applicants/upload
        """
        try:
            # Check if file was uploaded
            if 'resume' not in request.FILES:
                return create_error_response(
                    "No file uploaded",
                    request,
                    error_code="NO_FILE",
                    status_code=status.HTTP_400_BAD_REQUEST
                )
            
            uploaded_file = request.FILES['resume']
            
            # Validate file size
            if uploaded_file.size > settings.MAX_UPLOAD_SIZE:
                return create_error_response(
                    f"File too large. Maximum size is {settings.MAX_UPLOAD_SIZE / (1024 * 1024):.0f}MB",
                    request,
                    error_code="FILE_TOO_LARGE",
                    status_code=status.HTTP_400_BAD_REQUEST
                )
            
            # Validate file type
            if uploaded_file.content_type not in settings.ALLOWED_UPLOAD_TYPES:
                return create_error_response(
                    "Invalid file type. Only PDF, DOC, DOCX, and TXT files are allowed.",
                    request,
                    error_code="INVALID_FILE_TYPE",
                    status_code=status.HTTP_400_BAD_REQUEST
                )
            
            # Generate unique filename
            ext = os.path.splitext(uploaded_file.name)[1]
            unique_filename = f"{uuid.uuid4()}{ext}"
            
            # Save file temporarily for AI analysis
            temp_file_path = None
            try:
                # Create temporary file for AI processing
                with tempfile.NamedTemporaryFile(delete=False, suffix=ext) as temp_file:
                    for chunk in uploaded_file.chunks():
                        temp_file.write(chunk)
                    temp_file_path = temp_file.name
                
                # Analyze resume with AI (from temporary file)
                analysis = analyze_resume_from_file(temp_file_path)
                
                # Upload file to Supabase Storage
                with open(temp_file_path, 'rb') as f:
                    storage_url = upload_file_to_storage(f, unique_filename)
                
                # Create applicant record with storage URL
                input_data = ApplicantCreateInput(
                    name=analysis['name'],
                    email=analysis['email'],
                    phone=analysis.get('phone'),
                    resume_file_path=storage_url,  # Store Supabase URL
                    priority_score=analysis['priority_score'],
                    summary=analysis['summary'],
                    key_skills=analysis['key_skills'],
                    experience=analysis['experience'],
                    education=analysis['education'],
                    highlights=analysis['highlights'],
                    concerns=analysis['concerns'],
                )
                
                applicant = services.create_applicant(input_data)
                
                return create_success_response(
                    "Resume uploaded and analyzed successfully",
                    {"applicant": applicant},
                    request,
                    status_code=status.HTTP_201_CREATED
                )
                
            finally:
                # Clean up temporary file
                if temp_file_path and os.path.exists(temp_file_path):
                    os.remove(temp_file_path)
                
        except Exception as e:
            print(f"Error uploading resume: {e}")
            return create_server_error_response(
                f"Failed to process resume: {str(e)}",
                request
            )


class JobApplicationView(APIView):
    """Handle public job applications."""
    parser_classes = [MultiPartParser, FormParser]
    
    def post(self, request, job_id):
        """
        Submit a job application (public endpoint).
        
        POST /api/jobs/{job_id}/apply/
        """
        try:
            # Verify job exists and is active
            job = job_services.get_public_job_by_id(str(job_id))
            if not job:
                return create_not_found_response(
                    "Job posting not found or not accepting applications",
                    request
                )
            
            # Validate required fields
            name = request.data.get('name', '').strip()
            email = request.data.get('email', '').strip()
            phone = request.data.get('phone', '').strip()
            
            if not name:
                return create_error_response(
                    "Name is required",
                    request,
                    error_code="VALIDATION_ERROR",
                    status_code=status.HTTP_400_BAD_REQUEST
                )
            
            if not email:
                return create_error_response(
                    "Email is required",
                    request,
                    error_code="VALIDATION_ERROR",
                    status_code=status.HTTP_400_BAD_REQUEST
                )
            
            if not phone:
                return create_error_response(
                    "Phone is required",
                    request,
                    error_code="VALIDATION_ERROR",
                    status_code=status.HTTP_400_BAD_REQUEST
                )
            
            # Check if file was uploaded
            if 'resume' not in request.FILES:
                return create_error_response(
                    "Resume file is required",
                    request,
                    error_code="NO_FILE",
                    status_code=status.HTTP_400_BAD_REQUEST
                )
            
            uploaded_file = request.FILES['resume']
            
            # Validate file size
            if uploaded_file.size > settings.MAX_UPLOAD_SIZE:
                return create_error_response(
                    f"File too large. Maximum size is {settings.MAX_UPLOAD_SIZE / (1024 * 1024):.0f}MB",
                    request,
                    error_code="FILE_TOO_LARGE",
                    status_code=status.HTTP_400_BAD_REQUEST
                )
            
            # Validate file type
            if uploaded_file.content_type not in settings.ALLOWED_UPLOAD_TYPES:
                return create_error_response(
                    "Invalid file type. Only PDF, DOC, DOCX, and TXT files are allowed.",
                    request,
                    error_code="INVALID_FILE_TYPE",
                    status_code=status.HTTP_400_BAD_REQUEST
                )
            
            # Generate unique filename
            ext = os.path.splitext(uploaded_file.name)[1]
            unique_filename = f"{uuid.uuid4()}{ext}"
            
            # Save file temporarily for AI analysis
            temp_file_path = None
            try:
                # Create temporary file for AI processing
                with tempfile.NamedTemporaryFile(delete=False, suffix=ext) as temp_file:
                    for chunk in uploaded_file.chunks():
                        temp_file.write(chunk)
                    temp_file_path = temp_file.name
                
                # Perform general resume analysis
                general_analysis = analyze_resume_from_file(temp_file_path)
                
                # Perform job-specific analysis
                job_analysis = analyze_resume_file_for_job(
                    temp_file_path,
                    job_title=job.get('title', ''),
                    job_requirements=job.get('requirements', ''),
                    job_description=job.get('description', '')
                )
                
                # Upload file to Supabase Storage
                with open(temp_file_path, 'rb') as f:
                    storage_url = upload_file_to_storage(f, unique_filename)
                
                # Create applicant record with storage URL
                input_data = ApplicantCreateInput(
                    name=name,
                    email=email,
                    phone=phone,
                    resume_file_path=storage_url,  # Store Supabase URL
                    # General analysis
                    priority_score=general_analysis['priority_score'],
                    summary=general_analysis['summary'],
                    key_skills=general_analysis['key_skills'],
                    experience=general_analysis['experience'],
                    education=general_analysis['education'],
                    highlights=general_analysis['highlights'],
                    concerns=general_analysis['concerns'],
                    # Job-specific analysis
                    job_posting_id=str(job_id),
                    job_relevancy_score=job_analysis['job_relevancy_score'],
                    job_match_summary=job_analysis['job_match_summary'],
                    skill_matches=job_analysis['skill_matches'],
                    skill_gaps=job_analysis['skill_gaps'],
                )
                
                applicant = services.create_applicant(input_data)
                
                return create_success_response(
                    "Application submitted successfully",
                    {
                        "applicationId": applicant['id'],
                        "message": "Thank you for applying! We will review your application and get back to you."
                    },
                    request,
                    status_code=status.HTTP_201_CREATED
                )
                
            finally:
                # Clean up temporary file
                if temp_file_path and os.path.exists(temp_file_path):
                    os.remove(temp_file_path)
                
        except Exception as e:
            print(f"Error submitting application: {e}")
            return create_server_error_response(
                f"Failed to submit application: {str(e)}",
                request
            )


class JobApplicantsView(APIView):
    """List applicants for a specific job posting."""
    
    @require_auth
    def get(self, request, job_id):
        """
        Get all applicants for a job posting.
        
        GET /api/jobs/{job_id}/applicants/?sortBy=jobRelevancyScore&order=desc&status=new
        """
        try:
            # Verify job exists and belongs to recruiter
            job = job_services.get_job_by_id(str(job_id))
            if not job:
                return create_not_found_response(
                    "Job posting not found",
                    request
                )
            
            if job['recruiterId'] != request.recruiter_id:
                return create_error_response(
                    "Not authorized to view applicants for this job",
                    request,
                    error_code="FORBIDDEN",
                    status_code=status.HTTP_403_FORBIDDEN
                )
            
            sort_by = request.query_params.get('sortBy', 'jobRelevancyScore')
            order = request.query_params.get('order', 'desc')
            status_filter = request.query_params.get('status')
            
            applicants = services.get_applicants_by_job(
                str(job_id),
                sort_by=sort_by,
                order=order,
                status=status_filter
            )
            
            stats = services.get_job_applicant_stats(str(job_id))
            
            return create_success_response(
                "Applicants retrieved successfully",
                {
                    "applicants": applicants,
                    "stats": stats,
                    "job": job,
                },
                request
            )
            
        except Exception as e:
            print(f"Error fetching job applicants: {e}")
            return create_server_error_response(
                "Failed to fetch applicants",
                request
            )


class ApplicantListView(APIView):
    """List all applicants with filtering and sorting."""
    
    @require_auth
    def get(self, request):
        """
        Get all applicants.
        
        GET /api/applicants/?sortBy=priorityScore&order=desc&status=new
        """
        try:
            sort_by = request.query_params.get('sortBy', 'priorityScore')
            order = request.query_params.get('order', 'desc')
            status_filter = request.query_params.get('status')
            
            applicants = services.get_all_applicants(sort_by, order, status_filter)
            
            return create_success_response(
                "Applicants retrieved successfully",
                {"applicants": applicants},
                request
            )
            
        except Exception as e:
            print(f"Error fetching applicants: {e}")
            return create_server_error_response(
                "Failed to fetch applicants",
                request
            )


class ApplicantStatsView(APIView):
    """Get applicant statistics."""
    
    @require_auth
    def get(self, request):
        """
        Get aggregated statistics.
        
        GET /api/applicants/stats/
        """
        try:
            stats = services.get_applicant_stats()
            
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


class ApplicantDetailView(APIView):
    """Get, update, or delete a single applicant."""
    
    @require_auth
    def get(self, request, applicant_id):
        """
        Get a single applicant by ID.
        
        GET /api/applicants/{id}/
        """
        try:
            applicant = services.get_applicant_by_id(str(applicant_id))
            
            if not applicant:
                return create_not_found_response(
                    "Applicant not found",
                    request
                )
            
            return create_success_response(
                "Applicant retrieved successfully",
                {"applicant": applicant},
                request
            )
            
        except Exception as e:
            print(f"Error fetching applicant: {e}")
            return create_server_error_response(
                "Failed to fetch applicant",
                request
            )
    
    @require_auth
    def patch(self, request, applicant_id):
        """
        Update an applicant's status or notes.
        
        PATCH /api/applicants/{id}/
        """
        try:
            # Validate input
            serializer = ApplicantUpdateSerializer(data=request.data)
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
            
            # Check if applicant exists
            existing = services.get_applicant_by_id(str(applicant_id))
            if not existing:
                return create_not_found_response(
                    "Applicant not found",
                    request
                )
            
            # Update applicant
            input_data = ApplicantUpdateInput(
                status=serializer.validated_data.get('status'),
                notes=serializer.validated_data.get('notes'),
                priority_score=serializer.validated_data.get('priority_score'),
            )
            
            applicant = services.update_applicant(str(applicant_id), input_data)
            
            return create_success_response(
                "Applicant updated successfully",
                {"applicant": applicant},
                request
            )
            
        except Exception as e:
            print(f"Error updating applicant: {e}")
            return create_server_error_response(
                "Failed to update applicant",
                request
            )
    
    @require_auth
    def delete(self, request, applicant_id):
        """
        Delete an applicant and their resume file.
        
        DELETE /api/applicants/{id}/
        """
        try:
            # Get applicant to find file path
            applicant = services.get_applicant_by_id(str(applicant_id))
            
            if not applicant:
                return create_not_found_response(
                    "Applicant not found",
                    request
                )
            
            # Delete the file
            file_path = applicant.get('resumeFilePath')
            if file_path and os.path.exists(file_path):
                os.remove(file_path)
            
            # Delete the record
            services.delete_applicant(str(applicant_id))
            
            return create_success_response(
                "Applicant deleted successfully",
                None,
                request
            )
            
        except Exception as e:
            print(f"Error deleting applicant: {e}")
            return create_server_error_response(
                "Failed to delete applicant",
                request
            )


class ApplicantResumeDownloadView(APIView):
    """Download an applicant's resume file."""
    
    @require_auth
    def get(self, request, applicant_id):
        """
        Download the resume file.
        
        GET /api/applicants/{id}/resume/
        """
        try:
            applicant = services.get_applicant_by_id(str(applicant_id))
            
            if not applicant:
                return create_not_found_response(
                    "Applicant not found",
                    request
                )
            
            storage_url = applicant.get('resumeFilePath')
            
            if not storage_url:
                return create_not_found_response(
                    "Resume file not found",
                    request
                )
            
            # Extract filename from storage URL
            # URL format: https://xxx.supabase.co/storage/v1/object/public/resumes/filename.pdf
            filename = storage_url.split('/')[-1]
            
            # Generate signed download URL (1 hour expiry)
            try:
                signed_url = get_file_download_url(filename, expires_in=3600)
                
                # Redirect to signed URL for download
                return HttpResponseRedirect(signed_url['signedURL'])
                
            except Exception as download_error:
                print(f"Error generating download URL: {download_error}")
                return create_server_error_response(
                    "Failed to generate download link",
                    request
                )
            
        except Exception as e:
            print(f"Error downloading resume: {e}")
            return create_server_error_response(
                "Failed to download resume",
                request
            )

