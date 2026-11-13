"""TRADESCOUT — Unit & Integration Tests for Stock Detail, History, RS Line, and Fundamentals APIs."""

import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_stock_overview_success(client: AsyncClient) -> None:
    """Verify GET /api/stock/{symbol} returns complete technical and market overview."""
    response = await client.get("/api/stock/RELIANCE")
    assert response.status_code == 200
    data = response.json()

    assert data["symbol"] == "RELIANCE"
    assert "cmp" in data and isinstance(data["cmp"], (int, float)) and data["cmp"] > 0
    assert "day_change" in data and isinstance(data["day_change"], (int, float))
    assert "52w_high" in data or "high_52w" in data
    assert "52w_low" in data or "low_52w" in data
    assert "stage" in data and data["stage"] in [1, 2, 3, 4]
    assert "stage_name" in data and isinstance(data["stage_name"], str)
    assert "rs_rating" in data and 1 <= data["rs_rating"] <= 99
    assert "sma_50" in data
    assert "sma_200" in data
    assert "rvol" in data and isinstance(data["rvol"], (int, float))
    assert "name" in data or "company_name" in data


@pytest.mark.asyncio
async def test_stock_overview_not_found(client: AsyncClient) -> None:
    """Verify GET /api/stock/{symbol} returns 404 for nonexistent symbol."""
    response = await client.get("/api/stock/NONEXISTENT_XYZ_SYMBOL")
    assert response.status_code == 404
    data = response.json()
    assert "error" in data or "detail" in data
    # Either envelope or detail format
    if "detail" in data:
        assert data["detail"]["error"] == "not_found"
    else:
        assert data["error"] == "not_found"


@pytest.mark.asyncio
async def test_stock_history_ohlcv_format(client: AsyncClient) -> None:
    """Verify GET /api/stock/{symbol}/history returns array strictly adhering to Lightweight Charts structure."""
    response = await client.get("/api/stock/RELIANCE/history?days=50")
    assert response.status_code == 200
    bars = response.json()

    assert isinstance(bars, list)
    assert len(bars) <= 50
    assert len(bars) > 0

    first_bar = bars[0]
    required_keys = {"time", "open", "high", "low", "close", "volume"}
    assert required_keys.issubset(first_bar.keys())

    # Verify time format YYYY-MM-DD
    assert len(first_bar["time"]) == 10
    assert first_bar["time"][4] == "-" and first_bar["time"][7] == "-"

    # Verify numeric types
    assert isinstance(first_bar["open"], (int, float))
    assert isinstance(first_bar["high"], (int, float))
    assert isinstance(first_bar["low"], (int, float))
    assert isinstance(first_bar["close"], (int, float))
    assert isinstance(first_bar["volume"], int)

    # Verify high >= low
    assert first_bar["high"] >= first_bar["low"]


@pytest.mark.asyncio
async def test_stock_history_days_validation(client: AsyncClient) -> None:
    """Verify days query parameter constraints (min 1, max 5000)."""
    # Less than 1 should fail 422
    res_low = await client.get("/api/stock/RELIANCE/history?days=0")
    assert res_low.status_code == 422

    # Greater than 5000 should fail 422
    res_high = await client.get("/api/stock/RELIANCE/history?days=6000")
    assert res_high.status_code == 422

    # days=5 should succeed
    res_valid = await client.get("/api/stock/RELIANCE/history?days=5")
    assert res_valid.status_code == 200
    assert len(res_valid.json()) == 5


@pytest.mark.asyncio
async def test_stock_history_not_found(client: AsyncClient) -> None:
    """Verify GET /api/stock/{symbol}/history returns 404 for nonexistent symbol."""
    response = await client.get("/api/stock/FAKE_TICKER_999/history?days=50")
    assert response.status_code == 404


@pytest.mark.asyncio
async def test_stock_rs_line_calculation(client: AsyncClient) -> None:
    """Verify GET /api/stock/{symbol}/rs_line computes normalized RS against NIFTY 50."""
    response = await client.get("/api/stock/RELIANCE/rs_line?period=1y")
    assert response.status_code == 200
    data = response.json()

    assert data["symbol"] == "RELIANCE"
    assert data["benchmark"] == "NIFTY 50"
    assert "data_points" in data and data["data_points"] > 0
    assert "rs_line" in data and isinstance(data["rs_line"], list)
    assert len(data["rs_line"]) == data["data_points"]

    first_pt = data["rs_line"][0]
    # By formula, the base session RS_0 is normalized to 100.0
    assert round(first_pt["value"], 1) == 100.0
    assert "time" in first_pt

    assert "rs_new_high" in data and isinstance(data["rs_new_high"], bool)
    assert "rs_trend" in data and data["rs_trend"] in ["up", "down", "flat"]
    assert "rs_rating" in data and 1 <= data["rs_rating"] <= 99


@pytest.mark.asyncio
async def test_stock_fundamentals_quarterly_metrics(client: AsyncClient) -> None:
    """Verify GET /api/stock/{symbol}/fundamentals returns 5-year quarterly metrics."""
    response = await client.get("/api/stock/RELIANCE/fundamentals")
    assert response.status_code == 200
    data = response.json()

    assert data["symbol"] == "RELIANCE"
    assert "quarterly" in data and isinstance(data["quarterly"], list)
    assert len(data["quarterly"]) == 20  # 5 years * 4 quarters = 20 quarters

    latest_q = data["quarterly"][0]
    assert "quarter" in latest_q
    assert "sales" in latest_q and latest_q["sales"] is not None
    assert "ebitda" in latest_q
    assert "net_profit" in latest_q and latest_q["net_profit"] is not None
    assert "eps" in latest_q and latest_q["eps"] is not None
    assert "promoter_pct" in latest_q
    assert "fii_pct" in latest_q
    assert "dii_pct" in latest_q

    # Shareholding sanity check
    assert latest_q["promoter_pct"] > 0
    assert latest_q["fii_pct"] > 0
    assert latest_q["dii_pct"] > 0
