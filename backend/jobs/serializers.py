"""
Serializers for job posting endpoints.
"""

from rest_framework import serializers


EMPLOYMENT_TYPES = ['full-time', 'part-time', 'contract', 'internship']
JOB_STATUSES = ['draft', 'active', 'closed']


class JobPostingCreateSerializer(serializers.Serializer):
    """Serializer for creating a job posting."""
    title = serializers.CharField(required=True, min_length=3, max_length=200)
    department = serializers.CharField(required=False, allow_blank=True, max_length=100)
    description = serializers.CharField(required=False, allow_blank=True)
    requirements = serializers.CharField(required=False, allow_blank=True)
    location = serializers.CharField(required=False, allow_blank=True, max_length=200)
    employment_type = serializers.ChoiceField(
        choices=EMPLOYMENT_TYPES, 
        default='full-time',
        required=False
    )
    salary_range = serializers.CharField(required=False, allow_blank=True, max_length=100)
    status = serializers.ChoiceField(choices=JOB_STATUSES, default='draft', required=False)


class JobPostingUpdateSerializer(serializers.Serializer):
    """Serializer for updating a job posting."""
    title = serializers.CharField(required=False, min_length=3, max_length=200)
    department = serializers.CharField(required=False, allow_blank=True, max_length=100)
    description = serializers.CharField(required=False, allow_blank=True)
    requirements = serializers.CharField(required=False, allow_blank=True)
    location = serializers.CharField(required=False, allow_blank=True, max_length=200)
    employment_type = serializers.ChoiceField(choices=EMPLOYMENT_TYPES, required=False)
    salary_range = serializers.CharField(required=False, allow_blank=True, max_length=100)
    status = serializers.ChoiceField(choices=JOB_STATUSES, required=False)

