# E2E Test Infra: TRADESCOUT Production Readiness

## Test Philosophy
- Opaque-box, requirement-driven. No dependency on implementation design.
- Methodology: Category-Partition + BVA + Pairwise + Workload Testing.

## Feature Inventory
| # | Feature | Source (requirement) | Tier 1 | Tier 2 | Tier 3 |
|---|---------|---------------------|:------:|:------:|:------:|
| 1 | Stage 2 Breakout Scanner | ORIGINAL_REQUEST §R1 | 5 | 5 | ✓ |
| 2 | 20-SMA Pullback Scanner | ORIGINAL_REQUEST §R1 | 5 | 5 | ✓ |
| 3 | 3M Gainers Scanner | ORIGINAL_REQUEST §R1 | 5 | 5 | ✓ |
| 4 | Outperformers Scanner | ORIGINAL_REQUEST §R1 | 5 | 5 | ✓ |
| 5 | Doublers Scanner | ORIGINAL_REQUEST §R1 | 5 | 5 | ✓ |
| 6 | New Listing IPO Scanner | ORIGINAL_REQUEST §R1 | 5 | 5 | ✓ |
| 7 | Paywall Blur Link | ORIGINAL_REQUEST §R2 | 5 | 5 | ✓ |
| 8 | TopTabBar Label & Action | ORIGINAL_REQUEST §R2 | 5 | 5 | ✓ |
| 9 | Stock Detail Watchlist Sync | ORIGINAL_REQUEST §R3 | 5 | 5 | ✓ |
| 10 | TradingView Chart Favourites | ORIGINAL_REQUEST §R3 | 5 | 5 | ✓ |
| 11 | Intraday Screener Filters | ORIGINAL_REQUEST §R3 | 5 | 5 | ✓ |
| 12 | Scanner Pro Tier Dynamic Unlock | ORIGINAL_REQUEST §R4 | 5 | 5 | ✓ |
| 13 | Feedback Drawer Persistence | ORIGINAL_REQUEST §R4 | 5 | 5 | ✓ |
| 14 | Account Profile Persistence | ORIGINAL_REQUEST §R4 | 5 | 5 | ✓ |
| 15 | Login & Auth Persistence | ORIGINAL_REQUEST §R4 | 5 | 5 | ✓ |
| 16 | Favicon Asset Delivery | ORIGINAL_REQUEST §R5 | 5 | 5 | ✓ |
| 17 | Favourites Deduplication | ORIGINAL_REQUEST §R5 | 5 | 5 | ✓ |

## Test Architecture
- Test Runner: Playwright (`frontend/playwright.config.ts`) and Pytest (`backend/tests/`)
- Test case directory: `frontend/tests/e2e/production_readiness.spec.ts`
- Pass/Fail semantics: Exit code 0, 100% assertions green

## Real-World Application Scenarios (Tier 4)
| # | Scenario | Features Exercised | Complexity |
|---|----------|--------------------|------------|
| 1 | Pro Trader Market Scan Journey | F1-F6, F12, F7 | High |
| 2 | Stock Analysis to Watchlist Workflow | F9, F10, F17 | High |
| 3 | Intraday Fast Filter & Navigation | F8, F11, F16 | Medium |
| 4 | Identity Switch & Settings Persistence | F13, F14, F15, F12 | High |
| 5 | End-to-End Clean Refresh Journey | F9, F10, F14, F15, F16, F17 | High |

## Coverage Thresholds
- Tier 1: >=5 per feature
- Tier 2: >=5 per feature (boundary and corner cases)
- Tier 3: Pairwise coverage of major feature interactions
- Tier 4: >=5 realistic application scenarios
