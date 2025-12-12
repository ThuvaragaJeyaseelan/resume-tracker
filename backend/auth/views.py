"""
API views for authentication.
"""

from rest_framework.views import APIView
from rest_framework import status

from core.responses import (
    create_success_response,
    create_error_response,
    create_server_error_response,
)
from . import services
from .models import RecruiterSignupInput, RecruiterLoginInput, RecruiterUpdateInput
from .serializers import SignupSerializer, LoginSerializer, RecruiterUpdateSerializer
from .decorators import require_auth


class SignupView(APIView):
    """Handle recruiter registration."""
    
    def post(self, request):
        """
        Create a new recruiter account.
        
        POST /api/auth/signup
        """
        try:
            # Validate input
            serializer = SignupSerializer(data=request.data)
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
            
            # Create recruiter
            input_data = RecruiterSignupInput(
                email=serializer.validated_data['email'],
                password=serializer.validated_data['password'],
                full_name=serializer.validated_data['full_name'],
                company_name=serializer.validated_data.get('company_name'),
            )
            
            recruiter, token = services.signup(input_data)
            
            return create_success_response(
                "Account created successfully",
                {
                    "recruiter": recruiter,
                    "token": token,
                },
                request,
                status_code=status.HTTP_201_CREATED
            )
            
        except ValueError as e:
            return create_error_response(
                str(e),
                request,
                error_code="SIGNUP_ERROR",
                status_code=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            print(f"Error during signup: {e}")
            return create_server_error_response(
                "Failed to create account",
                request
            )


class LoginView(APIView):
    """Handle recruiter login."""
    
    def post(self, request):
        """
        Authenticate a recruiter.
        
        POST /api/auth/login
        """
        try:
            # Validate input
            serializer = LoginSerializer(data=request.data)
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
            
            # Authenticate
            input_data = RecruiterLoginInput(
                email=serializer.validated_data['email'],
                password=serializer.validated_data['password'],
            )
            
            recruiter, token = services.login(input_data)
            
            return create_success_response(
                "Login successful",
                {
                    "recruiter": recruiter,
                    "token": token,
                },
                request
            )
            
        except ValueError as e:
            return create_error_response(
                str(e),
                request,
                error_code="LOGIN_ERROR",
                status_code=status.HTTP_401_UNAUTHORIZED
            )
        except Exception as e:
            print(f"Error during login: {e}")
            return create_server_error_response(
                "Failed to authenticate",
                request
            )


class ProfileView(APIView):
    """Handle recruiter profile operations."""
    
    @require_auth
    def get(self, request):
        """
        Get current recruiter profile.
        
        GET /api/auth/profile
        """
        try:
            return create_success_response(
                "Profile retrieved successfully",
                {"recruiter": request.recruiter},
                request
            )
        except Exception as e:
            print(f"Error getting profile: {e}")
            return create_server_error_response(
                "Failed to get profile",
                request
            )
    
    @require_auth
    def patch(self, request):
        """
        Update current recruiter profile.
        
        PATCH /api/auth/profile
        """
        try:
            # Validate input
            serializer = RecruiterUpdateSerializer(data=request.data)
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
            
            # Update profile
            input_data = RecruiterUpdateInput(
                full_name=serializer.validated_data.get('full_name'),
                company_name=serializer.validated_data.get('company_name'),
            )
            
            recruiter = services.update_recruiter(request.recruiter_id, input_data)
            
            return create_success_response(
                "Profile updated successfully",
                {"recruiter": recruiter},
                request
            )
            
        except Exception as e:
            print(f"Error updating profile: {e}")
            return create_server_error_response(
                "Failed to update profile",
                request
            )


class RefreshTokenView(APIView):
    """Handle token refresh."""
    
    @require_auth
    def post(self, request):
        """
        Refresh the JWT token.
        
        POST /api/auth/refresh
        """
        try:
            token = services.refresh_token(request.recruiter_id)
            
            if not token:
                return create_error_response(
                    "Failed to refresh token",
                    request,
                    error_code="REFRESH_ERROR",
                    status_code=status.HTTP_401_UNAUTHORIZED
                )
            
            return create_success_response(
                "Token refreshed successfully",
                {"token": token},
                request
            )
            
        except Exception as e:
            print(f"Error refreshing token: {e}")
            return create_server_error_response(
                "Failed to refresh token",
                request
            )

