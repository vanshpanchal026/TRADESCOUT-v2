"""TRADESCOUT — Empirical Adversarial Challenge Suite for Backend Scanners & Caching.

Authored by: Challenger 1 (teamwork_challenger)
Purpose: Independent empirical stress-testing of backend scanner calculations,
         Redis caching, indicators null-safety, and REST freemium gating contracts.
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
from app.routers.scanners import SENSITIVE_INTERNAL_FIELDS
from app.services.cache_service import generate_and_cache_all_scanners
from app.services.indicators import calculate_daily_rs_ratings, compute_indicators

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
def make_jwt():
    """Create signed test JWT tokens."""
    def _create(plan: str = "free", sub: str | None = None) -> str:
        secret = get_jwt_secret()
        user_id = sub or str(uuid.uuid4())
        payload = {
            "sub": user_id,
            "email": f"{user_id}@tradescout.dev",
            "role": "authenticated",
            "user_metadata": {"plan": plan},
            "app_metadata": {"plan": plan},
        }
        return jwt.encode(payload, secret, algorithm="HS256")
    return _create


@pytest.fixture
async def api_client() -> AsyncGenerator[httpx.AsyncClient, None]:
    """Test client using ASGITransport with unique IP to bypass rate limits."""
    transport = ASGITransport(app=app)
    test_ip = f"10.99.{uuid.uuid4().int % 200}.{uuid.uuid4().int % 200}"
    headers = {"x-forwarded-for": test_ip}
    async with httpx.AsyncClient(transport=transport, base_url="http://testserver", headers=headers) as client:
        yield client


@pytest.fixture
async def redis_conn() -> AsyncGenerator[Redis, None]:
    """Redis client bound to test event loop."""
    client = Redis.from_url(
        settings.REDIS_URL,
        encoding="utf-8",
        decode_responses=True,
        socket_connect_timeout=3.0,
        socket_timeout=3.0,
    )
    yield client
    await client.aclose()


# ==============================================================================
# SECTION 1: EDGE CASES IN INDICATOR CALCULATIONS & NULL SAFETY
# ==============================================================================

def test_edge_case_zero_volume_and_zero_vol_sma():
    """Adversarial Test: When volume is 0 across all days, ensure vol_sma_50=0 and rvol doesn't crash."""
    days = 60
    base_date = date(2026, 1, 1)
    rows = []
    for i in range(days):
        d = base_date + timedelta(days=i)
        rows.append({
            "date": d,
            "symbol": "ZEROVOL",
            "series": "EQ",
            "isin": "INEZEROVOL",
            "name": "Zero Volume Corp",
            "open": 100.0,
            "high": 101.0,
            "low": 99.0,
            "close": 100.0,
            "last": 100.0,
            "prev_close": 100.0,
            "volume": 0,
            "turnover": 0.0,
            "trades": 0,
            "year": d.year,
            "month": d.month,
        })
    df = pl.DataFrame(rows)
    df_calc = compute_indicators(df)

    latest = df_calc.filter(pl.col("date") == base_date + timedelta(days=days - 1))
    rvol_val = latest.select(pl.col("rvol")).item()
    vol_sma_val = latest.select(pl.col("vol_sma_50")).item()

    assert vol_sma_val == 0.0, f"Expected vol_sma_50=0.0, got {vol_sma_val}"
    assert rvol_val == 0.0, f"Expected rvol=0.0, got {rvol_val}"
    assert not latest.select(pl.col("rvol").is_nan()).item(), "rvol must not be NaN"
    assert not latest.select(pl.col("rvol").is_null()).item(), "rvol must not be Null"


