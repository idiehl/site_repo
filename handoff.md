# Agent Handoff — Atlas Hybrid Rebuild: Phase 0 Complete

> **Updated:** 2026-02-21
> **Prior Chats:**
> - [Atlas Meridian dev page updates](ff67f995-ea12-49aa-b87d-2407bdf716cd) — created inventory pages, updated dev docs, deployed, then pivoted into Blazor/Razor migration planning
> - [Phase 0 planning + execution](current session) — planned the 3-agent build, then executed all 10 Phase 0 tasks
> **Plan File:** `.cursor/plans/atlas_hybrid_rebuild_23484cdf.plan.md`

---

## Overall Goal

Migrate all Atlas Universalis web surfaces (except ElectraCast) from **Python/FastAPI + Vue 3 + Astro** to **C#/.NET 10 / ASP.NET Core / Blazor Server / Razor Pages**, with a hybrid Meridian strategy (keep Avalonia desktop canvas, add web delivery via SkiaSharp.Views.Blazor).

---

## What Was Accomplished in This Session

### 1. Plan Mode: Reviewed Architecture Docs and Created Execution Plan

Read all four architecture documents from the prior planning session:
- `.cursor/plans/atlas_hybrid_rebuild_23484cdf.plan.md` (14.5 KB)
- `docs/architecture/Parity_Matrix.md` (35.7 KB — 23 routes, 71 components, 60+ API endpoints)
- `docs/architecture/Hybrid_Architecture_Spec.md` (61.3 KB — solution structure, contracts, DB/auth/deploy strategy)
- `docs/architecture/Delivery_Cutover_Plan.md` (46.7 KB — 94 tasks across 8 phases)

Resolved blockers with user input:
- **B2 (LLM SDK):** Official OpenAI .NET SDK (`openai-dotnet`) — decided
- **B3 (OAuth state):** `IDistributedCache` with Redis — decided (Redis already on droplet)
- **.NET version:** .NET 10 preview (matching existing Meridian projects)
- **Solution location:** Repo root (`D:\www\atlasuniversalis\AtlasUniversalis.sln`)

Created a detailed Phase 0 execution plan at `.cursor/plans/phase_0_program_setup_6e9923d6.plan.md` defining 3 parallel agents with strict file ownership boundaries.

### 2. Agent Mode: Executed Phase 0 with 3 Parallel Agents

All 3 agents completed successfully. Every task from P0-01 through P0-10 is done.

**Agent 1 — Solution Architect (P0-01, P0-02, P0-09):**
- Created `AtlasUniversalis.sln` with 17 projects organized in solution folders (src/, tests/, tools/)
- Created `global.json` pinning .NET 10 SDK (10.0.100, rollForward latestMinor)
- Created `Directory.Build.props` (net10.0, nullable, implicit usings, warnings-as-errors)
- Created `Directory.Packages.props` centralizing 30+ NuGet package versions
- Created `.editorconfig` with C# coding standards
- Built 3 host apps: Atlas.Web (:5000), Atlas.Apply (:5010), Atlas.Forge (:5020) with minimal `Program.cs` and `/healthz` endpoints
- Created Atlas.UIKit (Razor Class Library stub) and Atlas.Meridian.Player (SkiaSharp RCL stub)
- Copied Meridian projects from `meridian/` to `src/` with updated project references
- Created 5 test projects and 1 tool project (Atlas.DbMigrator)

**Agent 2 — Data & Domain Architect (P0-03, P0-04, P0-05):**
- Created 11 entity classes matching the real PostgreSQL schema (read from actual Python models and Alembic migrations, not just the architecture spec)
- Created 22 DTO/contract files across 8 domain areas (Auth, Jobs, Applications, Profile, Billing, Meridian, Admin, Configuration)
- Created 6 repository/service interfaces (IJobRepository, IApplicationRepository, IUserRepository, ILlmClient, IScraperService, IEntitlementService)
- Created `AtlasDbContext` with 11 `DbSet<>` properties and 11 entity type configurations (snake_case mapping)
- Created 9 API endpoint stub classes (~75 route handlers mapped to `/api/v2/` prefix)
- Created `docs/architecture/Migration_Sequence.md` documenting the per-phase route cutover order
- Found and resolved 8 discrepancies between the architecture spec and the real Python schema (see details below)

