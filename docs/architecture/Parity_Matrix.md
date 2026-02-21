# Atlas Universalis — Hybrid Rebuild Parity Matrix

> Generated: 2026-02-19  
> Scope: All surfaces EXCEPT ElectraCast  
> Source of truth: `frontend-main/`, `frontend/`, `atlasforge/`, `atlasops/api/v1/`, `meridian/`, `app.py`

---

## Section 1: Route Parity Matrix

### 1a. frontend-main (atlasuniversalis.com) — 10 routes

| Surface | Current Route | Current Component | Auth | Target .NET Page Type | Migration Complexity | Notes |
|---|---|---|---|---|---|---|
| frontend-main | `/` | HomeView.vue | None | Razor Page or Blazor SSR | Low | Static portfolio landing; sections (Hero, About, Projects, Apps, Footer) are child components |
| frontend-main | `/meridian` | MeridianView.vue | None | Razor Page | Low | Marketing/info page for Meridian desktop app |
| frontend-main | `/dev` | DevLoginView.vue | None (simple admin login via API) | Razor Page + server auth | Low | Simple password form posting to `/api/v1/dev/verify` |
| frontend-main | `/dev/dashboard` | DevDashboardView.vue | Admin (checked client-side) | Razor Page (authorized) | Med | Dashboard aggregating app list, status, dev docs |
| frontend-main | `/dev/log` | DevLogView.vue | Admin | Razor Page | Low | Renders Master_Log.md from API |
| frontend-main | `/dev/overview` | DevOverviewView.vue | Admin | Razor Page | Low | Renders PROJECT_OVERVIEW.md from API |
| frontend-main | `/dev/apps/:appId/log` | DevAppLogView.vue | Admin | Razor Page with route param | Low | Per-app log markdown viewer |
| frontend-main | `/dev/apps/:appId/overview` | DevAppOverviewView.vue | Admin | Razor Page with route param | Low | Per-app overview markdown viewer |
| frontend-main | `/dev/apps/:appId/checklist` | DevAppChecklistView.vue | Admin | Razor Page with route param | Med | Checklist viewer + task creation POST |
| frontend-main | `/dev/apps/:appId/inventory` | DevAppInventoryView.vue | Admin | Razor Page with route param | Low | Per-app inventory markdown viewer |

### 1b. frontend (apply.atlasuniversalis.com) — 12 routes (including redirect)

| Surface | Current Route | Current Component | Auth | Target .NET Page Type | Migration Complexity | Notes |
|---|---|---|---|---|---|---|
| frontend | `/` | (redirect to /login) | None | Redirect rule | Low | Server-side redirect in .NET |
| frontend | `/login` | LoginView.vue | Guest-only | Blazor component or Razor Page | Med | Form + OAuth buttons (Google, LinkedIn); Pinia auth store |
| frontend | `/register` | RegisterView.vue | Guest-only | Blazor component or Razor Page | Med | Registration form; auto-login after register |
| frontend | `/dashboard` | DashboardView.vue | requiresAuth | Blazor (Interactive) | High | Job listing with ingest modal, status badges, job table; main user hub |
| frontend | `/jobs/:id` | JobDetailView.vue | requiresAuth | Blazor (Interactive) | High | Complex: job detail + resume generation + cover letter + deep dive + requirements extraction + application status |
| frontend | `/profile` | ProfileView.vue | requiresAuth | Blazor (Interactive) | Med | Profile editor + resume upload + picture upload + completeness widget |
| frontend | `/applications` | ApplicationsView.vue | requiresAuth | Blazor (Interactive) | Med | Application tracking list with status updates, follow-up message gen, interview prep gen |
| frontend | `/oauth/callback` | OAuthCallbackView.vue | Guest-only | Razor Page (minimal JS) | Low | Extracts tokens from URL fragment, stores in localStorage, redirects |
| frontend | `/admin` | AdminDashboardView.vue | requiresAuth + requiresAdmin | Blazor (Interactive) or Razor | High | Admin stats overview (users, jobs, apps, traffic, API usage, security) |
| frontend | `/admin/analytics` | AdminAnalyticsView.vue | requiresAuth + requiresAdmin | Blazor (Interactive) | High | Visit analytics, API usage analytics, charts |
| frontend | `/admin/security` | AdminSecurityView.vue | requiresAuth + requiresAdmin | Blazor (Interactive) | Med | Security events list, resolve actions, severity filtering |
| frontend | `/extension` | ExtensionView.vue | None | Razor Page | Low | Browser extension info/download page |

### 1c. atlasforge (playground.atlasuniversalis.com) — 1 page (SPA)

| Surface | Current Route | Current Component | Auth | Target .NET Page Type | Migration Complexity | Notes |
|---|---|---|---|---|---|---|
| atlasforge | `/` | index.astro → PlaygroundApp.vue | X-Dev-Token header | Blazor WASM or standalone SPA | High | Full canvas-based visual design tool; multi-framework preview (Vue + React); drag-drop, props editing, code export |

