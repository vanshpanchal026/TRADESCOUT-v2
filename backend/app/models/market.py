"""TRADESCOUT — Pydantic Schemas for Market Breadth, Warmup, RRG, and Heatmap.

Strict typing adhering to Pydantic v2 and FastAPI conventions.
"""

from typing import Any

from pydantic import BaseModel, Field

# -------------------------------------------------------------------------
# The Warmup Schemas
# -------------------------------------------------------------------------


class AdvanceDecline(BaseModel):
    """Advance / Decline ratio and counts."""

    advances: int = Field(..., description="Number of advancing stocks")
    declines: int = Field(..., description="Number of declining stocks")
    unchanged: int = Field(..., description="Number of unchanged stocks")
    ratio: float = Field(..., description="Advance to Decline ratio")


class MarketParticipation(BaseModel):
    """Percentage and count of stocks above short, medium, and long-term SMAs."""

    above_20_sma_count: int = Field(..., description="Stocks above 20 SMA")
    above_20_sma_pct: float = Field(..., description="% of stocks above 20 SMA")
    above_50_sma_count: int = Field(..., description="Stocks above 50 SMA")
    above_50_sma_pct: float = Field(..., description="% of stocks above 50 SMA")
    above_200_sma_count: int = Field(..., description="Stocks above 200 SMA")
    above_200_sma_pct: float = Field(..., description="% of stocks above 200 SMA")


class RMESentiment(BaseModel):
    """Risk Management Environment sentiment score and regime."""

    score: float = Field(..., ge=0.0, le=100.0, description="RME Sentiment score (0-100)")
    regime: str = Field(..., description="Regime: 'Oversold / Washout', 'Neutral', 'Overextended'")
    description: str = Field(..., description="Qualitative summary of market risk temperature")


class StageDistribution(BaseModel):
    """Stan Weinstein 4-Stage market breadth distribution."""

    stage_1_count: int = Field(..., description="Stocks in Stage 1 (Base)")
    stage_1_pct: float = Field(..., description="% in Stage 1")
    stage_2_count: int = Field(..., description="Stocks in Stage 2 (Markup)")
    stage_2_pct: float = Field(..., description="% in Stage 2")
    stage_3_count: int = Field(..., description="Stocks in Stage 3 (Top)")
    stage_3_pct: float = Field(..., description="% in Stage 3")
    stage_4_count: int = Field(..., description="Stocks in Stage 4 (Capitulation/Decline)")
    stage_4_pct: float = Field(..., description="% in Stage 4")
    stage_2_to_4_ratio: float = Field(..., description="Stage 2 Markup to Stage 4 Capitulation ratio")


class HighsLows52W(BaseModel):
    """New 52-week Highs vs Lows breadth."""

    new_highs_52w: int = Field(..., description="Stocks hitting new 52-week highs")
    new_lows_52w: int = Field(..., description="Stocks hitting new 52-week lows")
    ratio: float = Field(..., description="Highs to Lows ratio")


class VolumeBreadth(BaseModel):
    """Market volume breadth characteristics."""

    avg_rvol: float = Field(..., description="Average Relative Volume across active stocks")
    up_volume_ratio: float = Field(..., description="Ratio of volume in advancing vs declining stocks")


class GlobalCueItem(BaseModel):
    """Individual macro/global indicator cue."""

    name: str = Field(..., description="Indicator name e.g. 'Gift Nifty', 'S&P 500', 'Brent Crude'")
    value: float = Field(..., description="Current index/asset price")
    change_pts: float = Field(..., description="Absolute point change")
    change_pct: float = Field(..., description="Percentage change")


class PreMarketCues(BaseModel):
    """Comprehensive morning pre-market cues."""

    sentiment: str = Field(..., description="'Bullish', 'Neutral', 'Cautious', or 'Bearish'")
    summary: str = Field(..., description="Daily strategic executive summary")
    gift_nifty: dict[str, Any] = Field(..., description="Gift Nifty early indicator quote")
    global_markets: list[GlobalCueItem] = Field(default_factory=list, description="Global market cue cards")
    macro_catalysts: list[str] = Field(default_factory=list, description="Major macro & domestic catalyst bullets")


