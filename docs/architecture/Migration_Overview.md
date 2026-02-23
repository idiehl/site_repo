# Atlas Universalis — Migration Overview

> **Last updated:** 2026-02-22  
> **Scope:** Full-stack migration from Python/FastAPI + Vue 3 + Astro to C#/.NET 10 / Razor Pages / Blazor Server  
> **Excludes:** ElectraCast (stays as React, untouched)

---

## 1. What We're Doing

Replacing the entire Atlas Universalis web stack — a Python/FastAPI backend, three Vue 3 / Astro frontends, Celery+Redis job queue — with a single .NET 10 solution. The new stack uses Razor Pages for static content, Blazor Server for interactive apps, and Minimal API endpoints backed by EF Core and PostgreSQL.

The migration runs in 8 phases over ~17 weeks. Each phase can be independently deployed and rolled back via Nginx upstream switching. The existing Python stack keeps serving production traffic until each subsystem is validated and cut over.

---

## 2. Current State (Where We Are Now)

### Completed

| Phase | What Was Done | Status |
|-------|--------------|--------|
| **Phase 0: Solution Scaffold** | Created `AtlasUniversalis.sln` with 11 src projects, 5 test projects, 1 tool project. Built all EF Core entities (11), DTOs (22), endpoint stubs (9 modules, ~75 routes). Set up Nginx blue/green configs, systemd services, CI/CD pipeline, deploy script with rollback. | Done, committed |
| **Phase 1: UIKit Design System** | Built 24 Blazor components from Figma brand spec. 12-color palette extracted (Foundation Blues, Heritage Golds, Atlas Silvers). CSS custom properties, scoped CSS, showcase page. | Done, committed |
| **Phase 2: Main Site + Dev Portal** | All 10 `frontend-main` Vue routes ported to Razor Pages. Markdown service (Markdig), cookie-based dev portal auth, disk-based doc reading. | Done, committed |
| **Phase 3 Bootstrap: Reconciliation** | Synced local with origin/master. Five-agent workflow established with gate enforcement. | Done, pushed |

### In Progress

| Item | Status |
|------|--------|
| **OAuth: DistributedCacheOAuthStateStore** | New Redis-backed implementation created, replacing the in-memory dict. Interface updated. Tests written. Uncommitted (current working changes). |

### Not Yet Started

| Phase | Description |
|-------|-------------|
| Phase 3: Atlas Apply Migration | Port Vue SPA to Blazor Server — the big one |
| Phase 4: Atlas Forge Migration | Port Astro+Vue playground to Blazor Server |
| Phase 5: Meridian Web Player | SkiaSharp canvas renderer on the web |
| Phase 6: API Cutover (v1 to v2) | Decommission Python FastAPI |
| Phase 7: Legacy Decommission | Remove all Python/Vue/Astro source code |

### What's Running in Production

The **original stack** still serves all production traffic:

| Component | Technology | Status |
|-----------|-----------|--------|
| `atlasuniversalis.com` | Vue 3 SPA (Nginx static files) | Live |
| `apply.atlasuniversalis.com` | Vue 3 SPA + FastAPI on :8000 | Live |
| `forge.atlasuniversalis.com` | Astro SSG (Nginx static files) | Live |
| `electracast.atlasuniversalis.com` | React SPA (Nginx static files) | Live (excluded from migration) |
| Backend API | Python FastAPI + Uvicorn | Live |
| Job queue | Celery + Redis | Live |
| Database | PostgreSQL | Live (shared by both stacks) |

The .NET code exists only locally. Nothing has been deployed to the server yet.

---

## 3. What Exists in the .NET Codebase

### Solution Structure (11 src projects)

```
AtlasUniversalis.sln
├── src/
│   ├── Atlas.Web            Razor Pages + Blazor Server (main site)    ★ Pages built
│   ├── Atlas.Apply           Blazor Server (apply subdomain)           ☐ Shell only
│   ├── Atlas.Forge           Blazor Server (forge subdomain)           ☐ Shell only
│   ├── Atlas.Api             Minimal API endpoints (shared library)    ◐ Stubs + OAuth done
│   ├── Atlas.Core            Domain entities, enums, interfaces        ★ Complete
│   ├── Atlas.Infrastructure  EF Core, DbContext, configurations        ★ Complete
│   ├── Atlas.Contracts       DTOs, request/response types, config      ★ Complete
│   ├── Atlas.UIKit           Blazor component library (design system)  ★ 24 components
│   ├── Atlas.Meridian.Core   Document model (shared with desktop)      ★ Existing, ported
│   ├── Atlas.Meridian.Player SkiaSharp web renderer                    ☐ Stub only
│   └── Atlas.Meridian.App    Avalonia desktop app                      ★ Existing, ported
├── tests/                   5 test projects (xUnit + FluentAssertions + Moq)
├── tools/
│   └── Atlas.DbMigrator     One-time Alembic-to-EF-Core tool          ☐ Stub only
└── deploy/                  Nginx configs, systemd units, scripts, runbook
```

