# TRADESCOUT — System Design & Architecture

> **Version:** 1.0  
> **Last Updated:** 12 Nov 2026  
> **Status:** Production Reference  

---

## Table of Contents

1. [High-Level Architecture](#1-high-level-architecture)
2. [Component Breakdown](#2-component-breakdown)
3. [Data Ingestion Layer](#3-data-ingestion-layer)
4. [Indicator Engine (Polars)](#4-indicator-engine-polars)
5. [API Layer (FastAPI)](#5-api-layer-fastapi)
6. [Frontend Component Architecture](#6-frontend-component-architecture)
7. [Authentication & Authorization](#7-authentication--authorization)
8. [Caching Strategy](#8-caching-strategy)
9. [API Proxy Pattern](#9-api-proxy-pattern)
10. [Chart Rendering](#10-chart-rendering)
11. [Dark Mode](#11-dark-mode)
12. [Mobile Responsiveness](#12-mobile-responsiveness)
13. [Error Handling & Observability](#13-error-handling--observability)
14. [Infrastructure & Deployment](#14-infrastructure--deployment)

---

## 1. High-Level Architecture

```mermaid
flowchart TD
    subgraph CLIENT["Client Layer (Vercel Edge — Mumbai)"]
        NEXT["Next.js 14 App Router"]
        RSC["React Server Components"]
        CC["Client Components"]
        TQ["TanStack React Query"]
    end

    subgraph PROXY["API Gateway (Next.js API Routes)"]
        CATCH["/api/[...path]/route.ts<br/>Catch-all Proxy"]
    end

    subgraph BACKEND["Backend (Hetzner VPS / Railway)"]
        FAST["FastAPI + Pydantic v2"]
        INDICATOR["Indicator Engine (Polars)"]
        SCANNER["Scanner Result Generator"]
        AUTH_MW["Auth Middleware"]
        REQ_ID["RequestIDMiddleware"]
    end

    subgraph DATA["Data Layer"]
        HF_TEJ["HuggingFace Parquet<br/>tejhq/indian-markets"]
        HF_VIS["HuggingFace Parquet<br/>vishnun0027/historical-ohlcv"]
        SUPA_DB["Supabase PostgreSQL"]
        SUPA_AUTH["Supabase Auth"]
        REDIS["Redis 7 Cache"]
        BFIN["bfinance SDK"]
    end

    subgraph CRON["Scheduled Jobs"]
        GH_ACTIONS["GitHub Actions / Hetzner Cron"]
        DAILY["Daily Refresh (4:00 PM IST)"]
    end

    NEXT --> CATCH
    RSC --> CATCH
    CC --> TQ --> CATCH
    CATCH -->|"Authorization header<br/>+ request-id"| FAST
    FAST --> AUTH_MW --> SUPA_AUTH
    FAST --> REQ_ID
    FAST --> INDICATOR
    INDICATOR --> HF_TEJ
    INDICATOR --> HF_VIS
    FAST --> SCANNER --> REDIS
    FAST --> SUPA_DB
    FAST --> BFIN
    GH_ACTIONS --> DAILY --> INDICATOR
    DAILY --> SCANNER
```

### Request Flow (Single Request Lifecycle)

```mermaid
sequenceDiagram
    participant Browser
    participant Vercel as Next.js (Vercel Edge)
    participant Proxy as /api/[...path]
    participant FastAPI as FastAPI Backend
    participant Redis
    participant HF as HuggingFace Parquet
    participant Supabase

    Browser->>Vercel: GET /scanners/trend-template
    Vercel->>Vercel: RSC renders shell (SSR)
    Vercel-->>Browser: HTML + hydration payload
    Browser->>Proxy: GET /api/scanners/trend-template
    Proxy->>Proxy: Extract JWT from cookie/header
    Proxy->>FastAPI: GET /scanners/trend-template<br/>Authorization: Bearer {jwt}
    FastAPI->>FastAPI: RequestIDMiddleware assigns req-id
    FastAPI->>Supabase: Verify JWT (optional for public)
    FastAPI->>Redis: GET scanner:trend-template:2026-11-12
    alt Cache HIT
        Redis-->>FastAPI: Cached JSON
    else Cache MISS
        FastAPI->>HF: Download nse_2026.parquet
        FastAPI->>FastAPI: Polars compute indicators
        FastAPI->>Redis: SET scanner:trend-template:2026-11-12 (TTL 24h)
    end
    FastAPI-->>Proxy: JSON response (top-10 or full)
    Proxy-->>Browser: JSON (CORS handled)
    Browser->>Browser: TanStack Query caches (staleTime=5min)
```

---

## 2. Component Breakdown

### System Components Overview

| Component | Technology | Location | Responsibility |
|-----------|-----------|----------|---------------|
| Web Frontend | Next.js 14, React 18.3, Tailwind | Vercel (Edge Mumbai) | UI rendering, routing, client state |
| API Proxy | Next.js API Routes | Vercel | Auth forwarding, CORS, rate limit |
| Backend API | FastAPI, Pydantic v2 | Hetzner / Railway | Business logic, data endpoints |
| Indicator Engine | Polars (Python) | Backend process | Technical indicator computation |
| Scanner Generator | Python + Redis | Backend + Cache | Pre-computed scanner results |
| Auth Service | Supabase Auth | Supabase Cloud | JWT issuance, session management |
| User Database | Supabase PostgreSQL | Supabase Cloud | User data, watchlists, preferences |
| Cache Layer | Redis 7 | Hetzner / Railway | Scanner result cache, session data |
| Data Sources | HuggingFace Parquet | HF CDN (HTTP) | Market OHLCV, delivery, fundamentals |
| Scheduler | GitHub Actions / cron | GitHub / Hetzner | Daily data refresh orchestration |
| Monitoring | Sentry | Sentry Cloud | Error tracking, performance monitoring |

### Monorepo Directory Structure

```
TRADESCOUT/
├── api/                          # FastAPI backend
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py               # FastAPI app factory
│   │   ├── config.py             # Settings (pydantic-settings)
│   │   ├── middleware/
│   │   │   ├── request_id.py     # RequestIDMiddleware
│   │   │   ├── auth.py           # JWT verification middleware
│   │   │   └── cors.py           # CORS configuration
│   │   ├── routers/
│   │   │   ├── scanners.py       # /scanners/* endpoints
│   │   │   ├── stock.py          # /stock/* endpoints
│   │   │   ├── market.py         # /market-breadth, /indices
│   │   │   ├── watchlists.py     # /watchlists/* endpoints
│   │   │   ├── groups.py         # /groups/* endpoints
│   │   │   ├── rrg.py            # /rrg/* endpoints
│   │   │   ├── heatmap.py        # /heatmap/* endpoints
│   │   │   ├── cues.py           # /cues/* endpoints
│   │   │   ├── admin.py          # /admin/* endpoints
│   │   │   └── health.py         # /healthz, /readyz
│   │   ├── services/
│   │   │   ├── data_loader.py    # HuggingFace Parquet HTTP reader
│   │   │   ├── indicators.py     # Polars indicator computations
│   │   │   ├── scanner_engine.py # Scanner rule evaluation
│   │   │   ├── rs_rating.py      # IBD-style RS Rating calculator
│   │   │   ├── stage_detector.py # Weinstein Stage Detection
│   │   │   ├── minervini.py      # Trend Template 8 conditions
│   │   │   ├── fundamentals.py   # bfinance SDK wrapper
│   │   │   └── cache.py          # Redis cache abstraction
│   │   ├── models/
│   │   │   ├── scanner.py        # Scanner result schemas
│   │   │   ├── stock.py          # Stock detail schemas
│   │   │   ├── market.py         # Market breadth schemas
│   │   │   └── user.py           # User-related schemas
│   │   └── utils/
│   │       ├── dates.py          # IST date helpers
│   │       └── parquet.py        # Polars Parquet utilities
│   ├── requirements.txt
│   ├── Dockerfile
│   └── pyproject.toml
├── web/                          # Next.js frontend
│   ├── src/
│   │   ├── app/
│   │   │   ├── layout.tsx        # Root layout (dark mode, font)
│   │   │   ├── page.tsx          # Landing/marketing page
│   │   │   ├── (auth)/
│   │   │   │   ├── login/page.tsx
│   │   │   │   ├── signup/page.tsx
│   │   │   │   ├── reset-password/page.tsx
│   │   │   │   └── update-password/page.tsx
│   │   │   ├── (app)/
│   │   │   │   ├── warmup/page.tsx
│   │   │   │   ├── scanners/
│   │   │   │   │   ├── page.tsx
│   │   │   │   │   ├── [slug]/page.tsx
│   │   │   │   │   └── custom/page.tsx
│   │   │   │   ├── stock/[symbol]/page.tsx
│   │   │   │   ├── watchlists/page.tsx
│   │   │   │   ├── groups/page.tsx
│   │   │   │   ├── heatmap/page.tsx
│   │   │   │   ├── rrg/page.tsx
│   │   │   │   ├── leaders/page.tsx
│   │   │   │   ├── results/page.tsx
│   │   │   │   ├── news/page.tsx
│   │   │   │   ├── screen/page.tsx
│   │   │   │   └── intraday/page.tsx
│   │   │   └── api/
│   │   │       └── [...path]/route.ts  # Catch-all proxy
│   │   ├── components/
│   │   │   ├── charts/
│   │   │   │   ├── ChartWidget.tsx     # TradingView LC v4 wrapper
│   │   │   │   ├── RSLineChart.tsx     # Relative Strength line
│   │   │   │   ├── RRGCanvas.tsx       # Relative Rotation Graph
│   │   │   │   └── HeatmapTreemap.tsx  # Treemap heatmap
│   │   │   ├── scanners/
│   │   │   │   ├── ScannerTable.tsx    # Sortable data table
│   │   │   │   ├── ScannerCard.tsx     # Scanner list card
│   │   │   │   └── CustomBuilder.tsx   # Custom scanner builder
│   │   │   ├── warmup/
│   │   │   │   ├── WarmupDashboard.tsx
│   │   │   │   ├── ParticipationGauge.tsx
│   │   │   │   ├── StageDistribution.tsx
│   │   │   │   └── BreakoutHealth.tsx
│   │   │   ├── stock/
│   │   │   │   ├── StockHeader.tsx
│   │   │   │   ├── FundamentalsTab.tsx
│   │   │   │   ├── FinancialsTab.tsx
│   │   │   │   ├── ConcallsTab.tsx
│   │   │   │   └── NotesTab.tsx
│   │   │   ├── layout/
│   │   │   │   ├── Sidebar.tsx
│   │   │   │   ├── BottomNav.tsx
│   │   │   │   ├── ThemeToggle.tsx
│   │   │   │   └── Header.tsx
│   │   │   └── ui/               # Radix UI primitives
│   │   ├── lib/
│   │   │   ├── api.ts            # Centralized API client: i(path, params)
│   │   │   ├── supabase/
│   │   │   │   ├── client.ts     # Browser Supabase client
│   │   │   │   └── server.ts     # Server Supabase client
│   │   │   ├── hooks/
│   │   │   │   ├── useScanner.ts
│   │   │   │   ├── useStock.ts
│   │   │   │   ├── useWatchlists.ts
│   │   │   │   └── useAuth.ts
│   │   │   └── utils/
│   │   │       ├── format.ts     # Number/date formatters
│   │   │       └── constants.ts  # Scanner slugs, nav items
│   │   └── styles/
│   │       └── globals.css       # Tailwind base + dark mode vars
│   ├── public/
│   ├── next.config.ts
│   ├── tailwind.config.ts
│   ├── tsconfig.json
│   └── package.json
├── infra/
│   ├── docker-compose.yml        # Local dev: PostgreSQL 16 + Redis 7
│   ├── Dockerfile.api
│   ├── Dockerfile.web
│   └── nginx.conf                # Reverse proxy (if self-hosted)
├── tests/
│   ├── api/
│   │   ├── test_indicators.py    # Unit tests for every indicator
│   │   ├── test_scanners.py
│   │   ├── test_rs_rating.py
│   │   ├── test_stage_detection.py
│   │   └── test_minervini.py
│   └── web/
│       ├── __tests__/
│       └── e2e/
├── docs/                         # This documentation folder
│   ├── DesignDocument.md
│   ├── AppFlow.md
│   ├── data-pipeline.md
│   └── implementation-plan.md
├── .github/
│   └── workflows/
│       ├── ci.yml                # Lint + test on PR
│       └── daily-refresh.yml     # Daily data pipeline cron
└── README.md
```

---

## 3. Data Ingestion Layer

### Architecture

```mermaid
flowchart LR
    subgraph TRIGGER["Trigger (4:00 PM IST)"]
        CRON["GitHub Actions Cron<br/>or Hetzner crontab"]
    end

    subgraph DOWNLOAD["Download Phase"]
        TEJ_DL["HTTP GET<br/>tejhq/indian-markets<br/>nse/year=2026/*.parquet"]
        DEL_DL["HTTP GET<br/>delivery/year=2026/*.parquet"]
    end

    subgraph COMPUTE["Compute Phase (Polars)"]
        LOAD["pl.read_parquet(source)"]
        JOIN["Join OHLCV + Delivery"]
        IND["Compute Indicators<br/>SMA/EMA/RSI/MACD"]
        RS["RS Rating Calculation"]
        STAGE["Stage Detection"]
        SCAN["Scanner Rule Evaluation"]
    end

    subgraph STORE["Storage Phase"]
        JSON_GEN["Generate Scanner JSONs"]
        REDIS_W["Redis SET with 24h TTL"]
        LOG["Log results to Sentry"]
    end

    CRON --> TEJ_DL
    CRON --> DEL_DL
    TEJ_DL --> LOAD
    DEL_DL --> LOAD
    LOAD --> JOIN --> IND --> RS --> STAGE --> SCAN --> JSON_GEN --> REDIS_W
    REDIS_W --> LOG
```

### Data Source Details

| Source | Dataset | Rows | Columns | Partition | Update Frequency |
|--------|---------|------|---------|-----------|-----------------|
| TejHQ OHLCV | `tejhq/indian-markets/nse/year={year}/nse_{year}.parquet` | ~578K (2026) | `date, symbol, series, isin, name, open, high, low, close, last, prev_close, volume, turnover, trades, year, month` | Year | Daily |
| TejHQ Delivery | `tejhq/indian-markets/delivery/year={year}/delivery_{year}.parquet` | ~500K (2026) | `date, symbol, delivery_qty, delivery_pct, ...` | Year | Daily |
| vishnun0027 | `vishnun0027/indian-market-historical-ohlcv/data/{SYMBOL}.parquet` | 7,747 (RELIANCE) | `date, open, high, low, close, adj_close, volume, dividends, stock_splits, symbol` | Per-symbol | Daily (GitHub Actions) |
| bfinance | Python SDK | N/A | 10-year quarterly financials, concalls | Per-symbol | On-demand |
| jugaad-data | Python library (fallback) | N/A | NSE Bhavcopy, F&O, index P/E | N/A | On-demand |

### Download Strategy

```python
# api/app/services/data_loader.py
import polars as pl
from datetime import date

HF_BASE = "hf://datasets"

class DataLoader:
    """Zero-scraper data loader using HuggingFace Parquet over HTTP."""

    TEJHQ_NSE = f"{HF_BASE}/tejhq/indian-markets/nse/year={{year}}/nse_{{year}}.parquet"
    TEJHQ_DELIVERY = f"{HF_BASE}/tejhq/indian-markets/delivery/year={{year}}/delivery_{{year}}.parquet"
    VISHNUN_SYMBOL = f"{HF_BASE}/vishnun0027/indian-market-historical-ohlcv/data/{{symbol}}.parquet"

    def load_market_data(self, year: int = None) -> pl.DataFrame:
        """Load full-market OHLCV for a given year."""
        year = year or date.today().year
        nse = pl.read_parquet(self.TEJHQ_NSE.format(year=year))
        delivery = pl.read_parquet(self.TEJHQ_DELIVERY.format(year=year))
        return nse.join(delivery, on=["date", "symbol"], how="left")

    def load_symbol_history(self, symbol: str) -> pl.DataFrame:
        """Load per-symbol full history for stock detail page."""
        return pl.read_parquet(self.VISHNUN_SYMBOL.format(symbol=symbol))
```

### Daily Refresh Schedule

| Time (IST) | Event |
|------------|-------|
| 3:30 PM | NSE market close |
| 3:30–4:00 PM | Buffer for HuggingFace data upload |
| 4:00 PM | **Primary refresh trigger** — download Parquet, compute indicators, generate scanner JSONs, store in Redis |
| 5:00 PM | **Retry 1** — if TejHQ data not updated at 4 PM |
| 6:00 PM | **Retry 2** — if still not updated |
| 6:00+ PM | Use previous day's data; alert on Sentry |

---

## 4. Indicator Engine (Polars)

### Indicators Computed

| Indicator | Parameters | Formula / Logic | Output Column(s) |
|-----------|-----------|-----------------|-------------------|
| SMA | 10, 20, 50, 150, 200 | `rolling_mean(close, window)` | `sma_10`, `sma_20`, `sma_50`, `sma_150`, `sma_200` |
| EMA | 12, 26 | Exponential weighted mean with span | `ema_12`, `ema_26` |
| RSI | 14 | 100 − (100 / (1 + avg_gain/avg_loss)) | `rsi_14` |
| MACD | 12, 26, 9 | `ema_12 − ema_26`, signal = `ema(macd, 9)` | `macd`, `macd_signal`, `macd_histogram` |
| RS Rating | IBD-style | Weighted performance vs Nifty 50: `0.4*Q1 + 0.2*Q2 + 0.2*Q3 + 0.2*Q4` percentile rank (1–99) | `rs_rating` |
| Stage Detection | Weinstein | SMA 150 slope + price position relative to SMA 150/200 | `stage` (1–4), `stage_name` |
| Minervini Trend Template | 8 conditions | All 8 must be true simultaneously | `trend_template` (bool), `conditions_met` (count) |
| RVOL | 50-day avg | `today_volume / sma(volume, 50)` | `rvol` |
| 52W High/Low Proximity | 252 days | `(close − 52w_low) / (52w_high − 52w_low)` | `from_52w_high`, `from_52w_low` |

### Minervini Trend Template — 8 Conditions

```python
# api/app/services/minervini.py

def apply_trend_template(df: pl.DataFrame) -> pl.DataFrame:
    """
    Mark Minervini's Trend Template — all 8 conditions must be TRUE.
    
    1. close > sma_150  (Price above 150-day MA)
    2. close > sma_200  (Price above 200-day MA)
    3. sma_150 > sma_200 (150-day MA above 200-day MA)
    4. sma_200 is trending up for at least 1 month (22 trading days)
    5. sma_50 > sma_150  (50-day MA above 150-day MA)
    6. sma_50 > sma_200  (50-day MA above 200-day MA)
    7. close > sma_50   (Price above 50-day MA)
    8. close is at least 25% above 52-week low
    9. close is within 25% of 52-week high
    """
    return df.with_columns([
        # Individual conditions
        (pl.col("close") > pl.col("sma_150")).alias("cond_1"),
        (pl.col("close") > pl.col("sma_200")).alias("cond_2"),
        (pl.col("sma_150") > pl.col("sma_200")).alias("cond_3"),
        (pl.col("sma_200") > pl.col("sma_200").shift(22)).alias("cond_4"),
        (pl.col("sma_50") > pl.col("sma_150")).alias("cond_5"),
        (pl.col("sma_50") > pl.col("sma_200")).alias("cond_6"),
        (pl.col("close") > pl.col("sma_50")).alias("cond_7"),
        (pl.col("from_52w_low") >= 0.25).alias("cond_8"),
        (pl.col("from_52w_high") <= 0.25).alias("cond_9"),
    ]).with_columns([
        # Count how many conditions are met
        (pl.sum_horizontal("cond_1", "cond_2", "cond_3", "cond_4",
                           "cond_5", "cond_6", "cond_7", "cond_8", "cond_9")
         ).alias("conditions_met"),
        # All conditions must pass
        (pl.all_horizontal("cond_1", "cond_2", "cond_3", "cond_4",
                           "cond_5", "cond_6", "cond_7", "cond_8", "cond_9")
         ).alias("trend_template"),
    ])
```

### Weinstein Stage Detection

```python
# api/app/services/stage_detector.py

def detect_stage(df: pl.DataFrame) -> pl.DataFrame:
    """
    Stan Weinstein's 4-stage model based on SMA 150 slope and price position.
    
    Stage 1 (Base): SMA 150 flat, price oscillating around it
    Stage 2 (Uptrend): SMA 150 rising, price above it
    Stage 3 (Top): SMA 150 flattening after rise, price crossing below
    Stage 4 (Decline): SMA 150 falling, price below it
    """
    return df.with_columns([
        pl.when(
            (pl.col("sma_150_slope") > 0.001) & (pl.col("close") > pl.col("sma_150"))
        ).then(pl.lit(2))
        .when(
            (pl.col("sma_150_slope") < -0.001) & (pl.col("close") < pl.col("sma_150"))
        ).then(pl.lit(4))
        .when(
            (pl.col("sma_150_slope").abs() <= 0.001) & (pl.col("close") > pl.col("sma_150"))
        ).then(pl.lit(3))
        .otherwise(pl.lit(1))
        .alias("stage"),
    ]).with_columns([
        pl.col("stage").replace_strict(
            {1: "Base", 2: "Uptrend", 3: "Top", 4: "Decline"}, default="Unknown"
        ).alias("stage_name"),
    ])
```

### IBD-Style RS Rating

```python
# api/app/services/rs_rating.py

def compute_rs_rating(df: pl.DataFrame, nifty_df: pl.DataFrame) -> pl.DataFrame:
    """
    IBD-style Relative Strength Rating (1–99 percentile).
    
    Weighted performance:
      - 40% × (most recent quarter performance vs Nifty)
      - 20% × (Q-1 performance vs Nifty)
      - 20% × (Q-2 performance vs Nifty)
      - 20% × (Q-3 performance vs Nifty)
    
    Result percentile-ranked across all stocks (1 = worst, 99 = best).
    """
    # Compute quarterly returns for each stock
    # Compare to Nifty 50 quarterly returns
    # Apply 40/20/20/20 weighting
    # Percentile rank the result
    pass  # Full implementation in services/rs_rating.py
```

---

## 5. API Layer (FastAPI)

### API Endpoint Catalog

#### Public Endpoints (No Auth Required — Return Top 10)

| Method | Path | Description | Response Schema |
|--------|------|-------------|-----------------|
| `GET` | `/healthz` | Liveness probe | `{"status": "ok"}` |
| `GET` | `/readyz` | Readiness probe (Redis + DB connectivity) | `{"status": "ready", "redis": true, "db": true}` |
| `GET` | `/api/metadata` | App metadata — scanner list, last update timestamp | `ScannerMetadata` |
| `GET` | `/api/scanners/{slug}` | Scanner results (top 10 for public) | `ScannerResponse` |
| `GET` | `/api/stock/{symbol}` | Stock summary + latest indicators | `StockDetail` |
| `GET` | `/api/stock/{symbol}/chart` | OHLCV history for charting | `ChartData` |
| `GET` | `/api/stock/{symbol}/rs_line` | RS line data (stock vs Nifty 50) | `RSLineData` |
| `GET` | `/api/heatmap` | Market heatmap treemap data | `HeatmapData` |

#### Protected Endpoints (Auth Required — Return Full Results)

| Method | Path | Description | Response Schema |
|--------|------|-------------|-----------------|
| `GET` | `/api/scanners/{slug}?full=true` | Full scanner results (all stocks) | `ScannerResponse` |
| `GET` | `/api/scanners/near-pivot` | Near pivot point scanner | `ScannerResponse` |
| `GET` | `/api/scanners/vcp` | VCP (Volatility Contraction Pattern) scanner | `ScannerResponse` |
| `GET` | `/api/cues` | Daily market cues | `CuesResponse` |
| `GET` | `/api/indices` | Index performance data | `IndicesResponse` |
| `GET` | `/api/market-breadth` | Market breadth indicators | `BreadthResponse` |
| `GET` | `/api/live/dashboard` | Live intraday dashboard data | `LiveDashboard` |
| `POST` | `/api/scan` | Custom scanner — execute user-defined conditions | `ScannerResponse` |
| `GET` | `/api/scan/options` | Custom scanner — available fields and operators | `ScanOptions` |
| `GET` | `/api/rrg` | Relative Rotation Graph data | `RRGResponse` |
| `GET` | `/api/groups` | Sector/industry groups with RS rankings | `GroupsResponse` |
| `GET` | `/api/groups/{group}` | Stocks within a sector/industry group | `GroupDetail` |
| `GET` | `/api/results` | Earnings calendar | `ResultsResponse` |

#### User-Specific Endpoints (Auth Required)

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/watchlists` | List user's watchlists |
| `POST` | `/api/watchlists` | Create a new watchlist |
| `PUT` | `/api/watchlists/{id}` | Update watchlist (rename, reorder) |
| `DELETE` | `/api/watchlists/{id}` | Delete a watchlist |
| `POST` | `/api/watchlists/{id}/items` | Add stock to watchlist |
| `DELETE` | `/api/watchlists/{id}/items/{symbol}` | Remove stock from watchlist |
| `GET` | `/api/favourites` | List user's favourite stocks |
| `POST` | `/api/favourites/{symbol}` | Add stock to favourites |
| `DELETE` | `/api/favourites/{symbol}` | Remove from favourites |
| `GET` | `/api/user/prefs` | Get UI preferences |
| `PUT` | `/api/user/prefs` | Update UI preferences |
| `GET` | `/api/stock/{symbol}/notes` | Get user notes for a stock |
| `PUT` | `/api/stock/{symbol}/notes` | Save user notes for a stock |

#### Admin Endpoints (Admin Auth Required)

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/api/admin/refresh-cache` | Manual cache invalidation + rebuild |
| `GET` | `/api/admin/pipeline-status` | Last pipeline run status |

### Response Schema Example — `ScannerResponse`

```json
{
  "scanner": "trend-template",
  "scanner_name": "Minervini Trend Template",
  "last_updated": "2026-11-12T10:30:00+05:30",
  "total_count": 142,
  "is_truncated": true,
  "results": [
    {
      "symbol": "RELIANCE",
      "name": "Reliance Industries Ltd",
      "cmp": 2845.50,
      "change_pct": 1.23,
      "sma_50": 2780.00,
      "sma_150": 2650.00,
      "sma_200": 2580.00,
      "rs_rating": 92,
      "stage": 2,
      "stage_name": "Uptrend",
      "conditions_met": 9,
      "from_52w_high": 0.05,
      "from_52w_low": 0.42,
      "rsi_14": 62.5,
      "rvol": 1.35,
      "volume": 12500000,
      "pe": 28.5,
      "pb": 2.1,
      "roe": 12.8,
      "roce": 14.2,
      "eps_growth_yoy": 18.5,
      "promoter_pct": 50.31,
      "fii_pct": 23.45,
      "dii_pct": 14.22,
      "industry_rs_rating": 85,
      "delivery_pct": 42.5,
      "sector": "Oil & Gas"
    }
  ]
}
```

### Centralized Frontend API Client

```typescript
// web/src/lib/api.ts

const BACKEND_BASE = '/api';

/**
 * Centralized API client using the `i(path, params)` pattern.
 * All frontend data fetching goes through this single function.
 */
export async function i<T>(
  path: string,
  params?: Record<string, string | number | boolean>,
  options?: RequestInit
): Promise<T> {
  const url = new URL(`${BACKEND_BASE}${path}`, window.location.origin);

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.set(key, String(value));
    });
  }

  const res = await fetch(url.toString(), {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: res.statusText }));
    throw new APIError(res.status, error.detail || 'Unknown error');
  }

  return res.json();
}

export class APIError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'APIError';
  }
}

// Usage examples:
// const scanners = await i<ScannerResponse>('/scanners/trend-template');
// const stock = await i<StockDetail>('/stock/RELIANCE');
// const chart = await i<ChartData>('/stock/RELIANCE/chart', { period: '1Y' });
```

---

## 6. Frontend Component Architecture

### Component Hierarchy

```mermaid
flowchart TD
    ROOT["RootLayout<br/>(dark mode, Hanken Grotesk font)"]

    subgraph AUTH["(auth) Layout"]
        LOGIN["LoginPage"]
        SIGNUP["SignupPage"]
        RESET["ResetPasswordPage"]
        UPDATE["UpdatePasswordPage"]
    end

    subgraph APP["(app) Layout — Sidebar + BottomNav"]
        WARMUP["WarmupPage"]
        SCANNERS["ScannersPage"]
        SCANNER_DETAIL["ScannerDetailPage [slug]"]
        SCANNER_CUSTOM["CustomScannerPage"]
        STOCK["StockDetailPage [symbol]"]
        WATCH["WatchlistsPage"]
        GROUPS["GroupsPage"]
        HEATMAP["HeatmapPage"]
        RRG["RRGPage"]
        LEADERS["LeadersPage"]
        RESULTS["ResultsPage"]
        NEWS["NewsPage"]
        SCREEN["ScreenPage"]
        INTRADAY["IntradayPage"]
    end

    ROOT --> AUTH
    ROOT --> APP
    SCANNERS --> SCANNER_DETAIL
    SCANNERS --> SCANNER_CUSTOM
    SCANNER_DETAIL -->|"click row"| STOCK
```

### Key Components

#### `ChartWidget` — TradingView Lightweight Charts v4

```typescript
// web/src/components/charts/ChartWidget.tsx
// Canvas-based charting — NOT SVG

interface ChartWidgetProps {
  symbol: string;
  data: OHLCVData[];
  overlays?: {
    sma10?: boolean;   // addLineSeries — color: #FFD700
    sma20?: boolean;   // addLineSeries — color: #FF6347
    sma50?: boolean;   // addLineSeries — color: #4169E1
    sma200?: boolean;  // addLineSeries — color: #9370DB
    ema12?: boolean;   // addLineSeries — color: #00CED1
    ema26?: boolean;   // addLineSeries — color: #FF4500
  };
  showVolume?: boolean;         // addHistogramSeries
  pivotLines?: PivotLine[];     // Custom overlays for pivot/breakout levels
  tightAreas?: TightArea[];     // Highlight consolidation zones
  insideBars?: InsideBar[];     // Mark inside bar patterns
}

// Creates chart with:
// - addCandlestickSeries() for OHLC data
// - addLineSeries() for each SMA/EMA overlay
// - addHistogramSeries() for volume bars
// - Custom price lines for pivot levels
// - Highlighted rectangle areas for tight consolidations
```

#### `ScannerTable` — Sortable Data Table

```typescript
// web/src/components/scanners/ScannerTable.tsx

interface ScannerTableProps {
  data: ScannerResult[];
  columns: ColumnDef[];      // Configurable columns per scanner
  sortable: boolean;
  onRowClick: (symbol: string) => void;  // Navigate to /stock/:symbol
  isLoading: boolean;
  isTruncated: boolean;      // Show "upgrade for full results" banner
}

// Columns per scanner type:
// trend-template: symbol, cmp, rs_rating, stage, conditions_met, sma_50, sma_150, sma_200, rvol
// recent-breakout: symbol, cmp, breakout_date, breakout_price, volume_ratio, rs_rating
// high-volume: symbol, cmp, volume, rvol, delivery_pct, change_pct
// near-pivot: symbol, cmp, pivot_price, distance_pct, rs_rating, stage
```

#### `WarmupDashboard` — Market Read

```typescript
// web/src/components/warmup/WarmupDashboard.tsx

// Sub-components:
// - ParticipationGauge: Radial gauge showing % stocks above SMA 50/150/200
// - RMESentiment: Washed-out vs Stretched sentiment indicator
// - StageDistribution: Bar chart of stocks in Stage 1/2/3/4
// - BreakoutHealth: Ratio of successful vs failed breakouts
// - EarningsCalendar: Upcoming earnings dates
// - DailyCues: Feed of market cues/signals
```

#### `RRGCanvas` — Relative Rotation Graph

```typescript
// web/src/components/charts/RRGCanvas.tsx

interface RRGCanvasProps {
  benchmark: string;           // e.g., "NIFTY 50"
  items: RRGItem[];            // Stocks or sectors to plot
  trailLength: number;         // Number of historical data points for trails
}

// Four quadrants:
// - Leading (top-right): RS-Ratio > 100, RS-Momentum > 100
// - Weakening (bottom-right): RS-Ratio > 100, RS-Momentum < 100
// - Lagging (bottom-left): RS-Ratio < 100, RS-Momentum < 100
// - Improving (top-left): RS-Ratio < 100, RS-Momentum > 100
```

### React Server Components vs Client Components

| Component | Type | Rationale |
|-----------|------|-----------|
| `RootLayout` | RSC | Static shell, dark mode class application |
| `ScannersPage` (list) | RSC | Static list of available scanners |
| `ScannerDetailPage` | RSC shell + CC | Shell RSC, ScannerTable is Client Component for interactivity |
| `ChartWidget` | Client | Canvas rendering, user interaction, resize observers |
| `ScannerTable` | Client | Sorting, filtering, row click handlers |
| `WarmupDashboard` | Client | Animated gauges, real-time data updates |
| `RRGCanvas` | Client | Canvas animation, drag/zoom |
| `HeatmapTreemap` | Client | Interactive treemap, drill-down |
| `ThemeToggle` | Client | localStorage read/write |
| `Sidebar` / `BottomNav` | Client | Active route highlighting, mobile toggle |
| `StockHeader` | RSC | Static stock info fetched server-side |
| `FundamentalsTab` | RSC | Static financial data |

### TanStack Query Caching Configuration

```typescript
// web/src/lib/hooks/useScanner.ts

import { useQuery } from '@tanstack/react-query';
import { i } from '@/lib/api';

export function useScanner(slug: string) {
  return useQuery({
    queryKey: ['scanner', slug],
    queryFn: () => i<ScannerResponse>(`/scanners/${slug}`),
    staleTime: 5 * 60 * 1000,      // 5 minutes — scanners update daily
    gcTime: 30 * 60 * 1000,        // Keep in cache 30 min
    refetchOnWindowFocus: false,    // Don't refetch on tab focus
  });
}

export function useStockChart(symbol: string) {
  return useQuery({
    queryKey: ['stock', symbol, 'chart'],
    queryFn: () => i<ChartData>(`/stock/${symbol}/chart`),
    staleTime: Infinity,            // Historical data doesn't change
    gcTime: 60 * 60 * 1000,        // Keep 1 hour
  });
}

export function useStockDetail(symbol: string) {
  return useQuery({
    queryKey: ['stock', symbol],
    queryFn: () => i<StockDetail>(`/stock/${symbol}`),
    staleTime: 5 * 60 * 1000,      // 5 minutes
  });
}
```

---

## 7. Authentication & Authorization

### Auth Flow

```mermaid
sequenceDiagram
    participant User
    participant Browser
    participant NextJS as Next.js
    participant Proxy as /api/[...path]
    participant FastAPI
    participant Supabase as Supabase Auth

    Note over User,Supabase: Signup Flow
    User->>Browser: Fill signup form (email + password)
    Browser->>Supabase: supabase.auth.signUp({email, password})
    Supabase-->>Browser: Session + JWT
    Browser->>Browser: Store session in cookie
    Browser->>NextJS: Redirect to /warmup

    Note over User,Supabase: Login Flow
    User->>Browser: Fill login form
    Browser->>Supabase: supabase.auth.signInWithPassword({email, password})
    Supabase-->>Browser: Session + JWT
    Browser->>Browser: Store session in cookie
    Browser->>NextJS: Redirect to /warmup

    Note over User,Supabase: Magic Link Flow
    User->>Browser: Enter email for magic link
    Browser->>Supabase: supabase.auth.signInWithOtp({email})
    Supabase-->>User: Email with magic link
    User->>Browser: Click magic link
    Browser->>Supabase: Exchange token
    Supabase-->>Browser: Session + JWT
    Browser->>NextJS: Redirect to /warmup

    Note over User,Supabase: Authenticated API Call
    Browser->>Proxy: GET /api/scanners/vcp<br/>Cookie: sb-access-token=jwt
    Proxy->>Proxy: Extract JWT from cookie
    Proxy->>FastAPI: GET /scanners/vcp<br/>Authorization: Bearer {jwt}
    FastAPI->>Supabase: Verify JWT signature
    Supabase-->>FastAPI: User ID + claims
    FastAPI-->>Proxy: Full results (200 OK)
    Proxy-->>Browser: JSON response
```

### Supabase Database Schema (User Data)

```sql
-- Supabase PostgreSQL with Row Level Security (RLS)

-- User profiles (extends Supabase auth.users)
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    display_name TEXT,
    plan TEXT DEFAULT 'free' CHECK (plan IN ('free', 'premium')),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Watchlists
CREATE TABLE watchlists (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    position INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Watchlist items
CREATE TABLE watchlist_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    watchlist_id UUID REFERENCES watchlists(id) ON DELETE CASCADE NOT NULL,
    symbol TEXT NOT NULL,
    position INTEGER DEFAULT 0,
    added_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(watchlist_id, symbol)
);

-- Favourites
CREATE TABLE favourites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    symbol TEXT NOT NULL,
    added_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(user_id, symbol)
);

-- Chart drawings (user annotations on charts)
CREATE TABLE chart_drawings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    symbol TEXT NOT NULL,
    drawing_data JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Saved custom scans
CREATE TABLE saved_scans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    conditions JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- User UI preferences
CREATE TABLE ui_prefs (
    user_id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
    theme TEXT DEFAULT 'dark' CHECK (theme IN ('dark', 'light')),
    default_scanner TEXT DEFAULT 'trend-template',
    chart_overlays JSONB DEFAULT '{"sma50": true, "sma200": true}',
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- User notes on stocks
CREATE TABLE stock_notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    symbol TEXT NOT NULL,
    content TEXT,
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(user_id, symbol)
);

-- RLS Policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE watchlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE watchlist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE favourites ENABLE ROW LEVEL SECURITY;
ALTER TABLE chart_drawings ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_scans ENABLE ROW LEVEL SECURITY;
ALTER TABLE ui_prefs ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_notes ENABLE ROW LEVEL SECURITY;

-- Users can only read/write their own data
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can view own watchlists" ON watchlists FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own watchlist items" ON watchlist_items FOR ALL
    USING (watchlist_id IN (SELECT id FROM watchlists WHERE user_id = auth.uid()));
CREATE POLICY "Users can manage own favourites" ON favourites FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own drawings" ON chart_drawings FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own scans" ON saved_scans FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own prefs" ON ui_prefs FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own notes" ON stock_notes FOR ALL USING (auth.uid() = user_id);
```

### Freemium Gating Logic

```python
# api/app/middleware/auth.py

from enum import Enum

class UserPlan(str, Enum):
    ANONYMOUS = "anonymous"   # Not logged in
    FREE = "free"             # Logged in, free tier
    PREMIUM = "premium"       # Paid subscription

SCANNER_ACCESS = {
    # scanner_slug: {plan: max_results}
    "trend-template":    {UserPlan.ANONYMOUS: 10, UserPlan.FREE: 10, UserPlan.PREMIUM: None},
    "recent-breakout":   {UserPlan.ANONYMOUS: 10, UserPlan.FREE: 10, UserPlan.PREMIUM: None},
    "4pct-breakout":     {UserPlan.ANONYMOUS: 10, UserPlan.FREE: 10, UserPlan.PREMIUM: None},
    "high-volume":       {UserPlan.ANONYMOUS: 10, UserPlan.FREE: 10, UserPlan.PREMIUM: None},
    "1m-gainers":        {UserPlan.ANONYMOUS: 10, UserPlan.FREE: 10, UserPlan.PREMIUM: None},
    "near-pivot":        {UserPlan.ANONYMOUS: 0,  UserPlan.FREE: 0,  UserPlan.PREMIUM: None},
    "vcp":               {UserPlan.ANONYMOUS: 0,  UserPlan.FREE: 0,  UserPlan.PREMIUM: None},
}

WATCHLIST_LIMITS = {
    UserPlan.ANONYMOUS: 0,     # No watchlists
    UserPlan.FREE: 1,          # 1 watchlist, 20 stocks
    UserPlan.PREMIUM: None,    # Unlimited
}

WATCHLIST_ITEM_LIMITS = {
    UserPlan.FREE: 20,
    UserPlan.PREMIUM: None,
}
```

---

## 8. Caching Strategy

### Multi-Layer Cache Architecture

```mermaid
flowchart TD
    subgraph L1["Layer 1: Browser (TanStack Query)"]
        TQ_SCAN["Scanner Results<br/>staleTime: 5min"]
        TQ_CHART["Chart Data<br/>staleTime: Infinity"]
        TQ_STOCK["Stock Detail<br/>staleTime: 5min"]
    end

    subgraph L2["Layer 2: Redis 7 (Backend)"]
        R_SCAN["scanner:{slug}:{date}<br/>TTL: 24h"]
        R_META["metadata:{date}<br/>TTL: 24h"]
        R_BREADTH["market-breadth:{date}<br/>TTL: 24h"]
    end

    subgraph L3["Layer 3: Local File (Backend)"]
        F_PARQUET["Parquet files cached on disk<br/>/data/cache/{symbol}.parquet"]
    end

    subgraph SOURCE["Source of Truth"]
        HF["HuggingFace Parquet<br/>(HTTP)"]
    end

    TQ_SCAN -->|"miss"| R_SCAN
    TQ_CHART -->|"miss"| F_PARQUET
    TQ_STOCK -->|"miss"| R_SCAN
    R_SCAN -->|"miss"| HF
    F_PARQUET -->|"miss"| HF
```

### Redis Key Schema

| Key Pattern | TTL | Value Type | Description |
|-------------|-----|-----------|-------------|
| `scanner:{slug}:{YYYY-MM-DD}` | 24h | JSON string | Pre-computed scanner results |
| `metadata:{YYYY-MM-DD}` | 24h | JSON string | Scanner list + last update time |
| `market-breadth:{YYYY-MM-DD}` | 24h | JSON string | Market breadth indicators |
| `heatmap:{YYYY-MM-DD}` | 24h | JSON string | Heatmap treemap data |
| `groups:{YYYY-MM-DD}` | 24h | JSON string | Sector/industry group RS rankings |
| `cues:{YYYY-MM-DD}` | 24h | JSON string | Daily market cues |
| `pipeline:status` | — | JSON string | Last pipeline run status (no TTL) |

### Cache Invalidation

```python
# api/app/services/cache.py

import redis.asyncio as redis
from datetime import date

class CacheService:
    def __init__(self, redis_client: redis.Redis):
        self.redis = redis_client

    async def invalidate_daily_cache(self):
        """Called after daily pipeline completes. Deletes all dated keys for today."""
        today = date.today().isoformat()
        patterns = [
            f"scanner:*:{today}",
            f"metadata:{today}",
            f"market-breadth:{today}",
            f"heatmap:{today}",
            f"groups:{today}",
            f"cues:{today}",
        ]
        for pattern in patterns:
            async for key in self.redis.scan_iter(match=pattern):
                await self.redis.delete(key)

    async def set_scanner(self, slug: str, data: dict, ttl: int = 86400):
        """Store scanner results with 24-hour TTL."""
        today = date.today().isoformat()
        key = f"scanner:{slug}:{today}"
        await self.redis.set(key, json.dumps(data), ex=ttl)

    async def get_scanner(self, slug: str) -> dict | None:
        """Retrieve cached scanner results for today."""
        today = date.today().isoformat()
        key = f"scanner:{slug}:{today}"
        data = await self.redis.get(key)
        return json.loads(data) if data else None
```

---

## 9. API Proxy Pattern

### Next.js Catch-All API Route

```typescript
// web/src/app/api/[...path]/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

const BACKEND_URL = process.env.BACKEND_URL!;  // e.g., https://api.tradescout.in

async function proxyRequest(req: NextRequest, path: string) {
  // 1. Extract auth token from Supabase session
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();

  // 2. Build backend URL
  const backendUrl = new URL(path, BACKEND_URL);
  req.nextUrl.searchParams.forEach((value, key) => {
    backendUrl.searchParams.set(key, value);
  });

  // 3. Forward request with auth header
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    'X-Request-ID': crypto.randomUUID(),
  };

  if (session?.access_token) {
    headers['Authorization'] = `Bearer ${session.access_token}`;
  }

  // 4. Proxy the request
  const body = ['POST', 'PUT', 'PATCH'].includes(req.method)
    ? await req.text()
    : undefined;

  const response = await fetch(backendUrl.toString(), {
    method: req.method,
    headers,
    body,
  });

  // 5. Return response with CORS headers
  const data = await response.text();
  return new NextResponse(data, {
    status: response.status,
    headers: {
      'Content-Type': response.headers.get('Content-Type') || 'application/json',
      'Access-Control-Allow-Origin': '*',
      'X-Request-ID': headers['X-Request-ID'] as string,
    },
  });
}

export async function GET(req: NextRequest, { params }: { params: { path: string[] } }) {
  return proxyRequest(req, `/${params.path.join('/')}`);
}

export async function POST(req: NextRequest, { params }: { params: { path: string[] } }) {
  return proxyRequest(req, `/${params.path.join('/')}`);
}

export async function PUT(req: NextRequest, { params }: { params: { path: string[] } }) {
  return proxyRequest(req, `/${params.path.join('/')}`);
}

export async function DELETE(req: NextRequest, { params }: { params: { path: string[] } }) {
  return proxyRequest(req, `/${params.path.join('/')}`);
}
```

### Why the Proxy Pattern?

1. **Single origin** — Frontend and API share the same domain, eliminating CORS issues for the browser.
2. **Auth forwarding** — JWT is extracted from the Supabase session cookie server-side, so the raw token never touches client-side JavaScript directly.
3. **Backend hiding** — The FastAPI backend URL is never exposed to the browser; it's a server-only environment variable.
4. **Edge latency** — The proxy runs on Vercel Edge (Mumbai node), minimizing latency for Indian users.
5. **Rate limiting** — Can add rate limiting at the proxy layer before requests hit the backend.

---

## 10. Chart Rendering

### TradingView Lightweight Charts v4 Integration

```mermaid
flowchart LR
    subgraph CHART["ChartWidget Component"]
        CANVAS["HTML Canvas Element"]
        CANDLE["addCandlestickSeries()<br/>OHLC data"]
        SMA_LINES["addLineSeries() × N<br/>SMA 10/20/50/200, EMA 12/26"]
        VOL["addHistogramSeries()<br/>Volume bars"]
        PIVOT["Custom Price Lines<br/>Pivot / breakout levels"]
        TIGHT["Rectangle Overlays<br/>Tight areas / consolidations"]
        INSIDE["Markers<br/>Inside bar patterns"]
    end

    DATA["Parquet → JSON<br/>/api/stock/{symbol}/chart"] --> CANDLE
    DATA --> SMA_LINES
    DATA --> VOL
    USER_ANNOT["User Annotations<br/>chart_drawings table"] --> PIVOT
```

### Chart Configuration

```typescript
// Chart creation pattern
import { createChart, CandlestickSeries, LineSeries, HistogramSeries } from 'lightweight-charts';

const chart = createChart(containerRef.current, {
  width: containerWidth,
  height: 500,
  layout: {
    background: { type: 'solid', color: isDark ? '#1a1a2e' : '#ffffff' },
    textColor: isDark ? '#d1d5db' : '#374151',
    fontFamily: 'Hanken Grotesk, sans-serif',
  },
  grid: {
    vertLines: { color: isDark ? '#2d2d44' : '#e5e7eb' },
    horzLines: { color: isDark ? '#2d2d44' : '#e5e7eb' },
  },
  crosshair: { mode: 0 },  // Normal crosshair
  timeScale: {
    borderColor: isDark ? '#2d2d44' : '#e5e7eb',
    timeVisible: true,
  },
  rightPriceScale: {
    borderColor: isDark ? '#2d2d44' : '#e5e7eb',
  },
});

// Candlestick series (OHLC)
const candleSeries = chart.addSeries(CandlestickSeries, {
  upColor: '#22c55e',
  downColor: '#ef4444',
  borderUpColor: '#22c55e',
  borderDownColor: '#ef4444',
  wickUpColor: '#22c55e',
  wickDownColor: '#ef4444',
});
candleSeries.setData(ohlcData);

// SMA overlays
const sma50 = chart.addSeries(LineSeries, {
  color: '#4169E1',
  lineWidth: 1,
  title: 'SMA 50',
});
sma50.setData(sma50Data);

// Volume histogram
const volumeSeries = chart.addSeries(HistogramSeries, {
  color: '#6366f1',
  priceFormat: { type: 'volume' },
  priceScaleId: 'volume',
});
chart.priceScale('volume').applyOptions({
  scaleMargins: { top: 0.8, bottom: 0 },
});
volumeSeries.setData(volumeData);

// Pivot line overlay
candleSeries.createPriceLine({
  price: pivotPrice,
  color: '#f59e0b',
  lineWidth: 1,
  lineStyle: 2,    // Dashed
  axisLabelVisible: true,
  title: 'Pivot',
});
```

---

## 11. Dark Mode

### Implementation

```
Mechanism: CSS class-based dark mode (Tailwind `darkMode: 'class'`)
Storage: localStorage key `stc-theme` → "dark" | "light"
Default: Dark mode (class `dark` on <html>)
Toggle: ThemeToggle component in header/sidebar
```

```typescript
// web/src/components/layout/ThemeToggle.tsx

'use client';

import { useEffect, useState } from 'react';

export function ThemeToggle() {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  useEffect(() => {
    const saved = localStorage.getItem('stc-theme') as 'dark' | 'light' | null;
    const initial = saved || 'dark';
    setTheme(initial);
    document.documentElement.classList.toggle('dark', initial === 'dark');
  }, []);

  const toggle = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    localStorage.setItem('stc-theme', next);
    document.documentElement.classList.toggle('dark', next === 'dark');
  };

  return (
    <button onClick={toggle} aria-label="Toggle theme">
      {theme === 'dark' ? '☀️' : '🌙'}
    </button>
  );
}
```

```css
/* web/src/styles/globals.css */
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: #ffffff;
    --foreground: #0f172a;
    --card: #ffffff;
    --card-foreground: #0f172a;
    --primary: #6366f1;
    --muted: #f1f5f9;
    --muted-foreground: #64748b;
    --border: #e2e8f0;
  }

  .dark {
    --background: #0f0f1a;
    --foreground: #e2e8f0;
    --card: #1a1a2e;
    --card-foreground: #e2e8f0;
    --primary: #818cf8;
    --muted: #1e1e32;
    --muted-foreground: #94a3b8;
    --border: #2d2d44;
  }
}
```

```typescript
// tailwind.config.ts
export default {
  darkMode: 'class',
  // ...
};
```

---

## 12. Mobile Responsiveness

### Breakpoint Strategy (Mobile-First)

| Breakpoint | Tailwind Class | Layout Changes |
|-----------|---------------|----------------|
| `< 640px` (mobile) | Default | Bottom nav visible, sidebar hidden, single-column layout, touch-friendly chart controls |
| `640px` (sm) | `sm:` | Minor spacing adjustments |
| `768px` (md) | `md:` | Two-column scanner table, larger chart height |
| `1024px` (lg) | `lg:` | Sidebar visible, bottom nav hidden, full scanner table columns |
| `1280px` (xl) | `xl:` | Wider content area, more chart overlays visible |

### Navigation Pattern

```mermaid
flowchart LR
    subgraph DESKTOP["Desktop (lg+): Sidebar Navigation"]
        SIDE["Left Sidebar<br/>240px fixed"]
        CONTENT_D["Main Content Area"]
    end

    subgraph MOBILE["Mobile (<lg): Bottom Navigation"]
        CONTENT_M["Full-width Content"]
        BOTTOM["Bottom Nav Bar<br/>56px fixed"]
    end
```

```typescript
// Bottom nav items (mobile)
const NAV_ITEMS = [
  { href: '/warmup',   icon: 'Compass',    label: 'Warmup' },
  { href: '/scanners', icon: 'Search',     label: 'Scanners' },
  { href: '/heatmap',  icon: 'Grid',       label: 'Heatmap' },
  { href: '/watchlists', icon: 'Star',     label: 'Watchlists' },
  { href: '/leaders',  icon: 'TrendingUp', label: 'Leaders' },
];

// Sidebar nav items (desktop — full list)
const SIDEBAR_ITEMS = [
  { href: '/warmup',    icon: 'Compass',    label: 'Warmup' },
  { href: '/scanners',  icon: 'Search',     label: 'Scanners' },
  { href: '/heatmap',   icon: 'Grid',       label: 'Heatmap' },
  { href: '/rrg',       icon: 'Target',     label: 'RRG' },
  { href: '/groups',    icon: 'Layers',     label: 'Groups' },
  { href: '/leaders',   icon: 'TrendingUp', label: 'Leaders' },
  { href: '/watchlists', icon: 'Star',      label: 'Watchlists' },
  { href: '/results',   icon: 'Calendar',   label: 'Results' },
  { href: '/news',      icon: 'Newspaper',  label: 'News' },
  { href: '/screen',    icon: 'Filter',     label: 'Screen' },
  { href: '/intraday',  icon: 'Activity',   label: 'Intraday' },
];
```

### Touch-Friendly Chart Controls

- Pinch-to-zoom on chart (handled natively by Lightweight Charts)
- Swipe to scroll time axis
- Long-press for crosshair
- Floating action buttons for overlay toggles (SMA, volume, RSI)
- Bottom sheet for indicator settings on mobile

---

## 13. Error Handling & Observability

### Sentry Integration

```mermaid
flowchart TD
    subgraph FRONTEND["Frontend (@sentry/nextjs)"]
        CLIENT_ERR["Client-side errors<br/>(React Error Boundaries)"]
        SERVER_ERR["Server Component errors"]
        EDGE_ERR["Edge Function errors"]
    end

    subgraph BACKEND["Backend (sentry-sdk)"]
        API_ERR["API errors (422, 500)"]
        PIPELINE_ERR["Pipeline failures"]
        DATA_ERR["Data quality anomalies"]
    end

    subgraph SENTRY["Sentry Cloud"]
        ALERTS["Alerts (Slack / Email)"]
        PERF["Performance Monitoring"]
        TRACES["Distributed Traces<br/>(Request ID correlation)"]
    end

    CLIENT_ERR --> SENTRY
    SERVER_ERR --> SENTRY
    EDGE_ERR --> SENTRY
    API_ERR --> SENTRY
    PIPELINE_ERR --> SENTRY
    DATA_ERR --> SENTRY
    SENTRY --> ALERTS
    SENTRY --> PERF
    SENTRY --> TRACES
```

### RequestIDMiddleware

```python
# api/app/middleware/request_id.py

import uuid
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request

class RequestIDMiddleware(BaseHTTPMiddleware):
    """
    Assigns a unique request ID to every incoming request.
    Pattern adopted from RepoTrace.
    
    - Reads X-Request-ID from incoming header (from Next.js proxy)
    - Falls back to generating a new UUID
    - Attaches to response headers
    - Available in request.state.request_id for logging/Sentry
    """

    async def dispatch(self, request: Request, call_next):
        request_id = request.headers.get("X-Request-ID", str(uuid.uuid4()))
        request.state.request_id = request_id

        response = await call_next(request)
        response.headers["X-Request-ID"] = request_id
        return response
```

### Structured Logging

```python
# api/app/main.py

import logging
import sentry_sdk
from sentry_sdk.integrations.fastapi import FastApiIntegration
from sentry_sdk.integrations.redis import RedisIntegration

sentry_sdk.init(
    dsn=settings.SENTRY_DSN,
    integrations=[FastApiIntegration(), RedisIntegration()],
    traces_sample_rate=0.1,        # 10% of transactions
    profiles_sample_rate=0.1,
    environment=settings.ENVIRONMENT,  # "production" | "staging"
)

# Structured logger with request ID context
logger = logging.getLogger("tradescout")
logger.setLevel(logging.INFO)

# Log format: [request_id] level message
formatter = logging.Formatter(
    "[%(request_id)s] %(levelname)s %(name)s: %(message)s"
)
```

### Error Response Schema

```python
# api/app/models/error.py

from pydantic import BaseModel

class ErrorResponse(BaseModel):
    """Standardized error response body."""
    detail: str
    request_id: str
    code: str              # Machine-readable error code

# Error codes:
# SCANNER_NOT_FOUND      — Unknown scanner slug
# SYMBOL_NOT_FOUND       — Unknown stock symbol
# AUTH_REQUIRED           — Endpoint requires authentication
# PREMIUM_REQUIRED       — Feature requires premium subscription
# RATE_LIMITED            — Too many requests
# DATA_UNAVAILABLE       — Data source temporarily unavailable
# PIPELINE_STALE         — Scanner data older than 48 hours
# VALIDATION_ERROR       — Pydantic validation failure (422)
```

---

## 14. Infrastructure & Deployment

### Deployment Architecture

```mermaid
flowchart TD
    subgraph VERCEL["Vercel (Frontend)"]
        EDGE["Edge Network<br/>Mumbai Node (BOM)"]
        NEXT_DEPLOY["Next.js 14<br/>App Router"]
        PROXY_DEPLOY["API Proxy Routes"]
    end

    subgraph HETZNER["Hetzner VPS / Railway (Backend)"]
        UVICORN["uvicorn + gunicorn<br/>2 workers"]
        FASTAPI_DEPLOY["FastAPI App"]
        REDIS_DEPLOY["Redis 7"]
    end

    subgraph SUPABASE_CLOUD["Supabase Cloud"]
        PG["PostgreSQL 16"]
        AUTH_SVC["Auth Service"]
    end

    subgraph GITHUB["GitHub"]
        REPO["Monorepo"]
        ACTIONS["GitHub Actions<br/>CI + Daily Cron"]
    end

    subgraph SENTRY_CLOUD["Sentry Cloud"]
        MONITORING["Error Monitoring<br/>+ Performance"]
    end

    EDGE --> PROXY_DEPLOY --> FASTAPI_DEPLOY
    FASTAPI_DEPLOY --> REDIS_DEPLOY
    FASTAPI_DEPLOY --> PG
    FASTAPI_DEPLOY --> AUTH_SVC
    NEXT_DEPLOY --> AUTH_SVC
    REPO -->|"push to main"| VERCEL
    REPO -->|"push to main"| HETZNER
    ACTIONS -->|"daily cron"| FASTAPI_DEPLOY
    FASTAPI_DEPLOY --> MONITORING
    NEXT_DEPLOY --> MONITORING
```

### Environment Variables

| Variable | Location | Description |
|----------|----------|-------------|
| `BACKEND_URL` | Vercel (server-only) | FastAPI backend URL |
| `NEXT_PUBLIC_SUPABASE_URL` | Vercel | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Vercel | Supabase anonymous key |
| `SENTRY_DSN` | Vercel + Hetzner | Sentry DSN for error tracking |
| `REDIS_URL` | Hetzner | Redis connection string |
| `SUPABASE_SERVICE_ROLE_KEY` | Hetzner (server-only) | Supabase service role key for admin ops |
| `SUPABASE_JWT_SECRET` | Hetzner | JWT verification secret |
| `HF_TOKEN` | Hetzner (optional) | HuggingFace token for rate-limited access |
| `ENVIRONMENT` | Both | `production` | `staging` |

### Docker Compose (Local Development)

```yaml
# infra/docker-compose.yml
version: '3.8'

services:
  postgres:
    image: postgres:16-alpine
    ports:
      - "5432:5432"
    environment:
      POSTGRES_USER: tradescout
      POSTGRES_PASSWORD: tradescout_dev
      POSTGRES_DB: tradescout
    volumes:
      - pg_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

  api:
    build:
      context: ../api
      dockerfile: Dockerfile
    ports:
      - "8000:8000"
    environment:
      - REDIS_URL=redis://redis:6379/0
      - DATABASE_URL=postgresql://tradescout:tradescout_dev@postgres:5432/tradescout
      - ENVIRONMENT=development
    depends_on:
      - postgres
      - redis
    volumes:
      - ../api:/app
    command: uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload

volumes:
  pg_data:
  redis_data:
```

### Cost Estimate (Monthly)

| Service | Tier | Estimated Cost |
|---------|------|---------------|
| Vercel | Hobby (free) → Pro ($20/mo) | $0–$20 |
| Hetzner VPS | CX22 (2 vCPU, 4GB RAM) | ~€5 (~$5.50) |
| Supabase | Free tier (500MB DB) | $0 |
| Redis | Included in Hetzner VPS | $0 |
| Sentry | Developer (free, 5K events) | $0 |
| Domain | `.in` domain | ~$10/year |
| **Total** | | **$5–$26/month** |

---

> **Document End** — This design document serves as the single source of truth for TRADESCOUT's system architecture. All implementation work should reference this document for architectural decisions.
