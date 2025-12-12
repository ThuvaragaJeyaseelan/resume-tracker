"""
API views for applicant management.
"""

import os
import uuid
from django.conf import settings
from django.http import FileResponse, Http404
from rest_framework.views import APIView
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework import status

from core.responses import (
    create_success_response,
    create_error_response,
    create_not_found_response,
    create_server_error_response,
)
from . import services
from .models import ApplicantCreateInput, ApplicantUpdateInput
from .ai_service import analyze_resume_from_file
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
            file_path = os.path.join(settings.UPLOAD_DIR, unique_filename)
            
            # Save file to disk
            with open(file_path, 'wb') as f:
                for chunk in uploaded_file.chunks():
                    f.write(chunk)
            
            try:
                # Analyze resume with AI
                analysis = analyze_resume_from_file(file_path)
                
                # Create applicant record
                input_data = ApplicantCreateInput(
                    name=analysis['name'],
                    email=analysis['email'],
                    phone=analysis.get('phone'),
                    resume_file_path=file_path,
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
                
            except Exception as e:
                # Clean up file if analysis/creation fails
                if os.path.exists(file_path):
                    os.remove(file_path)
                raise e
                
        except Exception as e:
            print(f"Error uploading resume: {e}")
            return create_server_error_response(
                f"Failed to process resume: {str(e)}",
                request
            )


class ApplicantListView(APIView):
    """List all applicants with filtering and sorting."""
    
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
            
            file_path = applicant.get('resumeFilePath')
            
            if not file_path or not os.path.exists(file_path):
                return create_not_found_response(
                    "Resume file not found",
                    request
                )
            
            # Return file as download
            filename = os.path.basename(file_path)
            response = FileResponse(
                open(file_path, 'rb'),
                as_attachment=True,
                filename=filename
            )
            
            return response
            
        except Exception as e:
            print(f"Error downloading resume: {e}")
            return create_server_error_response(
                "Failed to download resume",
                request
            )

