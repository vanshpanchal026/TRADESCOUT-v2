"""TRADESCOUT — Challenger Adversarial Verification Suite (Backend 2).

Empirical adversarial tests for:
1. Probe all 11 scanner presets (Redis key existence, TTL > 0, valid JSON candidates with numeric fields,
   FastAPI HTTP 200 without 404 or fallback).
2. Probe Indicator Calculations (RS ratings, 52-week high/low, moving averages, null/missing data safety).
3. Multi-Tenant Preset Isolation across preset user IDs:
   - 00000000-0000-0000-0000-000000000001 (User 1)
   - 22222222-2222-2222-2222-222222222222 (User 2)
   - 33333333-3333-3333-3333-333333333333 (User 3)
   in watchlists and chart favourites.
"""

import json
import uuid
from collections.abc import AsyncGenerator
from datetime import date, timedelta

import httpx
import polars as pl
import pytest
from httpx import ASGITransport
from jose import jwt
from redis.asyncio import Redis

from app.core.auth import get_jwt_secret
from app.core.config import settings
from app.main import app
from app.services.database import reset_in_memory_store
from app.services.indicators import calculate_daily_rs_ratings, compute_indicators

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

PRESET_USER_IDS = [
    "00000000-0000-0000-0000-000000000001",
    "22222222-2222-2222-2222-222222222222",
    "33333333-3333-3333-3333-333333333333",
]


@pytest.fixture(autouse=True)
def clean_state():
    """Reset in-memory storage before each test for clean isolation."""
    reset_in_memory_store()
    yield
    reset_in_memory_store()


@pytest.fixture
async def redis_client() -> AsyncGenerator[Redis, None]:
    """Provide async Redis client connected to configured instance."""
    client = Redis.from_url(
        settings.REDIS_URL,
        encoding="utf-8",
        decode_responses=True,
        socket_connect_timeout=3.0,
        socket_timeout=3.0,
    )
    try:
        yield client
    finally:
        await client.aclose()


@pytest.fixture
def make_pro_token():
    """Create signed Pro JWT token for testing authenticated requests."""
    def _make(user_id: str | None = None) -> str:
        secret = get_jwt_secret()
        uid = user_id or str(uuid.uuid4())
        payload = {
            "sub": uid,
            "email": f"{uid[:8]}@tradescout.dev",
            "role": "authenticated",
            "user_metadata": {"plan": "pro"},
            "app_metadata": {"plan": "pro"},
        }
        return jwt.encode(payload, secret, algorithm="HS256")
    return _make


@pytest.fixture
async def api_client() -> AsyncGenerator[httpx.AsyncClient, None]:
    """FastAPI AsyncClient using ASGITransport."""
    transport = ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://testserver") as client:
        yield client


# ==============================================================================
# TARGET 1: PROBE ALL 11 SCANNER PRESETS (REDIS & FASTAPI)
# ==============================================================================


@pytest.mark.asyncio
@pytest.mark.parametrize("slug", ALL_11_SCANNER_SLUGS)
async def test_probe_redis_key_exists_and_positive_ttl(redis_client: Redis, slug: str):
    """Verify that each of the 11 scanner presets exists in Redis with positive TTL."""
    key = f"scanner:{slug}:latest"
    exists = await redis_client.exists(key)
    assert exists == 1, f"Redis key '{key}' does not exist! Scanners must be pre-cached."

    ttl = await redis_client.ttl(key)
    assert ttl > 0, f"Redis key '{key}' has non-positive TTL ({ttl})!"


