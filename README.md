<p align="center">
  <img src="docs/assets/logo.png" alt="TRADESCOUT Logo" width="120" />
</p>

<h1 align="center">TRADESCOUT</h1>

<p align="center">
  <strong>Scout the best trade setups — before the crowd.</strong>
</p>

<p align="center">
  NSE stock screening & market analysis platform for Indian retail swing traders.
  <br />
  Inspired by <a href="https://scanthecharts.com">ScanTheCharts.com</a> · Built for the Indian market.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-14+-black?logo=nextdotjs" alt="Next.js" />
  <img src="https://img.shields.io/badge/FastAPI-0.115+-009688?logo=fastapi" alt="FastAPI" />
  <img src="https://img.shields.io/badge/Polars-1.x-orange?logo=polars" alt="Polars" />
  <img src="https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?logo=supabase" alt="Supabase" />
  <img src="https://img.shields.io/badge/Redis-7-DC382D?logo=redis" alt="Redis" />
  <img src="https://img.shields.io/badge/License-MIT-blue" alt="License" />
  <img src="https://img.shields.io/badge/Data-₹0%20Free-green" alt="Free Data" />
</p>

> [!IMPORTANT]
> **Regulatory Disclaimer:** TRADESCOUT is an educational research and technical market screening platform. It is NOT a SEBI-registered investment advisor or research analyst. All stock screeners, metrics, and chart setups are strictly for educational and informational purposes. Trading and investing in securities are subject to market risks.

---

## Architecture

```mermaid
flowchart TD
    subgraph Client["🖥️ Client"]
        A["Next.js 14 App Router<br/>React 18.3 · Tailwind · Radix UI"]
        B["TradingView Lightweight Charts v4"]
    end

    subgraph Edge["⚡ Vercel Edge (Mumbai)"]
        C["SSR + Static Pages<br/>Edge Functions"]
    end

    subgraph Backend["🐍 Backend (Hetzner VPS)"]
        D["FastAPI + Pydantic v2"]
        E["Polars Engine<br/>34M+ rows processing"]
        F["Redis 7 Cache"]
    end

    subgraph Data["📊 Data Sources (Free)"]
        G["tejhq/indian-markets<br/>HuggingFace Parquet · 34.3M rows"]
        H["vishnun0027/ohlcv<br/>2,675 per-symbol files"]
        I["bfinance SDK<br/>Fundamentals + Financials"]
    end

    subgraph DB["🗄️ Supabase"]
        J["PostgreSQL + Auth + RLS"]
    end

    A --> B
    A --> C
    C -->|REST API| D
    D --> E
    D --> F
    E --> G
    E --> H
    D --> I
    D --> J
```

---

## Features

### 📊 Market Warmup (`/warmup`)
Daily pre-market briefing with market participation gauges, RME sentiment meter, Stage 2 vs. 4 distribution, breakout health ratio, and auto-generated daily cues.

> *Screenshot: `docs/screenshots/warmup.png`*

### 🔍 Scanners (`/scanners`)
Seven pre-built scanners + a custom scanner builder with 100+ data fields:

| Scanner | Description |
|---|---|
| **Trend Template** | Minervini's 8-point checklist for Stage 2 uptrends |
| **Recent Breakout** | Stocks that broke out in the last 5 sessions |
| **4% Breakout** | 4%+ moves on above-average volume |
| **High Volume** | Unusual volume activity (> 2x avg) |
| **1M Gainers** | Top performers over 21 sessions |
| **Near Pivot** | Stocks within 5% of a buy point |
| **VCP** | Volatility Contraction Patterns |

> *Screenshot: `docs/screenshots/scanners.png`*

### 📈 Stock Detail (`/stock/:symbol`)
Full-featured charting with candlesticks, SMA 10/20/50/150/200, EMA, RSI, MACD, volume histogram, pivot lines, tight areas, inside bars, and RS Line. Plus fundamentals, financials, concalls, and personal notes.

> *Screenshot: `docs/screenshots/stock-detail.png`*

### 📋 Watchlists (`/watchlists`)
Create, organise, and track your stock lists with quick-preview charts and key metrics.

### 🏭 Groups & Sectors (`/groups`)
Industry group RS rankings, sector rotation analysis, and drill-down to constituent stocks.

