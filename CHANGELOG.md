# Changelog

All notable changes to the **TRADESCOUT** platform will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [2.0.0-rc1] - 2026-11-14 — TRADESCOUT-v2 UI/UX Polish & Bento Layout Contract

### UI/UX & Design System Contract
- **Visual & Design System Contract (`AGENTS.md`):** Established immutable design token system at repo root:
  - Primary font: `Hanken Grotesk` (`--font-hanken`) with strict `tabular-nums` formatting across all prices, percentage changes, RS ratings, momentum scores, and financial rows.
  - Dark-mode default color palette: Primary canvas `#0a0a0f`, Sidebar/Secondary `#141420`, Card surfaces `#1c1c2e`, subtle borders `1px solid #27272a`, Primary Accent `#6366f1` (Indigo), Market semantics (Bull `#22c55e`, Bear `#ef4444`, Caution/Pivot `#f59e0b`), Text (`#e4e4e7` Primary, `#a1a1aa` Secondary).
  - High-density institutional layout (`p-3`/`p-4` cards, `py-2 px-3` compact table rows), Framer Motion animated shimmer skeletons replacing all spinners/blank states.

### Navigation & App Shell Upgrades
- **Desktop Sidebar & Mobile Nav:** Crisp `240px` fixed left sidebar with branding icon and typography labels on desktop (`lg+`); fixed `56px` bottom navigation bar on mobile (`< lg`) with active route pills and icons.
- **TopTabBar:** Replaced obsolete `"+ Add page"` with `"Explore Scanners"` and `SlidersHorizontal` icon navigating to `/scanners/trend-template`.
- **Theme & Brand Identity:** Instant dark/light theme switching with `stc-theme` persistence, zero hydration flicker; resolved duplicate favicon conflict to eliminate 404/500 errors.

### Dashboard & Component Upgrades
- **Market Warmup Cockpit (`/warmup`):** High-density 3-column Bento grid featuring `RMEMeter` (Washed Out → Neutral → Stretched gauge), `BreadthGauge` (circular radial SMA 20/50/200 participation indicators), and `StageDistribution` (Weinstein Stage 1-4 bar and Breakout Health ratio card), plus `DailyCues` ticker & Nifty 50 mini-chart.
- **Scanner Grid & Freemium Paywall:** Sticky table header and sticky Symbol column on mobile, row hover highlights, emerald green pills for `RS >= 80`, ArrowUp/ArrowDown/Enter keyboard navigation, dynamic row unlock via `ts-user-changed`, and `blur-sm` paywall banner linking to `/account?sec=billing`.
- **TradingView Canvas & Detail Views:** Blended `#1c1c2e`/`#0a0a0f` canvas background with 30% softened gridlines, SMA/EMA pill toggles (SMA 10, 20, 50, 150, 200, EMA 21), dashed amber pivot lines, favourites star toggle via `cachedFetch` deduplication, Screener-style `FinancialsTab` (Quarterly Results & P&L), `ConcallsTab`, `FundamentalsTab`, and `NotesTab`.
- **Intraday & Dashboards:** Dynamic setup filtering via `useMemo` (`filteredGainers` & `filteredLosers` across quick screen triggers), `tabular-nums` tooltips on RRG chart and Heatmap treemap with 2-column mobile fallback.

### Verification & Quality Gates
- `tsc --noEmit`: 0 errors.
- `next build`: 32/32 routes static/SSG generated with 0 errors.
- `adversarial_verification.mjs`: 10/10 passed (VERDICT: APPROVE).
- `trader_workflow.spec.ts`: 8/8 Playwright E2E journeys passed (100%).

---

## [1.0.0] - 2026-11-13 — Production Milestone Release

### Phase 7: Reliability, Quality Assurance & Security Hardening
- **Playwright End-to-End Suite:** Implemented complete trader workflow E2E test suite in `web/tests/e2e/trader_workflow.spec.ts` covering 6 core journey specifications with 100% pass rate in headless Chromium:
  - *Test 1 (The Warmup - `/warmup`):* Verified radial participation dial, RME sentiment badge, and 4-stage distribution progress bar.
  - *Test 2 (Scanners - `/scanners/trend-template`):* Verified virtualized TanStack table rendering, dynamic RS Rating sorting, and instant search filter.
  - *Test 3 (Stock Detail & Charting - `/stock/RELIANCE`):* Verified TradingView LC v4 canvas mount, 5-year quarterly fundamentals statements, and notes auto-save journal.
  - *Test 4 (Watchlist Loop - `/watchlists`):* Verified symbol addition via autocomplete, 20-day sparklines, star/favourite toggle, and CSV export.
  - *Test 5 (Relative Rotation Graph - `/rrg`):* Verified 2D scatter quadrant rendering (Leading, Weakening, Lagging, Improving) and tail length toggling (5D/10D/20D).
  - *Test 6 (Market Heatmap - `/heatmap`):* Verified treemap tile rendering with gainers (cyan) / decliners (red) and index selector toggling.