---

## Section 2: Component Parity Matrix

### 2a. frontend-main Components (18 .vue files)

| Surface | Component | Framework | Dependencies | Blazor Equivalent Strategy | Complexity | Notes |
|---|---|---|---|---|---|---|
| frontend-main | App.vue | Vue 3 | vue-router | Blazor App shell / _Layout.cshtml | Low | Minimal shell with RouterView |
| frontend-main | HomeView.vue | Vue 3 | Composition sections | Razor Page | Low | Orchestrates child sections |
| frontend-main | MeridianView.vue | Vue 3 | None | Razor Page | Low | Static info page |
| frontend-main | DevLoginView.vue | Vue 3 | fetch/axios | Razor Page + form POST | Low | Simple admin login |
| frontend-main | DevDashboardView.vue | Vue 3 | fetch | Razor Page | Med | Dashboard with API calls to `/dev/apps`, `/dev/status` |
| frontend-main | DevLogView.vue | Vue 3 | fetch, markdown rendering | Razor Page | Low | Markdown viewer |
| frontend-main | DevOverviewView.vue | Vue 3 | fetch, markdown rendering | Razor Page | Low | Markdown viewer |
| frontend-main | DevAppLogView.vue | Vue 3 | fetch, vue-router params | Razor Page | Low | Parameterized markdown viewer |
| frontend-main | DevAppOverviewView.vue | Vue 3 | fetch, vue-router params | Razor Page | Low | Parameterized markdown viewer |
| frontend-main | DevAppChecklistView.vue | Vue 3 | fetch, vue-router params | Razor Page + form POST | Med | Markdown viewer + task creation |
| frontend-main | DevAppInventoryView.vue | Vue 3 | fetch, vue-router params | Razor Page | Low | Parameterized markdown viewer |
| frontend-main | HeroSection.vue | Vue 3 | None | Razor partial / Blazor component | Low | Static hero banner |
| frontend-main | AboutSection.vue | Vue 3 | None | Razor partial | Low | Static about section |
| frontend-main | ProjectsSection.vue | Vue 3 | None | Razor partial | Low | Project cards |
| frontend-main | AppsSection.vue | Vue 3 | None | Razor partial | Low | App showcase cards |
| frontend-main | NavBar.vue | Vue 3 | vue-router | Razor partial / shared layout | Low | Navigation bar |
| frontend-main | FooterSection.vue | Vue 3 | None | Razor partial | Low | Footer |
| frontend-main | DevStatusBanner.vue | Vue 3 | fetch | Razor partial + JS or Blazor component | Low | Status banner fetching `/dev/status` |

### 2b. frontend (Atlas Apply) Components (16 .vue files)

| Surface | Component | Framework | Dependencies | Blazor Equivalent Strategy | Complexity | Notes |
|---|---|---|---|---|---|---|
| frontend | App.vue | Vue 3 | vue-router, pinia | Blazor App shell with CascadingAuthState | Med | Root shell with auth-aware routing |
| frontend | LoginView.vue | Vue 3 | Pinia auth store, axios | Blazor form + ASP.NET Identity | Med | Email/password + Google/LinkedIn OAuth buttons |
| frontend | RegisterView.vue | Vue 3 | Pinia auth store, axios | Blazor form + ASP.NET Identity | Med | Registration with auto-login |
| frontend | DashboardView.vue | Vue 3 | Pinia jobs store, IngestModal, JobTable | Blazor interactive page | High | Main dashboard: job list, ingest, status filters |
| frontend | JobDetailView.vue | Vue 3 | Pinia jobs/applications stores, axios | Blazor interactive page | High | Resume gen, cover letter, deep dive, requirements, app status |
| frontend | ProfileView.vue | Vue 3 | axios, file upload | Blazor interactive page | Med | Profile editor, resume parser, avatar upload, completeness |
| frontend | ApplicationsView.vue | Vue 3 | Pinia applications store | Blazor interactive page | Med | Application tracker with AI-generated follow-up/interview prep |
| frontend | OAuthCallbackView.vue | Vue 3 | Pinia auth store | Razor Page (minimal) | Low | Token extraction from URL hash fragment |
| frontend | AdminDashboardView.vue | Vue 3 | axios, admin API | Blazor interactive page | High | Stats dashboard with multi-category analytics |
| frontend | AdminAnalyticsView.vue | Vue 3 | axios, admin API | Blazor interactive page | High | Charts: visits by day, popular paths, API usage |
| frontend | AdminSecurityView.vue | Vue 3 | axios, admin API | Blazor interactive page | Med | Security event list with resolve action |
| frontend | ExtensionView.vue | Vue 3 | None | Razor Page | Low | Static extension info page |
| frontend | JobTable.vue | Vue 3 | None (props-driven) | Blazor component | Med | Reusable job listing table |
| frontend | IngestModal.vue | Vue 3 | Pinia jobs store | Blazor component (modal) | Med | URL input modal for job ingestion |
| frontend | StatusBadge.vue | Vue 3 | None | Blazor component | Low | Status indicator badge |
| frontend | GenerateSection.vue | Vue 3 | axios | Blazor component | Med | Resume/cover letter generation controls |

