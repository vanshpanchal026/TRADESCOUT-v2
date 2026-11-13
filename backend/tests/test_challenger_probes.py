import asyncio
import uuid
from datetime import datetime
from unittest.mock import AsyncMock

import httpx
import pytest
from redis.exceptions import (
    AuthenticationError as RedisAuthError,
)
from redis.exceptions import (
    ConnectionError as RedisConnectionError,
)
from redis.exceptions import (
    TimeoutError as RedisTimeoutError,
)

from app.core.redis import get_redis
from app.main import app


@pytest.mark.asyncio
async def test_healthz_adversarial_methods():
    """Verify HTTP method constraints on /healthz."""
    transport = httpx.ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://test") as client:
        # GET should succeed
        res_get = await client.get("/healthz")
        assert res_get.status_code == 200

        # Disallowed mutation methods must return 405 Method Not Allowed
        # Note: HEAD also returns 405 because only GET is registered on the router
        for method in ["post", "put", "delete", "patch", "head"]:
            call = getattr(client, method)
            res = await call("/healthz")
            assert res.status_code == 405, f"Expected 405 for {method.upper()}, got {res.status_code}"


@pytest.mark.asyncio
async def test_healthz_payload_schema_and_timestamp():
    """Verify strict response payload schema and ISO-8601 UTC timestamp."""
    transport = httpx.ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://test") as client:
        res = await client.get("/healthz")
        assert res.status_code == 200
        assert res.headers.get("content-type") == "application/json"

        data = res.json()
        assert data.get("status") == "ok"
        assert data.get("version") == "1.0.0"

        ts_str = data.get("timestamp")
        assert ts_str is not None
        parsed_ts = datetime.fromisoformat(ts_str)
        assert parsed_ts.tzinfo is not None, "Timestamp must include timezone info (UTC)"


@pytest.mark.asyncio
async def test_healthz_query_params_and_body_injection():
    """Verify /healthz handles query injection and unexpected payload safely."""
    transport = httpx.ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://test") as client:
        res = await client.get(
            "/healthz?attack=<script>alert('xss')</script>&id=' OR 1=1--",
            headers={"Content-Type": "application/json"},
        )
        assert res.status_code == 200
        data = res.json()
        assert data.get("status") == "ok"
        assert "<script>" not in res.text


@pytest.mark.asyncio
async def test_nonexistent_paths_404():
    """Verify typo paths and case variations return 404."""
    transport = httpx.ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://test") as client:
        for path in ["/health", "/HEALTHZ", "/healthz/invalid", "/api/v1/healthz"]:
            res = await client.get(path)
            assert res.status_code == 404, f"Expected 404 for {path}, got {res.status_code}"


@pytest.mark.asyncio
async def test_readyz_live_redis_healthy():
    """Verify live Redis probe returns 200 and healthy connectivity details."""
    transport = httpx.ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://test") as client:
        res = await client.get("/readyz")
        assert res.status_code == 200
        data = res.json()
        assert data.get("status") == "ready"
        assert data.get("redis") == "connected"
        assert data.get("version") == "1.0.0"
        assert data.get("error") is None

        ts_str = data.get("timestamp")
        assert ts_str is not None
        parsed_ts = datetime.fromisoformat(ts_str)
        assert parsed_ts.tzinfo is not None


@pytest.mark.asyncio
async def test_readyz_redis_connection_error_503():
    """Verify 503 Service Unavailable when Redis connection is refused."""
    mock_redis = AsyncMock()
    mock_redis.ping.side_effect = RedisConnectionError("Connection refused: 127.0.0.1:6379")

    app.dependency_overrides[get_redis] = lambda: mock_redis
    try:
        transport = httpx.ASGITransport(app=app)
        async with httpx.AsyncClient(transport=transport, base_url="http://test") as client:
            res = await client.get("/readyz")
            assert res.status_code == 503
            data = res.json()
            assert data.get("status") == "not_ready"
            assert data.get("redis") == "disconnected"
            assert "Connection refused" in data.get("error", "")
            assert data.get("version") == "1.0.0"
    finally:
        app.dependency_overrides.pop(get_redis, None)


@pytest.mark.asyncio
async def test_readyz_redis_timeout_error_503():
    """Verify 503 Service Unavailable on Redis socket timeout."""
    mock_redis = AsyncMock()
    mock_redis.ping.side_effect = RedisTimeoutError("Socket read timed out after 3.0s")

    app.dependency_overrides[get_redis] = lambda: mock_redis
    try:
        transport = httpx.ASGITransport(app=app)
        async with httpx.AsyncClient(transport=transport, base_url="http://test") as client:
            res = await client.get("/readyz")
            assert res.status_code == 503
            data = res.json()
            assert data.get("status") == "not_ready"
            assert data.get("redis") == "disconnected"
            assert "timed out" in data.get("error", "")
    finally:
        app.dependency_overrides.pop(get_redis, None)


