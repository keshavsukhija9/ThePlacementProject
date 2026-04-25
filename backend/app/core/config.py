from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    # Supabase — REQUIRED
    SUPABASE_URL: str
    SUPABASE_KEY: str  # Service Role key

    # Stripe — REQUIRED for payment
    STRIPE_SECRET_KEY: str = "sk_test_placeholder"
    STRIPE_WEBHOOK_SECRET: str = "whsec_placeholder"
    STRIPE_PRICE_ID: str = "price_placeholder"

    # Telegram — optional for reminders
    TELEGRAM_BOT_TOKEN: str = ""

    # App
    FRONTEND_URL: str = "http://localhost:3000"
    ENVIRONMENT: str = "development"
    CRON_SECRET: str = "change-me"


settings = Settings()
