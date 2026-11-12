# TRADESCOUT — Technology Stack Decisions

> **Version:** 1.0  
> **Author:** Vansh Panchal  
> **Last Updated:** November 2026  
> **Status:** Approved

---

## Table of Contents

- [Overview](#overview)
- [Architecture Diagram](#architecture-diagram)
- [1. Frontend](#1-frontend)
- [2. Backend](#2-backend)
- [3. Data Sources](#3-data-sources)
- [4. Database & Authentication](#4-database--authentication)
- [5. Caching](#5-caching)
- [6. Hosting & Deployment](#6-hosting--deployment)
- [7. Error Monitoring & Observability](#7-error-monitoring--observability)
- [8. Design System & Typography](#8-design-system--typography)
- [9. CI/CD](#9-cicd)
- [10. Developer Tooling](#10-developer-tooling)
- [11. Cost Estimate](#11-cost-estimate)
- [12. Decision Log](#12-decision-log)

---

## Overview

TRADESCOUT is a **monorepo** structured as:

```
TRADESCOUT/
├── api/          # Python FastAPI backend
├── web/          # Next.js 14 frontend
├── infra/        # Docker Compose, IaC, deployment configs
├── tests/        # E2E and integration tests
├── docs/         # Project documentation (PRD, this file, ADRs)
├── .github/      # GitHub Actions workflows
├── docker-compose.yml
├── README.md
├── PRD.md
└── TechStack.md
```

The tech stack is optimised for three things:

1. **Speed** — sub-200ms API responses, SSR-first frontend.
2. **Cost** — ₹400–₹1,000/month total infrastructure.
3. **Data Freedom** — zero web scraping, zero paid APIs. 100% free, open data.

---

## Architecture Diagram

```mermaid
flowchart TD
    subgraph Client["Client (Browser)"]
        A["Next.js 14 App<br/>React 18.3 + Tailwind"]
        B["TradingView<br/>Lightweight Charts v4"]
        C["TanStack Query<br/>Cache Layer"]
    end

    subgraph Vercel["Vercel Edge (Mumbai)"]
        D["Next.js SSR<br/>+ API Routes (BFF)"]
    end

    subgraph Backend["Hetzner VPS / Railway"]
        E["FastAPI<br/>Python 3.12+"]
        F["Polars Engine<br/>Indicator Computation"]
        G["uvicorn + gunicorn<br/>ASGI Server"]
    end

    subgraph Data["Data Layer"]
        H["Supabase<br/>PostgreSQL + Auth"]
        I["Redis 7<br/>Scanner Cache"]
    end

    subgraph Sources["Data Sources (Free)"]
        J["tejhq/indian-markets<br/>HuggingFace Parquet"]
        K["vishnun0027/ohlcv<br/>HuggingFace Parquet"]
        L["bfinance SDK<br/>Fundamentals"]
        M["jugaad-data<br/>Backup NSE Data"]
    end

    subgraph Monitoring["Observability"]
        N["Sentry<br/>Error Tracking"]
        O["PostHog<br/>Analytics"]
    end

    A --> C --> D
    B --> A
    D -->|REST API calls| E
    E --> F
    E --> G
    E --> H
    E --> I
    F -->|Daily pipeline| J
    F -->|Per-symbol charts| K
    E -->|Fundamentals| L
    E -->|Fallback| M
    E --> N
    D --> N
    A --> O
```

---

## 1. Frontend

### Core Framework: Next.js 14+ (App Router)

| Attribute | Detail |
|---|---|
| **Version** | 14.x+ with App Router (`app/` directory) |
| **React** | 18.3.x |
| **Rendering** | SSR for public pages (`/stock/:symbol`, `/scanners/:slug`) for SEO. CSR for authenticated pages (`/watchlists`, `/settings`). |
| **Package Manager** | pnpm (fast installs, strict dependency resolution, disk efficient) |

**Rationale:**
- App Router provides server components for SEO-critical pages (stock detail, scanner results show up in Google).
- React Server Components reduce client bundle — scanner result tables render on the server.
- Edge Runtime on Vercel Mumbai node = low-latency SSR for Indian users.
- Alternative considered: **Remix** — less mature ecosystem, smaller community in India. **SvelteKit** — team expertise is React-based.

### Styling: Tailwind CSS

| Attribute | Detail |
|---|---|
| **Version** | 3.4+ |
| **Config** | Custom colour palette matching TRADESCOUT brand. Dark mode via `class` strategy. |
| **Plugins** | `@tailwindcss/typography` (prose styling for notes), `tailwind-animate` (animation utilities) |

**Rationale:**
- Utility-first approach = fast iteration on UI.
- Dark mode with `class` strategy allows runtime toggling via `stc-theme` localStorage key.
- Purge ensures < 10KB CSS in production.
- Alternative considered: **CSS Modules** — more boilerplate, slower iteration.

### UI Components: Radix UI (Headless)

| Attribute | Detail |
|---|---|
| **Package** | `@radix-ui/react-*` (individual primitives) |
| **Components Used** | Dialog, Dropdown Menu, Popover, Select, Tabs, Toggle, Tooltip, Toast, ScrollArea, Accordion |
| **Styling** | Unstyled primitives + Tailwind classes applied directly |

**Rationale:**
- Headless = no design opinions baked in. Full control over look and feel.
- WAI-ARIA compliant out of the box → WCAG 2.1 AA with zero extra work.
- Keyboard navigation, focus management, screen reader support included.
- Alternative considered: **shadcn/ui** — uses Radix under the hood, but adds opinionated styling. We may adopt shadcn's copy-paste model for specific complex components (Command palette, Data table).

### Animations: Framer Motion

| Attribute | Detail |
|---|---|
| **Version** | 11.x+ |
| **Usage** | Page transitions, scanner result list animations (`AnimatePresence`), skeleton loading shimmer, heatmap cell hover effects, RRG trail animation |

**Rationale:**
- Declarative API, Spring-based physics for natural feel.
- `layout` animations for list reordering (watchlist drag-and-drop).
- `AnimatePresence` for exit animations (modal close, filter changes).
- Alternative considered: **GSAP** — more powerful but heavier, better for complex timeline animations. Framer Motion is sufficient and more React-idiomatic.

### Data Fetching: TanStack React Query

| Attribute | Detail |
|---|---|
| **Version** | 5.x |
| **Config** | `staleTime: 5 * 60 * 1000` (5 min for scanner data), `gcTime: 30 * 60 * 1000` (30 min garbage collection) |
| **Features Used** | `useQuery`, `useInfiniteQuery` (paginated scanner results), `useMutation` (watchlist CRUD), `queryClient.prefetchQuery` (route prefetching) |

**Rationale:**
- Automatic caching, deduplication, background refetching.
- Optimistic updates for watchlist add/remove (instant UI feedback).
- Prefetching on hover → scanner results ready by the time user clicks.
- Alternative considered: **SWR** — simpler but less feature-rich. TanStack Query's `useInfiniteQuery` and devtools are critical for scanner pagination.

### Charting: TradingView Lightweight Charts v4

| Attribute | Detail |
|---|---|
| **Package** | `lightweight-charts` v4.2+ |
| **Rendering** | Canvas-based (not SVG → performant for 5+ years of daily candles) |
| **Series Types Used** | `addCandlestickSeries()` — OHLC candlesticks |
|  | `addLineSeries()` — SMA 10/20/50/150/200, EMA 21, RS Line |
|  | `addHistogramSeries()` — Volume bars (green up / red down) |
| **Panes** | Main pane (price + MAs), Volume pane, RSI pane, MACD pane |
| **Interactions** | Crosshair, time scale navigation, zoom, series toggle, pivot line drawing |
| **React Wrapper** | Custom wrapper component using `useEffect` + `useRef` for lifecycle management |

**Rationale:**
- **Free and open source** (Apache 2.0 license).
- Canvas-based rendering handles 2,000+ candles smoothly (vs. SVG-based D3 which struggles past 500).
- Sub-megabyte bundle size (~45KB gzipped).
- Built by TradingView — battle-tested, well-documented.
- Alternative considered: **D3.js** — too low-level, massive implementation effort for financial charts. **Highcharts Stock** — paid license (~$1,000/year). **ApexCharts** — lacks financial chart depth.

### Frontend Package Summary

| Package | Version | Purpose | Bundle Impact |
|---|---|---|---|
| `next` | 14.x | Framework | — (server) |
| `react` | 18.3.x | UI library | ~40KB |
| `tailwindcss` | 3.4+ | Styling | ~8KB (purged) |
| `@radix-ui/react-*` | latest | Accessible components | ~3KB per primitive |
| `framer-motion` | 11.x | Animations | ~30KB |
| `@tanstack/react-query` | 5.x | Data fetching/caching | ~12KB |
| `lightweight-charts` | 4.2+ | Financial charts | ~45KB |
| `@sentry/nextjs` | 8.x | Error tracking | ~15KB |
| `posthog-js` | latest | Analytics | ~8KB |

---

## 2. Backend

### Framework: Python FastAPI

| Attribute | Detail |
|---|---|
| **Version** | 0.115+ |
| **Python** | 3.12+ |
| **Validation** | Pydantic v2 (compiled validators, 5–50x faster than v1) |
| **ASGI Server** | uvicorn (development), gunicorn + uvicorn workers (production) |
| **API Docs** | Auto-generated OpenAPI 3.1 at `/docs` (Swagger) and `/redoc` |

**Rationale:**
- FastAPI + Pydantic v2 is the fastest Python API framework (benchmarks: ~15,000 req/s on a single core for JSON serialisation).
- Type hints → auto-generated OpenAPI docs → frontend team can generate TypeScript types.
- Async support for non-blocking I/O (Supabase queries, Redis reads).
- Pydantic v2 `422` error schema matches the PRD's error contract exactly.
- Alternative considered: **Django REST Framework** — too heavy, ORM overhead unnecessary (we use Supabase directly). **Flask** — no async, no auto-validation. **Node.js (Express/Fastify)** — Python ecosystem is stronger for data/numerical computation (Polars).

### Data Computation: Polars

| Attribute | Detail |
|---|---|
| **Version** | 1.x+ |
| **Usage** | All indicator calculations (SMA, EMA, RSI, MACD, RS Rating), scanner filtering, stage classification, VCP detection |
| **Data Format** | Reads Parquet files directly from Hugging Face (zero conversion step) |
| **Performance** | Vectorised operations on Apache Arrow columnar format. 10–50x faster than Pandas for large datasets. |

**Rationale:**
- **NOT Pandas.** Polars is chosen deliberately:
  - 34.3 million rows in `tejhq/indian-markets` — Pandas would require 4–8GB RAM and 30+ seconds. Polars handles it in < 2 seconds with lazy evaluation.
  - Native Parquet support (zero-copy reads).
  - Rust-powered, multi-threaded by default.
  - Expression-based API is more composable than Pandas' method chaining.
- Scanner pipeline: Load Parquet → Lazy frame → Filter (Stage 2, RS > 80, etc.) → Compute indicators → Collect → Serialize to JSON → Cache in Redis.
- Alternative considered: **Pandas** — too slow for 34M rows, single-threaded. **DuckDB** — strong SQL interface but less flexible for custom indicator logic. May add DuckDB later for ad-hoc user queries.

### Backend Package Summary

| Package | Version | Purpose |
|---|---|---|
| `fastapi` | 0.115+ | Web framework |
| `pydantic` | 2.x | Request/response validation |
| `uvicorn` | 0.30+ | ASGI server |
| `gunicorn` | 22+ | Process manager (production) |
| `polars` | 1.x+ | Data computation engine |
| `redis` | 5.x (Python client) | Cache interaction |
| `supabase-py` | 2.x | Supabase client (auth, DB) |
| `httpx` | 0.27+ | Async HTTP client (HuggingFace API) |
| `bfinance` | latest | Fundamental data SDK |
| `jugaad-data` | latest | Backup NSE data |
| `sentry-sdk` | 2.x | Error tracking |
| `ruff` | 0.6+ | Linting + formatting |
| `pytest` | 8.x | Testing |
| `pytest-asyncio` | latest | Async test support |

---

## 3. Data Sources

> **ZERO web scraping. ZERO paid APIs. 100% free, open, legal data sources.**

### 3.1 `tejhq/indian-markets` (Hugging Face Parquet)

| Attribute | Detail |
|---|---|
| **URL** | `https://huggingface.co/datasets/tejhq/indian-markets` |
| **Size** | 34.3 million rows (and growing) |
| **Partitioning** | Year-partitioned: `nse/year=2026/nse_2026.parquet` |
| **Update Frequency** | Daily (automated) |
| **Purpose** | Full-market daily scans. Compute all scanner fields across the entire NSE universe. |

**Columns:**

| Column | Type | Notes |
|---|---|---|
| `date` | `date` | Trading date |
| `symbol` | `str` | NSE symbol |
| `series` | `str` | EQ, BE, etc. |
| `isin` | `str` | ISIN code |
| `name` | `str` | Company name |
| `open` | `f64` | Open price |
| `high` | `f64` | High price |
| `low` | `f64` | Low price |
| `close` | `f64` | Close price |
| `last` | `f64` | Last traded price |
| `prev_close` | `f64` | Previous close |
| `volume` | `i64` | Traded volume |
| `turnover` | `f64` | Turnover (₹) |
| `trades` | `i64` | Number of trades |

**Delivery Data Columns (separate partition):**

| Column | Type | Notes |
|---|---|---|
| `delivery_pct` | `f64` | Delivery as % of traded quantity |

**Data Pipeline:**

```mermaid
flowchart LR
    A["Hugging Face<br/>tejhq/indian-markets"] -->|"httpx download<br/>(year partition)"| B["Polars Lazy Frame"]
    B -->|"Filter: series='EQ'<br/>+ last 300 sessions"| C["Indicator Engine"]
    C -->|"SMA, EMA, RSI,<br/>MACD, RS Rating,<br/>Stage Classification"| D["Scanner Results<br/>(JSON)"]
    D -->|"SET scanner:{slug}"| E["Redis 7"]
    E -->|"GET /api/scanners/:slug"| F["FastAPI Response"]
```

### 3.2 `vishnun0027/indian-market-historical-ohlcv` (Hugging Face Parquet)

| Attribute | Detail |
|---|---|
| **URL** | `https://huggingface.co/datasets/vishnun0027/indian-market-historical-ohlcv` |
| **Structure** | 2,675 individual per-symbol Parquet files |
| **Update Frequency** | Daily (via GitHub Actions) |
| **Purpose** | Per-symbol historical charts on `/stock/:symbol` page. 10+ years of daily OHLCV. |

**Columns:**

| Column | Type | Notes |
|---|---|---|
| `date` | `date` | Trading date |
| `open` | `f64` | Open |
| `high` | `f64` | High |
| `low` | `f64` | Low |
| `close` | `f64` | Close |
| `adj_close` | `f64` | Adjusted close (splits, dividends) |
| `volume` | `i64` | Volume |
| `dividends` | `f64` | Dividend amount |
| `stock_splits` | `f64` | Split ratio |
| `symbol` | `str` | NSE symbol |

**Usage:** When a user opens `/stock/RELIANCE`, the backend fetches `RELIANCE.parquet` from this dataset, computes chart overlays (SMA, EMA) on the fly via Polars, and returns JSON OHLCV data to the frontend Lightweight Charts component.

### 3.3 `bfinance` Python SDK

| Attribute | Detail |
|---|---|
| **Package** | `pip install bfinance` |
| **Data** | 10-year quarterly financials, P&L, balance sheet, cash flow, earnings concall transcripts, shareholding patterns |
| **Purpose** | Fundamentals tab on `/stock/:symbol`. Earnings calendar at `/results`. |
| **Pricing** | Free (open-source SDK) |

**Data Available:**

- Revenue, PAT, EPS (quarterly + annual)
- P/E, P/B, ROE, ROCE, D/E
- Promoter / FII / DII / Public shareholding with quarterly trends
- Earnings call transcripts (select companies)
- Board meeting dates, dividend history

### 3.4 `jugaad-data` (Backup)

| Attribute | Detail |
|---|---|
| **Package** | `pip install jugaad-data` |
| **Data** | Direct NSE Bhavcopy download, index data |
| **Purpose** | Fallback data source if Hugging Face datasets go offline or are delayed |
| **Usage** | Only activated if primary source fails. Health check cron runs at 4:30 PM IST. |

---

## 4. Database & Authentication

### Supabase (PostgreSQL + Auth + RLS)

| Attribute | Detail |
|---|---|
| **Tier** | Free (up to 500MB, 2 projects) → Pro ($25/mo) when scaling |
| **PostgreSQL** | 15.x |
| **Auth** | Supabase Auth (email + password, Google OAuth 2.0) |
| **Realtime** | Not used initially (polling for now; WebSocket for future intraday feature) |
| **Storage** | Not used (no file uploads in v1) |

#### Database Schema

```sql
-- User profile (extends Supabase auth.users)
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    display_name TEXT,
    subscription_tier TEXT DEFAULT 'free' CHECK (subscription_tier IN ('free', 'premium')),
    subscription_expires_at TIMESTAMPTZ,
    razorpay_customer_id TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Watchlists
CREATE TABLE watchlists (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Watchlist items (stocks in a watchlist)
CREATE TABLE watchlist_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    watchlist_id UUID NOT NULL REFERENCES watchlists(id) ON DELETE CASCADE,
    symbol TEXT NOT NULL,
    sort_order INT DEFAULT 0,
    added_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(watchlist_id, symbol)
);

-- Favourites (quick-access separate from watchlists)
CREATE TABLE favourites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    symbol TEXT NOT NULL,
    added_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, symbol)
);

-- Chart drawings (saved pivot lines, trendlines, etc.)
CREATE TABLE chart_drawings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    symbol TEXT NOT NULL,
    drawing_type TEXT NOT NULL, -- 'horizontal_line', 'trendline', 'rectangle'
    data JSONB NOT NULL,       -- {price, time_start, time_end, color, ...}
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Saved custom scans
CREATE TABLE saved_scans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    conditions JSONB NOT NULL,  -- [{field, operator, value}, ...]
    is_public BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- UI preferences
CREATE TABLE ui_prefs (
    user_id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
    theme TEXT DEFAULT 'dark',          -- 'dark' | 'light'
    default_chart_period TEXT DEFAULT '1y',
    default_scanner TEXT DEFAULT 'trend-template',
    chart_overlays JSONB DEFAULT '["sma50","sma200"]',
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### Row-Level Security (RLS) Policies

```sql
-- Users can only read/write their own data
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own profile"
    ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile"
    ON profiles FOR UPDATE USING (auth.uid() = id);

ALTER TABLE watchlists ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can CRUD own watchlists"
    ON watchlists FOR ALL USING (auth.uid() = user_id);

ALTER TABLE watchlist_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can CRUD own watchlist items"
    ON watchlist_items FOR ALL
    USING (watchlist_id IN (
        SELECT id FROM watchlists WHERE user_id = auth.uid()
    ));

ALTER TABLE favourites ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can CRUD own favourites"
    ON favourites FOR ALL USING (auth.uid() = user_id);

ALTER TABLE chart_drawings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can CRUD own drawings"
    ON chart_drawings FOR ALL USING (auth.uid() = user_id);

ALTER TABLE saved_scans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can CRUD own scans"
    ON saved_scans FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Anyone can read public scans"
    ON saved_scans FOR SELECT USING (is_public = TRUE);

ALTER TABLE ui_prefs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can CRUD own prefs"
    ON ui_prefs FOR ALL USING (auth.uid() = user_id);
```

**Rationale:**
- Supabase gives us PostgreSQL, Auth, and RLS in one managed service — no need to build auth from scratch.
- Free tier is sufficient for MVP (< 500MB for user data — stock data lives in Parquet/Redis, not PostgreSQL).
- RLS ensures a user can never access another user's watchlists or drawings, even if the API has a bug.
- Alternative considered: **Firebase** — NoSQL is a poor fit for relational user data (watchlist → items). **PlanetScale** — MySQL, no built-in auth. **Neon** — excellent serverless PG but no auth built in.

---

## 5. Caching

### Redis 7

| Attribute | Detail |
|---|---|
| **Version** | 7.x |
| **Hosting** | Self-hosted on Hetzner VPS (same machine as FastAPI) or Railway Redis add-on |
| **Memory** | ~256MB sufficient (scanner JSON cache for 7 scans × ~2,000 results × ~2KB each ≈ 28MB) |

#### Cache Strategy

| Key Pattern | Data | TTL | Invalidation |
|---|---|---|---|
| `scanner:{slug}` | Pre-computed scanner results JSON | 24 hours | Invalidated at 4:30 PM IST daily (post-market pipeline) |
| `warmup:latest` | Market warmup data | 24 hours | Invalidated daily |
| `stock:{symbol}:metrics` | Per-stock computed metrics | 24 hours | Invalidated daily |
| `stock:{symbol}:chart:{period}` | OHLCV chart data | 24 hours | Invalidated daily |
| `heatmap:{period}:{group}` | Heatmap data | 24 hours | Invalidated daily |
| `rrg:latest` | RRG sector data | 7 days | Invalidated weekly (RRG is weekly data) |
| `groups:rankings` | Sector RS rankings | 24 hours | Invalidated daily |
| `leaders:top` | RS leaders list | 24 hours | Invalidated daily |
| `results:calendar` | Earnings calendar | 12 hours | Shorter TTL — earnings dates change |

#### Cache Invalidation Pipeline

```mermaid
flowchart LR
    A["Market Close<br/>3:30 PM IST"] -->|"Wait 60 min<br/>for data update"| B["GitHub Actions<br/>Cron: 4:30 PM IST"]
    B -->|"Trigger"| C["FastAPI<br/>/api/internal/refresh"]
    C -->|"1. Download latest<br/>Parquet partitions"| D["Polars Pipeline"]
    D -->|"2. Compute all<br/>scanner results"| E["Scanner JSONs"]
    E -->|"3. SET scanner:*"| F["Redis 7"]
    C -->|"4. Compute warmup,<br/>heatmap, RRG"| F
    F -->|"5. Stale keys<br/>auto-expire"| G["Fresh data<br/>ready by 4:45 PM"]
```

**Rationale:**
- Redis is the simplest, fastest cache for JSON blobs. Scanner results are pre-computed and serialized — no query needed at request time.
- 24-hour TTL with explicit invalidation = fresh data after market close, zero computation during market hours.
- Alternative considered: **Memcached** — no persistence, no pub/sub. **Cloudflare KV** — adds external dependency. **In-memory dict** — lost on restart, can't share across gunicorn workers.

---

## 6. Hosting & Deployment

### Frontend: Vercel

| Attribute | Detail |
|---|---|
| **Plan** | Hobby (free) → Pro ($20/mo) at scale |
| **Edge Network** | Mumbai (ap-south-1) edge node for Indian users |
| **Build** | `pnpm build` → Next.js static + SSR output |
| **Environment** | `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SENTRY_DSN` |

**Rationale:**
- Vercel is the native hosting platform for Next.js — zero-config deployment.
- Edge network with Mumbai PoP = < 50ms TTFB for Indian users.
- Preview deployments on every PR for design review.
- Alternative considered: **Cloudflare Pages** — excellent but less Next.js-native (adapter required). **Netlify** — good but Vercel has better App Router support. **Self-hosted** — unnecessary ops burden for a frontend.

### Backend: Hetzner VPS (Primary) or Railway (Alternative)

#### Option A: Hetzner VPS (Recommended)

| Attribute | Detail |
|---|---|
| **Plan** | CX22 — 2 vCPU, 4GB RAM, 40GB SSD |
| **Location** | Helsinki (cheapest) or Falkenstein. No India DC, but latency is acceptable (< 200ms with Redis cache). |
| **Cost** | €4.49/mo (~₹400/mo) |
| **Setup** | Docker Compose: FastAPI + Redis + PostgreSQL (dev) on single VPS |

#### Option B: Railway (Alternative)

| Attribute | Detail |
|---|---|
| **Plan** | Hobby ($5/mo included credit) |
| **Setup** | Separate services: FastAPI, Redis add-on |
| **Cost** | ~$5–10/mo (~₹400–₹800/mo) |
| **Advantage** | Zero-ops deployment (git push → deploy) |

**Rationale:**
- Hetzner is the best price-to-performance VPS provider globally. A €4.49 box runs FastAPI + Redis comfortably.
- For an MVP with < 5,000 DAU, a single VPS is sufficient. Horizontal scaling comes later.
- Railway as fallback for devs who prefer zero-ops (no SSH, no Docker management).
- Alternative considered: **AWS EC2** — overkill, expensive for a solo project. **DigitalOcean** — 2x the cost of Hetzner. **Fly.io** — good but unpredictable pricing.

### Deployment Topology

```mermaid
flowchart TD
    subgraph User["Indian Retail Trader"]
        A["Browser / Mobile"]
    end

    subgraph Vercel["Vercel CDN"]
        B["Edge: Mumbai<br/>Next.js SSR + Static"]
    end

    subgraph Hetzner["Hetzner VPS (CX22)"]
        C["Docker: FastAPI<br/>Port 8000"]
        D["Docker: Redis 7<br/>Port 6379"]
    end

    subgraph Supabase["Supabase Cloud"]
        E["PostgreSQL<br/>(User Data)"]
        F["Auth<br/>(JWT Tokens)"]
    end

    A -->|HTTPS| B
    B -->|REST API| C
    C --> D
    C --> E
    A -->|Auth Redirect| F
    F -->|JWT| C
```

---

## 7. Error Monitoring & Observability

### Sentry

| Attribute | Detail |
|---|---|
| **Frontend** | `@sentry/nextjs` v8 — automatic error boundary, performance tracing, session replay |
| **Backend** | `sentry-sdk[fastapi]` — exception capture, transaction tracing, Polars pipeline monitoring |
| **Plan** | Developer (free: 5K errors/mo, 10K transactions/mo) |

**Configuration:**

```python
# api/main.py
import sentry_sdk
sentry_sdk.init(
    dsn=os.environ["SENTRY_DSN"],
    traces_sample_rate=0.2,  # 20% of transactions
    profiles_sample_rate=0.1,  # 10% of profiled transactions
    environment=os.environ.get("ENV", "development"),
)
```

```typescript
// web/sentry.client.config.ts
import * as Sentry from "@sentry/nextjs";
Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 0.2,
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
});
```

### PostHog (Product Analytics)

| Attribute | Detail |
|---|---|
| **Hosting** | Cloud (free: 1M events/mo) |
| **Usage** | Event tracking (`scanner_run`, `stock_viewed`, `watchlist_created`, etc.), funnel analysis, feature flags |

---

## 8. Design System & Typography

### Font: Hanken Grotesk

| Attribute | Detail |
|---|---|
| **Source** | Google Fonts via `next/font/google` (zero CLS, self-hosted) |
| **Weights** | 400 (body), 500 (labels), 600 (subheadings), 700 (headings) |
| **Fallback** | `system-ui, -apple-system, sans-serif` |

```typescript
// web/app/layout.tsx
import { Hanken_Grotesk } from 'next/font/google';

const hanken = Hanken_Grotesk({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-hanken',
  display: 'swap',
});
```

**Rationale:**
- Hanken Grotesk is a modern, geometric sans-serif that reads well in data-dense UIs.
- ScanTheCharts.com uses it — maintaining visual parity with the inspiration product.
- `next/font/google` self-hosts the font = zero external requests, no FOUT.

### Theme

| Token | Dark (Default) | Light |
|---|---|---|
| `--bg-primary` | `#0a0a0f` | `#ffffff` |
| `--bg-secondary` | `#141420` | `#f5f5f7` |
| `--bg-card` | `#1c1c2e` | `#ffffff` |
| `--text-primary` | `#e4e4e7` | `#18181b` |
| `--text-secondary` | `#a1a1aa` | `#71717a` |
| `--accent` | `#6366f1` (Indigo) | `#4f46e5` |
| `--success` | `#22c55e` | `#16a34a` |
| `--danger` | `#ef4444` | `#dc2626` |
| `--border` | `#27272a` | `#e4e4e7` |

Theme toggle persisted via `localStorage.setItem('stc-theme', 'dark' | 'light')`.

CSS class `dark` applied to `<html>` element for Tailwind's dark mode.

---

## 9. CI/CD

### GitHub Actions

#### Workflows

| Workflow | Trigger | Steps |
|---|---|---|
| `ci-web.yml` | Push/PR to `web/**` | pnpm install → lint (ESLint) → type-check (tsc) → build → Lighthouse CI |
| `ci-api.yml` | Push/PR to `api/**` | pip install → lint (Ruff) → type-check (mypy) → pytest |
| `deploy-web.yml` | Push to `main` (web changes) | Vercel CLI deploy (production) |
| `deploy-api.yml` | Push to `main` (api changes) | SSH → docker compose pull → docker compose up -d |
| `data-refresh.yml` | Cron: `30 11 * * 1-5` (UTC = 5:00 PM IST) | POST `/api/internal/refresh` → validate cache → Slack/Telegram notification |
| `e2e.yml` | Weekly (Saturday) | Playwright E2E tests against staging |

#### Branch Strategy

```
main          ← Production. Auto-deploys.
├── dev       ← Integration branch. PR target for feature branches.
│   ├── feat/scanner-engine
│   ├── feat/stock-detail
│   └── fix/rs-rating-calc
```

---

## 10. Developer Tooling

### Local Development Stack

```yaml
# docker-compose.yml
services:
  postgres:
    image: postgres:15-alpine
    ports: ["5432:5432"]
    environment:
      POSTGRES_DB: tradescout
      POSTGRES_USER: tradescout
      POSTGRES_PASSWORD: tradescout_dev
    volumes:
      - pgdata:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    ports: ["6379:6379"]

  api:
    build: ./api
    ports: ["8000:8000"]
    environment:
      DATABASE_URL: postgresql://tradescout:tradescout_dev@postgres:5432/tradescout
      REDIS_URL: redis://redis:6379
      SUPABASE_URL: ${SUPABASE_URL}
      SUPABASE_SERVICE_KEY: ${SUPABASE_SERVICE_KEY}
    depends_on: [postgres, redis]
    volumes:
      - ./api:/app
    command: uvicorn main:app --reload --host 0.0.0.0 --port 8000

volumes:
  pgdata:
```

### Linting & Formatting

| Tool | Scope | Config |
|---|---|---|
| **Ruff** | Python (api/) | `ruff.toml` — replaces Black, isort, flake8, pyflakes in one tool. ~100x faster. |
| **ESLint** | TypeScript (web/) | `eslint.config.js` — flat config, Next.js plugin |
| **Prettier** | TypeScript, CSS, JSON | `.prettierrc` — consistent formatting |
| **mypy** | Python type checking | `mypy.ini` — strict mode |
| **TypeScript** | Frontend type checking | `tsconfig.json` — strict mode |

### Package Managers

| Manager | Scope | Rationale |
|---|---|---|
| **pnpm** | `web/` (Node.js) | 2x faster than npm, strict peer deps, content-addressable store |
| **pip** + **venv** | `api/` (Python) | Simple. `requirements.txt` + `requirements-dev.txt`. Poetry/PDM considered overkill for this project size. |

---

## 11. Cost Estimate

### Monthly Running Cost (MVP)

| Service | Plan | Monthly Cost (₹) |
|---|---|---|
| **Vercel** | Hobby (Free) | ₹0 |
| **Hetzner VPS** (CX22) | 2 vCPU / 4GB / 40GB | ~₹400 |
| **Supabase** | Free (500MB) | ₹0 |
| **Redis** | Self-hosted on Hetzner | ₹0 (included) |
| **Sentry** | Developer (Free) | ₹0 |
| **PostHog** | Cloud Free (1M events) | ₹0 |
| **NSE Data** | Hugging Face (Free) | ₹0 |
| **bfinance** | Free SDK | ₹0 |
| **Domain** | `.in` domain | ~₹85/mo (₹1,000/yr) |
| **GitHub** | Free (public repo) | ₹0 |
| | **TOTAL** | **₹400 – ₹500/mo** |

### At Scale (5,000+ DAU)

| Service | Plan | Monthly Cost (₹) |
|---|---|---|
| **Vercel** | Pro ($20/mo) | ~₹1,700 |
| **Hetzner VPS** | CX32 (4 vCPU / 8GB) | ~₹800 |
| **Supabase** | Pro ($25/mo) | ~₹2,100 |
| **Redis** | Managed (Upstash or Railway) | ~₹400 |
| **Sentry** | Team ($26/mo) | ~₹2,200 |
| **PostHog** | Cloud Free (still within limits) | ₹0 |
| **Domain** | `.in` | ~₹85 |
| | **TOTAL** | **~₹7,300/mo (~$87)** |

---

## 12. Decision Log

Architectural Decision Records (ADRs) for key choices.

### ADR-001: Polars over Pandas

| Attribute | Detail |
|---|---|
| **Date** | November 2026 |
| **Status** | Accepted |
| **Context** | Need to compute 100+ indicator fields across 34.3M rows (full NSE history) daily. |
| **Decision** | Use Polars with lazy evaluation for all data computation. |
| **Consequences** | +10–50x faster than Pandas. +Native Parquet support. −Smaller community, fewer StackOverflow answers. −Team needs to learn expression-based API. |

### ADR-002: Supabase over Self-hosted PostgreSQL

| Attribute | Detail |
|---|---|
| **Date** | November 2026 |
| **Status** | Accepted |
| **Context** | Need auth, a relational DB, and row-level security for user data. |
| **Decision** | Use Supabase managed service (PostgreSQL + Auth + RLS). |
| **Consequences** | +Zero auth implementation effort. +RLS built-in. +Free tier sufficient for MVP. −Vendor lock-in for auth. −Must stay within free tier row limits. |

### ADR-003: Hugging Face Parquet over NSE APIs

| Attribute | Detail |
|---|---|
| **Date** | November 2026 |
| **Status** | Accepted |
| **Context** | NSE website blocks scrapers. Paid APIs cost ₹5,000–₹20,000/yr. Need daily OHLCV for all NSE stocks. |
| **Decision** | Use `tejhq/indian-markets` and `vishnun0027/indian-market-historical-ohlcv` from Hugging Face. |
| **Consequences** | +₹0 data cost. +Parquet format = optimal for Polars. +Updated daily by community. −Dependency on third-party dataset maintainers. −`jugaad-data` as fallback mitigates this. |

### ADR-004: TradingView Lightweight Charts over D3.js

| Attribute | Detail |
|---|---|
| **Date** | November 2026 |
| **Status** | Accepted |
| **Context** | Need candlestick charts with SMA, EMA, RSI, MACD, volume overlays. Must handle 2,000+ candles smoothly. |
| **Decision** | Use TradingView Lightweight Charts v4 (Canvas-based, Apache 2.0 license). |
| **Consequences** | +45KB bundle, handles 5,000 candles. +Built-in crosshair, zoom, pan. +Financial-chart-native API. −Less customisable than D3 for non-standard visualisations. −RRG chart will need a separate Canvas/SVG implementation. |

### ADR-005: FastAPI over Django REST Framework

| Attribute | Detail |
|---|---|
| **Date** | November 2026 |
| **Status** | Accepted |
| **Context** | Backend serves pre-computed JSON from Redis, validates queries, proxies to Supabase. Minimal ORM needs. |
| **Decision** | Use FastAPI + Pydantic v2. No ORM. Direct Supabase client. |
| **Consequences** | +15,000 req/s throughput. +Auto-generated OpenAPI docs. +Async support. −No admin panel (unnecessary). −No migration tool (Supabase handles migrations). |

### ADR-006: Redis over CDN Edge Cache

| Attribute | Detail |
|---|---|
| **Date** | November 2026 |
| **Status** | Accepted |
| **Context** | Scanner results are computed daily and served identically to all users (except premium gating). |
| **Decision** | Pre-compute all scanner results into Redis JSON blobs. Serve directly from Redis on each API call. |
| **Consequences** | +Sub-millisecond reads. +Simple invalidation (daily cron). +No CDN configuration complexity. −Requires Redis on the same network as FastAPI. −Memory-bound (but 256MB is plenty). |

---

*Document maintained by Vansh Panchal. Updated as architectural decisions evolve.*
