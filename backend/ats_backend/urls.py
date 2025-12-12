"""
URL configuration for ATS Backend project.
"""

from django.urls import path, include
from rest_framework.decorators import api_view
from rest_framework.response import Response
from datetime import datetime


@api_view(['GET'])
def health_check(request):
    """Health check endpoint."""
    return Response({
        'status': 'ok',
        'timestamp': datetime.utcnow().isoformat() + 'Z'
    })


urlpatterns = [
    path('api/health/', health_check, name='health-check'),
    path('api/applicants/', include('applicants.urls')),
]