### 2c. atlasforge (Atlas Forge) Components (32 files)

| Surface | Component | Framework | Dependencies | Blazor Equivalent Strategy | Complexity | Notes |
|---|---|---|---|---|---|---|
| atlasforge | index.astro | Astro | Astro SSR | Razor Page or Blazor host | Med | Entry page loading PlaygroundApp |
| atlasforge | PlaygroundLayout.astro | Astro | Astro layouts | _Layout.cshtml | Low | HTML shell / layout wrapper |
| atlasforge | PlaygroundApp.vue | Vue 3 | All core components | Blazor WASM root component | High | Main SPA orchestrator for canvas builder |
| atlasforge | CanvasBuilder.vue | Vue 3 | Drag-drop, DOM manipulation | Blazor + JS interop | High | Drag-and-drop canvas with element positioning |
| atlasforge | CanvasElementRenderer.vue | Vue 3 | Dynamic component rendering | Blazor DynamicComponent + JS interop | High | Renders arbitrary UI framework components |
| atlasforge | CodeExporter.vue | Vue 3 | None | Blazor component | Med | Export canvas design as code |
| atlasforge | ComponentBrowser.vue | Vue 3 | Library metadata | Blazor component | Med | Searchable component catalog sidebar |
| atlasforge | IsolatedPreview.vue | Vue 3 | iframe | Blazor + JS interop | High | Isolated iframe preview of components |
| atlasforge | LibraryLoadingState.vue | Vue 3 | None | Blazor component | Low | Loading spinner/state for library loads |
| atlasforge | MockPreview.vue | Vue 3 | None | Blazor component | Low | Static mock preview fallback |
| atlasforge | PreviewPanel.vue | Vue 3 | None | Blazor component | Med | Preview panel with framework switching |
| atlasforge | PropsEditor.vue | Vue 3 | Dynamic form generation | Blazor component | Med | Dynamic property editor for selected element |
| atlasforge | SaveDesignModal.vue | Vue 3 | axios (playground API) | Blazor component (modal) | Low | Save/name design modal |
| atlasforge | TopBar.vue | Vue 3 | None | Blazor component | Low | Toolbar with actions |
| atlasforge | ChakraProviderWrapper.tsx | React | @chakra-ui/react | JS interop or drop | High | React Chakra UI provider for preview |
| atlasforge | MantineProviderWrapper.tsx | React | @mantine/core | JS interop or drop | High | React Mantine provider for preview |
| atlasforge | RadixProviderWrapper.tsx | React | @radix-ui/themes | JS interop or drop | High | React Radix provider for preview |
| atlasforge | ShadcnProviderWrapper.tsx | React | shadcn/ui | JS interop or drop | High | React Shadcn provider for preview |
| atlasforge | ReactPreview.tsx | React | React 18 | JS interop | High | React component preview renderer |
| atlasforge | ReactPreviewWrapper.tsx | React | React 18 | JS interop | High | Wrapper mounting React into Vue context |
| atlasforge | NaiveUIProvider.vue | Vue 3 | naive-ui | Blazor + JS interop or drop | Med | Vue Naive UI provider for preview |
| atlasforge | PrimeVueProvider.vue | Vue 3 | primevue | Blazor + JS interop or drop | Med | Vue PrimeVue provider for preview |
| atlasforge | VuetifyProvider.vue | Vue 3 | vuetify | Blazor + JS interop or drop | Med | Vue Vuetify provider for preview |
| atlasforge | custom-react-loader.tsx | React/TS | React, dynamic import | JS interop | High | Dynamic React component loader |
| atlasforge | CustomAlert.vue | Vue 3 | None | Blazor component | Low | Custom alert component |
| atlasforge | CustomAvatar.vue | Vue 3 | None | Blazor component | Low | Custom avatar component |
| atlasforge | CustomBadge.vue | Vue 3 | None | Blazor component | Low | Custom badge component |
| atlasforge | CustomButton.vue | Vue 3 | None | Blazor component | Low | Custom button component |
| atlasforge | CustomCard.vue | Vue 3 | None | Blazor component | Low | Custom card component |
| atlasforge | CustomInput.vue | Vue 3 | None | Blazor component | Low | Custom input component |
| atlasforge | CustomProgress.vue | Vue 3 | None | Blazor component | Low | Custom progress component |
| atlasforge | CustomTabs.vue | Vue 3 | None | Blazor component | Low | Custom tabs component |

