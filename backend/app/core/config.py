from __future__ import annotations

from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import field_validator


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    app_name: str = "NeuroLens AI"
    api_v1_prefix: str = "/api/v1"
    
    # Database
    database_url: str = "sqlite:///./neurolens.db"
    
    @field_validator("database_url", mode="before")
    @classmethod
    def fix_db_url(cls, v: str) -> str:
        if not v:
            return v
        if v.startswith("postgres://"):
            v = v.replace("postgres://", "postgresql+pg8000://", 1)
        elif v.startswith("postgresql://"):
            v = v.replace("postgresql://", "postgresql+pg8000://", 1)
        return v
    
    # Auth
    secret_key: str = "09d25e094faa6ca2556c818166b7a9563b93f7099f6f0f4caa6cf63b88e8d3e7" # Default fallback for local dev
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 60 * 24 * 7 # 7 days
    
    # OpenAI GenAI Configuration
    openai_api_key: str | None = None
    
    test_version: str = "v1.0"
    cors_origins: list[str] = ["*"]

settings = Settings()
