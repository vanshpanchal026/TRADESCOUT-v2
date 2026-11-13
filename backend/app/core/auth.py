"""TRADESCOUT — Multi-Tenant Authentication & Identity Layer.

Provides Supabase JWT verification, edge-proxy header extraction,
and per-user isolation across all persistence operations.
"""

import os
import uuid
from typing import Any

import structlog
from fastapi import Header, HTTPException, status
from jose import JWTError, jwt

from app.core.config import settings
from app.services.database import DEFAULT_USER_ID

logger = structlog.get_logger(__name__)


def get_jwt_secret() -> str:
    """Retrieve Supabase JWT secret from environment or fallback in dev."""
    secret = os.getenv("SUPABASE_JWT_SECRET") or getattr(settings, "SUPABASE_JWT_SECRET", None)
    if not secret:
        if settings.ENVIRONMENT == "production":
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Server authentication configuration error.",
            )
        return "tradescout-dev-supabase-jwt-secret-tradescout"
    return secret


def verify_supabase_jwt(authorization: str | None) -> tuple[bool, str]:
    """Verify Supabase Bearer JWT and return (is_pro, user_id).

    Returns (False, "guest") if unauthenticated.
    Raises HTTPException 401 if token is present but invalid or expired.
    """
    if not authorization or not authorization.strip():
        return False, "guest"

    parts = authorization.strip().split()
    if len(parts) != 2 or parts[0].lower() != "bearer":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={
                "error": "unauthorized",
                "message": "Invalid Authorization header format. Expected 'Bearer <token>'.",
            },
        )

    token = parts[1]
    secret = get_jwt_secret()

    try:
        payload: dict[str, Any] = jwt.decode(
            token,
            secret,
            algorithms=["HS256"],
            options={"verify_aud": False},
        )
    except JWTError as exc:
        logger.warning("auth.jwt_verification_failed", error=str(exc))
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={"error": "unauthorized", "message": f"JWT signature verification failed: {exc!s}"},
        ) from exc

    user_id = payload.get("sub", "unknown")
    user_metadata = payload.get("user_metadata", {})
    app_metadata = payload.get("app_metadata", {})
    plan = user_metadata.get("plan") or app_metadata.get("plan") or payload.get("plan")

    is_pro = str(plan).lower() in ("pro", "premium")
    return is_pro, user_id


def extract_user_identity(
    authorization: str | None = Header(default=None),
    x_user_id: str | None = Header(default=None, alias="x-user-id"),
    x_internal_secret: str | None = Header(default=None, alias="x-internal-secret"),
) -> tuple[bool, str]:
    """Extract (is_pro, user_id) securely from Supabase JWT or authorized internal header.

    Security Rules:
    1. Cryptographically verified Supabase Bearer JWT is the primary source of truth.
    2. Client-supplied 'x-user-id' is NEVER trusted in production without a valid 'x-internal-secret'.
    3. In non-production testing, 'x-user-id' is allowed only if it is a valid UUID format.
    4. Unauthenticated requests are classified as (is_pro=False, "guest").
    """
    # 1. Check verified Supabase Bearer JWT
    if authorization and authorization.strip():
        is_pro, user_id = verify_supabase_jwt(authorization)
        if user_id and user_id not in ("guest", "unknown"):
            return is_pro, user_id

    # 2. Check internal secret or dev UUID header
    if x_user_id and x_user_id.strip():
        clean_user_id = x_user_id.strip()
        is_trusted_proxy = bool(
            x_internal_secret and x_internal_secret == getattr(settings, "INTERNAL_SERVICE_SECRET", None)
        )
        is_dev = settings.ENVIRONMENT != "production"

        if is_trusted_proxy or is_dev:
            try:
                # Enforce valid UUID format to prevent injection attacks
                uuid_obj = uuid.UUID(clean_user_id)
                return True, str(uuid_obj)
            except ValueError:
                logger.warning("auth.invalid_uuid_in_header", user_id=clean_user_id)

    # 3. Unauthenticated guest fallback
    return False, "guest"


def get_current_user_id(
    authorization: str | None = Header(default=None),
    x_user_id: str | None = Header(default=None, alias="x-user-id"),
    x_internal_secret: str | None = Header(default=None, alias="x-internal-secret"),
) -> str:
    """FastAPI dependency: Returns user_id for multi-tenant data isolation.

    In production, raises 401 if unauthenticated for state-mutating or private operations.
    In development, gracefully defaults to DEFAULT_USER_ID if unauthenticated.
    """
    _, user_id = extract_user_identity(
        authorization=authorization,
        x_user_id=x_user_id,
        x_internal_secret=x_internal_secret,
    )
    if user_id in ("guest", "unknown"):
        if settings.ENVIRONMENT == "production":
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail={"error": "unauthorized", "message": "Authentication required."},
            )
        return DEFAULT_USER_ID
    return user_id