def test_edge_case_flat_prices_zero_volatility_rsi():
    """Adversarial Test: Identical flat prices for 100 days must not cause division-by-zero in RSI."""
    days = 100
    base_date = date(2026, 1, 1)
    rows = []
    for i in range(days):
        d = base_date + timedelta(days=i)
        rows.append({
            "date": d,
            "symbol": "FLATLINE",
            "series": "EQ",
            "isin": "INEFLATLINE",
            "name": "Flatline Corp",
            "open": 500.0,
            "high": 500.0,
            "low": 500.0,
            "close": 500.0,
            "last": 500.0,
            "prev_close": 500.0,
            "volume": 100000,
            "turnover": 50000000.0,
            "trades": 1000,
            "year": d.year,
            "month": d.month,
        })
    df = pl.DataFrame(rows)
    df_calc = compute_indicators(df)

    latest = df_calc.filter(pl.col("date") == base_date + timedelta(days=days - 1))
    rsi_val = latest.select(pl.col("rsi")).item()
    assert rsi_val == 0.0, f"Expected rsi=0.0 on zero-gain/loss, got {rsi_val}"
    assert not latest.select(pl.col("rsi").is_nan()).item(), "RSI must not be NaN"


@pytest.mark.parametrize("bar_count", [1, 5, 19, 20, 63, 126, 214, 280])
def test_partial_year_datasets_raw_rs_score_and_high_52w_safety(bar_count: int):
    """Adversarial Test: Various historical lengths must never produce null raw_rs_score or break ranking."""
    base_date = date(2026, 1, 1)
    rows = []
    current_price = 100.0
    for i in range(bar_count):
        d = base_date + timedelta(days=i)
        current_price *= 1.002
        rows.append({
            "date": d,
            "symbol": f"BARS_{bar_count}",
            "series": "EQ",
            "isin": f"INEBARS{bar_count}",
            "name": f"Bars {bar_count} Corp",
            "open": current_price * 0.99,
            "high": current_price * 1.01,
            "low": current_price * 0.98,
            "close": current_price,
            "last": current_price,
            "prev_close": current_price * 0.998,
            "volume": 50000,
            "turnover": current_price * 50000,
            "trades": 500,
            "year": d.year,
            "month": d.month,
        })
    df = pl.DataFrame(rows)
    df_calc = compute_indicators(df)
    latest_day = df_calc.filter(pl.col("date") == base_date + timedelta(days=bar_count - 1))

    # raw_rs_score MUST be non-null and a valid float for every single row
    raw_rs = latest_day.select(pl.col("raw_rs_score")).item()
    assert raw_rs is not None, f"raw_rs_score is null for bar_count={bar_count}"
    assert isinstance(raw_rs, float), f"raw_rs_score must be float, got {type(raw_rs)}"

    # 52w high/low: min_samples=20 means non-null if bar_count >= 20
    high_52w = latest_day.select(pl.col("high_52w")).item()
    low_52w = latest_day.select(pl.col("low_52w")).item()
    if bar_count >= 20:
        assert high_52w is not None, f"high_52w should be non-null for bar_count={bar_count}"
        assert low_52w is not None, f"low_52w should be non-null for bar_count={bar_count}"
        assert high_52w >= low_52w
    else:
        assert high_52w is None, "high_52w should be null when bars < min_samples(20)"
        assert low_52w is None

    # Ranking must succeed even on single stock or short history
    ranked = calculate_daily_rs_ratings(latest_day)
    rs_rating = ranked.select(pl.col("rs_rating")).item()
    assert rs_rating is not None, "rs_rating must not be null"
    assert 1 <= rs_rating <= 99, f"rs_rating {rs_rating} out of [1, 99] bounds"


