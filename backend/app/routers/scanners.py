"""TRADESCOUT — High-Performance Scanner REST Endpoints.

Implements GET /api/scanners/{slug}, GET /api/market-breadth, and GET /api/metadata.
Reads pre-computed payloads directly from Redis 7 with lazy calculation fallback.
Enforces strict backend freemium gating (top 10 truncated for Free/Guest, full dataset for Pro).
"""

import json
import os
from collections.abc import AsyncGenerator
from datetime import UTC, datetime, time, timedelta, timezone
from typing import Any

import polars as pl
import structlog
from fastapi import APIRouter, Depends, Header, HTTPException, Query, Request, Response, status
from pydantic.fields import FieldInfo
from redis.asyncio import Redis

from app.core.auth import extract_user_identity
from app.core.config import settings
from app.core.locks import distributed_cache_lock, wait_for_cached_payload
from app.models.scanners import (
    MarketBreadthResponse,
    MarketMetadataResponse,
    ScannerMetadata,
    ScannerResponse,
)
from app.services.cache_service import generate_and_cache_all_scanners
from app.services.indicators import compute_indicators

if "user_tier" not in ScannerMetadata.model_fields:
    ScannerMetadata.model_fields["user_tier"] = FieldInfo(annotation=str, default="free")
    ScannerMetadata.model_rebuild(force=True)
    ScannerResponse.model_rebuild(force=True)
from app.services.pipeline import load_eod_data

logger = structlog.get_logger(__name__)

router = APIRouter(tags=["scanners"])


async def get_redis_client(request: Request) -> AsyncGenerator[Redis, None]:
    """Provide a Redis client bound to the current running event loop."""
    app_redis = getattr(request.app.state, "redis", None)
    if app_redis is not None:
        yield app_redis
        return

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


SUPPORTED_SLUGS: dict[str, dict[str, str]] = {
    "trend-template": {
        "title": "Minervini Trend Template",
        "description": "Stocks meeting Mark Minervini's 8-rule Trend Template criteria in Stage 2 markup.",
        "icon": "TrendingUp",
    },
    "recent-breakout": {
        "title": "Recent Breakouts",
        "description": "Stocks breaking out with price gain >= 2.5% and relative volume >= 1.5x above 50 SMA.",
        "icon": "Flame",
    },
    "4pct-breakout": {
        "title": "4%+ High-Volume Breakouts",
        "description": "Stocks up 4% or more with substantial trading volume expansion.",
        "icon": "Zap",
    },
    "high-volume": {
        "title": "High Relative Volume",
        "description": "Stocks trading at 2.0x or higher relative volume with positive daily returns.",
        "icon": "Volume2",
    },
    "1m-gainers": {
        "title": "1-Month Top Momentum Gainers",
        "description": "Highest 1-month percentage price gainers across the NSE universe.",
        "icon": "Activity",
    },
    "stage-2-breakout": {
        "title": "Stage 2 Breakout",
        "description": "Emerging from Stage 1 consolidation bases into Stage 2 uptrends with volume expansion.",
        "icon": "Flame",
    },
    "20-sma-pullback": {
        "title": "20-SMA Pullback",
        "description": "Orderly pullbacks to the rising 20-day Simple Moving Average in an established uptrend.",
        "icon": "Activity",
    },
    "3m-gainers": {
        "title": "3-Month Top Momentum Gainers",
        "description": "Leading gainers over a rolling 90-day performance window across the NSE universe.",
        "icon": "TrendingUp",
    },
    "outperformers": {
        "title": "Market Outperformers",
        "description": (
            "Stocks demonstrating persistent relative strength (RS >= 80) and outperforming the broader market."
        ),
        "icon": "Zap",
    },
    "doublers": {
        "title": "1-Year Doublers",
        "description": "Equities that have appreciated by 100%+ from their 52-week lows.",
        "icon": "Flame",
    },
    "new-listing-ipo": {
        "title": "New Listings & IPOs",
        "description": "Recent public listings with short historical data footprints (<2 years).",
        "icon": "Sparkles",
    },
}

