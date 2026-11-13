"""TRADESCOUT — Vectorized Polars Relative Rotation Graph (RRG) Service.

Implements JdK Relative Rotation Graph computation using pure Polars expressions:
- Relative Strength: RS(t) = (Price_symbol(t) / Price_benchmark(t)) * 100
- JdK RS-Ratio: Normalized 10-period rolling moving average of RS(t) centered at 100
- JdK RS-Momentum: Rate of change of the RS-Ratio centered at 100
- 4 Quadrants: Leading, Weakening, Lagging, Improving
- Trailing history coordinates (5D, 10D, 20D) producing clockwise rotational momentum.

ZERO Pandas or NumPy dependency.
"""

from typing import Any

import polars as pl
import structlog

from app.models.market import RRGItem, RRGTrailPoint

logger = structlog.get_logger(__name__)

QUADRANT_CONFIG: dict[str, dict[str, str]] = {
    "Leading": {
        "color": "#00E5FF",
        "description": "Outperforming benchmark with positive upward momentum",
    },
    "Weakening": {
        "color": "#F59E0B",
        "description": "Outperforming benchmark but losing relative momentum",
    },
    "Lagging": {
        "color": "#EF4444",
        "description": "Underperforming benchmark with negative downward momentum",
    },
    "Improving": {
        "color": "#3B82F6",
        "description": "Underperforming benchmark but gaining positive upward momentum",
    },
}

# Major NSE Sectors and representative constituent anchors
SECTOR_MAP: dict[str, list[str]] = {
    "Financial Services": ["HDFCBANK", "ICICIBANK", "SBIN", "KOTAKBANK", "AXISBANK", "BAJFINANCE"],
    "Information Technology": ["TCS", "INFY", "HCLTECH", "WIPRO", "TECHM", "LTIM"],
    "Automobile": ["TMPV", "TMCV", "MARUTI", "M&M", "BAJAJ-AUTO", "HEROMOTOCO", "EICHERMOT"],
    "Fast Moving Consumer Goods": ["ITC", "HINDUNILVR", "NESTLEIND", "BRITANNIA", "TATACONSUM"],
    "Healthcare": ["SUNPHARMA", "CIPLA", "DRREDDY", "APOLLOHOSP", "DIVISLAB", "LUPIN"],
    "Metals & Mining": ["TATASTEEL", "JSWSTEEL", "HINDALCO", "COALINDIA", "VEDL"],
    "Oil, Gas & Energy": ["RELIANCE", "ONGC", "BPCL", "NTPC", "POWERGRID", "TATAPOWER"],
    "Realty": ["DLF", "GODREJPROP", "OBEROIRLTY", "PHOENIXLTD"],
    "Capital Goods & Infra": ["LT", "HAL", "BEL", "SIEMENS", "ABB"],
    "Consumer Durables": ["TITAN", "HAVELLS", "VOLTAS", "DIXON", "CROMPTON"],
    "Chemicals": ["SRF", "PIIND", "AARTIIND", "DEEPAKNTR", "TATACHEM"],
    "Telecommunication": ["BHARTIARTL", "TATACOMM", "INDUSTOWER"],
}

# Top liquid momentum candidates across NSE
TOP_MOMENTUM_SYMBOLS: list[str] = [
    "RELIANCE",
    "TCS",
    "HDFCBANK",
    "INFY",
    "ICICIBANK",
    "BHARTIARTL",
    "LT",
    "SBIN",
    "ITC",
    "HINDUNILVR",
    "TRENT",
    "DIXON",
    "BAJFINANCE",
    "SUNPHARMA",
    "HAL",
    "HINDALCO",
    "KOTAKBANK",
    "TATAPOWER",
    "TATASTEEL",
    "NTPC",
    "POWERGRID",
    "COALINDIA",
    "TITAN",
    "MARUTI",
]


def classify_quadrant(rs_ratio: float, rs_momentum: float) -> tuple[str, str]:
    """Classify RRG quadrant and color given RS-Ratio and RS-Momentum coordinates.

    - Leading: RS-Ratio >= 100, RS-Momentum >= 100 (#00E5FF)
    - Weakening: RS-Ratio >= 100, RS-Momentum < 100 (#F59E0B)
    - Lagging: RS-Ratio < 100, RS-Momentum < 100 (#EF4444)
    - Improving: RS-Ratio < 100, RS-Momentum >= 100 (#3B82F6)
    """
    if rs_ratio >= 100.0:
        if rs_momentum >= 100.0:
            return "Leading", QUADRANT_CONFIG["Leading"]["color"]
        return "Weakening", QUADRANT_CONFIG["Weakening"]["color"]
    else:
        if rs_momentum >= 100.0:
            return "Improving", QUADRANT_CONFIG["Improving"]["color"]
        return "Lagging", QUADRANT_CONFIG["Lagging"]["color"]


