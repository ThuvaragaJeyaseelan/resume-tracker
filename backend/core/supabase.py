"""
Supabase client singleton for database and storage operations.
"""

from django.conf import settings
from supabase import create_client, Client
from typing import Optional, BinaryIO
import os

# Singleton instance
_supabase_client: Optional[Client] = None


def get_supabase_client() -> Client:
    """
    Get or create the Supabase client singleton.

    Returns:
        Supabase Client instance

    Raises:
        ValueError: If Supabase credentials are not configured
    """
    global _supabase_client

    if _supabase_client is None:
        url = settings.SUPABASE_URL
        key = settings.SUPABASE_KEY

        if not url or not key:
            raise ValueError(
                "Supabase credentials not configured. "
                "Please set SUPABASE_URL and SUPABASE_KEY environment variables."
            )

        _supabase_client = create_client(url, key)
        print(f"✅ Database connected successfully to Supabase project: {url.split('//')[1].split('.')[0]}")

    return _supabase_client


def reset_supabase_client():
    """Reset the Supabase client singleton (useful for testing)."""
    global _supabase_client
    _supabase_client = None


def upload_file_to_storage(file_obj: BinaryIO, filename: str, bucket_name: str = 'resumes') -> str:
    """
    Upload a file to Supabase Storage.

    Args:
        file_obj: File-like object to upload
        filename: Name to save the file as
        bucket_name: Storage bucket name (default: 'resumes')

    Returns:
        Public URL of the uploaded file

    Raises:
        Exception: If upload fails
    """
    try:
        supabase = get_supabase_client()

        # Read file content
        file_content = file_obj.read()
        
        # Upload file to storage
        response = supabase.storage.from_(bucket_name).upload(
            path=filename,
            file=file_content,
            file_options={"content-type": "application/octet-stream"}
        )

        # The response is a StorageFileAPI response object
        # If it doesn't raise an exception, the upload succeeded
        
        # Get public URL
        public_url = supabase.storage.from_(bucket_name).get_public_url(filename)

        return public_url

    except Exception as e:
        print(f"Error uploading file to Supabase Storage: {e}")
        raise Exception(f"Failed to upload file: {str(e)}")


def get_file_download_url(filename: str, bucket_name: str = 'resumes', expires_in: int = 3600) -> str:
    """
    Generate a signed download URL for a file in Supabase Storage.

    Args:
        filename: Name of the file in storage
        bucket_name: Storage bucket name (default: 'resumes')
        expires_in: URL expiration time in seconds (default: 1 hour)

    Returns:
        Signed download URL

    Raises:
        Exception: If URL generation fails
    """
    try:
        supabase = get_supabase_client()

        # Create signed URL
        signed_url = supabase.storage.from_(bucket_name).create_signed_url(
            path=filename,
            expires_in=expires_in
        )

        return signed_url

    except Exception as e:
        print(f"Error generating download URL: {e}")
        raise Exception(f"Failed to generate download URL: {str(e)}")


def delete_file_from_storage(filename: str, bucket_name: str = 'resumes') -> bool:
    """
    Delete a file from Supabase Storage.

    Args:
        filename: Name of the file to delete
        bucket_name: Storage bucket name (default: 'resumes')

    Returns:
        True if deletion successful, False otherwise
    """
    try:
        supabase = get_supabase_client()

        response = supabase.storage.from_(bucket_name).remove([filename])

        # If no exception was raised, deletion succeeded
        return True

    except Exception as e:
        print(f"Error deleting file from storage: {e}")
        return False