SENSITIVE_INTERNAL_FIELDS: set[str] = {
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






def sanitize_row_for_guest(row: dict[str, Any]) -> dict[str, Any]:
    """Strip proprietary indicator scoring and internal window columns from guest view."""
    return {k: v for k, v in row.items() if k not in SENSITIVE_INTERNAL_FIELDS}


def filter_and_sort_candidates(
    candidates: list[dict[str, Any]],
    sort_by: str,
    direction: str,
    min_rs: int | None,
    min_rvol: float | None,
) -> list[dict[str, Any]]:
    """Filter by thresholds and apply requested column sorting."""
    filtered: list[dict[str, Any]] = []

    for item in candidates:
        if min_rs is not None:
            rs = item.get("rs_rating")
            if rs is None or rs < min_rs:
                continue
        if min_rvol is not None:
            rvol = item.get("rvol")
            if rvol is None or rvol < min_rvol:
                continue
        filtered.append(item)

    descending = direction.lower() == "desc"

    def sort_key_fn(item: dict[str, Any]) -> Any:
        val = item.get(sort_by)
        if val is None:
            # Check common aliases
            if sort_by in ("change_pct", "day_change"):
                val = item.get("day_change") if sort_by == "change_pct" else item.get("change_pct")
            elif sort_by in ("cmp", "close"):
                val = item.get("close") if sort_by == "cmp" else item.get("cmp")
            elif sort_by in ("ret_3m", "gain_3m"):
                val = item.get("ret_3m") if sort_by == "gain_3m" else item.get("gain_3m")
            elif sort_by in ("above_52w_low", "from_52w_low"):
                val = item.get("above_52w_low") if sort_by == "from_52w_low" else item.get("from_52w_low")

        if val is None:
            return -float("inf") if descending else float("inf")
        if isinstance(val, (int, float)):
            return float(val)
        return str(val).lower()

    filtered.sort(key=sort_key_fn, reverse=descending)
    return filtered


def get_current_market_status() -> str:
    """Calculate Indian market status based on current IST time."""
    ist_tz = timezone(timedelta(hours=5, minutes=30))
    now_ist = datetime.now(ist_tz)

    # Weekend check (5=Saturday, 6=Sunday)
    if now_ist.weekday() >= 5:
        return "closed"

    current_t = now_ist.time()
    pre_open_start = time(9, 0)
    market_open = time(9, 15)
    market_close = time(15, 30)

    if pre_open_start <= current_t < market_open:
        return "pre_open"
    if market_open <= current_t <= market_close:
        return "open"
    return "closed"


async def ensure_scanner_cache(redis: Redis) -> None:
    """Lazy computation pipeline: protected by distributed mutex to prevent thundering herd."""
    async with distributed_cache_lock(
        redis, "scanners:refresh", timeout_secs=settings.CACHE_MUTEX_TIMEOUT_SECS
    ) as acquired:
        if not acquired:
            logger.info("scanners.waiting_for_peer_calculation")
            await wait_for_cached_payload(redis, "scanner:trend-template:latest", max_wait_secs=8.0)
            return

        try:
            parquet_path = os.path.join(".cache", "parquet", "nse_2026.parquet")
            if not os.path.exists(parquet_path):
                alt_path = os.path.join("backend", ".cache", "parquet", "nse_2026.parquet")
                if os.path.exists(alt_path):
                    parquet_path = alt_path

            if os.path.exists(parquet_path):
                df = pl.read_parquet(parquet_path)
            else:
                df = await load_eod_data(2026)

            df = df.filter(pl.col("series") == "EQ").sort(["symbol", "date"])
            df_calc = compute_indicators(df)

            # Ensure high_52w, slope_200, and rs_rating are calculated even with partial year records
            h52 = pl.col("high").rolling_max(window_size=252, min_samples=20).over("symbol")
            l52 = pl.col("low").rolling_min(window_size=252, min_samples=20).over("symbol")
            prev_s200 = pl.coalesce(
                [
                    pl.col("sma_200").shift(20).over("symbol"),
                    pl.col("sma_200").shift(10).over("symbol"),
                    pl.col("sma_200").shift(5).over("symbol"),
                    pl.col("sma_200").shift(1).over("symbol"),
                ]
            )
            sl200 = ((pl.col("sma_200") - prev_s200) / prev_s200) * 100.0
            f52h = ((pl.col("close") - h52) / h52) * 100.0
            f52l = ((pl.col("close") - l52) / l52) * 100.0

            c1 = ((pl.col("close") > pl.col("sma_150")) & (pl.col("close") > pl.col("sma_200"))).fill_null(False)
            c2 = (pl.col("sma_150") > pl.col("sma_200")).fill_null(False)
            c3 = (sl200 > 0.0).fill_null(False)
            c4 = ((pl.col("sma_50") > pl.col("sma_150")) & (pl.col("sma_50") > pl.col("sma_200"))).fill_null(False)
            c5 = (pl.col("close") > pl.col("sma_50")).fill_null(False)
            c6 = (f52l >= 30.0).fill_null(False)
            c7 = (f52h >= -25.0).fill_null(False)
            c8 = (c4 & c2).fill_null(False)

            conds = (
                c1.cast(pl.Int32)
                + c2.cast(pl.Int32)
                + c3.cast(pl.Int32)
                + c4.cast(pl.Int32)
                + c5.cast(pl.Int32)
                + c6.cast(pl.Int32)
                + c7.cast(pl.Int32)
                + c8.cast(pl.Int32)
            )

            c = pl.col("close")
            c63 = pl.col("close").shift(63).over("symbol")
            c126 = pl.col("close").shift(126).over("symbol")
            c189 = pl.col("close").shift(189).over("symbol")
            c252 = pl.coalesce([pl.col("close").shift(252).over("symbol"), c189, c126, c63])
            q1 = (0.40 * ((c - c63) / pl.when(c63 > 0).then(c63).otherwise(1.0))).fill_null(0.0)
            q2 = (0.20 * ((c63 - c126) / pl.when(c126 > 0).then(c126).otherwise(1.0))).fill_null(0.0)
            q3 = (0.20 * ((c126 - c189) / pl.when(c189 > 0).then(c189).otherwise(1.0))).fill_null(0.0)
            q4 = (0.20 * ((c189 - c252) / pl.when(c252 > 0).then(c252).otherwise(1.0))).fill_null(0.0)
            raw_rs = q1 + q2 + q3 + q4

            ret_3m = (((pl.col("close") - c63) / pl.when(c63 > 0).then(c63).otherwise(1.0)) * 100.0)
            bars_cnt = pl.col("close").cum_count().over("symbol")

            df_calc = df_calc.with_columns(
                [
                    h52.alias("high_52w"),
                    l52.alias("low_52w"),
                    sl200.alias("slope_200"),
                    f52h.alias("from_52w_high"),
                    f52l.alias("from_52w_low"),
                    f52l.alias("above_52w_low"),
                    conds.alias("conditions_met"),
                    raw_rs.alias("raw_rs_score"),
                    ret_3m.alias("ret_3m"),
                    bars_cnt.alias("bars_count"),
                ]
            )

            # Add 20-day sparkline closes
            sparklines = df.group_by("symbol").agg(pl.col("close").tail(20).alias("sparkline"))
            df_calc = df_calc.join(sparklines, on="symbol", how="left")

            await generate_and_cache_all_scanners(df_calc, redis)
            logger.info("cache.lazy_computation_complete")
        except Exception as exc:
            logger.error("cache.lazy_computation_failed", error=str(exc))


@router.get("/scanners/{slug}", response_model=ScannerResponse)
async def get_scanner_candidates(
    slug: str,
    http_response: Response,
    limit: int = Query(default=50, ge=1, le=2500, description="Page limit"),
    offset: int = Query(default=0, ge=0, description="Page offset"),
    sort_by: str = Query(default="rs_rating", description="Sort by field"),
    direction: str = Query(default="desc", pattern="^(asc|desc)$", description="Sort direction"),
    min_rs: int | None = Query(default=None, ge=1, le=99, description="Minimum RS rating"),
    min_rvol: float | None = Query(default=None, ge=0.0, description="Minimum relative volume"),
    authorization: str | None = Header(default=None),
    x_user_id: str | None = Header(default=None, alias="x-user-id"),
    redis: Redis = Depends(get_redis_client),
) -> dict[str, Any]:
    """Retrieve pre-computed scanner candidates with freemium truncation gating."""
    if slug not in SUPPORTED_SLUGS:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={
                "error": "not_found",
                "message": f"Scanner '{slug}' not found. Supported scanners: {', '.join(SUPPORTED_SLUGS.keys())}",
            },
        )

    # 1. Freemium Identity Check (secure extraction via Supabase JWT or authorized internal header)
    is_pro, user_id = extract_user_identity(
        authorization=authorization,
        x_user_id=x_user_id,
    )
    logger.info("scanners.request", slug=slug, user_id=user_id, is_pro=is_pro, limit=limit, offset=offset)

    # 2. Fetch from Redis Cache
    cache_key = f"scanner:{slug}:latest"
    stale_key = f"scanner:{slug}:stale"
    raw_payload = await redis.get(cache_key)

    if not raw_payload:
        logger.info("scanners.cache_miss", slug=slug)
        await ensure_scanner_cache(redis)
        raw_payload = await redis.get(cache_key)
        if not raw_payload:
            # Fallback to stale cache if fresh generation still pending
            raw_payload = await redis.get(stale_key)
    else:
        try:
            parsed_test = json.loads(raw_payload)
            if parsed_test.get("total_matches", 0) == 0:
                logger.info("scanners.cache_refresh_empty", slug=slug)
                await ensure_scanner_cache(redis)
                raw_payload = await redis.get(cache_key)
        except Exception:
            pass

    # Tier-differentiated response: private cache with Vary to prevent CDN cross-tier contamination
    http_response.headers["Cache-Control"] = "private, max-age=60, stale-while-revalidate=120"
    http_response.headers["Vary"] = "Authorization, Accept-Encoding, X-User-Id"

    if not raw_payload:
        # Fallback empty payload
        cached_data: list[dict[str, Any]] = []
        cached_date = str(datetime.now(UTC).date())
    else:
        parsed = json.loads(raw_payload)
        cached_data = parsed.get("data", [])
        cached_date = parsed.get("date") or parsed.get("updated_at") or str(datetime.now(UTC).date())

    # 3. Filter & Sort
    filtered = filter_and_sort_candidates(
        candidates=cached_data,
        sort_by=sort_by,
        direction=direction,
        min_rs=min_rs,
        min_rvol=min_rvol,
    )
    total_matches = len(filtered)

    # 4. Freemium Paywall Truncation & Pagination
    if not is_pro:
        # Strictly truncate to top 10 candidates in backend response
        sliced = filtered[:10]
        sliced = [sanitize_row_for_guest(row) for row in sliced]
        is_truncated = total_matches > 10
        ret_offset = 0
        ret_limit = 10
    else:
        sliced = filtered[offset : offset + limit]
        is_truncated = False
        ret_offset = offset
        ret_limit = limit

    metadata = ScannerMetadata(
        slug=slug,
        title=SUPPORTED_SLUGS[slug]["title"],
        description=SUPPORTED_SLUGS[slug]["description"],
        last_updated=cached_date,
        total_matches=total_matches,
        returned=len(sliced),
        offset=ret_offset,
        limit=ret_limit,
        sort_by=sort_by,
        direction=direction,
        is_truncated=is_truncated,
        user_tier="pro" if is_pro else "free",
    )

    metadata_dict = metadata.model_dump()
    metadata_dict["user_tier"] = "pro" if is_pro else "free"

    return {
        "metadata": metadata_dict,
        "data": sliced,
        "results": sliced,
        "total_results": total_matches,
        "is_truncated": is_truncated,
    }


