"""TRADESCOUT — Redis Pre-Computed Scanner Caching Engine.

Generates pre-computed JSON payloads for all standard scanner views and market breadth.
Stores them in Redis 7 with a 24-hour TTL for ultra-fast (<15ms) API delivery.
"""

import json
from datetime import UTC, datetime
from typing import Any

import polars as pl
import structlog
from redis.asyncio import Redis

from app.core.config import settings
from app.services.indicators import calculate_daily_rs_ratings

logger = structlog.get_logger(__name__)


def extract_scanner_rows(df: pl.DataFrame) -> list[dict[str, Any]]:
    """Convert a Polars scanner dataframe to clean JSON-serializable dictionaries."""
    # Round float columns for clean payloads
    cols_to_round = [
        "cmp",
        "sma_10",
        "sma_20",
        "sma_50",
        "sma_150",
        "sma_200",
        "slope_200",
        "from_52w_high",
        "above_52w_low",
        "from_52w_low",
        "rvol",
        "rsi",
        "day_change",
        "ret_1m",
        "delivery_pct",
    ]

    exprs = []
    for c in cols_to_round:
        if c in df.columns:
            exprs.append(pl.col(c).round(2).alias(c))

    if exprs:
        df = df.with_columns(exprs)

    # Convert to Python dicts
    return df.to_dicts()


async def generate_and_cache_all_scanners(df_indicators: pl.DataFrame, redis_client: Redis) -> dict[str, int]:
    """Slice computed indicators for the latest trading session into scanner categories and save to Redis."""
    # 1. Get the latest available trading date in the dataset
    latest_date = df_indicators.select(pl.col("date").max()).item()
    df_latest = df_indicators.filter(pl.col("date") == latest_date)

    if "rs_rating" not in df_latest.columns:
        df_latest = calculate_daily_rs_ratings(df_latest)

    logger.info("cache.processing_latest_session", date=str(latest_date), total_symbols=df_latest.height)

    # 2. Scanner: Minervini Trend Template (minervini_pass == True or conditions_met >= 7)
    df_trend_template = df_latest.filter((pl.col("conditions_met") >= 7) & (pl.col("close") > pl.col("sma_50"))).sort(
        "rs_rating", descending=True
    )

    # 3. Scanner: Recent Breakout (day_change >= 2.5%, rvol >= 1.5, close > sma_50)
    df_breakout = df_latest.filter(
        (pl.col("day_change") >= 2.5) & (pl.col("rvol") >= 1.5) & (pl.col("close") > pl.col("sma_50"))
    ).sort("day_change", descending=True)

    # 4. Scanner: 4% Breakout (day_change >= 4.0% with strong volume)
    df_4pct = df_latest.filter((pl.col("day_change") >= 4.0) & (pl.col("volume") >= 50000)).sort(
        "day_change", descending=True
    )

    # 5. Scanner: High Relative Volume (rvol >= 2.0x 50-day average)
    df_high_vol = df_latest.filter((pl.col("rvol") >= 2.0) & (pl.col("day_change") > 0.0)).sort("rvol", descending=True)

    # 6. Scanner: 1-Month Gainers (Top 1-month momentum)
    df_1m_gainers = df_latest.filter(pl.col("ret_1m").is_not_null()).sort("ret_1m", descending=True)

    # 7. Market Breadth Diagnostics
    advances = df_latest.filter(pl.col("day_change") > 0.0).height
    declines = df_latest.filter(pl.col("day_change") < 0.0).height
    unchanged = df_latest.filter(pl.col("day_change") == 0.0).height
    above_50_sma = df_latest.filter(pl.col("close") > pl.col("sma_50")).height
    above_200_sma = df_latest.filter(pl.col("close") > pl.col("sma_200")).height
    stage_2_count = df_latest.filter(pl.col("stage") == 2).height
    stage_4_count = df_latest.filter(pl.col("stage") == 4).height

    breadth_payload = {
        "date": str(latest_date),
        "total_traded": df_latest.height,
        "advances": advances,
        "declines": declines,
        "unchanged": unchanged,
        "advance_decline_ratio": round(advances / max(declines, 1), 2),
        "above_50_sma_pct": round((above_50_sma / max(df_latest.height, 1)) * 100.0, 1),
        "above_200_sma_pct": round((above_200_sma / max(df_latest.height, 1)) * 100.0, 1),
        "stage_2_count": stage_2_count,
        "stage_4_count": stage_4_count,
        "stage_2_to_4_ratio": round(stage_2_count / max(stage_4_count, 1), 2),
        "updated_at": datetime.now(UTC).isoformat(),
    }

    # 8. Package all scans into payloads
    scanners = {
        "trend-template": df_trend_template,
        "recent-breakout": df_breakout,
        "4pct-breakout": df_4pct,
        "high-volume": df_high_vol,
        "1m-gainers": df_1m_gainers,
    }

    ttl_seconds = settings.REDIS_CACHE_TTL_HOURS * 3600
    counts = {}

    for slug, scan_df in scanners.items():
        rows = extract_scanner_rows(scan_df)
        payload = {
            "slug": slug,
            "date": str(latest_date),
            "total_matches": len(rows),
            "updated_at": datetime.now(UTC).isoformat(),
            "data": rows,
        }
        redis_key = f"scanner:{slug}:latest"
        stale_key = f"scanner:{slug}:stale"
        dumped_json = json.dumps(payload, default=str)
        await redis_client.set(redis_key, dumped_json, ex=ttl_seconds)
        await redis_client.set(stale_key, dumped_json, ex=ttl_seconds * 2)
        counts[slug] = len(rows)
        logger.info("cache.scanner_saved", slug=slug, count=len(rows))

    # Save Breadth
    await redis_client.set("market:breadth:latest", json.dumps(breadth_payload, default=str), ex=ttl_seconds)

    # Save Metadata
    metadata_payload = {
        "last_synced_date": str(latest_date),
        "total_equities": df_latest.height,
        "server_time_utc": datetime.now(UTC).isoformat(),
        "status": "healthy",
        "scanner_counts": counts,
    }
    await redis_client.set("market:metadata:latest", json.dumps(metadata_payload, default=str), ex=ttl_seconds)

    return counts