def test_extreme_values_penny_stocks_and_hyper_growth():
    """Adversarial Test: Extreme prices (penny stocks and astronomical values) must not overflow."""
    base_date = date(2026, 1, 1)
    symbols = [
        ("PENNY", 0.05, 1.01),      # 5 paise stock
        ("MEGA", 500000.0, 1.001),  # Berkshire Hathaway-scale stock
        ("SURGE", 10.0, 1.25),      # Rapid 25% daily compounded surge
    ]
    rows = []
    for sym, start_p, mult in symbols:
        p = start_p
        for i in range(50):
            d = base_date + timedelta(days=i)
            p *= mult
            rows.append({
                "date": d,
                "symbol": sym,
                "series": "EQ",
                "isin": f"INE{sym}",
                "name": f"{sym} Inc",
                "open": p * 0.99,
                "high": p * 1.02,
                "low": p * 0.98,
                "close": p,
                "last": p,
                "prev_close": p / mult,
                "volume": 2000000,
                "turnover": p * 2000000,
                "trades": 10000,
                "year": d.year,
                "month": d.month,
            })
    df = pl.DataFrame(rows)
    df_calc = compute_indicators(df)
    latest_day = df_calc.filter(pl.col("date") == base_date + timedelta(days=49))
    ranked = calculate_daily_rs_ratings(latest_day)

    assert ranked.height == 3
    for row in ranked.to_dicts():
        assert not any(v is None for k, v in row.items() if k in ["raw_rs_score", "rs_rating", "high_52w", "low_52w"])


# ==============================================================================
# SECTION 2: SCANNER PRESET INVARIANTS EMPIRICAL AUDIT
# ==============================================================================

@pytest.mark.asyncio
async def test_all_11_scanners_mathematical_filtering_invariants(redis_conn: Redis):
    """Empirical Audit: Verify that candidates cached in each preset meet that scanner's definition."""
    # We inspect candidates directly from Redis payloads
    for slug in ALL_11_SLUGS:
        raw = await redis_conn.get(f"scanner:{slug}:latest")
        assert raw is not None, f"Redis key scanner:{slug}:latest is missing"
        payload = json.loads(raw)
        data = payload.get("data", [])
        if not data:
            continue

        for item in data[:20]:  # Audit sample of candidates
            if slug == "trend-template":
                # minervini_pass or conditions_met >= 7 and close > sma_50
                conds = item.get("conditions_met", 0)
                cmp_val = item.get("cmp") or item.get("close")
                sma50 = item.get("sma_50")
                if conds is not None and cmp_val is not None and sma50 is not None:
                    assert conds >= 7, f"trend-template candidate {item.get('symbol')} has conditions_met={conds} < 7"
                    assert cmp_val > sma50, f"trend-template candidate {item.get('symbol')} close <= sma_50"

            elif slug == "recent-breakout":
                day_change = item.get("day_change") or item.get("change_pct", 0)
                rvol = item.get("rvol", 0)
                cmp_val = item.get("cmp") or item.get("close", 0)
                sma50 = item.get("sma_50", 0)
                assert day_change >= 2.5, (
                    f"recent-breakout candidate {item.get('symbol')} day_change={day_change} < 2.5"
                )
                assert rvol >= 1.5, f"recent-breakout candidate {item.get('symbol')} rvol={rvol} < 1.5"
                assert cmp_val > sma50, f"recent-breakout candidate {item.get('symbol')} close <= sma_50"

            elif slug == "4pct-breakout":
                day_change = item.get("day_change") or item.get("change_pct", 0)
                vol = item.get("volume", 0)
                assert day_change >= 4.0, f"4pct-breakout candidate {item.get('symbol')} day_change={day_change} < 4.0"
                assert vol >= 50000, f"4pct-breakout candidate {item.get('symbol')} volume={vol} < 50000"

            elif slug == "high-volume":
                rvol = item.get("rvol", 0)
                day_change = item.get("day_change") or item.get("change_pct", 0)
                assert rvol >= 2.0, f"high-volume candidate {item.get('symbol')} rvol={rvol} < 2.0"
                assert day_change > 0.0, f"high-volume candidate {item.get('symbol')} day_change={day_change} <= 0"

            elif slug == "1m-gainers":
                ret_1m = item.get("ret_1m")
                assert ret_1m is not None, f"1m-gainers candidate {item.get('symbol')} has null ret_1m"

            elif slug == "stage-2-breakout":
                stage = item.get("stage")
                day_change = item.get("day_change") or item.get("change_pct", 0)
                rvol = item.get("rvol", 0)
                assert stage == 2, f"stage-2-breakout candidate {item.get('symbol')} stage={stage} != 2"
                assert day_change >= 1.5, (
                    f"stage-2-breakout candidate {item.get('symbol')} day_change={day_change} < 1.5"
                )
                assert rvol >= 1.2, f"stage-2-breakout candidate {item.get('symbol')} rvol={rvol} < 1.2"

            elif slug == "20-sma-pullback":
                cmp_val = item.get("cmp") or item.get("close", 0)
                sma20 = item.get("sma_20")
                sma50 = item.get("sma_50", 0)
                assert sma20 is not None, f"20-sma-pullback candidate {item.get('symbol')} sma_20 is null"
                assert cmp_val > sma50, f"20-sma-pullback candidate {item.get('symbol')} close <= sma_50"
                pct_dist = abs(cmp_val - sma20) / sma20
                assert pct_dist <= 0.0305, (
                    f"20-sma-pullback candidate {item.get('symbol')} distance {pct_dist:.4f} > 3%"
                )

            elif slug == "3m-gainers":
                ret_3m = item.get("ret_3m")
                assert ret_3m is not None, f"3m-gainers candidate {item.get('symbol')} has null ret_3m"

            elif slug == "outperformers":
                rs = item.get("rs_rating", 0)
                cmp_val = item.get("cmp") or item.get("close", 0)
                sma50 = item.get("sma_50", 0)
                assert rs >= 80, f"outperformers candidate {item.get('symbol')} rs_rating={rs} < 80"
                assert cmp_val > sma50, f"outperformers candidate {item.get('symbol')} close <= sma_50"

            elif slug == "doublers":
                above_52w = item.get("above_52w_low") or item.get("from_52w_low", 0)
                assert above_52w >= 99.9, f"doublers candidate {item.get('symbol')} above_52w_low={above_52w} < 100%"

            elif slug == "new-listing-ipo":
                bars_cnt = item.get("bars_count")
                # Either bars_count <= 250 or debuted after partition min_date
                if bars_cnt is not None:
                    # In NSE 2026 dataset, all stocks have <= 214 bars, so this passes universally
                    assert bars_cnt <= 250 or item.get("first_trade_date") is not None


