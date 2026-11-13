"""TRADESCOUT — Unit and Integration Tests for Market Breadth, Warmup, RRG, and Heatmap APIs.

Validates:
1. GET /api/market/warmup schema validation, breadth indicators, RME sentiment index, and pre-market cues.
2. GET /api/market/rrg quadrant boundaries, JdK RS-Ratio & RS-Momentum coordinates, and clockwise trails.
3. GET /api/market/heatmap hierarchical sector/stock grouping, market cap weighting, and index filters.
4. Mathematical unit correctness of vectorized RRG computation using pure Polars.
"""

from collections.abc import AsyncGenerator
from datetime import date, timedelta

import httpx
import polars as pl
import pytest
from httpx import ASGITransport

from app.main import app
from app.services.rrg import classify_quadrant, compute_vectorized_rrg


@pytest.fixture
async def async_client() -> AsyncGenerator[httpx.AsyncClient, None]:
    """Test client using ASGITransport bound to FastAPI app."""
    transport = ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://testserver") as client:
        yield client


# =============================================================================
# 1. THE WARMUP DASHBOARD TESTS (/api/market/warmup)
# =============================================================================


@pytest.mark.asyncio
async def test_market_warmup_schema_and_metrics(async_client: httpx.AsyncClient):
    """Verify that GET /api/market/warmup returns all required breadth, sentiment, and horizon metrics."""
    resp = await async_client.get("/api/market/warmup")
    assert resp.status_code == 200, f"Expected 200 OK, got {resp.status_code}: {resp.text}"

    data = resp.json()

    # Core metadata
    assert "date" in data
    assert data["market_status"] in ["OPEN", "CLOSED", "PRE-MARKET"]
    assert "last_synced" in data
    assert data["total_traded"] > 0

    # Advance / Decline
    ad = data["advance_decline"]
    assert ad["advances"] >= 0
    assert ad["declines"] >= 0
    assert ad["unchanged"] >= 0
    assert ad["ratio"] >= 0.0

    # Market Participation Gauges
    part = data["market_participation"]
    assert 0.0 <= part["above_20_sma_pct"] <= 100.0
    assert 0.0 <= part["above_50_sma_pct"] <= 100.0
    assert 0.0 <= part["above_200_sma_pct"] <= 100.0
    assert part["above_20_sma_count"] >= 0
    assert part["above_50_sma_count"] >= 0
    assert part["above_200_sma_count"] >= 0

    # RME Sentiment Index
    rme = data["rme_sentiment"]
    assert 0.0 <= rme["score"] <= 100.0
    assert rme["regime"] in ["Oversold / Washout", "Neutral", "Overextended"]
    assert len(rme["description"]) > 10

    # Stan Weinstein Stage Distribution
    stages = data["stage_distribution"]
    assert stages["stage_1_count"] >= 0
    assert stages["stage_2_count"] >= 0
    assert stages["stage_3_count"] >= 0
    assert stages["stage_4_count"] >= 0
    total_pct = stages["stage_1_pct"] + stages["stage_2_pct"] + stages["stage_3_pct"] + stages["stage_4_pct"]
    assert 98.0 <= total_pct <= 102.0, f"Stage percentages must sum to ~100%, got {total_pct}"
    assert stages["stage_2_to_4_ratio"] >= 0.0

    # Highs / Lows 52W
    hl = data["highs_lows_52w"]
    assert hl["new_highs_52w"] >= 0
    assert hl["new_lows_52w"] >= 0
    assert hl["ratio"] >= 0.0

    # Volume Breadth
    vol = data["volume_breadth"]
    assert vol["avg_rvol"] > 0.0
    assert vol["up_volume_ratio"] >= 0.0

    # Pre-Market Cues
    cues = data["pre_market_cues"]
    assert cues["sentiment"] in ["Bullish", "Neutral", "Cautious", "Bearish"]
    assert len(cues["summary"]) > 10
    assert "value" in cues["gift_nifty"]
    assert len(cues["global_markets"]) >= 4
    for cue in cues["global_markets"]:
        assert "name" in cue
        assert "value" in cue
        assert "change_pct" in cue
    assert len(cues["macro_catalysts"]) >= 2

    # Earnings Horizon
    earnings = data["earnings_horizon"]
    assert isinstance(earnings, list)
    assert len(earnings) >= 1
    for item in earnings:
        assert "symbol" in item
        assert "company_name" in item
        assert "report_date" in item
        assert item["market_cap_cr"] > 0


