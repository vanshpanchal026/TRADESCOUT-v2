"""TRADESCOUT — Pydantic Models for Scanner, Market Breadth, and Metadata APIs."""

from typing import Any

from pydantic import BaseModel, ConfigDict, Field


class ScannerItem(BaseModel):
    """Schema for individual stock candidate in scanner results."""

    model_config = ConfigDict(extra="allow")

    symbol: str = Field(..., description="NSE trading symbol")
    cmp: float | None = Field(default=None, description="Current market price (₹)")
    name: str | None = Field(default=None, description="Company name")
    company_name: str | None = Field(default=None, description="Company name alias")
    series: str | None = Field(default="EQ", description="NSE series")
    isin: str | None = Field(default=None, description="ISIN security code")
    day_change: float | None = Field(default=None, description="1-day price change (%)")
    change_pct: float | None = Field(default=None, description="1-day price change (%) alias")
    rvol: float | None = Field(default=None, description="Relative volume vs 50-day average")
    rs_rating: int | None = Field(default=None, description="IBD Relative Strength rating (1–99)")
    stage: int | None = Field(default=None, description="Weinstein Stage (1-4)")
    stage_name: str | None = Field(default=None, description="Weinstein Stage label")
    conditions_met: int | None = Field(default=None, description="Minervini conditions met (0–8)")
    sma_10: float | None = Field(default=None, description="10-day Simple Moving Average")
    sma_20: float | None = Field(default=None, description="20-day Simple Moving Average")
    sma_50: float | None = Field(default=None, description="50-day Simple Moving Average")
    sma_150: float | None = Field(default=None, description="150-day Simple Moving Average")
    sma_200: float | None = Field(default=None, description="200-day Simple Moving Average")
    from_52w_high: float | None = Field(default=None, description="% distance from 52-week high")
    from_52w_low: float | None = Field(default=None, description="% distance from 52-week low")
    high_52w: float | None = Field(default=None, description="52-week high price (₹)")
    low_52w: float | None = Field(default=None, description="52-week low price (₹)")
    volume: int | None = Field(default=None, description="Day trading volume")
    rsi: float | None = Field(default=None, description="Wilder 14-period RSI")
    delivery_pct: float | None = Field(default=None, description="Delivery percentage (%)")
    industry: str | None = Field(default=None, description="Industry group classification")
    sparkline: list[float] | None = Field(default=None, description="20-day closing prices for sparklines")


class ScannerMetadata(BaseModel):
    """Metadata envelope for scanner endpoints."""

    slug: str = Field(..., description="Scanner slug identifier")
    title: str = Field(..., description="Human-readable scanner title")
    description: str = Field(..., description="Scanner description and methodology")
    last_updated: str = Field(..., description="Date or ISO timestamp of dataset")
    total_matches: int = Field(..., description="Total candidates matching criteria")
    returned: int = Field(..., description="Count of stocks returned in payload")
    offset: int = Field(default=0, description="Pagination offset")
    limit: int = Field(default=50, description="Pagination limit")
    sort_by: str = Field(default="rs_rating", description="Sort field name")
    direction: str = Field(default="desc", description="Sort direction ('asc' or 'desc')")
    is_truncated: bool = Field(default=False, description="Whether guest view is truncated to top 10")


class ScannerResponse(BaseModel):
    """Complete response payload for GET /api/scanners/{slug}."""

    metadata: ScannerMetadata = Field(..., description="Scanner metadata envelope")
    data: list[dict[str, Any]] = Field(..., description="Stock candidate records")
    results: list[dict[str, Any]] = Field(default_factory=list, description="Stock candidate records (alias)")
    total_results: int = Field(..., description="Total candidates matching criteria (alias)")
    is_truncated: bool = Field(..., description="Truncation flag (alias)")


class MarketBreadthResponse(BaseModel):
    """Response payload for GET /api/market-breadth."""

    date: str = Field(..., description="Trading date")
    total_traded: int = Field(..., description="Total stocks traded")
    advances: int = Field(..., description="Advancing equities")
    declines: int = Field(..., description="Declining equities")
    unchanged: int = Field(..., description="Unchanged equities")
    advance_decline_ratio: float = Field(..., description="Advance/Decline ratio")
    above_50_sma_pct: float = Field(..., description="Percentage of stocks above 50 SMA")
    above_200_sma_pct: float = Field(..., description="Percentage of stocks above 200 SMA")
    stage_2_count: int = Field(..., description="Count of stocks in Stage 2 Markup")
    stage_4_count: int = Field(..., description="Count of stocks in Stage 4 Decline")
    stage_2_to_4_ratio: float = Field(..., description="Ratio of Stage 2 to Stage 4 stocks")
    updated_at: str = Field(..., description="ISO timestamp of last computation")


class MarketMetadataResponse(BaseModel):
    """Response payload for GET /api/metadata."""

    last_synced_date: str = Field(..., description="Most recent synced trading date")
    last_trading_date: str = Field(..., description="Most recent synced trading date (alias)")
    total_equities: int = Field(..., description="Total equities tracked in universe")
    total_stocks: int = Field(..., description="Total equities tracked in universe (alias)")
    status: str = Field(default="healthy", description="System operational status")
    market_status: str = Field(default="closed", description="Market status ('open', 'closed', 'pre_open')")
    server_time_utc: str = Field(..., description="UTC timestamp of server")
    scanner_counts: dict[str, int] = Field(default_factory=dict, description="Number of stocks per scanner")