# ==============================================================================
# SECTION 3: REDIS STORAGE & SERIALIZATION INTEGRITY AUDIT
# ==============================================================================

@pytest.mark.asyncio
async def test_redis_keys_all_11_presets_exist_and_valid_json(redis_conn: Redis):
    """Adversarial Test: Verify all 11 presets exist under both :latest and :stale with valid JSON."""
    for slug in ALL_11_SLUGS:
        for suffix in ["latest", "stale"]:
            key = f"scanner:{slug}:{suffix}"
            exists = await redis_conn.exists(key)
            assert exists == 1, f"Redis key {key} does not exist"

            ttl = await redis_conn.ttl(key)
            assert ttl > 0, f"Redis key {key} has expired or no TTL (ttl={ttl})"

            raw_str = await redis_conn.get(key)
            assert raw_str is not None
            parsed = json.loads(raw_str)

            # Contractual fields
            assert parsed["slug"] == slug
            assert "date" in parsed
            assert "total_matches" in parsed
            assert isinstance(parsed["total_matches"], int)
            assert parsed["total_matches"] >= 0
            assert "updated_at" in parsed
            assert "data" in parsed
            assert isinstance(parsed["data"], list)
            assert len(parsed["data"]) == parsed["total_matches"]


@pytest.mark.asyncio
async def test_market_metadata_has_all_11_counts(redis_conn: Redis):
    """Adversarial Test: Verify market:metadata:latest registers candidate counts for all 11 presets."""
    raw = await redis_conn.get("market:metadata:latest")
    assert raw is not None, "market:metadata:latest does not exist in Redis"
    meta = json.loads(raw)
    counts = meta.get("scanner_counts", {})
    assert len(counts) == 11, f"Expected 11 scanner counts, got {len(counts)}"
    for slug in ALL_11_SLUGS:
        assert slug in counts, f"Slug {slug} missing from market metadata scanner_counts"
        assert isinstance(counts[slug], int)
        assert counts[slug] >= 0


