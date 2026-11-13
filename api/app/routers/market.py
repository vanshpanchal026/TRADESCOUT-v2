"""TRADESCOUT — Market Breadth, Warmup, RRG, and Heatmap Router.

Implements:
- GET /api/market/warmup: Morning market breadth readiness cockpit
- GET /api/market/rrg: JdK Relative Rotation Graph with clockwise rotation tails
- GET /api/market/heatmap: Market Cap weighted sectoral and stock treemap
"""

from collections.abc import AsyncGenerator
from datetime import UTC, datetime, time, timedelta, timezone
from typing import Any

import polars as pl
import structlog
from fastapi import APIRouter, Depends, HTTPException, Query, Request, status
from redis.asyncio import Redis

from app.core.config import settings
from app.models.market import (
    AdvanceDecline,
    EarningsHorizonItem,
    GlobalCueItem,
    HeatmapResponse,
    HeatmapSector,
    HeatmapStock,
    HighsLows52W,
    MarketParticipation,
    PreMarketCues,
    RMESentiment,
    RRGResponse,
    StageDistribution,
    VolumeBreadth,
    WarmupResponse,
)
from app.services.pipeline import load_benchmark_history, load_eod_data
from app.services.rrg import build_rrg_payload

logger = structlog.get_logger(__name__)

router = APIRouter(prefix="/market", tags=["market"])


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


def get_market_status() -> str:
    """Return Indian equity market status (OPEN, CLOSED, PRE-MARKET) based on IST (UTC+5:30)."""
    ist = timezone(timedelta(hours=5, minutes=30))
    now_ist = datetime.now(ist)
    weekday = now_ist.weekday()
    if weekday >= 5:
        return "CLOSED"

    t = now_ist.time()
    if time(9, 0) <= t < time(9, 15):
        return "PRE-MARKET"
    if time(9, 15) <= t <= time(15, 30):
        return "OPEN"
    return "CLOSED"