**Agent 3 — DevOps Engineer (P0-06, P0-07, P0-08, P0-10):**
- Created Nginx blue/green configs: 4 upstreams, route map variables (all defaulting to legacy — zero traffic change)
- Created 3 Nginx server blocks with SSL, WebSocket support for `/_blazor` (SignalR), security headers, `/healthz` always routing to .NET
- Created 3 systemd units (atlas-web, atlas-apply, atlas-forge) with watchdog, graceful shutdown
- Created `deploy/deploy-dotnet.sh` with backup and rollback support
- Created `.github/workflows/deploy-dotnet.yml` (3-job pipeline: build+test, deploy, smoke test)
- Created `deploy/RUNBOOK.md` with 12-section operations guide

### 3. Validation

- `dotnet build AtlasUniversalis.sln` — **0 warnings, 0 errors** across all 17 projects
- `dotnet test AtlasUniversalis.sln` — test infrastructure works (no test cases yet, expected for stubs)
- All config files verified present: global.json, Directory.Build.props, Directory.Packages.props, .editorconfig, deploy-dotnet.yml

### 4. Version Logging

Master Log updated with entry `AU-C01-20260221-001` documenting the full Phase 0 build.

---

## Schema Discrepancies Found and Resolved

Agent 2 read the actual Python models and Alembic migrations rather than relying solely on the architecture spec. These discrepancies were found and the .NET entities match the **real database schema**:

1. **Analytics tables:** The spec listed a single `AnalyticsEvent` entity. The real schema has **3 separate tables**: `SiteVisit`, `ApiUsage`, `SecurityEvent`. All 3 created.
2. **`subscription_status` column on User:** Present in Python model (Alembic migration 0012) but missing from spec. Included.
3. **`current_period_end` column on User:** Stripe billing period end. Present in Python, missing from spec. Included.
4. **`resume_generations_used` / `resume_generation_reset_at` on User:** Usage tracking fields from migration 0012. Included.
5. **Password reset fields on User:** `password_reset_token_hash`, `password_reset_requested_at`, `password_reset_expires_at` from migration 0015. Included.
6. **ApplicationStatus enum values:** Spec suggested generic values. Real Python enum is: `Pending, Applied, FollowupScheduled, InterviewScheduled, OfferReceived, Rejected, Withdrawn, NoResponseClosed`. Used real values.
7. **GeneratedCoverLetter entity:** Present in Python but missing as a User navigation property in spec. Created with JobPosting relationship.
8. **JSON column types:** Python uses `JSON` type; EF Core configurations use `jsonb` (more efficient, backward-compatible).

---

## Current State

### What Exists Now (Phase 0 deliverables)

```
AtlasUniversalis.sln          (17 projects, builds clean)
global.json                    (.NET 10 SDK pin)
Directory.Build.props          (shared build properties)
Directory.Packages.props       (centralized NuGet versions)
.editorconfig                  (C# coding standards)

src/
  Atlas.Web/                   Razor Pages + Blazor Server (:5000) — placeholder Index page, /healthz
  Atlas.Apply/                 Blazor Server (:5010) — /healthz
  Atlas.Forge/                 Blazor Server (:5020) — /healthz
  Atlas.Api/                   Minimal API — 9 endpoint stub classes (~75 routes at /api/v2/*)
  Atlas.Core/                  11 entities, 1 enum, 6 interfaces
  Atlas.Infrastructure/        AtlasDbContext + 11 entity type configurations
  Atlas.Contracts/             22 DTO files across 8 domain areas + 6 config POCOs
  Atlas.Meridian.Core/         Existing document model (copied from meridian/)
  Atlas.Meridian.App/          Existing Avalonia desktop app (copied from meridian/)
  Atlas.Meridian.Player/       SkiaSharp.Views.Blazor RCL stub
  Atlas.UIKit/                 Razor Class Library stub + placeholder CSS

tests/
  Atlas.Core.Tests/            xUnit + FluentAssertions + Moq
  Atlas.Infrastructure.Tests/
  Atlas.Api.Tests/             + Mvc.Testing, Testcontainers
  Atlas.Web.Tests/             + Mvc.Testing
  Atlas.Meridian.Player.Tests/

tools/
  Atlas.DbMigrator/            One-time Alembic baseline migration tool

deploy/
  nginx/atlas-upstreams.conf   Blue/green upstream definitions
  nginx/atlas-route-map.conf   Map variables (all default to legacy)
  nginx/atlas-web.conf         Main site server block with SSL, WebSocket, healthz
  nginx/atlas-apply.conf       Apply server block
  nginx/atlas-forge.conf       Forge server block
  systemd/atlas-web.service    Kestrel :5000
  systemd/atlas-apply.service  Kestrel :5010
  systemd/atlas-forge.service  Kestrel :5020
  deploy-dotnet.sh             Deploy script with backup/rollback
  RUNBOOK.md                   Server setup and operations guide

.github/workflows/
  deploy.yml                   Existing Python/Vue CI/CD (UNTOUCHED)
  deploy-dotnet.yml            New .NET CI/CD pipeline

docs/architecture/
  Parity_Matrix.md             Route/component/API parity (from prior session)
  Hybrid_Architecture_Spec.md  Full architecture spec (from prior session)
  Delivery_Cutover_Plan.md     94-task delivery plan (from prior session)
  Migration_Sequence.md        Per-phase route cutover order (NEW this session)
```

