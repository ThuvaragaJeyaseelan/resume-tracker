"""
URL routing for applicant API endpoints.
"""

from django.urls import path
from . import views

urlpatterns = [
    # Upload resume with AI analysis
    path('upload', views.ApplicantUploadView.as_view(), name='applicant-upload'),
    
    # List all applicants
    path('', views.ApplicantListView.as_view(), name='applicant-list'),
    
    # Get applicant statistics
    path('stats/', views.ApplicantStatsView.as_view(), name='applicant-stats'),
    
    # Single applicant operations (get, update, delete)
    path('<uuid:applicant_id>/', views.ApplicantDetailView.as_view(), name='applicant-detail'),
    
    # Download resume file
    path('<uuid:applicant_id>/resume/', views.ApplicantResumeDownloadView.as_view(), name='applicant-resume'),
]

