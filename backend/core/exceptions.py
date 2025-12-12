"""
Custom exception handlers for Django REST Framework.
"""

from datetime import datetime
from rest_framework.views import exception_handler
from rest_framework.response import Response
from rest_framework import status


def custom_exception_handler(exc, context):
    """
    Custom exception handler that returns standardized error responses.
    """
    # Call REST framework's default exception handler first
    response = exception_handler(exc, context)
    
    # Get request ID from request context
    request = context.get('request')
    request_id = getattr(request, 'request_id', 'unknown') if request else 'unknown'
    
    if response is not None:
        # Get the original error message
        if hasattr(exc, 'detail'):
            if isinstance(exc.detail, dict):
                # Validation errors from serializers
                errors = []
                for field, messages in exc.detail.items():
                    if isinstance(messages, list):
                        for msg in messages:
                            errors.append({
                                "field": field if field != 'non_field_errors' else None,
                                "message": str(msg),
                                "code": "VALIDATION_ERROR"
                            })
                    else:
                        errors.append({
                            "field": field if field != 'non_field_errors' else None,
                            "message": str(messages),
                            "code": "VALIDATION_ERROR"
                        })
                message = "Validation failed"
            elif isinstance(exc.detail, list):
                errors = [{"field": None, "message": str(e), "code": None} for e in exc.detail]
                message = str(exc.detail[0]) if exc.detail else "Error occurred"
            else:
                message = str(exc.detail)
                errors = [{"field": None, "message": message, "code": None}]
        else:
            message = str(exc)
            errors = [{"field": None, "message": message, "code": None}]
        
        # Build standardized error response
        error_response = {
            "success": False,
            "message": message,
            "data": None,
            "meta": {
                "timestamp": datetime.utcnow().isoformat() + "Z",
                "requestId": request_id,
            },
            "errors": errors,
        }
        
        response.data = error_response
    else:
        # Handle unexpected exceptions
        error_response = {
            "success": False,
            "message": "Internal server error",
            "data": None,
            "meta": {
                "timestamp": datetime.utcnow().isoformat() + "Z",
                "requestId": request_id,
            },
            "errors": [{"field": None, "message": str(exc), "code": "INTERNAL_ERROR"}],
        }
        
        response = Response(error_response, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    return response


class APIException(Exception):
    """Base exception for API errors."""
    
    def __init__(self, message: str, code: str = None, status_code: int = 400):
        self.message = message
        self.code = code
        self.status_code = status_code
        super().__init__(message)


class NotFoundError(APIException):
    """Exception for 404 Not Found errors."""
    
    def __init__(self, message: str = "Resource not found"):
        super().__init__(message, "NOT_FOUND", 404)


class ValidationError(APIException):
    """Exception for validation errors."""
    
    def __init__(self, message: str = "Validation failed", field_errors: dict = None):
        super().__init__(message, "VALIDATION_ERROR", 422)
        self.field_errors = field_errors or {}

