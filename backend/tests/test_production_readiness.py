"""TRADESCOUT — Production Readiness Backend Verification Test Suite.

Authoritative specification tests covering:
- R1: All 11 scanner presets (trend-template, recent-breakout, 4pct-breakout, high-volume,
      1m-gainers, stage-2-breakout, 20-sma-pullback, 3m-gainers, outperformers, doublers, new-listing-ipo).
- R3: Watchlist and Chart Favourites REST APIs with user auth headers (x-user-id).
- Multi-tenant data isolation and boundary cases.
"""

import uuid
from collections.abc import AsyncGenerator

import httpx
import pytest
from httpx import ASGITransport
from jose import jwt

from app.core.auth import get_jwt_secret
from app.main import app
from app.services.database import reset_in_memory_store

ALL_11_SCANNER_SLUGS = [
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


@pytest.fixture(autouse=True)
def clean_in_memory_state():
    """Ensure in-memory store starts clean before each test."""
    reset_in_memory_store()
    yield
    reset_in_memory_store()


@pytest.fixture
def create_test_token():
    """Factory fixture for signing test Supabase JWTs."""

    def _generate(plan: str = "free", sub: str | None = None) -> str:
        secret = get_jwt_secret()
        user_uuid = sub or str(uuid.uuid4())
        payload = {
            "sub": user_uuid,
            "email": f"{user_uuid[:8]}@tradescout.in",
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
    async with httpx.AsyncClient(transport=transport, base_url="http://testserver") as test_client:
        yield test_client


# ==============================================================================
# Requirement R1: Scanner Presets Coverage (All 11 Slugs)
# ==============================================================================


@pytest.mark.asyncio
@pytest.mark.parametrize("slug", ALL_11_SCANNER_SLUGS)
async def test_scanner_preset_returns_200_and_valid_envelope(
    async_client: httpx.AsyncClient, slug: str
):
    """Verify that all 11 scanner presets return 200 OK without 404 or fallback."""
    resp = await async_client.get(
        f"/api/scanners/{slug}",
        headers={"x-forwarded-for": f"10.10.1.{hash(slug) % 250}"},
    )
    assert resp.status_code == 200, (
        f"Scanner '{slug}' returned {resp.status_code}. Expected 200 OK without 404."
    )
    payload = resp.json()

    assert "metadata" in payload, f"Scanner '{slug}' response missing 'metadata'"
    assert "data" in payload, f"Scanner '{slug}' response missing 'data'"
    assert isinstance(payload["data"], list), f"Scanner '{slug}' data must be a list"

    metadata = payload["metadata"]
    assert metadata.get("slug") == slug, (
        f"Scanner returned metadata slug '{metadata.get('slug')}', expected '{slug}'. "
        "Must not fallback to trend-template!"
    )
    assert "total_matches" in metadata
    assert isinstance(metadata["total_matches"], int)


@pytest.mark.asyncio
@pytest.mark.parametrize("slug", ALL_11_SCANNER_SLUGS)
async def test_guest_freemium_truncation_all_presets(
    async_client: httpx.AsyncClient, slug: str
):
    """Verify that unauthenticated guests receive at most 10 items for every scanner preset."""
    resp = await async_client.get(
        f"/api/scanners/{slug}",
        headers={"x-forwarded-for": f"10.10.2.{hash(slug) % 250}"},
    )
    assert resp.status_code == 200
    payload = resp.json()
    data = payload["data"]
    metadata = payload["metadata"]

    assert len(data) <= 10, (
        f"Guest received {len(data)} items for '{slug}', exceeding 10-row freemium limit"
    )
    if metadata["total_matches"] > 10:
        assert metadata["is_truncated"] is True
        assert payload.get("is_truncated") is True


@pytest.mark.asyncio
@pytest.mark.parametrize("slug", ALL_11_SCANNER_SLUGS)
async def test_pro_user_unlocks_full_dataset(
    async_client: httpx.AsyncClient, create_test_token, slug: str
):
    """Verify that Pro tier users receive un-truncated datasets for every scanner preset."""
    user_uuid = "00000000-0000-0000-0000-000000000001"
    token = create_test_token(plan="pro", sub=user_uuid)
    resp = await async_client.get(
        f"/api/scanners/{slug}?limit=50",
        headers={
            "Authorization": f"Bearer {token}",
            "x-forwarded-for": f"10.10.3.{hash(slug) % 250}",
        },
    )
    assert resp.status_code == 200
    payload = resp.json()
    metadata = payload["metadata"]

    assert metadata["is_truncated"] is False, (
        f"Pro user should receive is_truncated=False for '{slug}'"
    )
    assert payload.get("is_truncated") is False
    total = metadata["total_matches"]
    returned = len(payload["data"])
    if total > 10:
        assert returned > 10, f"Expected >10 rows for pro user on '{slug}', got {returned}"


@pytest.mark.asyncio
async def test_unsupported_scanner_slug_returns_404(async_client: httpx.AsyncClient):
    """Verify that invalid/unknown scanner slugs return 404 Not Found."""
    resp = await async_client.get(
        "/api/scanners/completely-invalid-scanner-slug",
        headers={"x-forwarded-for": "10.10.4.1"},
    )
    assert resp.status_code == 404
    body = resp.json()
    assert body["detail"]["error"] == "not_found"


@pytest.mark.asyncio
async def test_scanner_boundary_empty_filter_results(async_client: httpx.AsyncClient):
    """Verify that extreme filter criteria return empty list gracefully without error."""
    resp = await async_client.get(
        "/api/scanners/trend-template?min_rs=99&min_rvol=50.0",
        headers={"x-forwarded-for": "10.10.4.2"},
    )
    assert resp.status_code == 200
    payload = resp.json()
    assert isinstance(payload["data"], list)
    assert payload["metadata"]["returned"] == len(payload["data"])


@pytest.mark.asyncio
async def test_scanner_sorting_order(async_client: httpx.AsyncClient):
    """Verify dynamic sorting ascending and descending on candidate fields."""
    resp_asc = await async_client.get(
        "/api/scanners/trend-template?sort_by=cmp&direction=asc&limit=20",
        headers={"x-forwarded-for": "10.10.4.3"},
    )
    assert resp_asc.status_code == 200
    cmps_asc = [s["cmp"] for s in resp_asc.json()["data"] if s.get("cmp") is not None]
    assert cmps_asc == sorted(cmps_asc)

    resp_desc = await async_client.get(
        "/api/scanners/trend-template?sort_by=cmp&direction=desc&limit=20",
        headers={"x-forwarded-for": "10.10.4.4"},
    )
    assert resp_desc.status_code == 200
    cmps_desc = [s["cmp"] for s in resp_desc.json()["data"] if s.get("cmp") is not None]
    assert cmps_desc == sorted(cmps_desc, reverse=True)


# ==============================================================================
# Requirement R3: Watchlists REST API & Multi-Tenant Isolation
# ==============================================================================


@pytest.mark.asyncio
async def test_watchlist_rest_crud_workflow(async_client: httpx.AsyncClient):
    """Verify complete CRUD sync for stock detail watchlist integration with auth headers."""
    user_id = "11111111-1111-1111-1111-111111111111"
    headers = {"x-user-id": user_id, "x-forwarded-for": "10.10.5.1"}

    # 1. Get initial watchlists for user
    res = await async_client.get("/api/watchlists", headers=headers)
    assert res.status_code == 200
    body = res.json()
    watchlists = body.get("watchlists", [])
    assert len(watchlists) >= 1
    primary_id = watchlists[0]["id"]

    # 2. Add stock via POST /api/watchlists/{id}/items
    add_res = await async_client.post(
        f"/api/watchlists/{primary_id}/items",
        json={"symbol": "INFY"},
        headers=headers,
    )
    assert add_res.status_code in (200, 201)

    # 3. Verify stock is in watchlist detail
    detail_res = await async_client.get(f"/api/watchlists/{primary_id}", headers=headers)
    assert detail_res.status_code == 200
    detail = detail_res.json()
    items = detail.get("watchlist", {}).get("items", []) or detail.get("items", [])
    symbols = [item["symbol"] for item in items]
    assert "INFY" in symbols

    # 4. Remove stock via DELETE /api/watchlists/{id}/items/{symbol}
    del_res = await async_client.delete(
        f"/api/watchlists/{primary_id}/items/INFY",
        headers=headers,
    )
    assert del_res.status_code == 200

    # 5. Verify stock was removed
    detail_res2 = await async_client.get(f"/api/watchlists/{primary_id}", headers=headers)
    detail2 = detail_res2.json()
    items2 = detail2.get("watchlist", {}).get("items", []) or detail2.get("items", [])
    symbols2 = [item["symbol"] for item in items2]
    assert "INFY" not in symbols2


@pytest.mark.asyncio
async def test_chart_favourites_auth_persistence_and_isolation(
    async_client: httpx.AsyncClient,
):
    """Verify favourites persist per user identity via x-user-id header."""
    user_a = "11111111-1111-1111-1111-111111111111"
    user_b = "22222222-2222-2222-2222-222222222222"

    # User A toggles RELIANCE
    res_a1 = await async_client.post(
        "/api/favourites/RELIANCE/toggle",
        headers={"x-user-id": user_a, "x-forwarded-for": "10.10.5.2"},
    )
    assert res_a1.status_code == 200
    assert res_a1.json()["is_favourite"] is True

    # User A gets favourites
    get_a = await async_client.get(
        "/api/favourites",
        headers={"x-user-id": user_a, "x-forwarded-for": "10.10.5.2"},
    )
    assert get_a.status_code == 200
    assert "RELIANCE" in get_a.json()["favourites"]

    # User B should NOT have RELIANCE (multi-tenant isolation)
    get_b = await async_client.get(
        "/api/favourites",
        headers={"x-user-id": user_b, "x-forwarded-for": "10.10.5.3"},
    )
    assert get_b.status_code == 200
    assert "RELIANCE" not in get_b.json()["favourites"]

    # User A untoggles RELIANCE
    res_a2 = await async_client.post(
        "/api/favourites/RELIANCE/toggle",
        headers={"x-user-id": user_a, "x-forwarded-for": "10.10.5.2"},
    )
    assert res_a2.status_code == 200
    assert res_a2.json()["is_favourite"] is False