# ==============================================================================
# SECTION 4: FREEMIUM TRUNCATION & SENSITIVE FIELD SCRUBBING
# ==============================================================================

@pytest.mark.asyncio
@pytest.mark.parametrize("slug", ALL_11_SLUGS)
async def test_guest_freemium_truncation_enforced_at_most_10_items(api_client: httpx.AsyncClient, slug: str):
    """Adversarial Test: Unauthenticated guest MUST receive <= 10 items, is_truncated=True, user_tier='free'."""
    resp = await api_client.get(f"/api/scanners/{slug}")
    assert resp.status_code == 200
    body = resp.json()

    meta = body["metadata"]
    data = body["data"]

    assert len(data) <= 10, f"Guest received {len(data)} items > 10 for {slug}"
    assert meta["user_tier"] == "free"
    assert meta["limit"] == 10
    assert meta["offset"] == 0

    if meta["total_matches"] > 10:
        assert meta["is_truncated"] is True
        assert len(data) == 10
    else:
        assert meta["is_truncated"] is False


@pytest.mark.asyncio
@pytest.mark.parametrize("slug", ALL_11_SLUGS)
async def test_guest_freemium_bypass_via_query_params_prevented(api_client: httpx.AsyncClient, slug: str):
    """Adversarial Attack: Guest passes ?limit=100&offset=20 to bypass paywall. Backend MUST ignore."""
    resp = await api_client.get(f"/api/scanners/{slug}?limit=100&offset=20")
    assert resp.status_code == 200
    body = resp.json()

    meta = body["metadata"]
    data = body["data"]

    assert len(data) <= 10, f"Guest bypass succeeded! Got {len(data)} items"
    assert meta["user_tier"] == "free"
    assert meta["limit"] == 10, "Guest limit must be clamped to 10"
    assert meta["offset"] == 0, "Guest offset must be reset to 0"


@pytest.mark.asyncio
@pytest.mark.parametrize("slug", ALL_11_SLUGS)
async def test_guest_freemium_sensitive_fields_scrubbing_exhaustive(api_client: httpx.AsyncClient, slug: str):
    """Adversarial Security Audit: No proprietary indicator field must EVER leak to a guest."""
    resp = await api_client.get(f"/api/scanners/{slug}")
    assert resp.status_code == 200
    data = resp.json()["data"]

    for i, row in enumerate(data):
        leaked = SENSITIVE_INTERNAL_FIELDS.intersection(row.keys())
        assert not leaked, f"Row {i} in {slug} leaked sensitive internal fields: {leaked}"


@pytest.mark.asyncio
async def test_invalid_auth_header_and_spoofed_uuid_treated_as_guest(api_client: httpx.AsyncClient):
    """Adversarial Security Test: Tampered JWT or non-UUID x-user-id falls back to Free Guest tier."""
    # 1. Non-UUID injection in x-user-id
    resp = await api_client.get(
        "/api/scanners/trend-template",
        headers={"x-user-id": "admin'; DROP TABLE users; --"}
    )
    assert resp.status_code == 200
    body = resp.json()
    assert body["metadata"]["user_tier"] == "free"
    assert len(body["data"]) <= 10

    # 2. Free tier JWT token (authenticated user on free plan)
    secret = get_jwt_secret()
    free_token = jwt.encode(
        {"sub": str(uuid.uuid4()), "user_metadata": {"plan": "free"}},
        secret,
        algorithm="HS256"
    )
    resp = await api_client.get(
        "/api/scanners/trend-template",
        headers={"authorization": f"Bearer {free_token}"}
    )
    assert resp.status_code == 200
    body = resp.json()
    assert body["metadata"]["user_tier"] == "free"
    assert len(body["data"]) <= 10


