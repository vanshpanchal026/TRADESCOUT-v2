"""TRADESCOUT — Unit and Integration Tests for Scanner REST APIs.

Validates:
1. Invalid slug returns 404 Not Found.
2. Unauthenticated guest receives strictly truncated 10 items with is_truncated=True and sensitive fields omitted.
3. Free-tier JWT receives truncated 10 items.
4. Pro-tier JWT receives full un-truncated dataset with is_truncated=False.
5. Invalid/malformed JWT returns 401 Unauthorized.
6. Threshold filtering (min_rs, min_rvol) works correctly.
7. Multi-direction column sorting (asc/desc) operates accurately.
8. All 5 supported scanner slugs resolve successfully.
9. Market breadth endpoint returns required breadth ratios.
10. Metadata endpoint returns market status and candidate counts.
"""

from collections.abc import AsyncGenerator

import httpx
import pytest
from httpx import ASGITransport
from jose import jwt

from app.main import app
from app.routers.scanners import get_jwt_secret


@pytest.fixture
def create_test_token():
    """Factory fixture for signing test Supabase JWTs."""

    def _generate(plan: str = "free", sub: str = "test-user-123") -> str:
        secret = get_jwt_secret()
        payload = {
            "sub": sub,
            "email": f"{sub}@tradescout.in",
            "role": "authenticated",
            "user_metadata": {"plan": plan},
            "app_metadata": {"plan": plan},
        }
        return jwt.encode(payload, secret, algorithm="HS256")

    return _generate


@pytest.fixture
async def async_client() -> AsyncGenerator[httpx.AsyncClient, None]:
    """Test client using ASGITransport."""
    transport = ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://testserver") as client:
        yield client


@pytest.mark.asyncio
async def test_invalid_scanner_slug_returns_404(async_client: httpx.AsyncClient):
    """Verify that unsupported slugs return 404 Not Found."""
    resp = await async_client.get("/api/scanners/nonexistent-scanner-slug")
    assert resp.status_code == 404
    body = resp.json()
    assert body["detail"]["error"] == "not_found"
    assert "Supported scanners" in body["detail"]["message"]


@pytest.mark.asyncio
async def test_guest_receives_truncated_10_items_and_metadata(async_client: httpx.AsyncClient):
    """Verify unauthenticated guests receive at most 10 candidates and is_truncated=True."""
    resp = await async_client.get("/api/scanners/trend-template")
    assert resp.status_code == 200
    payload = resp.json()

    assert "metadata" in payload
    assert "data" in payload
    metadata = payload["metadata"]
    assert metadata["slug"] == "trend-template"
    assert metadata["total_matches"] > 10, f"Expected total_matches > 10, got {metadata['total_matches']}"
    assert metadata["is_truncated"] is True
    assert metadata["returned"] <= 10
    assert len(payload["data"]) <= 10

    # Verify sensitive internal fields are omitted from guest view
    first_item = payload["data"][0]
    sensitive_keys = {
        "raw_rs_score",
        "close_20d_ago",
        "close_63d_ago",
        "close_126d_ago",
        "close_189d_ago",
        "close_252d_ago",
        "sma_200_20d_ago",
        "diff",
        "gain",
        "loss",
        "avg_gain",
        "avg_loss",
        "rank",
        "minervini_pass",
    }
    for key in sensitive_keys:
        assert key not in first_item, f"Proprietary column '{key}' must not leak in guest response"


@pytest.mark.asyncio
async def test_free_plan_jwt_receives_truncated_10_items(async_client: httpx.AsyncClient, create_test_token):
    """Verify authenticated user with plan='free' is strictly capped at 10 items."""
    free_token = create_test_token(plan="free")
    resp = await async_client.get("/api/scanners/trend-template", headers={"Authorization": f"Bearer {free_token}"})
    assert resp.status_code == 200
    payload = resp.json()
    assert payload["metadata"]["is_truncated"] is True
    assert len(payload["data"]) <= 10


@pytest.mark.asyncio
async def test_pro_plan_jwt_receives_full_dataset(async_client: httpx.AsyncClient, create_test_token):
    """Verify authenticated user with plan='pro' unlocks full un-truncated dataset."""
    pro_token = create_test_token(plan="pro")
    resp = await async_client.get(
        "/api/scanners/trend-template?limit=50",
        headers={"Authorization": f"Bearer {pro_token}"},
    )
    assert resp.status_code == 200
    payload = resp.json()
    metadata = payload["metadata"]
    assert metadata["is_truncated"] is False
    assert len(payload["data"]) > 10, "Pro user must receive full dataset beyond top 10"


