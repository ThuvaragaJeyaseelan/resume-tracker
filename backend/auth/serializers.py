"""
Serializers for authentication endpoints.
"""

from rest_framework import serializers


class SignupSerializer(serializers.Serializer):
    """Serializer for recruiter signup."""
    email = serializers.EmailField(required=True)
    password = serializers.CharField(required=True, min_length=8, write_only=True)
    full_name = serializers.CharField(required=True, min_length=2, max_length=100)
    company_name = serializers.CharField(required=False, allow_blank=True, max_length=200)


class LoginSerializer(serializers.Serializer):
    """Serializer for recruiter login."""
    email = serializers.EmailField(required=True)
    password = serializers.CharField(required=True, write_only=True)


class RecruiterUpdateSerializer(serializers.Serializer):
    """Serializer for updating recruiter profile."""
    full_name = serializers.CharField(required=False, min_length=2, max_length=100)
    company_name = serializers.CharField(required=False, allow_blank=True, max_length=200)


class RecruiterResponseSerializer(serializers.Serializer):
    """Serializer for recruiter response data."""
    id = serializers.UUIDField()
    email = serializers.EmailField()
    fullName = serializers.CharField(source='full_name')
    companyName = serializers.CharField(source='company_name', allow_null=True)
    isActive = serializers.BooleanField(source='is_active')
    createdAt = serializers.DateTimeField(source='created_at')
    updatedAt = serializers.DateTimeField(source='updated_at')