**Legend:** ★ = complete/functional, ◐ = partially done, ☐ = stub/empty

### What's Built vs. What's a Stub

**Fully implemented:**
- All 11 EF Core entity classes matching the existing PostgreSQL schema
- All 22 DTO/contract files (Auth, Jobs, Applications, Profile, Billing, Meridian, Admin, Config)
- 6 repository/service interfaces in Atlas.Core
- 11 entity type configurations (snake_case table/column mapping matching SQLAlchemy)
- 24 UIKit Blazor components with scoped CSS
- 12 Razor Pages for Atlas.Web (landing, Meridian, 10 dev portal pages)
- OAuth implementation (LinkedIn + Google, JWT token factory, state management)
- JWT authentication middleware configuration
- CI/CD pipeline, deploy script, systemd services, Nginx configs

**Stubs only (return `Results.Ok()` with no logic):**
- Auth endpoints: register, login, logout, password reset
- All Profile endpoints
- All Application endpoints (7 routes)
- All Job endpoints (20+ routes)
- All Billing endpoints (3 routes)
- All Admin endpoints (5 routes)
- All Meridian endpoints (6 routes)
- All Dev portal API endpoints (12 routes)
- All Playground endpoints (5 routes)

---

## 4. What Still Needs to Be Translated

### Frontend Pages (Vue/Astro to Blazor/Razor)

| App | Vue Component | .NET Target | Status | Complexity |
|-----|--------------|-------------|--------|------------|
| **Main Site** | | | | |
| | `HomeView.vue` | `Index.cshtml` | ★ Done | Low |
| | `MeridianView.vue` | `Meridian.cshtml` | ★ Done | Low |
| | `DevLoginView.vue` | `Dev/Login.cshtml` | ★ Done | Low |
| | `DevDashboardView.vue` | `Dev/Dashboard.cshtml` | ★ Done | Med |
| | `DevLogView.vue` | `Dev/Log.cshtml` | ★ Done | Low |
| | `DevOverviewView.vue` | `Dev/Overview.cshtml` | ★ Done | Low |
| | `DevAppLogView.vue` | `Dev/AppLog.cshtml` | ★ Done | Low |
| | `DevAppOverviewView.vue` | `Dev/AppOverview.cshtml` | ★ Done | Low |
| | `DevAppChecklistView.vue` | `Dev/AppChecklist.cshtml` | ★ Done | Med |
| | `DevAppInventoryView.vue` | `Dev/AppInventory.cshtml` | ★ Done | Low |
| **Atlas Apply** | | | | |
| | `LoginView.vue` | `Login.razor` | ☐ Not started | Med |
| | `RegisterView.vue` | `Register.razor` | ☐ Not started | Med |
| | `OAuthCallbackView.vue` | Razor Page (minimal) | ☐ Not started | Low |
| | `DashboardView.vue` | `Dashboard.razor` | ☐ Not started | **High** |
| | `JobDetailView.vue` | `JobDetail.razor` | ☐ Not started | **High** |
| | `ProfileView.vue` | `Profile.razor` | ☐ Not started | Med |
| | `ApplicationsView.vue` | `ApplicationList.razor` | ☐ Not started | Med |
| | `ExtensionView.vue` | `Extension.razor` | ☐ Not started | Low |
| | `AdminDashboardView.vue` | `AdminDashboard.razor` | ☐ Not started | **High** |
| | `AdminAnalyticsView.vue` | `AdminAnalytics.razor` | ☐ Not started | **High** |
| | `AdminSecurityView.vue` | `AdminSecurity.razor` | ☐ Not started | Med |
| **Atlas Forge** | | | | |
| | `PlaygroundApp.vue` + 31 files | `Playground.razor` + components | ☐ Not started | **High** |

