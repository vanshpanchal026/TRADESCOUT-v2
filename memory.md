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
- **Current Milestone:** Phase 0 Completed — Full Documentation, Reverse-Engineering Research Vault, Architecture Specifications & Engineering Plans Established. Ready for Phase 1 Scaffolding.

---

## 2. Engineering Status Board

| Phase | Description | Status | Target Date | Owner | Key Deliverables / Notes |
| :---: | :--- | :---: | :---: | :---: | :--- |
| **0** | **Documentation & Planning** | ✅ **COMPLETE** | 2026-11-13 | Vansh / Agents | All 22 specification files generated with zero stubs. |
| **1** | **Monorepo Scaffold & Local Infra** | ⏳ **NEXT UP** | 2026-11-16 | Agent | `api/` FastAPI, `web/` Next.js 14, Docker Compose (PG16 + Redis7). |
| **2** | **Zero-Scraper Data Pipeline** | ⬜ NOT STARTED | 2026-11-21 | Agent | Polars vectorized engine, TejHQ/Vishnu Parquet readers, Redis 24h cache. |
| **3** | **Scanner API & High-Speed UI** | ⬜ NOT STARTED | 2026-11-26 | Agent | 7 core scanners, TanStack virtualized table, freemium blur paywall. |
| **4** | **Stock Detail & TradingView Charts**| ⬜ NOT STARTED | 2026-12-04 | Agent | TradingView LC v4 canvas, RS line vs Nifty, fundamentals via bfinance. |
| **5** | **Auth, Watchlists & Drawings** | ⬜ NOT STARTED | 2026-12-10 | Agent | Supabase Auth, PostgreSQL RLS, saved chart drawings, notes journal. |
| **6** | **The Warmup, RRG & Heatmap** | ⬜ NOT STARTED | 2026-12-18 | Agent | Morning market breadth gauges, Relative Rotation Graph, treemap. |
| **7** | **Performance Hardening & Launch**| ⬜ NOT STARTED | 2026-12-24 | Agent | Lighthouse 95+, Vercel Edge deployment, Sentry error monitoring. |

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
├── .cursorrules           # AI coding rules
├── .env.example           # Environment variables template
├── .gitignore             # Comprehensive ignore rules
├── agent.md               # Agent operating protocol
├── agentrules.md          # Hard constraints and guardrails
├── API-Spec.md            # Complete REST API specification
├── AppFlow.md             # Complete user journey & screen flows
├── Backend scheme.md      # Full Supabase PostgreSQL schema with RLS
├── CHANGELOG.md           # Project release ledger
├── CONTRIBUTING.md        # Contributor workflow and standards
├── data-pipeline.md       # Zero-scraper Parquet ingestion engine
├── DesignDocument.md      # System architecture & component design
├── environment-setup.md   # Step-by-step developer onboarding
├── implementation-plan.md # 7-phase detailed engineering roadmap
├── InterviewLog.md        # Architectural decision records (ADRs)
├── memory.md              # Living state & status board (this file)
├── PRD.md                 # Product Requirements Document
├── README.md              # Project overview & quick start
├── Security-and-Scale.md  # Security controls, rate limits & scaling
├── TechStack.md           # Technology rationale and cost matrix
├── Testing-Strategy.md    # Unit, integration, E2E & golden sets
├── infra/
│   └── docker-compose.yml # PostgreSQL 16 + Redis 7 + pgAdmin
└── research/              # Reverse-engineering vault & benchmark data
    ├── README.md                              # Research index and mocking guide
    ├── scanthecharts-architecture-teardown.md# Full architecture teardown of target
    ├── data-sources-benchmark-report.md      # Parquet & zero-cost data source tests
    ├── cost-and-resource-breakdown.md        # Funds and cloud infrastructure breakdown
    └── api-fixtures/                         # 24 real JSON payloads from ScanTheCharts
```