### What Has NOT Changed

- All existing Python/FastAPI code (`app.py`, `atlasops/`, `alembic/`) is untouched
- All existing Vue/Astro frontends (`frontend-main/`, `frontend/`, `atlasforge/`) are untouched
- The existing CI/CD pipeline (`.github/workflows/deploy.yml`) is untouched
- The existing Nginx configs on the server are untouched
- Production is still running the Python/Vue stack — zero traffic change
- The original `meridian/` directory still exists (files were copied, not moved)
- **No commits have been made**
- **No deploys have been made**
- ElectraCast is fully excluded

---

## Exact Next Steps

### Immediate: Commit Phase 0 Work

All Phase 0 code is built and verified locally but has not been committed to git. The user should review and commit when ready.

### Phase 1: Design System (P1-01 through P1-12, ~10.5 days)

The next phase builds the Blazor component library. Top tasks:

| # | Task ID | Task | Est. |
|---|---------|------|------|
| 1 | P1-01 | Inventory UI concept pack; extract design tokens from `internal/UI/Figma/Isolated_Elements/` | 1d |
| 2 | P1-02 | Create `Atlas.UIKit` design-token CSS variables file (`_tokens.css`) | 0.5d |
| 3 | P1-03 | Build `AtlasButton` Blazor component (primary, secondary, ghost, danger) | 1d |
| 4 | P1-04 | Build `AtlasCard` (standard, elevated, bordered) | 0.5d |
| 5 | P1-05 | Build `AtlasInput` / `AtlasTextarea` with validation | 1d |
| 6 | P1-06 | Build `AtlasNavbar` / `AtlasFooter` layout components | 1d |
| 7 | P1-07 | Build `AtlasBadge`, `AtlasAvatar`, `AtlasAlert`, `AtlasTabs`, `AtlasProgress` | 2d |
| 8 | P1-08 | Build `AtlasModal`, `AtlasDropdown`, `AtlasTooltip` interactive components | 1.5d |
| 9 | P1-09 | Build `AtlasTable` with sorting, pagination, empty-state | 1d |
| 10 | P1-10 | Build `AtlasFormGroup` / `AtlasFieldValidation` wrappers | 0.5d |
| 11 | P1-11 | Create `/showcase` page rendering all UIKit components | 1d |
| 12 | P1-12 | Icon system: SVG icon set as `AtlasIcon` component | 0.5d |

**Gate G1-2:** All components have bUnit tests; showcase page renders; visual review approved.

### Server-Side Setup (Can Be Done in Parallel)

Before Phase 2 can deploy to production, the droplet needs .NET 10 installed. This is documented in `deploy/RUNBOOK.md` and involves:

1. Install .NET 10 SDK on the droplet
2. Create `/opt/atlas/{web,apply,forge}` directories
3. Copy systemd unit files and enable services
4. Copy Nginx configs (upstreams + route map to `conf.d/`, server blocks to `sites-available/`)
5. Test with `nginx -t` and reload
6. Verify `/healthz` endpoints respond

This can be done manually following the RUNBOOK, or automated in a future session.

### Remaining Blockers

| # | Blocker | Status | When Needed |
|---|---------|--------|-------------|
| B1 | Celery replacement validation (BackgroundService + Channels) | Deferred | Phase 6 |
| B4 | Database dry-run (staging PostgreSQL clone for Alembic-to-EF-Core baseline) | Deferred | Before Phase 3 |
| B5 | Analytics schema mapping (SiteVisit/ApiUsage/SecurityEvent) | Resolved by Agent 2 (3 entities created) | Phase 6 |

### Full Phase Timeline (from Delivery Plan)