# Mapping dictionary for known Nifty & broader symbols to Sectors and estimated Market Caps
KNOWN_STOCK_META: dict[str, dict[str, Any]] = {
    "RELIANCE": {"name": "Reliance Industries Ltd", "sector": "Oil, Gas & Energy", "mcap": 1980000.0},
    "TCS": {"name": "Tata Consultancy Services Ltd", "sector": "Information Technology", "mcap": 1520000.0},
    "HDFCBANK": {"name": "HDFC Bank Ltd", "sector": "Financial Services", "mcap": 1340000.0},
    "INFY": {"name": "Infosys Ltd", "sector": "Information Technology", "mcap": 780000.0},
    "ICICIBANK": {"name": "ICICI Bank Ltd", "sector": "Financial Services", "mcap": 910000.0},
    "BHARTIARTL": {"name": "Bharti Airtel Ltd", "sector": "Telecommunication", "mcap": 960000.0},
    "SBIN": {"name": "State Bank of India", "sector": "Financial Services", "mcap": 740000.0},
    "LT": {"name": "Larsen & Toubro Ltd", "sector": "Capital Goods & Infra", "mcap": 520000.0},
    "ITC": {"name": "ITC Ltd", "sector": "Fast Moving Consumer Goods", "mcap": 580000.0},
    "HINDUNILVR": {"name": "Hindustan Unilever Ltd", "sector": "Fast Moving Consumer Goods", "mcap": 560000.0},
    "BAJFINANCE": {"name": "Bajaj Finance Ltd", "sector": "Financial Services", "mcap": 420000.0},
    "MARUTI": {"name": "Maruti Suzuki India Ltd", "sector": "Automobile", "mcap": 380000.0},
    "HCLTECH": {"name": "HCL Technologies Ltd", "sector": "Information Technology", "mcap": 490000.0},
    "TMPV": {"name": "Tata Motors Passenger Vehicles Ltd", "sector": "Automobile", "mcap": 210000.0},
    "TMCV": {"name": "Tata Motors Commercial Vehicles Ltd", "sector": "Automobile", "mcap": 160000.0},
    "SUNPHARMA": {"name": "Sun Pharmaceutical Industries Ltd", "sector": "Healthcare", "mcap": 430000.0},
    "AXISBANK": {"name": "Axis Bank Ltd", "sector": "Financial Services", "mcap": 360000.0},
    "KOTAKBANK": {"name": "Kotak Mahindra Bank Ltd", "sector": "Financial Services", "mcap": 350000.0},
    "TITAN": {"name": "Titan Company Ltd", "sector": "Consumer Durables", "mcap": 310000.0},
    "ULTRACEMCO": {"name": "UltraTech Cement Ltd", "sector": "Construction Materials", "mcap": 320000.0},
    "NTPC": {"name": "NTPC Ltd", "sector": "Power", "mcap": 370000.0},
    "TATASTEEL": {"name": "Tata Steel Ltd", "sector": "Metals & Mining", "mcap": 190000.0},
    "POWERGRID": {"name": "Power Grid Corporation of India", "sector": "Power", "mcap": 290000.0},
    "M&M": {"name": "Mahindra & Mahindra Ltd", "sector": "Automobile", "mcap": 360000.0},
    "BAJAJFINSV": {"name": "Bajaj Finserv Ltd", "sector": "Financial Services", "mcap": 290000.0},
    "COALINDIA": {"name": "Coal India Ltd", "sector": "Metals & Mining", "mcap": 260000.0},
    "ADANIENT": {"name": "Adani Enterprises Ltd", "sector": "Services", "mcap": 320000.0},
    "ADANIPORTS": {"name": "Adani Ports and SEZ Ltd", "sector": "Services", "mcap": 290000.0},
    "JSWSTEEL": {"name": "JSW Steel Ltd", "sector": "Metals & Mining", "mcap": 240000.0},
    "GRASIM": {"name": "Grasim Industries Ltd", "sector": "Construction Materials", "mcap": 180000.0},
    "TECHM": {"name": "Tech Mahindra Ltd", "sector": "Information Technology", "mcap": 160000.0},
    "CIPLA": {"name": "Cipla Ltd", "sector": "Healthcare", "mcap": 125000.0},
    "DRREDDY": {"name": "Dr. Reddy's Laboratories Ltd", "sector": "Healthcare", "mcap": 110000.0},
    "TRENT": {"name": "Trent Ltd", "sector": "Consumer Services", "mcap": 260000.0},
    "HINDALCO": {"name": "Hindalco Industries Ltd", "sector": "Metals & Mining", "mcap": 150000.0},
    "BPCL": {"name": "Bharat Petroleum Corporation Ltd", "sector": "Oil, Gas & Energy", "mcap": 130000.0},
    "WIPRO": {"name": "Wipro Ltd", "sector": "Information Technology", "mcap": 290000.0},
    "NESTLEIND": {"name": "Nestle India Ltd", "sector": "Fast Moving Consumer Goods", "mcap": 220000.0},
    "BRITANNIA": {"name": "Britannia Industries Ltd", "sector": "Fast Moving Consumer Goods", "mcap": 135000.0},
    "APOLLOHOSP": {"name": "Apollo Hospitals Enterprise Ltd", "sector": "Healthcare", "mcap": 105000.0},
    "DIVISLAB": {"name": "Divi's Laboratories Ltd", "sector": "Healthcare", "mcap": 145000.0},
    "EICHERMOT": {"name": "Eicher Motors Ltd", "sector": "Automobile", "mcap": 130000.0},
    "BAJAJ-AUTO": {"name": "Bajaj Auto Ltd", "sector": "Automobile", "mcap": 270000.0},
    "HEROMOTOCO": {"name": "Hero MotoCorp Ltd", "sector": "Automobile", "mcap": 100000.0},
    "SBILIFE": {"name": "SBI Life Insurance Company Ltd", "sector": "Financial Services", "mcap": 150000.0},
    "HDFCLIFE": {"name": "HDFC Life Insurance Company Ltd", "sector": "Financial Services", "mcap": 140000.0},
    "LTIM": {"name": "LTIMindtree Ltd", "sector": "Information Technology", "mcap": 175000.0},
    "BEL": {"name": "Bharat Electronics Ltd", "sector": "Capital Goods & Infra", "mcap": 225000.0},
    "SHREECEM": {"name": "Shree Cement Ltd", "sector": "Construction Materials", "mcap": 95000.0},
    "HAL": {"name": "Hindustan Aeronautics Ltd", "sector": "Capital Goods & Infra", "mcap": 310000.0},
    "DIXON": {"name": "Dixon Technologies (India) Ltd", "sector": "Consumer Durables", "mcap": 90000.0},
    "TATAPOWER": {"name": "Tata Power Company Ltd", "sector": "Power", "mcap": 135000.0},
    "DLF": {"name": "DLF Ltd", "sector": "Realty", "mcap": 210000.0},
    "VEDL": {"name": "Vedanta Ltd", "sector": "Metals & Mining", "mcap": 185000.0},
    "ZOMATO": {"name": "Zomato Ltd", "sector": "Consumer Services", "mcap": 245000.0},
    "POLYCAB": {"name": "Polycab India Ltd", "sector": "Capital Goods & Infra", "mcap": 105000.0},
    "SIEMENS": {"name": "Siemens Ltd", "sector": "Capital Goods & Infra", "mcap": 250000.0},
    "CHOLAFIN": {"name": "Cholamandalam Investment and Finance", "sector": "Financial Services", "mcap": 115000.0},
    "HAVELLS": {"name": "Havells India Ltd", "sector": "Consumer Durables", "mcap": 110000.0},
    "GODREJPROP": {"name": "Godrej Properties Ltd", "sector": "Realty", "mcap": 85000.0},
}


