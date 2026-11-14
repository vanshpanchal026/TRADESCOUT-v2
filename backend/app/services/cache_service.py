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
        "ret_3m",
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

    if "ret_3m" not in df_latest.columns:
        if "close_63d_ago" in df_latest.columns:
            c63 = pl.col("close_63d_ago")
            df_latest = df_latest.with_columns(
                [
                    (((pl.col("close") - c63) / pl.when(c63 > 0).then(c63).otherwise(1.0)) * 100.0).alias("ret_3m")
                ]
            )
        else:
            df_latest = df_latest.with_columns([pl.lit(None).cast(pl.Float64).alias("ret_3m")])

    if "bars_count" not in df_latest.columns:
        bars = df_indicators.group_by("symbol").agg(pl.len().alias("bars_count"))
        df_latest = df_latest.join(bars, on="symbol", how="left")

    market_min_date = df_indicators.select(pl.col("date").min()).item() if "date" in df_indicators.columns else None
    if market_min_date is not None and "first_trade_date" not in df_latest.columns:
        sym_first_dates = df_indicators.group_by("symbol").agg(pl.col("date").min().alias("first_trade_date"))
        df_latest = df_latest.join(sym_first_dates, on="symbol", how="left")

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

    # 7. Scanner: Stage 2 Breakout (Weinstein Stage 2 with day_change >= 1.5% and rvol >= 1.2)
    df_stage2_breakout = df_latest.filter(
        (pl.col("stage") == 2) & (pl.col("day_change") >= 1.5) & (pl.col("rvol") >= 1.2)
    ).sort("day_change", descending=True)

    # 8. Scanner: 20-SMA Pullback (Uptrend close > 50-SMA, price within ±3% of 20-day SMA)
    df_20_sma_pullback = df_latest.filter(
        (pl.col("close") > pl.col("sma_50"))
        & pl.col("sma_20").is_not_null()
        & (((pl.col("close") - pl.col("sma_20")).abs() / pl.col("sma_20")) <= 0.03)
    ).sort("rs_rating", descending=True)

    # 9. Scanner: 3-Month Gainers (3-month rolling performance ret_3m)
    df_3m_gainers = df_latest.filter(pl.col("ret_3m").is_not_null()).sort("ret_3m", descending=True)

    # 10. Scanner: Outperformers (High relative strength rs_rating >= 80 in uptrend with positive momentum)
    df_outperformers = df_latest.filter(
        (pl.col("rs_rating") >= 80)
        & (pl.col("close") > pl.col("sma_50"))
        & ((pl.col("day_change").fill_null(0.0) > 0.0) | (pl.col("ret_1m").fill_null(0.0) > 0.0))
    ).sort("rs_rating", descending=True)

    # 11. Scanner: Doublers (100%+ appreciation from 52-week low)
    df_doublers = df_latest.filter(
        pl.col("above_52w_low").is_not_null() & (pl.col("above_52w_low") >= 100.0)
    ).sort("above_52w_low", descending=True)

    # 12. Scanner: New Listing IPO (Recent IPOs with bar count <= 250 or debut after partition start)
    if market_min_date is not None and "first_trade_date" in df_latest.columns:
        df_new_ipo = df_latest.filter(
            (pl.col("bars_count") <= 250) | (pl.col("first_trade_date") > market_min_date)
        ).sort("rs_rating", descending=True)
    else:
        df_new_ipo = df_latest.filter(pl.col("bars_count") <= 250).sort("rs_rating", descending=True)

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
        "stage-2-breakout": df_stage2_breakout,
        "20-sma-pullback": df_20_sma_pullback,
        "3m-gainers": df_3m_gainers,
        "outperformers": df_outperformers,
        "doublers": df_doublers,
        "new-listing-ipo": df_new_ipo,
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