@pytest.mark.asyncio
@pytest.mark.parametrize("slug", ALL_11_SCANNER_SLUGS)
async def test_probe_redis_payload_valid_json_and_numeric_candidates(redis_client: Redis, slug: str):
    """Verify Redis payload contains valid JSON envelope and valid numeric candidate records."""
    key = f"scanner:{slug}:latest"
    raw_data = await redis_client.get(key)
    assert raw_data is not None, f"Redis key '{key}' returned None"

    payload = json.loads(raw_data)
    assert isinstance(payload, dict), f"Payload for '{slug}' must be a JSON object"
    assert payload.get("slug") == slug, f"Payload slug mismatch: expected '{slug}', got '{payload.get('slug')}'"
    assert "date" in payload, f"Payload for '{slug}' missing 'date'"
    assert "total_matches" in payload, f"Payload for '{slug}' missing 'total_matches'"
    assert isinstance(payload["total_matches"], int), f"total_matches must be int in '{slug}'"
    assert "updated_at" in payload, f"Payload for '{slug}' missing 'updated_at'"
    assert "data" in payload, f"Payload for '{slug}' missing 'data'"
    assert isinstance(payload["data"], list), f"data must be a list in '{slug}'"
    assert payload["total_matches"] == len(payload["data"]), (
        f"total_matches ({payload['total_matches']}) != len(data) ({len(payload['data'])}) in Redis for '{slug}'"
    )

    # Verify candidate records have numeric fields without corruption
    for idx, item in enumerate(payload["data"]):
        assert isinstance(item, dict), f"Candidate #{idx} in '{slug}' is not a dict"
        assert "symbol" in item, f"Candidate #{idx} in '{slug}' missing 'symbol'"
        assert isinstance(item["symbol"], str) and len(item["symbol"]) > 0

        # Numeric price & return fields
        assert "cmp" in item, f"Candidate #{idx} ({item.get('symbol')}) in '{slug}' missing 'cmp'"
        assert isinstance(item["cmp"], (int, float)), f"'cmp' must be numeric, got {type(item['cmp'])}"
        assert item["cmp"] > 0, f"'cmp' must be positive, got {item['cmp']}"

        assert "day_change" in item, f"Candidate #{idx} in '{slug}' missing 'day_change'"
        assert isinstance(
            item["day_change"], (int, float)
        ), f"'day_change' must be numeric, got {type(item['day_change'])}"

        if "volume" in item and item["volume"] is not None:
            assert isinstance(item["volume"], (int, float)), f"'volume' must be numeric, got {type(item['volume'])}"
            assert item["volume"] >= 0

        if "rvol" in item and item["rvol"] is not None:
            assert isinstance(item["rvol"], (int, float)), "'rvol' must be numeric"

        if "rsi" in item and item["rsi"] is not None:
            assert isinstance(item["rsi"], (int, float)), "'rsi' must be numeric"
            assert 0.0 <= item["rsi"] <= 100.0, f"'rsi' out of bounds: {item['rsi']}"

        if "rs_rating" in item and item["rs_rating"] is not None:
            assert isinstance(item["rs_rating"], int), "'rs_rating' must be int"
            assert 1 <= item["rs_rating"] <= 99, f"'rs_rating' out of bounds: {item['rs_rating']}"


@pytest.mark.asyncio
@pytest.mark.parametrize("slug", ALL_11_SCANNER_SLUGS)
async def test_probe_fastapi_endpoint_guest_returns_200_and_no_fallback(
    api_client: httpx.AsyncClient, slug: str
):
    """Verify requesting each slug as guest returns HTTP 200, matching slug, and max 10 candidates."""
    resp = await api_client.get(
        f"/api/scanners/{slug}",
        headers={"x-user-id": "guest", "x-forwarded-for": f"10.20.1.{hash(slug) % 250}"},
    )
    assert resp.status_code == 200, f"GET /api/scanners/{slug} returned {resp.status_code}"

    payload = resp.json()
    metadata = payload.get("metadata", {})
    assert metadata.get("slug") == slug, f"Metadata slug '{metadata.get('slug')}' != '{slug}' (Fallback detected!)"
    assert metadata.get("user_tier") == "free", f"Guest user_tier expected 'free', got {metadata.get('user_tier')}"

    candidates = payload.get("data", [])
    assert isinstance(candidates, list)
    assert len(candidates) <= 10, f"Guest received {len(candidates)} candidates, strictly capped at 10!"
    total = metadata.get("total_matches", 0)
    if total > 10:
        assert metadata.get("is_truncated") is True, "Truncated flag must be True for guest when matches > 10"
        assert payload.get("is_truncated") is True


