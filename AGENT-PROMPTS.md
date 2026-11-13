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

## PROMPT 5: Phase 5 — Watchlists, Chart Drawings & Cloud State (Single-User Direct Persistence)

```markdown
You are the Full-Stack Database & Persistence Engineer executing Phase 5 of TRADESCOUT under the Gravitas reliability runtime.

### Context & Grounding
- Working Directory: `C:\Users\pc\OneDrive\Desktop\TRADESCOUT`
- Read these files before touching anything:
  1. `docs/Backend scheme.md` (Table schemas & relations)
  2. `docs/API-Spec.md` (Watchlist & Persistence endpoints)
  3. `docs/AppFlow.md` (Watchlist UX & shortcut flows)
  4. `.cursorrules`
  5. `memory.md`

### Allowed Write Scope
- `api/app/routers/watchlists.py`
- `api/app/services/database.py`
- `api/app/models/watchlist.py`
- `api/app/main.py`
- `api/tests/test_watchlists_api.py`
- `web/src/app/watchlists/**`
- `web/src/components/watchlist/**`
- `web/src/components/chart/TradingViewChart.tsx` (Hook drawing auto-save)
- `web/src/components/stock/NotesAndFilings.tsx` (Hook note auto-save)
- `memory.md`

### User Directive & Architecture Design: SINGLE-USER MODE (NO LOGIN REQUIRED)
- **NO Login / Signup Screens:** The application is for personal use. Do NOT implement `/login`, `/signup`, or auth paywall redirects.
- **Direct Access:** All features must open and operate immediately without requiring any credentials, cookies, or JWT verification.
- **Default Single-User Profile:** All watchlist, favourite, drawing, and note records bind to default profile ID `00000000-0000-0000-0000-000000000001` (`trader`).
- **Database Engine:** Uses PostgreSQL 16 (running via Docker on `127.0.0.1:5432`) with `asyncpg` connection pool. (Also 100% compatible with Supabase PostgreSQL).

### Granular Task Specification

1. **Database Service & Connection Pool (`api/app/services/database.py`):**
   - Initialize `asyncpg` connection pool during FastAPI lifespan startup using `settings.DATABASE_URL` (`postgresql://tradescout:tradescout_dev@localhost:5432/tradescout`).
   - Graceful fallback: If PostgreSQL is unreachable, use in-memory dictionary cache so endpoints never crash during development/testing.
   - Run or verify table initialization (`profiles`, `watchlists`, `watchlist_items`, `favourites`, `chart_drawings`, `stock_notes`, `ui_prefs`) if not already present.

2. **Watchlist & User State REST API (`api/app/routers/watchlists.py`):**
   - `GET /api/watchlists`: Return all watchlists for default user with item counts.
   - `POST /api/watchlists`: Create new watchlist (`name`, `description`).
   - `GET /api/watchlists/{id}`: Return watchlist details and all stock items with latest cached EOD market metrics (CMP, 1D change %, RSI, RS rating, 52W high proximity).
   - `PUT /api/watchlists/{id}`: Rename/update watchlist.
   - `DELETE /api/watchlists/{id}`: Delete watchlist.
   - `POST /api/watchlists/{id}/items`: Add stock symbol to watchlist (`symbol`, `notes`).
   - `DELETE /api/watchlists/{id}/items/{symbol}`: Remove symbol from watchlist.
   - `GET /api/favourites`: Return list of starred symbols.
   - `POST /api/favourites/{symbol}/toggle`: Toggle favourite status (returns `{"symbol": symbol, "is_favourite": bool}`).
   - `GET /api/stock/{symbol}/drawings`: Retrieve saved TradingView chart drawings JSON.
   - `POST /api/stock/{symbol}/drawings`: Persist user's chart drawings JSON.
   - `GET /api/stock/{symbol}/notes`: Retrieve user's markdown notes for the stock.
   - `POST /api/stock/{symbol}/notes`: Persist user's markdown notes for the stock.

3. **Frontend Watchlists Dashboard (`web/src/app/watchlists/page.tsx`):**
   - Clean, dark-mode institutional layout matching ScanTheCharts.
   - **Watchlist Selector Bar:** Tabs/Dropdown to switch between watchlists, "+ New Watchlist" modal button, and delete/rename actions.
   - **Symbol Search & Quick-Add:** Instant autocomplete search input to type any NSE symbol (e.g., `RELIANCE`, `TRENT`, `DIXON`) and add it to the active list.
   - **Watchlist Table Grid:** Virtualized TanStack Table v8 displaying:
     - Symbol & Company Name
     - CMP (Current Market Price) & 1D Change % (Green/Red badge)
     - 20-Day Mini Sparkline canvas
     - 14-period RSI & 12M RS Rating
     - Distance to 52-Week High
     - Notes tooltip & Delete button
     - Click on row navigates to `/stock/[symbol]`.
   - **CSV Export:** Button to download active watchlist symbols as CSV.

4. **Cross-View Synchronization & Keyboard Shortcuts:**
   - **Global 'W' Key / Star Shortcut:** On any scanner table row (`/scanners/[slug]`) and stock detail page (`/stock/[symbol]`), pressing `W` or clicking the Star icon instantly toggles the stock in the Primary Watchlist / Favourites.
   - **Chart Drawings Auto-Save:** In `TradingViewChart.tsx`, auto-sync drawings to `/api/stock/{symbol}/drawings` on draw/modify and load them on mount.
   - **Stock Notes Auto-Save:** In `NotesAndFilings.tsx`, auto-sync notes to `/api/stock/{symbol}/notes` with auto-save debounce (1000ms).

5. **Automated Unit & Integration Tests (`api/tests/test_watchlists_api.py`):**
   - Test default user watchlist listing (returns seeded "Primary Watchlist").
   - Test creating a new custom watchlist.
   - Test adding and removing stocks (`RELIANCE`, `TCS`) from watchlist.
   - Test toggling favourites on and off.
   - Test saving and retrieving chart drawings JSON.
   - Test saving and retrieving markdown stock notes.
   - Verify all tests pass with 0 failures and 0 warnings.

### Hard Constraints
- ZERO login / signup screens or auth paywalls.
- No Pandas or NumPy. Use Polars or pure Python/asyncpg for database mappings.
- All endpoints must return standard Pydantic models with `status: "success"` or standard errors.
- Never crash if database is temporarily restarting; provide graceful logging.

### Evidence & Verification Mandate
Run the following commands and paste the exact terminal output:
1. `cd api && pytest tests/test_watchlists_api.py -v` (Must pass with 100% success).
2. `cd api && pytest tests/ -v` (Verify entire test suite, target 60+ tests, passes).
3. `cd api && ruff check .` (Must pass with 0 errors).
4. `cd web && pnpm tsc --noEmit` (TypeScript compilation must pass with 0 errors).
5. `cd web && pnpm build` (Next.js production build must compile all routes including `/watchlists`).
6. Update `memory.md` status board for Phase 5 to `[x] COMPLETE`.

Conclude your final response with:
VERDICT: PASS (or FAIL with specific error log)
```

---

## PROMPT 6: Phase 6 — The Warmup Dashboard, Relative Rotation Graph (RRG) & Market Heatmap

```markdown
You are the Quantitative Market Visualization Specialist executing Phase 6 of TRADESCOUT under the Gravitas reliability runtime.

### Context & Grounding
- Working Directory: `C:\Users\pc\OneDrive\Desktop\TRADESCOUT`
- Read these files before touching anything:
  1. `docs/AppFlow.md` (Section 3.1 The Warmup & Section 3.4 RRG)
  2. `docs/DesignDocument.md`
  3. `docs/API-Spec.md` (Market & Breadth endpoints)
  4. `.cursorrules`
  5. `memory.md`

### Allowed Write Scope
- `api/app/routers/market.py`
- `api/app/services/rrg.py`
- `api/app/models/market.py`
- `api/app/main.py`
- `api/tests/test_market_and_rrg_api.py`
- `web/src/app/warmup/**`
- `web/src/components/warmup/**`
- `web/src/app/rrg/**`
- `web/src/components/rrg/**`
- `web/src/app/heatmap/**`
- `web/src/components/heatmap/**`
- `memory.md`

### Task Specification

1. **RRG Vectorized Polars Service (`api/app/services/rrg.py`):**
   - Implement JdK Relative Rotation Graph computation using vectorized Polars:
     - Relative Strength: $RS(t) = \frac{Price_{symbol}(t)}{Price_{benchmark}(t)} \times 100$
     - JdK RS-Ratio: Normalized 10-period rolling moving average of $RS(t)$ centered at 100.
     - JdK RS-Momentum: Rate of change of the RS-Ratio centered at 100.
   - Quadrant classification:
     - **Leading:** RS-Ratio $\ge 100$, RS-Momentum $\ge 100$ (Cyan / Bright Green)
     - **Weakening:** RS-Ratio $\ge 100$, RS-Momentum $< 100$ (Amber / Yellow)
     - **Lagging:** RS-Ratio $< 100$, RS-Momentum $< 100$ (Rose / Red)
     - **Improving:** RS-Ratio $< 100$, RS-Momentum $\ge 100$ (Indigo / Blue)
   - Generate clockwise rotation history tails for each symbol/sector across 5, 10, and 20 trading sessions.

2. **Market & RRG REST API (`api/app/routers/market.py`):**
   - `GET /api/market/warmup`: Return aggregated morning market breadth metrics:
     - Market Participation: % of stocks above 20 SMA, 50 SMA, 200 SMA.
     - RME Sentiment Index score (0-100) and regime tag (`Oversold / Washout`, `Neutral`, `Overextended`).
     - Weinstein Stage Distribution (percentage in Stage 1, Stage 2 Markup, Stage 3, Stage 4 Capitulation).
     - New 52-Week Highs vs New 52-Week Lows ratio.
     - Pre-market sentiment & economic horizon cues.
   - `GET /api/market/rrg`: Accepts query params `benchmark` (default `NIFTY 50`) and `group` (`sectors` or `top-momentum`). Returns current coordinates and trailing history points.
   - `GET /api/market/heatmap`: Returns hierarchically grouped sector and stock nodes with market capitalization weights and 1-day percentage price change.

3. **The Warmup Dashboard UI (`web/src/app/warmup/page.tsx` & `web/src/components/warmup/`):**
   - High-contrast institutional dark-mode morning dashboard.
   - **Market Participation Gauge:** Circular SVG radial progress dial showing stocks above 50 SMA.
   - **RME Sentiment Gauge:** Color-coded meter highlighting market temperature.
   - **Stage Distribution Bar:** Stacked progress bar showing Stage 2 Markup vs Stage 4 Capitulation balance.
   - **Breadth Summary Cards:** Net New Highs/Lows, Advance/Decline ratio, Average Volume Multiple.

4. **Interactive Relative Rotation Graph UI (`web/src/app/rrg/page.tsx` & `web/src/components/rrg/`):**
   - 2D Canvas or SVG interactive scatter chart centered at $(100, 100)$.
   - 4 Quadrants clearly labeled: Leading (Top-Right), Weakening (Bottom-Right), Lagging (Bottom-Left), Improving (Top-Left).
   - Trailing trajectory tails illustrating clockwise rotational momentum.
   - Toggle filters: Sector view vs Top Liquid Momentum stocks.
   - Tail length selector (5D, 10D, 20D) and hover tooltip showing symbol, quadrant, RS-Ratio, and RS-Momentum.
   - Click node to navigate to `/stock/[symbol]`.

5. **Market Heatmap UI (`web/src/app/heatmap/page.tsx` & `web/src/components/heatmap/`):**
   - Treemap visualization sized by Market Cap and colored by 1D change % (`#00E5FF` green for gainers, `#EF4444` red for decliners).
   - Index selector pills (`NIFTY 50`, `NIFTY NEXT 50`, `NIFTY MIDCAP 100`, `NIFTY 500`).
   - Sector grouping tiles with nested stock boxes.
   - Click stock tile navigates to `/stock/[symbol]`.

6. **Automated Unit & Integration Tests (`api/tests/test_market_and_rrg_api.py`):**
   - Test `GET /api/market/warmup` schema validation and metrics sanity.
   - Test `GET /api/market/rrg` quadrant boundaries, RS-Ratio, and tail coordinate generation.
   - Test `GET /api/market/heatmap` hierarchy and grouping.
   - Verify all tests pass with 0 failures and 0 warnings.

### Hard Constraints
- ZERO scraping. Use existing Polars Parquet pipeline data.
- NO Pandas or NumPy. Use vectorized Polars expressions only.
- Smooth rendering on desktop and mobile viewports with zero canvas memory leaks.

### Evidence & Verification Mandate
Run the following commands and paste the exact terminal output:
1. `cd api && pytest tests/test_market_and_rrg_api.py -v` (Must pass with 100% success).
2. `cd api && pytest tests/ -v` (Verify full test suite, target 68+ tests, passes).
3. `cd api && ruff check .` (Must pass with 0 errors).
4. `cd web && pnpm tsc --noEmit` (TypeScript compilation must pass with 0 errors).
5. `cd web && pnpm build` (Next.js production build must compile `/warmup`, `/rrg`, `/heatmap`).
6. Update `memory.md` status board for Phase 6 to `[x] COMPLETE`.

Conclude your final response with:
VERDICT: PASS (or FAIL with specific error log)
```

---

## PROMPT 7: Phase 7 — Production Hardening, Quality Gates & Launch Readiness

```markdown
You are the Principal SRE & Quality Assurance Lead executing Phase 7 of TRADESCOUT under the Gravitas reliability runtime.

### Context & Grounding
- Working Directory: `C:\Users\pc\OneDrive\Desktop\TRADESCOUT`
- Read these files before touching anything:
  1. `docs/Testing-Strategy.md`
  2. `docs/Security-and-Scale.md`
  3. `docs/environment-setup.md`
  4. `.cursorrules`
  5. `memory.md`

### Allowed Write Scope
- `tests/e2e/**`
- `web/playwright.config.ts`
- `.github/workflows/**`
- `web/next.config.mjs` or `web/next.config.js`
- `api/app/core/logging.py`
- `web/src/components/common/Footer.tsx` (SEBI disclaimer)
- `CHANGELOG.md`
- `memory.md`

### Task Specification

1. **Playwright End-to-End Test Suite (`tests/e2e/` or `web/tests/e2e/`):**
   - Setup Playwright with headless Chromium.
   - Implement the complete trader workflow E2E test suite:
     - **Test 1: The Warmup (`/warmup`):** Verifies market participation radial dial, RME sentiment badge, and stage distribution bar render.
     - **Test 2: Scanners (`/scanners/trend-template`):** Verifies virtualized TanStack table loads stocks, sorting by RS Rating works, and instant search filters results.
     - **Test 3: Stock Detail & Charting (`/stock/RELIANCE`):** Verifies TradingView canvas mounts without errors, fundamentals table displays 5-year financials, and notes auto-save works.
     - **Test 4: Watchlist Loop (`/watchlists`):** Verifies adding a symbol via autocomplete, viewing 20D sparklines, toggling star, and CSV export.
     - **Test 5: Relative Rotation Graph (`/rrg`):** Verifies 2D scatter chart renders 4 quadrants (Leading, Weakening, Lagging, Improving) and tail length toggling works.
     - **Test 6: Market Heatmap (`/heatmap`):** Verifies treemap tiles render with gainers (cyan) / decliners (red) and index selector toggles.

2. **Performance & Bundle Optimization:**
   - Optimize bundle size in Next.js: ensure heavy charting components use dynamic imports (`next/dynamic` with `ssr: false`).
   - Configure security headers in `next.config.js`:
     - Content Security Policy (CSP)
     - Strict-Transport-Security (HSTS)
     - X-Frame-Options: `DENY`
     - X-Content-Type-Options: `nosniff`
     - Referrer-Policy: `strict-origin-when-cross-origin`

3. **CI/CD Quality Gate Pipeline (`.github/workflows/ci.yml`):**
   - GitHub Actions workflow covering:
     - **Backend Gate:** Python 3.12/3.13 setup, `ruff check .`, and `pytest tests/ -v` (all 68+ tests).
     - **Frontend Gate:** Node 20 setup, `pnpm install`, `pnpm tsc --noEmit`, and `pnpm build`.
     - **E2E Gate:** Playwright test execution in headless mode.

4. **Regulatory SEBI Compliance & Footer:**
   - Ensure mandatory SEBI disclaimer is rendered across all pages in the app footer:
     > *"TRADESCOUT is an educational and analytical tool designed for market research. Not registered with SEBI as an Investment Adviser. Securities trading involves substantial risk of loss."*

5. **Final Polish & Release Ledger:**
   - Update `CHANGELOG.md` with full v1.0.0 release notes covering all 7 phases.
   - Update `memory.md` status board marking Phase 7 `[x] COMPLETE`.

### Evidence & Verification Mandate
Run the following commands and paste the exact terminal output:
1. `cd web && npx playwright test` (or headless test execution output).
2. `cd api && pytest tests/ -v` (Verify 100% backend pass rate).
3. `cd api && ruff check .` (0 lint errors).
4. `cd web && pnpm tsc --noEmit` (0 TypeScript errors).
5. `cd web && pnpm build` (Clean production build of all 13 routes).
6. Check `git status` clean state.

Conclude your final response with:
VERDICT: PASS (or FAIL with specific error log)
```
