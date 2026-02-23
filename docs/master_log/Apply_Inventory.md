# Atlas Apply / AtlasOps -- Codebase Inventory

**Generated:** 2026-02-18
**Backend Codebase:** `d:\www\atlasuniversalis\atlasops`
**Frontend Codebase:** `d:\www\atlasuniversalis\frontend`
**Framework:** FastAPI + SQLAlchemy (async) + Celery | Vue 3 + Vite + Pinia + Tailwind
**Architecture:** REST API backend with async PostgreSQL, AI-powered resume/job tools, Celery worker queue; SPA frontend with auth, dashboard, admin

## Repository Metrics

| Metric | Value |
|--------|-------|
| Backend Python files | 45 |
| Backend Python LOC | ~6,200 |
| Frontend Vue/JS files | 23 |
| Frontend LOC | ~4,900 |
| API route modules | 11 (auth, jobs, profile, applications, electracast, billing, admin, dev, playground, meridian, electracast_public) |

## Architecture Overview

**Backend (atlasops/):** FastAPI app with SQLAlchemy async ORM, PostgreSQL, Redis+Celery task queue. Modules: auth (JWT + OAuth), jobs (ingest + AI extraction), profile (resume management), applications (tracking), billing (Stripe), electracast (podcast management via Megaphone API), admin (analytics + security), dev (documentation API), playground (component experiments), meridian (document sync).

**Frontend (frontend/):** Vue 3 SPA with Pinia stores, vue-router with auth guards, Tailwind CSS. Views: Login, Register, Dashboard, JobDetail, Profile, Applications, Admin (dashboard, analytics, security), Extension, OAuthCallback.

---

## Backend File Inventory

### Root Configuration

#### `__init__.py`
Package init. Defines `__version__ = "0.4.0"`. 2 lines.

#### `config.py`
| Path | Lines | Description |
|------|-------|-------------|
| `config.py` | 73 | Pydantic-settings configuration. |

Types: `Settings` (BaseSettings)

Fields: database_url, redis_url, secret_key, algorithm, access/refresh token expiry, allowed_origins, openai_api_key/model, linkedin/google OAuth, stripe keys, megaphone API config, electracast intake webhook, debug, environment, frontend_url, dev_token

Functions: `get_settings()` (cached)

#### `db.py`
| Path | Lines | Description |
|------|-------|-------------|
| `db.py` | 30 | Async SQLAlchemy engine, session maker, Base class. |

Types: `Base` (DeclarativeBase)

Functions: `get_db()` (async generator yielding AsyncSession)

---

### API Routes (api/v1/)

#### `router.py`
Aggregate router mounting all 11 sub-routers under `/api/v1`. 29 lines.

#### `auth.py`
| Path | Lines | Description |
|------|-------|-------------|
| `api/v1/auth.py` | 562 | Auth endpoints: register, login, refresh, logout, password reset, LinkedIn OAuth, Google OAuth. JWT token management. |

Endpoints: POST /register, POST /login, POST /refresh, POST /logout, POST /password-reset/request, POST /password-reset/confirm, GET /linkedin/authorize, GET /linkedin/callback, GET /google/authorize, GET /google/callback

#### `jobs.py`
| Path | Lines | Description |
|------|-------|-------------|
| `api/v1/jobs.py` | 1,107 | Job posting management: ingest from URL/text, AI extraction, CRUD, resume generation, cover letter generation, deep dive analysis. |

Endpoints: POST /ingest, GET /, GET /{id}, DELETE /{id}, POST /{id}/generate-resume, POST /{id}/generate-cover-letter, GET /{id}/resumes, GET /{id}/deep-dive, POST /{id}/deep-dive

#### `profile.py`
| Path | Lines | Description |
|------|-------|-------------|
| `api/v1/profile.py` | 377 | User profile management: get/update profile, upload/parse/manage resumes, get subscription status. |

Endpoints: GET /me, PATCH /me, POST /resume/upload, GET /resumes, DELETE /resumes/{id}, POST /resumes/{id}/parse

#### `applications.py`
| Path | Lines | Description |
|------|-------|-------------|
| `api/v1/applications.py` | 293 | Application tracking: create, list, update status, add events, delete. |