@pytest.mark.asyncio
@pytest.mark.parametrize("slug", ALL_11_SCANNER_SLUGS)
async def test_probe_fastapi_endpoint_pro_returns_200_and_unlocked_dataset(
    api_client: httpx.AsyncClient, make_pro_token, slug: str
):
    """Verify requesting each slug as Pro returns HTTP 200, matching slug, and unlocked dataset (>10 rows)."""
    pro_token = make_pro_token("00000000-0000-0000-0000-000000000001")
    resp = await api_client.get(
        f"/api/scanners/{slug}?limit=50",
        headers={
            "Authorization": f"Bearer {pro_token}",
            "x-forwarded-for": f"10.20.2.{hash(slug) % 250}",
        },
    )
    assert resp.status_code == 200, f"GET /api/scanners/{slug} for Pro returned {resp.status_code}"

    payload = resp.json()
    metadata = payload.get("metadata", {})
    assert metadata.get("slug") == slug, f"Metadata slug '{metadata.get('slug')}' != '{slug}'"
    assert metadata.get("user_tier") == "pro", f"Pro user_tier expected 'pro', got {metadata.get('user_tier')}"
    assert metadata.get("is_truncated") is False, "Pro user must not have is_truncated=True"

    candidates = payload.get("data", [])
    total_matches = metadata.get("total_matches", 0)
    if total_matches > 10:
        assert len(candidates) > 10, f"Pro user on '{slug}' expected >10 candidates, got {len(candidates)}"


@pytest.mark.asyncio
@pytest.mark.parametrize("slug", ALL_11_SCANNER_SLUGS)
async def test_probe_fastapi_endpoint_guest_cannot_bypass_limit_via_query_params(
    api_client: httpx.AsyncClient, slug: str
):
    """Adversarial probe: Verify guest user requesting limit=2500 is STILL capped at 10 rows."""
    resp = await api_client.get(
        f"/api/scanners/{slug}?limit=2500&offset=0",
        headers={"x-user-id": "guest", "x-forwarded-for": f"10.20.3.{hash(slug) % 250}"},
    )
    assert resp.status_code == 200
    payload = resp.json()
    candidates = payload.get("data", [])
    assert len(candidates) <= 10, f"Guest bypassed 10-row freemium limit on '{slug}'! Got {len(candidates)}"


@pytest.mark.asyncio
async def test_unsupported_slug_returns_404_strictly(api_client: httpx.AsyncClient):
    """Verify an unknown or unsupported slug returns HTTP 404, NEVER falling back to trend-template."""
    bad_slugs = ["non-existent-scan", "stage-3-breakout", "random-crypto-scanner", "trend_template"]
    for slug in bad_slugs:
        resp = await api_client.get(
            f"/api/scanners/{slug}",
            headers={"x-forwarded-for": f"10.20.4.{hash(slug) % 250}"},
        )
        assert resp.status_code == 404, f"GET /api/scanners/{slug} returned {resp.status_code}, expected 404!"
        err = resp.json()
        assert "not supported" in str(err).lower() or "not found" in str(err).lower()


# ==============================================================================
# TARGET 2: PROBE INDICATOR CALCULATIONS & MISSING/NULL DATA SAFETY
# ==============================================================================