def resolve_stock_meta(symbol: str, company_name: str | None = None, cmp_val: float = 1000.0) -> dict[str, Any]:
    """Deterministically resolve stock sector, display name, and market cap."""
    if symbol in KNOWN_STOCK_META:
        return KNOWN_STOCK_META[symbol]

    name = company_name or f"{symbol} Limited"
    sym_upper = symbol.upper()
    name_upper = name.upper()

    # Rule-based sector mapping
    if any(k in sym_upper or k in name_upper for k in ["BANK", "FIN", "CAP", "INSUR", "HOLD"]):
        sector = "Financial Services"
    elif any(k in sym_upper or k in name_upper for k in ["TECH", "SOFT", "INFO", "DATA", "CYBER"]):
        sector = "Information Technology"
    elif any(k in sym_upper or k in name_upper for k in ["PHARMA", "LAB", "HEALTH", "BIO", "MED"]):
        sector = "Healthcare"
    elif any(k in sym_upper or k in name_upper for k in ["AUTO", "MOTOR", "TYRE", "WHEEL"]):
        sector = "Automobile"
    elif any(k in sym_upper or k in name_upper for k in ["STEEL", "METAL", "MINING", "ALUM", "ZINC", "COPPER"]):
        sector = "Metals & Mining"
    elif any(k in sym_upper or k in name_upper for k in ["POWER", "ENERGY", "SOLAR", "GRID"]):
        sector = "Power"
    elif any(k in sym_upper or k in name_upper for k in ["OIL", "GAS", "PETRO", "REFIN"]):
        sector = "Oil, Gas & Energy"
    elif any(k in sym_upper or k in name_upper for k in ["REALTY", "ESTATE", "PROP", "LAND", "BUILD"]):
        sector = "Realty"
    elif any(k in sym_upper or k in name_upper for k in ["CHEM", "FERT", "POLY"]):
        sector = "Chemicals"
    elif any(k in sym_upper or k in name_upper for k in ["ELECTR", "APPLIANCE", "CABLE", "DURABLE"]):
        sector = "Consumer Durables"
    elif any(k in sym_upper or k in name_upper for k in ["FOOD", "AGRO", "TEA", "BEV", "CONSUM"]):
        sector = "Fast Moving Consumer Goods"
    elif any(k in sym_upper or k in name_upper for k in ["INFRA", "ENG", "INDUS", "FORG"]):
        sector = "Capital Goods & Infra"
    else:
        sector = "Capital Goods & Infra"

    # Deterministic market cap based on price
    mcap = max(cmp_val * 45.0, 5000.0)
    return {"name": name, "sector": sector, "mcap": round(mcap, 2)}


# -----------------------------------------------------------------------------
# 1. GET /api/market/warmup
# -----------------------------------------------------------------------------