# =============================================================================
# 2. RELATIVE ROTATION GRAPH (RRG) TESTS (/api/market/rrg)
# =============================================================================


@pytest.mark.asyncio
async def test_rrg_sectors_group(async_client: httpx.AsyncClient):
    """Verify default sectors RRG response, quadrant classifications, and clockwise trails."""
    resp = await async_client.get("/api/market/rrg?benchmark=NIFTY+50&group=sectors")
    assert resp.status_code == 200, f"Expected 200, got {resp.status_code}: {resp.text}"

    data = resp.json()
    assert data["benchmark"] == "NIFTY 50"
    assert data["group"] == "sectors"
    assert "date" in data
    assert len(data["items"]) >= 5, "Sectors view should return multiple sector nodes"

    quadrants_found = set()
    for item in data["items"]:
        assert "symbol" in item
        assert "name" in item
        assert item["group"] == "sector"
        ratio = item["rs_ratio"]
        mom = item["rs_momentum"]
        quad = item["quadrant"]
        quadrants_found.add(quad)

        # Coordinate quadrant definition verification
        if ratio >= 100.0 and mom >= 100.0:
            assert quad == "Leading", f"Expected Leading for ({ratio}, {mom})"
            assert item["color"] == "#00E5FF"
        elif ratio >= 100.0 and mom < 100.0:
            assert quad == "Weakening", f"Expected Weakening for ({ratio}, {mom})"
            assert item["color"] == "#F59E0B"
        elif ratio < 100.0 and mom < 100.0:
            assert quad == "Lagging", f"Expected Lagging for ({ratio}, {mom})"
            assert item["color"] == "#EF4444"
        else:
            assert quad == "Improving", f"Expected Improving for ({ratio}, {mom})"
            assert item["color"] == "#3B82F6"

        # Trailing history verification (at least 5 historical points)
        assert len(item["trail"]) >= 5
        for pt in item["trail"]:
            assert "date" in pt
            assert "rs_ratio" in pt
            assert "rs_momentum" in pt

    # Quadrant counts consistency
    counts = data["quadrant_counts"]
    total_counted = sum(counts.values())
    assert total_counted == len(data["items"]), (
        f"Quadrant counts {counts} must sum to items length {len(data['items'])}"
    )


@pytest.mark.asyncio
async def test_rrg_top_momentum_group(async_client: httpx.AsyncClient):
    """Verify top-momentum stocks RRG view."""
    resp = await async_client.get("/api/market/rrg?group=top-momentum")
    assert resp.status_code == 200

    data = resp.json()
    assert data["group"] == "top-momentum"
    assert len(data["items"]) >= 10
    for item in data["items"]:
        assert item["group"] == "top-momentum"
        assert item["cmp"] > 0


@pytest.mark.asyncio
async def test_rrg_invalid_group_validation(async_client: httpx.AsyncClient):
    """Verify that invalid group query param returns 422 validation error."""
    resp = await async_client.get("/api/market/rrg?group=invalid-group")
    assert resp.status_code == 422


# =============================================================================
# 3. MARKET HEATMAP TESTS (/api/market/heatmap)
# =============================================================================