# ==============================================================================
# SECTION 5: PRO-TIER UN-TRUNCATED ROWS, HEADERS & PAGINATION
# ==============================================================================

@pytest.mark.asyncio
@pytest.mark.parametrize("slug", ALL_11_SLUGS)
async def test_pro_tier_untruncated_candidates_returned(
    api_client: httpx.AsyncClient, make_jwt, slug: str
):
    """Adversarial Test: Pro user receives un-truncated candidates matching requested limit."""
    pro_token = make_jwt(plan="pro")
    resp = await api_client.get(
        f"/api/scanners/{slug}?limit=50&offset=0",
        headers={"authorization": f"Bearer {pro_token}"}
    )
    assert resp.status_code == 200
    body = resp.json()
    meta = body["metadata"]
    data = body["data"]

    assert meta["user_tier"] == "pro"
    assert meta["is_truncated"] is False
    assert meta["limit"] == 50
    assert meta["offset"] == 0

    expected_len = min(50, meta["total_matches"])
    assert len(data) == expected_len


@pytest.mark.asyncio
async def test_pro_tier_custom_offset_pagination_isolation(api_client: httpx.AsyncClient, make_jwt):
    """Adversarial Test: Pro user pagination cleanly returns items [offset : offset + limit]."""
    pro_token = make_jwt(plan="pro")
    # Fetch first 10 items
    r1 = await api_client.get(
        "/api/scanners/trend-template?limit=10&offset=0",
        headers={"authorization": f"Bearer {pro_token}"}
    )
    page1_symbols = [x["symbol"] for x in r1.json()["data"]]

    # Fetch next 10 items
    r2 = await api_client.get(
        "/api/scanners/trend-template?limit=10&offset=10",
        headers={"authorization": f"Bearer {pro_token}"}
    )
    page2_symbols = [x["symbol"] for x in r2.json()["data"]]

    assert len(page1_symbols) == 10
    assert len(page2_symbols) == 10
    # Overlap must be empty (clean offset slicing)
    overlap = set(page1_symbols).intersection(set(page2_symbols))
    assert not overlap, f"Pagination overlap detected between pages: {overlap}"


@pytest.mark.asyncio
async def test_response_headers_private_cache_and_vary(api_client: httpx.AsyncClient):
    """Contract Test: Responses must declare Cache-Control private and Vary headers."""
    resp = await api_client.get("/api/scanners/trend-template")
    assert resp.status_code == 200
    cache_control = resp.headers.get("cache-control", "")
    assert "private" in cache_control
    vary = resp.headers.get("vary", "")
    assert "Authorization" in vary
    assert "X-User-Id" in vary


# ==============================================================================
# SECTION 6: QUERY PARAMETERS, THRESHOLDS, SORTING & ALIASES
# ==============================================================================

@pytest.mark.asyncio
async def test_threshold_filtering_min_rs_and_min_rvol(api_client: httpx.AsyncClient, make_jwt):
    """Adversarial Test: min_rs and min_rvol query params filter candidates accurately."""
    pro_token = make_jwt(plan="pro")
    resp = await api_client.get(
        "/api/scanners/trend-template?min_rs=85&min_rvol=1.5&limit=100",
        headers={"authorization": f"Bearer {pro_token}"}
    )
    assert resp.status_code == 200
    data = resp.json()["data"]

    for row in data:
        rs = row.get("rs_rating")
        rvol = row.get("rvol")
        assert rs >= 85, f"Candidate {row.get('symbol')} rs_rating={rs} < 85"
        assert rvol >= 1.5, f"Candidate {row.get('symbol')} rvol={rvol} < 1.5"


