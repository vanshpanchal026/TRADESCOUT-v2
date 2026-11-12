# TRADESCOUT — Autonomous Agent Protocol & Working Guide

> **Target Agent Ecosystem:** Antigravity, Cursor Agent, Codex, Claude Code  
> **Mandatory Rule:** Always read `memory.md` first at the start of any session. Update `memory.md` upon completion of every significant task.

---

## 1. Operating Protocol for Coding Agents

### Step 1: Session Initialization (Reconnaissance)
1. Read `memory.md` to understand current project state, active phase, and completed milestones.
2. Check `docs/InterviewLog.md` before questioning architectural choices (e.g., why Polars was chosen over Pandas, why Hugging Face Parquet is used instead of scrapers).
3. Verify your working directory is the repository root.

### Step 2: Implementation Guidelines
- **Python Tasks:** Work inside `api/`. Always activate virtual environment (`api/.venv`). Run `ruff check .` before saving.
- **Frontend Tasks:** Work inside `web/`. Use `pnpm`. Verify strict TypeScript types with `pnpm tsc --noEmit`.
- **Database Tasks:** Write idempotent SQL migrations in `supabase/migrations/` and update `docs/Backend scheme.md`.
- **Infrastructure Tasks:** Configure `infra/docker-compose.yml`.

### Step 3: Verification & Quality Gates
- Never mark a feature complete without automated tests.
- For financial indicator modifications, always execute:
  ```powershell
  cd api
  pytest tests/unit/test_golden_indicators.py -v
  ```
- Ensure zero regression against the 10-stock golden reference set.

### Step 4: Session Finalization (Persistence)
- Update `memory.md` Status Board: mark finished tasks as `[x]`, update notes, and list next immediate tasks.
- If user-facing changes were made, log an entry in `CHANGELOG.md`.

---

## 2. Monorepo Map & Environment Quick Reference

```
TRADESCOUT/
├── api/                   # Python FastAPI Backend
│   ├── app/
│   │   ├── api/v1/        # Route endpoints (scanners, stocks, metadata)
│   │   ├── core/          # Config, security, database connectors
│   │   ├── schemas/       # Pydantic v2 data models
│   │   └── services/      # Ingestion pipeline, Polars indicator engine
│   ├── tests/             # Pytest unit and integration suites
│   ├── requirements.txt   # Python pinned dependencies
│   └── main.py            # Uvicorn entrypoint
├── web/                   # Next.js 14 App Router Frontend
│   ├── src/
│   │   ├── app/           # App router pages (/warmup, /scanners, /stock, etc.)
│   │   ├── components/    # Reusable UI, TradingView chart canvas, data grids
│   │   ├── hooks/         # TanStack Query & Supabase auth hooks
│   │   ├── lib/           # Supabase client, API client, formatting utils
│   │   └── types/         # TypeScript interface definitions
│   ├── package.json       # Pnpm package manifest
│   └── tailwind.config.ts # Design system & colors
├── infra/                 # Infrastructure & local services
│   └── docker-compose.yml # PostgreSQL 16, Redis 7, pgAdmin
├── docs/                  # Architectural documents & specifications
├── memory.md              # Living state & status board
├── .cursorrules           # Strict agent coding rules
└── agentrules.md          # Guardrails & hard constraints
```

---

## 3. Essential CLI Commands for Agents

### Start Local Services:
```powershell
# From project root:
docker compose -f infra/docker-compose.yml up -d
```

### Start Backend Server:
```powershell
cd api
python -m uvicorn app.main:app --reload --port 8000
```

### Start Frontend Dev Server:
```powershell
cd web
pnpm dev --port 3000
```

### Run Full Test Suite:
```powershell
cd api
pytest
cd ../web
pnpm test
```

### Check Backend Health:
```powershell
curl http://localhost:8000/healthz
# Expected output: {"status": "ok", "timestamp": "...", "version": "1.0.0"}
```