def test_indicator_calculation_empty_dataframe_safety():
    """Verify compute_indicators does not crash on an empty DataFrame."""
    schema = {
        "date": pl.Date,
        "symbol": pl.Utf8,
        "series": pl.Utf8,
        "open": pl.Float64,
        "high": pl.Float64,
        "low": pl.Float64,
        "close": pl.Float64,
        "volume": pl.Int64,
        "prev_close": pl.Float64,
    }
    df_empty = pl.DataFrame(schema=schema)
    res = compute_indicators(df_empty)
    assert isinstance(res, pl.DataFrame)
    assert res.height == 0


def test_indicator_calculation_single_bar_safety():
    """Verify compute_indicators safely handles a stock with only 1 trading session (no history)."""
    df_single = pl.DataFrame(
        {
            "date": [date(2026, 11, 13)],
            "symbol": ["SINGLE_BAR"],
            "series": ["EQ"],
            "open": [100.0],
            "high": [105.0],
            "low": [98.0],
            "close": [102.0],
            "volume": [10000],
            "prev_close": [100.0],
        }
    )
    res = compute_indicators(df_single)
    assert isinstance(res, pl.DataFrame)
    assert res.height == 1
    row = res.to_dicts()[0]
    assert row["cmp"] == 102.0
    assert row["day_change"] == 2.0
    # SMAs requiring multiple bars should be null, not crashed
    assert row["sma_20"] is None
    assert row["sma_50"] is None
    assert row["sma_200"] is None
    assert row["slope_200"] is None
    # 52w high/low with min_samples=20 should be null
    assert row["high_52w"] is None
    assert row["low_52w"] is None
    # minervini conditions computed cleanly
    assert row["conditions_met"] == 0
    assert row["minervini_pass"] is False
    assert row["stage"] in [1, 2, 3, 4]


def test_indicator_calculation_zero_volume_and_zero_moving_averages():
    """Verify compute_indicators handles zero volume, zero close, and avoids ZeroDivisionError."""
    df_zeros = pl.DataFrame(
        {
            "date": [date(2026, 1, 1) + timedelta(days=i) for i in range(60)],
            "symbol": ["ZERO_VOL"] * 60,
            "series": ["EQ"] * 60,
            "open": [10.0] * 60,
            "high": [10.0] * 60,
            "low": [10.0] * 60,
            "close": [10.0] * 60,
            "volume": [0] * 60,  # Zero volume throughout!
            "prev_close": [10.0] * 60,
        }
    )
    res = compute_indicators(df_zeros)
    assert res.height == 60
    latest = res.to_dicts()[-1]
    # vol_sma_50 is 0.0, RVOL denominator must not throw ZeroDivisionError
    assert latest["rvol"] == 0.0
    # RSI for flat series should not throw ZeroDivisionError
    assert latest["rsi"] is not None


def test_indicator_calculation_penny_stock_and_extreme_values():
    """Verify compute_indicators handles penny stocks (< 0.10) and ultra-high prices (> 100,000)."""
    dates = [date(2025, 1, 1) + timedelta(days=i) for i in range(260)]
    penny_rows = {
        "date": dates,
        "symbol": ["PENNY"] * 260,
        "series": ["EQ"] * 260,
        "open": [0.05] * 260,
        "high": [0.06] * 260,
        "low": [0.04] * 260,
        "close": [0.05 + (i * 0.001) for i in range(260)],
        "volume": [1000] * 260,
        "prev_close": [0.05] * 260,
    }
    df_penny = pl.DataFrame(penny_rows)
    res_penny = compute_indicators(df_penny)
    assert res_penny.height == 260
    latest = res_penny.to_dicts()[-1]
    assert latest["cmp"] > 0
    assert latest["from_52w_high"] is not None
    assert latest["above_52w_low"] is not None