### 2d. Meridian (Desktop — Avalonia) Components (5 C# files)

| Surface | Component | Framework | Dependencies | Blazor Equivalent Strategy | Complexity | Notes |
|---|---|---|---|---|---|---|
| meridian | App.axaml.cs | Avalonia | Avalonia.Desktop | Keep as-is (desktop) | N/A | Desktop app entry; NOT part of web migration |
| meridian | MainWindow.axaml.cs | Avalonia | Avalonia | Keep as-is (desktop) | N/A | Main window shell |
| meridian | Program.cs | .NET 8 | Avalonia | Keep as-is (desktop) | N/A | Program entry point |
| meridian | Class1.cs | .NET 8 | None | Keep as-is (shared library) | N/A | Core library placeholder |
| meridian | DocumentSerializer.cs | .NET 8 | None | Keep as-is (shared library) | Low | .atlas file serializer; reuse in web API |

---

## Section 3: API Endpoint Parity Matrix

### 3a. Auth Module (`/api/v1/auth`)

| Module | Current Endpoint Pattern | Verb | Auth | Target .NET Controller/MinimalAPI | Migration Complexity | Notes |
|---|---|---|---|---|---|---|
| auth | `/api/v1/auth/register` | POST | None | ASP.NET Identity + Controller | Med | Creates User + UserProfile + ElectraCastProfile |
| auth | `/api/v1/auth/login` | POST | None | ASP.NET Identity / JWT Bearer | Med | OAuth2PasswordRequestForm (form-encoded) → JWT pair |
| auth | `/api/v1/auth/me` | GET | Bearer JWT | Controller `[Authorize]` | Low | Returns current user + entitlements |
| auth | `/api/v1/auth/logout` | POST | None | Controller | Low | No-op server-side; client discards tokens |
| auth | `/api/v1/auth/password-reset/request` | POST | None | Controller | Med | Generates reset token, stores hash in DB |
| auth | `/api/v1/auth/password-reset/confirm` | POST | None | Controller | Med | Validates token hash, updates password |
| auth | `/api/v1/auth/linkedin/authorize` | GET | None | Controller | Med | Generates LinkedIn OAuth URL with CSRF state |
| auth | `/api/v1/auth/linkedin/callback` | GET | None (OAuth flow) | Controller | High | Exchanges code for token, creates/links user, redirects with JWT fragment |
| auth | `/api/v1/auth/google/authorize` | GET | None | Controller | Med | Generates Google OAuth URL with CSRF state |
| auth | `/api/v1/auth/google/callback` | GET | None (OAuth flow) | Controller | High | Exchanges code for token, creates/links user, redirects with JWT fragment |

### 3b. Jobs Module (`/api/v1/jobs`)

| Module | Current Endpoint Pattern | Verb | Auth | Target .NET Controller/MinimalAPI | Migration Complexity | Notes |
|---|---|---|---|---|---|---|
| jobs | `/api/v1/jobs/templates` | GET | Bearer | Controller | Low | Returns resume template list with tier info |
| jobs | `/api/v1/jobs/ingest` | POST | Bearer | Controller | Med | Queues URL scraping via Celery → need .NET background job equivalent |
| jobs | `/api/v1/jobs/ingest-html` | POST | Bearer | Controller | Med | Browser extension HTML ingest → Celery → .NET background job |
| jobs | `/api/v1/jobs` | GET | Bearer | Controller | Low | List user's job postings |
| jobs | `/api/v1/jobs/{job_id}` | GET | Bearer | Controller | Low | Get single job posting |
| jobs | `/api/v1/jobs/{job_id}` | DELETE | Bearer | Controller | Low | Delete job posting |
| jobs | `/api/v1/jobs/{job_id}` | PATCH | Bearer | Controller | Med | Update job fields + re-validate status |
| jobs | `/api/v1/jobs/{job_id}/application-status` | PATCH | Bearer | Controller | High | Update app status + auto-generate Company Spotlight via LLM |
| jobs | `/api/v1/jobs/{job_id}/extract-requirements` | POST | Bearer | Controller | High | LLM-powered requirements extraction from job description |
| jobs | `/api/v1/jobs/{job_id}/retry` | POST | Bearer | Controller | Med | Reset failed job + re-queue Celery task |
| jobs | `/api/v1/jobs/retry-all-failed` | POST | Bearer | Controller | Med | Bulk retry all failed jobs |
| jobs | `/api/v1/jobs/{job_id}/manual-content` | POST | Bearer | Controller | High | Save manual text + LLM extraction |
| jobs | `/api/v1/jobs/{job_id}/resumes` | POST | Bearer | Controller | High | Generate tailored resume: LLM + template rendering + match scoring |
| jobs | `/api/v1/jobs/{job_id}/resumes` | GET | Bearer | Controller | Low | List generated resumes |
| jobs | `/api/v1/jobs/{job_id}/resumes/{resume_id}` | GET | Bearer | Controller | Low | Get resume with HTML content |
| jobs | `/api/v1/jobs/{job_id}/cover-letters` | POST | Paid Bearer | Controller | High | LLM-generated cover letter (paid feature) |
| jobs | `/api/v1/jobs/{job_id}/cover-letters` | GET | Paid Bearer | Controller | Low | List cover letters |
| jobs | `/api/v1/jobs/{job_id}/cover-letters/{cl_id}` | GET | Paid Bearer | Controller | Low | Get specific cover letter |
| jobs | `/api/v1/jobs/{job_id}/deep-dive` | GET | Paid Bearer | Controller | Low | Get company deep dive |
| jobs | `/api/v1/jobs/{job_id}/deep-dive` | POST | Paid Bearer | Controller | High | LLM-generated company research |