| Week | Dates | Milestone |
|------|-------|-----------|
| 1-2 | Mar 2-13 | **Phase 0 complete** (DONE locally, needs commit + server setup) |
| 3-4 | Mar 16-27 | Phase 1 complete (UIKit) |
| 5-7 | Mar 30-Apr 17 | Phase 2 complete (main site live on .NET) |
| 7-10 | Apr 14-May 8 | Phase 3 complete (Apply live) |
| 10-13 | May 11-Jun 5 | Phase 4 complete (Forge live) |
| 10-14 | May 11-Jun 12 | Phase 5 complete (Meridian Player) |
| 14-18 | Jun 15-Jul 10 | Phase 6 complete (APIs on .NET) |
| 18-19 | Jul 13-Jul 24 | Phase 7 complete (legacy gone) |

---

## Key Files and Locations

### Architecture Docs (from prior planning session)
- `.cursor/plans/atlas_hybrid_rebuild_23484cdf.plan.md` — hardened plan file
- `docs/architecture/Parity_Matrix.md` — route/component/API parity matrix
- `docs/architecture/Hybrid_Architecture_Spec.md` — full architecture spec (solution structure, contracts, DB/auth/deploy)
- `docs/architecture/Delivery_Cutover_Plan.md` — 94-task delivery plan with gates
- `docs/architecture/Migration_Sequence.md` — per-phase route cutover order

### Phase 0 Build Deliverables (this session)
- `AtlasUniversalis.sln` — solution with 17 projects
- `global.json` / `Directory.Build.props` / `Directory.Packages.props` / `.editorconfig` — build configuration
- `src/Atlas.Core/Entities/*.cs` — 11 domain entities matching PostgreSQL schema
- `src/Atlas.Core/Interfaces/*.cs` — 6 repository/service interfaces
- `src/Atlas.Contracts/**/*.cs` — 22 DTO files + 6 configuration POCOs
- `src/Atlas.Infrastructure/Data/AtlasDbContext.cs` — EF Core context with 11 DbSets
- `src/Atlas.Infrastructure/Data/Configurations/*.cs` — 11 entity type configurations
- `src/Atlas.Api/Endpoints/*.cs` — 9 endpoint stub classes
- `src/Atlas.Web/Program.cs` — Razor Pages + Blazor Server host
- `src/Atlas.Apply/Program.cs` — Blazor Server host for Apply
- `src/Atlas.Forge/Program.cs` — Blazor Server host for Forge
- `deploy/nginx/*.conf` — Blue/green Nginx configs
- `deploy/systemd/*.service` — systemd units for 3 Kestrel hosts
- `deploy/deploy-dotnet.sh` — deploy script with rollback
- `deploy/RUNBOOK.md` — server setup runbook
- `.github/workflows/deploy-dotnet.yml` — .NET CI/CD pipeline

### Legacy Codebase (still running in production)
- `app.py` — FastAPI entry point
- `atlasops/api/v1/*.py` — 9 API modules
- `frontend-main/` — Main site Vue 3 SPA
- `frontend/` — Atlas Apply Vue 3 SPA + Pinia stores
- `atlasforge/` — Forge (Astro + Vue + React)
- `electracast/` — ElectraCast (EXCLUDED from migration)
- `meridian/` — Meridian desktop app (originals still in place)
- `.github/workflows/deploy.yml` — existing Python/Vue CI/CD

### Rules/Skills
- `.cursor/rules/MASTER.mdc` — master project rules
- `.cursor/skills/version-logger/SKILL.md` — version logger skill (invoked after changes)

---

## Notes for Next Agent

- **Do NOT commit or deploy** unless the user explicitly asks.
- The workspace path is `D:\www\atlasuniversalis`.
- Production is at `root@167.71.179.90` (`/var/www/atlasuniversalis.com`).
- ElectraCast is **excluded** from all migration work.
- The user prefers **3 parallel agents** for implementation work.
- Version logging is required after any changes (see `.cursor/skills/version-logger/SKILL.md`).
- MCP tools are available for doc updates (atlasops-dashboard MCP server).
- `dotnet build AtlasUniversalis.sln` must pass after any changes.
- All Nginx route maps currently default to `atlas_legacy` — no traffic goes to .NET yet.
- The API endpoint stubs use `/api/v2/` prefix (Python stays on `/api/v1/`). During dual-stack, both coexist.
- The `.NET 10` SDK is preview. NuGet packages use .NET 9 stable versions (forward-compatible).
- No changes have been committed to git yet. All Phase 0 work is local only.
