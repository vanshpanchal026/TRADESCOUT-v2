"""TRADESCOUT — Golden Dataset Indicator Unit & Regression Tests.

Validates mathematical correctness of Polars vectorized indicators:
SMA 10/20/50/150/200, Wilder RSI(14), RVOL, Weinstein Stages, and Minervini Trend Template.
"""

from datetime import date, timedelta

import polars as pl
import pytest

from app.services.indicators import calculate_daily_rs_ratings, compute_indicators


def generate_mock_stock_series(symbol: str, base_price: float, days: int = 300, trend: float = 0.001) -> pl.DataFrame:
    """Generate deterministic synthetic daily stock price data for indicator verification."""
    dates = [date(2025, 1, 1) + timedelta(days=i) for i in range(days)]
    closes = []
    current = base_price

    for i in range(days):
        current = current * (1.0 + trend)
        closes.append(round(current, 2))

    highs = [round(c * 1.015, 2) for c in closes]
    lows = [round(c * 0.985, 2) for c in closes]
    opens = [round(c * 0.995, 2) for c in closes]
    prev_closes = [closes[0]] + closes[:-1]
    volumes = [100000 + (i * 100) for i in range(days)]

    return pl.DataFrame(
        {
            "date": dates,
            "symbol": [symbol] * days,
            "series": ["EQ"] * days,
            "isin": [f"INE{symbol}001"] * days,
            "name": [f"{symbol} Ltd"] * days,
            "open": opens,
            "high": highs,
            "low": lows,
            "close": closes,
            "last": closes,
            "prev_close": prev_closes,
            "volume": volumes,
            "turnover": [c * v for c, v in zip(closes, volumes)],
            "trades": [5000] * days,
            "year": [d.year for d in dates],
            "month": [d.month for d in dates],
        }
    )


@pytest.fixture
def benchmark_market_df() -> pl.DataFrame:
    """Creates a deterministic multi-stock universe: 1 strong uptrend, 1 downtrend, 1 sideways."""
    df_uptrend = generate_mock_stock_series("RELIANCE", base_price=1000.0, days=280, trend=0.002)
    df_downtrend = generate_mock_stock_series("INFY", base_price=2000.0, days=280, trend=-0.002)
    df_flat = generate_mock_stock_series("ITC", base_price=400.0, days=280, trend=0.0)
    return pl.concat([df_uptrend, df_downtrend, df_flat])


def test_moving_averages_calculation(benchmark_market_df: pl.DataFrame):
    """Verify that SMA 10, 20, 50, 150, and 200 are calculated accurately."""
    df_calc = compute_indicators(benchmark_market_df)

    target_date = date(2025, 1, 1) + timedelta(days=279)
    reliance = df_calc.filter((pl.col("symbol") == "RELIANCE") & (pl.col("date") == target_date))
    row = reliance.to_dicts()[0]

    # In a consistent uptrend: close > 10 SMA > 20 SMA > 50 SMA > 150 SMA > 200 SMA
    assert row["close"] > row["sma_10"]
    assert row["sma_10"] > row["sma_20"]
    assert row["sma_20"] > row["sma_50"]
    assert row["sma_50"] > row["sma_150"]
    assert row["sma_150"] > row["sma_200"]
    assert row["slope_200"] > 0.0, "200 SMA must be sloping upward in strong uptrend"


def test_minervini_trend_template_rules(benchmark_market_df: pl.DataFrame):
    """Verify that a stock in a sustained uptrend satisfies all Minervini Trend Template conditions."""
    df_calc = compute_indicators(benchmark_market_df)

    latest_date = benchmark_market_df.select(pl.col("date").max()).item()
    reliance = df_calc.filter((pl.col("symbol") == "RELIANCE") & (pl.col("date") == latest_date)).to_dicts()[0]
    infy = df_calc.filter((pl.col("symbol") == "INFY") & (pl.col("date") == latest_date)).to_dicts()[0]

    # Reliance is in a strong uptrend
    assert reliance["conditions_met"] == 8, (
        f"Uptrend leader must meet all 8 conditions, got {reliance['conditions_met']}"
    )
    assert reliance["minervini_pass"] is True
    assert reliance["from_52w_high"] >= -25.0
    assert reliance["above_52w_low"] >= 30.0

    # Infosys is in a downtrend and must fail
    assert infy["conditions_met"] < 4
    assert infy["minervini_pass"] is False


def test_weinstein_stage_analysis(benchmark_market_df: pl.DataFrame):
    """Verify Stan Weinstein stage detection logic (Stage 2 Markup vs Stage 4 Markdown)."""
    df_calc = compute_indicators(benchmark_market_df)
    latest_date = benchmark_market_df.select(pl.col("date").max()).item()

    reliance = df_calc.filter((pl.col("symbol") == "RELIANCE") & (pl.col("date") == latest_date)).to_dicts()[0]
    infy = df_calc.filter((pl.col("symbol") == "INFY") & (pl.col("date") == latest_date)).to_dicts()[0]

    assert reliance["stage"] == 2
    assert reliance["stage_name"] == "Stage 2 (Markup)"

    assert infy["stage"] == 4
    assert infy["stage_name"] == "Stage 4 (Decline)"


def test_wilder_rsi_boundaries(benchmark_market_df: pl.DataFrame):
    """Verify that RSI values stay strictly within the [0, 100] mathematical bounds."""
    df_calc = compute_indicators(benchmark_market_df)
    rsi_vals = df_calc.filter(pl.col("rsi").is_not_null())["rsi"].to_list()

    assert all(0.0 <= r <= 100.0 for r in rsi_vals)


def test_rvol_calculation(benchmark_market_df: pl.DataFrame):
    """Verify Relative Volume (RVOL) calculation against 50-day volume SMA."""
    df_calc = compute_indicators(benchmark_market_df)
    latest_date = benchmark_market_df.select(pl.col("date").max()).item()
    row = df_calc.filter((pl.col("symbol") == "RELIANCE") & (pl.col("date") == latest_date)).to_dicts()[0]

    expected_rvol = row["volume"] / row["vol_sma_50"]
    assert pytest.approx(row["rvol"], rel=1e-3) == expected_rvol


def test_relative_strength_percentile_ranking(benchmark_market_df: pl.DataFrame):
    """Verify IBD-style RS rating scales from 1 to 99 across the universe."""
    df_calc = compute_indicators(benchmark_market_df)
    latest_date = benchmark_market_df.select(pl.col("date").max()).item()

    df_latest = df_calc.filter(pl.col("date") == latest_date)
    df_ranked = calculate_daily_rs_ratings(df_latest)

    rs_ratings = df_ranked["rs_rating"].to_list()
    assert all(1 <= r <= 99 for r in rs_ratings)

    # RELIANCE (uptrend) must have higher RS rating than INFY (downtrend)
    reliance_rs = df_ranked.filter(pl.col("symbol") == "RELIANCE")["rs_rating"].item()
    infy_rs = df_ranked.filter(pl.col("symbol") == "INFY")["rs_rating"].item()
    assert reliance_rs > infy_rs
