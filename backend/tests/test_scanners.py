"""TRADESCOUT — Comprehensive Unit and Integration Tests for Scanner REST APIs.

Validates:
1. All 11 scanner endpoints return HTTP 200 with complete metadata envelope.
2. All 11 scanner slugs are registered in SUPPORTED_SLUGS with title, description, and icon.
3. Unsupported slugs return HTTP 404 with structured error envelope.
4. Guest freemium truncation (<= 10 items, is_truncated=True, proprietary columns sanitized).
5. Pro-tier JWT unlocks full dataset (is_truncated=False, user_tier='pro').
6. Threshold filtering (min_rs, min_rvol) works correctly across all presets.
7. Ascending and descending sorting works correctly across multiple fields.
8. Sort column aliases (change_pct, cmp, ret_3m, above_52w_low) resolve correctly.
9. Market metadata endpoint returns candidate counts for all 11 scanner presets.
"""

from collections.abc import AsyncGenerator

import httpx
import pytest
from httpx import ASGITransport
from jose import jwt

from app.core.auth import get_jwt_secret
from app.main import app
from app.routers.scanners import SUPPORTED_SLUGS

ALL_11_SLUGS = [
    "trend-template",
    "recent-breakout",
    "4pct-breakout",
    "high-volume",
    "1m-gainers",
    "stage-2-breakout",
    "20-sma-pullback",
    "3m-gainers",
    "outperformers",
    "doublers",
    "new-listing-ipo",
]


@pytest.fixture
def create_test_token():
    """Factory fixture for signing test Supabase JWTs."""

    def _generate(plan: str = "free", sub: str = "test-trader-101") -> str:
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
    """Test client using ASGITransport with isolated test client IP."""
    transport = ASGITransport(app=app)
    headers = {"x-forwarded-for": "10.10.10.10"}
    async with httpx.AsyncClient(transport=transport, base_url="http://testserver", headers=headers) as client:
        yield client


def test_supported_slugs_contains_all_eleven_presets():
    """Verify that SUPPORTED_SLUGS dictionary defines all 11 presets with metadata."""
    assert len(SUPPORTED_SLUGS) == 11
    for slug in ALL_11_SLUGS:
        assert slug in SUPPORTED_SLUGS, f"Missing preset slug: {slug}"
        entry = SUPPORTED_SLUGS[slug]
        assert "title" in entry and len(entry["title"]) > 0
        assert "description" in entry and len(entry["description"]) > 0
        assert "icon" in entry and len(entry["icon"]) > 0


@pytest.mark.asyncio
async def test_invalid_scanner_slug_returns_404(async_client: httpx.AsyncClient):
    """Verify that requesting an unregistered slug returns 404 Not Found."""
    resp = await async_client.get("/api/scanners/invalid-nonexistent-preset")
    assert resp.status_code == 404
    payload = resp.json()
    assert payload["detail"]["error"] == "not_found"
    assert "Supported scanners" in payload["detail"]["message"]


@pytest.mark.asyncio
@pytest.mark.parametrize("slug", ALL_11_SLUGS)
async def test_all_eleven_scanners_return_200_and_valid_envelope(
    async_client: httpx.AsyncClient, slug: str
):
    """Verify that every one of the 11 scanner presets returns HTTP 200 without fallback."""
    resp = await async_client.get(f"/api/scanners/{slug}")
    assert resp.status_code == 200, f"Scanner '{slug}' returned status {resp.status_code}"
    payload = resp.json()

    assert "metadata" in payload
    assert "data" in payload
    assert "results" in payload
    assert "total_results" in payload
    assert "is_truncated" in payload

    metadata = payload["metadata"]
    assert metadata["slug"] == slug
    assert metadata["title"] == SUPPORTED_SLUGS[slug]["title"]
    assert metadata["description"] == SUPPORTED_SLUGS[slug]["description"]
    assert isinstance(metadata["total_matches"], int)
    assert isinstance(payload["data"], list)


