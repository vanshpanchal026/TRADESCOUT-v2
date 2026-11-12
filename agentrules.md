# TRADESCOUT — Strict Agent Hard Constraints & Guardrails (agentrules.md)

> **Authority:** Non-negotiable repository policy. Violating these rules will cause build failures and revert permissions.

---

## 1. Absolute Prohibitions (Zero Tolerance)

1. **NO PLACEHOLDER CODE:**
   - NEVER write stub functions with `pass`, `// TODO: Implement later`, or mocked dummy data in production logic.
   - If an endpoint or service is declared, it must be fully implemented and covered with tests.
2. **NO WEB SCRAPING:**
   - NEVER introduce scrapers that query `nseindia.com`, `bseindia.com`, or any financial portal using Selenium, Playwright, or requests.
   - All market data MUST ingest via verified Hugging Face Parquet streams or the `bfinance` SDK.
3. **NO PANDAS FOR DATA PROCESSING:**
   - NEVER import or use `pandas` or `numpy` in data ingestion or indicator pipelines.
   - All calculations must use `polars` expressions and lazy evaluation.
4. **NO COMMITTING BROKEN TESTS:**
   - Never finalize a task if `pytest` or `pnpm tsc` produces errors or regressions.
5. **NO HARDCODED SECRETS:**
   - Never embed Supabase keys, database passwords, or JWT secrets in code or git commits.
   - Use environment variables via Pydantic `BaseSettings` (`api/app/core/config.py`) and Next.js `.env.local`.
6. **NO RAW SQL STRING CONCATENATION:**
   - Prevent SQL injection vulnerabilities by using SQLAlchemy 2.0 parameterized queries or the Supabase PostgREST client exclusively.
7. **NO BYPASSING RLS:**
   - Never execute user queries using the Supabase `service_role` key from client-facing endpoints. User actions must strictly evaluate under authenticated user JWTs with PostgreSQL RLS active.

---

## 2. Mandatory Workflow Constraints

1. **Pre-flight Reconnaissance:**
   - Before writing any code, search the repository to reuse existing patterns, utilities, and components.
2. **Living Document Sync:**
   - Any change to API endpoints MUST be documented in `API-Spec.md`.
   - Any database table modification MUST be reflected in `Backend scheme.md`.
   - Every session MUST conclude by updating the status board in `memory.md`.
3. **SEBI Legal Safety:**
   - Ensure all public-facing financial views render the regulatory disclaimer. Never use actionable advisory terms (`"BUY"`, `"SELL"`, `"TARGET"`) in system prompts or user interfaces.
