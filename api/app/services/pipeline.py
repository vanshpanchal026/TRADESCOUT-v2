"""TRADESCOUT — Zero-Scraper Parquet Data Pipeline.

Streams daily EOD data from Hugging Face Parquet datasets over HTTP.
Implements local disk caching in `.cache/parquet/` with fallback support.
"""

import asyncio
import os
import re
import tempfile
from datetime import UTC, datetime
from pathlib import Path

import httpx
import polars as pl
import structlog

logger = structlog.get_logger(__name__)

CACHE_DIR = Path(__file__).resolve().parent.parent.parent / ".cache" / "parquet"
TEJHQ_BASE_URL = "https://huggingface.co/datasets/tejhq/indian-markets/resolve/main"
VISHNU_BASE_URL = "https://huggingface.co/datasets/vishnun0027/indian-market-historical-ohlcv/resolve/main"

# In-process per-file mutex to prevent duplicate downloads and file collisions
_file_locks: dict[str, asyncio.Lock] = {}
_file_meta_lock = asyncio.Lock()


async def _get_file_lock(target_path: str) -> asyncio.Lock:
    """Retrieve or create an in-process asyncio.Lock for a specific file path."""
    async with _file_meta_lock:
        if target_path not in _file_locks:
            _file_locks[target_path] = asyncio.Lock()
        return _file_locks[target_path]


def ensure_cache_dir() -> Path:
    """Ensure the local parquet cache directory exists."""
    CACHE_DIR.mkdir(parents=True, exist_ok=True)
    return CACHE_DIR


async def fetch_file_if_modified(url: str, local_path: Path) -> Path:
    """Download file over HTTP atomically with per-file concurrency lock.

    Guarantees that concurrent requests for the same symbol/partition wait on a single
    download task and write to a temporary file with atomic replace (os.replace),
    completely preventing ArrowInvalid / ParquetException disk corruption.
    """
    ensure_cache_dir()
    lock = await _get_file_lock(str(local_path.resolve()))

    async with lock:
        # Re-check cache existence under lock (another coroutine may have just completed it)
        if local_path.exists() and local_path.stat().st_size > 0:
            file_age_hours = (datetime.now(UTC).timestamp() - local_path.stat().st_mtime) / 3600
            if file_age_hours < 12:
                logger.info("pipeline.cache_hit", path=str(local_path), age_hours=round(file_age_hours, 2))
                return local_path

        logger.info("pipeline.downloading", url=url, target=str(local_path))
        # Atomic write pattern: temporary file on the same filesystem volume
        temp_file = tempfile.NamedTemporaryFile(
            dir=local_path.parent,
            prefix=f".{local_path.name}.",
            suffix=".tmp",
            delete=False,
        )
        temp_path = Path(temp_file.name)
        temp_file.close()

        try:
            async with httpx.AsyncClient(timeout=60.0, follow_redirects=True) as client:
                response = await client.get(url)
                response.raise_for_status()
                temp_path.write_bytes(response.content)

            # Atomic rename replaces target instantly, reader threads never see partial bytes
            os.replace(temp_path, local_path)
            logger.info("pipeline.download_complete_atomic", path=str(local_path), bytes=len(response.content))
        except Exception as exc:
            if temp_path.exists():
                try:
                    temp_path.unlink()
                except OSError:
                    pass
            logger.warning("pipeline.download_failed", url=url, error=str(exc))
            raise
        return local_path


async def load_eod_data(year: int = 2026, force_refresh: bool = False) -> pl.DataFrame:
    """Load full market EOD prices from TejHQ year partition."""
    cache_path = CACHE_DIR / f"nse_{year}.parquet"
    url = f"{TEJHQ_BASE_URL}/nse/year={year}/nse_{year}.parquet"

    if force_refresh and cache_path.exists():
        cache_path.unlink()

    await fetch_file_if_modified(url, cache_path)
    df = pl.read_parquet(cache_path)
    logger.info("pipeline.eod_loaded", rows=df.height, columns=len(df.columns), year=year)
    return df


async def load_delivery_data(year: int = 2026, force_refresh: bool = False) -> pl.DataFrame:
    """Load NSE delivery percentage and quantity metrics."""
    cache_path = CACHE_DIR / f"delivery_nse_{year}.parquet"
    url = f"{TEJHQ_BASE_URL}/delivery/nse/year={year}/nse_{year}.parquet"

    if force_refresh and cache_path.exists():
        cache_path.unlink()

    await fetch_file_if_modified(url, cache_path)
    df = pl.read_parquet(cache_path)
    logger.info("pipeline.delivery_loaded", rows=df.height, year=year)
    return df


