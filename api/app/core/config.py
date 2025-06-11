import json
from functools import lru_cache
from typing import List

from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    # API settings
    PROJECT_NAME: str = "MCP-Linker API"
    API_VERSION: str = "1.0.0"

    # CORS settings
    CORS_ORIGINS: List[str] = []

    @field_validator("CORS_ORIGINS", mode="before")
    @classmethod
    def parse_origins(cls, v):
        if isinstance(v, str):
            return json.loads(v)
        return v

    REDIS_URL: str
    # Database settings
    DATABASE_URL: str
    ECHO: bool = False
    DEV: bool = False

    # Supabase settings
    SUPABASE_JWT_SECRET: str = ""

    model_config = SettingsConfigDict(env_file=".env")


@lru_cache()
def get_settings() -> Settings:
    """
    Create and cache settings instance.
    Uses LRU cache to avoid reading .env file multiple times.
    """
    return Settings()


settings = get_settings()