### 3c. Applications Module (`/api/v1/applications`)

| Module | Current Endpoint Pattern | Verb | Auth | Target .NET Controller/MinimalAPI | Migration Complexity | Notes |
|---|---|---|---|---|---|---|
| applications | `/api/v1/applications` | GET | Bearer | Controller | Low | List user's applications |
| applications | `/api/v1/applications` | POST | Bearer | Controller | Low | Create application with event logging |
| applications | `/api/v1/applications/{app_id}` | GET | Bearer | Controller | Low | Get single application |
| applications | `/api/v1/applications/{app_id}` | PATCH | Bearer | Controller | Med | Update status + log ApplicationEvent |
| applications | `/api/v1/applications/{app_id}/followup-message` | POST | Paid Bearer | Controller | High | LLM-generated follow-up email |
| applications | `/api/v1/applications/{app_id}/interview-prep` | POST | Paid Bearer | Controller | High | LLM-generated interview prep materials |
| applications | `/api/v1/applications/{app_id}/improvement` | POST | Paid Bearer | Controller | High | LLM-generated improvement suggestions |

### 3d. Profile Module (`/api/v1/profile`)

| Module | Current Endpoint Pattern | Verb | Auth | Target .NET Controller/MinimalAPI | Migration Complexity | Notes |
|---|---|---|---|---|---|---|
| profile | `/api/v1/profile` | GET | Bearer | Controller | Low | Get user profile |
| profile | `/api/v1/profile` | PATCH | Bearer | Controller | Low | Update profile fields |
| profile | `/api/v1/profile/enhance` | POST | Bearer | Controller | Low | AI enhance (currently stub/TODO) |
| profile | `/api/v1/profile/upload-resume` | POST | Bearer | Controller | High | File upload + PDF extraction (PyMuPDF/PyPDF2) + LLM parsing → need .NET PDF lib |
| profile | `/api/v1/profile/completeness` | GET | Bearer | Controller | Low | Completeness score + missing fields |
| profile | `/api/v1/profile/upload-picture` | POST | Bearer | Controller | Med | Image upload with type/size validation |
| profile | `/api/v1/profile/picture` | DELETE | Bearer | Controller | Low | Delete profile picture file + DB |

### 3e. Billing Module (`/api/v1/billing`)

| Module | Current Endpoint Pattern | Verb | Auth | Target .NET Controller/MinimalAPI | Migration Complexity | Notes |
|---|---|---|---|---|---|---|
| billing | `/api/v1/billing/status` | GET | Bearer | Controller | Low | Subscription status + usage limits |
| billing | `/api/v1/billing/checkout` | POST | Bearer | Controller | Med | Creates Stripe Checkout session via httpx → need HttpClient |
| billing | `/api/v1/billing/webhook` | POST | None (Stripe signature) | Controller | Med | Stripe webhook: signature verification, subscription lifecycle |

### 3f. Admin Module (`/api/v1/admin`)

| Module | Current Endpoint Pattern | Verb | Auth | Target .NET Controller/MinimalAPI | Migration Complexity | Notes |
|---|---|---|---|---|---|---|
| admin | `/api/v1/admin/stats/overview` | GET | Admin Bearer | Controller `[Authorize(Roles="Admin")]` | Med | Aggregate stats: users, jobs, apps, traffic, API usage, security |
| admin | `/api/v1/admin/analytics/visits` | GET | Admin Bearer | Controller | Med | Visit analytics with pagination/day grouping |
| admin | `/api/v1/admin/analytics/api-usage` | GET | Admin Bearer | Controller | Med | API usage analytics with endpoint stats |
| admin | `/api/v1/admin/security/events` | GET | Admin Bearer | Controller | Med | Security events with severity/resolved filters |
| admin | `/api/v1/admin/security/events/{id}/resolve` | POST | Admin Bearer | Controller | Low | Mark security event resolved |

