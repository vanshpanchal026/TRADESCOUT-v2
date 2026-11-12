# Changelog

All notable changes to the **TRADESCOUT** platform will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased]

### Added
- Complete reverse-engineered architectural teardown of ScanTheCharts.com.
- Zero-scraper data pipeline design utilizing Hugging Face columnar Parquet datasets (`tejhq/indian-markets` & `vishnun0027/indian-market-historical-ohlcv`).
- Vectorized Polars technical indicator engine specification for Minervini Trend Template, Weinstein Stages, and IBD Relative Strength rating.
- Complete Supabase PostgreSQL schema with Row Level Security (RLS) policies for watchlists, custom scans, chart drawings, and trader notes.
- 7-Phase implementation roadmap with granular acceptance criteria.
- Full REST API specification with 100+ field scanner data schemas and endpoint contracts.
- Local development infrastructure via Docker Compose (PostgreSQL 16, Redis 7, pgAdmin).
- Strict AI agent guardrails (`.cursorrules`, `agent.md`, `agentrules.md`).