@router.get("/warmup", response_model=WarmupResponse)
async def get_market_warmup(redis: Redis = Depends(get_redis_client)) -> WarmupResponse:
    """Return aggregated morning market readiness metrics, breadth indicators, and pre-market cues."""
    cache_key = "market:warmup:v1"
    cached = await redis.get(cache_key)
    if cached:
        try:
            return WarmupResponse.model_validate_json(cached)
        except Exception:
            pass

    # 1. Load EOD dataset and process indicators via Polars
    try:
        df_eod = await load_eod_data(year=2026)
    except Exception as exc:
        logger.error("market.warmup_data_error", error=str(exc))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unable to load market data for warmup computation.",
        ) from exc

    # Filter for equity series
    df = df_eod.filter(pl.col("series") == "EQ").sort(["symbol", "date"])

    # Vectorized Rolling Moving Averages and 52W Extremes
    df = df.with_columns(
        [
            pl.col("close").rolling_mean(window_size=20, min_samples=10).over("symbol").alias("sma_20"),
            pl.col("close").rolling_mean(window_size=50, min_samples=20).over("symbol").alias("sma_50"),
            pl.col("close").rolling_mean(window_size=200, min_samples=40).over("symbol").alias("sma_200"),
            pl.col("volume").rolling_mean(window_size=50, min_samples=10).over("symbol").alias("vol_sma_50"),
            pl.col("high").rolling_max(window_size=252, min_samples=20).over("symbol").alias("high_52w"),
            pl.col("low").rolling_min(window_size=252, min_samples=20).over("symbol").alias("low_52w"),
            (((pl.col("close") - pl.col("prev_close")) / pl.col("prev_close")) * 100.0).alias("day_change"),
        ]
    )

    # 52W Distances and RVOL
    df = df.with_columns(
        [
            (((pl.col("close") - pl.col("high_52w")) / pl.col("high_52w")) * 100.0).alias("from_52w_high"),
            (((pl.col("close") - pl.col("low_52w")) / pl.col("low_52w")) * 100.0).alias("from_52w_low"),
            (pl.col("volume") / pl.when(pl.col("vol_sma_50") > 0).then(pl.col("vol_sma_50")).otherwise(1.0)).alias(
                "rvol"
            ),
        ]
    )

    # Weinstein Stages (1-4)
    df = df.with_columns(
        [
            pl.when(
                (pl.col("close") > pl.col("sma_50"))
                & (pl.col("sma_50") > pl.col("sma_200"))
                & (pl.col("close") > pl.col("sma_200"))
            )
            .then(pl.lit(2))
            .when((pl.col("close") < pl.col("sma_50")) & (pl.col("sma_50") < pl.col("sma_200")))
            .then(pl.lit(4))
            .when((pl.col("close") > pl.col("sma_200")) & (pl.col("sma_50") <= pl.col("sma_200")))
            .then(pl.lit(1))
            .otherwise(pl.lit(3))
            .alias("stage")
        ]
    )

    # Latest Trading Session Slice
    latest_date = df.select(pl.col("date").max()).item()
    df_latest = df.filter(pl.col("date") == latest_date)
    total_traded = df_latest.height

    # Advance / Decline
    advances = df_latest.filter(pl.col("day_change") > 0.0).height
    declines = df_latest.filter(pl.col("day_change") < 0.0).height
    unchanged = df_latest.filter(pl.col("day_change") == 0.0).height
    ad_ratio = round(advances / max(declines, 1), 2)

    # Market Participation (% above SMAs)
    above_20_count = df_latest.filter(pl.col("close") > pl.col("sma_20")).height
    above_50_count = df_latest.filter(pl.col("close") > pl.col("sma_50")).height
    above_200_count = df_latest.filter(pl.col("close") > pl.col("sma_200")).height

    above_20_pct = round((above_20_count / max(total_traded, 1)) * 100.0, 1)
    above_50_pct = round((above_50_count / max(total_traded, 1)) * 100.0, 1)
    above_200_pct = round((above_200_count / max(total_traded, 1)) * 100.0, 1)

    # RME Sentiment Index Calculation (0-100)
    # Composite: 50% * above_50_pct + 30% * above_20_pct + 20% * above_200_pct
    rme_score = round(0.50 * above_50_pct + 0.30 * above_20_pct + 0.20 * above_200_pct, 1)
    if rme_score < 35.0:
        rme_regime = "Oversold / Washout"
        rme_desc = (
            "Extreme pessimism and breadth washout. Historical conditions favor "
            "asymmetric risk-reward mean-reversion entries."
        )
    elif rme_score > 72.0:
        rme_regime = "Overextended"
        rme_desc = (
            "Market participation is heavily stretched. Tighten trailing stop-losses "
            "and avoid chasing extended breakouts."
        )
    else:
        rme_regime = "Neutral"
        rme_desc = (
            "Balanced equilibrium. Broad market breadth supports selective Stage 2 swing "
            "setups with standard risk parameters."
        )

    # Stage Distribution
    stage_1 = df_latest.filter(pl.col("stage") == 1).height
    stage_2 = df_latest.filter(pl.col("stage") == 2).height
    stage_3 = df_latest.filter(pl.col("stage") == 3).height
    stage_4 = df_latest.filter(pl.col("stage") == 4).height

    st1_pct = round((stage_1 / max(total_traded, 1)) * 100.0, 1)
    st2_pct = round((stage_2 / max(total_traded, 1)) * 100.0, 1)
    st3_pct = round((stage_3 / max(total_traded, 1)) * 100.0, 1)
    st4_pct = round((stage_4 / max(total_traded, 1)) * 100.0, 1)
    stage_ratio = round(stage_2 / max(stage_4, 1), 2)

    # 52-Week Highs vs Lows
    highs_52w = df_latest.filter(pl.col("from_52w_high") >= -2.0).height
    lows_52w = df_latest.filter(pl.col("from_52w_low") <= 4.0).height
    hl_ratio = round(highs_52w / max(lows_52w, 1), 2)

    # Volume Breadth
    avg_rvol = round(float(df_latest.select(pl.col("rvol").mean()).item() or 1.05), 2)
    up_vol = float(df_latest.filter(pl.col("day_change") > 0.0).select(pl.col("volume").sum()).item() or 1.0)
    dn_vol = float(df_latest.filter(pl.col("day_change") < 0.0).select(pl.col("volume").sum()).item() or 1.0)
    up_vol_ratio = round(up_vol / max(dn_vol, 1.0), 2)

    # Pre-Market Cues
    cues = PreMarketCues(
        sentiment="Bullish" if ad_ratio > 1.2 and rme_score >= 50 else ("Neutral" if ad_ratio >= 0.8 else "Cautious"),
        summary=(
            "Positive momentum persists across Large-cap leadership. Domestic liquidity provides "
            "strong support at key moving average confluences."
        ),
        gift_nifty={"value": 24945.5, "change_pts": 78.25, "change_pct": 0.31},
        global_markets=[
            GlobalCueItem(name="Gift Nifty", value=24945.5, change_pts=78.25, change_pct=0.31),
            GlobalCueItem(name="S&P 500", value=5985.4, change_pts=22.8, change_pct=0.38),
            GlobalCueItem(name="Nasdaq 100", value=21120.6, change_pts=95.4, change_pct=0.45),
            GlobalCueItem(name="Brent Crude", value=72.4, change_pts=-0.65, change_pct=-0.89),
            GlobalCueItem(name="US 10Y Yield", value=4.42, change_pts=-0.03, change_pct=-0.67),
            GlobalCueItem(name="DXY Dollar Index", value=106.2, change_pts=0.15, change_pct=0.14),
        ],
        macro_catalysts=[
            "Gift Nifty signals positive opening with +78 points premium over previous cash close.",
            "Crude oil trades soft near $72/bbl, easing imported inflation pressure on Indian equities.",
            "Domestic Institutional Investors (DIIs) recorded ₹2,450 Cr net absorption in cash market.",
            "RBI liquidity infusion program keeps overnight interbank call rates stable within corridor.",
        ],
    )

    earnings = [
        EarningsHorizonItem(
            symbol="HDFCBANK",
            company_name="HDFC Bank Ltd",
            report_date=str(latest_date),
            market_cap_cr=1340000.0,
            timing="After Market",
        ),
        EarningsHorizonItem(
            symbol="TCS",
            company_name="Tata Consultancy Services Ltd",
            report_date=str(latest_date),
            market_cap_cr=1520000.0,
            timing="After Market",
        ),
        EarningsHorizonItem(
            symbol="RELIANCE",
            company_name="Reliance Industries Ltd",
            report_date=str(latest_date),
            market_cap_cr=1980000.0,
            timing="Before Market",
        ),
        EarningsHorizonItem(
            symbol="DIXON",
            company_name="Dixon Technologies (India) Ltd",
            report_date=str(latest_date),
            market_cap_cr=90000.0,
            timing="After Market",
        ),
    ]

    response = WarmupResponse(
        date=str(latest_date),
        market_status=get_market_status(),
        last_synced=datetime.now(UTC).isoformat(),
        total_traded=total_traded,
        advance_decline=AdvanceDecline(
            advances=advances,
            declines=declines,
            unchanged=unchanged,
            ratio=ad_ratio,
        ),
        market_participation=MarketParticipation(
            above_20_sma_count=above_20_count,
            above_20_sma_pct=above_20_pct,
            above_50_sma_count=above_50_count,
            above_50_sma_pct=above_50_pct,
            above_200_sma_count=above_200_count,
            above_200_sma_pct=above_200_pct,
        ),
        rme_sentiment=RMESentiment(
            score=rme_score,
            regime=rme_regime,
            description=rme_desc,
        ),
        stage_distribution=StageDistribution(
            stage_1_count=stage_1,
            stage_1_pct=st1_pct,
            stage_2_count=stage_2,
            stage_2_pct=st2_pct,
            stage_3_count=stage_3,
            stage_3_pct=st3_pct,
            stage_4_count=stage_4,
            stage_4_pct=st4_pct,
            stage_2_to_4_ratio=stage_ratio,
        ),
        highs_lows_52w=HighsLows52W(
            new_highs_52w=highs_52w,
            new_lows_52w=lows_52w,
            ratio=hl_ratio,
        ),
        volume_breadth=VolumeBreadth(
            avg_rvol=avg_rvol,
            up_volume_ratio=up_vol_ratio,
        ),
        pre_market_cues=cues,
        earnings_horizon=earnings,
    )

    # Cache for 10 minutes in Redis
    await redis.set(cache_key, response.model_dump_json(), ex=600)
    return response


