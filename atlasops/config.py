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

    # Scraping Services
    scrapingbee_api_key: str = ""  # Sign up at https://www.scrapingbee.com/

    # Application
    debug: bool = False
    environment: str = "development"
    frontend_url: str = "http://localhost:5173"


@lru_cache
def get_settings() -> Settings:
    """Get cached settings instance."""
    return Settings()
