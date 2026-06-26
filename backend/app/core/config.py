from __future__ import annotations

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env")

    app_name: str = "NeuroLens AI"
    api_v1_prefix: str = "/api/v1"
    database_url: str = "sqlite:///./neurolens.db"
    test_version: str = "v1.0"
    cors_origins: list[str] = ["http://localhost:5173", "http://localhost:3000"]


settings = Settings()
