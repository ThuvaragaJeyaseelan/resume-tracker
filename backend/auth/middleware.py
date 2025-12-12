"""
JWT authentication middleware for protected routes.
"""

from django.http import JsonResponse
from django.utils.deprecation import MiddlewareMixin
from .services import verify_token, get_recruiter_by_id


class JWTAuthenticationMiddleware(MiddlewareMixin):
    """
    Middleware to authenticate requests using JWT tokens.
    
    Adds `request.recruiter` for authenticated routes.
    Does not block requests - use the @require_auth decorator for protection.
    """
    
    # Paths that don't require authentication
    PUBLIC_PATHS = [
        '/api/auth/login',
        '/api/auth/signup',
        '/api/jobs/public',
        '/api/health',
        '/',
    ]
    
    def process_request(self, request):
        """Extract and verify JWT token from Authorization header."""
        request.recruiter = None
        request.recruiter_id = None
        
        # Get Authorization header
        auth_header = request.headers.get('Authorization', '')
        
        if not auth_header.startswith('Bearer '):
            return None
        
        token = auth_header[7:]  # Remove 'Bearer ' prefix
        
        if not token:
            return None
        
        # Verify token
        payload = verify_token(token)
        if not payload:
            return None
        
        # Get recruiter from database
        recruiter_id = payload.get('recruiter_id')
        if recruiter_id:
            recruiter = get_recruiter_by_id(recruiter_id)
            if recruiter and recruiter.get('isActive', True):
                request.recruiter = recruiter
                request.recruiter_id = recruiter_id
        
        return None