def test_rs_ratings_calculation_null_safety_and_boundaries():
    """Verify calculate_daily_rs_ratings handles empty data, null scores, and ordinal ranks properly."""
    # 1. Empty DataFrame
    df_empty = pl.DataFrame(schema={"raw_rs_score": pl.Float64, "symbol": pl.Utf8})
    res_empty = calculate_daily_rs_ratings(df_empty)
    assert res_empty.height == 0

    # 2. Single item DataFrame
    df_single = pl.DataFrame({"symbol": ["ONLY_ONE"], "raw_rs_score": [12.5]})
    res_single = calculate_daily_rs_ratings(df_single)
    assert res_single["rs_rating"][0] == 50  # Default middle score for single equity

    # 3. All null raw_rs_scores
    df_nulls = pl.DataFrame({
        "symbol": ["S1", "S2", "S3", "S4", "S5"],
        "raw_rs_score": [None, None, None, None, None],
    })
    res_nulls = calculate_daily_rs_ratings(df_nulls)
    assert res_nulls.height == 5
    for r in res_nulls["rs_rating"]:
        assert isinstance(r, int)
        assert 1 <= r <= 99

    # 4. Tie / identical scores
    df_ties = pl.DataFrame({
        "symbol": ["T1", "T2", "T3"],
        "raw_rs_score": [10.0, 10.0, 10.0],
    })
    res_ties = calculate_daily_rs_ratings(df_ties)
    assert res_ties.height == 3
    for r in res_ties["rs_rating"]:
        assert 1 <= r <= 99

    # 5. Full spectrum 100 items: lowest should be 1 or near 1, highest should be 99
    df_spectrum = pl.DataFrame({
        "symbol": [f"SYM_{i}" for i in range(100)],
        "raw_rs_score": [float(i * 10) for i in range(100)],
    })
    res_spectrum = calculate_daily_rs_ratings(df_spectrum)
    ratings = res_spectrum["rs_rating"].to_list()
    assert min(ratings) >= 1
    assert max(ratings) <= 99
    assert ratings[-1] == 99  # Highest raw score gets 99
    assert ratings[0] <= 2    # Lowest raw score gets 1 or 2


# ==============================================================================
# TARGET 3: MULTI-TENANT PRESET ISOLATION PROBES (USER 1, USER 2, USER 3)
# ==============================================================================


@pytest.mark.asyncio
async def test_multitenant_preset_profiles_and_primary_watchlists_seeded(api_client: httpx.AsyncClient):
    """Verify that preset IDs (0000...0001, 2222...2222, 3333...3333) all have primary watchlists seeded."""
    for user_id in PRESET_USER_IDS:
        resp = await api_client.get(
            "/api/watchlists",
            headers={"x-user-id": user_id, "x-forwarded-for": f"10.30.1.{hash(user_id) % 250}"},
        )
        assert resp.status_code == 200, f"GET /api/watchlists for {user_id} returned {resp.status_code}"
        data = resp.json()
        assert data.get("status") == "success"
        watchlists = data.get("watchlists", [])
        assert len(watchlists) >= 1, f"User {user_id} must have at least 1 seeded primary watchlist"
        primary = watchlists[0]
        assert primary.get("is_default") is True, f"Primary watchlist for {user_id} must have is_default=True"
        assert primary.get("name") == "Primary Watchlist"


