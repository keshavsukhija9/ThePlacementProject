import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    SUPABASE_URL: str = os.getenv("SUPABASE_URL", "https://mock.supabase.co")
    SUPABASE_KEY: str = os.getenv("SUPABASE_KEY", "mock-key")

settings = Settings()