### 3g. Dev Module (`/api/v1/dev`)

| Module | Current Endpoint Pattern | Verb | Auth | Target .NET Controller/MinimalAPI | Migration Complexity | Notes |
|---|---|---|---|---|---|---|
| dev | `/api/v1/dev/verify` | GET | Admin Bearer | Controller | Low | Verify admin access |
| dev | `/api/v1/dev/apps` | GET | Admin Bearer | Controller | Low | List app doc entries |
| dev | `/api/v1/dev/log` | GET | Admin Bearer | Controller | Low | Master Log markdown |
| dev | `/api/v1/dev/overview` | GET | Admin Bearer | Controller | Low | Project Overview markdown |
| dev | `/api/v1/dev/docs` | GET | Admin Bearer | Controller | Low | List all doc files |
| dev | `/api/v1/dev/status` | GET | Admin Bearer | Controller | Low | Get dev portal status JSON |
| dev | `/api/v1/dev/status` | PUT | Admin Bearer | Controller | Low | Update dev portal status |
| dev | `/api/v1/dev/apps/{app_id}/log` | GET | Admin Bearer | Controller | Low | Per-app log |
| dev | `/api/v1/dev/apps/{app_id}/overview` | GET | Admin Bearer | Controller | Low | Per-app overview |
| dev | `/api/v1/dev/apps/{app_id}/checklist` | GET | Admin Bearer | Controller | Low | Per-app checklist |
| dev | `/api/v1/dev/apps/{app_id}/inventory` | GET | Admin Bearer | Controller | Low | Per-app inventory |
| dev | `/api/v1/dev/apps/{app_id}/checklist/tasks` | POST | Admin Bearer | Controller | Low | Append checklist task |

### 3h. Meridian Module (`/api/v1/meridian`)

| Module | Current Endpoint Pattern | Verb | Auth | Target .NET Controller/MinimalAPI | Migration Complexity | Notes |
|---|---|---|---|---|---|---|
| meridian | `/api/v1/meridian/status` | GET | Bearer | Controller | Low | Placeholder: API status |
| meridian | `/api/v1/meridian/projects` | GET | Bearer | Controller | Low | Placeholder: list projects (returns []) |
| meridian | `/api/v1/meridian/projects` | POST | Bearer | Controller | Low | Placeholder: create project |
| meridian | `/api/v1/meridian/projects/{id}` | GET | Bearer | Controller | Low | Placeholder: get project |
| meridian | `/api/v1/meridian/sync/pull` | POST | Bearer | Controller | Med | Placeholder: sync pull (CRDT/merge logic TBD) |
| meridian | `/api/v1/meridian/sync/push` | POST | Bearer | Controller | Med | Placeholder: sync push (CRDT/merge logic TBD) |

### 3i. Playground Module (`/api/v1/playground`)

| Module | Current Endpoint Pattern | Verb | Auth | Target .NET Controller/MinimalAPI | Migration Complexity | Notes |
|---|---|---|---|---|---|---|
| playground | `/api/v1/playground/designs` | GET | X-Dev-Token header | Controller | Low | List saved designs (JSON file storage) |
| playground | `/api/v1/playground/designs/{id}` | GET | X-Dev-Token header | Controller | Low | Get design by ID |
| playground | `/api/v1/playground/designs` | POST | X-Dev-Token header | Controller | Low | Create design |
| playground | `/api/v1/playground/designs/{id}` | PUT | X-Dev-Token header | Controller | Low | Update design |
| playground | `/api/v1/playground/designs/{id}` | DELETE | X-Dev-Token header | Controller | Low | Delete design |

### 3j. Root-Level Endpoints (`app.py`)

| Module | Current Endpoint Pattern | Verb | Auth | Target .NET Controller/MinimalAPI | Migration Complexity | Notes |
|---|---|---|---|---|---|---|
| root | `/health` | GET | None | MinimalAPI `app.MapGet` | Low | Health check |
| root | `/` | GET | None | MinimalAPI `app.MapGet` | Low | Root info/redirect |
| root | `/uploads/{path}` | GET (static) | None | `UseStaticFiles` middleware | Low | Serve uploaded avatars/files |

---

## Section 4: State Management Parity