### 🗺️ Heatmap (`/heatmap`)
Market-cap-weighted treemap visualisation of the Nifty 500. Toggle 1D / 1W / 1M / 3M / YTD returns.

### 🔄 Relative Rotation Graph (`/rrg`)
Four-quadrant RRG plotting sectors in Leading / Weakening / Lagging / Improving quadrants with configurable trail length.

### 🏆 Leaders (`/leaders`)
Top RS-rated stocks, sector leaders, and new 52-week highs.

### 📅 Earnings Calendar (`/results`)
Upcoming and past earnings dates. Filter by your watchlists.

### 📰 News & Catalysts (`/news`)
Market-moving catalysts: block deals, board meetings, SEBI actions.

### ⚡ Intraday (`/intraday`) — Premium
Live market breadth, intraday charts, and breakout alerts during market hours.

---

## Quick Start

### Prerequisites

- **Node.js** 20+ and **pnpm** 9+
- **Python** 3.12+ and **pip**
- **Docker** and **Docker Compose**
- A [Supabase](https://supabase.com) project (free tier)

### 1. Clone the Repository

```bash
git clone https://github.com/vanshpanchal/tradescout.git
cd tradescout
```

### 2. Start Infrastructure (PostgreSQL + Redis)

```bash
docker compose up -d
```

This starts:
- PostgreSQL 15 on port `5432`
- Redis 7 on port `6379`

### 3. Configure Environment Variables

```bash
# Backend
cp api/.env.example api/.env
```

Edit `api/.env`:

```env
DATABASE_URL=postgresql://tradescout:tradescout_dev@localhost:5432/tradescout
REDIS_URL=redis://localhost:6379
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your-service-role-key
SENTRY_DSN=your-sentry-dsn
ENV=development
```

```bash
# Frontend
cp web/.env.example web/.env.local
```

Edit `web/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_SENTRY_DSN=your-sentry-dsn
```

### 4. Install Dependencies & Run

**Backend (FastAPI):**

```bash
cd api
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

API docs available at: http://localhost:8000/docs

**Frontend (Next.js):**

```bash
cd web
pnpm install
pnpm dev
```

App available at: http://localhost:3000

### 5. Seed Data (First Run)

```bash
cd api
python scripts/seed_data.py
```

This downloads the latest Parquet files from Hugging Face, computes scanner results, and populates Redis.

---

## Monorepo Structure

```
TRADESCOUT/
├── api/                          # Python FastAPI backend
│   ├── main.py                   # FastAPI app entry point
│   ├── routers/                  # API route modules
│   │   ├── scanners.py           # /api/scanners/* endpoints
│   │   ├── stocks.py             # /api/stock/* endpoints
│   │   ├── warmup.py             # /api/warmup endpoint
│   │   ├── watchlists.py         # /api/watchlists/* endpoints
│   │   ├── heatmap.py            # /api/heatmap endpoint
│   │   ├── rrg.py                # /api/rrg endpoint
│   │   ├── groups.py             # /api/groups endpoint
│   │   ├── leaders.py            # /api/leaders endpoint
│   │   ├── results.py            # /api/results endpoint
│   │   └── news.py               # /api/news endpoint
│   ├── core/                     # Business logic
│   │   ├── indicators.py         # SMA, EMA, RSI, MACD computations (Polars)
│   │   ├── scanner_engine.py     # Scanner filter + rank logic
│   │   ├── rs_rating.py          # RS Rating calculation
│   │   ├── stage_analysis.py     # Weinstein Stage classification
│   │   ├── vcp_detector.py       # VCP pattern detection
│   │   └── market_breadth.py     # Breadth indicators, RME
│   ├── data/                     # Data pipeline
│   │   ├── hf_downloader.py      # Hugging Face Parquet downloader
│   │   ├── bfinance_client.py    # bfinance SDK wrapper
│   │   └── cache_manager.py      # Redis cache operations
│   ├── models/                   # Pydantic v2 schemas
│   │   ├── scanner.py            # ScannerResult, ScannerMeta
│   │   ├── stock.py              # StockMetrics, ChartData, Fundamentals
│   │   ├── watchlist.py          # Watchlist, WatchlistItem
│   │   └── common.py             # ErrorResponse, PaginatedResponse
│   ├── middleware/                # FastAPI middleware
│   │   ├── auth.py               # Supabase JWT verification
│   │   ├── rate_limit.py         # Rate limiting (free vs. premium)
│   │   └── premium_gate.py       # Premium-only route protection
│   ├── scripts/                  # CLI scripts
│   │   ├── seed_data.py          # Initial data download + cache seed
│   │   └── refresh_cache.py      # Daily cache refresh (called by cron)
│   ├── requirements.txt          # Production dependencies
│   ├── requirements-dev.txt      # Dev dependencies (pytest, mypy, etc.)
│   ├── ruff.toml                 # Ruff linter config
│   ├── mypy.ini                  # Type checking config
│   ├── Dockerfile                # Production Docker image
│   └── .env.example              # Environment variable template
│
├── web/                          # Next.js 14 frontend
│   ├── app/                      # App Router pages
│   │   ├── layout.tsx            # Root layout (Hanken Grotesk, dark mode)
│   │   ├── page.tsx              # Landing page
│   │   ├── warmup/page.tsx       # Market Warmup
│   │   ├── scanners/
│   │   │   ├── page.tsx          # Scanner index
│   │   │   ├── [slug]/page.tsx   # Scanner results
│   │   │   └── custom/page.tsx   # Custom scanner builder
│   │   ├── stock/
│   │   │   └── [symbol]/page.tsx # Stock detail
│   │   ├── watchlists/page.tsx   # Watchlists
│   │   ├── groups/page.tsx       # Sector groups
│   │   ├── heatmap/page.tsx      # Heatmap
│   │   ├── rrg/page.tsx          # Relative Rotation Graph
│   │   ├── leaders/page.tsx      # RS Leaders
│   │   ├── results/page.tsx      # Earnings calendar
│   │   ├── news/page.tsx         # News feed
│   │   ├── intraday/page.tsx     # Intraday (premium)
│   │   ├── screen/page.tsx       # Advanced screener
│   │   ├── settings/page.tsx     # User settings
│   │   ├── login/page.tsx        # Auth: login
│   │   └── signup/page.tsx       # Auth: signup
│   ├── components/               # React components
│   │   ├── charts/
│   │   │   ├── CandlestickChart.tsx   # TradingView LW Charts wrapper
│   │   │   ├── RSLineChart.tsx        # RS Line mini chart
│   │   │   ├── HeatmapTreemap.tsx     # Treemap visualisation
│   │   │   └── RRGChart.tsx           # Relative Rotation Graph
│   │   ├── scanners/
│   │   │   ├── ScannerTable.tsx       # Results table with sorting
│   │   │   ├── ScannerCard.tsx        # Card view for results
│   │   │   └── CustomBuilder.tsx      # Condition builder UI
│   │   ├── warmup/
│   │   │   ├── BreadthGauge.tsx       # Circular participation gauge
│   │   │   ├── RMEMeter.tsx           # Sentiment meter
│   │   │   └── StageDistribution.tsx  # Stage bar chart
│   │   ├── watchlists/
│   │   │   ├── WatchlistPanel.tsx     # List management
│   │   │   └── StockPreview.tsx       # Quick preview card
│   │   ├── layout/
│   │   │   ├── Navbar.tsx             # Top navigation
│   │   │   ├── Sidebar.tsx            # Left sidebar (desktop)
│   │   │   ├── MobileNav.tsx          # Bottom nav (mobile)
│   │   │   └── ThemeToggle.tsx        # Dark/light mode toggle
│   │   └── ui/                        # Radix UI + Tailwind primitives
│   │       ├── Button.tsx
│   │       ├── Dialog.tsx
│   │       ├── Select.tsx
│   │       ├── Tabs.tsx
│   │       └── Toast.tsx
│   ├── lib/                      # Utilities
│   │   ├── api.ts                # API client (fetch wrapper)
│   │   ├── supabase.ts           # Supabase client init
│   │   ├── hooks/                # Custom React hooks
│   │   │   ├── useScanner.ts     # Scanner data hook (React Query)
│   │   │   ├── useStock.ts       # Stock data hook
│   │   │   ├── useWatchlists.ts  # Watchlist CRUD hooks
│   │   │   └── useTheme.ts       # Theme management hook
│   │   └── utils/
│   │       ├── formatters.ts     # Number/date/currency formatting
│   │       └── constants.ts      # Scanner slugs, API paths
│   ├── public/                   # Static assets
│   │   ├── favicon.ico
│   │   └── og-image.png          # Default Open Graph image
│   ├── tailwind.config.ts        # Tailwind + dark mode config
│   ├── next.config.js            # Next.js config
│   ├── tsconfig.json             # TypeScript config
│   ├── package.json
│   ├── pnpm-lock.yaml
│   ├── .env.example
│   └── sentry.client.config.ts   # Sentry frontend config
│
├── infra/                        # Infrastructure
│   ├── docker/
│   │   ├── api.Dockerfile        # FastAPI production image
│   │   └── nginx.conf            # Reverse proxy config (optional)
│   ├── supabase/
│   │   └── migrations/           # SQL migration files
│   │       ├── 001_create_profiles.sql
│   │       ├── 002_create_watchlists.sql
│   │       ├── 003_create_favourites.sql
│   │       ├── 004_create_chart_drawings.sql
│   │       ├── 005_create_saved_scans.sql
│   │       └── 006_create_ui_prefs.sql
│   └── scripts/
│       └── deploy.sh             # Production deployment script
│
├── tests/                        # Tests
│   ├── api/                      # Backend tests (pytest)
│   │   ├── test_scanners.py
│   │   ├── test_indicators.py
│   │   ├── test_rs_rating.py
│   │   └── test_stage_analysis.py
│   ├── web/                      # Frontend tests
│   │   └── e2e/                  # Playwright E2E tests
│   │       ├── scanner.spec.ts
│   │       ├── stock-detail.spec.ts
│   │       └── watchlist.spec.ts
│   └── fixtures/                 # Test data
│       └── sample_ohlcv.parquet
│
├── docs/                         # Documentation
│   ├── assets/
│   │   └── logo.png              # TRADESCOUT logo
│   ├── screenshots/              # Feature screenshots
│   │   ├── warmup.png
│   │   ├── scanners.png
│   │   └── stock-detail.png
│   ├── api-reference.md          # Full API documentation
│   └── data-dictionary.md        # Scanner field definitions
│
├── .github/
│   └── workflows/
│       ├── ci-web.yml            # Frontend CI
│       ├── ci-api.yml            # Backend CI
│       ├── deploy-web.yml        # Frontend deploy
│       ├── deploy-api.yml        # Backend deploy
│       └── data-refresh.yml      # Daily data refresh
│
├── infra/                        # Containerized infrastructure
│   └── docker-compose.yml        # PostgreSQL 16 + Redis 7 + pgAdmin
├── docs/                         # Specifications & Architecture Documents
│   ├── README.md                 # Documentation index & matrix
│   ├── PRD.md                    # Product Requirements Document
│   ├── TechStack.md              # Technology Stack Decisions
│   ├── DesignDocument.md         # Architecture & UI/UX Design
│   ├── API-Spec.md               # Complete REST API specification
│   ├── Backend scheme.md         # Supabase PostgreSQL schema & RLS
│   ├── data-pipeline.md          # Parquet ingestion & calculation engine
│   ├── implementation-plan.md    # 7-phase implementation roadmap
│   ├── Testing-Strategy.md       # Unit, integration & golden test plan
│   ├── Security-and-Scale.md     # Security controls & scale targets
│   ├── environment-setup.md      # Developer onboarding guide
│   └── InterviewLog.md           # Architectural Decision Records (ADRs)
├── research/                     # Reverse-engineering vault & benchmark data
│   ├── README.md                 # Research index & mock usage guide
│   ├── scanthecharts-architecture-teardown.md # Target architecture teardown
│   ├── data-sources-benchmark-report.md       # Parquet & zero-cost data source tests
│   ├── cost-and-resource-breakdown.md         # Funds & infrastructure analysis
│   └── api-fixtures/                          # 24 real JSON payloads from ScanTheCharts
├── .cursorrules                  # AI coding rules
├── .env.example                  # Environment configuration template
├── .gitignore
├── agent.md                      # Agent operating protocol
├── agentrules.md                 # Agent hard constraints
├── CHANGELOG.md                  # Project release ledger
├── CONTRIBUTING.md               # Contributor workflow and standards
├── memory.md                     # Living status board & state
└── README.md                     # ← You are here
```

---

## Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| **Frontend** | Next.js 14 (App Router) | SSR + SPA framework |
| **UI** | React 18.3 + Tailwind CSS + Radix UI | Components + styling |
| **Charts** | TradingView Lightweight Charts v4 | Candlestick, line, histogram charts |
| **Animations** | Framer Motion 11 | Page transitions, list animations |
| **Data Fetching** | TanStack React Query 5 | Caching, deduplication, prefetch |
| **Backend** | Python FastAPI + Pydantic v2 | REST API + validation |
| **Computation** | Polars 1.x | Vectorised indicator computation |
| **Database** | Supabase (PostgreSQL 15) | User data, auth, RLS |
| **Cache** | Redis 7 | Pre-computed scanner JSON cache |
| **Hosting (FE)** | Vercel (Edge Mumbai) | Frontend CDN + SSR |
| **Hosting (BE)** | Hetzner VPS (CX22) | Backend + Redis |
| **Monitoring** | Sentry | Error tracking (FE + BE) |
| **Analytics** | PostHog | Product analytics |
| **CI/CD** | GitHub Actions | Lint, test, deploy pipelines |
| **Font** | Hanken Grotesk | `next/font/google` self-hosted |

---

## Data Sources

TRADESCOUT uses **zero web scraping** and **zero paid APIs**. All market data is sourced from free, open datasets:

| Source | Provider | Data | Update Frequency |
|---|---|---|---|
| [`tejhq/indian-markets`](https://huggingface.co/datasets/tejhq/indian-markets) | Hugging Face | 34.3M rows of NSE OHLCV. Year-partitioned Parquet. | Daily |
| [`vishnun0027/indian-market-historical-ohlcv`](https://huggingface.co/datasets/vishnun0027/indian-market-historical-ohlcv) | Hugging Face | 2,675 per-symbol historical Parquet files. 10+ years. | Daily (GitHub Actions) |
| [`bfinance`](https://pypi.org/project/bfinance/) | PyPI | Quarterly financials, earnings concalls, shareholding. | On-demand |
| [`jugaad-data`](https://pypi.org/project/jugaad-data/) | PyPI | Direct NSE Bhavcopy download. Backup source. | On-demand |

> **Total data cost: ₹0/month.** All datasets are community-maintained and freely available.

---

## Contributing

Contributions are welcome! Please follow these guidelines:

### Getting Started

1. Fork the repository.
2. Create a feature branch: `git checkout -b feat/your-feature`.
3. Follow the monorepo structure — backend changes in `api/`, frontend in `web/`.
4. Write tests for new features.
5. Open a PR against the `dev` branch.

### Code Standards

- **Python:** Format and lint with Ruff (`ruff check . && ruff format .`).
- **TypeScript:** ESLint + Prettier (`pnpm lint && pnpm format`).
- **Commits:** [Conventional Commits](https://www.conventionalcommits.org/) (`feat:`, `fix:`, `docs:`, `refactor:`, etc.).
- **PRs:** Include a description, screenshots (if UI change), and test results.

### Areas Open for Contribution

- [ ] Scanner algorithm improvements (VCP detection accuracy, base depth calculation)
- [ ] Additional scanners (Power Play, Pocket Pivot, Follow-Through Day)
- [ ] Chart drawing tools (trendlines, Fibonacci, channels)
- [ ] Mobile UI optimisation
- [ ] Accessibility improvements
- [ ] Documentation and tutorials

---

## License

This project is licensed under the **MIT License**. See [LICENSE](LICENSE) for details.

```
MIT License

Copyright (c) 2026 Vansh Panchal

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---

## Author

**Vansh Panchal**

- GitHub: [@vanshpanchal](https://github.com/vanshpanchal)
- Twitter/X: [@vanshpanchal](https://x.com/vanshpanchal)

---

## Regulatory Disclaimer

TRADESCOUT is an educational research and technical market screening platform. It is NOT a SEBI-registered investment advisor or research analyst. All stock screeners, metrics, and chart setups are strictly for educational and informational purposes. Trading and investing in securities are subject to market risks.

---

<p align="center">
  <sub>Built with ☕ and conviction. Data is free. Edge is earned.</sub>
</p>
