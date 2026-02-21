# Atlas Universalis — Migration Sequence

> **Version:** 1.0.0
> **Date:** 2026-02-21
> **Scope:** Ordered route-by-route cutover plan from Python/Vue/Astro to .NET

---

## Overview

This document defines the ordered sequence for cutting over routes from the existing Python+Vue+Astro stack to the new .NET (Razor Pages / Blazor Server / Minimal API) stack. Each route group is migrated per-subdomain, per-phase. Nginx upstream configs are swapped to point at the new Kestrel processes once a group passes validation.

**Rollback strategy:** Each phase can be independently rolled back by reverting the Nginx upstream change. The Python stack remains running (on different ports) until full decommission in Phase 7.

---

## Phase 0: Foundation (No Route Changes)

**Goal:** Solution skeleton, domain models, EF Core baseline, endpoint stubs compile.

| Item | Status |
|------|--------|
| `Atlas.Core` entities + enums + interfaces | Created |
| `Atlas.Contracts` DTOs + configuration POCOs | Created |
| `Atlas.Infrastructure` DbContext + entity configurations | Created |
| `Atlas.Api` endpoint stubs (all return 200 OK) | Created |
| EF Core baseline migration (snapshot existing schema) | Pending |
| Dual-stack DB validation (EF Core reads match SQLAlchemy) | Pending |

**No Nginx changes. No traffic cutover.**

---

## Phase 1: API Coexistence

**Goal:** .NET API runs alongside Python API. Both read/write the same PostgreSQL database.

| Order | Route | Verb | Subdomain | Notes |
|-------|-------|------|-----------|-------|
| 1.1 | `/api/v2/auth/register` | POST | apply.* | First endpoint with real logic; validates token compat |
| 1.2 | `/api/v2/auth/login` | POST | apply.* | JWT issued by .NET, validated by Python (shared secret) |
| 1.3 | `/api/v2/auth/me` | GET | apply.* | Validates .NET JWT middleware against existing tokens |
| 1.4 | `/api/v2/auth/logout` | POST | apply.* | No-op server-side |
| 1.5 | `/api/v2/auth/password-reset/*` | POST | apply.* | Password reset flow |
| 1.6 | `/api/v2/auth/linkedin/*` | GET | apply.* | OAuth flow (add v2 callback URLs to LinkedIn app) |
| 1.7 | `/api/v2/auth/google/*` | GET | apply.* | OAuth flow (add v2 callback URLs to Google app) |
| 1.8 | `/api/v2/jobs/*` | ALL | apply.* | Full jobs module |
| 1.9 | `/api/v2/applications/*` | ALL | apply.* | Application tracking |
| 1.10 | `/api/v2/profile/*` | ALL | apply.* | Profile management |
| 1.11 | `/api/v2/billing/*` | ALL | apply.* | Stripe integration |
| 1.12 | `/api/v2/admin/*` | ALL | apply.* | Admin endpoints |
| 1.13 | `/api/v2/dev/*` | ALL | main site | Dev portal API |
| 1.14 | `/api/v2/meridian/*` | ALL | apply.* | Meridian sync (placeholder) |
| 1.15 | `/api/v2/playground/*` | ALL | forge.* | Playground designs |

**Nginx adds `/api/v2/*` upstream pointing to Kestrel. `/api/v1/*` unchanged.**

---

## Phase 2: Main Site Routes (atlasuniversalis.com)

**Goal:** Replace Vue SPA with Razor Pages. Portfolio pages are static SSR — lowest risk.

| Order | Route | Current | Target | Complexity |
|-------|-------|---------|--------|------------|
| 2.1 | `/` | HomeView.vue | Razor Page `Index.cshtml` | Low |
| 2.2 | `/meridian` | MeridianView.vue | Razor Page `Meridian.cshtml` | Low |
| 2.3 | `/dev` | DevLoginView.vue | Razor Page `Dev/Login.cshtml` | Low |
| 2.4 | `/dev/dashboard` | DevDashboardView.vue | Razor Page `Dev/Dashboard.cshtml` | Med |
| 2.5 | `/dev/log` | DevLogView.vue | Razor Page `Dev/Log.cshtml` | Low |
| 2.6 | `/dev/overview` | DevOverviewView.vue | Razor Page `Dev/Overview.cshtml` | Low |
| 2.7 | `/dev/apps/{appId}/log` | DevAppLogView.vue | Razor Page `Dev/AppLog.cshtml` | Low |
| 2.8 | `/dev/apps/{appId}/overview` | DevAppOverviewView.vue | Razor Page `Dev/AppOverview.cshtml` | Low |
| 2.9 | `/dev/apps/{appId}/checklist` | DevAppChecklistView.vue | Razor Page `Dev/AppChecklist.cshtml` | Med |
| 2.10 | `/dev/apps/{appId}/inventory` | DevAppInventoryView.vue | Razor Page `Dev/AppInventory.cshtml` | Low |

**Nginx cutover:** `atlasuniversalis.com` upstream changes from static files to Kestrel `:5000`.

**Validation:** All 10 routes render correctly. Dev portal login works. Markdown content displays.

---

## Phase 3: Apply Routes (apply.atlasuniversalis.com)

**Goal:** Replace Vue SPA with Blazor Server interactive app. Highest complexity phase.