| Store | Current (Pinia) | Target (.NET) | Migration Notes |
|---|---|---|---|
| `auth` | `useAuthStore` — reactive state: `user`, `accessToken`, `refreshToken`, `loading`, `error`; computed: `isAuthenticated`, `isAdmin`, `canAccessPremium`, `subscriptionTier`, `subscriptionStatus`, resume quota fields; actions: `login`, `register`, `loginWithLinkedIn`, `loginWithGoogle`, `handleOAuthCallback`, `fetchUser`, `checkAuth`, `logout` | ASP.NET Identity `AuthenticationStateProvider` + `CascadingAuthenticationState` (Blazor) or cookie-based session (Razor). Claims-based: `IsAdmin`, `SubscriptionTier`, `CanAccessPremium` as claims or policy checks. Token refresh via HttpClient DelegatingHandler or cookie sliding expiration. | High impact. localStorage JWT pattern must be replaced with either: (a) httpOnly cookie auth for Razor Pages, or (b) Blazor WASM with token storage in `ProtectedLocalStorage`. OAuth flows need ASP.NET External Authentication middleware (`AddGoogle`, `AddOpenIdConnect` for LinkedIn). |
| `jobs` | `useJobsStore` — reactive: `jobs`, `currentJob`, `loading`, `error`; computed: `pendingJobs`, `completedJobs`, `failedJobs`; actions: `fetchJobs`, `fetchJob`, `ingestJobs`, `deleteJob`, `retryJob`, `retryAllFailed` | Blazor: injectable service with `ObservableCollection` or `INotifyPropertyChanged`. Server-side: controller returns data, Blazor component manages local state. Could use Fluxor for complex state. | Med. Simpler in Blazor Server (direct DB access); harder in WASM (needs API calls like today). |
| `applications` | `useApplicationsStore` — reactive: `applications`, `currentApplication`, `loading`, `error`; actions: `fetchApplications`, `fetchApplication`, `createApplication`, `updateApplicationStatus`, `generateInterviewPrep`, `generateImprovementSuggestions`, `generateFollowupMessage`, `getApplicationForJob`, `clearCurrent` | Same pattern as jobs store: injectable service or Fluxor store. | Med. |
| (Axios client) | `api/client.js` — Axios instance with request interceptor (adds Bearer token), response interceptor (401 → redirect to login, refresh token TODO) | `HttpClient` with `DelegatingHandler` for auth token injection. Or Blazor Server bypasses API calls entirely with direct service injection. | Med. Architecture decision: Blazor Server (no API needed for own data) vs Blazor WASM (keep API). |

---

## Section 5: Middleware/Infrastructure Parity

| Current | Purpose | Target .NET Equivalent |
|---|---|---|
| `CORSMiddleware` (FastAPI) | Cross-origin requests for multi-subdomain architecture | `app.UseCors()` with named policies per subdomain |
| `AnalyticsMiddleware` (custom) | Tracks `SiteVisit` and `ApiUsage` per request to DB | Custom ASP.NET middleware or `IHttpModule`; write `SiteVisit`/`ApiUsage` to EF Core |
| JWT Bearer auth (`python-jose`) | Stateless auth with access + refresh tokens | `Microsoft.AspNetCore.Authentication.JwtBearer` or ASP.NET Identity with JWT |
| `passlib` bcrypt hashing | Password hashing | `Microsoft.AspNetCore.Identity.PasswordHasher<TUser>` (uses PBKDF2 by default; bcrypt via `BCrypt.Net`) |
| Celery + Redis | Background job queue (job scraping, HTML extraction) | `IHostedService` + Channels, or Hangfire, or .NET `BackgroundService` with queues |
| SQLAlchemy async + Alembic | ORM + DB migrations | Entity Framework Core + `dotnet ef migrations` |
| `httpx.AsyncClient` | Outbound HTTP (Stripe, OAuth token exchange) | `HttpClient` + `IHttpClientFactory` |
| Pydantic models/schemas | Request/response validation | `System.ComponentModel.DataAnnotations` or FluentValidation + DTOs |
| `python-markdown` | Markdown → HTML for dev docs | `Markdig` NuGet package |
| `PyMuPDF` / `PyPDF2` | PDF text extraction for resume upload | `PdfPig` or `iTextSharp` or `Syncfusion.Pdf` |
| Uvicorn + systemctl | ASGI server + process management | Kestrel + systemd/IIS/Docker |
| Static file serving (`StaticFiles`) | Serve uploads directory | `app.UseStaticFiles()` with `FileExtensionContentTypeProvider` |
| GitHub Actions CI/CD | SSH deploy → git pull → pip install → alembic → npm build → restart | GitHub Actions → `dotnet publish` → deploy artifact → restart |
| In-memory `oauth_states` dict | CSRF state storage for OAuth flows | `IDistributedCache` (Redis) or `IMemoryCache` with expiration |
| LLM client (`llm_client`) | OpenAI GPT-4o-mini calls for resume gen, cover letters, deep dives, requirements extraction, interview prep, follow-up messages, improvement suggestions | `Azure.AI.OpenAI` SDK or `OpenAI` .NET SDK; injectable `ILlmClient` service |
| Resume template rendering | HTML generation with template IDs and color schemes | Razor views as templates, or Scriban/Handlebars .NET for HTML generation |
| Stripe integration (raw HTTP) | Checkout sessions + webhook signature verification | `Stripe.net` NuGet package (official SDK) |
| Entitlements service | Tier-based feature gating (free/paid), resume quota management | Authorization policies + `IAuthorizationHandler` for tier checks |

