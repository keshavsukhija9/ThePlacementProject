from supabase import create_client, Client
from app.core.config import settings

# Fail fast — if Supabase credentials are wrong, crash at startup, not silently at runtime.
supabase: Client = create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)
