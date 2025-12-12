"""
URL configuration for ATS Backend project.
"""

from django.urls import path, include
from rest_framework.decorators import api_view
from rest_framework.response import Response
from datetime import datetime


@api_view(['GET'])
def api_root(request):
    """API root endpoint with available endpoints."""
    return Response({
        'message': 'ATS Resume Tracker API',
        'version': '1.0.0',
        'endpoints': {
            'health': '/api/health/',
            'applicants': {
                'list': '/api/applicants/',
                'upload': '/api/applicants/upload',
                'stats': '/api/applicants/stats/',
                'detail': '/api/applicants/{id}/',
                'download': '/api/applicants/{id}/resume/',
            }
        },
        'documentation': 'See README.md for complete API documentation',
        'timestamp': datetime.utcnow().isoformat() + 'Z'
    })


@api_view(['GET'])
def health_check(request):
    """Simple health check endpoint."""
    from core.supabase import get_supabase_client
    from core.responses import create_success_response, create_error_response

    try:
        # Test database connection
        supabase = get_supabase_client()
        supabase.table('applicants').select('id').limit(1).execute()

        return create_success_response(
            message="healthy",
            data={'status': 'healthy'},
            request=request
        )
    except Exception:
        return create_error_response(
            message="unhealthy",
            request=request,
            errors=[{'field': 'database', 'message': 'Connection failed', 'code': 'DB_ERROR'}],
            status_code=503
        )


urlpatterns = [
    path('', api_root, name='api-root'),
    path('api/health/', health_check, name='health-check'),
    path('api/applicants/', include('applicants.urls')),
]