---

## Section 6: Blockers and Unknowns

1. **BLOCKER** — **Celery/Redis background jobs**: The current architecture uses Celery with Redis for async job scraping (`scrape_job_posting.delay()`) and HTML extraction (`extract_job_from_html.delay()`). .NET equivalent (Hangfire, `BackgroundService`, or Azure Service Bus) must be selected and implemented before jobs module can function. This is a hard dependency for the core Apply workflow.

2. **BLOCKER** — **LLM client integration**: Seven distinct LLM-powered features (resume generation, cover letters, deep dives, requirements extraction, interview prep, follow-up messages, improvement suggestions) depend on `atlasops.services.llm_client`. The .NET replacement must support the same prompt templating, JSON response parsing, and streaming patterns. Choice between Azure OpenAI SDK vs OpenAI .NET SDK affects auth model.

3. **BLOCKER** — **OAuth state management**: Current implementation uses an in-memory Python dict (`oauth_states`) for CSRF protection in OAuth flows. This breaks in multi-instance deployments. .NET migration must use `IDistributedCache` or DB-backed state from day one.

4. **BLOCKER** — **Database migration path**: Current DB is PostgreSQL via SQLAlchemy async + Alembic. Migration to EF Core requires schema recreation or a migration bridge. Data must be preserved. Need to decide: (a) keep existing Alembic-managed schema and map EF Core to it, or (b) generate new EF Core migrations and write a data migration script.

5. **UNKNOWN** — **Blazor Server vs Blazor WASM vs hybrid**: Atlas Apply (the most complex frontend) has heavy interactivity. Blazor Server gives simpler state management and direct DB access but adds latency. Blazor WASM keeps the current SPA model but requires maintaining the full API surface. Blazor United (SSR + interactive) is the modern choice but adds complexity. Decision affects every component in Section 2b.

6. **UNKNOWN** — **AtlasForge rendering architecture**: Forge renders arbitrary Vue and React components inside an iframe with dynamic framework providers. This is inherently JavaScript-dependent. A Blazor migration would likely keep Forge as a JS SPA embedded in the .NET host, or require a complete rethink of the multi-framework preview concept. Is full Blazor conversion even desirable here?

7. **UNKNOWN** — **Resume template rendering engine**: Current Python code generates HTML from templates with color schemes. The .NET equivalent could use Razor views, Scriban templates, or a dedicated HTML generation library. Template parity (exact same visual output) may require pixel-perfect porting of CSS + HTML templates.

8. **UNKNOWN** — **PDF parsing library choice**: Python uses PyMuPDF (preferred) with PyPDF2 fallback. .NET options include PdfPig (open-source), iTextSharp (AGPL), or Syncfusion (commercial). Feature parity for text extraction quality is uncertain.

9. **UNKNOWN** — **Entitlements/subscription tier logic**: The Python `entitlements.py` service has nuanced logic for free/paid tier gating, resume generation quotas, and quota resets. This must be ported precisely to .NET authorization policies. Edge cases around quota boundaries and subscription status transitions need validation.

10. **UNKNOWN** — **Multi-subdomain architecture**: Current setup serves three subdomains (atlasuniversalis.com, apply.atlasuniversalis.com, playground.atlasuniversalis.com) as separate Vite builds behind Nginx. .NET consolidation could use ASP.NET Areas, separate projects in a solution, or a reverse-proxy pattern. CORS policy differences per subdomain add complexity.

11. **UNKNOWN** — **Meridian sync protocol**: The Meridian API endpoints (`sync/pull`, `sync/push`) are placeholders returning empty data. The actual CRDT/merge logic has not been implemented in Python. The .NET version should implement this from scratch, but the protocol design is undefined.

12. **UNKNOWN** — **Browser extension compatibility**: The Chrome extension currently calls `/api/v1/jobs/ingest-html` with raw HTML. If the API contract changes (URL patterns, auth headers, CORS), the extension must be updated simultaneously.

13. **BLOCKER** — **Analytics middleware data model**: The `AnalyticsMiddleware` writes `SiteVisit` and `ApiUsage` records to PostgreSQL on every request. The .NET equivalent must match the schema or the admin analytics dashboards will break. The middleware must also be non-blocking to avoid impacting response times.

14. **UNKNOWN** — **Prompt template management**: LLM prompts are stored as markdown files in `atlasops/prompts/`. The .NET equivalent needs a similar file-based or embedded-resource approach for prompt versioning (`cover_letter_v1.md`, `deep_dive_v1.md`, etc.).

15. **UNKNOWN** — **Test coverage baseline**: No test files were found in the current Python codebase. The .NET rebuild is an opportunity to add tests, but there is no existing test suite to validate behavioral parity against.