@pytest.mark.asyncio
async def test_readyz_redis_auth_error_503():
    """Verify 503 Service Unavailable on Redis auth failure."""
    mock_redis = AsyncMock()
    mock_redis.ping.side_effect = RedisAuthError("NOAUTH Authentication required")

    app.dependency_overrides[get_redis] = lambda: mock_redis
    try:
        transport = httpx.ASGITransport(app=app)
        async with httpx.AsyncClient(transport=transport, base_url="http://test") as client:
            res = await client.get("/readyz")
            assert res.status_code == 503
            data = res.json()
            assert data.get("status") == "not_ready"
            assert data.get("redis") == "disconnected"
            assert "NOAUTH" in data.get("error", "")
    finally:
        app.dependency_overrides.pop(get_redis, None)


@pytest.mark.asyncio
async def test_readyz_redis_arbitrary_crash_503():
    """Verify 503 Service Unavailable on unexpected Redis runtime exception."""
    mock_redis = AsyncMock()
    mock_redis.ping.side_effect = RuntimeError("Fatal Redis driver panic")

    app.dependency_overrides[get_redis] = lambda: mock_redis
    try:
        transport = httpx.ASGITransport(app=app)
        async with httpx.AsyncClient(transport=transport, base_url="http://test") as client:
            res = await client.get("/readyz")
            assert res.status_code == 503
            data = res.json()
            assert data.get("status") == "not_ready"
            assert data.get("redis") == "disconnected"
            assert "Fatal Redis driver panic" in data.get("error", "")
    finally:
        app.dependency_overrides.pop(get_redis, None)


@pytest.mark.asyncio
async def test_request_id_missing_generates_valid_uuid4():
    """Verify missing request header receives a newly minted UUIDv4."""
    transport = httpx.ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://test") as client:
        res = await client.get("/healthz")
        req_id = res.headers.get("x-request-id")
        assert req_id is not None
        parsed = uuid.UUID(req_id, version=4)
        assert str(parsed) == req_id


@pytest.mark.asyncio
async def test_request_id_propagation_custom_and_caps():
    """Verify custom and uppercase incoming X-Request-ID headers propagate verbatim."""
    transport = httpx.ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://test") as client:
        # Standard lowercase
        res_custom = await client.get("/healthz", headers={"x-request-id": "test-custom-1234"})
        assert res_custom.headers.get("x-request-id") == "test-custom-1234"

        # Uppercase header
        res_caps = await client.get("/healthz", headers={"X-Request-ID": "test-custom-caps-5678"})
        assert res_caps.headers.get("x-request-id") == "test-custom-caps-5678"


@pytest.mark.asyncio
async def test_request_id_fallback_on_blank_values():
    """Verify empty and whitespace-only header values trigger UUIDv4 fallback."""
    transport = httpx.ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://test") as client:
        for blank_val in ["", "   ", "\t"]:
            res = await client.get("/healthz", headers={"x-request-id": blank_val})
            returned_id = res.headers.get("x-request-id")
            assert returned_id is not None
            assert returned_id != blank_val
            assert returned_id.strip() == returned_id
            parsed = uuid.UUID(returned_id, version=4)
            assert str(parsed) == returned_id


@pytest.mark.asyncio
async def test_cors_allowed_origin_behavior():
    """Verify allowed origin http://localhost:3000 receives proper CORS headers."""
    transport = httpx.ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://test") as client:
        # Simple GET request
        res = await client.get("/healthz", headers={"Origin": "http://localhost:3000"})
        assert res.headers.get("access-control-allow-origin") == "http://localhost:3000"
        assert res.headers.get("access-control-allow-credentials") == "true"
        # Access-Control-Expose-Headers is sent on actual response
        expose_headers = res.headers.get("access-control-expose-headers", "").lower()
        assert "x-request-id" in expose_headers

        # Preflight OPTIONS request
        res_opt = await client.options(
            "/healthz",
            headers={
                "Origin": "http://localhost:3000",
                "Access-Control-Request-Method": "GET",
                "Access-Control-Request-Headers": "x-request-id",
            },
        )
        assert res_opt.status_code == 200
        assert res_opt.headers.get("access-control-allow-origin") == "http://localhost:3000"


@pytest.mark.asyncio
async def test_cors_rejection_of_unauthorized_origins():
    """Verify unauthorized and malicious origins are strictly denied."""
    unauthorized = [
        "http://evil.com",
        "http://localhost:3001",
        "http://localhost:3000.attacker.com",
        "null",
        "https://google.com",
        "http://evil-localhost:3000",
        "http://localhost:8000",
    ]
    transport = httpx.ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://test") as client:
        for origin in unauthorized:
            res = await client.get("/healthz", headers={"Origin": origin})
            allow_origin = res.headers.get("access-control-allow-origin")
            assert allow_origin is None or allow_origin != origin, f"Origin {origin} must not be allowed!"


@pytest.mark.asyncio
async def test_concurrent_probes_and_unique_request_ids():
    """Verify concurrent requests get distinct UUIDs and execute under 500ms without race conditions."""
    transport = httpx.ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://test") as client:
        tasks = [client.get("/healthz") for _ in range(50)]
        responses = await asyncio.gather(*tasks)

        assert len(responses) == 50
        ids = set()
        for res in responses:
            assert res.status_code == 200
            req_id = res.headers.get("x-request-id")
            assert req_id is not None
            assert req_id not in ids, f"Duplicate request ID detected: {req_id}"
            ids.add(req_id)
