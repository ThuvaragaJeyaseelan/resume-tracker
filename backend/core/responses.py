"""
Standardized response builders following the API response standards.

All responses follow the structure:
{
    "success": bool,
    "message": str,
    "data": any,
    "meta": {
        "timestamp": str (ISO 8601),
        "requestId": str (UUID),
        "pagination": {...} (optional)
    },
    "errors": list | null
}
"""

from datetime import datetime
from typing import Any, Dict, List, Optional
from rest_framework.response import Response
from rest_framework import status


def get_request_id(request) -> str:
    """Safely get request ID from request."""
    return getattr(request, 'request_id', 'unknown')


def create_success_response(
    message: str,
    data: Any,
    request=None,
    pagination: Optional[Dict] = None,
    status_code: int = status.HTTP_200_OK
) -> Response:
    """
    Build standardized success response.

    Args:
        message: Human-readable success message
        data: Response data (any type)
        request: Django request object (for request_id), optional
        pagination: Optional pagination metadata
        status_code: HTTP status code (default 200)

    Returns:
        DRF Response with standardized success structure
    """
    meta = {
        "timestamp": datetime.utcnow().isoformat() + "Z",
        "requestId": get_request_id(request),
    }

    if pagination:
        meta["pagination"] = pagination

    response_data = {
        "success": True,
        "message": message,
        "data": data,
        "meta": meta,
        "errors": None,
    }

    return Response(response_data, status=status_code)


def create_error_response(
    message: str,
    request=None,
    errors: Optional[List[Dict]] = None,
    error_code: Optional[str] = None,
    status_code: int = status.HTTP_400_BAD_REQUEST
) -> Response:
    """
    Build standardized error response.

    Args:
        message: Human-readable error message
        request: Django request object (for request_id), optional
        errors: Optional list of error details
        error_code: Optional machine-readable error code
        status_code: HTTP status code (default 400)

    Returns:
        DRF Response with standardized error structure
    """
    if errors is None:
        errors = []

    # If no detailed errors provided, create one from message
    if not errors and error_code:
        errors = [{"field": None, "message": message, "code": error_code}]
    elif not errors:
        errors = [{"field": None, "message": message, "code": None}]

    response_data = {
        "success": False,
        "message": message,
        "data": None,
        "meta": {
            "timestamp": datetime.utcnow().isoformat() + "Z",
            "requestId": get_request_id(request),
        },
        "errors": errors,
    }

    return Response(response_data, status=status_code)


def create_validation_error_response(
    message: str,
    request=None,
    field_errors: Optional[Dict[str, str]] = None,
    status_code: int = status.HTTP_422_UNPROCESSABLE_ENTITY
) -> Response:
    """
    Build error response for validation failures.

    Args:
        message: Overall error message
        request: Django request object, optional
        field_errors: Dictionary mapping field names to error messages
        status_code: HTTP status code (default 422)

    Returns:
        DRF Response with field-specific errors
    """
    if field_errors is None:
        field_errors = {}

    errors = [
        {"field": field, "message": msg, "code": "VALIDATION_ERROR"}
        for field, msg in field_errors.items()
    ]

    return create_error_response(message, request, errors, status_code=status_code)


def create_paginated_response(
    message: str,
    data: Any,
    request=None,
    page: int = 1,
    limit: int = 10,
    total: int = 0,
) -> Response:
    """
    Build paginated success response.

    Args:
        message: Success message
        data: List of items
        request: Django request object, optional
        page: Current page number
        limit: Items per page
        total: Total number of items

    Returns:
        DRF Response with pagination metadata
    """
    total_pages = (total + limit - 1) // limit if limit > 0 else 0  # Ceiling division

    pagination = {
        "page": page,
        "limit": limit,
        "total": total,
        "totalPages": total_pages,
    }

    return create_success_response(message, data, request, pagination)


def create_not_found_response(
    message: str = "Resource not found",
    request=None,
    error_code: str = "NOT_FOUND"
) -> Response:
    """
    Build 404 not found response.

    Args:
        message: Error message
        request: Django request object, optional
        error_code: Error code (default NOT_FOUND)

    Returns:
        DRF Response with 404 status
    """
    return create_error_response(
        message,
        request,
        error_code=error_code,
        status_code=status.HTTP_404_NOT_FOUND
    )


def create_server_error_response(
    message: str = "Internal server error",
    request=None,
    error_code: str = "INTERNAL_ERROR"
) -> Response:
    """
    Build 500 server error response.

    Args:
        message: Error message
        request: Django request object, optional
        error_code: Error code (default INTERNAL_ERROR)

    Returns:
        DRF Response with 500 status
    """
    return create_error_response(
        message,
        request,
        error_code=error_code,
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR
    )

