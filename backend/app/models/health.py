from pydantic import BaseModel, Field


class HealthzResponse(BaseModel):
    """Liveness probe response model."""

    status: str = Field(default="ok", description="Liveness probe status")
    timestamp: str = Field(..., description="UTC ISO-8601 timestamp")
    version: str = Field(default="1.0.0", description="Application semantic version")


class ReadyzResponse(BaseModel):
    """Readiness probe response model."""

    status: str = Field(..., description="Readiness status ('ready' or 'not_ready')")
    redis: str = Field(..., description="Redis connectivity status ('connected' or 'disconnected')")
    timestamp: str = Field(..., description="UTC ISO-8601 timestamp")
    version: str | None = Field(default="1.0.0", description="Application semantic version")
    error: str | None = Field(default=None, description="Error detail if unavailable")