@pytest.mark.asyncio
async def test_sort_column_aliases_produce_identical_order(api_client: httpx.AsyncClient, make_jwt):
    """Adversarial Test: Frontend aliases produce identical sort orders to internal column names."""
    pro_token = make_jwt(plan="pro")
    pairs = [
        ("day_change", "change_pct"),
        ("close", "cmp"),
        ("ret_3m", "gain_3m"),
        ("above_52w_low", "from_52w_low"),
    ]
    for col_a, col_b in pairs:
        r_a = await api_client.get(
            f"/api/scanners/trend-template?sort_by={col_a}&direction=desc&limit=15",
            headers={"authorization": f"Bearer {pro_token}"}
        )
        r_b = await api_client.get(
            f"/api/scanners/trend-template?sort_by={col_b}&direction=desc&limit=15",
            headers={"authorization": f"Bearer {pro_token}"}
        )
        symbols_a = [x["symbol"] for x in r_a.json()["data"]]
        symbols_b = [x["symbol"] for x in r_b.json()["data"]]
        assert symbols_a == symbols_b, (
            f"Sorting by {col_a} vs {col_b} produced different orders: {symbols_a} != {symbols_b}"
        )


@pytest.mark.asyncio
@pytest.mark.parametrize(
    "invalid_query,expected_status",
    [
        ("?min_rs=0", 422),       # ge=1 violated
        ("?min_rs=100", 422),     # le=99 violated
        ("?min_rvol=-0.5", 422),  # ge=0.0 violated
        ("?limit=0", 422),        # ge=1 violated
        ("?limit=5000", 422),     # le=2500 violated
        ("?direction=sideways", 422),  # pattern violated
    ],
)
async def test_query_parameter_validation_errors(
    api_client: httpx.AsyncClient, invalid_query: str, expected_status: int
):
    """Adversarial Boundary Test: Out-of-range or malformed query params must return 422."""
    resp = await api_client.get(f"/api/scanners/trend-template{invalid_query}")
    assert resp.status_code == expected_status


# ==============================================================================
# SECTION 7: CACHE MISS, MUTEX & RESILIENCE
# ==============================================================================

@pytest.mark.asyncio
async def test_cache_miss_lazy_computation_recovery(api_client: httpx.AsyncClient, redis_conn: Redis):
    """Adversarial Fault Injection: Deleting a key from Redis causes graceful lazy re-computation."""
    test_slug = "stage-2-breakout"
    test_key = f"scanner:{test_slug}:latest"

    # Step 1: Temporarily delete key
    await redis_conn.delete(test_key)
    assert await redis_conn.exists(test_key) == 0

    # Step 2: Trigger GET request - lazy pipeline must run and regenerate
    resp = await api_client.get(f"/api/scanners/{test_slug}")
    assert resp.status_code == 200
    body = resp.json()
    assert body["metadata"]["slug"] == test_slug

    # Step 3: Key must be restored in Redis
    restored = await redis_conn.exists(test_key)
    assert restored == 1, f"Lazy re-computation failed to repopulate {test_key}"



# ==============================================================================
# SECTION 8: EXTENDED ADVERSARIAL STRESS & CONCURRENCY
# ==============================================================================

@pytest.mark.asyncio
async def test_concurrent_cold_cache_requests_thundering_herd(
    api_client: httpx.AsyncClient, redis_conn: Redis
):
    """Stress Test: 10 concurrent requests hitting a cold cache simultaneously. All must receive 200."""
    import asyncio

    test_slug = "outperformers"
    test_key = f"scanner:{test_slug}:latest"
    # Delete key to create cold cache condition
    await redis_conn.delete(test_key)

    # Fire 10 concurrent requests
    tasks = [api_client.get(f"/api/scanners/{test_slug}?limit=10") for _ in range(10)]
    responses = await asyncio.gather(*tasks)

    for i, resp in enumerate(responses):
        assert resp.status_code == 200, f"Request {i} failed with status {resp.status_code}: {resp.text}"
        data = resp.json()
        assert data["metadata"]["slug"] == test_slug
        assert "data" in data


