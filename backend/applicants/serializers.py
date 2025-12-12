"""
Serializers for applicant API endpoints.
"""

from rest_framework import serializers


class ApplicantUpdateSerializer(serializers.Serializer):
    """Serializer for updating applicant status/notes."""
    status = serializers.CharField(required=False, allow_null=True)
    notes = serializers.CharField(required=False, allow_null=True, allow_blank=True)
    priority_score = serializers.IntegerField(required=False, min_value=0, max_value=100)


class ResumeUploadSerializer(serializers.Serializer):
    """Serializer for resume upload validation."""
    resume = serializers.FileField()
    
    def validate_resume(self, value):
        """Validate the uploaded file."""
        from django.conf import settings
        
        # Check file size
        if value.size > settings.MAX_UPLOAD_SIZE:
            raise serializers.ValidationError(
                f"File too large. Maximum size is {settings.MAX_UPLOAD_SIZE / (1024 * 1024):.0f}MB"
            )
        
        # Check file type
        if value.content_type not in settings.ALLOWED_UPLOAD_TYPES:
            raise serializers.ValidationError(
                "Invalid file type. Only PDF, DOC, DOCX, and TXT files are allowed."
            )
        
        return value

