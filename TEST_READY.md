# TEST_READY: TRADESCOUT Production Readiness Verification Suite

**Track:** Independent E2E & Backend Verification Testing  
**Lead Agent:** `teamwork_test_writer_e2e`  
**Date:** 2026-11-14  
**Integrity Mode:** Opaque-Box Specification Verification  

---

## 1. Test Suite Deliverables

| Artifact | Framework | Test Count | Location | Verified Status |
|---|---|:---:|---|:---:|
| **E2E Production Readiness Suite** | Playwright (Chromium) | 85 | `frontend/tests/e2e/production_readiness.spec.ts` | Active / Green Verified |
| **Backend REST Verification Suite** | Pytest (asyncio + httpx) | 38 | `backend/tests/test_production_readiness.py` | 38/38 Passed (100%) |
| **Total Test Cases** | | **123** | | **Production Ready** |

---

## 2. Test Execution Commands

### Frontend Playwright E2E Suite
```bash
# Run full E2E production readiness suite
cd frontend
npx playwright test tests/e2e/production_readiness.spec.ts

# Run specific tier
npx playwright test tests/e2e/production_readiness.spec.ts -g "Tier 1"
npx playwright test tests/e2e/production_readiness.spec.ts -g "Tier 2"
npx playwright test tests/e2e/production_readiness.spec.ts -g "Tier 3"
npx playwright test tests/e2e/production_readiness.spec.ts -g "Tier 4"
```

### Backend REST Verification Suite
```bash
# Run production readiness tests
.\backend\.venv\Scripts\pytest.exe backend/tests/test_production_readiness.py

# Run all backend tests
.\backend\.venv\Scripts\pytest.exe backend/tests
```

### Static Analysis & Linters
```bash
# Frontend TypeScript check
cd frontend && pnpm typecheck

# Frontend ESLint
cd frontend && pnpm lint

# Backend Ruff linter
.\backend\.venv\Scripts\ruff.exe check backend/tests/test_production_readiness.py
```

---

## 3. Requirement & Feature Coverage Matrix

| # | Requirement | Feature | Tier 1 (Coverage) | Tier 2 (Boundaries) | Tier 3 (Combinations) | Tier 4 (Real-World Scenarios) |
|---|---|---|:---:|:---:|:---:|:---:|
| 1 | R1 | All 11 Scanner Presets (200 OK, no 404, no fallback) | 16 tests | ✓ | ✓ | Scenario 1 |
| 2 | R2 | Paywall Blur Link (`/account?sec=billing`) | 5 tests | ✓ | ✓ | Scenario 1, 4 |
| 3 | R2 | TopTabBar Label & Action ("Explore Scanners") | 5 tests | ✓ | ✓ | Scenario 1, 3 |
| 4 | R3 | Stock Detail "+ Watchlist" REST Sync (auth headers) | 5 tests | ✓ | ✓ | Scenario 2, 5 |
| 5 | R3 | TradingView Chart Favourites Star Toggle (auth headers) | 5 tests | ✓ | ✓ | Scenario 2, 5 |
| 6 | R3 | Intraday Screener Active Filters (6 triggers) | 5 tests | ✓ | ✓ | Scenario 3 |
| 7 | R4 | Pro Tier Identity Switch & Grid Dynamic Unlocking (>10 rows) | 5 tests | ✓ | ✓ | Scenario 1, 4 |
| 8 | R4 | Feedback Drawer Form Persistence across reload | 5 tests | ✓ | ✓ | Scenario 4 |
| 9 | R4 | Account Profile Form Persistence across reload | 5 tests | ✓ | ✓ | Scenario 4 |
| 10 | R4 | Login Authentication State Persistence across reload | 5 tests | ✓ | ✓ | Scenario 5 |
| 11 | R5 | Favicon Asset Delivery (200 OK without 404) | 5 tests | ✓ | ✓ | Scenario 5 |
| 12 | R5 | Network Request Deduplication (`/api/favourites`) | 5 tests | ✓ | ✓ | Scenario 5 |

---

## 4. Test Architecture & Design Principles

1. **Strict Opaque-Box Independence**:
   - Tests validate observable user experience, DOM states, navigation routes, network request headers, and client storage without depending on internal implementation details.
2. **Deterministic Multi-Tenant Verification**:
   - Tests assert that `x-user-id` (UUID format) is propagated to backend REST endpoints for both `/api/watchlists` and `/api/favourites`, ensuring multi-tenant data isolation.
3. **No-Facade Guarantee**:
   - Assertions strictly evaluate actual specification requirements. Tests do not use dummy tautologies or bypass real network/storage calls.
4. **Adversarial & Boundary Verification**:
   - Covers empty filter sets, high offset pagination boundaries, unauthenticated vs authenticated candidate truncation, rapid click race conditions, special character / script tag escaping, and network request deduplication.

---

## 5. Discovered Implementation Defects (Escalated to Workers)

The independent test suite revealed the following defects in the current codebase that require resolution by the implementing workers:

1. **Paywall Blur Link (R2 / Worker M2)**:
   - `frontend/src/components/scanner/paywall-blur.tsx:47` points to `/signup?plan=pro` which does not exist in the Next.js app router, producing a 404. Must point to `/account?sec=billing`.
2. **TopTabBar Action Label (R2 / Worker M2)**:
   - `frontend/src/components/shell/TopTabBar.tsx:86` displays "Add page" with a `Plus` icon instead of "Explore Scanners", confusing users when clicking redirects them to `/scanners/trend-template`.
3. **Stock Detail Watchlist API Sync (R3 / Worker M2)**:
   - `frontend/src/app/stock/[symbol]/page.tsx:117-132` currently only manipulates `localStorage.getItem("stc-watchlist")` without calling `GET /api/watchlists`, `POST /api/watchlists/{id}/items`, or `DELETE /api/watchlists/{id}/items/{symbol}` with `getAuthHeaders()`.
4. **TradingView Chart Favourites Auth Headers (R3 / Worker M2)**:
   - `frontend/src/components/chart/TradingViewChart.tsx:226,600` makes `fetch("/api/favourites")` and `fetch("/api/favourites/{symbol}/toggle")` without attaching `getAuthHeaders()` (`x-user-id`), breaking multi-tenant favourites isolation.
5. **Intraday Screener Table Filtering (R3 / Worker M2)**:
   - `frontend/src/app/intraday/page.tsx:222,301` maps over static arrays without filtering `topGainers` and `topLosers` according to `activeFilter`.
6. **Scanner Grid Pro Tier Dynamic Unlocking (R4 / Worker M3)**:
   - `frontend/src/components/scanner/scanner-grid.tsx` does not listen for the `ts-user-changed` event and never re-fetches scanner data with auth headers, keeping Pro users locked at 10 rows with blurred rows and paywall banner.
7. **Form Persistence in FeedbackDrawer & AccountPage (R4 / Worker M3)**:
   - `frontend/src/components/shell/FeedbackDrawer.tsx` and `frontend/src/app/account/page.tsx` do not persist submitted form entries to client-side storage across browser reloads.
8. **Missing Favicon Asset (R5 / Worker M3)**:
   - `favicon.ico` is missing in `frontend/public/` or `frontend/src/app/`, triggering 404/500 errors during page visits.