Endpoints: POST /, GET /, GET /{id}, PATCH /{id}, POST /{id}/events, DELETE /{id}

#### `electracast.py`
| Path | Lines | Description |
|------|-------|-------------|
| `api/v1/electracast.py` | 265 | ElectraCast authenticated endpoints: account management, profile CRUD, podcast CRUD with Megaphone sync. |

Endpoints: GET /account, PATCH /profile, GET /podcasts, POST /podcasts, DELETE /podcasts/{id}

#### `electracast_public.py`
| Path | Lines | Description |
|------|-------|-------------|
| `api/v1/electracast_public.py` | 134 | Public ElectraCast endpoints: contact/intake form submission via webhook. |

Endpoints: POST /intake, GET /catalog/networks, GET /catalog/podcasts

#### `billing.py`
| Path | Lines | Description |
|------|-------|-------------|
| `api/v1/billing.py` | 136 | Stripe billing: create checkout session, webhook handler, subscription status. |

Endpoints: POST /create-checkout-session, POST /webhook, GET /status

#### `admin.py`
| Path | Lines | Description |
|------|-------|-------------|
| `api/v1/admin.py` | 340 | Admin endpoints: user management, analytics dashboard, security events, system stats. |

Endpoints: GET /users, GET /users/{id}, PATCH /users/{id}, DELETE /users/{id}, GET /stats, GET /analytics, GET /security-events

#### `dev.py`
| Path | Lines | Description |
|------|-------|-------------|
| `api/v1/dev.py` | 296 | Developer portal API: master log, app logs, overview sections, checklist, status. Token-authenticated. |

Endpoints: GET/POST /dev/log, GET/POST /dev/apps/{id}/log, GET/PUT /dev/overview, GET/PUT /dev/apps/{id}/overview, GET/PUT /dev/apps/{id}/checklist, GET/PUT /dev/status

#### `playground.py`
| Path | Lines | Description |
|------|-------|-------------|
| `api/v1/playground.py` | 161 | Playground API: save/load/list/delete designs, generate code from designs. |

#### `meridian.py`
| Path | Lines | Description |
|------|-------|-------------|
| `api/v1/meridian.py` | 75 | Meridian document sync: status, push, pull endpoints. |

#### `deps.py`
| Path | Lines | Description |
|------|-------|-------------|
| `api/deps.py` | 68 | Dependency injection: get_current_user, get_current_admin, require_dev_token. |

---

### Models (models/)

| File | Lines | Types | Description |
|------|-------|-------|-------------|
| `user.py` | 171 | User, UserProfile | User account with auth fields, profile with resume/preferences |
| `job.py` | 100 | JobPosting, CompanyDeepDive | Job listing with parsed fields, company analysis |
| `application.py` | 85 | Application, ApplicationEvent | Job application tracking with status events |
| `resume.py` | 60 | GeneratedResume | AI-generated resume storage |
| `electracast.py` | 99 | ElectraCastProfile, ElectraCastPodcast | Podcast creator profile and podcast entries |
| `analytics.py` | 77 | SiteVisit, ApiUsage, SecurityEvent | Analytics and security audit models |
| `__init__.py` | 21 | -- | Re-exports all models |

---

### Schemas (schemas/)

| File | Lines | Types | Description |
|------|-------|-------|-------------|
| `user.py` | 112 | UserCreate, UserResponse, UserProfileResponse, UserProfileUpdate, TokenResponse, PasswordReset* | Auth and profile schemas |
| `job.py` | 73 | JobIngestRequest, JobIngestResponse, JobPostingResponse | Job ingest and response |
| `application.py` | 36 | ApplicationCreate, ApplicationResponse, ApplicationUpdate | Application CRUD schemas |
| `resume.py` | 27 | ResumeGenerateRequest, ResumeResponse | Resume generation schemas |
| `electracast.py` | 85 | ElectraCastAccountResponse, ElectraCastProfileResponse/Update, ElectraCastPodcastCreate/Response | ElectraCast schemas |
| `meridian.py` | 45 | MeridianDocumentPayload, MeridianProject*, MeridianSync*, MeridianStatusResponse | Meridian sync schemas |
| `__init__.py` | 75 | -- | Re-exports all schemas |

