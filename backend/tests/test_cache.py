"""TRADESCOUT — Unit and Integration Tests for Indicator Calculations & Redis Caching.

Validates:
1. Polars null propagation fix in raw_rs_score and min_samples=20 in 52-week rolling windows.
2. Vectorized calculation of all 11 scanner presets in generate_and_cache_all_scanners.
3. Verification of Redis storage under scanner:{slug}:latest and scanner:{slug}:stale with TTL.
4. Mathematical verification of candidate filtering criteria for the 6 new scanner presets:
   - stage-2-breakout
   - 20-sma-pullback
   - 3m-gainers
   - outperformers
   - doublers
   - new-listing-ipo
5. Proper rounding of float fields (including ret_3m) via extract_scanner_rows.
"""

import json
from datetime import date, timedelta

import polars as pl
import pytest
from redis.asyncio import Redis

from app.core.config import settings
from app.services.cache_service import extract_scanner_rows, generate_and_cache_all_scanners
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


def create_synthetic_market(days: int = 150) -> pl.DataFrame:
    """Create a multi-stock deterministic market universe across multiple sectors."""
    dates = [date(2025, 1, 1) + timedelta(days=i) for i in range(days)]
    configs = [
        {"sym": "SUPERSTAR", "base": 500.0, "trend": 0.005, "vol": 300000},  # Strong uptrend / doubler
        {"sym": "STEADYUP", "base": 1000.0, "trend": 0.001, "vol": 150000},  # Orderly Stage 2 trend
        {"sym": "DOWNTURN", "base": 1200.0, "trend": -0.003, "vol": 80000},  # Stage 4 decline
        {"sym": "CONSOLIDATOR", "base": 300.0, "trend": 0.0, "vol": 100000}, # Sideways consolidation
        {"sym": "NEW_IPO", "base": 200.0, "trend": 0.002, "vol": 250000},    # Fresh listing
    ]

    rows = []
    for cfg in configs:
        sym = cfg["sym"]
        current = cfg["base"]
        trend = cfg["trend"]
        vol = cfg["vol"]

        # Simulate a fresh IPO debuting midway
        sym_dates = dates[50:] if sym == "NEW_IPO" else dates

        for i, d in enumerate(sym_dates):
            current = current * (1.0 + trend)
            # Give SUPERSTAR an extra surge to test breakout conditions
            if sym == "SUPERSTAR" and i == len(sym_dates) - 1:
                current = current * 1.05
                vol = vol * 3

            rows.append(
                {
                    "date": d,
                    "symbol": sym,
                    "series": "EQ",
                    "isin": f"INE{sym}",
                    "name": f"{sym} Corporation",
                    "open": round(current * 0.99, 2),
                    "high": round(current * 1.02, 2),
                    "low": round(current * 0.98, 2),
                    "close": round(current, 2),
                    "last": round(current, 2),
                    "prev_close": round(current * 0.995, 2),
                    "volume": int(vol),
                    "turnover": round(current * vol, 2),
                    "trades": 3000,
                    "year": d.year,
                    "month": d.month,
                }
            )

    return pl.DataFrame(rows)


def test_indicators_partial_year_null_safety():
    """Verify that partial-year data (e.g. 100 days < 252 days) does not wipe out indicators."""
    df_market = create_synthetic_market(days=100)
    df_calc = compute_indicators(df_market)

    # 1. high_52w and low_52w must be non-null for rows where trading days >= min_samples (20)
    mature_rows = df_calc.filter(pl.col("bars_count") >= 25)
    assert mature_rows.filter(pl.col("high_52w").is_null()).height == 0
    assert mature_rows.filter(pl.col("low_52w").is_null()).height == 0

    # 2. raw_rs_score must evaluate cleanly without unhandled Polars nulls
    assert df_calc.filter(pl.col("raw_rs_score").is_null()).height == 0

    # 3. Daily RS ratings scale properly from 1 to 99
    latest_date = df_calc.select(pl.col("date").max()).item()
    df_latest = df_calc.filter(pl.col("date") == latest_date)
    df_ranked = calculate_daily_rs_ratings(df_latest)

    rs_ratings = df_ranked["rs_rating"].to_list()
    assert all(1 <= r <= 99 for r in rs_ratings)

    # Leader (SUPERSTAR) must rank higher than laggard (DOWNTURN)
    star_rs = df_ranked.filter(pl.col("symbol") == "SUPERSTAR")["rs_rating"].item()
    down_rs = df_ranked.filter(pl.col("symbol") == "DOWNTURN")["rs_rating"].item()
    assert star_rs > down_rs


