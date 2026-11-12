# 📚 TRADESCOUT Documentation Vault

Welcome to the centralized documentation directory for the **TRADESCOUT** platform. This directory houses all formal product requirements, system architecture blueprints, data engineering designs, API specifications, and operational guides.

---

## 🗂️ Documentation Matrix

| Document | Primary Audience | Description & Key Contents |
| :--- | :--- | :--- |
| [**`PRD.md`**](file:///c:/Users/pc/OneDrive/Desktop/TRADESCOUT%20%28%20inspired%20by%20%20scann%20the%20chart%29/docs/PRD.md) | Product / All | Product Requirements Document: Target user personas, 7 core scanners, `/warmup` breadth diagnostic, freemium gating, and success metrics. |
| [**`TechStack.md`**](file:///c:/Users/pc/OneDrive/Desktop/TRADESCOUT%20%28%20inspired%20by%20%20scann%20the%20chart%29/docs/TechStack.md) | Architecture / Dev | Full technology stack matrix, technology justifications (Polars vs Pandas, Next.js 14, TradingView LC v4), and infrastructure cost model. |
| [**`DesignDocument.md`**](file:///c:/Users/pc/OneDrive/Desktop/TRADESCOUT%20%28%20inspired%20by%20%20scann%20the%20chart%29/docs/DesignDocument.md) | Engineering / UI/UX | High-level system architecture, component topology, state management, caching layers, typography (Hanken Grotesk), and chart rendering pipeline. |
| [**`AppFlow.md`**](file:///c:/Users/pc/OneDrive/Desktop/TRADESCOUT%20%28%20inspired%20by%20%20scann%20the%20chart%29/docs/AppFlow.md) | Frontend / UI/UX | Complete user journeys, screen flows, modal states, navigation hierarchy, and mobile responsive behavior. |
| [**`API-Spec.md`**](file:///c:/Users/pc/OneDrive/Desktop/TRADESCOUT%20%28%20inspired%20by%20%20scann%20the%20chart%29/docs/API-Spec.md) | Backend / Frontend | Full REST API contracts, Pydantic request/response schemas, query parameters, and error schemas for all public and member endpoints. |
| [**`Backend scheme.md`**](file:///c:/Users/pc/OneDrive/Desktop/TRADESCOUT%20%28%20inspired%20by%20%20scann%20the%20chart%29/docs/Backend%20scheme.md) | Backend / DBA | Complete Supabase PostgreSQL 15+ schema, Row Level Security (RLS) policies, indexes, and triggers for watchlists, custom scans, and chart drawings. |
| [**`data-pipeline.md`**](file:///c:/Users/pc/OneDrive/Desktop/TRADESCOUT%20%28%20inspired%20by%20%20scann%20the%20chart%29/docs/data-pipeline.md) | Data / Backend | Zero-scraper data ingestion engine: daily Hugging Face Parquet streaming, Polars vectorized calculations, and Redis pre-computed cache dumping. |
| [**`implementation-plan.md`**](file:///c:/Users/pc/OneDrive/Desktop/TRADESCOUT%20%28%20inspired%20by%20%20scann%20the%20chart%29/docs/implementation-plan.md) | PM / Devs / Agents | 7-Phase granular implementation roadmap with acceptance criteria, task dependencies, and milestones. |
| [**`Testing-Strategy.md`**](file:///c:/Users/pc/OneDrive/Desktop/TRADESCOUT%20%28%20inspired%20by%20%20scann%20the%20chart%29/docs/Testing-Strategy.md) | QA / Devs | Multi-tier test strategy: Polars mathematical golden sets, FastAPI pytest suites, Next.js Playwright E2E tests, and Lighthouse performance gates. |
| [**`Security-and-Scale.md`**](file:///c:/Users/pc/OneDrive/Desktop/TRADESCOUT%20%28%20inspired%20by%20%20scann%20the%20chart%29/docs/Security-and-Scale.md) | DevOps / Sec | Threat modeling, API rate limiting, Supabase JWT verification, CORS policies, data encryption, and scaling thresholds to 100k MAU. |
| [**`environment-setup.md`**](file:///c:/Users/pc/OneDrive/Desktop/TRADESCOUT%20%28%20inspired%20by%20%20scann%20the%20chart%29/docs/environment-setup.md) | Devs / Onboarding | Step-by-step developer workstation onboarding guide: local prerequisites, Docker Compose startup, Supabase setup, and running Next.js + FastAPI. |
| [**`InterviewLog.md`**](file:///c:/Users/pc/OneDrive/Desktop/TRADESCOUT%20%28%20inspired%20by%20%20scann%20the%20chart%29/docs/InterviewLog.md) | Architecture / Hist | Architectural Decision Records (ADRs) capturing the rationale behind key technical choices and design trade-offs. |

---

## 🔗 Cross-Directory References

- **Root Quick Start:** See [`../README.md`](file:///c:/Users/pc/OneDrive/Desktop/TRADESCOUT%20%28%20inspired%20by%20%20scann%20the%20chart%29/README.md) for project introduction, feature highlights, and setup commands.
- **Living Status Board:** See [`../memory.md`](file:///c:/Users/pc/OneDrive/Desktop/TRADESCOUT%20%28%20inspired%20by%20%20scann%20the%20chart%29/memory.md) for active phase status and engineering decisions.
- **Reverse-Engineering Vault:** See [`../research/README.md`](file:///c:/Users/pc/OneDrive/Desktop/TRADESCOUT%20%28%20inspired%20by%20%20scann%20the%20chart%29/research/README.md) for target site teardown reports and real API response fixtures.
- **Local Infrastructure:** See [`../infra/docker-compose.yml`](file:///c:/Users/pc/OneDrive/Desktop/TRADESCOUT%20%28%20inspired%20by%20%20scann%20the%20chart%29/infra/docker-compose.yml) for PostgreSQL 16, Redis 7, and pgAdmin containers.
