"""TRADESCOUT — Production Rate Limiting Middleware.

Implements Redis sliding-window token bucket with resilient in-memory fallback.
Applies tiered rate limits based on client identity (Anonymous vs Pro Authenticated).
Exempts health probes, CORS preflight OPTIONS, and internal routes.
"""

import time
from collections import defaultdict

import structlog
from fastapi import Request, Response, status
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware, RequestResponseEndpoint

from app.core.config import settings

logger = structlog.get_logger(__name__)

# Resilient in-memory sliding window fallback: client_id -> list of timestamps
_in_memory_buckets: dict[str, list[float]] = defaultdict(list)
_EXEMPT_PATHS = {
    "/health",
    "/healthz",
    "/ready",
    "/readyz",
    "/live",
    "/livez",
    "/docs",
    "/openapi.json",
    "/redoc",
}


class RateLimitMiddleware(BaseHTTPMiddleware):
    """Tiered sliding-window rate limiting middleware for FastAPI."""

    async def dispatch(self, request: Request, call_next: RequestResponseEndpoint) -> Response:
        # 1. Skip rate limiting if disabled or for exempt endpoints / OPTIONS preflight
        if not getattr(settings, "RATE_LIMIT_ENABLED", True) or request.method == "OPTIONS":
            return await call_next(request)

        path = request.url.path
        if any(path.startswith(exempt) for exempt in _EXEMPT_PATHS):
            return await call_next(request)

        # 2. Extract Client Identity & Tier
        auth_header = request.headers.get("authorization")
        user_id_header = request.headers.get("x-user-id")

        # Valid JWT structure has format "Bearer header.payload.signature"
        is_jwt_candidate = bool(
            auth_header
            and auth_header.strip().lower().startswith("bearer ")
            and len(auth_header.strip().split()) == 2
            and auth_header.strip().split()[1].count(".") == 2
        )
        is_authenticated = is_jwt_candidate or bool(user_id_header and settings.ENVIRONMENT != "production")

        client_ip = (
            request.headers.get("x-forwarded-for", "").split(",")[0].strip()
            or request.headers.get("x-real-ip")
            or (request.client.host if request.client else "unknown")
        )

        client_key = user_id_header if (is_authenticated and user_id_header) else f"ip:{client_ip}"
        limit_rpm = 600 if is_authenticated else 120

        # Special limit for scanner endpoints
        if path.startswith("/api/scanners") and not is_authenticated:
            limit_rpm = 60

        # 3. Check rate limit against Redis or In-Memory
        redis_client = getattr(request.app.state, "redis", None)
        current_time = time.time()
        window_seconds = 60
        is_allowed = True
        remaining = limit_rpm
        reset_time = int(current_time + window_seconds)

        if redis_client is not None:
            try:
                current_minute = int(current_time // 60)
                cache_key = f"ratelimit:{client_key}:{current_minute}"
                # Atomic increment
                count = await redis_client.incr(cache_key)
                if count == 1:
                    await redis_client.expire(cache_key, window_seconds + 5)

                remaining = max(0, limit_rpm - count)
                reset_time = (current_minute + 1) * 60
                if count > limit_rpm:
                    is_allowed = False
            except Exception as exc:
                logger.debug("ratelimit.redis_check_error_using_fallback", error=str(exc))
                is_allowed, remaining = self._check_in_memory(client_key, limit_rpm, current_time)
        else:
            is_allowed, remaining = self._check_in_memory(client_key, limit_rpm, current_time)

        # 4. Handle Throttled Requests
        if not is_allowed:
            logger.warning("ratelimit.throttled", client=client_key, path=path, limit=limit_rpm)
            retry_after = max(1, reset_time - int(current_time))
            return JSONResponse(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                content={
                    "error": "rate_limit_exceeded",
                    "message": f"Rate limit exceeded: maximum {limit_rpm} requests per minute. Please slow down.",
                    "retry_after": retry_after,
                },
                headers={
                    "Retry-After": str(retry_after),
                    "X-RateLimit-Limit": str(limit_rpm),
                    "X-RateLimit-Remaining": "0",
                    "X-RateLimit-Reset": str(reset_time),
                },
            )

        # 5. Process Request and Inject RateLimit Headers
        response = await call_next(request)
        response.headers["X-RateLimit-Limit"] = str(limit_rpm)
        response.headers["X-RateLimit-Remaining"] = str(remaining)
        response.headers["X-RateLimit-Reset"] = str(reset_time)
        return response

    def _check_in_memory(self, client_key: str, limit: int, now: float) -> tuple[bool, int]:
        """Bounded in-memory sliding window token bucket."""
        timestamps = _in_memory_buckets[client_key]
        window_start = now - 60.0
        # Purge timestamps older than 60 seconds
        valid_timestamps = [t for t in timestamps if t > window_start]

        if not valid_timestamps and client_key in _in_memory_buckets:
            _in_memory_buckets.pop(client_key, None)

        # Bound dictionary size to avoid memory leakage under IP rotation
        if len(_in_memory_buckets) > 10000:
            stale_cutoff = now - 120.0
            stale_keys = [k for k, ts in _in_memory_buckets.items() if not ts or ts[-1] < stale_cutoff]
            for k in stale_keys[:2000]:
                _in_memory_buckets.pop(k, None)

        if len(valid_timestamps) >= limit:
            _in_memory_buckets[client_key] = valid_timestamps
            return False, 0

        valid_timestamps.append(now)
        _in_memory_buckets[client_key] = valid_timestamps
        return True, max(0, limit - len(valid_timestamps))
