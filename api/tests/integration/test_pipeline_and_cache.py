"""TRADESCOUT — Integration Tests for Data Pipeline and Redis Cache Layer."""

import json
from datetime import date, timedelta

import polars as pl
import pytest
from redis.asyncio import Redis

from app.core.config import settings
from app.services.cache_service import generate_and_cache_all_scanners
from app.services.indicators import compute_indicators


def generate_mock_market(days: int = 150) -> pl.DataFrame:
    """Generate multi-stock test universe."""
    dates = [date(2025, 1, 1) + timedelta(days=i) for i in range(days)]
    symbols = ["RELIANCE", "TRENT", "DIXON", "INFY", "TCS"]
    rows = []

    for sym in symbols:
        price = 1000.0 if sym in ["RELIANCE", "TRENT"] else 500.0
        for i, d in enumerate(dates):
            price = price * 1.002 if sym in ["RELIANCE", "TRENT"] else price * 0.998
            rows.append(
                {
                    "date": d,
                    "symbol": sym,
                    "series": "EQ",
                    "isin": f"INE{sym}",
                    "name": f"{sym} Ltd",
                    "open": price * 0.99,
                    "high": price * 1.01,
                    "low": price * 0.98,
                    "close": price,
                    "last": price,
                    "prev_close": price * 0.995,
                    "volume": 200000 + (i * 100),
                    "turnover": price * 200000,
                    "trades": 4000,
                    "year": d.year,
                    "month": d.month,
                }
            )

    return pl.DataFrame(rows)


@pytest.mark.asyncio
async def test_pipeline_indicators_and_redis_caching():
    """Verify that indicators compute and cache into Redis with valid schema."""
    df_market = generate_mock_market(100)
    df_calc = compute_indicators(df_market)

    redis = Redis.from_url(settings.REDIS_URL, decode_responses=True)

    try:
        await redis.ping()
    except Exception:
        pytest.skip("Local Redis container is not running or accessible")

    try:
        counts = await generate_and_cache_all_scanners(df_calc, redis)

        assert "trend-template" in counts
        assert "recent-breakout" in counts
        assert "4pct-breakout" in counts
        assert "high-volume" in counts
        assert "1m-gainers" in counts

        # Verify Redis key retrieval
        raw_tt = await redis.get("scanner:trend-template:latest")
        assert raw_tt is not None
        tt_payload = json.loads(raw_tt)
        assert tt_payload["slug"] == "trend-template"
        assert "data" in tt_payload
        assert isinstance(tt_payload["data"], list)

        # Verify Market Breadth
        raw_breadth = await redis.get("market:breadth:latest")
        assert raw_breadth is not None
        breadth = json.loads(raw_breadth)
        assert "advance_decline_ratio" in breadth
        assert "stage_2_count" in breadth

        # Verify Metadata
        raw_meta = await redis.get("market:metadata:latest")
        assert raw_meta is not None
        meta = json.loads(raw_meta)
        assert meta["status"] == "healthy"
        assert meta["total_equities"] == 5
    finally:
        await redis.aclose()


@pytest.mark.asyncio
async def test_symbol_history_path_traversal_validation():
    """Verify load_symbol_history and load_benchmark_history reject path traversal and invalid characters."""
    from app.services.pipeline import load_benchmark_history, load_symbol_history

    with pytest.raises(ValueError, match="Invalid symbol format"):
        await load_symbol_history("../../etc/passwd")

    with pytest.raises(ValueError, match="Invalid symbol format"):
        await load_symbol_history("RELIANCE;DROP TABLE")

    with pytest.raises(ValueError, match="Invalid benchmark format"):
        await load_benchmark_history("../invalid/path")
