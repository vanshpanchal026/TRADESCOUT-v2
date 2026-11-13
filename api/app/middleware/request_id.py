import uuid

import structlog
from starlette.middleware.base import BaseHTTPMiddleware, RequestResponseEndpoint
from starlette.requests import Request
from starlette.responses import Response

from app.core.config import settings


class RequestIDMiddleware(BaseHTTPMiddleware):
    """Middleware that assigns or propagates a unique Request ID for every request."""

    async def dispatch(self, request: Request, call_next: RequestResponseEndpoint) -> Response:
        incoming_id = request.headers.get("x-request-id") or request.headers.get("X-Request-ID")
        request_id = incoming_id.strip() if incoming_id and incoming_id.strip() else str(uuid.uuid4())

        request.state.request_id = request_id
        structlog.contextvars.bind_contextvars(request_id=request_id)

        try:
            response = await call_next(request)
            response.headers["x-request-id"] = request_id
            if request.headers.get("origin") in settings.CORS_ORIGINS:
                response.headers["access-control-expose-headers"] = "x-request-id, X-Request-ID"
            return response
        finally:
            structlog.contextvars.clear_contextvars()
