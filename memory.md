# TRADESCOUT — Project Memory & Status Board

> **Authority:** Living project state document. Every autonomous agent MUST read this first before taking action and update it after every completed session.  
> **Repository:** `TRADESCOUT` (NSE Stock Screener & Market Analysis Engine)  
> **Lead Developer / Architect:** Vansh Panchal  
> **Initial Architecture Date:** November 2026

---

## 1. Project Snapshot

- **Product Name:** TRADESCOUT
- **Inspiration:** Reverse-engineered architecture of ScanTheCharts.com with adaptations from RepoTrace & FinRAG.AI (Imported from conversation `27c18536-f6cb-409a-bfed-4ac05e6bc0e8`)
- **Mission:** High-performance, zero-scraper technical market screener, breadth diagnostic dashboard, and TradingView charting suite for Indian equity swing traders.
- **Current Milestone:** All 7 Phases Completed (Phase 0 through Phase 7) — Monorepo scaffold, local Docker infra, zero-scraper data pipeline, Polars indicator engine, Redis caching, high-performance Scanner REST API, TanStack Table v8 frontend grid with freemium blur paywall, TradingView LC v4 charts, Single-User Cloud Persistence for Watchlists, Favourites, Drawings, and Notes, Phase 6 The Warmup, RRG & Heatmap, and Phase 7 Playwright E2E Quality Gates, Security Hardening (CSP & Headers), SEBI Compliance Footer, and CI/CD Pipeline. TRADESCOUT v1.0.0 is Production Ready.

---

## 2. Engineering Status Board

| Phase | Description | Status | Target Date | Owner | Key Deliverables / Notes |
| :---: | :--- | :---: | :---: | :---: | :--- |
| **0** | **Documentation & Planning** | ✅ **COMPLETE** | 2026-11-13 | Vansh / Agents | All 22 specification files generated with zero stubs. |
| **1** | **Monorepo Scaffold & Local Infra** | ✅ **COMPLETE** | 2026-11-12 | Agent | `api/` FastAPI, `web/` Next.js 14, Docker Compose (PG16 + Redis7). |
| **2** | **Zero-Scraper Data Pipeline** | ✅ **COMPLETE** | 2026-11-13 | Agent | Polars vectorized engine, TejHQ/Vishnu Parquet readers, Redis 24h cache (34 tests passing). |
| **3** | **Scanner API & High-Speed UI** | ✅ **COMPLETE** | 2026-11-13 | Agent | 5 core scanners, TanStack Table v8 data grid, freemium gating, Edge proxy (44 tests passing). |
| **4** | **Stock Detail & TradingView Charts**| ✅ **COMPLETE** | 2026-11-13 | Agent | TradingView LC v4 canvas (60 FPS), RS line vs NIFTY 50, 5-year quarterly fundamentals, 51 backend tests passing. |
| **5** | **Auth, Watchlists & Drawings** | ✅ **COMPLETE** | 2026-11-13 | Agent | Single-User direct persistence, asyncpg PG16 connection pool with resilient in-memory fallback, watchlists REST API & virtualized TanStack Table v8 UI, favourites toggle, chart drawings auto-save, notes journal debounced auto-sync (60 tests passing). |
| **6** | **The Warmup, RRG & Heatmap** | ✅ **COMPLETE** | 2026-11-13 | Agent | Vectorized Polars JdK RRG service, morning breadth warmup cockpit (/api/market/warmup & /warmup), interactive 4-quadrant RRG chart (/api/market/rrg & /rrg), and market cap treemap (/api/market/heatmap & /heatmap). 68 backend tests passing. |
| **7** | **Performance Hardening & Launch**| ✅ **COMPLETE** | 2026-11-13 | Agent | Playwright 6-journey E2E test suite (100% pass), CSP security headers, mandatory SEBI footer, GitHub Actions CI/CD quality gate pipeline. |
| **v2**| **UI/UX Polish & Bento Layout Contract** | ✅ **COMPLETE** | 2026-11-14 | Agent | AGENTS.md visual design contract, Hanken Grotesk typography with tabular-nums, ScanTheCharts 3-column Bento grid warmup, 240px fixed desktop sidebar & 56px mobile nav, Lightweight Charts v4 color-blended canvas with EMA 21/SMA 150 pills and pivot lines, Screener-style Financials & Concalls tabs, 10/10 adversarial checks passed, 8/8 Playwright E2E tests passing. Fixed client-side SSR hydration mismatch in UserSwitcher. |
| **v2.1** | **Master Swarm Extraction, Fidelity Audit & Parallel UI Polish** | ✅ **COMPLETE** | 2026-11-15 | Autonomous Swarm | 4 parallel designlang extraction workers (warmup, scanners, heatmap, stock); measured fidelity audit achieved 73% overall (C) with 90% motion fidelity (feel: responsive 100%, easings: ease-out 99%, durations: 83%, keyframes: slide) and 61% visual fidelity; 4 parallel UI Polish workers across WarmupDashboard, RMEMeter, BreadthGauge, StageDistribution, DailyCues, scanner-grid, paywall-blur, TopTabBar, TradingViewChart, StockDetailPage, HeatmapTreemap, RRGChart; verifier passed pnpm tsc --noEmit (0 errors) and pnpm build (32/32 pages); designlang verify-ui achieved 0/100 generic AI score; added Next.js Manrope font integration & brand tokens; 0 advisory terms; SEBI disclaimers preserved. |