---

### Services (services/)

| File | Lines | Description |
|------|-------|-------------|
| `llm_client.py` | 119 | OpenAI API wrapper: async chat completion, structured extraction. |
| `resume_generator.py` | 778 | AI resume/cover letter generation: prompt assembly, template rendering, multi-section output. |
| `resume_parser.py` | 151 | Resume text extraction from uploaded files (PDF, DOCX, TXT). |
| `scraper.py` | 207 | Web scraper for job posting URLs: fetches and extracts job text. |
| `megaphone.py` | 247 | Megaphone CMS API client: podcast CRUD, user invite, feed management. |
| `entitlements.py` | 47 | Subscription entitlement checks: free vs paid limits. |

---

### Middleware (middleware/)

| File | Lines | Description |
|------|-------|-------------|
| `analytics.py` | 88 | Request logging middleware: records SiteVisit and ApiUsage per request. |

---

### Workers (workers/)

| File | Lines | Description |
|------|-------|-------------|
| `tasks.py` | 278 | Celery tasks: async job extraction, resume generation, deep dive analysis. |

---

### Utils (utils/)

| File | Lines | Description |
|------|-------|-------------|
| `sanitize.py` | 74 | Input sanitization: strip HTML, normalize whitespace. |
| `url_validator.py` | 92 | URL validation and normalization utilities. |

---

### Prompts (prompts/)

| File | Lines | Description |
|------|-------|-------------|
| `cover_letter_v1.md` | ~45 | Cover letter generation prompt template. |
| `deep_dive_v1.md` | ~40 | Company deep dive analysis prompt. |
| `job_extraction_v1.md` | ~40 | Job posting field extraction prompt. |
| `resume_generator_v1.md` | ~160 | Resume generation system prompt. |
| `resume_optimizer_v1.md` | ~40 | Resume optimization prompt. |
| `resume_parser_v1.md` | ~85 | Resume text parsing prompt. |

---

## Frontend File Inventory

### Configuration

| File | Lines | Description |
|------|-------|-------------|
| `package.json` | ~20 | Vue 3, Pinia, vue-router, Tailwind, axios deps. |
| `vite.config.js` | ~12 | Vite config with API proxy to backend. |
| `tailwind.config.js` | ~30 | Tailwind with custom dark theme. |
| `postcss.config.js` | ~3 | Tailwind/autoprefixer PostCSS. |
| `index.html` | ~20 | SPA entry HTML. |

### App Entry

| File | Lines | Description |
|------|-------|-------------|
| `src/main.js` | 9 | Creates Vue app with Pinia and router. |
| `src/App.vue` | 15 | Root component with RouterView. |

### Router

| File | Lines | Description |
|------|-------|-------------|
| `src/router/index.js` | 96 | Vue Router with 12 routes. Auth guards (requiresAuth, requiresAdmin, guest). |

Routes: / (redirect), /login, /register, /dashboard, /jobs/:id, /profile, /applications, /oauth/callback, /admin, /admin/analytics, /admin/security, /extension

### API Client

| File | Lines | Description |
|------|-------|-------------|
| `src/api/client.js` | 49 | Axios instance with JWT interceptor, token refresh logic. |

### Stores (Pinia)

| File | Lines | Description |
|------|-------|-------------|
| `src/stores/auth.js` | 142 | Auth store: login, register, logout, fetchUser, token management. |
| `src/stores/jobs.js` | 113 | Jobs store: fetchJobs, ingestJob, deleteJob. |
| `src/stores/applications.js` | 131 | Applications store: CRUD operations, status updates. |

### Views

