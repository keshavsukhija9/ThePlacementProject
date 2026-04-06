from supabase import create_client, Client
from app.core.config import settings
import logging

try:
    supabase: Client = create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)
except Exception as e:
    logging.warning(f"Could not initialize Supabase client. Make sure SUPABASE_URL and SUPABASE_KEY are set. Error: {e}")
    supabase = None