---

## 3. Technology Stack Reference

- **Frontend:** Next.js 14 (App Router), React 18.3, TypeScript, Tailwind CSS, Radix UI, Framer Motion, TanStack Query v5, TradingView Lightweight Charts v4, Hanken Grotesk font.
- **Backend:** Python 3.12+, FastAPI, Pydantic v2, Polars (Vectorized calculations in Rust), Uvicorn, Structlog.
- **Data Ingestion (Zero Scraper):** Hugging Face Parquet (`tejhq/indian-markets` & `vishnun0027/indian-market-historical-ohlcv`), `bfinance` SDK. Fallback: `jugaad-data`.
- **Database & Identity:** Supabase PostgreSQL 15+ with Row Level Security (RLS) & PKCE JWT Auth.
- **In-Memory Cache:** Redis 7 (AOF enabled, pre-computed scanner snapshots).
- **Deployment Topology:** Vercel Edge (Frontend, Mumbai PoP) + Hetzner VPS (FastAPI backend).

---

## 4. Architectural Decisions to Respect

1. **Zero Scraper Policy:** Never write scrapers targeting `nseindia.com`. All EOD data streams from open Hugging Face Parquet.
2. **Polars Mandate:** Never use Pandas or NumPy in data transformation services. Polars is the sole data manipulation engine.
3. **Canvas Financial Charting:** Never replace TradingView Lightweight Charts with SVG/DOM libraries (Recharts/D3). Canvas ensures 60 FPS performance.
4. **Pre-Computed Edge Caching:** Scanners compute once daily post-market (16:15 IST) and persist to Redis. Dynamic database queries on raw market tables are banned.
5. **Freemium Pattern:** Anonymous/Free users get top-10 scanner results. Pro subscribers unlock all ~2,500 symbols.

---

## 5. Active Decisions & Open Questions

- [ ] **Billing Integration:** Finalize Razorpay vs Cashfree for recurring subscription billing in India.
- [ ] **Domain Selection:** Acquire `tradescout.in` or `tradescout.app`.
- [ ] **Pro Tier Pricing:** Validate ₹299/month (aggressive adoption) vs ₹499/month (standard SaaS).
- [ ] **Live Intraday Breadth:** Evaluate feasibility of 5-minute intraday snapshots via Zerodha Kite Connect WebSocket in Phase 7.

---

## 6. Monorepo File Map

```
TRADESCOUT/
├── .cursorrules           # AI coding rules & conventions (Root)
├── .env.example           # Environment variables template (Root)
├── .gitignore             # Git ignore definitions (Root)
├── agent.md               # Autonomous agent operating protocol (Root)
├── agentrules.md          # Hard agent constraints & guardrails (Root)
├── CHANGELOG.md           # Project release ledger (Root)
├── CONTRIBUTING.md        # Contributor workflow and standards (Root)
├── memory.md              # Living state & status board (Root - this file)
├── README.md              # Project overview & quick start (Root)
├── infra/                 # Containerized infrastructure
│   └── docker-compose.yml # PostgreSQL 16 + Redis 7 + pgAdmin
├── docs/                  # Architecture & Specification Documents
│   ├── README.md          # Master documentation directory & matrix
│   ├── PRD.md             # Product Requirements Document
│   ├── TechStack.md       # Technology rationale & cost matrix
│   ├── DesignDocument.md  # System architecture & component design
│   ├── AppFlow.md         # Complete user journey & screen flows
│   ├── API-Spec.md        # Complete REST API specification
│   ├── Backend scheme.md  # Full Supabase PostgreSQL schema with RLS
│   ├── data-pipeline.md   # Zero-scraper Parquet ingestion engine
│   ├── implementation-plan.md # 7-phase detailed engineering roadmap
│   ├── Testing-Strategy.md# Unit, integration, E2E & golden sets
│   ├── Security-and-Scale.md # Security controls, rate limits & scaling
│   ├── environment-setup.md # Developer workstation setup guide
│   └── InterviewLog.md    # Architectural decision records (ADRs)
└── research/              # Reverse-engineering vault & benchmark data
    ├── README.md          # Research index and mocking guide
    ├── scanthecharts-architecture-teardown.md # Full architecture teardown
    ├── data-sources-benchmark-report.md       # Parquet & zero-cost data source tests
    ├── cost-and-resource-breakdown.md         # Funds & cloud infrastructure analysis
    └── api-fixtures/                          # 24 real JSON payloads from ScanTheCharts
```
    └── api-fixtures/                         # 24 real JSON payloads from ScanTheCharts
```
