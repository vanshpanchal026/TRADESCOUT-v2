from typing import Annotated, Any

from pydantic import BeforeValidator, Field
from pydantic_settings import BaseSettings, SettingsConfigDict


def _parse_cors_origins(v: Any) -> list[str]:
    if isinstance(v, str):
        if v.startswith("[") and v.endswith("]"):
            import json

            try:
                return json.loads(v)
            except Exception:
                pass
        return [origin.strip() for origin in v.split(",") if origin.strip()]
    elif isinstance(v, list):
        return [str(item).strip() for item in v]
    return ["http://localhost:3000"]


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=(".env", "../.env"),
        env_file_encoding="utf-8",
        extra="ignore",
    )

    # Core Application Settings
    PROJECT_NAME: str = Field(default="TRADESCOUT", description="Project name")
    VERSION: str = Field(default="1.0.0", description="Application semantic version")
    DEBUG: bool = Field(default=False, description="Debug mode")
    ENVIRONMENT: str = Field(default="development", description="Execution environment")
    LOG_LEVEL: str = Field(default="INFO", description="Logging level")

    # Network & Security
    API_HOST: str = Field(default="0.0.0.0", description="API host binding")
    API_PORT: int = Field(default=8000, description="API port binding")
    CORS_ORIGINS: Annotated[list[str], BeforeValidator(_parse_cors_origins)] = Field(
        default=["http://localhost:3000"],
        description="Allowed CORS origin URLs",
    )
    SUPABASE_JWT_SECRET: str | None = Field(
        default=None,
        description="Supabase JWT secret for auth verification",
    )

    # Redis Cache Settings
    REDIS_URL: str = Field(default="redis://localhost:6379/0", description="Redis connection URL")
    REDIS_CACHE_TTL_HOURS: int = Field(default=24, description="Scanner cache TTL in hours")

    # Database Settings
    DATABASE_URL: str = Field(
        default="postgresql://tradescout:tradescout_dev@localhost:5432/tradescout",
        description="PostgreSQL connection URL",
    )

    @property
    def APP_NAME(self) -> str:
        return self.PROJECT_NAME

    @property
    def APP_VERSION(self) -> str:
        return self.VERSION


settings = Settings()
