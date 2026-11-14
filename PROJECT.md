# Project: TRADESCOUT Production Readiness (11 Fixes)

## Architecture
- **Backend**: FastAPI 0.115+ / Polars 1.x / Redis 7. REST endpoints under `/api/scanners/{slug}`, `/api/watchlists`, `/api/favourites`. Redis caching under `scanner:{slug}:latest` with 24h TTL.
- **Frontend**: Next.js 14 App Router, TypeScript, Tailwind CSS, TanStack Query / cachedFetch.
- **Client Auth**: Multi-user simulation with `ts-active-user-id`, `getAuthHeaders()`, `ts-user-changed` CustomEvents.
- **Data Flow**: Parquet daily market data -> Polars indicator engine -> Redis pre-computed cache -> FastAPI endpoints with auth/tier slicing -> Next.js client components.

## Feature Inventory
| # | Feature | Description | Milestone | Source |
|---|---------|-------------|-----------|--------|
| 1 | Stage 2 Breakout Scanner | Weinstein Stage 2 breakout scanner calculation, Redis cache, and slug registration | M1 | R1 |
| 2 | 20-SMA Pullback Scanner | Orderly pullback within 3% of 20-day SMA in uptrend, Redis cache, and slug registration | M1 | R1 |
| 3 | 3M Gainers Scanner | 3-month rolling performance gainer calculation, Redis cache, and slug registration | M1 | R1 |
| 4 | Outperformers Scanner | RS Rating >= 80 relative strength leaders versus benchmark, Redis cache, and slug registration | M1 | R1 |
| 5 | Doublers Scanner | 100%+ appreciation from 52-week low calculation, Redis cache, and slug registration | M1 | R1 |
| 6 | New Listing IPO Scanner | IPO listings with short history (<250 bars), Redis cache, and slug registration | M1 | R1 |
| 7 | Paywall Blur Valid Destination | Replace dead `/signup` link with `/account?sec=billing` in `paywall-blur.tsx` | M2 | R2.1 |
| 8 | TopTabBar Label & Icon Action | Update "+ Add page" to "Explore Scanners" with scanner icon in `TopTabBar.tsx` | M2 | R2.2 |
| 9 | Stock Detail Watchlist Sync | Connect stock detail "+ Watchlist" toggle with backend REST API and `getAuthHeaders()` | M2 | R3.1 |
| 10 | TradingView Chart Favourites Auth | Add `getAuthHeaders()` to `/api/favourites` fetch & toggle endpoints and `ts-user-changed` | M2 | R3.2 |
| 11 | Intraday Screener Active Filtering | Implement dynamic filtering in `intraday/page.tsx` based on `activeFilter` trigger | M2 | R3.3 |
| 12 | Scanner Pro Tier Dynamic Unlocking | Listen to `ts-user-changed`, re-fetch with auth headers, unlock rows > 10 in `scanner-grid.tsx` | M3 | R4.1 |
| 13 | Feedback Drawer Form Persistence | Persist submitted feedback to client storage across browser refreshes | M3 | R4.2 |
| 14 | Account Profile Form Persistence | Persist submitted profile settings to client storage across browser refreshes | M3 | R4.3 |
| 15 | Login & Auth State Persistence | Unify login session and `ts-active-user-id` to persist reliably across browser reloads | M3 | R4.4 |
| 16 | Favicon Asset Delivery | Add valid `favicon.ico` in frontend to eliminate 404 errors | M3 | R5.1 |
| 17 | Favourites Network Deduplication | Deduplicate concurrent `/api/favourites` calls on page load via `cachedFetch` | M3 | R5.2 |
| 18 | Full E2E Test Suite (Tiers 1-4) | Comprehensive opaque-box test suite for all 11 requirements | M4 (E2E) | Acceptance Criteria |
| 19 | Adversarial Coverage Hardening (Tier 5) | White-box stress-testing and edge-case hardening | M4 (Phase 2) | Acceptance Criteria |

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| M1 | Backend Scanner Calculations & Caching | Features 1-6 (R1: 6 missing scanners, indicators fix, Redis caching, slug registration) | none | IN_PROGRESS |
| M2 | Frontend Navigation, Watchlists & Reactivity | Features 7-11 (R2, R3: paywall link, TopTabBar, stock detail sync, chart favourites, intraday filters) | none | IN_PROGRESS (Worker done) |
| M3 | Identity, Form Persistence, Assets & Deduplication | Features 12-17 (R4, R5: Pro tier unlock, Feedback/Profile persistence, auth persistence, favicon, deduplication) | none | IN_PROGRESS (Worker done) |
| M4 | Final Milestone: Full E2E & Adversarial Hardening | Features 18-19 (Tiers 1-4 E2E pass + Tier 5 adversarial hardening) | M1, M2, M3 | PLANNED |

## Interface Contracts
### Backend ↔ Frontend Scanner Contract
- **Endpoint**: `GET /api/scanners/{slug}`
- **Query Params**: `min_rs` (int), `min_rvol` (float), `sort_by` (str), `direction` ("asc"|"desc"), `limit` (int), `offset` (int)
- **Headers**: `x-user-id` (str), `Authorization: Bearer <token>`
- **Response**: `{ "slug": str, "date": str, "total_matches": int, "updated_at": str, "data": [...], "metadata": { "is_truncated": bool, "user_tier": "free"|"pro", "page": int, "page_size": int } }`

### Stock Detail ↔ Watchlist REST Contract
- `GET /api/watchlists` -> `list[WatchlistOut]`
- `POST /api/watchlists/{id}/items` with body `{ "symbol": "<SYMBOL>" }` -> 200 OK
- `DELETE /api/watchlists/{id}/items/{symbol}` -> 200 OK
- Mandatory headers: `getAuthHeaders()` (`x-user-id`)

### Chart Favourites Contract
- `GET /api/favourites` -> `{ "user_id": str, "favourites": list[str] }`
- `POST /api/favourites/{symbol}/toggle` -> `{ "user_id": str, "symbol": str, "is_favourite": bool }`
- Mandatory headers: `getAuthHeaders()` (`x-user-id`)

## Code Layout
### Backend (`backend/app/`)
- `services/cache_service.py`: Scanner generation logic and Redis serialization
- `services/indicators.py`: Technical indicators (RS rating, 52W high/low, SMAs)
- `routers/scanners.py`: `SUPPORTED_SLUGS`, endpoint handlers, pagination, and freemium gating
- `tests/`: Pytest suites (`test_scanners.py`, `test_cache.py`, `test_indicators.py`)

### Frontend (`frontend/src/`)
- `components/scanner/paywall-blur.tsx`: Paywall prompt link
- `components/shell/TopTabBar.tsx`: Top navigation bar
- `app/stock/[symbol]/page.tsx`: Stock detail view & watchlist toggle
- `components/chart/TradingViewChart.tsx`: Chart component & favourites star toggle
- `app/intraday/page.tsx`: Intraday screener & filter buttons
- `components/scanner/scanner-grid.tsx`: Candidate table & Pro unlock reactivity
- `components/shell/FeedbackDrawer.tsx`: User feedback drawer
- `app/account/page.tsx`: User profile settings form
- `lib/auth.ts`: Authentication state & helper functions
- `app/login/page.tsx`: Login form
- `lib/cache.ts`: Deduplicated request cache
- `public/favicon.ico`: Favicon asset