@pytest.mark.asyncio
async def test_missing_derived_columns_handled_in_generate_and_cache(redis_conn: Redis):
    """Adversarial Test: generate_and_cache_all_scanners works even when df lacks ret_3m and bars_count."""
    base_date = date(2026, 1, 1)
    rows = []
    for sym in ["STOCK_A", "STOCK_B"]:
        for i in range(30):
            d = base_date + timedelta(days=i)
            rows.append({
                "date": d,
                "symbol": sym,
                "series": "EQ",
                "isin": f"INE{sym}",
                "name": f"{sym} Corp",
                "open": 100.0,
                "high": 105.0,
                "low": 98.0,
                "close": 102.0,
                "last": 102.0,
                "prev_close": 100.0,
                "volume": 200000,
                "turnover": 20400000.0,
                "trades": 1500,
                "year": d.year,
                "month": d.month,
            })
    df = pl.DataFrame(rows)
    df_calc = compute_indicators(df)

    # Deliberately drop ret_3m and bars_count if present
    drop_cols = [c for c in ["ret_3m", "bars_count", "rs_rating"] if c in df_calc.columns]
    df_stripped = df_calc.drop(drop_cols)

    # Must complete without KeyError or crash
    counts = await generate_and_cache_all_scanners(df_stripped, redis_conn)
    assert len(counts) == 11
    for slug in ALL_11_SLUGS:
        assert slug in counts


@pytest.mark.asyncio
@pytest.mark.parametrize("method", ["post", "put", "delete", "patch"])
async def test_disallowed_http_methods_on_scanner_endpoint(api_client: httpx.AsyncClient, method: str):
    """Security Boundary: Non-GET HTTP methods on /api/scanners/{slug} must return 405 Method Not Allowed."""
    caller = getattr(api_client, method)
    resp = await caller("/api/scanners/trend-template")
    assert resp.status_code == 405, f"Expected 405 for {method.upper()}, got {resp.status_code}"


@pytest.mark.asyncio
@pytest.mark.parametrize("sort_col", ["cmp", "volume", "rsi", "from_52w_high", "above_52w_low", "day_change"])
async def test_sorting_directions_both_asc_and_desc(
    api_client: httpx.AsyncClient, make_jwt, sort_col: str
):
    """Stress Test: Ascending and descending sort on numerical columns must be ordered strictly."""
    pro_token = make_jwt(plan="pro")
    r_desc = await api_client.get(
        f"/api/scanners/trend-template?sort_by={sort_col}&direction=desc&limit=10",
        headers={"authorization": f"Bearer {pro_token}"}
    )
    r_asc = await api_client.get(
        f"/api/scanners/trend-template?sort_by={sort_col}&direction=asc&limit=10",
        headers={"authorization": f"Bearer {pro_token}"}
    )
    assert r_desc.status_code == 200
    assert r_asc.status_code == 200

    vals_desc = [x.get(sort_col) for x in r_desc.json()["data"] if x.get(sort_col) is not None]
    vals_asc = [x.get(sort_col) for x in r_asc.json()["data"] if x.get(sort_col) is not None]

    # Verify monotonic ordering
    if len(vals_desc) >= 2:
        for i in range(len(vals_desc) - 1):
            assert vals_desc[i] >= vals_desc[i + 1], f"desc sort violated for {sort_col}: {vals_desc}"

    if len(vals_asc) >= 2:
        for i in range(len(vals_asc) - 1):
            assert vals_asc[i] <= vals_asc[i + 1], f"asc sort violated for {sort_col}: {vals_asc}"
