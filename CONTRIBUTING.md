# Contributing to TRADESCOUT

Thank you for contributing to **TRADESCOUT**! To maintain code quality, financial accuracy, and architectural consistency across the monorepo, all contributors and autonomous coding agents must adhere to the following workflow.

---

## 1. Development Principles

1. **Zero Calculation Drift:**
   All changes to technical indicators (Moving averages, RSI, RS rating, Stages, Minervini filters) must pass the 10-stock golden dataset regression test suite (`tests/unit/test_golden_indicators.py`) with variance $< 0.01\%$.
2. **Zero Scraper Policy:**
   Never write web scrapers targeting `nseindia.com` or `bseindia.com`. All EOD data must originate from open Parquet datasets or official APIs.
3. **Polars Exclusivity:**
   Never introduce `pandas` or `numpy` for data manipulation in backend pipelines. Use `polars` expressions exclusively.
4. **Row Level Security (RLS):**
   Every new PostgreSQL table containing user-specific data must have RLS enabled with explicit tenant-isolated policies.

---

## 2. Git & Branching Strategy

- **Main Branch:** `main` (Production-ready, deployed to Vercel/Hetzner).
- **Feature Branches:** Use standard prefixes:
  - `feat/scanner-vcp-filter`
  - `fix/rsi-wilder-smoothing`
  - `docs/api-spec-update`
  - `perf/polars-cache-invalidation`
- **Commit Messages:** Follow [Conventional Commits](https://www.conventionalcommits.org/):
  - `feat(api): add 10-stock golden dataset verification test`
  - `fix(web): prevent chart canvas memory leak on unmount`
  - `docs(schema): document stock_notes RLS policy`

---

## 3. Pull Request & Quality Checklist

Before opening a pull request, verify that:
- [ ] Backend tests pass: `cd api && pytest`
- [ ] Golden dataset tests pass: `pytest tests/unit/test_golden_indicators.py`
- [ ] Python linting passes: `ruff check api/`
- [ ] Frontend type checking passes: `cd web && pnpm tsc --noEmit`
- [ ] Any new or altered API endpoint is documented in `docs/API-Spec.md`
- [ ] Any schema alteration is reflected in `docs/Backend scheme.md`
- [ ] `memory.md` status board is updated to reflect finished tasks
