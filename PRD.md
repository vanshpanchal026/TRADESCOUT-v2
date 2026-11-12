# TRADESCOUT — Product Requirements Document

> **Version:** 1.0  
> **Author:** Vansh Panchal  
> **Last Updated:** November 2026  
> **Status:** Draft → In Development

---

## Table of Contents

- [1. Product Vision](#1-product-vision)
- [2. Problem Statement](#2-problem-statement)
- [3. Target Users](#3-target-users)
- [4. User Personas](#4-user-personas)
- [5. Core Features](#5-core-features)
- [6. Information Architecture & Routes](#6-information-architecture--routes)
- [7. Scanner Data Model](#7-scanner-data-model)
- [8. API Surface](#8-api-surface)
- [9. Monetisation — Freemium Model](#9-monetisation--freemium-model)
- [10. Non-functional Requirements](#10-non-functional-requirements)
- [11. Success Metrics](#11-success-metrics)
- [12. Risks & Mitigations](#12-risks--mitigations)
- [13. Roadmap](#13-roadmap)
- [14. Glossary](#14-glossary)

---

## 1. Product Vision

**TRADESCOUT** is an NSE (National Stock Exchange) stock screening and market analysis platform purpose-built for Indian retail swing traders. Inspired by [ScanTheCharts.com](https://scanthecharts.com), TRADESCOUT adapts the proven mechanics of Minervini's Trend Template, Weinstein Stage Analysis, and CANSLIM methodology specifically for the Indian equity market.

> **"Scout the best trade setups — before the crowd."**

The platform replaces the fragmented workflow Indian traders currently endure — jumping between Chartink, Screener.in, TradingView, and manual spreadsheets — with a single, cohesive, fast, and beautiful interface.

### Why "TRADESCOUT"?

The name blends English trading terminology with a scouting metaphor: the platform *scouts* the market every day, identifies the strongest setups, and delivers them to the trader on a silver platter. The Hindi resonance of "Scout" (खोजी) reinforces the idea of a sharp-eyed hunter in the market jungle.

### Core Value Propositions

| # | Value Proposition | Description |
|---|---|---|
| 1 | **Daily Market Read** | One-screen morning warmup showing market health, breadth, and daily cues |
| 2 | **Pre-built Scanners** | Battle-tested scans (Trend Template, VCP, Breakout) tuned for NSE liquidity |
| 3 | **Custom Scanner Builder** | Build and save your own scans with 100+ data fields |
| 4 | **Professional Charts** | TradingView Lightweight Charts with full technical overlay suite |
| 5 | **Relative Strength** | IBD-style RS Rating, RS Line, and Relative Rotation Graphs |
| 6 | **Sector Intelligence** | Industry group RS rankings, sector rotation analysis, heatmaps |
| 7 | **Watchlist Management** | Persistent, synced watchlists with quick preview charts |
| 8 | **Zero Data Cost** | 100% free data sourced from Hugging Face open datasets |

---

## 2. Problem Statement

Indian retail swing traders face a fragmented ecosystem:

1. **Chartink** provides scans but no charting, no RS rating, no stage analysis, and a cluttered UI.
2. **Screener.in** is fundamentals-focused with no technical scanning capability.
3. **TradingView** requires manual chart-by-chart analysis with no bulk scanning.
4. **No Indian equivalent** of ScanTheCharts exists that combines market-read, scanners, RS ratings, and professional charts in one tool.
5. **Data access** is painful — NSE's website blocks scrapers, and paid APIs (like EODHistoricalData, TrueData) cost ₹5,000–₹20,000/year.

**TRADESCOUT solves this** by combining all five functions into one product, powered entirely by free, open data sources.

---

## 3. Target Users

### Primary Audience

| Segment | Description | Estimated Size (India) |
|---|---|---|
| **NSE Swing Traders** | Hold stocks 2–12 weeks. Follow Minervini, Weinstein, O'Neil. | ~2M active |
| **CANSLIM Investors** | CAN SLIM methodology — growth stocks with institutional sponsorship. | ~500K |
| **Momentum Traders** | Buy breakouts, ride trends, sell on breakdowns. | ~1.5M |

### Secondary Audience

| Segment | Description |
|---|---|
| **Part-time Traders** | Working professionals who trade on the side; need fast daily scans |
| **Trading Educators** | YouTubers, Telegram group admins who share setups with followers |
| **SEBI-registered RAs** | Research analysts who need screening tools for client advisory |

### Geographic Focus

- **Primary:** India (NSE/BSE)
- **Language:** English UI with Hindi context awareness (stock names, sector terminology)
- **Time Zone:** IST (UTC+5:30). Market hours: 9:15 AM – 3:30 PM IST.

---

## 4. User Personas

### Persona 1: Raj — The Weekend Screener (Beginner)

| Attribute | Detail |
|---|---|
| **Age** | 26 |
| **Occupation** | Software engineer at a Bangalore startup |
| **Trading Experience** | 1 year; opened a Zerodha account during COVID |
| **Behaviour** | Checks markets on weekends. Follows FinTwit. Recently read "Trade Like a Stock Market Wizard." |
| **Pain Points** | Doesn't know how to scan for Trend Template stocks. Spends 3 hours on Chartink getting overwhelmed by 200+ scans. No idea what RS Rating means. |
| **TRADESCOUT Value** | Opens `/warmup` on Sunday evening, sees the market is healthy, runs "Trend Template" scanner, gets 15 qualifying stocks, opens charts, adds 3 to watchlist. Done in 20 minutes. |
| **Tier** | Free |

### Persona 2: Priya — The Disciplined Swing Trader (Intermediate)

| Attribute | Detail |
|---|---|
| **Age** | 34 |
| **Occupation** | CA running her own practice in Pune |
| **Trading Experience** | 4 years; consistently profitable last 2 years |
| **Behaviour** | Runs scans every morning at 7 AM before office. Maintains 3 watchlists. Tracks RS ratings. Follows Minervini's weekly routine. |
| **Pain Points** | Uses 4 different tools daily. Exports CSVs from Chartink, pastes into Excel, manually calculates RS. Wants one dashboard. |
| **TRADESCOUT Value** | Opens `/warmup` at 7 AM — sees Stage 2 count rising, RME washed out (bullish), 12 breakouts yesterday. Runs "Near Pivot" scanner → gets VCP-forming stocks near buy point. Opens `/stock/PERSISTENT` → checks RS Line trending up, SMA 50 > 150 > 200, volume dry-up. Adds to "Ready to Buy" watchlist. |
| **Tier** | Premium (₹499/month) |

### Persona 3: Arjun — The Full-Time Trader (Advanced)

| Attribute | Detail |
|---|---|
| **Age** | 42 |
| **Occupation** | Full-time trader in Mumbai; previously worked at HDFC Securities |
| **Trading Experience** | 15 years; manages a small PMS (₹5 Cr AUM) |
| **Behaviour** | Runs intraday scans during market hours. Builds custom scans. Tracks sector rotation weekly. Needs concall summaries for earnings plays. |
| **Pain Points** | Pays ₹15,000/year for TrueData + ₹8,000 for Chartink Pro. Still manually tracks sector rotation in Excel. No Indian RRG tool exists. |
| **TRADESCOUT Value** | Uses `/rrg` to identify sectors rotating from Improving → Leading. Runs custom scanner filtering RS > 85, Stage 2, Vol > 1.5x avg. Checks `/intraday` for live breakout alerts. Reviews `/results` for upcoming earnings in holdings. |
| **Tier** | Premium (₹499/month) |

---

## 5. Core Features

### 5.1 Warmup / Market Read (`/warmup`)

The daily pre-market briefing screen. One page that answers: *"Is today a day to be aggressive, or defensive?"*

#### Components

| Component | Description | Data Source |
|---|---|---|
| **Market Participation Gauges** | % of Nifty 500 stocks above SMA 20, 50, 200. Circular gauge visualisation. | Computed from `tejhq/indian-markets` daily |
| **RME Sentiment Meter** | Risk-Management Environment indicator. Scale: Washed Out → Neutral → Stretched. Based on % stocks > 20% above 50 DMA. | Computed |
| **Stage Distribution** | Bar chart showing # of stocks in Stage 1 (basing), Stage 2 (uptrend), Stage 3 (topping), Stage 4 (decline). Stage 2 vs 4 ratio signals market health. | Computed via Weinstein stage rules |
| **Breakout Health Ratio** | Ratio of successful breakouts (closing above pivot after 5 days) to failed breakouts in last 20 sessions. | Computed |
| **Daily Cues** | 3–5 bullet-point market observations. Auto-generated from breadth data shifts. | `/api/cues` |
| **Nifty 50 Chart** | Mini TradingView chart with SMA 50/200 and key levels. | Hugging Face data |
| **Earnings Calendar Widget** | Next 5 trading days' earnings announcements. Expandable. | `bfinance` SDK |
| **Advance-Decline Line** | Cumulative A/D line overlaid on Nifty 50. | Computed |

#### UX Notes

- Dark mode by default (CSS class `dark`, persisted to `localStorage` key `stc-theme`).
- Auto-refreshes every 60 seconds during market hours (9:15 AM – 3:30 PM IST).
- Skeleton loading states for each card during data fetch.
- Responsive: stacks vertically on mobile.

---

### 5.2 Scanners (`/scanners`, `/scanners/:slug`)

The core product loop. Pre-built scans covering the most common momentum/swing setups.

#### Pre-built Scanners

| Scanner Slug | Name | Description | Criteria Summary |
|---|---|---|---|
| `trend-template` | **Trend Template** | Minervini's 8-point trend template | SMA 50 > 150 > 200, Price > SMA 50, SMA 200 rising 1 month+, Price ≥ 25% above 52-week low, Price within 25% of 52-week high |
| `recent-breakout` | **Recent Breakout** | Stocks that broke out of a base in the last 5 sessions | Volume > 1.5x avg, Close > pivot, Base depth < 35% |
| `4pct-breakout` | **4% Breakout** | Stocks that moved 4%+ on above-average volume today | Daily change ≥ 4%, Volume > 1.5x 50-day avg |
| `high-volume` | **High Volume** | Unusual volume activity | Volume > 2x 50-day avg, Price > SMA 200 |
| `1m-gainers` | **1M Gainers** | Top performers over last 21 trading sessions | Sorted by 1-month % return, RS Rating > 70 |
| `near-pivot` | **Near Pivot** | Stocks within 5% of a pivot/buy point | VCP or flat base pattern, Within 5% of pivot, Volume contraction |
| `vcp` | **VCP** | Volatility Contraction Pattern | ≥ 3 contractions, Each tighter than previous, Volume declining, Price > SMA 200 |

#### Custom Scanner Builder (`/scanners/custom`)

- Drag-and-drop condition builder.
- Available fields fetched from `/api/scan/options` endpoint.
- Condition operators: `>`, `<`, `>=`, `<=`, `=`, `between`, `in`.
- Combine conditions with AND/OR logic.
- Save custom scans to Supabase (`saved_scans` table).
- Share scans via URL with encoded query params.

#### Scanner Results UI

- Table view (default): Sortable columns, sticky header.
- Card view: Mini chart + key metrics per stock.
- **Free tier:** Top 10 results visible; remaining rows blurred with premium CTA.
- **Premium tier:** Full results, CSV export, sort by any column.
- Click any row → navigates to `/stock/:symbol`.

---

### 5.3 Stock Detail (`/stock/:symbol`)

The single-stock deep-dive page. Everything a swing trader needs to evaluate a setup.

#### Chart Tab (Default)

| Feature | Implementation |
|---|---|
| **Candlestick Chart** | `lightweight-charts` v4 → `chart.addCandlestickSeries()`. OHLC data from `vishnun0027/indian-market-historical-ohlcv` |
| **Moving Averages** | SMA 10 (grey), SMA 20 (blue), SMA 50 (red), SMA 200 (black) via `chart.addLineSeries()` |
| **EMA Overlay** | EMA 21 (optional toggle) |
| **RSI Panel** | 14-period RSI in a separate pane below price chart. Overbought (70) / Oversold (30) reference lines |
| **MACD Panel** | MACD (12,26,9) histogram + signal line in bottom pane |
| **Volume Histogram** | `chart.addHistogramSeries()` — green for up days, red for down days |
| **Pivot / Breakout Lines** | Horizontal lines at detected pivot levels. Dashed style. User can add/edit. Stored in `chart_drawings` table |
| **Tight Areas** | Highlighted zones where price range contracted (visual VCP identification) |
| **Inside Bars** | Marked with a small dot above the candle |
| **RS Line** | Separate mini-chart showing stock's performance relative to Nifty 50 (cumulative ratio) |

#### Fundamentals Tab

| Data Point | Source |
|---|---|
| Market Cap, P/E, P/B, ROE, ROCE | `bfinance` SDK |
| EPS (TTM), EPS Growth YoY/QoQ | `bfinance` SDK |
| Revenue & PAT (quarterly, yearly) | `bfinance` SDK |
| Promoter %, FII %, DII %, Public % | `bfinance` SDK |
| Shareholding trend (last 4 quarters) | `bfinance` SDK |
| Debt/Equity ratio | `bfinance` SDK |

#### Financials Tab

- Quarterly and annual P&L, Balance Sheet, Cash Flow.
- Interactive table with expandable line items.
- Data from `bfinance` SDK.

#### Concalls Tab

- Earnings call transcripts (when available).
- Key highlights extracted.
- Source: `bfinance` SDK.

#### Notes Tab

- User's personal notes for this stock.
- Rich text editor (Markdown support).
- Synced to Supabase per user.

---

### 5.4 Watchlists (`/watchlists`)

| Feature | Description |
|---|---|
| **Create Watchlist** | Name + optional description. Stored in `watchlists` table |
| **Add/Remove Stocks** | From any scanner result or stock detail page. Stored in `watchlist_items` |
| **Quick Preview** | Hover/click a stock in the watchlist → mini chart + key metrics (CMP, RS, Stage) |
| **Drag Reorder** | Reorder stocks within a watchlist via drag-and-drop |
| **Bulk Actions** | Select multiple → move to another list, remove, export CSV |
| **Default Lists** | "Favourites" list auto-created for every user (via `favourites` table) |
| **Limits** | Free: 3 watchlists, 20 stocks each. Premium: unlimited |

---

### 5.5 Groups / Sectors (`/groups`)

Sector rotation analysis for Nifty sector indices and custom industry groups.

| Feature | Description |
|---|---|
| **Industry Group RS Rankings** | All NSE industry groups ranked by 3-month relative strength vs Nifty 50 |
| **Sector Performance Table** | 1D, 1W, 1M, 3M, 6M, 1Y returns for each Nifty sector index |
| **Drill-down** | Click a sector → see all constituent stocks, sorted by RS Rating |
| **Historical RS Chart** | Line chart showing sector RS over time |
| **Top 3 / Bottom 3** | Highlighted cards for strongest and weakest sectors |

---

### 5.6 Heatmap (`/heatmap`)

Treemap visualization of the Nifty 500 universe, weighted by market capitalization, coloured by daily/weekly/monthly returns.

| Feature | Description |
|---|---|
| **Colour Scale** | Deep red (-5%+) → red → orange → grey (0%) → light green → green → deep green (+5%+) |
| **Time Periods** | Toggle: 1D, 1W, 1M, 3M, YTD |
| **Grouping** | By sector (default), by industry group, flat |
| **Hover Tooltip** | Stock name, CMP, change %, market cap |
| **Click** | Navigate to `/stock/:symbol` |
| **Responsiveness** | Reflows to 2-column grid on mobile |

---

### 5.7 Relative Rotation Graph (`/rrg`)

Interactive RRG chart plotting sector indices on a 4-quadrant scatter plot.

| Quadrant | Meaning | Colour |
|---|---|---|
| **Leading** (top-right) | Strong RS momentum, strong RS | Green |
| **Weakening** (bottom-right) | Strong RS, declining momentum | Yellow |
| **Lagging** (bottom-left) | Weak RS, weak momentum | Red |
| **Improving** (top-left) | Weak RS, improving momentum | Blue |

- **Tail Length:** Configurable (4, 8, 12 weeks).
- **Benchmark:** Nifty 50 (center point).
- **Interactivity:** Click a sector to highlight its trail. Toggle sectors on/off.
- **Data:** Weekly RS-Ratio and RS-Momentum computed from Nifty sector index closing prices.

---

### 5.8 Leaders (`/leaders`)

Top RS-rated stocks across the NSE universe.

| Feature | Description |
|---|---|
| **RS Rating Leaderboard** | Top 50 stocks by IBD-style RS Rating (percentile rank of 12-month weighted relative performance) |
| **Sector Leaders** | Top 3 RS-rated stocks per sector |
| **New Highs List** | Stocks making 52-week / all-time highs today |
| **Filters** | By market cap (Large / Mid / Small), by sector, by minimum RS rating |

---

### 5.9 Earnings Calendar (`/results`)

| Feature | Description |
|---|---|
| **Calendar View** | Monthly calendar with dots on dates that have earnings |
| **List View** | Chronological list of upcoming earnings (next 30 days) |
| **Past Results** | Historical earnings with actual vs. estimate (when available) |
| **Watchlist Filter** | Show only earnings for stocks in your watchlists |
| **Data Source** | `bfinance` SDK earnings schedule |

---

### 5.10 News & Catalysts (`/news`)

| Feature | Description |
|---|---|
| **Catalyst Feed** | Curated market-moving news: block deals, bulk deals, board meetings, SEBI actions |
| **Stock-level News** | Filtered news feed on each `/stock/:symbol` page |
| **Source Attribution** | Each item links to original source (BSE filings, exchange announcements) |

---

### 5.11 Intraday (`/intraday`) — Premium

| Feature | Description |
|---|---|
| **Live Dashboard** | Real-time market breadth, sector moves, top gainers/losers |
| **Intraday Charts** | 1-min, 5-min, 15-min candlestick charts |
| **Breakout Alerts** | Stocks breaking out of intraday ranges on volume |
| **Access** | Premium-only. Protected route. |
| **Data Refresh** | WebSocket or 15-second polling during market hours |

---

### 5.12 Screen (`/screen`)

Advanced multi-criteria screening tool (power-user oriented).

| Feature | Description |
|---|---|
| **Field Selector** | Choose from 100+ data fields (see Scanner Data Model below) |
| **Condition Builder** | Multi-condition filtering with AND/OR grouping |
| **Results Preview** | Live-updating result count as conditions are modified |
| **Save & Name** | Persist custom screens to `saved_scans` table |
| **Quick Filters** | Pre-set filter chips: "Large Cap", "Stage 2 Only", "RS > 80", "Low Debt" |

---

## 6. Information Architecture & Routes

```
/                       → Landing page (marketing + login CTA)
/warmup                 → Market Read / Daily Warmup
/scanners               → Scanner index (all pre-built scans)
/scanners/:slug         → Scanner results (e.g., /scanners/trend-template)
/scanners/custom        → Custom scanner builder
/stock/:symbol          → Stock detail page (e.g., /stock/RELIANCE)
/watchlists             → User's watchlists
/groups                 → Sector / Industry group analysis
/heatmap                → Market heatmap (treemap)
/rrg                    → Relative Rotation Graph
/leaders                → RS leaders & new highs
/results                → Earnings calendar
/news                   → News & catalysts feed
/intraday               → Live intraday dashboard (premium)
/screen                 → Advanced screener
/settings               → User preferences, subscription management
/login                  → Supabase Auth (email + Google OAuth)
/signup                 → Registration
```

---

## 7. Scanner Data Model

Every stock in the scanner output carries 100+ computed fields. These are recalculated daily after market close (~4:00 PM IST) and cached in Redis.

### Price & Moving Averages

| Field | Type | Description |
|---|---|---|
| `symbol` | `string` | NSE trading symbol (e.g., `RELIANCE`) |
| `name` | `string` | Company name |
| `isin` | `string` | ISIN code |
| `series` | `string` | NSE series (EQ, BE, etc.) |
| `cmp` | `float` | Current Market Price (last close) |
| `open` | `float` | Today's open |
| `high` | `float` | Today's high |
| `low` | `float` | Today's low |
| `prev_close` | `float` | Previous session close |
| `change_pct` | `float` | Daily % change |
| `sma_10` | `float` | 10-day Simple Moving Average |
| `sma_20` | `float` | 20-day Simple Moving Average |
| `sma_50` | `float` | 50-day Simple Moving Average |
| `sma_150` | `float` | 150-day Simple Moving Average |
| `sma_200` | `float` | 200-day Simple Moving Average |
| `ema_21` | `float` | 21-day Exponential Moving Average |
| `price_vs_sma50` | `float` | % distance from SMA 50 |
| `price_vs_sma200` | `float` | % distance from SMA 200 |
| `sma200_rising` | `bool` | SMA 200 has been rising for ≥ 1 month |

### Relative Strength & Stage

| Field | Type | Description |
|---|---|---|
| `rs_rating` | `int` | IBD-style RS Rating (1–99 percentile). Weighted: 40% 3M, 20% 6M, 20% 9M, 20% 12M performance vs Nifty 500 |
| `rs_line_trend` | `string` | `rising` / `flat` / `falling` — 20-day trend of RS line |
| `stage` | `int` | Weinstein Stage (1, 2, 3, 4) |
| `stage_name` | `string` | `Basing`, `Uptrend`, `Topping`, `Decline` |
| `industry_rs_rating` | `int` | RS Rating of the stock's industry group (1–99) |

### Momentum & Volatility

| Field | Type | Description |
|---|---|---|
| `rsi` | `float` | 14-period RSI |
| `macd` | `float` | MACD line value |
| `macd_signal` | `float` | MACD signal line value |
| `macd_histogram` | `float` | MACD histogram value |
| `rvol` | `float` | Relative Volume (today's vol / 50-day avg vol) |
| `adr_pct` | `float` | Average Daily Range % (20-day) |
| `from_52w_high` | `float` | % below 52-week high |
| `from_52w_low` | `float` | % above 52-week low |
| `consolidation_days` | `int` | Days in current base/consolidation |
| `base_depth` | `float` | Depth of current base (% from high to low of base) |

### Volume

| Field | Type | Description |
|---|---|---|
| `volume` | `int` | Today's traded volume |
| `avg_volume_50` | `int` | 50-day average volume |
| `turnover` | `float` | Today's turnover (₹) |
| `delivery_pct` | `float` | Delivery percentage (from NSE delivery data) |

### Fundamentals

| Field | Type | Description |
|---|---|---|
| `market_cap` | `float` | Market capitalisation (₹ Cr) |
| `pe` | `float` | Price-to-Earnings (TTM) |
| `pb` | `float` | Price-to-Book |
| `roe` | `float` | Return on Equity (%) |
| `roce` | `float` | Return on Capital Employed (%) |
| `debt_equity` | `float` | Debt-to-Equity ratio |
| `eps_ttm` | `float` | Earnings Per Share (TTM) |
| `eps_growth_yoy` | `float` | EPS growth Year-over-Year (%) |
| `eps_growth_qoq` | `float` | EPS growth Quarter-over-Quarter (%) |
| `revenue_growth_yoy` | `float` | Revenue growth YoY (%) |
| `pat_growth_yoy` | `float` | PAT growth YoY (%) |

### Ownership

| Field | Type | Description |
|---|---|---|
| `promoter_pct` | `float` | Promoter holding (%) |
| `promoter_pledge_pct` | `float` | Promoter pledged shares (%) |
| `fii_pct` | `float` | FII/FPI holding (%) |
| `dii_pct` | `float` | DII (MF + Insurance) holding (%) |
| `public_pct` | `float` | Public holding (%) |
| `fii_change_qoq` | `float` | Change in FII holding vs. previous quarter (pp) |
| `dii_change_qoq` | `float` | Change in DII holding vs. previous quarter (pp) |

### Scanner-specific

| Field | Type | Description |
|---|---|---|
| `conditions_met` | `int` | Number of Trend Template conditions satisfied (out of 8) |
| `trend_template_pass` | `bool` | All 8 Trend Template conditions met |
| `vcp_detected` | `bool` | VCP pattern detected |
| `vcp_contractions` | `int` | Number of volatility contractions |
| `pivot_price` | `float` | Detected buy-point / pivot level |
| `distance_to_pivot` | `float` | % from CMP to pivot |
| `breakout_volume_ratio` | `float` | Breakout-day volume / 50-day avg |
| `inside_bar` | `bool` | Today is an inside bar |
| `tight_close_count` | `int` | Number of tight closes in last 10 sessions (< 1.5% range) |

---

## 8. API Surface

### Public Endpoints (No Auth Required)

| Method | Path | Description | Response |
|---|---|---|---|
| `GET` | `/api/scanners` | List all available scanners | `[{slug, name, description, count}]` |
| `GET` | `/api/scanners/:slug` | Run a scanner. Query: `?limit=10&offset=0&sort=rs_rating&order=desc` | `{results: [...], total, is_premium}` |
| `GET` | `/api/scan/options` | Available fields + operators for custom scanner | `{fields: [{name, type, operators, range}]}` |
| `POST` | `/api/scan/custom` | Execute a custom scan | `{conditions: [...]} → {results, total}` |
| `GET` | `/api/stock/:symbol` | Stock overview + latest metrics | `{symbol, name, metrics: {...}, chart_data_url}` |
| `GET` | `/api/stock/:symbol/chart` | OHLCV data. Query: `?period=1y&interval=1d` | `[{time, open, high, low, close, volume}]` |
| `GET` | `/api/stock/:symbol/fundamentals` | Fundamental data | `{pe, pb, roe, roce, ...}` |
| `GET` | `/api/stock/:symbol/financials` | Quarterly + annual financials | `{quarterly: [...], annual: [...]}` |
| `GET` | `/api/warmup` | Market warmup / read data | `{breadth, rme, stages, breakout_ratio, ...}` |
| `GET` | `/api/heatmap` | Heatmap data. Query: `?period=1d&group=sector` | `[{symbol, name, sector, market_cap, change_pct}]` |
| `GET` | `/api/rrg` | RRG data for sectors | `[{sector, rs_ratio, rs_momentum, trail: [...]}]` |
| `GET` | `/api/leaders` | RS leaders list | `[{symbol, rs_rating, stage, cmp, ...}]` |
| `GET` | `/api/groups` | Sector/industry group rankings | `[{group, rs_rating, returns: {...}}]` |
| `GET` | `/api/results` | Earnings calendar | `[{symbol, date, quarter, ...}]` |
| `GET` | `/api/news` | Market news feed | `[{title, source, date, symbols: [...]}]` |

### Protected Endpoints (Auth Required)

| Method | Path | Description | Tier |
|---|---|---|---|
| `GET` | `/api/cues` | AI-generated daily market cues | Premium |
| `GET` | `/api/indices` | Index data (Nifty 50, Nifty 500, sector indices) | Premium |
| `GET` | `/api/scanners/near-pivot` | Near Pivot scanner (full results) | Premium |
| `GET` | `/api/scanners/vcp` | VCP scanner (full results) | Premium |
| `GET` | `/api/market-breadth` | Detailed market breadth data | Premium |
| `GET` | `/api/live/dashboard` | Live intraday dashboard data | Premium |
| `GET` | `/api/watchlists` | User's watchlists | Free (auth) |
| `POST` | `/api/watchlists` | Create a watchlist | Free (auth) |
| `PUT` | `/api/watchlists/:id` | Update a watchlist | Free (auth) |
| `DELETE` | `/api/watchlists/:id` | Delete a watchlist | Free (auth) |
| `POST` | `/api/watchlists/:id/items` | Add stock to watchlist | Free (auth) |
| `DELETE` | `/api/watchlists/:id/items/:symbol` | Remove stock from watchlist | Free (auth) |
| `GET` | `/api/user/preferences` | User UI preferences | Free (auth) |
| `PUT` | `/api/user/preferences` | Update preferences | Free (auth) |
| `POST` | `/api/stock/:symbol/notes` | Save notes for a stock | Free (auth) |
| `GET` | `/api/stock/:symbol/drawings` | Get chart drawings | Free (auth) |
| `POST` | `/api/stock/:symbol/drawings` | Save chart drawings | Free (auth) |

### Error Schema (Pydantic v2)

All API errors return a consistent schema:

```json
{
  "detail": [
    {
      "loc": ["query", "limit"],
      "msg": "value is not a valid integer",
      "type": "type_error.integer"
    }
  ]
}
```

HTTP status codes: `200` (OK), `401` (Unauthorized), `403` (Premium required), `404` (Not found), `422` (Validation error), `429` (Rate limited), `500` (Server error).

---

## 9. Monetisation — Freemium Model

### Free Tier

| Feature | Limit |
|---|---|
| Scanner results | Top 10 per scan |
| Watchlists | 3 watchlists, 20 stocks each |
| Stock detail pages | Unlimited |
| Chart overlays | SMA 50, SMA 200 only |
| Market warmup | Basic (no cues) |
| Heatmap | 1D period only |
| Custom scans | 2 saved scans |

### Premium Tier — ₹499/month or ₹3,999/year

| Feature | Access |
|---|---|
| Scanner results | **Full results** + CSV export |
| Watchlists | **Unlimited** watchlists, unlimited stocks |
| Chart overlays | **All** — SMA 10/20/50/150/200, EMA, RSI, MACD |
| Market warmup | **Full** — cues, breadth, RME |
| Custom scans | **Unlimited** saved scans |
| Near Pivot & VCP | **Full access** |
| RRG | **Full interactivity** |
| Intraday | **Live dashboard** |
| Market breadth | **Detailed breadth data** |
| Heatmap | **All periods** |
| Priority support | **Email + Telegram** |

### Payment Integration

- Razorpay (Indian payment gateway).
- UPI, Credit/Debit Card, Net Banking support.
- Webhook for subscription lifecycle → Supabase `profiles.subscription_tier` update.

---

## 10. Non-functional Requirements

| Requirement | Target | Notes |
|---|---|---|
| **API Latency** | < 200ms (p95) for scanner queries | Pre-computed results cached in Redis |
| **Page Load** | < 2s LCP on 4G | Next.js SSR + edge caching on Vercel |
| **Uptime** | 99.5% | Acceptable maintenance window: 4:00–6:00 AM IST |
| **Mobile Responsive** | Full parity on screens ≥ 375px | Tailwind responsive breakpoints |
| **Dark Mode** | Default. CSS class `dark` on `<html>`. Persisted via `localStorage` key `stc-theme` | Light mode toggle available |
| **Offline Cache** | Scanner results cached in browser | Service worker caches last 3 scanner results |
| **SEO** | SSR for public pages (`/stock/:symbol`, `/scanners`) | Dynamic OG images per stock page |
| **Accessibility** | WCAG 2.1 AA | Radix UI provides accessible primitives |
| **Security** | Row-Level Security (RLS) on all user tables | Supabase RLS policies; no direct DB access from client |
| **Rate Limiting** | 60 req/min (free), 300 req/min (premium) | FastAPI middleware |
| **Data Freshness** | EOD data updated by 4:30 PM IST | GitHub Actions trigger → Polars pipeline → Redis cache invalidation |
| **Browser Support** | Chrome 90+, Firefox 90+, Safari 15+, Edge 90+ | |

---

## 11. Success Metrics

### North Star Metric

**Weekly Active Scanners (WAS):** Number of unique users who run ≥ 1 scanner per week.

### Supporting KPIs

| Metric | Definition | Target (Month 3) | Target (Month 12) |
|---|---|---|---|
| **DAU** | Daily Active Users | 500 | 5,000 |
| **WAU** | Weekly Active Users | 1,500 | 15,000 |
| **Scanner Usage** | Avg. scans per user per session | 3 | 5 |
| **Watchlist Creation** | % of registered users who create ≥ 1 watchlist | 40% | 60% |
| **Premium Conversion** | Free → Premium conversion rate | 3% | 7% |
| **Premium Churn** | Monthly churn rate | < 10% | < 5% |
| **Session Duration** | Avg. time on site per session | 8 min | 15 min |
| **NPS** | Net Promoter Score | 30 | 50 |
| **Bounce Rate** | Single-page sessions on `/warmup` | < 30% | < 20% |

### Instrumentation

- **Analytics:** PostHog (self-hosted or cloud) for event tracking.
- **Events to Track:** `scanner_run`, `stock_viewed`, `watchlist_created`, `watchlist_stock_added`, `chart_drawing_saved`, `premium_upgrade_clicked`, `premium_subscribed`, `scan_exported`.

---

## 12. Risks & Mitigations

| Risk | Impact | Probability | Mitigation |
|---|---|---|---|
| **Hugging Face dataset stops updating** | No fresh data → scanners stale | Medium | `jugaad-data` as fallback data source. Monitor dataset update timestamps daily. |
| **NSE blocks Hugging Face data contributors** | Data pipeline broken | Low | Multiple HF datasets from different contributors. Community-maintained. |
| **`bfinance` SDK breaks or is discontinued** | No fundamental data | Medium | Abstract via data adapter pattern. `jugaad-data` partial fallback. Manual quarterly updates as last resort. |
| **Razorpay compliance changes** | Payment disruption | Low | Standard KYC compliance. Maintain Stripe as backup gateway. |
| **Competitor launches similar product** | Market share risk | Medium | Speed to market. Community building. Unique features (RRG, RS Rating). |
| **Supabase free tier limits hit** | DB throttling | Medium | Monitor row counts. Upgrade to Pro ($25/mo) when nearing 500MB. |
| **User data privacy (DPDP Act compliance)** | Legal risk | High | Minimal PII collection. Privacy policy. Data deletion endpoint. Consent management. |

---

## 13. Roadmap

### Phase 1 — MVP (Weeks 1–8)

- [x] Project setup (monorepo, CI/CD, Docker)
- [ ] Data pipeline: Hugging Face → Polars → Redis
- [ ] Core scanner engine (Trend Template, Recent Breakout, High Volume)
- [ ] Stock detail page with TradingView charts
- [ ] Warmup page (basic breadth gauges)
- [ ] Supabase Auth (email + Google)
- [ ] Basic watchlists
- [ ] Dark mode UI

### Phase 2 — Full Feature Set (Weeks 9–16)

- [ ] All 7 pre-built scanners
- [ ] Custom scanner builder
- [ ] Heatmap
- [ ] Groups / Sector analysis
- [ ] RS Rating computation + Leaders page
- [ ] RRG
- [ ] Earnings calendar
- [ ] Notes & chart drawings persistence

### Phase 3 — Premium & Growth (Weeks 17–24)

- [ ] Freemium gating (blur + CTA)
- [ ] Razorpay integration
- [ ] Intraday dashboard (premium)
- [ ] News feed
- [ ] PWA / offline caching
- [ ] SEO optimisation (dynamic OG, sitemap)
- [ ] Mobile optimisation pass

### Phase 4 — Scale & Iterate (Ongoing)

- [ ] AI-generated daily cues (LLM summarising breadth shifts)
- [ ] Alerts (email/Telegram when a stock triggers a scan)
- [ ] Backtesting (how did this scanner perform historically?)
- [ ] Community features (shared watchlists, public scans)
- [ ] Mobile app (React Native or Expo)

---

## 14. Glossary

| Term | Definition |
|---|---|
| **RS Rating** | Relative Strength Rating. Percentile rank (1–99) of a stock's price performance relative to all other stocks. Weighted formula: 40% 3-month + 20% 6-month + 20% 9-month + 20% 12-month return vs. Nifty 500. |
| **RS Line** | A line chart of Stock Price / Nifty 50 Price. Rising RS Line = outperforming the index. |
| **Trend Template** | Mark Minervini's 8-point checklist for identifying stocks in a confirmed Stage 2 uptrend. |
| **VCP** | Volatility Contraction Pattern. A base pattern where price contractions get progressively tighter, indicating supply absorption. Coined by Mark Minervini. |
| **Stage Analysis** | Stan Weinstein's framework dividing a stock's lifecycle into 4 stages: Basing (1), Advancing (2), Topping (3), Declining (4). |
| **CANSLIM** | William O'Neil's stock selection methodology: Current earnings, Annual earnings, New products/highs, Supply and demand, Leader or laggard, Institutional sponsorship, Market direction. |
| **RME** | Risk-Management Environment. A gauge of how "stretched" or "washed out" the market is based on the percentage of stocks trading significantly above their moving averages. |
| **RRG** | Relative Rotation Graph. A visualisation tool that plots securities on a scatter chart using RS-Ratio (x-axis) and RS-Momentum (y-axis) to show relative strength rotation. |
| **Pivot** | The price point at which a stock breaks out of a base pattern. The ideal buy point. |
| **ADR%** | Average Daily Range as a percentage. Measures a stock's average intraday volatility over 20 days. |
| **RVOL** | Relative Volume. Today's volume divided by the 50-day average volume. RVOL > 1.5 = unusual activity. |
| **Delivery %** | Percentage of traded volume that resulted in actual delivery (ownership transfer). High delivery % suggests genuine buying interest. NSE-specific metric. |

---

*Document maintained by Vansh Panchal. For questions, reach out on [GitHub](https://github.com/vanshpanchal) or [Twitter/X](https://x.com/vanshpanchal).*