@pytest.mark.asyncio
async def test_market_heatmap_nifty50_hierarchy(async_client: httpx.AsyncClient):
    """Verify Nifty 50 treemap hierarchically groups sectors and nested stock nodes."""
    resp = await async_client.get("/api/market/heatmap?index=NIFTY+50")
    assert resp.status_code == 200, f"Expected 200, got {resp.status_code}: {resp.text}"

    data = resp.json()
    assert data["index"] == "NIFTY 50"
    assert data["total_market_cap"] > 0
    assert len(data["sectors"]) >= 5, "Nifty 50 should have multiple sectors"

    total_weight = 0.0
    total_stocks = 0

    for sector in data["sectors"]:
        assert "name" in sector
        assert sector["market_cap"] > 0
        assert 0.0 <= sector["weight_pct"] <= 100.0
        total_weight += sector["weight_pct"]
        assert len(sector["stocks"]) >= 1

        for stock in sector["stocks"]:
            assert "symbol" in stock
            assert "name" in stock
            assert stock["cmp"] > 0
            assert stock["market_cap"] > 0
            assert stock["volume"] >= 0
            total_stocks += 1

    assert 98.0 <= total_weight <= 102.0, f"Sector weights must sum to ~100%, got {total_weight}"
    assert total_stocks >= 20, f"Nifty 50 heatmap should contain at least 20 stocks, got {total_stocks}"


@pytest.mark.asyncio
async def test_market_heatmap_index_variants(async_client: httpx.AsyncClient):
    """Verify Nifty Next 50, Midcap 100, and Nifty 500 index selectors."""
    for idx in ["NIFTY NEXT 50", "NIFTY MIDCAP 100", "NIFTY 500"]:
        resp = await async_client.get(f"/api/market/heatmap?index={idx}")
        assert resp.status_code == 200, f"Failed for index {idx}"
        data = resp.json()
        assert data["index"] == idx
        assert len(data["sectors"]) >= 1


# =============================================================================
# 4. RRG POLARS UNIT CALCULATIONS
# =============================================================================


def test_classify_quadrant_boundaries():
    """Verify quadrant classification and exact (100, 100) boundary conditions."""
    # Exact center boundary (100, 100) -> Leading
    q, c = classify_quadrant(100.0, 100.0)
    assert q == "Leading"
    assert c == "#00E5FF"

    # Leading: (105, 102)
    q, c = classify_quadrant(105.0, 102.0)
    assert q == "Leading"

    # Weakening: (105, 98)
    q, c = classify_quadrant(105.0, 98.0)
    assert q == "Weakening"
    assert c == "#F59E0B"

    # Lagging: (95, 95)
    q, c = classify_quadrant(95.0, 95.0)
    assert q == "Lagging"
    assert c == "#EF4444"

    # Improving: (95, 102)
    q, c = classify_quadrant(95.0, 102.0)
    assert q == "Improving"
    assert c == "#3B82F6"


def test_vectorized_rrg_pure_polars_computation():
    """Verify mathematical calculation of RS, RS-Ratio, and RS-Momentum on synthetic series."""
    days = 40
    dates = [date(2026, 1, 1) + timedelta(days=i) for i in range(days)]

    # Outperforming stock: gains 1% per day vs 0.2% per day benchmark
    stock_closes = [100.0 * (1.01**i) for i in range(days)]
    bench_closes = [1000.0 * (1.002**i) for i in range(days)]

    df_stock = pl.DataFrame(
        {
            "date": dates,
            "symbol": ["TESTSYM"] * days,
            "close": stock_closes,
        }
    )

    df_bench = pl.DataFrame(
        {
            "date": dates,
            "close": bench_closes,
        }
    )

    results = compute_vectorized_rrg(
        df_price_series=df_stock,
        df_benchmark=df_bench,
        group_col="symbol",
        max_trail_points=10,
    )

    assert len(results) == 1
    item = results[0]
    assert item["symbol"] == "TESTSYM"
    # Because stock consistently outperformed, RS-Ratio must be > 100
    assert item["rs_ratio"] > 100.0
    # Because RS-Ratio is rising, RS-Momentum must be > 100
    assert item["rs_momentum"] >= 100.0
    assert item["quadrant"] == "Leading"
    assert len(item["trail"]) == 10