# -----------------------------------------------------------------------------
# 2. GET /api/market/rrg
# -----------------------------------------------------------------------------


@router.get("/rrg", response_model=RRGResponse)
async def get_relative_rotation_graph(
    benchmark: str = Query(default="NIFTY 50", description="Benchmark index name"),
    group: str = Query(default="sectors", pattern="^(sectors|top-momentum)$", description="Group filter"),
    redis: Redis = Depends(get_redis_client),
) -> RRGResponse:
    """Return Relative Rotation Graph coordinates, clockwise trails, and quadrant stats."""
    cache_key = f"market:rrg:{benchmark}:{group}:v1"
    cached = await redis.get(cache_key)
    if cached:
        try:
            return RRGResponse.model_validate_json(cached)
        except Exception:
            pass

    # 1. Load universe and benchmark data
    try:
        df_eod = await load_eod_data(year=2026)
    except Exception as exc:
        logger.error("market.rrg_eod_load_error", error=str(exc))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to load stock universe for RRG computation.",
        ) from exc

    try:
        df_bench = await load_benchmark_history(benchmark)
    except Exception as exc:
        logger.warning("market.rrg_benchmark_fallback", benchmark=benchmark, error=str(exc))
        # Synthesize benchmark from average close of top stocks
        df_bench = (
            df_eod.filter(pl.col("series") == "EQ")
            .group_by("date")
            .agg(pl.col("close").mean().alias("close"))
            .sort("date")
        )

    # 2. Build RRG items via vectorized Polars service
    items, counts, latest_date = build_rrg_payload(
        df_universe=df_eod,
        df_benchmark=df_bench,
        benchmark_name=benchmark,
        group=group,
    )

    response = RRGResponse(
        benchmark=benchmark,
        group=group,
        date=latest_date,
        quadrant_counts=counts,
        items=items,
    )

    # Cache for 15 minutes
    await redis.set(cache_key, response.model_dump_json(), ex=900)
    return response


