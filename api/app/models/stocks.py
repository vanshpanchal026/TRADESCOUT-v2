"""TRADESCOUT — Pydantic Models for Stock Detail, History, RS Line, and Fundamentals."""

from pydantic import BaseModel, ConfigDict, Field


class StockDetailResponse(BaseModel):
    """Complete technical and market overview for an individual stock."""

    model_config = ConfigDict(extra="allow", populate_by_name=True)

    symbol: str = Field(..., description="NSE ticker symbol")
    name: str | None = Field(default=None, description="Company name")
    company_name: str | None = Field(default=None, description="Company name alias")
    isin: str | None = Field(default=None, description="ISIN security code")
    series: str | None = Field(default="EQ", description="NSE series")
    industry: str | None = Field(default=None, description="Industry classification")
    sector: str | None = Field(default=None, description="Sector classification")

    # Current Price & Changes
    cmp: float = Field(..., description="Current Market Price (₹)")
    prev_close: float | None = Field(default=None, description="Previous session close")
    open: float | None = Field(default=None, description="Session opening price")
    high: float | None = Field(default=None, description="Session high price")
    low: float | None = Field(default=None, description="Session low price")
    change: float | None = Field(default=None, description="Absolute price change")
    day_change: float = Field(..., description="1-day price change (%)")
    change_pct: float = Field(..., description="1-day price change (%) alias")

    # 52-Week Range
    high_52w: float | None = Field(default=None, description="52-week high price (₹)", alias="52w_high")
    low_52w: float | None = Field(default=None, description="52-week low price (₹)", alias="52w_low")
    from_52w_high: float | None = Field(default=None, description="% distance from 52-week high")
    from_52w_low: float | None = Field(default=None, description="% distance from 52-week low")

    # Technical Indicators & Moving Averages
    stage: int = Field(default=2, description="Stan Weinstein Stage (1-4)")
    stage_name: str = Field(default="Stage 2 (Markup)", description="Weinstein Stage label")
    rs_rating: int = Field(default=50, description="IBD Relative Strength rating (1-99)")
    conditions_met: int = Field(default=0, description="Minervini conditions met (0-8)")
    sma_10: float | None = Field(default=None, description="10-day Simple Moving Average")
    sma_20: float | None = Field(default=None, description="20-day Simple Moving Average")
    sma_50: float | None = Field(default=None, description="50-day Simple Moving Average")
    sma_150: float | None = Field(default=None, description="150-day Simple Moving Average")
    sma_200: float | None = Field(default=None, description="200-day Simple Moving Average")
    ema_12: float | None = Field(default=None, description="12-day Exponential Moving Average")
    ema_26: float | None = Field(default=None, description="26-day Exponential Moving Average")
    rsi: float | None = Field(default=None, description="Wilder 14-period RSI")
    rvol: float = Field(default=1.0, description="Relative volume vs 50-day average")

    # Volume & Trading Activity
    volume: int | None = Field(default=None, description="Latest session volume")
    avg_volume_50d: float | None = Field(default=None, description="50-day average trading volume")
    turnover: float | None = Field(default=None, description="Monetary turnover (₹)")
    delivery_pct: float | None = Field(default=None, description="Delivery percentage (%)")
    trades: int | None = Field(default=None, description="Number of trades")

    # Fundamental Snapshots
    market_cap: float | None = Field(default=None, description="Market capitalization (₹ Cr)")
    pe: float | None = Field(default=None, description="Price to Earnings ratio")

    last_updated: str | None = Field(default=None, description="Timestamp of latest data update")


class OHLCVBar(BaseModel):
    """TradingView Lightweight Charts v4 candlestick item."""

    time: str = Field(..., description="Bar timestamp in YYYY-MM-DD format")
    open: float = Field(..., description="Opening price")
    high: float = Field(..., description="Session high price")
    low: float = Field(..., description="Session low price")
    close: float = Field(..., description="Closing price")
    volume: int = Field(..., description="Trading volume executed")


class RSLinePoint(BaseModel):
    """Point on Relative Strength comparison line."""

    time: str = Field(..., description="Date formatted as YYYY-MM-DD")
    value: float = Field(..., description="Normalized relative strength value (base=100.0)")
    date: str | None = Field(default=None, description="Date alias")