def compute_vectorized_rrg(
    df_price_series: pl.DataFrame,
    df_benchmark: pl.DataFrame,
    group_col: str = "symbol",
    max_trail_points: int = 25,
) -> list[dict[str, Any]]:
    """Compute vectorized JdK RRG coordinates and clockwise trails using Polars window functions.

    df_price_series must contain: ['date', group_col, 'close']
    df_benchmark must contain: ['date', 'close'] (renamed to b_close)
    """
    # 1. Clean benchmark series and ensure dates are aligned
    b_df = (
        df_benchmark.filter(pl.col("close").is_not_null() & (pl.col("close") > 0))
        .select(["date", "close"])
        .rename({"close": "b_close"})
        .sort("date")
    )

    # 2. Join price series with benchmark series
    joined = (
        df_price_series.filter(pl.col("close").is_not_null() & (pl.col("close") > 0))
        .join(b_df, on="date", how="inner")
        .sort([group_col, "date"])
    )

    if joined.height == 0:
        logger.warning("rrg.no_aligned_dates_with_benchmark")
        return []

    # 3. Vectorized Relative Strength: RS(t) = (Price_symbol(t) / Price_benchmark(t)) * 100
    joined = joined.with_columns(((pl.col("close") / pl.col("b_close")) * 100.0).alias("rs"))

    # 4. Vectorized JdK RS-Ratio: Normalized 10-period rolling moving average of RS(t) centered at 100
    # RS_MA10 = rolling_mean(10)
    # RS_Ratio = (RS / RS_MA10) * 100
    joined = joined.with_columns(
        pl.col("rs").rolling_mean(window_size=10, min_samples=3).over(group_col).alias("rs_ma10")
    ).with_columns(((pl.col("rs") / pl.col("rs_ma10")) * 100.0).fill_null(100.0).alias("rs_ratio"))

    # 5. Vectorized JdK RS-Momentum: Rate of change of the RS-Ratio centered at 100
    # RS_Momentum(t) = 100.0 + ((RS_Ratio(t) - RS_Ratio(t-1)) / RS_Ratio(t-1) * 100.0)
    # Using shift(1) per symbol group
    joined = joined.with_columns(pl.col("rs_ratio").shift(1).over(group_col).alias("prev_rs_ratio")).with_columns(
        (
            100.0
            + (
                (pl.col("rs_ratio") - pl.col("prev_rs_ratio"))
                / pl.when(pl.col("prev_rs_ratio") > 0).then(pl.col("prev_rs_ratio")).otherwise(100.0)
                * 100.0
            )
        )
        .fill_null(100.0)
        .alias("rs_momentum")
    )

    # 6. Extract results grouped by group_col
    results: list[dict[str, Any]] = []
    groups = joined.select(pl.col(group_col).unique()).to_series().to_list()

    for g_id in groups:
        sym_df = joined.filter(pl.col(group_col) == g_id).sort("date")
        if sym_df.height < 5:
            continue

        # Extract last N sessions for the trail
        tail_df = sym_df.tail(max_trail_points)
        rows = tail_df.to_dicts()

        trail_points: list[RRGTrailPoint] = [
            RRGTrailPoint(
                date=str(r["date"]),
                rs_ratio=round(float(r["rs_ratio"]), 2),
                rs_momentum=round(float(r["rs_momentum"]), 2),
            )
            for r in rows
        ]

        latest_row = rows[-1]
        prev_row = rows[-2] if len(rows) > 1 else latest_row

        curr_ratio = round(float(latest_row["rs_ratio"]), 2)
        curr_momentum = round(float(latest_row["rs_momentum"]), 2)
        quadrant, color = classify_quadrant(curr_ratio, curr_momentum)

        cmp_val = round(float(latest_row["close"]), 2)
        prev_cmp = float(prev_row["close"])
        change_1d = round(((cmp_val - prev_cmp) / max(prev_cmp, 0.01)) * 100.0, 2)

        results.append(
            {
                "symbol": str(g_id),
                "name": str(g_id),
                "rs_ratio": curr_ratio,
                "rs_momentum": curr_momentum,
                "quadrant": quadrant,
                "color": color,
                "cmp": cmp_val,
                "change_1d": change_1d,
                "trail": trail_points,
            }
        )

    return results