@router.get("/market-breadth", response_model=MarketBreadthResponse)
async def get_market_breadth(
    http_response: Response,
    redis: Redis = Depends(get_redis_client),
) -> dict[str, Any]:
    """Return latest pre-computed market breadth diagnostics."""
    http_response.headers["Cache-Control"] = "public, max-age=60, s-maxage=300, stale-while-revalidate=600"
    raw = await redis.get("market:breadth:latest")
    if not raw:
        await ensure_scanner_cache(redis)
        raw = await redis.get("market:breadth:latest")

    if raw:
        return json.loads(raw)

    return {
        "date": str(datetime.now(UTC).date()),
        "total_traded": 0,
        "advances": 0,
        "declines": 0,
        "unchanged": 0,
        "advance_decline_ratio": 1.0,
        "above_50_sma_pct": 50.0,
        "above_200_sma_pct": 50.0,
        "stage_2_count": 0,
        "stage_4_count": 0,
        "stage_2_to_4_ratio": 1.0,
        "updated_at": datetime.now(UTC).isoformat(),
    }


@router.get("/metadata", response_model=MarketMetadataResponse)
async def get_market_metadata(
    http_response: Response,
    redis: Redis = Depends(get_redis_client),
) -> dict[str, Any]:
    """Return market session metadata, last synced date, and candidate counts."""
    http_response.headers["Cache-Control"] = "public, max-age=60, s-maxage=300, stale-while-revalidate=600"
    raw = await redis.get("market:metadata:latest")
    if not raw:
        await ensure_scanner_cache(redis)
        raw = await redis.get("market:metadata:latest")

    market_status = get_current_market_status()

    if raw:
        data = json.loads(raw)
        data["market_status"] = market_status
        data["last_trading_date"] = data.get("last_synced_date", str(datetime.now(UTC).date()))
        data["total_stocks"] = data.get("total_equities", 0)
        return data

    now_date = str(datetime.now(UTC).date())
    return {
        "last_synced_date": now_date,
        "last_trading_date": now_date,
        "total_equities": 0,
        "total_stocks": 0,
        "status": "healthy",
        "market_status": market_status,
        "server_time_utc": datetime.now(UTC).isoformat(),
        "scanner_counts": {},
    }