@pytest.mark.asyncio
async def test_multitenant_watchlist_cross_contamination_and_isolation(api_client: httpx.AsyncClient):
    """Verify that stocks added to User 1's watchlist never appear in User 2's or User 3's watchlists."""
    u1, u2, u3 = PRESET_USER_IDS

    # 1. Get primary watchlist ID for each user
    res1 = await api_client.get(
        "/api/watchlists",
        headers={"x-user-id": u1, "x-forwarded-for": "10.30.2.1"},
    )
    res2 = await api_client.get(
        "/api/watchlists",
        headers={"x-user-id": u2, "x-forwarded-for": "10.30.2.2"},
    )
    res3 = await api_client.get(
        "/api/watchlists",
        headers={"x-user-id": u3, "x-forwarded-for": "10.30.2.3"},
    )

    w1_id = res1.json()["watchlists"][0]["id"]
    w2_id = res2.json()["watchlists"][0]["id"]
    w3_id = res3.json()["watchlists"][0]["id"]

    # Ensure watchlist IDs are strictly distinct
    assert len({w1_id, w2_id, w3_id}) == 3, "Each preset user must have a unique watchlist ID"

    # 2. Add distinct stock to each user's primary watchlist
    p1 = await api_client.post(
        f"/api/watchlists/{w1_id}/items",
        json={"symbol": "RELIANCE", "notes": "User 1 Swing Leader"},
        headers={"x-user-id": u1, "x-forwarded-for": "10.30.2.1"},
    )
    assert p1.status_code == 201

    p2 = await api_client.post(
        f"/api/watchlists/{w2_id}/items",
        json={"symbol": "TCS", "notes": "User 2 Tech Leader"},
        headers={"x-user-id": u2, "x-forwarded-for": "10.30.2.2"},
    )
    assert p2.status_code == 201

    p3 = await api_client.post(
        f"/api/watchlists/{w3_id}/items",
        json={"symbol": "INFY", "notes": "User 3 Tech Runner"},
        headers={"x-user-id": u3, "x-forwarded-for": "10.30.2.3"},
    )
    assert p3.status_code == 201

    # 3. Retrieve watchlist details for each user and assert strict isolation
    det1 = await api_client.get(
        f"/api/watchlists/{w1_id}",
        headers={"x-user-id": u1, "x-forwarded-for": "10.30.2.1"},
    )
    symbols_u1 = [it["symbol"] for it in det1.json().get("items", [])]
    assert "RELIANCE" in symbols_u1, f"RELIANCE missing from User 1 watchlist: {symbols_u1}"
    assert "TCS" not in symbols_u1, f"TCS bled into User 1 watchlist! ({symbols_u1})"
    assert "INFY" not in symbols_u1, f"INFY bled into User 1 watchlist! ({symbols_u1})"

    det2 = await api_client.get(
        f"/api/watchlists/{w2_id}",
        headers={"x-user-id": u2, "x-forwarded-for": "10.30.2.2"},
    )
    symbols_u2 = [it["symbol"] for it in det2.json().get("items", [])]
    assert "TCS" in symbols_u2, f"TCS missing from User 2 watchlist: {symbols_u2}"
    assert "RELIANCE" not in symbols_u2, f"RELIANCE bled into User 2 watchlist! ({symbols_u2})"
    assert "INFY" not in symbols_u2, f"INFY bled into User 2 watchlist! ({symbols_u2})"

    det3 = await api_client.get(
        f"/api/watchlists/{w3_id}",
        headers={"x-user-id": u3, "x-forwarded-for": "10.30.2.3"},
    )
    symbols_u3 = [it["symbol"] for it in det3.json().get("items", [])]
    assert "INFY" in symbols_u3, f"INFY missing from User 3 watchlist: {symbols_u3}"
    assert "RELIANCE" not in symbols_u3, f"RELIANCE bled into User 3 watchlist! ({symbols_u3})"
    assert "TCS" not in symbols_u3, f"TCS bled into User 3 watchlist! ({symbols_u3})"