async def load_symbol_history(symbol: str, force_refresh: bool = False) -> pl.DataFrame:
    """Load on-demand deep historical daily OHLCV for an individual symbol from vishnun0027 dataset."""
    sym_clean = symbol.upper().replace(".NS", "").replace(".BO", "").strip()
    if not re.match(r"^[A-Z0-9_\-]+$", sym_clean):
        raise ValueError(f"Invalid symbol format: {symbol}")
    cache_path = CACHE_DIR / f"{sym_clean}.parquet"

    if force_refresh and cache_path.exists():
        try:
            cache_path.unlink()
        except OSError:
            pass

    # 1. Fast path: return cached parquet without hitting external URLs
    if not force_refresh and cache_path.exists() and cache_path.stat().st_size > 0:
        try:
            df = pl.read_parquet(cache_path)
            if df.height > 0:
                return df
        except Exception as exc:
            logger.warning("pipeline.cached_read_corrupt_reloading", symbol=sym_clean, error=str(exc))

    # 2. Try stocks/ then data/ then indices/ in vishnun0027 dataset
    candidate_urls = [
        f"{VISHNU_BASE_URL}/stocks/{sym_clean}.parquet",
        f"{VISHNU_BASE_URL}/data/{sym_clean}.parquet",
        f"{VISHNU_BASE_URL}/indices/{sym_clean}.parquet",
    ]

    for url in candidate_urls:
        try:
            await fetch_file_if_modified(url, cache_path)
            if cache_path.exists() and cache_path.stat().st_size > 0:
                df = pl.read_parquet(cache_path)
                if df.height > 0:
                    return df
        except Exception:
            continue

    logger.warning("pipeline.vishnu_history_failed", symbol=sym_clean)
    # 3. Fallback to slicing from local yearly data if available
    cache_2026 = CACHE_DIR / "nse_2026.parquet"
    if cache_2026.exists():
        df_year = pl.read_parquet(cache_2026)
        sliced = df_year.filter(pl.col("symbol") == sym_clean).sort("date")
        if sliced.height > 0:
            return sliced

    raise FileNotFoundError(f"Historical data for symbol '{sym_clean}' could not be loaded from pipeline or cache.")


async def load_benchmark_history(benchmark: str = "NIFTY_50", force_refresh: bool = False) -> pl.DataFrame:
    """Load historical daily data for benchmark index (default: NIFTY 50)."""
    clean_bench = benchmark.upper().replace(" ", "_").replace("-", "_").strip()
    if not re.match(r"^[A-Z0-9_\-]+$", clean_bench):
        raise ValueError(f"Invalid benchmark format: {benchmark}")
    cache_path = CACHE_DIR / f"{clean_bench}.parquet"

    if force_refresh and cache_path.exists():
        cache_path.unlink()

    candidate_urls = [
        f"{VISHNU_BASE_URL}/indices/{clean_bench}.parquet",
        f"{VISHNU_BASE_URL}/stocks/{clean_bench}.parquet",
    ]

    for url in candidate_urls:
        try:
            await fetch_file_if_modified(url, cache_path)
            if cache_path.exists() and cache_path.stat().st_size > 0:
                df = pl.read_parquet(cache_path)
                if df.height > 0:
                    return df
        except Exception:
            continue

    # Fallback: if benchmark not found, try slicing from nse_2026 or synthesizing from index average
    cache_2026 = CACHE_DIR / "nse_2026.parquet"
    if cache_2026.exists():
        df_year = pl.read_parquet(cache_2026)
        # Check if benchmark symbol exists in nse_2026
        bench_df = df_year.filter(pl.col("symbol") == clean_bench).sort("date")
        if bench_df.height > 0:
            return bench_df
        # Fallback to average close across top equities as synthetic benchmark
        synthetic = (
            df_year.group_by("date")
            .agg([pl.col("close").mean().alias("close"), pl.col("volume").sum().alias("volume")])
            .sort("date")
        )
        if synthetic.height > 0:
            return synthetic

    raise FileNotFoundError(f"Benchmark data for '{benchmark}' could not be loaded.")
