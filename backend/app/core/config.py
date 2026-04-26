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

    # Swipe — REQUIRED for payment (UPI, Cards, Wallets)
    SWIPE_API_KEY: str
    SWIPE_WEBHOOK_SECRET: str

    # Telegram — REQUIRED for reminders
    TELEGRAM_BOT_TOKEN: str

    # SMS Gateway (Twilio or AWS SNS) — REQUIRED for SMS reminders
    SMS_PROVIDER: str = "twilio"  # or "aws_sns"
    TWILIO_ACCOUNT_SID: str = ""
    TWILIO_AUTH_TOKEN: str = ""
    TWILIO_PHONE_NUMBER: str = ""
    AWS_SNS_REGION: str = ""
    AWS_ACCESS_KEY_ID: str = ""
    AWS_SECRET_ACCESS_KEY: str = ""

    # App
    FRONTEND_URL: str = "http://localhost:3000"
    ENVIRONMENT: str = "development"
    CRON_SECRET: str = "change-me-in-production"


settings = Settings()
