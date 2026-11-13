import uuid

import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_request_id_generated_when_missing(client: AsyncClient):
    """Verify middleware assigns a new UUID when request lacks x-request-id."""
    response = await client.get("/healthz")
    assert response.status_code == 200
    assert "x-request-id" in response.headers

    generated_id = response.headers["x-request-id"]
    parsed = uuid.UUID(generated_id)
    assert str(parsed) == generated_id


@pytest.mark.asyncio
async def test_request_id_propagated_when_provided(client: AsyncClient):
    """Verify middleware preserves incoming x-request-id header."""
    custom_id = "test-custom-request-id-1234"
    response = await client.get("/healthz", headers={"x-request-id": custom_id})
    assert response.status_code == 200
    assert response.headers["x-request-id"] == custom_id


@pytest.mark.asyncio
async def test_request_id_propagated_with_caps_header(client: AsyncClient):
    """Verify middleware accepts capitalized X-Request-ID header."""
    custom_id = "caps-test-request-id-5678"
    response = await client.get("/healthz", headers={"X-Request-ID": custom_id})
    assert response.status_code == 200
    assert response.headers["x-request-id"] == custom_id


@pytest.mark.asyncio
async def test_cors_preflight_allowed_origin(client: AsyncClient):
    """Verify CORS preflight request from allowed origin http://localhost:3000 succeeds."""
    response = await client.options(
        "/healthz",
        headers={
            "Origin": "http://localhost:3000",
            "Access-Control-Request-Method": "GET",
            "Access-Control-Request-Headers": "x-request-id",
        },
    )
    assert response.status_code == 200
    assert response.headers.get("access-control-allow-origin") == "http://localhost:3000"
    assert response.headers.get("access-control-allow-credentials") == "true"


@pytest.mark.asyncio
async def test_cors_disallowed_origin(client: AsyncClient):
    """Verify CORS rejects or does not reflect unauthorized origins."""
    response = await client.options(
        "/healthz",
        headers={
            "Origin": "http://unauthorized-domain.com",
            "Access-Control-Request-Method": "GET",
        },
    )
    # CORSMiddleware does not return allow-origin header for unauthorized origins
    assert response.headers.get("access-control-allow-origin") != "http://unauthorized-domain.com"