class RSLineResponse(BaseModel):
    """Response payload for GET /api/stock/{symbol}/rs_line."""

    symbol: str = Field(..., description="Stock ticker symbol")
    benchmark: str = Field(default="NIFTY 50", description="Benchmark index name")
    period: str = Field(default="1y", description="Time window evaluated")
    rs_rating: int = Field(..., description="IBD Relative Strength rating (1-99)")
    data_points: int = Field(..., description="Number of data points in series")
    rs_line: list[RSLinePoint] = Field(..., description="Array of RS points")
    rs_new_high: bool = Field(default=False, description="Whether RS line is at a new period high")
    rs_trend: str = Field(default="flat", description="Directional trend ('up', 'down', 'flat')")


class QuarterlyMetric(BaseModel):
    """Quarterly financial metrics for Screener-style table."""

    quarter: str = Field(..., description="Quarter period (e.g. FY27 Q2)")
    date: str | None = Field(default=None, description="End date of reporting period")
    sales: float | None = Field(default=None, description="Revenue / Sales (₹ Cr)")
    ebitda: float | None = Field(default=None, description="EBITDA (₹ Cr)")
    operating_profit: float | None = Field(default=None, description="Operating profit (₹ Cr)")
    opm: float | None = Field(default=None, description="Operating Profit Margin (%)")
    net_profit: float | None = Field(default=None, description="Net Profit (₹ Cr)")
    eps: float | None = Field(default=None, description="Earnings Per Share (₹)")
    sales_yoy: float | None = Field(default=None, description="YoY Sales growth (%)")
    np_yoy: float | None = Field(default=None, description="YoY Net Profit growth (%)")
    eps_yoy: float | None = Field(default=None, description="YoY EPS growth (%)")
    promoter_pct: float | None = Field(default=None, description="Promoter holding (%)")
    fii_pct: float | None = Field(default=None, description="FII holding (%)")
    dii_pct: float | None = Field(default=None, description="DII holding (%)")
    public_pct: float | None = Field(default=None, description="Public holding (%)")


class AnnualMetric(BaseModel):
    """Annual financial record."""

    year: str = Field(..., description="Financial year (e.g. FY26)")
    sales: float | None = Field(default=None, description="Annual sales (₹ Cr)")
    net_profit: float | None = Field(default=None, description="Annual net profit (₹ Cr)")
    opm: float | None = Field(default=None, description="Operating Profit Margin (%)")
    eps: float | None = Field(default=None, description="Earnings Per Share (₹)")
    sales_growth: float | None = Field(default=None, description="Sales growth (%)")
    np_growth: float | None = Field(default=None, description="Net profit growth (%)")


class StockFundamentalsResponse(BaseModel):
    """Complete fundamental data response for GET /api/stock/{symbol}/fundamentals."""

    model_config = ConfigDict(extra="allow")

    symbol: str = Field(..., description="Stock ticker symbol")
    company_name: str | None = Field(default=None, description="Company full name")
    sector: str | None = Field(default=None, description="Sector")
    industry: str | None = Field(default=None, description="Industry group")
    market_cap: float | None = Field(default=None, description="Market cap in ₹ Cr")
    pe: float | None = Field(default=None, description="Price to Earnings ratio")
    pb: float | None = Field(default=None, description="Price to Book ratio")
    roe: float | None = Field(default=None, description="Return on Equity (%)")
    roce: float | None = Field(default=None, description="Return on Capital Employed (%)")
    debt_to_equity: float | None = Field(default=None, description="Debt to Equity ratio")
    div_yield: float | None = Field(default=None, description="Dividend Yield (%)")
    book_value: float | None = Field(default=None, description="Book value per share (₹)")

    promoter_pct: float | None = Field(default=None, description="Current promoter holding (%)")
    fii_pct: float | None = Field(default=None, description="Current FII holding (%)")
    dii_pct: float | None = Field(default=None, description="Current DII holding (%)")
    public_pct: float | None = Field(default=None, description="Current Public holding (%)")

    quarterly: list[QuarterlyMetric] = Field(..., description="5-year quarterly metrics")
    annual: list[AnnualMetric] = Field(default_factory=list, description="Historical annual metrics")
