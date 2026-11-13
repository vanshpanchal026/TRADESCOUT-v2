"""TRADESCOUT — Pydantic Models for Watchlists, Favourites, Drawings, and Notes.

Phase 5: Single-User Direct Cloud Persistence (PostgreSQL / Supabase Ready).
"""

from typing import Any

from pydantic import BaseModel, ConfigDict, Field


class WatchlistSummary(BaseModel):
    """Summary record for a user watchlist."""

    model_config = ConfigDict(extra="allow", populate_by_name=True)

    id: str = Field(..., description="Watchlist UUID")
    name: str = Field(..., description="Watchlist title")
    description: str | None = Field(default=None, description="Watchlist description")
    is_default: bool = Field(default=False, description="Whether this is the user's primary list")
    sort_order: int = Field(default=0, description="Display order sequence")
    item_count: int = Field(default=0, description="Number of symbols in list")
    created_at: str = Field(..., description="ISO 8601 creation timestamp")
    updated_at: str = Field(..., description="ISO 8601 last update timestamp")


class WatchlistListResponse(BaseModel):
    """Payload for GET /api/watchlists."""

    status: str = Field(default="success", description="Status code")
    watchlists: list[WatchlistSummary] = Field(default_factory=list, description="Array of watchlists")
    total: int = Field(default=0, description="Total watchlists count")


class WatchlistCreateRequest(BaseModel):
    """Request payload for POST /api/watchlists."""

    name: str = Field(..., min_length=1, max_length=100, description="Watchlist title")
    description: str | None = Field(default=None, max_length=500, description="Watchlist description")
    is_default: bool = Field(default=False, description="Set as default watchlist")


class WatchlistUpdateRequest(BaseModel):
    """Request payload for PUT /api/watchlists/{id}."""

    name: str | None = Field(default=None, min_length=1, max_length=100, description="Updated title")
    description: str | None = Field(default=None, max_length=500, description="Updated description")
    is_default: bool | None = Field(default=None, description="Default status flag")
    sort_order: int | None = Field(default=None, description="Sequence order")


class WatchlistResponse(BaseModel):
    """Single watchlist response envelope."""

    status: str = Field(default="success", description="Response status")
    watchlist: WatchlistSummary = Field(..., description="Watchlist record")


class WatchlistItemCreateRequest(BaseModel):
    """Request payload for POST /api/watchlists/{id}/items."""

    symbol: str = Field(..., min_length=1, max_length=20, description="NSE stock ticker symbol")
    notes: str | None = Field(default=None, max_length=1000, description="User note or memo")
    added_price: float | None = Field(default=None, description="Price at time of addition")
    sort_order: int = Field(default=0, description="Display order sequence")


class EnrichedWatchlistItem(BaseModel):
    """Watchlist stock item enriched with live market data and 20-day sparkline."""

    model_config = ConfigDict(extra="allow", populate_by_name=True)

    id: str = Field(..., description="Item UUID")
    watchlist_id: str = Field(..., description="Watchlist UUID")
    symbol: str = Field(..., description="Stock symbol (e.g. RELIANCE)")
    name: str = Field(default="", description="Company full name")
    company_name: str | None = Field(default=None, description="Company name alias")
    cmp: float = Field(default=0.0, description="Current market price (₹)")
    change_pct: float = Field(default=0.0, description="1-day change percentage")
    day_change: float = Field(default=0.0, description="1-day change percentage alias")
    rsi: float | None = Field(default=None, description="14-period RSI")
    rs_rating: int | None = Field(default=50, description="12-month RS rating")
    from_52w_high: float | None = Field(default=None, description="Distance from 52-week high (%)")
    stage: int | None = Field(default=2, description="Stan Weinstein Stage (1-4)")
    stage_name: str | None = Field(default="Stage 2 (Markup)", description="Stage label")
    notes: str | None = Field(default=None, description="User notes on symbol")
    added_price: float | None = Field(default=None, description="Price when added")
    sparkline: list[float] = Field(default_factory=list, description="20-day sparkline closing prices")
    added_at: str = Field(..., description="Timestamp added")
    sort_order: int = Field(default=0, description="Sort order sequence")


class WatchlistDetailResponse(BaseModel):
    """Response payload for GET /api/watchlists/{id} with enriched stocks."""

    status: str = Field(default="success", description="Status code")
    id: str = Field(..., description="Watchlist UUID")
    name: str = Field(..., description="Watchlist title")
    description: str | None = Field(default=None, description="Watchlist description")
    is_default: bool = Field(default=False, description="Default status")
    sort_order: int = Field(default=0, description="Display order")
    items: list[EnrichedWatchlistItem] = Field(default_factory=list, description="Enriched stock items")
    total_items: int = Field(default=0, description="Total stocks count")
    created_at: str = Field(..., description="Creation timestamp")
    updated_at: str = Field(..., description="Last updated timestamp")


class WatchlistItemResponse(BaseModel):
    """Response payload after adding item to watchlist."""

    status: str = Field(default="success", description="Status code")
    item: dict[str, Any] = Field(..., description="Added item details")


class StandardMessageResponse(BaseModel):
    """Standard operation message response."""

    status: str = Field(default="success", description="Status code")
    message: str = Field(..., description="Operation feedback message")
    symbol: str | None = Field(default=None, description="Symbol involved")
    watchlist_id: str | None = Field(default=None, description="Watchlist involved")


class FavouritesResponse(BaseModel):
    """Response payload for GET /api/favourites."""

    status: str = Field(default="success", description="Status code")
    favourites: list[str] = Field(default_factory=list, description="List of starred stock symbols")
    total: int = Field(default=0, description="Total starred count")


class FavouriteToggleResponse(BaseModel):
    """Response payload for POST /api/favourites/{symbol}/toggle."""

    status: str = Field(default="success", description="Status code")
    symbol: str = Field(..., description="Stock symbol")
    is_favourite: bool = Field(..., description="Whether stock is now starred")


class ChartDrawingsRequest(BaseModel):
    """Request payload for persisting TradingView chart drawings."""

    model_config = ConfigDict(extra="allow")

    drawing_data: Any = Field(default_factory=list, description="Serialized chart drawings JSON")
    drawings: Any = Field(default=None, description="Drawings alias")


class ChartDrawingsResponse(BaseModel):
    """Response payload for chart drawings."""

    model_config = ConfigDict(extra="allow")

    status: str = Field(default="success", description="Status code")
    symbol: str = Field(..., description="Stock symbol")
    drawing_data: Any = Field(default_factory=list, description="Serialized drawings JSON")
    drawings: Any = Field(default_factory=list, description="Drawings alias")
    updated_at: str | None = Field(default=None, description="Last updated timestamp")


class StockNotesRequest(BaseModel):
    """Request payload for persisting user stock journal notes."""

    content: str = Field(..., description="Markdown note text")


class StockNotesResponse(BaseModel):
    """Response payload for stock journal notes."""

    status: str = Field(default="success", description="Status code")
    symbol: str = Field(..., description="Stock symbol")
    content: str = Field(default="", description="Markdown note content")
    updated_at: str | None = Field(default=None, description="Last updated timestamp")
