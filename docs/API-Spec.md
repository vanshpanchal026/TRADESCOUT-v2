# TRADESCOUT — REST API Specification

> **Base URL:** `https://api.tradescout.in/api` (production) · `http://localhost:8000/api` (local)
>
> **Protocol:** HTTPS only in production. All responses are `application/json`.
>
> **Versioning:** URI path (`/api/v1/...`) reserved for future breaking changes. Current endpoints are unversioned (`/api/...`).

---

## Table of Contents

- [Authentication](#authentication)
- [Rate Limiting](#rate-limiting)
- [Error Responses](#error-responses)
- [Common Types](#common-types)
- [Public Endpoints](#1-public-endpoints)
  - [Market Metadata](#11-market-metadata)
  - [Scanner Endpoints](#12-scanner-endpoints)
  - [Custom Scan Options](#13-custom-scan-options)
  - [Catalysts](#14-catalysts)
  - [Earnings Calendar](#15-earnings-calendar)
  - [Stock Detail](#16-stock-detail)
  - [Mini Charts](#17-mini-charts)
  - [Market Live Status](#18-market-live-status)
- [Protected Endpoints](#2-protected-endpoints)
  - [Daily Cues](#21-daily-cues)
  - [Index Data](#22-index-data)
  - [Premium Scanners](#23-premium-scanners)
  - [Market Breadth](#24-market-breadth)
  - [Live Dashboard](#25-live-dashboard)
  - [Live Intraday](#26-live-intraday)
  - [Sectors](#27-sectors)
  - [Custom Scan Execution](#28-custom-scan-execution)
- [User Data Endpoints](#3-user-data-endpoints)
  - [Watchlists](#31-watchlists)
  - [Watchlist Items](#32-watchlist-items)
  - [Favourites](#33-favourites)
  - [Preferences](#34-preferences)
  - [Chart Drawings](#35-chart-drawings)
  - [Saved Scans](#36-saved-scans)
  - [Stock Notes](#37-stock-notes)
- [Admin Endpoints](#4-admin-endpoints)
- [Scanner Result Schema](#scanner-result-schema)

---

## Authentication

All protected and user-data endpoints require a valid **Supabase JWT** in the `Authorization` header.

```
Authorization: Bearer <supabase_access_token>
```

| Token Source | Description |
|---|---|
| `supabase.auth.getSession()` | Client-side session token |
| `supabase.auth.signInWithPassword()` | Email/password sign-in |
| `supabase.auth.signInWithOtp()` | Magic link sign-in |

The FastAPI backend verifies the JWT signature using the **Supabase JWT secret** (`SUPABASE_JWT_SECRET`). Claims extracted: `sub` (user UUID), `email`, `role`, and the custom `user_metadata.plan` field.

**Plan-based access:**

| Plan | Scanner Results | Protected Endpoints | Watchlists | Items/List |
|---|---|---|---|---|
| `free` | Top 10 | ❌ Blocked | 1 | 20 |
| `premium` | Full list | ✅ Allowed | Unlimited | Unlimited |

---

## Rate Limiting

Implemented via `slowapi` (token-bucket) keyed on JWT `sub` (authenticated) or client IP (anonymous).

| Tier | Limit | Window | Header |
|---|---|---|---|
| Anonymous | 60 req | 1 minute | `X-RateLimit-Limit: 60` |
| Free | 100 req | 1 minute | `X-RateLimit-Limit: 100` |
| Premium | 300 req | 1 minute | `X-RateLimit-Limit: 300` |
| Admin | Unlimited | — | — |

Response headers on every request:

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 87
X-RateLimit-Reset: 1700000060
```

When exceeded: `429 Too Many Requests`

```json
{
  "error": "rate_limit_exceeded",
  "message": "Rate limit exceeded. Try again in 23 seconds.",
  "retry_after": 23
}
```

---

## Error Responses

All errors follow a consistent envelope:

```json
{
  "error": "<error_code>",
  "message": "<human-readable description>",
  "details": null
}
```

| HTTP Status | Error Code | When |
|---|---|---|
| `400` | `bad_request` | Invalid query parameters, malformed body |
| `401` | `unauthorized` | Missing or expired JWT |
| `403` | `forbidden` | Free user accessing premium endpoint |
| `404` | `not_found` | Unknown symbol, resource not found |
| `422` | `validation_error` | Pydantic validation failure (field-level) |
| `429` | `rate_limit_exceeded` | Rate limit hit |
| `500` | `internal_error` | Unhandled server error (details omitted in prod) |

**422 Validation Error** (Pydantic v2 format):

```json
{
  "error": "validation_error",
  "message": "Request validation failed",
  "details": [
    {
      "loc": ["query", "limit"],
      "msg": "Input should be less than or equal to 100",
      "type": "less_than_equal",
      "input": 500
    }
  ]
}
```

---

## Common Types

### Pagination

Scanners and list endpoints support cursor-based pagination:

| Parameter | Type | Default | Description |
|---|---|---|---|
| `limit` | `int` | `50` | Results per page (max `100`, free tier forced to `10`) |
| `offset` | `int` | `0` | Number of results to skip |
| `sort_by` | `string` | `rs_rating` | Field to sort by (any scanner result field) |
| `sort_order` | `string` | `desc` | `asc` or `desc` |

### Date Format

All dates are ISO 8601: `2026-11-12` (date) or `2026-11-12T15:30:00+05:30` (datetime).

### Symbol Format

NSE symbols in uppercase: `RELIANCE`, `TCS`, `HDFCBANK`. No exchange prefix.

---

## 1. Public Endpoints

> No authentication required. Free tier users receive top-10 results from scanner endpoints.

---

### 1.1 Market Metadata

Returns market-level metadata including last data update time, total stock count, and market status.

```
GET /api/metadata
```

**Query Parameters:** None

**Auth Required:** No

**Cache Strategy:** Redis `metadata` key, TTL 300s (5 min)

**Rate Limit:** Standard (per tier)

**Example Request:**

```bash
curl https://api.tradescout.in/api/metadata
```

**Response Schema:**

```json
{
  "last_updated": "2026-11-12T16:00:00+05:30",
  "last_trading_date": "2026-11-12",
  "total_stocks": 2487,
  "total_fno_stocks": 182,
  "market_status": "closed",
  "market_open_time": "09:15:00+05:30",
  "market_close_time": "15:30:00+05:30",
  "next_trading_date": "2026-11-13",
  "indices": {
    "nifty_50": { "value": 24850.25, "change_pct": 0.73 },
    "nifty_500": { "value": 22105.10, "change_pct": 0.65 },
    "bank_nifty": { "value": 52340.80, "change_pct": 1.12 }
  },
  "data_version": "2026-11-12-eod"
}
```

**Response Fields:**

| Field | Type | Description |
|---|---|---|
| `last_updated` | `datetime` | Timestamp of last data pipeline run |
| `last_trading_date` | `date` | Most recent trading date with data |
| `total_stocks` | `int` | Number of stocks in the universe |
| `total_fno_stocks` | `int` | Number of F&O eligible stocks |
| `market_status` | `string` | `pre_open`, `open`, `closed`, `holiday` |
| `market_open_time` | `time` | IST market open time |
| `market_close_time` | `time` | IST market close time |
| `next_trading_date` | `date` | Next trading date (skips weekends/holidays) |
| `indices` | `object` | Key index values with daily change |
| `data_version` | `string` | Cache buster / data version identifier |

---

### 1.2 Scanner Endpoints

All scanner endpoints share the same response schema and query parameters.

#### Available Scanners

| Endpoint | Slug | Description |
|---|---|---|
| `GET /api/scanners/trend-template` | `trend-template` | Minervini Trend Template (8-rule) pass |
| `GET /api/scanners/recent-breakout` | `recent-breakout` | Stocks that broke out in last 5 trading days |
| `GET /api/scanners/4pct-breakout` | `4pct-breakout` | Stocks up 4%+ on high volume (breakout day) |
| `GET /api/scanners/high-volume` | `high-volume` | Relative volume > 2× 50-day average |
| `GET /api/scanners/1m-gainers` | `1m-gainers` | Highest 1-month price gain |

**Query Parameters (shared across all scanners):**

| Parameter | Type | Default | Description |
|---|---|---|---|
| `limit` | `int` | `50` | Results per page. Free tier: forced to `10` |
| `offset` | `int` | `0` | Pagination offset |
| `sort_by` | `string` | `rs_rating` | Sort field (any scanner result field) |
| `sort_order` | `string` | `desc` | `asc` or `desc` |
| `industry` | `string` | `null` | Filter by industry group (e.g., `IT - Software`) |
| `min_mcap` | `float` | `null` | Minimum market cap in crores |
| `max_mcap` | `float` | `null` | Maximum market cap in crores |
| `min_rs` | `int` | `null` | Minimum RS rating (1–99) |
| `series` | `string` | `EQ` | NSE series filter (`EQ`, `BE`, `ALL`) |

**Auth Required:** No (free tier gets top-10 only)

**Cache Strategy:** Redis key `scanner:{slug}:{sort_by}:{sort_order}`, TTL 3600s (1 hour). Invalidated by daily post-market pipeline.

**Rate Limit:** Standard (per tier)

**Example Request:**

```bash
curl "https://api.tradescout.in/api/scanners/trend-template?limit=5&sort_by=rs_rating&sort_order=desc"
```

**Response Schema:**

```json
{
  "scanner": "trend-template",
  "title": "Minervini Trend Template",
  "description": "Stocks passing all 8 rules of Mark Minervini's Trend Template criteria",
  "last_updated": "2026-11-12T16:30:00+05:30",
  "total_results": 127,
  "returned": 5,
  "offset": 0,
  "is_truncated": false,
  "results": [
    {
      "symbol": "TRENT",
      "name": "Trent Limited",
      "isin": "INE849A01020",
      "series": "EQ",
      "industry": "Retail",
      "conditions_met": 8,
      "cmp": 7245.30,
      "prev_close": 7180.50,
      "change_pct": 0.90,
      "sma_10": 7180.20,
      "sma_20": 7050.15,
      "sma_50": 6820.40,
      "sma_150": 6200.75,
      "sma_200": 5980.30,
      "ema_12": 7190.55,
      "ema_26": 7020.80,
      "rs_rating": 97,
      "stage": 2,
      "stage_name": "Advancing",
      "from_52w_high": -3.2,
      "from_52w_low": 85.4,
      "high_52w": 7485.00,
      "low_52w": 3908.25,
      "rsi": 68.5,
      "rvol": 1.45,
      "volume": 1245680,
      "avg_volume_50d": 859090,
      "pe": 112.5,
      "pb": 28.3,
      "roe": 25.1,
      "roce": 33.8,
      "debt_equity": 0.12,
      "eps": 64.40,
      "eps_growth_yoy": 42.3,
      "revenue_growth_yoy": 38.7,
      "promoter_pct": 37.01,
      "fii_pct": 20.15,
      "dii_pct": 18.90,
      "public_pct": 23.94,
      "market_cap": 257430.50,
      "industry_rs_rating": 92,
      "delivery_pct": 58.3,
      "turnover": 90234.50,
      "trades": 45230
    }
  ]
}
```

**Response Envelope Fields:**

| Field | Type | Description |
|---|---|---|
| `scanner` | `string` | Scanner slug identifier |
| `title` | `string` | Human-readable scanner name |
| `description` | `string` | Scanner methodology description |
| `last_updated` | `datetime` | When scanner data was last computed |
| `total_results` | `int` | Total matching stocks (before pagination) |
| `returned` | `int` | Number of results in this response |
| `offset` | `int` | Current pagination offset |
| `is_truncated` | `bool` | `true` if free tier and more results exist |
| `results` | `array` | Array of [ScannerResult](#scanner-result-schema) objects |

---

### 1.3 Custom Scan Options

Returns the available conditions, operators, and value ranges for the custom scanner builder UI.

```
GET /api/scan/options
```

**Query Parameters:** None

**Auth Required:** No

**Cache Strategy:** Redis `scan:options`, TTL 86400s (24 hours)

**Rate Limit:** Standard

**Example Request:**

```bash
curl https://api.tradescout.in/api/scan/options
```

**Response Schema:**

```json
{
  "conditions": [
    {
      "field": "cmp",
      "label": "Current Market Price",
      "type": "number",
      "unit": "₹",
      "operators": ["gt", "gte", "lt", "lte", "eq", "between"],
      "min": 0,
      "max": null,
      "step": 0.05
    },
    {
      "field": "rs_rating",
      "label": "RS Rating",
      "type": "number",
      "unit": null,
      "operators": ["gt", "gte", "lt", "lte", "eq", "between"],
      "min": 1,
      "max": 99,
      "step": 1
    },
    {
      "field": "stage",
      "label": "Weinstein Stage",
      "type": "enum",
      "unit": null,
      "operators": ["eq", "in"],
      "options": [
        { "value": 1, "label": "Stage 1 — Basing" },
        { "value": 2, "label": "Stage 2 — Advancing" },
        { "value": 3, "label": "Stage 3 — Topping" },
        { "value": 4, "label": "Stage 4 — Declining" }
      ]
    },
    {
      "field": "industry",
      "label": "Industry Group",
      "type": "enum",
      "unit": null,
      "operators": ["eq", "in", "not_in"],
      "options": ["IT - Software", "Banks - Private", "Pharmaceuticals", "Auto - Cars & Jeeps", "Retail"]
    },
    {
      "field": "rsi",
      "label": "RSI (14)",
      "type": "number",
      "unit": null,
      "operators": ["gt", "gte", "lt", "lte", "between"],
      "min": 0,
      "max": 100,
      "step": 0.1
    },
    {
      "field": "rvol",
      "label": "Relative Volume",
      "type": "number",
      "unit": "×",
      "operators": ["gt", "gte", "lt", "lte"],
      "min": 0,
      "max": null,
      "step": 0.01
    },
    {
      "field": "market_cap",
      "label": "Market Cap",
      "type": "number",
      "unit": "₹ Cr",
      "operators": ["gt", "gte", "lt", "lte", "between"],
      "min": 0,
      "max": null,
      "step": 1
    },
    {
      "field": "pe",
      "label": "P/E Ratio",
      "type": "number",
      "unit": null,
      "operators": ["gt", "gte", "lt", "lte", "between"],
      "min": 0,
      "max": null,
      "step": 0.1
    },
    {
      "field": "promoter_pct",
      "label": "Promoter Holding %",
      "type": "number",
      "unit": "%",
      "operators": ["gt", "gte", "lt", "lte", "between"],
      "min": 0,
      "max": 100,
      "step": 0.01
    },
    {
      "field": "delivery_pct",
      "label": "Delivery %",
      "type": "number",
      "unit": "%",
      "operators": ["gt", "gte", "lt", "lte"],
      "min": 0,
      "max": 100,
      "step": 0.1
    },
    {
      "field": "eps_growth_yoy",
      "label": "EPS Growth YoY",
      "type": "number",
      "unit": "%",
      "operators": ["gt", "gte", "lt", "lte"],
      "min": null,
      "max": null,
      "step": 0.1
    },
    {
      "field": "from_52w_high",
      "label": "% from 52W High",
      "type": "number",
      "unit": "%",
      "operators": ["gt", "gte", "lt", "lte", "between"],
      "min": -100,
      "max": 0,
      "step": 0.1
    },
    {
      "field": "change_pct",
      "label": "Daily Change %",
      "type": "number",
      "unit": "%",
      "operators": ["gt", "gte", "lt", "lte", "between"],
      "min": null,
      "max": null,
      "step": 0.01
    },
    {
      "field": "sma_50_above_sma_200",
      "label": "SMA 50 > SMA 200 (Golden Cross)",
      "type": "boolean",
      "unit": null,
      "operators": ["eq"],
      "options": [true, false]
    },
    {
      "field": "volume",
      "label": "Volume",
      "type": "number",
      "unit": "shares",
      "operators": ["gt", "gte", "lt", "lte"],
      "min": 0,
      "max": null,
      "step": 1
    }
  ],
  "max_conditions": 10,
  "logical_operator": "AND"
}
```

---

### 1.4 Catalysts

Returns the market catalysts/events feed — corporate actions, block deals, bulk deals, significant announcements.

```
GET /api/catalysts
```

**Query Parameters:**

| Parameter | Type | Default | Description |
|---|---|---|---|
| `limit` | `int` | `20` | Results per page (max `50`) |
| `offset` | `int` | `0` | Pagination offset |
| `type` | `string` | `null` | Filter: `block_deal`, `bulk_deal`, `result`, `agm`, `dividend`, `split`, `bonus` |
| `symbol` | `string` | `null` | Filter by stock symbol |
| `from_date` | `date` | `null` | Start date (ISO 8601) |
| `to_date` | `date` | `null` | End date (ISO 8601) |

**Auth Required:** No

**Cache Strategy:** Redis `catalysts:{date}`, TTL 1800s (30 min)

**Rate Limit:** Standard

**Example Request:**

```bash
curl "https://api.tradescout.in/api/catalysts?limit=5&type=block_deal"
```

**Response Schema:**

```json
{
  "total": 42,
  "returned": 5,
  "offset": 0,
  "catalysts": [
    {
      "id": "cat_20261112_001",
      "type": "block_deal",
      "symbol": "HDFCBANK",
      "name": "HDFC Bank Limited",
      "headline": "Block deal: 2.5M shares traded at ₹1,720",
      "details": "Goldman Sachs sold 2.5M shares via block deal on NSE at ₹1,720 per share. Total value: ₹430 Cr.",
      "date": "2026-11-12",
      "time": "14:30:00+05:30",
      "impact": "neutral",
      "source_url": null
    }
  ]
}
```

**Response Fields:**

| Field | Type | Description |
|---|---|---|
| `id` | `string` | Unique catalyst identifier |
| `type` | `string` | Catalyst category |
| `symbol` | `string` | Stock symbol |
| `name` | `string` | Company name |
| `headline` | `string` | Short description |
| `details` | `string` | Full catalyst description |
| `date` | `date` | Event date |
| `time` | `time` | Event time (if available) |
| `impact` | `string` | `positive`, `negative`, `neutral` |
| `source_url` | `string|null` | Link to source (NSE filing, etc.) |

---

### 1.5 Earnings Calendar

Returns upcoming and past earnings dates.

```
GET /api/scan/earnings-calendar
```

**Query Parameters:**

| Parameter | Type | Default | Description |
|---|---|---|---|
| `period` | `string` | `upcoming` | `upcoming` (next 30 days), `past` (last 30 days), `this_week`, `next_week` |
| `limit` | `int` | `50` | Results per page (max `100`) |
| `offset` | `int` | `0` | Pagination offset |
| `symbol` | `string` | `null` | Filter by symbol |

**Auth Required:** No

**Cache Strategy:** Redis `earnings:{period}`, TTL 3600s (1 hour)

**Rate Limit:** Standard

**Example Request:**

```bash
curl "https://api.tradescout.in/api/scan/earnings-calendar?period=this_week&limit=10"
```

**Response Schema:**

```json
{
  "period": "this_week",
  "total": 35,
  "returned": 10,
  "offset": 0,
  "earnings": [
    {
      "symbol": "RELIANCE",
      "name": "Reliance Industries Limited",
      "date": "2026-11-14",
      "quarter": "Q2 FY27",
      "estimated": false,
      "prev_quarter": {
        "quarter": "Q1 FY27",
        "revenue": 236580,
        "net_profit": 19450,
        "eps": 28.72
      }
    }
  ]
}
```

---

### 1.6 Stock Detail

Multiple sub-endpoints for individual stock data.

#### 1.6.1 Stock Overview

```
GET /api/stock/{symbol}
```

**Path Parameters:**

| Parameter | Type | Description |
|---|---|---|
| `symbol` | `string` | NSE symbol (e.g., `RELIANCE`) |

**Auth Required:** No

**Cache Strategy:** Redis `stock:{symbol}`, TTL 300s (5 min during market hours), 3600s (1 hour post-market)

**Rate Limit:** Standard

**Example Request:**

```bash
curl https://api.tradescout.in/api/stock/RELIANCE
```

**Response Schema:**

```json
{
  "symbol": "RELIANCE",
  "name": "Reliance Industries Limited",
  "isin": "INE002A01018",
  "series": "EQ",
  "industry": "Refineries",
  "cmp": 2485.60,
  "prev_close": 2470.15,
  "open": 2475.00,
  "high": 2498.30,
  "low": 2468.50,
  "change": 15.45,
  "change_pct": 0.63,
  "volume": 8945230,
  "avg_volume_50d": 7125000,
  "rvol": 1.26,
  "turnover": 22245.80,
  "delivery_pct": 62.5,
  "trades": 312450,
  "high_52w": 2856.15,
  "low_52w": 1987.40,
  "from_52w_high": -12.97,
  "from_52w_low": 25.07,
  "market_cap": 1681234.50,
  "sma_10": 2478.30,
  "sma_20": 2455.60,
  "sma_50": 2420.15,
  "sma_150": 2380.70,
  "sma_200": 2350.90,
  "ema_12": 2475.40,
  "ema_26": 2448.20,
  "rsi": 58.3,
  "rs_rating": 62,
  "stage": 2,
  "stage_name": "Advancing",
  "conditions_met": 6,
  "last_updated": "2026-11-12T16:00:00+05:30"
}
```

#### 1.6.2 RS Line Data

Returns the Relative Strength line (stock price ÷ Nifty 50 index, normalized).

```
GET /api/stock/{symbol}/rs_line
```

**Query Parameters:**

| Parameter | Type | Default | Description |
|---|---|---|---|
| `period` | `string` | `1y` | `3m`, `6m`, `1y`, `2y`, `5y` |

**Auth Required:** No

**Cache Strategy:** Redis `rs:{symbol}:{period}`, TTL 3600s

**Rate Limit:** Standard

**Example Request:**

```bash
curl "https://api.tradescout.in/api/stock/RELIANCE/rs_line?period=1y"
```

**Response Schema:**

```json
{
  "symbol": "RELIANCE",
  "benchmark": "NIFTY 50",
  "period": "1y",
  "rs_rating": 62,
  "data_points": 252,
  "rs_line": [
    { "date": "2025-11-12", "value": 100.00 },
    { "date": "2025-11-13", "value": 100.35 },
    { "date": "2026-11-12", "value": 108.42 }
  ],
  "rs_new_high": false,
  "rs_trend": "flat"
}
```

#### 1.6.3 Fundamentals

```
GET /api/stock/{symbol}/fundamentals
```

**Auth Required:** No

**Cache Strategy:** Redis `fundamentals:{symbol}`, TTL 86400s (24 hours — fundamentals change quarterly)

**Rate Limit:** Standard

**Response Schema:**

```json
{
  "symbol": "RELIANCE",
  "pe": 28.5,
  "pb": 2.8,
  "roe": 9.8,
  "roce": 12.4,
  "debt_equity": 0.42,
  "current_ratio": 1.15,
  "dividend_yield": 0.32,
  "book_value": 887.50,
  "face_value": 10.00,
  "promoter_pct": 50.33,
  "promoter_pct_change": 0.00,
  "fii_pct": 23.15,
  "fii_pct_change": -0.42,
  "dii_pct": 14.20,
  "dii_pct_change": 0.18,
  "public_pct": 12.32,
  "eps_ttm": 87.23,
  "eps_growth_yoy": 12.5,
  "revenue_ttm": 945230.00,
  "revenue_growth_yoy": 8.3,
  "net_profit_ttm": 72340.00,
  "net_profit_growth_yoy": 14.2,
  "operating_margin": 15.8,
  "net_margin": 7.65,
  "market_cap": 1681234.50,
  "enterprise_value": 1812450.00,
  "ev_ebitda": 12.3,
  "peg_ratio": 2.28,
  "last_updated": "2026-11-12"
}
```

#### 1.6.4 Financials

```
GET /api/stock/{symbol}/financials
```

**Query Parameters:**

| Parameter | Type | Default | Description |
|---|---|---|---|
| `type` | `string` | `quarterly` | `quarterly` or `annual` |
| `limit` | `int` | `8` | Number of periods (max `20`) |

**Auth Required:** No

**Cache Strategy:** Redis `financials:{symbol}:{type}`, TTL 86400s

**Rate Limit:** Standard

**Response Schema:**

```json
{
  "symbol": "RELIANCE",
  "type": "quarterly",
  "periods": [
    {
      "period": "Q1 FY27",
      "date": "2026-06-30",
      "revenue": 236580.00,
      "revenue_growth_yoy": 11.2,
      "operating_profit": 42130.00,
      "operating_margin": 17.81,
      "net_profit": 19450.00,
      "net_margin": 8.22,
      "eps": 28.72,
      "eps_growth_yoy": 14.5
    },
    {
      "period": "Q4 FY26",
      "date": "2026-03-31",
      "revenue": 228400.00,
      "revenue_growth_yoy": 9.8,
      "operating_profit": 39850.00,
      "operating_margin": 17.45,
      "net_profit": 18200.00,
      "net_margin": 7.97,
      "eps": 26.88,
      "eps_growth_yoy": 12.1
    }
  ]
}
```

#### 1.6.5 Intraday Data

```
GET /api/stock/{symbol}/intraday
```

**Query Parameters:**

| Parameter | Type | Default | Description |
|---|---|---|---|
| `interval` | `string` | `5m` | Candle interval: `1m`, `5m`, `15m`, `30m`, `1h` |
| `date` | `date` | today | Trading date (ISO 8601) |

**Auth Required:** No (current day only). Premium for historical intraday.

**Cache Strategy:** Redis `intraday:{symbol}:{date}:{interval}`, TTL 60s (during market hours), 86400s (post-market)

**Rate Limit:** Standard

**Response Schema:**

```json
{
  "symbol": "RELIANCE",
  "date": "2026-11-12",
  "interval": "5m",
  "candles": [
    {
      "timestamp": "2026-11-12T09:15:00+05:30",
      "open": 2475.00,
      "high": 2482.30,
      "low": 2473.50,
      "close": 2480.10,
      "volume": 234560
    },
    {
      "timestamp": "2026-11-12T09:20:00+05:30",
      "open": 2480.10,
      "high": 2485.00,
      "low": 2478.80,
      "close": 2483.50,
      "volume": 189340
    }
  ],
  "total_candles": 75
}
```

#### 1.6.6 Concall Transcripts

```
GET /api/stock/{symbol}/concalls
```

**Query Parameters:**

| Parameter | Type | Default | Description |
|---|---|---|---|
| `limit` | `int` | `4` | Number of concalls (max `12`) |

**Auth Required:** No

**Cache Strategy:** Redis `concalls:{symbol}`, TTL 86400s

**Rate Limit:** Standard

**Response Schema:**

```json
{
  "symbol": "RELIANCE",
  "concalls": [
    {
      "quarter": "Q1 FY27",
      "date": "2026-07-18",
      "title": "Reliance Industries Q1 FY27 Earnings Concall",
      "transcript_url": "https://example.com/transcripts/reliance-q1-fy27",
      "audio_url": null,
      "key_highlights": [
        "Jio subscriber base crossed 490M",
        "Retail EBITDA up 25% YoY",
        "New energy capex of ₹15,000 Cr announced"
      ]
    }
  ]
}
```

#### 1.6.7 Stock Notes

```
GET /api/stock/{symbol}/notes
```

**Auth Required:** Yes (user's own notes only)

**Cache Strategy:** No cache (real-time from Supabase)

**Rate Limit:** Standard

**Response Schema:**

```json
{
  "symbol": "RELIANCE",
  "notes": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "content": "Watch for breakout above 2500. Volume needs to confirm.",
      "created_at": "2026-11-10T10:30:00+05:30",
      "updated_at": "2026-11-11T14:20:00+05:30"
    }
  ]
}
```

**Create/Update Note:**

```
POST /api/stock/{symbol}/notes
```

**Request Body:**

```json
{
  "content": "Strong RS line, wait for base to complete before entry."
}
```

**Response:** Returns the created/updated note object with `201 Created`.

---

### 1.7 Mini Charts

Returns sparkline data for rendering mini preview charts in scanner/watchlist tables.

```
GET /api/minicharts
```

**Query Parameters:**

| Parameter | Type | Default | Description |
|---|---|---|---|
| `symbols` | `string` | required | Comma-separated symbols (max `50`) |
| `period` | `string` | `3m` | `1m`, `3m`, `6m` |

**Auth Required:** No

**Cache Strategy:** Redis `minicharts:{hash(symbols)}:{period}`, TTL 3600s

**Rate Limit:** Standard

**Example Request:**

```bash
curl "https://api.tradescout.in/api/minicharts?symbols=RELIANCE,TCS,INFY&period=3m"
```

**Response Schema:**

```json
{
  "period": "3m",
  "charts": {
    "RELIANCE": {
      "closes": [2350.5, 2365.2, 2380.1, 2410.3, 2425.8, 2455.0, 2470.2, 2485.6],
      "change_pct": 5.74,
      "trend": "up"
    },
    "TCS": {
      "closes": [4200.0, 4180.5, 4210.3, 4250.8, 4270.0, 4295.5, 4310.2],
      "change_pct": 2.62,
      "trend": "up"
    },
    "INFY": {
      "closes": [1850.0, 1835.5, 1820.3, 1810.8, 1825.0, 1840.5, 1830.2],
      "change_pct": -1.07,
      "trend": "down"
    }
  }
}
```

> [!NOTE]
> The `closes` array is down-sampled to ~60 data points regardless of period for consistent sparkline rendering. Each point is the daily closing price.

---

### 1.8 Market Live Status

Returns whether the market is currently open, in pre-open, or closed.

```
GET /api/live/status
```

**Query Parameters:** None

**Auth Required:** No

**Cache Strategy:** Redis `live:status`, TTL 30s

**Rate Limit:** Standard

**Response Schema:**

```json
{
  "status": "closed",
  "current_time": "2026-11-12T18:45:00+05:30",
  "market_open": "09:15:00+05:30",
  "market_close": "15:30:00+05:30",
  "pre_open_start": "09:00:00+05:30",
  "pre_open_end": "09:08:00+05:30",
  "is_trading_day": true,
  "is_holiday": false,
  "next_trading_day": "2026-11-13",
  "holiday_name": null
}
```

---

## 2. Protected Endpoints

> Require valid JWT. Free users get `403 Forbidden` on most of these.

---

### 2.1 Daily Cues

Returns daily market cues/insights — market participation, RME sentiment, breakout health, etc.

```
GET /api/cues
```

**Auth Required:** Yes (premium only)

**Cache Strategy:** Redis `cues:{date}`, TTL 3600s

**Rate Limit:** Premium tier

**Response Schema:**

```json
{
  "date": "2026-11-12",
  "market_participation": {
    "score": 72,
    "label": "Healthy",
    "description": "72% of Nifty 500 stocks are above their 50-DMA"
  },
  "rme_sentiment": {
    "value": "neutral_bullish",
    "label": "Neutral-Bullish",
    "description": "Market is neither washed out nor stretched"
  },
  "stage_balance": {
    "stage_1_pct": 18.5,
    "stage_2_pct": 42.3,
    "stage_3_pct": 22.1,
    "stage_4_pct": 17.1,
    "bias": "bullish"
  },
  "breakout_health": {
    "total_breakouts_5d": 34,
    "successful_pct": 73.5,
    "failed_pct": 26.5,
    "label": "Healthy"
  },
  "cues": [
    {
      "type": "bullish",
      "text": "Stage 2 stocks at 42.3% — above 40% threshold indicating healthy market",
      "importance": "high"
    },
    {
      "type": "neutral",
      "text": "Nifty 50 RS line flat vs global markets — no clear outperformance",
      "importance": "medium"
    }
  ]
}
```

---

### 2.2 Index Data

Returns data for major NSE indices.

```
GET /api/indices
```

**Auth Required:** Yes (premium only)

**Cache Strategy:** Redis `indices`, TTL 300s

**Rate Limit:** Premium tier

**Response Schema:**

```json
{
  "indices": [
    {
      "symbol": "NIFTY 50",
      "value": 24850.25,
      "prev_close": 24670.10,
      "change": 180.15,
      "change_pct": 0.73,
      "open": 24690.00,
      "high": 24880.50,
      "low": 24650.30,
      "high_52w": 26277.35,
      "low_52w": 21281.45,
      "pe": 22.5,
      "pb": 4.1,
      "dividend_yield": 1.25,
      "advance": 32,
      "decline": 17,
      "unchanged": 1
    },
    {
      "symbol": "NIFTY 500",
      "value": 22105.10,
      "prev_close": 21962.40,
      "change": 142.70,
      "change_pct": 0.65,
      "open": 21980.00,
      "high": 22140.30,
      "low": 21950.50,
      "high_52w": 23456.80,
      "low_52w": 18234.50,
      "pe": 24.8,
      "pb": 3.8,
      "dividend_yield": 1.10,
      "advance": 312,
      "decline": 174,
      "unchanged": 14
    },
    {
      "symbol": "NIFTY BANK",
      "value": 52340.80,
      "prev_close": 51760.30,
      "change": 580.50,
      "change_pct": 1.12,
      "open": 51800.00,
      "high": 52450.00,
      "low": 51720.60,
      "high_52w": 54467.35,
      "low_52w": 43900.85,
      "pe": 16.8,
      "pb": 2.9,
      "dividend_yield": 0.95,
      "advance": 9,
      "decline": 3,
      "unchanged": 0
    }
  ],
  "last_updated": "2026-11-12T15:30:00+05:30"
}
```

---

### 2.3 Premium Scanners

#### Near Pivot

Stocks within 5% of a consolidation pivot point — potential breakout candidates.

```
GET /api/scanners/near-pivot
```

**Query Parameters:** Same as [standard scanners](#12-scanner-endpoints)

**Auth Required:** Yes (premium only)

**Cache Strategy:** Redis `scanner:near-pivot:*`, TTL 3600s

**Response Schema:** Same [ScannerResult](#scanner-result-schema) envelope, with additional fields:

```json
{
  "scanner": "near-pivot",
  "title": "Near Pivot Point",
  "results": [
    {
      "...all standard scanner fields...": "...",
      "pivot_price": 7450.00,
      "distance_to_pivot_pct": 2.75,
      "base_length_days": 42,
      "base_depth_pct": 15.3,
      "volume_dry_up": true
    }
  ]
}
```

#### VCP (Volatility Contraction Pattern)

```
GET /api/scanners/vcp
```

**Auth Required:** Yes (premium only)

**Cache Strategy:** Redis `scanner:vcp:*`, TTL 3600s

**Response Schema:** Same envelope with additional fields:

```json
{
  "scanner": "vcp",
  "title": "Volatility Contraction Pattern",
  "results": [
    {
      "...all standard scanner fields...": "...",
      "contractions": 3,
      "contraction_depths": [25.3, 12.8, 5.2],
      "contraction_durations_days": [28, 18, 10],
      "pivot_price": 1250.00,
      "volume_contracting": true
    }
  ]
}
```

---

### 2.4 Market Breadth

```
GET /api/market-breadth
```

**Auth Required:** Yes (premium only)

**Cache Strategy:** Redis `market-breadth`, TTL 300s

**Rate Limit:** Premium tier

**Response Schema:**

```json
{
  "date": "2026-11-12",
  "universe": "Nifty 500",
  "advance_decline": {
    "advancing": 312,
    "declining": 174,
    "unchanged": 14,
    "ad_ratio": 1.79,
    "ad_line_value": 1245
  },
  "new_highs_lows": {
    "new_52w_highs": 28,
    "new_52w_lows": 5,
    "new_1m_highs": 85,
    "new_1m_lows": 32
  },
  "above_moving_averages": {
    "above_sma_20": { "count": 325, "pct": 65.0 },
    "above_sma_50": { "count": 280, "pct": 56.0 },
    "above_sma_200": { "count": 360, "pct": 72.0 }
  },
  "stage_distribution": {
    "stage_1": { "count": 93, "pct": 18.5 },
    "stage_2": { "count": 212, "pct": 42.3 },
    "stage_3": { "count": 111, "pct": 22.1 },
    "stage_4": { "count": 84, "pct": 17.1 }
  },
  "sector_breadth": [
    {
      "sector": "IT - Software",
      "advancing": 18,
      "declining": 7,
      "avg_change_pct": 1.25
    },
    {
      "sector": "Banks - Private",
      "advancing": 8,
      "declining": 4,
      "avg_change_pct": 0.85
    }
  ]
}
```

---

### 2.5 Live Dashboard

```
GET /api/live/dashboard
```

**Auth Required:** Yes (premium only)

**Cache Strategy:** Redis `live:dashboard`, TTL 60s (during market hours)

**Rate Limit:** Premium tier

**Response Schema:**

```json
{
  "market_status": "open",
  "timestamp": "2026-11-12T14:30:00+05:30",
  "indices": {
    "nifty_50": { "value": 24850.25, "change_pct": 0.73 },
    "nifty_bank": { "value": 52340.80, "change_pct": 1.12 },
    "nifty_it": { "value": 38420.50, "change_pct": 0.45 },
    "nifty_midcap_100": { "value": 56780.30, "change_pct": 0.92 },
    "nifty_smallcap_100": { "value": 18950.20, "change_pct": 1.35 },
    "india_vix": { "value": 13.45, "change_pct": -5.2 }
  },
  "top_gainers": [
    { "symbol": "TRENT", "cmp": 7245.30, "change_pct": 4.52 },
    { "symbol": "ZOMATO", "cmp": 285.40, "change_pct": 3.85 }
  ],
  "top_losers": [
    { "symbol": "ADANIENT", "cmp": 2845.60, "change_pct": -2.15 },
    { "symbol": "TATAMOTORS", "cmp": 875.30, "change_pct": -1.92 }
  ],
  "most_active": [
    { "symbol": "RELIANCE", "volume": 8945230, "turnover": 22245.80 }
  ],
  "fii_dii": {
    "fii_net": -1245.30,
    "dii_net": 987.50,
    "fii_buy": 4560.80,
    "fii_sell": 5806.10,
    "dii_buy": 3450.20,
    "dii_sell": 2462.70
  }
}
```

---

### 2.6 Live Intraday

Real-time intraday updates for a specific stock (streaming-compatible, polled every 30s by frontend).

```
GET /api/live/intraday/{symbol}
```

**Path Parameters:**

| Parameter | Type | Description |
|---|---|---|
| `symbol` | `string` | NSE symbol |

**Auth Required:** Yes (premium only)

**Cache Strategy:** Redis `live:intraday:{symbol}`, TTL 30s

**Rate Limit:** Premium tier

**Response Schema:**

```json
{
  "symbol": "RELIANCE",
  "market_status": "open",
  "timestamp": "2026-11-12T14:30:15+05:30",
  "ltp": 2485.60,
  "open": 2475.00,
  "high": 2498.30,
  "low": 2468.50,
  "prev_close": 2470.15,
  "change": 15.45,
  "change_pct": 0.63,
  "volume": 8945230,
  "vwap": 2482.35,
  "bid": 2485.50,
  "ask": 2485.70,
  "bid_qty": 1250,
  "ask_qty": 890,
  "oi": null
}
```

---

### 2.7 Sectors

Sector performance & RS rankings.

```
GET /api/sectors
```

**Query Parameters:**

| Parameter | Type | Default | Description |
|---|---|---|---|
| `period` | `string` | `1d` | `1d`, `1w`, `1m`, `3m`, `6m`, `1y` |

**Auth Required:** Yes (premium only)

**Cache Strategy:** Redis `sectors:{period}`, TTL 1800s

**Rate Limit:** Premium tier

**Response Schema:**

```json
{
  "period": "1m",
  "sectors": [
    {
      "name": "IT - Software",
      "rs_rating": 88,
      "change_pct": 5.42,
      "stock_count": 45,
      "stage_2_pct": 62.2,
      "top_stocks": [
        { "symbol": "TCS", "rs_rating": 92, "change_pct": 7.8 },
        { "symbol": "INFY", "rs_rating": 85, "change_pct": 5.2 }
      ],
      "avg_rvol": 1.35
    },
    {
      "name": "Banks - Private",
      "rs_rating": 75,
      "change_pct": 3.18,
      "stock_count": 22,
      "stage_2_pct": 54.5,
      "top_stocks": [
        { "symbol": "HDFCBANK", "rs_rating": 78, "change_pct": 4.1 },
        { "symbol": "ICICIBANK", "rs_rating": 76, "change_pct": 3.5 }
      ],
      "avg_rvol": 1.12
    }
  ],
  "last_updated": "2026-11-12T16:30:00+05:30"
}
```

---

### 2.8 Custom Scan Execution

Execute a custom scan query with user-defined conditions.

```
POST /api/scan
```

**Auth Required:** Yes (premium only — free users can view `/api/scan/options` but not execute)

**Cache Strategy:** Redis `scan:{hash(conditions)}`, TTL 1800s (30 min)

**Rate Limit:** Premium tier (10 custom scans/min)

**Request Body:**

```json
{
  "conditions": [
    {
      "field": "rs_rating",
      "operator": "gte",
      "value": 80
    },
    {
      "field": "stage",
      "operator": "eq",
      "value": 2
    },
    {
      "field": "market_cap",
      "operator": "gte",
      "value": 5000
    },
    {
      "field": "rvol",
      "operator": "gte",
      "value": 1.5
    }
  ],
  "sort_by": "rs_rating",
  "sort_order": "desc",
  "limit": 50,
  "offset": 0
}
```

**Response Schema:** Same [ScannerResult](#scanner-result-schema) envelope as pre-built scanners.

```json
{
  "scanner": "custom",
  "title": "Custom Scan",
  "description": "RS Rating ≥ 80 AND Stage = 2 AND Market Cap ≥ 5000 Cr AND RVol ≥ 1.5×",
  "conditions_applied": 4,
  "total_results": 23,
  "returned": 23,
  "offset": 0,
  "is_truncated": false,
  "results": [
    { "...ScannerResult fields...": "..." }
  ]
}
```

---

## 3. User Data Endpoints

> All user data endpoints require a valid JWT. Data is scoped to the authenticated user via Supabase RLS.

---

### 3.1 Watchlists

#### List Watchlists

```
GET /api/watchlists
```

**Auth Required:** Yes

**Cache Strategy:** No cache (real-time from Supabase)

**Rate Limit:** Standard

**Response Schema:**

```json
{
  "watchlists": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "name": "Breakout Candidates",
      "description": "Stocks setting up for potential breakout",
      "is_default": true,
      "sort_order": 0,
      "item_count": 12,
      "created_at": "2026-10-15T10:00:00+05:30",
      "updated_at": "2026-11-12T14:30:00+05:30"
    }
  ],
  "max_watchlists": 1,
  "plan": "free"
}
```

#### Create Watchlist

```
POST /api/watchlists
```

**Request Body:**

```json
{
  "name": "Swing Setups",
  "description": "Current swing trade setups I'm watching",
  "is_default": false
}
```

**Response:** `201 Created` with the created watchlist object.

**Error Cases:**
- `403 Forbidden`: Free user already has 1 watchlist
- `422 Validation Error`: Name empty or >100 chars

#### Update Watchlist

```
PUT /api/watchlists/{id}
```

**Request Body:**

```json
{
  "name": "Updated Name",
  "description": "Updated description",
  "is_default": true,
  "sort_order": 1
}
```

**Response:** `200 OK` with updated watchlist.

#### Delete Watchlist

```
DELETE /api/watchlists/{id}
```

**Response:** `204 No Content`

**Error Cases:**
- `404 Not Found`: Watchlist doesn't exist or doesn't belong to user

---

### 3.2 Watchlist Items

#### List Items

```
GET /api/watchlists/{id}/items
```

**Auth Required:** Yes

**Response Schema:**

```json
{
  "watchlist_id": "550e8400-e29b-41d4-a716-446655440000",
  "watchlist_name": "Breakout Candidates",
  "items": [
    {
      "id": "660e8400-e29b-41d4-a716-446655440001",
      "symbol": "TRENT",
      "name": "Trent Limited",
      "cmp": 7245.30,
      "change_pct": 0.90,
      "rs_rating": 97,
      "stage": 2,
      "added_at": "2026-11-10T09:00:00+05:30",
      "sort_order": 0
    }
  ],
  "total_items": 12,
  "max_items": 20,
  "plan": "free"
}
```

> [!NOTE]
> Items are enriched with live stock data (`cmp`, `change_pct`, `rs_rating`, `stage`) at read time by joining with the cached scanner data.

#### Add Item

```
POST /api/watchlists/{id}/items
```

**Request Body:**

```json
{
  "symbol": "RELIANCE",
  "sort_order": 5
}
```

**Response:** `201 Created`

**Error Cases:**
- `403 Forbidden`: Free user already has 20 items in this watchlist
- `409 Conflict`: Symbol already exists in this watchlist
- `404 Not Found`: Symbol not in NSE universe

#### Remove Item

```
DELETE /api/watchlists/{id}/items/{item_id}
```

**Response:** `204 No Content`

---

### 3.3 Favourites

Quick-favourite a stock (appears as a star in the UI).

#### List Favourites

```
GET /api/favourites
```

**Auth Required:** Yes

**Response Schema:**

```json
{
  "favourites": [
    {
      "id": "770e8400-e29b-41d4-a716-446655440002",
      "symbol": "RELIANCE",
      "name": "Reliance Industries Limited",
      "cmp": 2485.60,
      "change_pct": 0.63,
      "rs_rating": 62,
      "created_at": "2026-11-08T11:00:00+05:30"
    }
  ],
  "total": 8
}
```

#### Add Favourite

```
POST /api/favourites
```

**Request Body:**

```json
{
  "symbol": "TCS"
}
```

**Response:** `201 Created`

**Error Cases:**
- `409 Conflict`: Already favourited

#### Remove Favourite

```
DELETE /api/favourites/{id}
```

**Response:** `204 No Content`

---

### 3.4 Preferences

User UI preferences (theme, default scanner, chart settings).

#### Get Preferences

```
GET /api/preferences
```

**Auth Required:** Yes

**Response Schema:**

```json
{
  "id": "880e8400-e29b-41d4-a716-446655440003",
  "theme": "dark",
  "default_scanner": "trend-template",
  "chart_settings": {
    "default_interval": "1d",
    "show_volume": true,
    "show_sma": [20, 50, 200],
    "show_ema": [],
    "show_rsi": true,
    "show_macd": false,
    "chart_type": "candlestick",
    "timezone": "Asia/Kolkata"
  },
  "created_at": "2026-10-01T10:00:00+05:30",
  "updated_at": "2026-11-12T14:00:00+05:30"
}
```

#### Update Preferences

```
PUT /api/preferences
```

**Request Body (partial update supported):**

```json
{
  "theme": "light",
  "default_scanner": "recent-breakout",
  "chart_settings": {
    "show_sma": [10, 20, 50, 150, 200],
    "show_rsi": true,
    "show_macd": true
  }
}
```

**Response:** `200 OK` with full updated preferences.

---

### 3.5 Chart Drawings

Saved TradingView chart drawings (trendlines, horizontal lines, rectangles, etc.) serialized as JSON.

#### List Drawings for Symbol

```
GET /api/chart-drawings/{symbol}
```

**Auth Required:** Yes

**Response Schema:**

```json
{
  "symbol": "RELIANCE",
  "drawings": [
    {
      "id": "990e8400-e29b-41d4-a716-446655440004",
      "drawing_data": {
        "type": "trendline",
        "points": [
          { "time": "2026-09-15", "value": 2350.00 },
          { "time": "2026-11-12", "value": 2500.00 }
        ],
        "color": "#22c55e",
        "lineWidth": 2,
        "lineStyle": "solid",
        "label": "Support trendline"
      },
      "created_at": "2026-10-20T12:00:00+05:30",
      "updated_at": "2026-11-12T13:00:00+05:30"
    },
    {
      "id": "aa0e8400-e29b-41d4-a716-446655440005",
      "drawing_data": {
        "type": "horizontal_line",
        "value": 2500.00,
        "color": "#ef4444",
        "lineWidth": 1,
        "lineStyle": "dashed",
        "label": "Pivot"
      },
      "created_at": "2026-11-01T10:00:00+05:30",
      "updated_at": "2026-11-01T10:00:00+05:30"
    }
  ]
}
```

#### Create Drawing

```
POST /api/chart-drawings/{symbol}
```

**Request Body:**

```json
{
  "drawing_data": {
    "type": "rectangle",
    "points": [
      { "time": "2026-10-01", "value": 2400.00 },
      { "time": "2026-11-01", "value": 2500.00 }
    ],
    "color": "#3b82f6",
    "fillOpacity": 0.1,
    "label": "Base area"
  }
}
```

**Response:** `201 Created`

#### Update Drawing

```
PUT /api/chart-drawings/{symbol}/{id}
```

**Request Body:** Same as create (full drawing_data replacement)

**Response:** `200 OK`

#### Delete Drawing

```
DELETE /api/chart-drawings/{symbol}/{id}
```

**Response:** `204 No Content`

---

### 3.6 Saved Scans

Save custom scan configurations for re-use.

#### List Saved Scans

```
GET /api/saved-scans
```

**Auth Required:** Yes

**Response Schema:**

```json
{
  "saved_scans": [
    {
      "id": "bb0e8400-e29b-41d4-a716-446655440006",
      "name": "High RS Stage 2 Breakouts",
      "conditions": [
        { "field": "rs_rating", "operator": "gte", "value": 80 },
        { "field": "stage", "operator": "eq", "value": 2 },
        { "field": "rvol", "operator": "gte", "value": 1.5 }
      ],
      "created_at": "2026-11-01T10:00:00+05:30",
      "updated_at": "2026-11-10T15:00:00+05:30"
    }
  ],
  "total": 3
}
```

#### Create Saved Scan

```
POST /api/saved-scans
```

**Request Body:**

```json
{
  "name": "My Momentum Filter",
  "conditions": [
    { "field": "rs_rating", "operator": "gte", "value": 70 },
    { "field": "rsi", "operator": "between", "value": [50, 70] },
    { "field": "market_cap", "operator": "gte", "value": 1000 }
  ]
}
```

**Response:** `201 Created`

#### Update Saved Scan

```
PUT /api/saved-scans/{id}
```

**Response:** `200 OK`

#### Delete Saved Scan

```
DELETE /api/saved-scans/{id}
```

**Response:** `204 No Content`

---

### 3.7 Stock Notes

See [Stock Notes under Stock Detail](#167-stock-notes).

---

## 4. Admin Endpoints

> Require JWT with `role: admin` claim.

---

### 4.1 Refresh Cache

Manually trigger a full cache refresh (runs the data pipeline and recomputes all scanners).

```
POST /api/admin/refresh-cache
```

**Auth Required:** Yes (admin only)

**Request Body:**

```json
{
  "target": "all"
}
```

Valid targets: `all`, `scanners`, `metadata`, `sectors`, `breadth`

**Response:**

```json
{
  "status": "accepted",
  "job_id": "cache-refresh-20261112-183000",
  "target": "all",
  "estimated_duration_seconds": 45,
  "message": "Cache refresh job enqueued. Scanners will update within ~45 seconds."
}
```

---

### 4.2 Pipeline Status

Health check for the data pipeline.

```
GET /api/admin/pipeline-status
```

**Auth Required:** Yes (admin only)

**Response Schema:**

```json
{
  "status": "healthy",
  "last_run": {
    "started_at": "2026-11-12T16:05:00+05:30",
    "completed_at": "2026-11-12T16:05:38+05:30",
    "duration_seconds": 38,
    "status": "success",
    "stocks_processed": 2487,
    "errors": 0
  },
  "data_sources": {
    "tejhq_parquet": {
      "status": "healthy",
      "last_date": "2026-11-12",
      "row_count": 2487
    },
    "vishnun_parquet": {
      "status": "healthy",
      "symbols_available": 2675,
      "last_updated": "2026-11-12"
    },
    "bfinance": {
      "status": "healthy",
      "last_fetch": "2026-11-12T16:04:00+05:30"
    }
  },
  "cache": {
    "redis_status": "connected",
    "memory_used_mb": 128.5,
    "memory_max_mb": 512,
    "keys_count": 4523,
    "hit_rate_pct": 94.2
  },
  "database": {
    "supabase_status": "connected",
    "active_connections": 12,
    "max_connections": 60,
    "db_size_mb": 45.3
  },
  "next_scheduled_run": "2026-11-13T16:05:00+05:30"
}
```

---

## Scanner Result Schema

The complete schema for a single stock result from any scanner endpoint. All fields are present on every result; `null` when data is unavailable.

| Field | Type | Example | Description |
|---|---|---|---|
| `symbol` | `string` | `"TRENT"` | NSE trading symbol |
| `name` | `string` | `"Trent Limited"` | Full company name |
| `isin` | `string` | `"INE849A01020"` | ISIN code |
| `series` | `string` | `"EQ"` | NSE series (EQ, BE) |
| `industry` | `string` | `"Retail"` | Industry group classification |
| `conditions_met` | `int` | `8` | Number of scanner conditions passed |
| `cmp` | `float` | `7245.30` | Current Market Price (₹) |
| `prev_close` | `float` | `7180.50` | Previous close price (₹) |
| `change_pct` | `float` | `0.90` | Daily price change (%) |
| `sma_10` | `float` | `7180.20` | 10-day Simple Moving Average |
| `sma_20` | `float` | `7050.15` | 20-day SMA |
| `sma_50` | `float` | `6820.40` | 50-day SMA |
| `sma_150` | `float` | `6200.75` | 150-day SMA (30-week MA) |
| `sma_200` | `float` | `5980.30` | 200-day SMA (40-week MA) |
| `ema_12` | `float` | `7190.55` | 12-day Exponential Moving Average |
| `ema_26` | `float` | `7020.80` | 26-day EMA |
| `rs_rating` | `int` | `97` | Relative Strength Rating (1–99, IBD-style) |
| `stage` | `int` | `2` | Weinstein Stage (1–4) |
| `stage_name` | `string` | `"Advancing"` | Stage label: Basing, Advancing, Topping, Declining |
| `from_52w_high` | `float` | `-3.2` | % distance from 52-week high (negative = below) |
| `from_52w_low` | `float` | `85.4` | % distance from 52-week low (positive = above) |
| `high_52w` | `float` | `7485.00` | 52-week high price (₹) |
| `low_52w` | `float` | `3908.25` | 52-week low price (₹) |
| `rsi` | `float` | `68.5` | RSI (14-period) |
| `rvol` | `float` | `1.45` | Relative Volume (today vol ÷ 50d avg vol) |
| `volume` | `int` | `1245680` | Today's traded volume |
| `avg_volume_50d` | `int` | `859090` | 50-day average volume |
| `pe` | `float\|null` | `112.5` | Price-to-Earnings ratio (TTM) |
| `pb` | `float\|null` | `28.3` | Price-to-Book ratio |
| `roe` | `float\|null` | `25.1` | Return on Equity (%) |
| `roce` | `float\|null` | `33.8` | Return on Capital Employed (%) |
| `debt_equity` | `float\|null` | `0.12` | Debt-to-Equity ratio |
| `eps` | `float\|null` | `64.40` | Earnings Per Share (TTM, ₹) |
| `eps_growth_yoy` | `float\|null` | `42.3` | EPS growth Year-over-Year (%) |
| `revenue_growth_yoy` | `float\|null` | `38.7` | Revenue growth YoY (%) |
| `promoter_pct` | `float\|null` | `37.01` | Promoter holding (%) |
| `fii_pct` | `float\|null` | `20.15` | FII holding (%) |
| `dii_pct` | `float\|null` | `18.90` | DII holding (%) |
| `public_pct` | `float\|null` | `23.94` | Public holding (%) |
| `market_cap` | `float` | `257430.50` | Market capitalization (₹ Crores) |
| `industry_rs_rating` | `int\|null` | `92` | Industry group RS rating (1–99) |
| `delivery_pct` | `float\|null` | `58.3` | Delivery volume as % of total volume |
| `turnover` | `float` | `90234.50` | Turnover (₹ Lakhs) |
| `trades` | `int` | `45230` | Number of trades |

> [!TIP]
> Nullable fields (`float|null`) are `null` for stocks where fundamental data is unavailable (e.g., newly listed stocks, certain ETFs).

---

## Appendix: Pydantic Models (Python)

Key request/response models used in the FastAPI backend:

```python
from pydantic import BaseModel, Field, field_validator
from typing import Optional, Literal
from datetime import datetime, date
from uuid import UUID


class ScannerResult(BaseModel):
    symbol: str
    name: str
    isin: str
    series: str
    industry: str
    conditions_met: int
    cmp: float
    prev_close: float
    change_pct: float
    sma_10: float
    sma_20: float
    sma_50: float
    sma_150: float
    sma_200: float
    ema_12: float
    ema_26: float
    rs_rating: int = Field(ge=1, le=99)
    stage: int = Field(ge=1, le=4)
    stage_name: Literal["Basing", "Advancing", "Topping", "Declining"]
    from_52w_high: float
    from_52w_low: float
    high_52w: float
    low_52w: float
    rsi: float = Field(ge=0, le=100)
    rvol: float
    volume: int
    avg_volume_50d: int
    pe: float | None = None
    pb: float | None = None
    roe: float | None = None
    roce: float | None = None
    debt_equity: float | None = None
    eps: float | None = None
    eps_growth_yoy: float | None = None
    revenue_growth_yoy: float | None = None
    promoter_pct: float | None = None
    fii_pct: float | None = None
    dii_pct: float | None = None
    public_pct: float | None = None
    market_cap: float
    industry_rs_rating: int | None = None
    delivery_pct: float | None = None
    turnover: float
    trades: int


class ScannerResponse(BaseModel):
    scanner: str
    title: str
    description: str
    last_updated: datetime
    total_results: int
    returned: int
    offset: int
    is_truncated: bool
    results: list[ScannerResult]


class ScanCondition(BaseModel):
    field: str
    operator: Literal["gt", "gte", "lt", "lte", "eq", "between", "in", "not_in"]
    value: int | float | str | bool | list

    @field_validator("value")
    @classmethod
    def validate_between(cls, v, info):
        if info.data.get("operator") == "between":
            if not isinstance(v, list) or len(v) != 2:
                raise ValueError("'between' operator requires a list of exactly 2 values")
        return v


class CustomScanRequest(BaseModel):
    conditions: list[ScanCondition] = Field(min_length=1, max_length=10)
    sort_by: str = "rs_rating"
    sort_order: Literal["asc", "desc"] = "desc"
    limit: int = Field(default=50, ge=1, le=100)
    offset: int = Field(default=0, ge=0)


class WatchlistCreate(BaseModel):
    name: str = Field(min_length=1, max_length=100)
    description: str | None = Field(default=None, max_length=500)
    is_default: bool = False


class WatchlistUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=100)
    description: str | None = Field(default=None, max_length=500)
    is_default: bool | None = None
    sort_order: int | None = None


class WatchlistItemAdd(BaseModel):
    symbol: str = Field(min_length=1, max_length=20)
    sort_order: int | None = None

    @field_validator("symbol")
    @classmethod
    def uppercase_symbol(cls, v: str) -> str:
        return v.upper().strip()


class ChartDrawingCreate(BaseModel):
    drawing_data: dict  # TradingView serialized drawing JSON


class SavedScanCreate(BaseModel):
    name: str = Field(min_length=1, max_length=100)
    conditions: list[ScanCondition] = Field(min_length=1, max_length=10)


class PreferencesUpdate(BaseModel):
    theme: Literal["dark", "light"] | None = None
    default_scanner: str | None = None
    chart_settings: dict | None = None


class NoteCreate(BaseModel):
    content: str = Field(min_length=1, max_length=5000)


class ErrorResponse(BaseModel):
    error: str
    message: str
    details: list[dict] | None = None
```
