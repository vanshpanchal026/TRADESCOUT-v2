# Changelog

All notable changes to the **TRADESCOUT** platform will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased]

### Changed
- Reorganized repository structure: consolidated all 12 architecture, specification, and implementation documents into `docs/` with a centralized index (`docs/README.md`), keeping only essential configuration and protocol files in the repository root.

### Added
- Imported complete context, research vault, and live API fixtures from conversation `27c18536-f6cb-409a-bfed-4ac05e6bc0e8` (`research/`).
- Benchmark & feasibility report for open-source Parquet market data sources (`research/data-sources-benchmark-report.md`).
- Cost, cloud infrastructure, and funds requirement analysis (`research/cost-and-resource-breakdown.md`).
- 24 real-world JSON response fixtures captured from ScanTheCharts for mocking and testing (`research/api-fixtures/`).
- Complete reverse-engineered architectural teardown of ScanTheCharts.com (`research/scanthecharts-architecture-teardown.md`).
- Zero-scraper data pipeline design utilizing Hugging Face columnar Parquet datasets (`tejhq/indian-markets` & `vishnun0027/indian-market-historical-ohlcv`).
- Vectorized Polars technical indicator engine specification for Minervini Trend Template, Weinstein Stages, and IBD Relative Strength rating.
- Complete Supabase PostgreSQL schema with Row Level Security (RLS) policies for watchlists, custom scans, chart drawings, and trader notes.
- 7-Phase implementation roadmap with granular acceptance criteria.
- Full REST API specification with 100+ field scanner data schemas and endpoint contracts.
- Local development infrastructure via Docker Compose (PostgreSQL 16, Redis 7, pgAdmin).
- Strict AI agent guardrails (`.cursorrules`, `agent.md`, `agentrules.md`).