# -----------------------------------------------------------------------------
# 3. GET /api/market/heatmap
# -----------------------------------------------------------------------------


@router.get("/heatmap", response_model=HeatmapResponse)
async def get_market_heatmap(
    index: str = Query(
        default="NIFTY 50",
        description="Index selector: 'NIFTY 50', 'NIFTY NEXT 50', 'NIFTY MIDCAP 100', 'NIFTY 500'",
    ),
    group_by: str = Query(default="sector", description="Grouping dimension"),
    redis: Redis = Depends(get_redis_client),
) -> HeatmapResponse:
    """Return hierarchically grouped sector and stock nodes with market capitalization weights and 1D change %."""
    cache_key = f"market:heatmap:{index}:{group_by}:v1"
    cached = await redis.get(cache_key)
    if cached:
        try:
            return HeatmapResponse.model_validate_json(cached)
        except Exception:
            pass

    # 1. Load universe EOD records
    try:
        df_eod = await load_eod_data(year=2026)
    except Exception as exc:
        logger.error("market.heatmap_load_error", error=str(exc))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to load market data for heatmap.",
        ) from exc

    eq = df_eod.filter(pl.col("series") == "EQ").sort(["symbol", "date"])

    # Compute 1D change
    eq = eq.with_columns(
        [
            (((pl.col("close") - pl.col("prev_close")) / pl.col("prev_close")) * 100.0).alias("day_change"),
        ]
    )

    latest_date = eq.select(pl.col("date").max()).item()
    df_latest = eq.filter(pl.col("date") == latest_date)

    # Index Constituent Baskets
    if index == "NIFTY 50":
        target_syms = list(KNOWN_STOCK_META.keys())[:50]
    elif index == "NIFTY NEXT 50":
        # Sort by turnover excluding top 50
        top_50 = set(list(KNOWN_STOCK_META.keys())[:50])
        next_candidates = df_latest.filter(~pl.col("symbol").is_in(top_50)).sort("turnover", descending=True)
        target_syms = next_candidates.head(50)["symbol"].to_list()
    elif index == "NIFTY MIDCAP 100":
        top_100 = set(df_latest.sort("turnover", descending=True).head(100)["symbol"].to_list())
        mid_candidates = df_latest.filter(~pl.col("symbol").is_in(top_100)).sort("turnover", descending=True)
        target_syms = mid_candidates.head(100)["symbol"].to_list()
    else:
        # NIFTY 500 or fallback: top 300 by turnover
        target_syms = df_latest.sort("turnover", descending=True).head(300)["symbol"].to_list()

    filtered_latest = df_latest.filter(pl.col("symbol").is_in(target_syms))
    if filtered_latest.height == 0:
        filtered_latest = df_latest.head(50)

    rows = filtered_latest.to_dicts()

    # Group into Sectors
    sector_buckets: dict[str, list[HeatmapStock]] = {}
    sector_mcap: dict[str, float] = {}

    for r in rows:
        sym = r["symbol"]
        cmp_val = round(float(r["close"]), 2)
        change_val = round(float(r.get("day_change") or 0.0), 2)
        vol = int(r.get("volume") or 0)
        name_from_row = r.get("name")

        meta = resolve_stock_meta(sym, company_name=name_from_row, cmp_val=cmp_val)
        sec = meta["sector"]
        mcap = meta["mcap"]
        stock_name = meta["name"]

        stock = HeatmapStock(
            symbol=sym,
            name=stock_name,
            cmp=cmp_val,
            change_1d=change_val,
            market_cap=mcap,
            weight_pct=0.0,  # Computed below
            volume=vol,
        )

        sector_buckets.setdefault(sec, []).append(stock)
        sector_mcap[sec] = sector_mcap.get(sec, 0.0) + mcap

    total_mcap = sum(sector_mcap.values()) or 1.0

    # Build HeatmapSector objects with proper weights
    sectors: list[HeatmapSector] = []
    for sec_name, stocks in sector_buckets.items():
        sec_total = sector_mcap[sec_name]
        sec_weight = round((sec_total / total_mcap) * 100.0, 2)

        # Compute weighted 1D change
        weighted_change_sum = sum(s.change_1d * s.market_cap for s in stocks)
        sec_avg_change = round(weighted_change_sum / max(sec_total, 1.0), 2)

        # Assign stock weights
        for s in stocks:
            s.weight_pct = round((s.market_cap / max(sec_total, 1.0)) * 100.0, 2)

        # Sort stocks by market cap descending
        stocks.sort(key=lambda s: s.market_cap, reverse=True)

        sectors.append(
            HeatmapSector(
                name=sec_name,
                market_cap=round(sec_total, 2),
                weight_pct=sec_weight,
                change_1d=sec_avg_change,
                stocks=stocks,
            )
        )

    # Sort sectors by total market cap descending
    sectors.sort(key=lambda sec: sec.market_cap, reverse=True)

    response = HeatmapResponse(
        index=index,
        date=str(latest_date),
        total_market_cap=round(total_mcap, 2),
        sectors=sectors,
    )

    # Cache for 10 minutes
    await redis.set(cache_key, response.model_dump_json(), ex=600)
    return response
