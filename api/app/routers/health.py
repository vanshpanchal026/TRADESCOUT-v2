from datetime import UTC, datetime

import structlog
from fastapi import APIRouter, Depends, Response, status
from redis.asyncio import Redis

from app.core.config import settings
from app.core.redis import get_redis
from app.models.health import HealthzResponse, ReadyzResponse

logger = structlog.get_logger(__name__)

router = APIRouter(tags=["Health"])


@router.get(
    "/healthz",
    response_model=HealthzResponse,
    status_code=status.HTTP_200_OK,
    summary="Liveness Probe",
    description="Returns 200 OK if the application service is running.",
)
async def healthz() -> HealthzResponse:
    """Liveness probe returning application status, timestamp, and version."""
    return HealthzResponse(
        status="ok",
        timestamp=datetime.now(UTC).isoformat(),
        version=settings.VERSION,
    )


@router.get(
    "/readyz",
    response_model=ReadyzResponse,
    status_code=status.HTTP_200_OK,
    summary="Readiness Probe",
    description="Returns 200 OK if dependencies (Redis) are operational, else 503.",
    responses={
        status.HTTP_200_OK: {"model": ReadyzResponse, "description": "System ready"},
        status.HTTP_503_SERVICE_UNAVAILABLE: {
            "model": ReadyzResponse,
            "description": "System not ready / Redis unavailable",
        },
    },
)
async def readyz(
    response: Response,
    redis: Redis = Depends(get_redis),
) -> ReadyzResponse:
    """Readiness probe checking Redis connectivity."""
    try:
        await redis.ping()
        return ReadyzResponse(
            status="ready",
            redis="connected",
            timestamp=datetime.now(UTC).isoformat(),
            version=settings.VERSION,
        )
    except Exception as exc:
        logger.warning("readyz.redis_ping_failed", error=str(exc))
        response.status_code = status.HTTP_503_SERVICE_UNAVAILABLE
        return ReadyzResponse(
            status="not_ready",
            redis="disconnected",
            timestamp=datetime.now(UTC).isoformat(),
            version=settings.VERSION,
            error="Dependency unavailable" if settings.ENVIRONMENT == "production" else str(exc),
        )