- **Security Headers & CSP:** Hardened Next.js `next.config.mjs` with strict Content Security Policy (CSP), Strict-Transport-Security (HSTS), X-Frame-Options (`DENY`), X-Content-Type-Options (`nosniff`), Referrer-Policy (`strict-origin-when-cross-origin`), and X-DNS-Prefetch-Control.
- **SEBI Compliance & Disclaimer:** Enforced mandatory SEBI disclaimer across all routes in `web/src/components/common/Footer.tsx` and updated root layout.
- **CI/CD Quality Gate Pipeline:** Configured GitHub Actions workflow `.github/workflows/ci.yml` orchestrating backend tests (Ruff + Pytest with Redis service), frontend typecheck and build, and headless Playwright E2E verification.

### Phase 6: The Warmup Cockpit, RRG & Market Treemap
- **The Warmup Morning Breadth Cockpit (`/warmup`):** Integrated market participation gauges (>20/50/200 SMA), RME regime sentiment index (0-100), and Stan Weinstein 4-Stage market lifecycle bar.
- **Vectorized JdK Relative Rotation Graph (`/rrg`):** Implemented Julius de Kempenaer (JdK) RS-Ratio and RS-Momentum rotation models with trailing historical tails.
- **Market Cap-Weighted Treemap Heatmap (`/heatmap`):** Shipped recursive rectangular subdivision treemap visualizing sector grouping and stock returns.

### Phase 5: Single-User Persistence, Watchlists & Trader Notes
- **Direct Single-User Persistence:** Designed zero-friction persistence engine backed by PostgreSQL 16 `asyncpg` connection pool with automatic in-memory dictionary fallback.
- **Watchlists & Data Grid (`/watchlists`):** Delivered multi-watchlist management with virtualized TanStack Table v8, inline 20D SVG sparklines, and CSV exports.
- **Chart Drawings & Notes Journal:** Integrated TradingView chart drawing persistence and markdown stock thesis auto-saving with 1-second debounce.

### Phase 4: Stock Detail & TradingView Canvas Charting
- **Lightweight Charts v4 Integration (`/stock/[symbol]`):** Mounted 60 FPS hardware-accelerated TradingView candlestick charts with SMA 10/20/50/200 overlays.
- **Relative Strength vs NIFTY 50:** Calculated IBD-style benchmark relative strength curve overlay.
- **Fundamentals & Shareholding:** Implemented 5-year quarterly and annual financial statements and FII/DII shareholding breakdown.

### Phase 3: High-Performance Scanner API & Freemium UI
- **5 High-Conviction Scanners:** Implemented Minervini Trend Template, Recent Breakouts, 4%+ Volume Climax Breakouts, High RVOL, and 1M Top Gainers.
- **Sub-15ms Pre-Computed Caching:** Redis 7 in-memory cache snapshots generated post-market.
- **Freemium Gating:** Dynamic top-10 row preview with smooth blur paywall for guest accounts.

### Phase 2: Zero-Scraper Vectorized Data Pipeline
- **Columnar Parquet Ingestion:** Direct streaming loaders for Hugging Face datasets (`tejhq/indian-markets` and `vishnun0027/indian-market-historical-ohlcv`).
- **Pure Polars Indicator Engine:** High-performance vectorized calculation of SMA, EMA, Wilder RSI, ATR, RVOL, 12M IBD RS Rating, and Stage classification without Pandas or NumPy.
- **Golden Indicator Regression Suite:** Verified 100% calculation precision against pre-verified reference numbers across 10 benchmark market leaders.

### Phase 1: Monorepo Scaffold & Local Infrastructure
- **Monorepo Topology:** Established `api/` (Python 3.12+ FastAPI), `web/` (Next.js 14 App Router, TypeScript, Tailwind CSS), and `infra/` (Docker Compose with PostgreSQL 16 and Redis 7).
- **Probes & Middleware:** Built `/healthz` and `/readyz` probes and UUID `x-request-id` tracing middleware.

### Phase 0: Specifications, Architecture & Research Vault
- **PRD & Specifications:** Authored 22 engineering design documents and PRD.
- **ScanTheCharts Teardown:** Reverse-engineered data structures and captured 24 real-world API fixtures.