def build_rrg_payload(
    df_universe: pl.DataFrame,
    df_benchmark: pl.DataFrame,
    benchmark_name: str = "NIFTY 50",
    group: str = "sectors",
) -> tuple[list[RRGItem], dict[str, int], str]:
    """Build full RRG item list and quadrant metrics for either 'sectors' or 'top-momentum'."""
    eq_df = df_universe.filter(pl.col("series") == "EQ") if "series" in df_universe.columns else df_universe
    latest_date = str(eq_df.select(pl.col("date").max()).item())

    items: list[RRGItem] = []

    if group == "sectors":
        # Build synthetic sector indices by averaging close of sector constituents
        sector_records: list[pl.DataFrame] = []
        for sec_name, syms in SECTOR_MAP.items():
            sec_stocks = eq_df.filter(pl.col("symbol").is_in(syms))
            if sec_stocks.height > 0:
                agg_sec = (
                    sec_stocks.group_by("date")
                    .agg(
                        [
                            pl.col("close").mean().alias("close"),
                            pl.lit(sec_name).alias("sector"),
                        ]
                    )
                    .sort("date")
                )
                sector_records.append(agg_sec)

        if sector_records:
            df_sectors = pl.concat(sector_records)
            raw_items = compute_vectorized_rrg(
                df_price_series=df_sectors.rename({"sector": "symbol"}),
                df_benchmark=df_benchmark,
                group_col="symbol",
                max_trail_points=25,
            )
            for r in raw_items:
                items.append(
                    RRGItem(
                        symbol=r["symbol"],
                        name=r["name"],
                        group="sector",
                        rs_ratio=r["rs_ratio"],
                        rs_momentum=r["rs_momentum"],
                        quadrant=r["quadrant"],
                        color=r["color"],
                        cmp=r["cmp"],
                        change_1d=r["change_1d"],
                        trail=r["trail"],
                    )
                )

    else:
        # group == "top-momentum"
        top_syms = [s for s in TOP_MOMENTUM_SYMBOLS if eq_df.filter(pl.col("symbol") == s).height > 0]
        # If fewer than 10 present, take top 20 by turnover
        if len(top_syms) < 10:
            latest_turnover_syms = (
                eq_df.filter(pl.col("date") == eq_df.select(pl.col("date").max()).item())
                .sort("turnover", descending=True)
                .head(20)["symbol"]
                .to_list()
            )
            top_syms = list(dict.fromkeys(top_syms + latest_turnover_syms))[:20]

        sub_stocks = eq_df.filter(pl.col("symbol").is_in(top_syms)).select(["date", "symbol", "close", "name"])

        raw_items = compute_vectorized_rrg(
            df_price_series=sub_stocks.select(["date", "symbol", "close"]),
            df_benchmark=df_benchmark,
            group_col="symbol",
            max_trail_points=25,
        )

        # Name lookup
        name_map = {}
        if "name" in sub_stocks.columns:
            for row in sub_stocks.select(["symbol", "name"]).unique().to_dicts():
                name_map[row["symbol"]] = row["name"] or f"{row['symbol']} Limited"

        for r in raw_items:
            sym = r["symbol"]
            display_name = name_map.get(sym, f"{sym} Limited")
            items.append(
                RRGItem(
                    symbol=sym,
                    name=display_name,
                    group="top-momentum",
                    rs_ratio=r["rs_ratio"],
                    rs_momentum=r["rs_momentum"],
                    quadrant=r["quadrant"],
                    color=r["color"],
                    cmp=r["cmp"],
                    change_1d=r["change_1d"],
                    trail=r["trail"],
                )
            )

    # Sort items by rs_ratio descending
    items.sort(key=lambda x: x.rs_ratio, reverse=True)

    # Calculate quadrant counts
    counts = {"Leading": 0, "Weakening": 0, "Lagging": 0, "Improving": 0}
    for it in items:
        counts[it.quadrant] = counts.get(it.quadrant, 0) + 1

    return items, counts, latest_date