| Order | Route | Current | Target | Complexity |
|-------|-------|---------|--------|------------|
| 3.1 | `/` | Redirect to /login | Server-side redirect | Low |
| 3.2 | `/login` | LoginView.vue | Blazor `Login.razor` | Med |
| 3.3 | `/register` | RegisterView.vue | Blazor `Register.razor` | Med |
| 3.4 | `/oauth/callback` | OAuthCallbackView.vue | Razor Page (minimal) | Low |
| 3.5 | `/dashboard` | DashboardView.vue | Blazor `Dashboard.razor` | High |
| 3.6 | `/jobs/{id}` | JobDetailView.vue | Blazor `JobDetail.razor` | High |
| 3.7 | `/profile` | ProfileView.vue | Blazor `Profile.razor` | Med |
| 3.8 | `/applications` | ApplicationsView.vue | Blazor `ApplicationList.razor` | Med |
| 3.9 | `/extension` | ExtensionView.vue | Razor Page `Extension.razor` | Low |
| 3.10 | `/admin` | AdminDashboardView.vue | Blazor `AdminDashboard.razor` | High |
| 3.11 | `/admin/analytics` | AdminAnalyticsView.vue | Blazor `AdminAnalytics.razor` | High |
| 3.12 | `/admin/security` | AdminSecurityView.vue | Blazor `AdminSecurity.razor` | Med |

**Nginx cutover:** `apply.atlasuniversalis.com` upstream changes from Vue static + FastAPI to Kestrel `:5010`.

**Validation:** Full user journey test — register, login, ingest job, generate resume, track application, admin dashboard.

**Dependencies:** Phase 1 API must be complete. Background job system (Channels + BackgroundService) must replace Celery.

---

## Phase 4: Forge Routes (forge.atlasuniversalis.com)

**Goal:** Replace Astro+Vue+React playground with Blazor Server.

| Order | Route | Current | Target | Complexity |
|-------|-------|---------|--------|------------|
| 4.1 | `/` | index.astro → PlaygroundApp.vue | Blazor `Playground.razor` | High |

**Nginx cutover:** `forge.atlasuniversalis.com` upstream changes from static files to Kestrel `:5020`.

**Validation:** Component browser loads. Canvas builder functional. Code export works. Design save/load via API.

**Note:** Multi-framework preview (Vue/React providers) may require JS interop or architectural simplification in the Blazor version.

---

## Phase 5: Meridian Web Player

**Goal:** SkiaSharp-based Meridian canvas renderer embedded on the main site.

| Order | Route | Change |
|-------|-------|--------|
| 5.1 | `/meridian` (main site) | Add `<MeridianCanvasComponent>` Blazor Server island |
| 5.2 | `/api/v2/meridian/sync/*` | Implement real sync logic (CRDT/merge) |

**Validation:** Canvas renders a test `.atlas` document. Pan/zoom responsive. Desktop ↔ web sync verified.

---

## Phase 6: API Cutover (v1 → v2)

**Goal:** Decommission Python FastAPI. All traffic served by .NET Minimal API.

| Order | Action |
|-------|--------|
| 6.1 | Update browser extension to call `/api/v2/*` |
| 6.2 | Add Nginx redirect: `/api/v1/*` → `/api/v2/*` (301) |
| 6.3 | Monitor for 7 days — any v1 traffic triggers alert |
| 6.4 | Remove Python FastAPI process (`systemctl disable atlasuniversalis.service`) |
| 6.5 | Remove Celery worker process (`systemctl disable celery-worker.service`) |
| 6.6 | Drop Alembic `alembic_version` table (optional cleanup) |

**Validation:** Zero v1 API traffic for 7 consecutive days. All integration tests pass against v2.

---

## Phase 7: Decommission Legacy Stack

**Goal:** Remove all Python/Vue/Astro source code and dependencies.

| Order | Action |
|-------|--------|
| 7.1 | Remove `frontend-main/` (Vue SPA for main site) |
| 7.2 | Remove `frontend/` (Vue SPA for Apply) |
| 7.3 | Remove `atlasforge/` (Astro/Vue/React for Forge) |
| 7.4 | Remove `atlasops/` (Python FastAPI backend) |
| 7.5 | Remove `alembic/` (migration history — keep as archive branch) |
| 7.6 | Remove Python dependencies (`requirements.txt`, `pyproject.toml`) |
| 7.7 | Remove Node.js build dependencies (Vue/Vite/Astro `package.json` files) |
| 7.8 | Remove Redis if no longer used for caching |
| 7.9 | Update CI/CD pipeline to .NET-only |
| 7.10 | Update documentation to reflect .NET-only architecture |

**Safety:** Create a `legacy/pre-dotnet` Git tag before any deletions.

---

## Risk Checkpoints

Each phase has a go/no-go checkpoint before proceeding:

| Phase | Checkpoint Criteria |
|-------|-------------------|
| 0 → 1 | Solution compiles. EF Core baseline migration applied. DB queries match. |
| 1 → 2 | All v2 API endpoints pass integration tests. JWT cross-validation works. |
| 2 → 3 | Main site serves all 10 routes with correct content. No SEO regression. |
| 3 → 4 | Full Apply user journey works. Resume generation produces correct output. Admin analytics match Python output. |
| 4 → 5 | Forge playground functional. Component browser and canvas builder work. |
| 5 → 6 | Meridian canvas renders. Sync protocol works between desktop and web. |
| 6 → 7 | Zero v1 traffic for 7 days. No error rate increase. |

---

## Timeline Estimates

| Phase | Estimated Duration | Cumulative |
|-------|-------------------|-----------|
| Phase 0: Foundation | 1 week | Week 1 |
| Phase 1: API Coexistence | 3-4 weeks | Week 5 |
| Phase 2: Main Site | 1 week | Week 6 |
| Phase 3: Apply Routes | 3-4 weeks | Week 10 |
| Phase 4: Forge | 2 weeks | Week 12 |
| Phase 5: Meridian Player | 2 weeks | Week 14 |
| Phase 6: API Cutover | 1 week + 7-day soak | Week 16 |
| Phase 7: Decommission | 1 week | Week 17 |

Total estimated duration: **~17 weeks** from Phase 0 start to full decommission.
