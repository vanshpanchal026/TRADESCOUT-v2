# 🔬 TRADESCOUT Research & Reverse-Engineering Vault

> **Imported Context from Conversation:** `Website Tech Stack and Architecture Analysis` (`27c18536-f6cb-409a-bfed-4ac05e6bc0e8`)  
> **Target Analyzed:** `https://scanthecharts.com` and `/warmup`  
> **Status:** Fully Imported & Documented into TRADESCOUT Repository

---

## 1. Directory Overview & Navigational Map

This directory contains the original reverse-engineering findings, live network traffic captures, benchmark reports, and real API response fixtures that served as the architectural blueprint for **TRADESCOUT**.

```
research/
├── README.md                                 # This master research guide & index
├── scanthecharts-architecture-teardown.md   # Complete technical teardown & topology of ScanTheCharts
├── data-sources-benchmark-report.md         # Live tests of free Parquet & open-source market data
├── cost-and-resource-breakdown.md           # Funds, cloud infrastructure & zero-cost scaling plan
└── api-fixtures/                            # Real captured JSON payloads from live website
    ├── api_metadata.json                     # Market universe total (3,037 stocks) & timestamps
    ├── api_catalysts.json                    # Corporate catalysts (FDA, capex, orders, bonus)
    ├── api_scan_earnings-calendar.json       # Quarterly earnings schedule & YoY metrics
    ├── api_scan_options.json                 # Master list of 23 sectors & 100+ industries
    ├── api_stock_RELIANCE.json               # Full 950+ OHLCV candlestick bars & indicators
    ├── api_stock_RELIANCE_concalls.json      # Direct PDF links to NSE earnings concalls
    ├── api_stock_RELIANCE_financials.json    # 5-year and 8-quarter financial statements
    ├── api_stock_RELIANCE_fundamentals.json  # P/E, EPS growth, Market Cap, OPM
    ├── api_stock_RELIANCE_intraday.json      # 1,500 1-minute intraday candlestick bars
    ├── api_stock_RELIANCE_notes.json         # Business snapshot notes & credit ratings
    ├── api_scanners.json                     # Master list of available platform scanners
    ├── api_scanners_trend-template.json      # Minervini 8-Rule Trend Template scan output
    ├── api_scanners_recent-breakout.json     # Breakout setups with volume confirmation
    ├── api_scanners_4pct-breakout.json       # Daily +4% momentum surge results
    ├── api_scanners_high-volume.json         # High relative volume (RVol > 2x) results
    ├── api_scanners_1m-gainers.json          # 1-month momentum performance leaders
    ├── api_live_status.json                  # Intraday engine sync status & delay state
    ├── routes_summary.json                   # Complete map of 14 front-end routes & chunks
    ├── chunk_analysis_report.json            # Deep breakdown of Webpack bundle dependencies
    ├── scanners_test_results.json            # Automated test verification for scanner endpoints
    └── stock_apis_test_results.json          # Automated test verification for stock endpoints
```

---

## 2. Key Insights & Architecture Discoveries

### A. The Core Secret of ScanTheCharts
ScanTheCharts is not backed by an expensive enterprise market feed (e.g., Bloomberg, Refinitiv). It is built as a **mathematical pre-calculation engine**:
1. EOD market data from NSE Bhavcopy is ingested post-market (16:00 IST).
2. Indicators (Moving Averages, Relative Strength rating, Weinstein Stages, Minervini Rules) are pre-calculated in vectorized batches.
3. Pre-computed outputs are serialized to cached JSON endpoints.
4. The client browser renders these instantly using **TradingView Lightweight Charts v4** (HTML5 Canvas).

### B. The Zero-Scraper Breakthrough
Instead of scraping NSE's fragile, Cloudflare-protected web pages, TRADESCOUT utilizes free, daily-updated Hugging Face Parquet repositories:
- `vishnun0027/indian-market-historical-ohlcv`: 2,675 per-stock Parquet files for instant stock detail charting (< 1.1s latency).
- `tejhq/indian-markets`: 34.3M rows of complete Bhavcopy and delivery percentage data for running full-market scanner sweeps in < 2 seconds via **Polars**.
- `bfinance`: Fast programmatic access to quarterly results, balance sheets, and conference call transcript PDFs.

### C. The `/warmup` Algorithm
The popular *"The Market Read"* morning ritual feature was deconstructed into:
1. **Participation Gauges:** `%` of stocks trading above 20-day, 50-day, and 200-day SMAs.
2. **Relative Momentum Engine (RME):** Index classifying market state from *Washed Out* to *Stretched*.
3. **Small-Cap Leadership:** Relative ratio between Nifty Smallcap 250 and Nifty 50.
4. **Breakout Health Ratio:** Tracking the percentage of base breakouts succeeding vs failing.
5. **Stage Analysis:** Ratio of stocks in Stan Weinstein Stage 2 (Markup) vs Stage 4 (Downtrend).

---

## 3. How to Use the API Fixtures in Development

The JSON files located in `research/api-fixtures/` provide exact real-world response payloads. Developers and automated agents should use them to:

### 1. Mock Backend Services for Frontend Scaffolding:
Instead of waiting for the database or data pipeline to be built, Next.js components can consume these JSON fixtures directly:
```typescript
// Example: Mocking the Trend Template scanner
import trendTemplateMock from '@/research/api-fixtures/api_scanners_trend-template.json';

export async function getTrendTemplateStocks() {
  if (process.env.NEXT_PUBLIC_USE_MOCK === 'true') {
    return trendTemplateMock.results;
  }
  const res = await fetch(`${process.env.API_BASE_URL}/api/scanners/trend-template`);
  return res.json();
}
```

### 2. Verify Pydantic v2 Schema Compatibility:
When writing FastAPI models in `Backend scheme.md` / `api/schemas/`, compare your Pydantic model definitions against the raw JSON structure in `api-fixtures/` to ensure 100% field parity:
- Number formatting: Indian numbering system (Crores, Lakhs) vs raw floats.
- Candle timestamps: Unix epoch seconds (`time: 1731369600`) vs ISO date strings.
- Nullability: Handling IPOs with less than 200 trading days.

### 3. Unit & Integration Testing:
Load fixtures in Pytest test suites (`Testing-Strategy.md`) to assert that the vectorized Polars calculations produce outputs matching the benchmark figures.

---

## 4. Cross-Reference to Root Specifications

Every file in `research/` is directly connected to the project's engineering blueprint:
- **`PRD.md`**: Product requirements, scanner logic, and user personas informed by teardown findings.
- **`TechStack.md`**: Justification for Next.js 14, FastAPI, Polars, Supabase, and Lightweight Charts.
- **`data-pipeline.md`**: Implementation plan for the zero-scraper Parquet ingestion engine.
- **`API-Spec.md`**: Complete OpenAPI contracts derived from the 17 discovered endpoints.
- **`DesignDocument.md`**: UI/UX, typography (Hanken Grotesk), dark mode theme, and canvas chart layout.
- **`memory.md`**: Living state board and architectural decision log.
