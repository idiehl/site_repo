"""Application configuration via pydantic-settings."""

from functools import lru_cache
from typing import List

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
    )

    # Database
    database_url: str = "postgresql+asyncpg://postgres:postgres@localhost:5432/atlasops"

    # Redis
    redis_url: str = "redis://localhost:6379/0"

    # Security
    secret_key: str = "CHANGE-ME-IN-PRODUCTION"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 30
    refresh_token_expire_days: int = 7

    # CORS
    allowed_origins: List[str] = ["http://localhost:5173", "http://localhost:8000"]

    # OpenAI
    openai_api_key: str = ""
    openai_model: str = "gpt-4o-mini"
    openai_extraction_model: str = "gpt-4o-mini"

    # LinkedIn OAuth
    linkedin_client_id: str = ""
    linkedin_client_secret: str = ""
    linkedin_redirect_uri: str = "http://localhost:8000/api/v1/auth/linkedin/callback"

    # Google OAuth
    google_client_id: str = ""
    google_client_secret: str = ""
    google_redirect_uri: str = "http://localhost:8000/api/v1/auth/google/callback"

    # Billing (Stripe)
    stripe_secret_key: str = ""
    stripe_webhook_secret: str = ""
    stripe_price_id: str = ""
    stripe_success_url: str = "http://localhost:5173/profile?billing=success"
    stripe_cancel_url: str = "http://localhost:5173/profile?billing=cancel"

    # Subscription limits
    free_resume_generation_limit: int = 3
    paid_resume_generation_limit: int = 9999

    # Application
    debug: bool = False
    environment: str = "development"
    frontend_url: str = "http://localhost:5173"


@lru_cache
def get_settings() -> Settings:
    """Get cached settings instance."""
    return Settings()