**Summary:** 10/10 main site pages done. 0/12 Apply pages done. 0/1 Forge pages done.

### API Endpoints (Python FastAPI to .NET Minimal API)

| Module | Route Count | Status | Key Challenges |
|--------|------------|--------|----------------|
| Auth (OAuth flows) | 10 | ◐ OAuth done, password auth stubbed | bcrypt compatibility, JWT parity |
| Jobs | 20+ | ☐ All stubs | Celery replacement (BackgroundService + Channels), LLM integration (7 distinct prompts), web scraping |
| Applications | 7 | ☐ All stubs | LLM integration (follow-up, interview prep, improvement) |
| Profile | 7 | ☐ All stubs | PDF text extraction (replace PyMuPDF), file upload handling |
| Billing | 3 | ☐ All stubs | Stripe.net SDK integration, webhook signature verification |
| Admin | 5 | ☐ All stubs | Aggregate analytics queries |
| Dev Portal | 12 | ☐ All stubs | Markdown file reading (partially done in Atlas.Web services) |
| Meridian | 6 | ☐ All stubs | Sync protocol design (CRDT/merge — not implemented in Python either) |
| Playground | 5 | ☐ All stubs | JSON file storage for designs |

**Summary:** ~75 total routes. ~10 partially implemented (OAuth). ~65 are empty stubs.

### State Management (Pinia to Blazor Services)

| Pinia Store | Scope | .NET Replacement | Status |
|------------|-------|-----------------|--------|
| `useAuthStore` | User session, tokens, OAuth, subscription | `AuthenticationStateProvider` + scoped service | ☐ Not started |
| `useJobsStore` | Job list, CRUD, ingest, retry, polling | Scoped service with `INotifyPropertyChanged` | ☐ Not started |
| `useApplicationsStore` | Application tracking, AI features | Scoped service | ☐ Not started |
| Axios client (`api/client.js`) | HTTP interceptors, token injection | `HttpClient` + `DelegatingHandler` (or direct DB access from Blazor Server) | ☐ Not started |

### Infrastructure/Middleware

| Python Component | .NET Equivalent | Status |
|-----------------|----------------|--------|
| Celery + Redis (job queue) | `BackgroundService` + `System.Threading.Channels` | ☐ Not started |
| LLM client (OpenAI calls) | OpenAI .NET SDK | ☐ Not started |
| `AnalyticsMiddleware` | Custom ASP.NET middleware | ☐ Not started |
| `passlib` bcrypt | BCrypt.Net-Next | ☐ Not started |
| Alembic migrations | EF Core migrations (baseline) | ☐ Not started |
| `httpx.AsyncClient` | `IHttpClientFactory` | ☐ Not started |
| `python-markdown` | Markdig | ★ Done (in Atlas.Web) |
| PyMuPDF (PDF extraction) | PdfPig or similar | ☐ Not started |
| Resume template rendering | Razor views or Scriban | ☐ Not started |
| Stripe (raw HTTP) | Stripe.net NuGet | ☐ Not started |
| In-memory OAuth state | `IDistributedCache` (Redis) | ◐ Done, uncommitted |

---

## 5. Server State

### Current Production Server (`167.71.179.90`)

```
DigitalOcean Droplet (Ubuntu)
├── Nginx (:80/:443)
│   ├── atlasuniversalis.com       → Static files (Vue dist/)
│   ├── apply.atlasuniversalis.com → Static files + proxy to :8000
│   ├── forge.atlasuniversalis.com → Static files (Astro dist/)
│   └── electracast.*              → Static files (React dist/)
├── Python FastAPI + Uvicorn       → :8000
├── Celery worker                  → Redis broker
├── PostgreSQL                     → :5432
└── Redis                          → :6379
```

### What's Prepared (Not Yet Deployed)

These files exist in the repo but have NOT been installed on the server:

- `deploy/systemd/atlas-web.service` — Kestrel on :5000
- `deploy/systemd/atlas-apply.service` — Kestrel on :5010
- `deploy/systemd/atlas-forge.service` — Kestrel on :5020
- `deploy/nginx/atlas-upstreams.conf` — Blue/green upstream definitions
- `deploy/nginx/atlas-route-map.conf` — Route switching variables
- `deploy/deploy-dotnet.sh` — Deploy script with backup/rollback
- `deploy/RUNBOOK.md` — Server setup instructions
- `.github/workflows/deploy-dotnet.yml` — CI/CD pipeline

