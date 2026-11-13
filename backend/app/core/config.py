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
    INTERNAL_SERVICE_SECRET: str = Field(
        default="tradescout-internal-secret-edge",
        description="Internal service secret for edge proxy",
    )

    # Redis Cache Settings
    REDIS_URL: str = Field(default="redis://localhost:6379/0", description="Redis connection URL")
    REDIS_CACHE_TTL_HOURS: int = Field(default=24, description="Scanner cache TTL in hours")

    # Database Settings
    DATABASE_URL: str = Field(
        default="postgresql://tradescout:tradescout_dev@localhost:5432/tradescout",
        description="PostgreSQL connection URL",
    )
    DATABASE_POOL_MIN: int = Field(default=5, description="Minimum database connection pool size")
    DATABASE_POOL_MAX: int = Field(default=50, description="Maximum database connection pool size")
    DATABASE_POOL_TIMEOUT: float = Field(default=10.0, description="Connection pool acquire timeout in seconds")
    DATABASE_COMMAND_TIMEOUT: float = Field(default=15.0, description="Database statement command timeout in seconds")
    DATABASE_STATEMENT_CACHE_SIZE: int = Field(
        default=0,
        description="Statement cache size (0 for PgBouncer / Supavisor transaction pooler compatibility)",
    )

    # Rate Limiting & Concurrency
    RATE_LIMIT_ENABLED: bool = Field(default=True, description="Enable request rate limiting")
    RATE_LIMIT_ANONYMOUS: str = Field(default="120/minute", description="Rate limit for unauthenticated users")
    RATE_LIMIT_PRO: str = Field(default="600/minute", description="Rate limit for authenticated Pro users")
    RATE_LIMIT_SCANNER_ANON: str = Field(
        default="60/minute",
        description="Rate limit for scanner endpoints for anonymous users",
    )
    CACHE_MUTEX_TIMEOUT_SECS: int = Field(default=30, description="Distributed lock timeout for heavy recalculation")

    @property
    def APP_NAME(self) -> str:
        return self.PROJECT_NAME

    @property
    def APP_VERSION(self) -> str:
        return self.VERSION


settings = Settings()