@pytest.mark.asyncio
async def test_multitenant_cross_user_deletion_prevention(api_client: httpx.AsyncClient):
    """Verify that User 1 cannot delete items from User 2's watchlist."""
    u1, u2 = PRESET_USER_IDS[0], PRESET_USER_IDS[1]

    # Add item to User 2's watchlist
    res2 = await api_client.get(
        "/api/watchlists",
        headers={"x-user-id": u2, "x-forwarded-for": "10.30.3.2"},
    )
    w2_id = res2.json()["watchlists"][0]["id"]
    await api_client.post(
        f"/api/watchlists/{w2_id}/items",
        json={"symbol": "TATAMOTORS"},
        headers={"x-user-id": u2, "x-forwarded-for": "10.30.3.2"},
    )

    # User 1 attempts unauthorized deletion of TATAMOTORS on w2_id
    del_attack = await api_client.delete(
        f"/api/watchlists/{w2_id}/items/TATAMOTORS",
        headers={"x-user-id": u1, "x-forwarded-for": "10.30.3.1"},
    )
    # Must be 404 Not Found (or 403 Forbidden)
    assert del_attack.status_code in [404, 403], (
        f"Unauthorized cross-tenant deletion returned {del_attack.status_code}! Expected 404 or 403."
    )

    # Verify TATAMOTORS is still present in User 2's watchlist
    det2 = await api_client.get(
        f"/api/watchlists/{w2_id}",
        headers={"x-user-id": u2, "x-forwarded-for": "10.30.3.2"},
    )
    symbols_u2 = [it["symbol"] for it in det2.json().get("items", [])]
    assert "TATAMOTORS" in symbols_u2, "TATAMOTORS was illicitly deleted by unauthorized User 1!"


@pytest.mark.asyncio
async def test_multitenant_favourites_star_toggle_isolation(api_client: httpx.AsyncClient):
    """Verify that chart favourites star toggles are strictly isolated across all 3 preset users."""
    u1, u2, u3 = PRESET_USER_IDS

    # 1. User 1 stars HDFCBANK
    t1 = await api_client.post(
        "/api/favourites/HDFCBANK/toggle",
        headers={"x-user-id": u1, "x-forwarded-for": "10.30.4.1"},
    )
    assert t1.status_code == 200
    assert t1.json()["is_favourite"] is True

    # 2. User 2 stars ICICIBANK
    t2 = await api_client.post(
        "/api/favourites/ICICIBANK/toggle",
        headers={"x-user-id": u2, "x-forwarded-for": "10.30.4.2"},
    )
    assert t2.status_code == 200
    assert t2.json()["is_favourite"] is True

    # 3. User 3 stars SBIN
    t3 = await api_client.post(
        "/api/favourites/SBIN/toggle",
        headers={"x-user-id": u3, "x-forwarded-for": "10.30.4.3"},
    )
    assert t3.status_code == 200
    assert t3.json()["is_favourite"] is True

    # 4. Check each user's favourites list
    f1 = await api_client.get(
        "/api/favourites",
        headers={"x-user-id": u1, "x-forwarded-for": "10.30.4.1"},
    )
    assert f1.json()["favourites"] == ["HDFCBANK"]

    f2 = await api_client.get(
        "/api/favourites",
        headers={"x-user-id": u2, "x-forwarded-for": "10.30.4.2"},
    )
    assert f2.json()["favourites"] == ["ICICIBANK"]

    f3 = await api_client.get(
        "/api/favourites",
        headers={"x-user-id": u3, "x-forwarded-for": "10.30.4.3"},
    )
    assert f3.json()["favourites"] == ["SBIN"]

    # 5. User 1 un-stars HDFCBANK
    t1_untoggle = await api_client.post(
        "/api/favourites/HDFCBANK/toggle",
        headers={"x-user-id": u1, "x-forwarded-for": "10.30.4.1"},
    )
    assert t1_untoggle.status_code == 200
    assert t1_untoggle.json()["is_favourite"] is False

    # 6. Verify User 1 is empty, while User 2 and User 3 remain completely unchanged
    f1_post = await api_client.get(
        "/api/favourites",
        headers={"x-user-id": u1, "x-forwarded-for": "10.30.4.1"},
    )
    assert f1_post.json()["favourites"] == []

    f2_post = await api_client.get(
        "/api/favourites",
        headers={"x-user-id": u2, "x-forwarded-for": "10.30.4.2"},
    )
    assert f2_post.json()["favourites"] == ["ICICIBANK"]

    f3_post = await api_client.get(
        "/api/favourites",
        headers={"x-user-id": u3, "x-forwarded-for": "10.30.4.3"},
    )
    assert f3_post.json()["favourites"] == ["SBIN"]
