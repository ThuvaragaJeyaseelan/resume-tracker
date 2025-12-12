"""
URL configuration for job posting endpoints.
"""

from django.urls import path
from .views import (
    JobListCreateView,
    JobDetailView,
    JobStatsView,
    PublicJobListView,
    PublicJobDetailView,
    JobFiltersView,
)
from applicants.views import JobApplicationView, JobApplicantsView

urlpatterns = [
    # Public endpoints (no auth required)
    path('public/', PublicJobListView.as_view(), name='public-job-list'),
    path('public/<uuid:job_id>/', PublicJobDetailView.as_view(), name='public-job-detail'),
    path('filters/', JobFiltersView.as_view(), name='job-filters'),
    
    # Public application endpoint
    path('<uuid:job_id>/apply/', JobApplicationView.as_view(), name='job-apply'),
    
    # Authenticated endpoints
    path('', JobListCreateView.as_view(), name='job-list-create'),
    path('stats/', JobStatsView.as_view(), name='job-stats'),
    path('<uuid:job_id>/', JobDetailView.as_view(), name='job-detail'),
    path('<uuid:job_id>/applicants/', JobApplicantsView.as_view(), name='job-applicants'),
]