### What Still Needs to Happen on the Server

1. Install .NET 10 SDK
2. Create `/opt/atlas/{web,apply,forge}/` directories
3. Install systemd service units
4. Update Nginx configs for blue/green upstream switching
5. Configure environment variables (JWT secret, OAuth keys, DB connection, etc.)
6. Run EF Core baseline migration (mark existing schema as applied)
7. Deploy first .NET build
8. Smoke test health endpoints
9. Cut over routes one subdomain at a time via Nginx

---

## 6. Current Focus

### Active Task: Phase 3 — Atlas Apply Migration

This is the largest and most complex phase. It involves porting the Vue 3 SPA at `apply.atlasuniversalis.com` to Blazor Server, along with all the backing API logic.

**Before we can build Apply pages, we need working API endpoints.** The current stubs all return `Results.Ok()` with no logic. The implementation order is:

1. **Auth endpoints** (register, login, password reset) — so users can log in
2. **Profile endpoints** — so users can manage their profile
3. **Jobs endpoints** — the core feature (ingest, scrape, extract, generate)
4. **Application endpoints** — tracking and AI-powered follow-ups
5. **Billing endpoints** — Stripe checkout and subscription management
6. **Admin endpoints** — analytics and security dashboards

Each endpoint group is paired with its Blazor page counterpart.

---

## 7. Step-by-Step Implementation Guide

### Phase 3 Roadmap (Current Phase)

Each step below includes what to build, what it replaces from the Vue/Python stack, and how to verify it works.

---

#### Step 3.1: Auth Foundation

**Goal:** Users can register, log in, and authenticate via JWT.

| Task | What it replaces | Files to create/modify |
|------|-----------------|----------------------|
| Implement `POST /api/v2/auth/register` | `atlasops/api/v1/auth.py:register` | `AuthEndpoints.cs` |
| Implement `POST /api/v2/auth/login` | `atlasops/api/v1/auth.py:login` | `AuthEndpoints.cs` |
| Implement `GET /api/v2/auth/me` | `atlasops/api/v1/auth.py:get_current_user` | `AuthEndpoints.cs` |
| Implement `POST /api/v2/auth/logout` | Client-side only | `AuthEndpoints.cs` |
| Implement password reset flow | `atlasops/api/v1/auth.py:request_password_reset` | `AuthEndpoints.cs` |
| Add BCrypt.Net-Next for password hashing | `passlib` bcrypt | `Atlas.Infrastructure.csproj` |
| Wire up `AtlasDbContext` in Atlas.Apply `Program.cs` | — | `Program.cs` |

**Verify:** Can register a user, log in, receive JWT, and call `/me` with that token.

---

#### Step 3.2: Login + Register Pages

**Goal:** Blazor UI for authentication.

| Task | What it replaces | Files to create |
|------|-----------------|----------------|
| Build `Login.razor` | `LoginView.vue` | `Components/Pages/Login.razor` |
| Build `Register.razor` | `RegisterView.vue` | `Components/Pages/Register.razor` |
| Build `OAuthCallback.razor` (or Razor Page) | `OAuthCallbackView.vue` | `Pages/OAuthCallback.cshtml` |
| Create `AuthStateProvider` | Pinia `useAuthStore` | `Services/AtlasAuthStateProvider.cs` |
| Create `MainLayout.razor` with nav | `App.vue` shell | `Components/Layout/MainLayout.razor` |

**Verify:** Can log in with email/password and OAuth. Session persists across page navigations.

---

#### Step 3.3: Profile Endpoints + Page

**Goal:** Users can view and edit their profile.

| Task | What it replaces |
|------|-----------------|
| Implement `GET /api/v2/profile` | `atlasops/api/v1/profile.py:get_profile` |
| Implement `PATCH /api/v2/profile` | `atlasops/api/v1/profile.py:update_profile` |
| Implement `POST /api/v2/profile/upload-resume` | `atlasops/api/v1/profile.py:upload_resume` |
| Implement `POST /api/v2/profile/upload-picture` | `atlasops/api/v1/profile.py:upload_picture` |
| Implement `GET /api/v2/profile/completeness` | `atlasops/api/v1/profile.py:get_completeness` |
| Add PDF text extraction (PdfPig) | PyMuPDF / PyPDF2 |
| Build `Profile.razor` | `ProfileView.vue` |