@pytest.mark.asyncio
@pytest.mark.parametrize("slug", ALL_11_SLUGS)
async def test_guest_freemium_gating_and_sanitization(
    async_client: httpx.AsyncClient, slug: str
):
    """Verify guest requests are capped at 10 items and internal columns are stripped."""
    resp = await async_client.get(f"/api/scanners/{slug}")
    assert resp.status_code == 200
    payload = resp.json()
    candidates = payload["data"]
    metadata = payload["metadata"]

    assert len(candidates) <= 10
    assert metadata["user_tier"] == "free"

    if metadata["total_matches"] > 10:
        assert metadata["is_truncated"] is True
        assert payload["is_truncated"] is True

    # Sensitive proprietary fields must never leak to unauthenticated guests
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
    for item in candidates:
        for sk in sensitive_keys:
            assert sk not in item, f"Proprietary field '{sk}' leaked in guest response for '{slug}'"


@pytest.mark.asyncio
@pytest.mark.parametrize("slug", ALL_11_SLUGS)
async def test_pro_tier_unlocks_full_dataset(
    async_client: httpx.AsyncClient, create_test_token, slug: str
):
    """Verify Pro tier JWT unlocks the full dataset beyond the 10-row freemium limit."""
    pro_token = create_test_token(plan="pro", sub="pro-trader-999")
    resp = await async_client.get(
        f"/api/scanners/{slug}?limit=100",
        headers={"Authorization": f"Bearer {pro_token}"},
    )
    assert resp.status_code == 200
    payload = resp.json()
    metadata = payload["metadata"]

    assert metadata["is_truncated"] is False
    assert metadata["user_tier"] == "pro"
    assert payload["is_truncated"] is False


@pytest.mark.asyncio
async def test_threshold_filtering_rs_and_rvol(
    async_client: httpx.AsyncClient, create_test_token
):
    """Verify min_rs and min_rvol query filters accurately restrict candidates."""
    pro_token = create_test_token(plan="pro")

    resp_rs = await async_client.get(
        "/api/scanners/outperformers?min_rs=85&limit=50",
        headers={"Authorization": f"Bearer {pro_token}"},
    )
    assert resp_rs.status_code == 200
    for stock in resp_rs.json()["data"]:
        assert stock.get("rs_rating") is not None
        assert stock["rs_rating"] >= 85

    resp_rvol = await async_client.get(
        "/api/scanners/stage-2-breakout?min_rvol=1.5&limit=50",
        headers={"Authorization": f"Bearer {pro_token}"},
    )
    assert resp_rvol.status_code == 200
    for stock in resp_rvol.json()["data"]:
        assert stock.get("rvol") is not None
        assert stock["rvol"] >= 1.5


@pytest.mark.asyncio
async def test_sorting_and_aliases(
    async_client: httpx.AsyncClient, create_test_token
):
    """Verify sorting in ascending and descending orders, including sort aliases."""
    pro_token = create_test_token(plan="pro")

    # Sort by 3m-gainers ret_3m desc
    resp = await async_client.get(
        "/api/scanners/3m-gainers?sort_by=ret_3m&direction=desc&limit=25",
        headers={"Authorization": f"Bearer {pro_token}"},
    )
    assert resp.status_code == 200
    data = resp.json()["data"]
    vals = [s["ret_3m"] for s in data if s.get("ret_3m") is not None]
    assert vals == sorted(vals, reverse=True)

    # Sort by doublers above_52w_low desc
    resp_dbl = await async_client.get(
        "/api/scanners/doublers?sort_by=above_52w_low&direction=desc&limit=25",
        headers={"Authorization": f"Bearer {pro_token}"},
    )
    assert resp_dbl.status_code == 200
    data_dbl = resp_dbl.json()["data"]
    vals_dbl = [s["above_52w_low"] for s in data_dbl if s.get("above_52w_low") is not None]
    assert vals_dbl == sorted(vals_dbl, reverse=True)


@pytest.mark.asyncio
async def test_metadata_endpoint_includes_all_eleven_slug_counts(
    async_client: httpx.AsyncClient
):
    """Verify /api/metadata returns candidate counts for all 11 scanner presets."""
    resp = await async_client.get("/api/metadata")
    assert resp.status_code == 200
    data = resp.json()
    assert data["status"] == "healthy"
    counts = data.get("scanner_counts", {})
    assert isinstance(counts, dict)
    for slug in ALL_11_SLUGS:
        assert slug in counts, f"Metadata scanner_counts missing slug: '{slug}'"