| File | Lines | Description |
|------|-------|-------------|
| `src/views/LoginView.vue` | 119 | Login form with OAuth buttons. |
| `src/views/RegisterView.vue` | 144 | Registration form. |
| `src/views/DashboardView.vue` | 194 | Main dashboard: job list, ingest modal, quick stats. |
| `src/views/JobDetailView.vue` | 1,600 | Job detail: parsed fields, resume generator, cover letter, deep dive, application tracking. |
| `src/views/ProfileView.vue` | 699 | Profile management: personal info, resume upload/parse, subscription/billing. |
| `src/views/ApplicationsView.vue` | 192 | Application tracker: list, status filters, event timeline. |
| `src/views/ExtensionView.vue` | 186 | Browser extension info and download page. |
| `src/views/OAuthCallbackView.vue` | 87 | OAuth redirect handler. |
| `src/views/AdminDashboardView.vue` | 172 | Admin dashboard: user stats, system health. |
| `src/views/AdminAnalyticsView.vue` | 232 | Admin analytics: site visits, API usage charts. |
| `src/views/AdminSecurityView.vue` | 195 | Admin security: security events, user audit. |

### Components

| File | Lines | Description |
|------|-------|-------------|
| `src/components/GenerateSection.vue` | 342 | Resume/cover letter generation UI with template selection and preview. |
| `src/components/IngestModal.vue` | 211 | Job URL/text ingest modal with parsing feedback. |
| `src/components/JobTable.vue` | 142 | Sortable job listing table component. |
| `src/components/StatusBadge.vue` | 29 | Color-coded status badge component. |

### Assets

| File | Lines | Description |
|------|-------|-------------|
| `src/assets/main.css` | 103 | Global styles, Tailwind directives, dark theme customization. |

## Auth Endpoints
| Endpoint | Method | Path | Status |
|----------|--------|------|--------|
| Register | POST | /api/v2/auth/register | Implemented |
| Login | POST | /api/v2/auth/login | Implemented |
| Get Current User | GET | /api/v2/auth/me | Implemented |
| Logout | POST | /api/v2/auth/logout | Implemented |
| Request Password Reset | POST | /api/v2/auth/password-reset/request | Implemented |
| Confirm Password Reset | POST | /api/v2/auth/password-reset/confirm | Implemented |
| LinkedIn Authorize | GET | /api/v2/auth/linkedin/authorize | Implemented |
| LinkedIn Callback | GET | /api/v2/auth/linkedin/callback | Implemented |
| Google Authorize | GET | /api/v2/auth/google/authorize | Implemented |
| Google Callback | GET | /api/v2/auth/google/callback | Implemented |

## Routing Configuration
| Path Pattern | Backend | Port | Notes |
|---|---|---|---|
| /api/v2/* | .NET Kestrel (Atlas.Apply) | 5010 | Phase 3 cutover - live |
| /api/* | Python/FastAPI (uvicorn) | 8000 | Legacy v1 - still active |
| /healthz | .NET Kestrel | 5010 | Direct routing |
| /health | Python/FastAPI | 8000 | Legacy health check |
| / | Vue SPA (static files) | - | try_files fallback |

## Phase 3 Migration Deltas (2026-02-22)
### `src/Atlas.Apply` — Blazor Route Migration Surface

| Attribute | Value |
|-----------|-------|
| Type | `.razor` / `.cs` |
| Scope | login, register, oauth callback, dashboard, job detail, profile, applications, extension, admin |

Blazor route migration completed for the primary Atlas Apply user and admin route set.

### `src/Atlas.Apply` — Auth + State Layer

| Attribute | Value |
|-----------|-------|
| Type | services/state/auth provider |
| Scope | auth state provider, route gating updates, auth/admin/profile/applications/jobs state services |

Auth state and route gating behavior updated to align with Blazor route ownership.

### `deploy/nginx/atlas-route-map.conf`

| Attribute | Value |
|-----------|-------|
| Type | `.conf` |
| Scope | `map $request_uri $apply_frontend_backend` |
| Change | `default` switched to `atlas_dotnet_apply` |

Traffic selection for Apply frontend now defaults to the .NET Apply upstream in this migration batch.

### `docs/architecture` — Phase 3 Governance Artifacts

- `Identity_Migration_Decision.md`
- `Phase3_Readiness_Report_2026-02-22.md`
- `Phase3_Promotion_Gates_2026-02-22.md`

Decision/readiness/promotion documentation recorded as part of migration promotion controls.
