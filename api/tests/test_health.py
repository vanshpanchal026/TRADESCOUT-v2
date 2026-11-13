import uuid
from datetime import datetime

import pytest
from httpx import AsyncClient

from app.core.config import settings
from app.core.redis import get_redis
from app.main import app


@pytest.mark.asyncio
async def test_healthz_success(client: AsyncClient):
    """Verify /healthz returns 200 with required status, timestamp, and version."""
    response = await client.get("/healthz")
    assert response.status_code == 200

    data = response.json()
    assert "status" in data
    assert "timestamp" in data
    assert "version" in data

    assert data["status"] == "ok"
    assert data["version"] == settings.VERSION

    # Validate ISO timestamp parseability
    parsed_ts = datetime.fromisoformat(data["timestamp"])
    assert parsed_ts is not None


@pytest.mark.asyncio
async def test_healthz_includes_request_id(client: AsyncClient):
    """Verify /healthz response includes a valid x-request-id header."""
    response = await client.get("/healthz")
    assert response.status_code == 200
    assert "x-request-id" in response.headers

    req_id = response.headers["x-request-id"]
    # Ensure it is a valid UUID
    parsed_uuid = uuid.UUID(req_id)
    assert str(parsed_uuid) == req_id


@pytest.mark.asyncio
async def test_readyz_success_with_healthy_redis(client: AsyncClient, mock_redis_healthy):
    """Verify /readyz returns 200 ready when Redis ping succeeds."""
    app.dependency_overrides[get_redis] = lambda: mock_redis_healthy
    try:
        response = await client.get("/readyz")
        assert response.status_code == 200

        data = response.json()
        assert data["status"] == "ready"
        assert data["redis"] == "connected"
        assert "timestamp" in data
        assert data["version"] == settings.VERSION
    finally:
        app.dependency_overrides.pop(get_redis, None)


@pytest.mark.asyncio
async def test_readyz_failure_with_unhealthy_redis(client: AsyncClient, mock_redis_unhealthy):
    """Verify /readyz returns 503 service unavailable when Redis ping raises connection error."""
    app.dependency_overrides[get_redis] = lambda: mock_redis_unhealthy
    try:
        response = await client.get("/readyz")
        assert response.status_code == 503

        data = response.json()
        assert data["status"] == "not_ready"
        assert data["redis"] == "disconnected"
        assert "error" in data
        assert "Connection refused" in data["error"]
        assert "timestamp" in data
    finally:
        app.dependency_overrides.pop(get_redis, None)


@pytest.mark.asyncio
async def test_readyz_live_redis_connectivity(client: AsyncClient):
    """Verify live /readyz endpoint with actual Redis connection."""
    response = await client.get("/readyz")
    # In an environment with live Redis running, status code will be 200
    # In an environment without Redis, status code will be 503
    assert response.status_code in (200, 503)
    data = response.json()
    assert "status" in data
    assert "redis" in data
    assert "timestamp" in data
    if response.status_code == 200:
        assert data["status"] == "ready"
        assert data["redis"] == "connected"
    else:
        assert data["status"] == "not_ready"
        assert data["redis"] == "disconnected"