**Verify:** Can view profile, update fields, upload resume (PDF parsed), upload avatar, see completeness score.

---

#### Step 3.4: Background Job System

**Goal:** Replace Celery with in-process job processing.

| Task | What it replaces |
|------|-----------------|
| Create `JobChannel` (bounded Channel) | Celery broker |
| Create `JobScrapingWorker` (BackgroundService) | `scrape_job_posting` Celery task |
| Create `HtmlExtractionWorker` | `extract_job_from_html` Celery task |
| Integrate web scraping (HttpClient) | `atlasops/services/scraper.py` |
| Create `ILlmClient` implementation | `atlasops/services/llm_client.py` |

**Verify:** Can enqueue a URL, worker picks it up, scrapes content, extracts fields via LLM, stores in DB.

---

#### Step 3.5: Jobs Endpoints + Dashboard Page

**Goal:** Core job management workflow.

| Task | What it replaces |
|------|-----------------|
| Implement `POST /api/v2/jobs/ingest` | `atlasops/api/v1/jobs.py:ingest_job` |
| Implement `GET /api/v2/jobs` | `atlasops/api/v1/jobs.py:list_jobs` |
| Implement `GET /api/v2/jobs/{id}` | `atlasops/api/v1/jobs.py:get_job` |
| Implement `DELETE /api/v2/jobs/{id}` | `atlasops/api/v1/jobs.py:delete_job` |
| Implement `PATCH /api/v2/jobs/{id}` | `atlasops/api/v1/jobs.py:update_job` |
| Implement `POST /api/v2/jobs/{id}/extract-requirements` | LLM-powered extraction |
| Implement `POST /api/v2/jobs/{id}/retry` | Re-queue failed jobs |
| Implement `POST /api/v2/jobs/{id}/resumes` | LLM resume generation + HTML templates |
| Implement `POST /api/v2/jobs/{id}/cover-letters` | LLM cover letter generation |
| Implement `POST /api/v2/jobs/{id}/deep-dive` | LLM company research |
| Build `Dashboard.razor` | `DashboardView.vue` |
| Build `JobDetail.razor` | `JobDetailView.vue` |
| Build `JobTable.razor` component | `JobTable.vue` |
| Build `IngestModal.razor` component | `IngestModal.vue` |
| Build `GenerateSection.razor` component | `GenerateSection.vue` |
| Build `StatusBadge.razor` component | `StatusBadge.vue` |

**Verify:** Full job lifecycle: ingest URL, see processing status, view extracted data, generate resume, generate cover letter, export PDF.

---

#### Step 3.6: Applications Endpoints + Page

**Goal:** Application tracking with AI features.

| Task | What it replaces |
|------|-----------------|
| Implement all 7 Application endpoints | `atlasops/api/v1/applications.py` |
| Implement LLM follow-up message generation | `atlasops/services/llm_client.py` |
| Implement LLM interview prep generation | `atlasops/services/llm_client.py` |
| Implement LLM improvement suggestions | `atlasops/services/llm_client.py` |
| Build `ApplicationList.razor` | `ApplicationsView.vue` |

**Verify:** Can create application, update status, generate follow-up messages, get interview prep.

---

#### Step 3.7: Billing Endpoints

**Goal:** Stripe integration for premium features.

| Task | What it replaces |
|------|-----------------|
| Implement `POST /api/v2/billing/checkout` | `atlasops/api/v1/billing.py` |
| Implement `POST /api/v2/billing/webhook` | Stripe webhook handler |
| Implement `GET /api/v2/billing/status` | Subscription status check |
| Create `EntitlementService` | `atlasops/services/entitlements.py` |

**Verify:** Can initiate checkout, Stripe webhook updates subscription, premium features gated correctly.

---

#### Step 3.8: Admin Endpoints + Pages

**Goal:** Admin dashboard with analytics.

| Task | What it replaces |
|------|-----------------|
| Implement all 5 Admin endpoints | `atlasops/api/v1/admin.py` |
| Create `AnalyticsMiddleware` | `atlasops/middleware/analytics.py` |
| Build `AdminDashboard.razor` | `AdminDashboardView.vue` |
| Build `AdminAnalytics.razor` | `AdminAnalyticsView.vue` |
| Build `AdminSecurity.razor` | `AdminSecurityView.vue` |

**Verify:** Admin stats match Python output. Visit analytics recording. Security events visible and resolvable.

---