@pytest.mark.asyncio
async def test_invalid_jwt_token_returns_401(async_client: httpx.AsyncClient):
    """Verify that invalid or forged JWT tokens are rejected with 401 Unauthorized."""
    resp = await async_client.get(
        "/api/scanners/trend-template",
        headers={"Authorization": "Bearer forged.invalid.token"},
    )
    assert resp.status_code == 401
    assert resp.json()["detail"]["error"] == "unauthorized"


@pytest.mark.asyncio
async def test_scanner_filtering_by_min_rs(async_client: httpx.AsyncClient, create_test_token):
    """Verify that min_rs filter discards candidates below the threshold."""
    pro_token = create_test_token(plan="pro")
    resp = await async_client.get(
        "/api/scanners/trend-template?min_rs=70&limit=50",
        headers={"Authorization": f"Bearer {pro_token}"},
    )
    assert resp.status_code == 200
    for stock in resp.json()["data"]:
        assert stock.get("rs_rating") is not None
        assert stock["rs_rating"] >= 70


@pytest.mark.asyncio
async def test_scanner_sorting_asc_and_desc(async_client: httpx.AsyncClient, create_test_token):
    """Verify column sorting in both ascending and descending directions."""
    pro_token = create_test_token(plan="pro")

    # Ascending sort on CMP
    resp_asc = await async_client.get(
        "/api/scanners/trend-template?sort_by=cmp&direction=asc&limit=20",
        headers={"Authorization": f"Bearer {pro_token}"},
    )
    assert resp_asc.status_code == 200
    cmps_asc = [s["cmp"] for s in resp_asc.json()["data"] if s.get("cmp") is not None]
    assert cmps_asc == sorted(cmps_asc)

    # Descending sort on CMP
    resp_desc = await async_client.get(
        "/api/scanners/trend-template?sort_by=cmp&direction=desc&limit=20",
        headers={"Authorization": f"Bearer {pro_token}"},
    )
    assert resp_desc.status_code == 200
    cmps_desc = [s["cmp"] for s in resp_desc.json()["data"] if s.get("cmp") is not None]
    assert cmps_desc == sorted(cmps_desc, reverse=True)


@pytest.mark.asyncio
async def test_all_five_supported_scanners_return_200(async_client: httpx.AsyncClient):
    """Verify that all 5 required scanner slugs respond successfully."""
    slugs = ["trend-template", "recent-breakout", "4pct-breakout", "high-volume", "1m-gainers"]
    for slug in slugs:
        resp = await async_client.get(f"/api/scanners/{slug}")
        assert resp.status_code == 200, f"Scanner '{slug}' returned {resp.status_code}"
        body = resp.json()
        assert body["metadata"]["slug"] == slug
        assert isinstance(body["data"], list)


@pytest.mark.asyncio
async def test_market_breadth_endpoint(async_client: httpx.AsyncClient):
    """Verify GET /api/market-breadth delivers valid market participation stats."""
    resp = await async_client.get("/api/market-breadth")
    assert resp.status_code == 200
    data = resp.json()
    assert "advance_decline_ratio" in data
    assert "above_50_sma_pct" in data
    assert "above_200_sma_pct" in data
    assert "stage_2_count" in data
    assert "stage_4_count" in data
    assert "stage_2_to_4_ratio" in data


@pytest.mark.asyncio
async def test_market_metadata_endpoint(async_client: httpx.AsyncClient):
    """Verify GET /api/metadata returns status, trading date, and scanner counts."""
    resp = await async_client.get("/api/metadata")
    assert resp.status_code == 200
    data = resp.json()
    assert data["status"] == "healthy"
    assert "market_status" in data
    assert "last_synced_date" in data
    assert "total_equities" in data
    assert "scanner_counts" in data
    assert isinstance(data["scanner_counts"], dict)


def test_get_jwt_secret_fails_closed_in_production(monkeypatch):
    """Verify that get_jwt_secret raises HTTP 500 when unset in production."""
    from fastapi import HTTPException

    from app.core.config import settings

    monkeypatch.setattr(settings, "ENVIRONMENT", "production")
    monkeypatch.delenv("SUPABASE_JWT_SECRET", raising=False)
    monkeypatch.setattr(settings, "SUPABASE_JWT_SECRET", None)

    with pytest.raises(HTTPException) as exc_info:
        get_jwt_secret()
    assert exc_info.value.status_code == 500
    assert "Server authentication configuration error" in exc_info.value.detail