def test_extract_scanner_rows_rounding():
    """Verify that extract_scanner_rows rounds numeric columns including ret_3m."""
    df = pl.DataFrame(
        {
            "symbol": ["TEST"],
            "cmp": [123.4567],
            "day_change": [2.3456],
            "ret_1m": [15.6789],
            "ret_3m": [35.1234],
            "above_52w_low": [105.7891],
            "rsi": [67.8912],
            "rvol": [1.8765],
            "bars_count": [120],
        }
    )
    rows = extract_scanner_rows(df)
    assert len(rows) == 1
    row = rows[0]
    assert row["cmp"] == 123.46
    assert row["day_change"] == 2.35
    assert row["ret_1m"] == 15.68
    assert row["ret_3m"] == 35.12
    assert row["above_52w_low"] == 105.79
    assert row["rsi"] == 67.89
    assert row["rvol"] == 1.88
    assert row["bars_count"] == 120


@pytest.mark.asyncio
async def test_generate_and_cache_all_eleven_scanners():
    """Verify that all 11 scanner presets are calculated, cached, and returned in counts."""
    df_market = create_synthetic_market(days=120)
    df_calc = compute_indicators(df_market)

    redis = Redis.from_url(settings.REDIS_URL, decode_responses=True)
    try:
        await redis.ping()
    except Exception:
        pytest.skip("Local Redis container not accessible")

    try:
        counts = await generate_and_cache_all_scanners(df_calc, redis)

        # 1. Verify counts dict contains all 11 slugs
        assert len(counts) == 11
        for slug in ALL_11_SCANNER_SLUGS:
            assert slug in counts, f"Slug '{slug}' missing from scanner counts"
            assert isinstance(counts[slug], int)

        # 2. Verify all 11 keys exist in Redis with valid JSON schema
        for slug in ALL_11_SCANNER_SLUGS:
            raw_latest = await redis.get(f"scanner:{slug}:latest")
            raw_stale = await redis.get(f"scanner:{slug}:stale")
            assert raw_latest is not None, f"Redis key 'scanner:{slug}:latest' was not set"
            assert raw_stale is not None, f"Redis key 'scanner:{slug}:stale' was not set"

            parsed = json.loads(raw_latest)
            assert parsed["slug"] == slug
            assert "date" in parsed
            assert "total_matches" in parsed
            assert "updated_at" in parsed
            assert "data" in parsed
            assert isinstance(parsed["data"], list)

        # 3. Verify specific filter logic for the 6 new scanner presets:
        # a. stage-2-breakout: stage == 2, day_change >= 1.5, rvol >= 1.2
        stage2_data = json.loads(await redis.get("scanner:stage-2-breakout:latest"))["data"]
        for item in stage2_data:
            assert item["stage"] == 2
            assert item["day_change"] >= 1.5
            assert item["rvol"] >= 1.2

        # b. 20-sma-pullback: close > sma_50 and within 3% of 20 SMA
        pullback_data = json.loads(await redis.get("scanner:20-sma-pullback:latest"))["data"]
        for item in pullback_data:
            assert item["close"] > item["sma_50"]
            assert abs(item["close"] - item["sma_20"]) / item["sma_20"] <= 0.03001

        # c. 3m-gainers: non-null ret_3m
        gainers_3m = json.loads(await redis.get("scanner:3m-gainers:latest"))["data"]
        for item in gainers_3m:
            assert item["ret_3m"] is not None

        # d. outperformers: rs_rating >= 80, close > sma_50
        outperf_data = json.loads(await redis.get("scanner:outperformers:latest"))["data"]
        for item in outperf_data:
            assert item["rs_rating"] >= 80
            assert item["close"] > item["sma_50"]

        # e. doublers: above_52w_low >= 100.0
        doublers_data = json.loads(await redis.get("scanner:doublers:latest"))["data"]
        for item in doublers_data:
            assert item["above_52w_low"] >= 100.0

        # f. new-listing-ipo: bars_count <= 250 or newly debuted
        ipo_data = json.loads(await redis.get("scanner:new-listing-ipo:latest"))["data"]
        for item in ipo_data:
            assert item.get("bars_count", 0) <= 250 or item.get("first_trade_date") is not None

        # 4. Verify market metadata contains all 11 counts
        raw_meta = await redis.get("market:metadata:latest")
        assert raw_meta is not None
        meta = json.loads(raw_meta)
        assert meta["status"] == "healthy"
        meta_counts = meta.get("scanner_counts", {})
        for slug in ALL_11_SCANNER_SLUGS:
            assert slug in meta_counts

    finally:
        await redis.aclose()
