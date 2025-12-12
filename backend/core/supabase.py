"""
Supabase client singleton for database operations.
"""

from django.conf import settings
from supabase import create_client, Client
from typing import Optional

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

