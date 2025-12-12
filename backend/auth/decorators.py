"""
Authentication decorators for view protection.
"""

from functools import wraps
from rest_framework import status
from core.responses import create_error_response


def require_auth(view_func):
    """
    Decorator to require authentication for a view.
    
    Usage:
        @require_auth
        def my_view(request):
            # request.recruiter is available here
            pass
    """
    @wraps(view_func)
    def wrapper(self, request, *args, **kwargs):
        if not hasattr(request, 'recruiter') or request.recruiter is None:
            return create_error_response(
                "Authentication required",
                request,
                error_code="UNAUTHORIZED",
                status_code=status.HTTP_401_UNAUTHORIZED
            )
        return view_func(self, request, *args, **kwargs)
    return wrapper


def require_auth_function(view_func):
    """
    Decorator for function-based views that require authentication.
    
    Usage:
        @api_view(['GET'])
        @require_auth_function
        def my_view(request):
            # request.recruiter is available here
            pass
    """
    @wraps(view_func)
    def wrapper(request, *args, **kwargs):
        if not hasattr(request, 'recruiter') or request.recruiter is None:
            return create_error_response(
                "Authentication required",
                request,
                error_code="UNAUTHORIZED",
                status_code=status.HTTP_401_UNAUTHORIZED
            )
        return view_func(request, *args, **kwargs)
    return wrapper

