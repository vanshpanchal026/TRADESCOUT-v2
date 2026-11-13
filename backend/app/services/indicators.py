"""TRADESCOUT — High-Performance Vectorized Technical Indicator Engine.

Computes Mark Minervini Trend Template (8 rules), Stan Weinstein Stage Analysis,
14-day Wilder RSI, IBD 12-Month Relative Strength Rating, and RVOL using Polars Rust expressions.
ZERO Pandas or NumPy dependency.
"""

import polars as pl
import structlog

logger = structlog.get_logger(__name__)


def compute_indicators(df_price: pl.DataFrame, df_delivery: pl.DataFrame | None = None) -> pl.DataFrame:
    """Ingest raw price and delivery dataframes and return fully calculated technical indicators.

    Operates across all symbols in parallel using Polars multi-threaded window functions.
    """
    # 1. Filter for equity series EQ only
    df = df_price.filter(pl.col("series") == "EQ")

    # 2. Join delivery data if available
    if df_delivery is not None and "delivery_pct" in df_delivery.columns:
        delivery_sub = df_delivery.select(["date", "symbol", "delivery_pct", "delivery_qty"])
        df = df.join(delivery_sub, on=["date", "symbol"], how="left")
    else:
        df = df.with_columns(
            [
                pl.lit(0.0).alias("delivery_pct"),
                pl.lit(0).alias("delivery_qty"),
            ]
        )

    # 3. Ensure proper temporal sorting per symbol
    df = df.sort(["symbol", "date"])

    # 4. Vectorized Rolling Moving Averages and 52-Week Bands
    df = df.with_columns(
        [
            pl.col("close").rolling_mean(window_size=10).over("symbol").alias("sma_10"),
            pl.col("close").rolling_mean(window_size=20).over("symbol").alias("sma_20"),
            pl.col("close").rolling_mean(window_size=50).over("symbol").alias("sma_50"),
            pl.col("close").rolling_mean(window_size=150).over("symbol").alias("sma_150"),
            pl.col("close").rolling_mean(window_size=200).over("symbol").alias("sma_200"),
            pl.col("volume").rolling_mean(window_size=50).over("symbol").alias("vol_sma_50"),
            pl.col("high").rolling_max(window_size=252).over("symbol").alias("high_52w"),
            pl.col("low").rolling_min(window_size=252).over("symbol").alias("low_52w"),
            pl.col("close").shift(20).over("symbol").alias("close_20d_ago"),
            pl.col("close").shift(63).over("symbol").alias("close_63d_ago"),
            pl.col("close").shift(126).over("symbol").alias("close_126d_ago"),
            pl.col("close").shift(189).over("symbol").alias("close_189d_ago"),
            pl.col("close").shift(252).over("symbol").alias("close_252d_ago"),
        ]
    )

    # 5. 200 SMA Slope (Slope over 20 trading sessions / ~1 month)
    df = df.with_columns(
        [
            pl.col("sma_200").shift(20).over("symbol").alias("sma_200_20d_ago"),
        ]
    ).with_columns(
        [
            (((pl.col("sma_200") - pl.col("sma_200_20d_ago")) / pl.col("sma_200_20d_ago")) * 100.0).alias("slope_200"),
        ]
    )

    # 6. Distance from 52-Week High and Low, RVOL, Day Change %
    df = df.with_columns(
        [
            (((pl.col("close") - pl.col("high_52w")) / pl.col("high_52w")) * 100.0).alias("from_52w_high"),
            (((pl.col("close") - pl.col("low_52w")) / pl.col("low_52w")) * 100.0).alias("from_52w_low"),
            (((pl.col("close") - pl.col("low_52w")) / pl.col("low_52w")) * 100.0).alias("above_52w_low"),
            (pl.col("volume") / pl.when(pl.col("vol_sma_50") > 0).then(pl.col("vol_sma_50")).otherwise(1.0)).alias(
                "rvol"
            ),
            (((pl.col("close") - pl.col("prev_close")) / pl.col("prev_close")) * 100.0).alias("day_change"),
            (((pl.col("close") - pl.col("close_20d_ago")) / pl.col("close_20d_ago")) * 100.0).alias("ret_1m"),
        ]
    )

    # 7. Wilder's 14-Period RSI
    avg_loss_denom = pl.when(pl.col("avg_loss") > 0).then(pl.col("avg_loss")).otherwise(0.0001)
    df = (
        df.with_columns(
            [
                (pl.col("close") - pl.col("close").shift(1).over("symbol")).alias("diff"),
            ]
        )
        .with_columns(
            [
                pl.when(pl.col("diff") > 0).then(pl.col("diff")).otherwise(0.0).alias("gain"),
                pl.when(pl.col("diff") < 0).then(-pl.col("diff")).otherwise(0.0).alias("loss"),
            ]
        )
        .with_columns(
            [
                pl.col("gain").ewm_mean(com=13).over("symbol").alias("avg_gain"),
                pl.col("loss").ewm_mean(com=13).over("symbol").alias("avg_loss"),
            ]
        )
        .with_columns([(100.0 - (100.0 / (1.0 + (pl.col("avg_gain") / avg_loss_denom)))).alias("rsi")])
    )

    # 8. Raw IBD 12-Month Performance Score (Weighted: 40% Q1, 20% Q2, 20% Q3, 20% Q4)
    d63 = pl.when(pl.col("close_63d_ago") > 0).then(pl.col("close_63d_ago")).otherwise(1.0)
    d126 = pl.when(pl.col("close_126d_ago") > 0).then(pl.col("close_126d_ago")).otherwise(1.0)
    d189 = pl.when(pl.col("close_189d_ago") > 0).then(pl.col("close_189d_ago")).otherwise(1.0)
    d252 = pl.when(pl.col("close_252d_ago") > 0).then(pl.col("close_252d_ago")).otherwise(1.0)

    df = df.with_columns(
        [
            (
                0.40 * ((pl.col("close") - pl.col("close_63d_ago")) / d63)
                + 0.20 * ((pl.col("close_63d_ago") - pl.col("close_126d_ago")) / d126)
                + 0.20 * ((pl.col("close_126d_ago") - pl.col("close_189d_ago")) / d189)
                + 0.20 * ((pl.col("close_189d_ago") - pl.col("close_252d_ago")) / d252)
            ).alias("raw_rs_score")
        ]
    )

    # 9. Mark Minervini 8-Point Trend Template Boolean Flags
    # Rule 1: Price > 150 SMA and Price > 200 SMA
    c1 = (pl.col("close") > pl.col("sma_150")) & (pl.col("close") > pl.col("sma_200"))
    # Rule 2: 150 SMA > 200 SMA
    c2 = pl.col("sma_150") > pl.col("sma_200")
    # Rule 3: 200 SMA trending up for at least 1 month
    c3 = pl.col("slope_200") > 0.0
    # Rule 4: 50 SMA > 150 SMA and 50 SMA > 200 SMA
    c4 = (pl.col("sma_50") > pl.col("sma_150")) & (pl.col("sma_50") > pl.col("sma_200"))
    # Rule 5: Price > 50 SMA
    c5 = pl.col("close") > pl.col("sma_50")
    # Rule 6: Price at least 30% above 52-week low
    c6 = pl.col("above_52w_low") >= 30.0
    # Rule 7: Price within 25% of 52-week high
    c7 = pl.col("from_52w_high") >= -25.0
    # Rule 8: Moving average stack (50 > 150 > 200)
    c8 = c4 & c2

    df = df.with_columns(
        [
            (
                c1.cast(pl.Int32)
                + c2.cast(pl.Int32)
                + c3.cast(pl.Int32)
                + c4.cast(pl.Int32)
                + c5.cast(pl.Int32)
                + c6.cast(pl.Int32)
                + c7.cast(pl.Int32)
                + c8.cast(pl.Int32)
            ).alias("conditions_met"),
            (c1 & c2 & c3 & c4 & c5 & c6 & c7).alias("minervini_pass"),
        ]
    )

    # 10. Stan Weinstein Stage Analysis Classification (1: Base, 2: Markup, 3: Top, 4: Decline)
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
    ).with_columns(
        [
            pl.when(pl.col("stage") == 1)
            .then(pl.lit("Stage 1 (Base)"))
            .when(pl.col("stage") == 2)
            .then(pl.lit("Stage 2 (Markup)"))
            .when(pl.col("stage") == 3)
            .then(pl.lit("Stage 3 (Top)"))
            .otherwise(pl.lit("Stage 4 (Decline)"))
            .alias("stage_name")
        ]
    )

    # Standardize alias: cmp = close
    df = df.with_columns([pl.col("close").alias("cmp")])

    return df


def calculate_daily_rs_ratings(df_latest_day: pl.DataFrame) -> pl.DataFrame:
    """Calculate relative strength percentile ratings (1–99) across all stocks on the latest session."""
    # Rank raw_rs_score across all symbols present on the day
    df_ranked = df_latest_day.with_columns([pl.col("raw_rs_score").rank(method="ordinal").alias("rank")])
    total_count = df_ranked.height

    if total_count > 1:
        df_ranked = df_ranked.with_columns(
            [(((pl.col("rank") / total_count) * 98.0) + 1.0).round(0).cast(pl.Int32).alias("rs_rating")]
        )
    else:
        df_ranked = df_ranked.with_columns([pl.lit(50).alias("rs_rating")])

    return df_ranked