class EarningsHorizonItem(BaseModel):
    """Earnings calendar radar item."""

    symbol: str = Field(..., description="NSE Symbol")
    company_name: str = Field(..., description="Company name")
    report_date: str = Field(..., description="Date of earnings report (YYYY-MM-DD)")
    market_cap_cr: float = Field(..., description="Market Cap in ₹ Cr")
    timing: str = Field(default="After Market", description="'Before Market' or 'After Market'")


class WarmupResponse(BaseModel):
    """Full morning market breadth & readiness payload for /api/market/warmup."""

    date: str = Field(..., description="Session date (YYYY-MM-DD)")
    market_status: str = Field(..., description="'OPEN', 'CLOSED', or 'PRE-MARKET'")
    last_synced: str = Field(..., description="ISO 8601 sync timestamp")
    total_traded: int = Field(..., description="Total equities analyzed")
    advance_decline: AdvanceDecline
    market_participation: MarketParticipation
    rme_sentiment: RMESentiment
    stage_distribution: StageDistribution
    highs_lows_52w: HighsLows52W
    volume_breadth: VolumeBreadth
    pre_market_cues: PreMarketCues
    earnings_horizon: list[EarningsHorizonItem] = Field(default_factory=list)


# -------------------------------------------------------------------------
# Relative Rotation Graph (RRG) Schemas
# -------------------------------------------------------------------------


class RRGTrailPoint(BaseModel):
    """Single historical session coordinate on RRG plane."""

    date: str = Field(..., description="Session date (YYYY-MM-DD)")
    rs_ratio: float = Field(..., description="JdK RS-Ratio centered at 100")
    rs_momentum: float = Field(..., description="JdK RS-Momentum centered at 100")


class RRGItem(BaseModel):
    """Stock or Sector plotted on the Relative Rotation Graph."""

    symbol: str = Field(..., description="Symbol or Sector code")
    name: str = Field(..., description="Display name")
    group: str = Field(..., description="'sector' or 'top-momentum'")
    rs_ratio: float = Field(..., description="Current JdK RS-Ratio")
    rs_momentum: float = Field(..., description="Current JdK RS-Momentum")
    quadrant: str = Field(..., description="'Leading', 'Weakening', 'Lagging', or 'Improving'")
    color: str = Field(..., description="Quadrant hex color code")
    cmp: float = Field(..., description="Current Market Price (₹) or Sector Level")
    change_1d: float = Field(..., description="1-day price change percentage")
    trail: list[RRGTrailPoint] = Field(..., description="Clockwise rotational trajectory history")


class RRGResponse(BaseModel):
    """Payload for /api/market/rrg."""

    benchmark: str = Field(..., description="Benchmark index (e.g. 'NIFTY 50')")
    group: str = Field(..., description="Selected group ('sectors' or 'top-momentum')")
    date: str = Field(..., description="Session date (YYYY-MM-DD)")
    quadrant_counts: dict[str, int] = Field(..., description="Count of items per quadrant")
    items: list[RRGItem] = Field(..., description="Plotted nodes with trails")


# -------------------------------------------------------------------------
# Heatmap Schemas
# -------------------------------------------------------------------------


class HeatmapStock(BaseModel):
    """Individual stock tile in Market Heatmap Treemap."""

    symbol: str = Field(..., description="NSE Symbol")
    name: str = Field(..., description="Company name")
    cmp: float = Field(..., description="Current price")
    change_1d: float = Field(..., description="1-day percentage change")
    market_cap: float = Field(..., description="Market Cap in ₹ Cr")
    weight_pct: float = Field(..., description="Weight percentage inside index / sector")
    volume: int = Field(..., description="Trading volume")


class HeatmapSector(BaseModel):
    """Sector grouping container holding nested stock tiles."""

    name: str = Field(..., description="Sector name")
    market_cap: float = Field(..., description="Cumulative sector market cap in ₹ Cr")
    weight_pct: float = Field(..., description="Weight percentage in index")
    change_1d: float = Field(..., description="Market-cap weighted average 1-day change (%)")
    stocks: list[HeatmapStock] = Field(..., description="Constituent stock tiles")


class HeatmapResponse(BaseModel):
    """Payload for /api/market/heatmap."""

    index: str = Field(..., description="Index name (e.g. 'NIFTY 50', 'NIFTY NEXT 50', 'NIFTY 500')")
    date: str = Field(..., description="Session date (YYYY-MM-DD)")
    total_market_cap: float = Field(..., description="Total index market cap in ₹ Cr")
    sectors: list[HeatmapSector] = Field(..., description="Hierarchically grouped sector nodes")
