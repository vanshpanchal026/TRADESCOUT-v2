# TRADESCOUT — Gravitas Agent Execution Prompts

> **Format:** Self-contained, contract-bounded execution prompts for coding agents (Cursor, Antigravity, Codex, Claude Code).  
> **Engineering Runtime:** Gravitas (Ground before mutating, Evidence-backed verification, Strict write scope).

---

## Instructions for the User
Copy each prompt sequentially and paste it into a **fresh agent session**. Each prompt contains:
1. **Target Working Directory & Allowed Write Scope**
2. **Grounding Context (Files to Read First)**
3. **Granular Implementation Steps**
4. **Strict Guardrails & Constraints**
5. **Executable Verification Commands** (The agent must run these and show evidence)
6. **Required Verdict** (`VERDICT: PASS` or `VERDICT: FAIL`)

---

## PROMPT 1: Phase 1 — Project Scaffolding & Local Infrastructure

```markdown
You are the Lead Systems Engineer executing Phase 1 of TRADESCOUT under the Gravitas reliability runtime.

### Context & Grounding
- Working Directory: `C:\Users\pc\OneDrive\Desktop\TRADESCOUT`
- Read these files before touching anything:
  1. `memory.md`
  2. `.cursorrules`
  3. `agentrules.md`
  4. `environment-setup.md`
  5. `infra/docker-compose.yml`

### Allowed Write Scope
- `api/**`
- `web/**`
- `memory.md` (status board update only)

### Task Specification
1. **FastAPI Backend Skeleton (`api/`):**
   - Initialize `api/pyproject.toml` or `api/requirements.txt` with pinned dependencies: `fastapi`, `uvicorn[standard]`, `pydantic>=2.0`, `polars`, `pyarrow`, `redis`, `httpx`, `pytest`, `pytest-asyncio`, `structlog`, `python-jose[cryptography]`.
   - Create `api/app/main.py` with:
     - Standard async lifespan context manager.
     - Probes: `GET /healthz` (returns `{"status":"ok", "timestamp":"...", "version":"1.0.0"}`) and `GET /readyz` (checks Redis connection).
     - `RequestIDMiddleware` (UUID assigned to every request and attached to response header `x-request-id`).
     - CORS middleware configured for `http://localhost:3000`.
   - Create structured configuration in `api/app/core/config.py` using `pydantic_settings.BaseSettings`.
2. **Next.js 14 Frontend Skeleton (`web/`):**
   - Initialize Next.js 14 App Router inside `web/` with TypeScript, Tailwind CSS, and `pnpm`.
   - Configure Hanken Grotesk Google Font in `web/src/app/layout.tsx`.
   - Setup Dark Mode provider with default `dark` class on `<html>` and persistence in `localStorage.getItem("stc-theme")`.
   - Create a clean landing placeholder on `web/src/app/page.tsx` with TRADESCOUT branding and status pill.
3. **Local Docker Services:**
   - Launch and verify `infra/docker-compose.yml` (PostgreSQL 16 on 5432, Redis 7 on 6379).

### Hard Constraints
- NO dummy mock data in production logic.
- NO Pandas or NumPy. Use Polars exclusively.
- All Python models must use Pydantic v2 syntax.

### Evidence & Verification Mandate
Run the following commands and paste the exact terminal output:
1. `docker compose -f infra/docker-compose.yml ps` (Verify both `postgres` and `redis` are `Up` and healthy).
2. Start FastAPI server and run: `curl http://localhost:8000/healthz` (Must return HTTP 200 with status ok).
3. Run backend lint: `cd api && ruff check .`
4. Update `memory.md` status board for Phase 1 to `[x] COMPLETE`.

Conclude your final response with:
VERDICT: PASS (or FAIL with specific error log)
```

---

## PROMPT 2: Phase 2 — Zero-Scraper Data Pipeline & Polars Indicator Engine

```markdown
You are the Principal Data Engineer executing Phase 2 of TRADESCOUT under the Gravitas reliability runtime.

### Context & Grounding
- Working Directory: `C:\Users\pc\OneDrive\Desktop\TRADESCOUT`
- Read these files before touching anything:
  1. `data-pipeline.md`
  2. `Testing-Strategy.md`
  3. `InterviewLog.md` (ADR-01 and ADR-02)
  4. `.cursorrules`

### Allowed Write Scope
- `api/app/services/**`
- `api/app/core/**`
- `api/tests/**`
- `tests/**`
- `memory.md`

### Task Specification
1. **Parquet Stream Ingestion (`api/app/services/pipeline.py`):**
   - Implement asynchronous stream loader from Hugging Face dataset `tejhq/indian-markets` (`nse/year=2026/nse_2026.parquet` and `delivery/year=2026/delivery_2026.parquet`).
   - Implement local disk caching in `.cache/parquet/` with ETag validation.
   - Implement emergency fallback loader using `jugaad-data`.
2. **Polars Vectorized Indicator Engine (`api/app/services/indicators.py`):**
   - Vectorized Moving Averages: SMA (10, 20, 50, 150, 200), EMA (12, 26).
   - 14-period RSI using Wilder's exponential smoothing.
   - 12-Month IBD-style Relative Strength (RS) Rating (0–99 percentile rank vs NIFTY 50).
   - Stan Weinstein Stage Analysis classifier (Stages 1, 2, 3, 4).
   - Mark Minervini 8-point Trend Template validation filter.
   - Relative Volume (RVOL) calculation against 50-day average volume.
   - 52-week High/Low proximity percentages.
3. **Redis Pre-Computed Caching Service (`api/app/services/cache_service.py`):**
   - Serializes filtered scanner results into JSON blobs and stores in Redis 7 with 24-hour TTL:
     - `scanner:trend-template:latest`
     - `scanner:recent-breakout:latest`
     - `scanner:4pct-breakout:latest`
     - `scanner:high-volume:latest`
     - `scanner:1m-gainers:latest`
4. **Golden Reference Dataset Unit Tests (`api/tests/unit/test_golden_indicators.py`):**
   - Build test suite testing 10 benchmark stocks (`RELIANCE`, `TCS`, `HDFCBANK`, etc.) with tolerance < 0.01%.

### Hard Constraints
- ZERO web scrapers. Never query `nseindia.com`.
- NEVER import `pandas` or `numpy`. Polars expressions only.
- Indicator calculation must complete for 2,500 symbols in under 10 seconds.

### Evidence & Verification Mandate
Run the following and paste the exact command output:
1. `cd api && pytest tests/unit/test_golden_indicators.py -v` (Must pass with 0 failures).
2. Execute one test run of indicator calculation on 2026 EOD data and display execution runtime in seconds.
3. Query Redis via redis-cli: `redis-cli get "scanner:trend-template:latest"` and display JSON sample.
4. Update `memory.md` status board for Phase 2 to `[x] COMPLETE`.

Conclude your final response with:
VERDICT: PASS (or FAIL with specific error log)
```

---

## PROMPT 3: Phase 3 — Scanner REST API & Virtualized Data Grid UI

```markdown
You are the Full-Stack Systems Engineer executing Phase 3 of TRADESCOUT under the Gravitas reliability runtime.

### Context & Grounding
- Working Directory: `C:\Users\pc\OneDrive\Desktop\TRADESCOUT`
- Read these files before touching anything:
  1. `API-Spec.md`
  2. `AppFlow.md`
  3. `TechStack.md`
  4. `.cursorrules`

### Allowed Write Scope
- `api/app/api/**`
- `web/src/app/scanners/**`
- `web/src/components/**`
- `web/src/lib/**`
- `memory.md`

### Task Specification
1. **FastAPI Scanner Endpoints (`api/app/api/v1/scanners.py`):**
   - Implement `GET /api/scanners/{slug}` supporting: `trend-template`, `recent-breakout`, `4pct-breakout`, `high-volume`, `1m-gainers`.
   - Query params: `limit` (default 50), `offset`, `sort_by`, `direction`.
   - Freemium logic: If request lacks authenticated Pro JWT, truncate response data to top 10 items, set `metadata.is_truncated = true`, and omit sensitive pivot columns.
   - Implement `GET /api/metadata` (market status, last sync timestamp, total stocks).
2. **Next.js API Proxy (`web/src/app/api/[...path]/route.ts`):**
   - Reverse proxy forwarding browser requests to FastAPI backend with client IP and JWT forwarding.
3. **High-Performance Scanner Grid UI (`web/src/app/scanners/[slug]/page.tsx`):**
   - Built with TanStack Table v8 with virtualized DOM rows (supporting 2,500 rows smoothly).
   - Sticky header and frozen columns for Symbol and CMP.
   - Mini canvas sparklines showing 20-day trend.
   - Instant search/filter input (<10ms response).
   - Freemium blur effect: Rows 11+ rendered with blurred backdrop and an "Unlock All Results with Pro" overlay banner.
   - Keyboard shortcuts: `ArrowDown`/`ArrowUp` row navigation, `Enter` to navigate to `/stock/:symbol`.

### Hard Constraints
- Client grid must not freeze or lag during rapid typing or scrolling.
- Unauthenticated users must NEVER receive rows 11+ in network payloads. Gating must be enforced on backend.

### Evidence & Verification Mandate
1. Test API endpoint: `curl -s http://localhost:8000/api/scanners/trend-template | jq .metadata`
2. Test truncation: Verify payload data array length is exactly 10 for unauthenticated request.
3. Run frontend typecheck: `cd web && pnpm tsc --noEmit`
4. Update `memory.md` status board for Phase 3 to `[x] COMPLETE`.

Conclude your final response with:
VERDICT: PASS (or FAIL with specific error log)
```

---

## PROMPT 4: Phase 4 — Stock Detail Page & TradingView Charting Engine

```markdown
You are the Frontend Charting & Financial UX Specialist executing Phase 4 of TRADESCOUT under the Gravitas reliability runtime.

### Context & Grounding
- Working Directory: `C:\Users\pc\OneDrive\Desktop\TRADESCOUT`
- Read these files before touching anything:
  1. `AppFlow.md` (Section 3.3 Stock Detail)
  2. `API-Spec.md` (Stock Endpoints)
  3. `data-pipeline.md` (Vishnu Parquet & bfinance)
  4. `.cursorrules`

### Allowed Write Scope
- `api/app/api/v1/stock.py`
- `web/src/app/stock/**`
- `web/src/components/chart/**`
- `web/src/components/fundamentals/**`
- `memory.md`

### Task Specification
1. **Stock Historical & Fundamentals Endpoints (`api/`):**
   - `GET /api/stock/{symbol}`: Returns profile, CMP, 52W range, stage classification, key ratios.
   - `GET /api/stock/{symbol}/history`: Streams historical daily OHLCV from `vishnun0027/indian-market-historical-ohlcv` over HTTP.
   - `GET /api/stock/{symbol}/rs_line`: Returns normalized RS line relative to NIFTY 50.
   - `GET /api/stock/{symbol}/fundamentals`: Returns 10-year quarterly metrics via `bfinance` SDK.
2. **TradingView Lightweight Charts v4 Component (`web/`):**
   - Canvas-based chart inside `web/src/components/chart/TradingViewChart.tsx`.
   - Series configuration:
     - Candlestick series (Bullish cyan `#00E5FF`, Bearish slate `#64748B`).
     - Line overlays: SMA 10 (yellow), SMA 20 (green), SMA 50 (blue), SMA 200 (red) with legend toggles.
     - Volume histogram sub-pane with color coding for high-volume spikes (>2.0x 50D avg).
     - Sub-pane: RSI (14) and Relative Strength (RS) line vs NIFTY 50.
     - Breakout pivot line dashed overlay and stage shading.
   - Strict cleanup: `chart.remove()` on React unmount to prevent memory leaks.
3. **Fundamentals & Financials Tabs:**
   - Screener-style YoY Sales, EBITDA, Net Profit, and EPS quarterly breakdown table.
   - Promoter, FII, DII shareholding pattern progression.

### Hard Constraints
- DO NOT use SVG charting libraries (Recharts/D3). TradingView Lightweight Charts v4 canvas only.
- Panning and zooming must maintain solid 60 FPS.
- Handle missing symbols gracefully with friendly 404 page.

### Evidence & Verification Mandate
1. Test history endpoint: `curl http://localhost:8000/api/stock/RELIANCE/history` (Verify OHLC array returns).
2. Test fundamentals endpoint: `curl http://localhost:8000/api/stock/TRENT/fundamentals`
3. Run `cd web && pnpm build` (Ensure no SSR or hydration errors on `/stock/[symbol]`).
4. Update `memory.md` status board for Phase 4 to `[x] COMPLETE`.

Conclude your final response with:
VERDICT: PASS (or FAIL with specific error log)
```

---

## PROMPT 5: Phase 5 — Supabase Authentication, RLS & Watchlists

```markdown
You are the Security & Database Systems Engineer executing Phase 5 of TRADESCOUT under the Gravitas reliability runtime.

### Context & Grounding
- Working Directory: `C:\Users\pc\OneDrive\Desktop\TRADESCOUT`
- Read these files before touching anything:
  1. `Backend scheme.md`
  2. `Security-and-Scale.md`
  3. `AppFlow.md`
  4. `.cursorrules`

### Allowed Write Scope
- `supabase/**`
- `api/app/core/security.py`
- `web/src/app/watchlists/**`
- `web/src/app/(auth)/**`
- `web/src/lib/supabase/**`
- `memory.md`

### Task Specification
1. **Supabase Client & Auth SSR (`web/`):**
   - Setup `@supabase/ssr` client for Next.js App Router (browser client, server client, middleware cookie session handler).
   - Implement Auth UI: `/login`, `/signup`, `/reset-password` supporting Email/Password and Magic Link.
2. **FastAPI JWT Authentication Dependency (`api/`):**
   - Implement `get_current_user` dependency validating Supabase JWT with `SUPABASE_JWT_SECRET`.
   - Protect watchlist, favourites, chart drawings, and trader notes routes.
3. **Watchlist Management Engine (`web/src/app/watchlists/`):**
   - CRUD watchlists backed by Supabase PostgreSQL.
   - Enforce Tier Limits via database triggers (Free: max 1 watchlist, 20 stocks; Pro: unlimited).
   - Mini sparkline previews for all watchlist symbols.
   - Quick-add shortcut (`W` key) from any scanner table row.
4. **Cloud Drawings & Trader Notes Persistence:**
   - Save serialized TradingView chart drawings in `chart_drawings` table.
   - Auto-saving journal in `stock_notes` table.

### Hard Constraints
- Every user query must be guarded by Supabase PostgreSQL Row Level Security (RLS).
- Never expose `SUPABASE_SERVICE_ROLE_KEY` to client browser bundles.

### Evidence & Verification Mandate
1. Run Supabase migration script against your Supabase project.
2. Verify RLS: Attempt to query another user's watchlist using an authenticated client token and confirm zero rows returned.
3. Verify Free tier constraint trigger: Attempt inserting 21st item in free watchlist and confirm database exception.
4. Update `memory.md` status board for Phase 5 to `[x] COMPLETE`.

Conclude your final response with:
VERDICT: PASS (or FAIL with specific error log)
```

---

## PROMPT 6: Phase 6 — The Warmup Dashboard, RRG & Heatmap

```markdown
You are the Quantitative Market Visualization Specialist executing Phase 6 of TRADESCOUT under the Gravitas reliability runtime.

### Context & Grounding
- Working Directory: `C:\Users\pc\OneDrive\Desktop\TRADESCOUT`
- Read these files before touching anything:
  1. `AppFlow.md` (Section 3.1 The Warmup & Section 3.4 RRG)
  2. `DesignDocument.md`
  3. `API-Spec.md`
  4. `.cursorrules`

### Allowed Write Scope
- `api/app/api/v1/market.py`
- `api/app/services/rrg.py`
- `web/src/app/warmup/**`
- `web/src/app/rrg/**`
- `web/src/app/heatmap/**`
- `web/src/app/groups/**`
- `memory.md`

### Task Specification
1. **The Warmup Dashboard (`web/src/app/warmup/page.tsx`):**
   - Market Participation radial gauge (% of NSE 500 above 50 SMA).
   - RME Sentiment diagnostic index (Washed Out / Neutral / Overextended).
   - Weinstein Stage 2 vs Stage 4 distribution ratio bar.
   - Daily pre-market cues feed and earnings horizon ribbon.
2. **Relative Rotation Graph (`web/src/app/rrg/page.tsx`):**
   - Compute JdK RS-Ratio (X-axis) and RS-Momentum (Y-axis) relative to benchmark index.
   - Interactive 2D canvas plotting sectors and top momentum stocks across 4 quadrants:
     - Leading (Green), Weakening (Yellow), Lagging (Red), Improving (Blue).
     - Trailing trajectory tails showing 5, 10, or 20-session rotation clockwise.
3. **Market Heatmap (`web/src/app/heatmap/page.tsx`):**
   - Treemap visualization sized by Market Capitalization and colored by 1-day percentage gain/loss.
   - Drill-down navigation: Market -> Sector -> Stock Detail.

### Hard Constraints
- RRG calculations must use vectorized Polars expressions.
- Heatmap must render smoothly on both mobile viewports and 4K desktop screens.

### Evidence & Verification Mandate
1. Test market breadth endpoint: `curl http://localhost:8000/api/market-breadth`
2. Test RRG endpoint: `curl http://localhost:8000/api/rrg?benchmark=NIFTY50`
3. Run frontend production build: `cd web && pnpm build` (Ensure clean static generation).
4. Update `memory.md` status board for Phase 6 to `[x] COMPLETE`.

Conclude your final response with:
VERDICT: PASS (or FAIL with specific error log)
```

---

## PROMPT 7: Phase 7 — Production Hardening, Quality Gates & Launch

```markdown
You are the Principal SRE & Quality Assurance Lead executing Phase 7 of TRADESCOUT under the Gravitas reliability runtime.

### Context & Grounding
- Working Directory: `C:\Users\pc\OneDrive\Desktop\TRADESCOUT`
- Read these files before touching anything:
  1. `Testing-Strategy.md`
  2. `Security-and-Scale.md`
  3. `environment-setup.md`
  4. `.cursorrules`

### Allowed Write Scope
- `tests/e2e/**`
- `.github/workflows/**`
- `web/next.config.js`
- `api/app/core/logging.py`
- `CHANGELOG.md`
- `memory.md`

### Task Specification
1. **Playwright End-to-End Test Suite (`tests/e2e/`):**
   - Full trader loop: Visit `/warmup` -> Click scanner -> Sort grid -> Select stock -> View TradingView chart -> Add to watchlist.
   - Freemium paywall verification: Verify rows 11+ are blurred and paywall dialog triggers.
2. **Lighthouse CI & Performance Hardening:**
   - Optimize bundle size: Dynamic imports for TradingView canvas (`next/dynamic` with `ssr: false`).
   - Configure cache control headers, CSP, HSTS, and frame-ancestors in `next.config.js`.
   - Achieve Lighthouse score $\ge 95$ across Performance, Accessibility, Best Practices.
3. **CI/CD Pipeline (.github/workflows/ci.yml):**
   - Automated GitHub Actions workflow running:
     - Python Ruff linter + Pytest with Golden Reference Dataset verification.
     - TypeScript typecheck + Playwright E2E tests.
4. **Production Deployment Setup:**
   - Frontend: Vercel deployment with Mumbai Edge node routing.
   - Backend: Dockerized production container for Hetzner Cloud or Railway.
   - Sentry error monitoring configured on both frontend and backend.
5. **Regulatory & Final Polish:**
   - Verify mandatory SEBI educational disclaimer is rendered across all pages.
   - Update `CHANGELOG.md` and mark Phase 7 `[x] COMPLETE` in `memory.md`.

### Evidence & Verification Mandate
Run and provide output for:
1. `npx playwright test` (100% test pass rate).
2. `cd api && pytest` (100% test pass rate with coverage report).
3. Lighthouse test score screenshot or JSON report.
4. Final `git status` clean check.

Conclude your final response with:
VERDICT: PASS (or FAIL with specific error log)
```
