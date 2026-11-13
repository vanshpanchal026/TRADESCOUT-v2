import structlog
from redis.asyncio import Redis

from app.core.config import settings

logger = structlog.get_logger(__name__)

_redis_client: Redis | None = None


async def init_redis_pool(redis_url: str | None = None) -> Redis:
    """Initialize Redis connection pool with decode_responses enabled."""
    global _redis_client
    url = redis_url or settings.REDIS_URL
    _redis_client = Redis.from_url(
        url,
        encoding="utf-8",
        decode_responses=True,
        socket_connect_timeout=3.0,
        socket_timeout=3.0,
    )
    logger.info("redis.pool_initialized", url=url)
    return _redis_client


async def close_redis_pool(client: Redis | None = None) -> None:
    """Close Redis connection pool gracefully."""
    global _redis_client
    target = client or _redis_client
    if target is not None:
        try:
            await target.aclose()
            logger.info("redis.pool_closed")
        except Exception as exc:
            logger.warning("redis.pool_close_error", error=str(exc))
        finally:
            if target is _redis_client:
                _redis_client = None


async def get_redis() -> Redis:
    """FastAPI dependency to retrieve the active Redis client."""
    global _redis_client
    if _redis_client is None:
        _redis_client = await init_redis_pool()
    return _redis_client


def set_redis(client: Redis | None) -> None:
    """Set global Redis client reference (useful for testing and dependency overrides)."""
    global _redis_client
    _redis_client = client