#### Step 3.9: Extension Page + Browser Extension Compat

**Goal:** Static page + API backward compatibility.

| Task | What it replaces |
|------|-----------------|
| Build `Extension.razor` | `ExtensionView.vue` |
| Verify `/api/v2/jobs/ingest-html` works with extension | Browser extension compatibility |

**Verify:** Extension page renders. Browser extension can send HTML to new API.

---

#### Step 3.10: Integration Testing + Cutover Prep

**Goal:** Validate Apply works end-to-end before switching traffic.

| Task |
|------|
| Write integration tests (WebApplicationFactory + Testcontainers) |
| Full user journey test: register → login → ingest job → generate resume → track application → admin |
| JWT cross-validation: Python-issued token accepted by .NET and vice versa |
| EF Core baseline migration applied to staging DB |
| Nginx upstream switch tested (apply.* → :5010) |
| Rollback tested (apply.* → legacy) |

---

### Future Phases (After Apply)

| Phase | Scope | Estimated Duration |
|-------|-------|-------------------|
| **Phase 4: Forge** | Port Astro+Vue+React playground to Blazor. Multi-framework preview may require JS interop. | 2 weeks |
| **Phase 5: Meridian Player** | SkiaSharp.Views.Blazor canvas renderer. Pan/zoom, node rendering, edit mode. | 2 weeks |
| **Phase 6: API Cutover** | Redirect `/api/v1/*` to `/api/v2/*`. 7-day soak period. Decommission Python. | 1 week + 7 days |
| **Phase 7: Decommission** | Delete `frontend-main/`, `frontend/`, `atlasforge/`, `atlasops/`, `alembic/`, Python deps. Tag `legacy/pre-dotnet`. | 1 week |

---

## 8. Key Architecture Decisions

| Decision | Choice | Why |
|----------|--------|-----|
| .NET version | **net10.0** | Matches existing Meridian projects; LTS candidate |
| Blazor model | **Blazor Server** | Single droplet — no WASM download cost, server-side SkiaSharp, lower bandwidth |
| Main site rendering | **Razor Pages SSR** | SEO for portfolio; Blazor islands only where interactive (Meridian) |
| ORM | **EF Core 10 + Npgsql** | Strong typing, migrations, LINQ |
| Background jobs | **BackgroundService + Channels** | In-process, zero external deps, sufficient for <100 jobs/day |
| Auth | **Custom JWT + JwtBearer middleware** | Preserves existing token format for zero-downtime migration |
| CSS | **CSS custom properties + Blazor scoped CSS** | Native to Blazor, no build tools |
| State management | **Cascading parameters + scoped DI services** | Blazor Server circuits are per-user; DI scoped services act as stores |
| Testing | **xUnit + FluentAssertions + Moq + Testcontainers** | Community standard + real PostgreSQL in tests |

---

## 9. Risk Items to Watch

| Risk | Impact | Mitigation |
|------|--------|-----------|
| EF Core baseline migration causes data loss | High | Dry-run on DB clone first. Mark baseline as already-applied. |
| JWT incompatibility during dual-stack | High | Shared secret key. Disable issuer/audience validation initially. |
| SkiaSharp perf insufficient for Meridian | High | Prototype early. Fallback: JS canvas renderer. |
| Blazor Server memory pressure | Medium | Low traffic. Circuit limits + idle disconnection. |
| bcrypt hash incompatibility | High | Both use `$2b$` prefix. Validate with cross-platform test. |
| Browser extension breaks with new API | Medium | Keep `/api/v1/*` alive until extension is updated. |

---

## 10. File Reference

| Document | Path | Contents |
|----------|------|----------|
| Architecture spec | `docs/architecture/Hybrid_Architecture_Spec.md` | Solution structure, service boundaries, tech decisions |
| Migration sequence | `docs/architecture/Migration_Sequence.md` | Route-by-route cutover plan per phase |
| Parity matrix | `docs/architecture/Parity_Matrix.md` | Every route, component, API endpoint mapped old→new |
| Delivery plan | `docs/architecture/Delivery_Cutover_Plan.md` | Task backlog with estimates and dependencies |
| **This document** | `docs/architecture/Migration_Overview.md` | Current state, what's done, what's next, step-by-step guide |
| Master log | `docs/master_log/Master_Log.md` | Chronological change log |
| Server runbook | `deploy/RUNBOOK.md` | Server setup and operations |
