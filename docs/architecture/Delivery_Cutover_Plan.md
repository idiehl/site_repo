# Atlas Universalis — Delivery & Cutover Plan

> Generated: 2026-02-19  
> Scope: Full hybrid rebuild (Phases 0–7). ElectraCast is **excluded**.  
> Target stack: .NET 10 / ASP.NET Core / Blazor / Razor Pages / Avalonia  
> Current stack: Python FastAPI + Vue 3 + Astro + Avalonia (Meridian only)

---

## Section 1: Task Backlog

### Phase 0 — Program Setup & Cutover Strategy

| Task ID | Task | Dependencies | Estimate (days) | Risk Level | Validation Gate |
|---------|------|--------------|-----------------|------------|-----------------|
| P0-01 | Create `Atlas.sln` with projects: `Atlas.Web` (Razor Pages + Blazor Server), `Atlas.Api` (ASP.NET Core Web API), `Atlas.Shared` (contracts/DTOs), `Atlas.UIKit` (Razor Class Library) | — | 1 | Low | Solution builds, `dotnet test` passes on empty projects |
| P0-02 | Add `Atlas.Tests` xUnit project with Verify + bUnit references | P0-01 | 0.5 | Low | `dotnet test` green |
| P0-03 | Configure EF Core with Npgsql provider; create initial `AtlasDbContext` pointing at existing PostgreSQL database | P0-01 | 1 | Medium | `dotnet ef dbcontext info` succeeds against dev DB |
| P0-04 | Scaffold EF Core entities from existing PostgreSQL schema (database-first) excluding ElectraCast tables | P0-03 | 1 | Medium | Generated models compile; read-only query returns data |
| P0-05 | Define migration-sequence document: ordered list of routes to cut over, per subdomain | P0-01 | 0.5 | Low | Document reviewed and committed |
| P0-06 | Add `upstream atlas_dotnet` block to each Nginx conf template; default all routes to legacy upstream | — | 0.5 | Low | Nginx `-t` passes; no traffic disruption |
| P0-07 | Create Nginx `map` variable + `include` file for blue/green route switching (`$route_backend`) | P0-06 | 1 | High | Toggle one test route `/healthz-dotnet` to .NET; confirm 200 |
| P0-08 | Install .NET 10 SDK on droplet; create systemd unit `atlas-dotnet.service` (Kestrel on 127.0.0.1:5000) | P0-01 | 0.5 | Medium | `systemctl status atlas-dotnet` active; curl 127.0.0.1:5000/healthz returns 200 |
| P0-09 | Add `.editorconfig`, `Directory.Build.props`, `global.json` (pin .NET 10 SDK) | P0-01 | 0.25 | Low | `dotnet build` respects settings |
| P0-10 | Add GitHub Actions workflow `deploy-dotnet.yml` (build, test, publish, SSH deploy) alongside existing `deploy.yml` | P0-08 | 1 | Medium | Push triggers build; artifact lands on droplet |

### Phase 1 — Design System Conversion

| Task ID | Task | Dependencies | Estimate (days) | Risk Level | Validation Gate |
|---------|------|--------------|-----------------|------------|-----------------|
| P1-01 | Inventory UI concept pack: catalog 10 PNGs + PDF, extract color hex codes, font families, spacing scale, border radii | — | 1 | Low | Design-tokens JSON committed |
| P1-02 | Create `Atlas.UIKit` design-token SCSS/CSS variables file from extracted values | P1-01 | 0.5 | Low | Tokens render correctly in isolated HTML test page |
| P1-03 | Build `AtlasButton` Blazor component (primary, secondary, ghost, danger variants) matching concept art | P1-02, P0-01 | 1 | Low | bUnit snapshot tests pass for all variants |
| P1-04 | Build `AtlasCard` Blazor component (standard, elevated, bordered) | P1-02 | 0.5 | Low | bUnit tests pass |
| P1-05 | Build `AtlasInput` / `AtlasTextarea` Blazor components with validation integration | P1-02 | 1 | Low | bUnit tests; keyboard navigation works |
| P1-06 | Build `AtlasNavbar` / `AtlasFooter` layout components | P1-02 | 1 | Low | Responsive at 320px, 768px, 1440px breakpoints |
| P1-07 | Build `AtlasBadge`, `AtlasAvatar`, `AtlasAlert`, `AtlasTabs`, `AtlasProgress` components (mirror Forge Vue set) | P1-02 | 2 | Low | 1:1 visual parity with Forge originals |
| P1-08 | Build `AtlasModal`, `AtlasDropdown`, `AtlasTooltip` interactive components | P1-02 | 1.5 | Medium | Accessibility: focus trap, Escape close, aria attributes |
| P1-09 | Build `AtlasTable` with sorting, pagination, empty-state | P1-02 | 1 | Medium | Renders 1000-row dataset without jank |
| P1-10 | Build `AtlasFormGroup` / `AtlasFieldValidation` wrappers for EditForm | P1-05 | 0.5 | Low | Validation messages display correctly |
| P1-11 | Create `/showcase` page in `Atlas.Web` rendering every UIKit component | P1-03 through P1-10 | 1 | Low | Page loads; all components visible and interactive |
| P1-12 | Icon system: import SVG icon set as Blazor `AtlasIcon` component with size/color props | P1-02 | 0.5 | Low | All icons render at 16/24/32px |

### Phase 2 — Main Site + Dev Portal Migration

| Task ID | Task | Dependencies | Estimate (days) | Risk Level | Validation Gate |
|---------|------|--------------|-----------------|------------|-----------------|
| P2-01 | Create `_Layout.cshtml` master layout in `Atlas.Web` using `AtlasNavbar`/`AtlasFooter`; match current `frontend-main` chrome | P1-06 | 1 | Low | Layout renders at all breakpoints |
| P2-02 | Build landing page (`/`) as Razor Page; port content from `HomeView.vue` | P2-01 | 2 | Medium | Visual parity screenshot diff < 5% |
| P2-03 | Build Meridian info page (`/meridian`) as Razor Page; port from `MeridianView.vue` | P2-01 | 1 | Low | Content matches; links work |
| P2-04 | Build dev portal login page (`/dev`) as Razor Page; port from `DevLoginView.vue` | P2-01 | 0.5 | Low | Form submits; PIN auth works |
| P2-05 | Build dev dashboard (`/dev/dashboard`) as Blazor interactive page; port from `DevDashboardView.vue` | P2-04, P1-09 | 2 | Medium | Data loads from `/api/v1/dev/` endpoints (still Python) |
| P2-06 | Build dev log page (`/dev/log`); port from `DevLogView.vue` | P2-04 | 1 | Low | Markdown renders correctly |
| P2-07 | Build dev overview page (`/dev/overview`); port from `DevOverviewView.vue` | P2-04 | 1 | Low | Content matches legacy |
| P2-08 | Build dev app log page (`/dev/apps/{appId}/log`); port from `DevAppLogView.vue` | P2-04 | 1 | Low | Dynamic route works; data loads |
| P2-09 | Build dev app overview page (`/dev/apps/{appId}/overview`); port from `DevAppOverviewView.vue` | P2-04 | 1 | Low | Data loads correctly |
| P2-10 | Build dev app checklist page (`/dev/apps/{appId}/checklist`); port from `DevAppChecklistView.vue` | P2-04 | 1 | Low | Checklist items toggle correctly |
| P2-11 | Build dev app inventory page (`/dev/apps/{appId}/inventory`); port from `DevAppInventoryView.vue` | P2-04 | 1 | Low | Inventory data renders |
| P2-12 | Configure Nginx `$route_backend` map to send `/`, `/meridian`, `/dev/*` to .NET upstream | P2-02 through P2-11, P0-07 | 0.5 | High | Smoke test all routes via .NET; legacy routes still work |
| P2-13 | Markdown rendering service: integrate Markdig for doc sources consumed by dev portal | P2-06 | 0.5 | Low | Markdown docs render identically to legacy |
| P2-14 | Remove `frontend-main` from legacy deploy.yml build steps (conditional on route switch) | P2-12 | 0.25 | Medium | Deploy succeeds without building frontend-main |

### Phase 3 — Auth + Atlas Apply Surface Migration

| Task ID | Task | Dependencies | Estimate (days) | Risk Level | Validation Gate |
|---------|------|--------------|-----------------|------------|-----------------|
| P3-01 | Implement JWT authentication middleware in `Atlas.Api` matching existing Python JWT scheme (same secret, same claims) | P0-03 | 2 | High | Existing frontend tokens validate against .NET API |
| P3-02 | Implement OAuth2 callback handler (Google/GitHub) in `Atlas.Api` mirroring `auth.py` flows | P3-01 | 2 | High | OAuth login roundtrip succeeds; token issued |
| P3-03 | Build Login page (`/login`) in Blazor; port from `LoginView.vue` | P3-01, P2-01 | 1 | Medium | Login form authenticates; JWT stored |
| P3-04 | Build Register page (`/register`) in Blazor; port from `RegisterView.vue` | P3-01 | 1 | Medium | Registration creates user in PostgreSQL |
| P3-05 | Build OAuth callback page; port from `OAuthCallbackView.vue` | P3-02 | 0.5 | Medium | OAuth redirect completes cleanly |
| P3-06 | Build Dashboard page (`/dashboard`) in Blazor; port from `DashboardView.vue` | P3-01, P1-09 | 2 | Medium | All dashboard widgets load with real data |
| P3-07 | Build Profile page (`/profile`) in Blazor; port from `ProfileView.vue` | P3-01 | 1 | Low | Profile edit saves to DB |
| P3-08 | Build Applications page (`/applications`) in Blazor; port from `ApplicationsView.vue` | P3-01 | 2 | Medium | CRUD operations work; pagination functions |
| P3-09 | Build Job Detail page (`/jobs/{id}`) in Blazor; port from `JobDetailView.vue` | P3-01 | 1 | Low | Job data loads; actions work |
| P3-10 | Build Extension download page (`/extension`) in Razor; port from `ExtensionView.vue` | P2-01 | 0.5 | Low | Download link works |
| P3-11 | Build Admin Dashboard (`/admin`) in Blazor; port from `AdminDashboardView.vue` | P3-01 | 1.5 | Medium | Admin-only access enforced |
| P3-12 | Build Admin Analytics (`/admin/analytics`) in Blazor; port from `AdminAnalyticsView.vue` | P3-11 | 1 | Medium | Charts render with real data |
| P3-13 | Build Admin Security (`/admin/security`) in Blazor; port from `AdminSecurityView.vue` | P3-11 | 1 | Medium | Security controls functional |
| P3-14 | Port Pinia `auth` store logic to .NET `AuthStateProvider` (Blazor auth state) | P3-01 | 1 | High | Auth state persists across navigation |
| P3-15 | Port Pinia `applications` store to .NET service (`ApplicationService`) | P3-08 | 1 | Medium | All application CRUD works without Pinia |
| P3-16 | Port Pinia `jobs` store to .NET service (`JobService`) | P3-09 | 0.5 | Medium | Job listing/detail works without Pinia |
| P3-17 | Configure Nginx: cut `apply.atlasuniversalis.com` frontend routes to .NET; keep `/api/` on Python | P3-03 through P3-13, P0-07 | 0.5 | High | All Apply pages load via .NET; API calls proxy to Python |
| P3-18 | Evaluate ASP.NET Identity migration path; document decision (adopt or keep JWT-only) | P3-01 | 1 | Low | Decision document committed |

### Phase 4 — Atlas Forge Migration

| Task ID | Task | Dependencies | Estimate (days) | Risk Level | Validation Gate |
|---------|------|--------------|-----------------|------------|-----------------|
| P4-01 | Design Blazor Forge architecture: component browser, props editor, preview panel, canvas builder as Blazor components | P1-11 | 1 | Medium | Architecture document committed |
| P4-02 | Build `ComponentBrowser` Blazor component; port from `ComponentBrowser.vue` | P4-01 | 2 | Medium | Lists all UI kit components; search/filter works |
| P4-03 | Build `PropsEditor` Blazor component; port from `PropsEditor.vue` | P4-01 | 2 | Medium | Dynamic property editing for selected component |
| P4-04 | Build `PreviewPanel` Blazor component; port from `PreviewPanel.vue` / `MockPreview.vue` | P4-01 | 2 | Medium | Live preview updates on prop change |
| P4-05 | Build `CanvasBuilder` Blazor component; port from `CanvasBuilder.vue` / `CanvasElementRenderer.vue` | P4-01 | 3 | High | Drag-and-drop placement; element persistence |
| P4-06 | Build `CodeExporter` Blazor component; port from `CodeExporter.vue` | P4-01 | 1 | Low | Exports valid Blazor/HTML markup |
| P4-07 | Build `SaveDesignModal` Blazor component; port from `SaveDesignModal.vue` | P4-01 | 0.5 | Low | Save/load design roundtrip works |
| P4-08 | Build `TopBar` layout for Forge; port from `TopBar.vue` | P4-01 | 0.5 | Low | Navigation and actions work |
| P4-09 | Port Forge playground layout; integrate component browser + preview + props editor as split-pane layout | P4-02, P4-03, P4-04 | 2 | Medium | Layout matches Forge UX; resize handles work |
| P4-10 | Build custom component wrapper system (replaces React/Vue provider wrappers) for UIKit showcase | P4-04 | 1.5 | Medium | UIKit components render in preview panel |
| P4-11 | Port `IsolatedPreview` sandboxing to Blazor (iframe or RenderFragment isolation) | P4-04 | 1.5 | High | Component isolation prevents CSS/JS bleed |
| P4-12 | Configure Nginx: cut `forge.atlasuniversalis.com` to .NET upstream | P4-09, P0-07 | 0.5 | High | Forge loads via .NET; all features functional |

### Phase 5 — Meridian Hybrid Web Delivery

| Task ID | Task | Dependencies | Estimate (days) | Risk Level | Validation Gate |
|---------|------|--------------|-----------------|------------|-----------------|
| P5-01 | Define `IMeridianPlatform` abstraction in `Atlas.Meridian.Core`: file I/O, rendering, input, export interfaces | P0-01 | 2 | Medium | Interface compiles; desktop app still works against it |
| P5-02 | Implement `WebMeridianPlatform` for Blazor WASM: virtual file system, canvas rendering via JS interop | P5-01 | 3 | High | Basic .atlas file loads in browser |
| P5-03 | Build Meridian Player Blazor component: toolbar, slide navigation, zoom controls | P5-02, P1-03 | 3 | High | Navigate slides; render text and shapes |
| P5-04 | Implement .atlas file upload/download via Atlas.Api endpoint | P5-01, P0-03 | 1 | Medium | Upload .atlas; retrieve and parse correctly |
| P5-05 | Implement Meridian export (PDF/PNG) via server-side rendering or JS interop | P5-03 | 2 | High | Export produces valid file matching desktop output |
| P5-06 | Build Meridian web editor: basic text/shape editing on canvas (subset of desktop features) | P5-03 | 5 | High | Create/edit/delete elements; save changes |
| P5-07 | Evaluate Avalonia WASM vs Blazor hybrid: benchmark render perf, bundle size, feature parity | P5-03 | 2 | Medium | Decision document with benchmarks committed |
| P5-08 | Integrate Meridian Player into main site `/meridian` page | P5-03, P2-03 | 1 | Medium | Embedded player loads demo .atlas file |

### Phase 6 — API & Worker Migration (Python -> .NET)

| Task ID | Task | Dependencies | Estimate (days) | Risk Level | Validation Gate |
|---------|------|--------------|-----------------|------------|-----------------|
| P6-01 | Port `auth.py` API module to `Atlas.Api/Controllers/AuthController.cs` | P3-01 | 2 | High | All auth endpoints return identical responses (parity test) |
| P6-02 | Port `applications.py` to `ApplicationsController.cs` | P0-04 | 2 | Medium | CRUD parity; existing frontend works against .NET |
| P6-03 | Port `billing.py` to `BillingController.cs` | P0-04 | 1.5 | Medium | Billing endpoints match Python responses |
| P6-04 | Port `dev.py` to `DevController.cs` | P0-04 | 1 | Low | Dev portal data loads from .NET API |
| P6-05 | Port `jobs.py` to `JobsController.cs` | P0-04 | 1.5 | Medium | Job CRUD + search parity |
| P6-06 | Port `meridian.py` to `MeridianController.cs` | P0-04 | 1.5 | Medium | Meridian API parity |
| P6-07 | Port `playground.py` to `PlaygroundController.cs` | P0-04 | 1 | Low | Playground endpoints match |
| P6-08 | Port `profile.py` to `ProfileController.cs` | P0-04 | 1 | Low | Profile CRUD parity |
| P6-09 | Port `admin.py` to `AdminController.cs` | P0-04, P3-01 | 2 | High | Admin operations work; authorization enforced |
| P6-10 | Port Celery tasks (`workers/tasks.py`) to .NET `IHostedService` / `BackgroundService` implementations | P0-04 | 3 | High | Background jobs execute; results match Celery output |
| P6-11 | Port `services/scraper.py` to .NET `ScraperService` (HttpClient + AngleSharp) | P0-04 | 2 | Medium | Scraper output matches Python |
| P6-12 | Port `services/resume_parser.py` + `resume_generator.py` to .NET equivalents | P0-04 | 2 | Medium | Resume parse/generate produces identical output |
| P6-13 | Port `services/llm_client.py` to .NET `LlmService` (HttpClient to OpenAI/Anthropic) | P0-04 | 1 | Medium | LLM calls return expected responses |
| P6-14 | Port `services/megaphone.py` (notifications) to .NET `NotificationService` | P0-04 | 0.5 | Low | Notifications sent correctly |
| P6-15 | Port `services/entitlements.py` to .NET `EntitlementService` | P0-04 | 0.5 | Low | Entitlement checks match Python logic |
| P6-16 | Port `middleware/analytics.py` to ASP.NET middleware | P0-04 | 0.5 | Low | Analytics events recorded |
| P6-17 | Build dual-stack parity test suite: run same HTTP requests against Python (port 8000) and .NET (port 5000), compare responses | P6-01 through P6-09 | 3 | High | 100% response parity on all non-ElectraCast endpoints |
| P6-18 | Switch Nginx `/api/` proxy from `127.0.0.1:8000` to `127.0.0.1:5000` on `apply.atlasuniversalis.com` | P6-17 | 0.5 | High | All API calls succeed via .NET backend |
| P6-19 | Switch Nginx `/api/` proxy on `forge.atlasuniversalis.com` | P6-18 | 0.25 | High | Forge API calls succeed |
| P6-20 | Remove Redis dependency (if Celery fully replaced); or keep for caching | P6-10 | 0.5 | Medium | Decision documented; services stable |

### Phase 7 — Deployment, Validation & Decommissioning

| Task ID | Task | Dependencies | Estimate (days) | Risk Level | Validation Gate |
|---------|------|--------------|-----------------|------------|-----------------|
| P7-01 | Consolidate CI/CD: merge `deploy.yml` + `deploy-dotnet.yml` into single pipeline | P6-18 | 1 | Medium | Single push builds and deploys .NET app |
| P7-02 | Remove legacy Python build steps from CI/CD (pip install, alembic, frontend builds) | P7-01 | 0.5 | Medium | Deploy succeeds without Python steps |
| P7-03 | Add health-check monitoring: systemd watchdog + curl-based liveness probe script in cron | P7-01 | 0.5 | Low | Alert fires within 60s of service failure |
| P7-04 | Staged production cutover: enable .NET for all routes on `atlasuniversalis.com` | P2-12, P7-01 | 0.5 | High | All main-site routes serve from .NET |
| P7-05 | Staged production cutover: enable .NET for all routes on `apply.atlasuniversalis.com` | P3-17, P6-18, P7-01 | 0.5 | High | All Apply routes serve from .NET |
| P7-06 | Staged production cutover: enable .NET for all routes on `forge.atlasuniversalis.com` | P4-12, P6-19, P7-01 | 0.5 | High | All Forge routes serve from .NET |
| P7-07 | Run full smoke-test suite across all subdomains | P7-04, P7-05, P7-06 | 0.5 | Medium | All routes return 200; functional tests pass |
| P7-08 | 48-hour burn-in period: monitor logs, error rates, response times | P7-07 | 2 | Medium | Error rate < 0.1%; p99 latency < 500ms |
| P7-09 | Decommission `atlasuniversalis` systemd service (Python/Uvicorn) | P7-08 | 0.25 | Medium | Service stopped and disabled; no traffic loss |
| P7-10 | Decommission `celery-worker` systemd service | P7-08, P6-10 | 0.25 | Medium | Background jobs running via .NET |
| P7-11 | Archive legacy Python/Vue/Astro source to `legacy/` branch | P7-09 | 0.25 | Low | Branch created; main branch clean |
| P7-12 | Clean up Nginx configs: remove blue/green switching; simplify to single upstream | P7-08 | 0.5 | Low | Nginx `-t` passes; configs simplified |
| P7-13 | Update project documentation: README, deploy docs, architecture diagrams | P7-12 | 1 | Low | Docs reflect new architecture |
| P7-14 | Remove unused Python packages from droplet; uninstall Node.js if no longer needed | P7-11 | 0.25 | Low | Disk space reclaimed |

---

## Section 2: Critical Path

### Critical Path Chain

```
P0-01 → P0-03 → P0-04 ──────────────────────────────────────────────────────┐
  │                                                                          │
  ├→ P0-06 → P0-07 (blue/green infrastructure)                              │
  │                                                                          │
  ├→ P1-01 → P1-02 → P1-03..P1-10 → P1-11                                  │
  │                      │                                                   │
  │                      ├→ P2-01 → P2-02..P2-11 → P2-12 → P7-04            │
  │                      │                                                   │
  │                      └→ P3-01 → P3-02 → P3-03..P3-13 → P3-17 ───┐      │
  │                                                                   │      │
  │                                                    P4-01..P4-12 → P4-12  │
  │                                                                          │
  └→ P5-01 → P5-02 → P5-03 → P5-06                                         │
                                                                             │
P0-04 → P6-01..P6-09 → P6-17 → P6-18 → P6-19 ──────────────────────────────┘
                                    │
                                    └→ P7-01 → P7-07 → P7-08 → P7-09..P7-14
```

### Critical Path Tasks (Longest Path)

```
P0-01 (1d) → P0-03 (1d) → P0-04 (1d) → P6-01 (2d) → ... → P6-17 (3d) →
P6-18 (0.5d) → P7-01 (1d) → P7-07 (0.5d) → P7-08 (2d) → P7-09 (0.25d)
```

**Bottleneck: P6-17 (dual-stack parity tests)** — cannot proceed to production API cutover without 100% parity confirmation.

### Total Estimated Duration

| Metric | Value |
|--------|-------|
| Total task-days (sequential sum) | ~148 person-days |
| Critical path duration (sequential) | ~62 working days |
| With parallelism (1 developer) | ~90 working days (~18 weeks) |
| With parallelism (2 developers) | ~55 working days (~11 weeks) |

### Parallel Work Opportunities

| Parallel Track A | Parallel Track B | Savings |
|-------------------|-------------------|---------|
| P1-01..P1-12 (Design system) | P0-06..P0-10 (Infrastructure) | 4 days |
| P2-01..P2-14 (Main site) | P3-01..P3-02 (Auth core) | 5 days |
| P4-01..P4-12 (Forge) | P5-01..P5-08 (Meridian) | 15 days |
| P6-01..P6-09 (API controllers) | P6-10..P6-16 (Services/workers) | 8 days |
| P2-06..P2-11 (Dev portal pages) | P1-07..P1-10 (More UIKit components) | 3 days |

### Gantt-Style Timeline (Weeks)

```
Week  1-2:   ████ P0 (Program Setup)
Week  2-4:   ████████ P1 (Design System)  ║  ████ P0 infra (parallel)
Week  4-7:   ████████████ P2 (Main Site + Dev Portal)
Week  6-10:  ████████████████ P3 (Auth + Apply)
Week  9-13:  ████████████████ P4 (Forge)  ║  ████████████████ P5 (Meridian)
Week 12-17:  ████████████████████ P6 (API Migration)
Week 17-19:  ████████ P7 (Cutover + Decommission)
```

---

## Section 3: Risk Controls Per Phase

### Phase 0 — Program Setup

| Risk | Control | Rollback Procedure | Max Acceptable Downtime |
|------|---------|-------------------|------------------------|
| .NET SDK install breaks existing services | Install in isolated path; do not modify system Python/Node | Uninstall .NET SDK; restart systemd services | 5 minutes |
| Nginx blue/green config error | Test with `nginx -t` before reload; keep backup of working config | `cp /etc/nginx/sites-available/*.bak` restore; `nginx -s reload` | 1 minute |
| EF Core schema mismatch with production DB | Use database-first scaffolding; never run migrations against prod without snapshot | Drop `__EFMigrations` table; no schema changes made | 0 (read-only) |

### Phase 1 — Design System

| Risk | Control | Rollback Procedure | Max Acceptable Downtime |
|------|---------|-------------------|------------------------|
| Design tokens don't match concept art | Side-by-side screenshot comparison at every token extraction | Re-extract from original PNGs/PDF | 0 (no prod impact) |
| bUnit tests flaky | Pin Verify snapshots; run on CI | Fix test; no prod impact | 0 |

### Phase 2 — Main Site Migration

| Risk | Control | Rollback Procedure | Max Acceptable Downtime |
|------|---------|-------------------|------------------------|
| Razor page renders incorrectly | Visual regression test (screenshot diff) per route before cutover | Flip `$route_backend` map back to `legacy` in Nginx; reload | 30 seconds |
| SEO regression (missing meta tags) | Automated SEO audit comparing old/new page meta | Rollback Nginx route | 30 seconds |
| Markdown rendering differences | Diff rendered HTML output between Markdig and current renderer | Keep legacy Markdown route active | 30 seconds |

### Phase 3 — Auth Migration

| Risk | Control | Rollback Procedure | Max Acceptable Downtime |
|------|---------|-------------------|------------------------|
| JWT incompatibility between Python and .NET | Use identical signing key, algorithm (HS256), and claims structure; automated cross-validation test | Route auth back to Python backend | 1 minute |
| OAuth callback URL mismatch | Register `.NET` callback URLs in Google/GitHub apps alongside existing; test before cutover | Revert OAuth app settings to Python callback URLs | 5 minutes |
| User session loss during cutover | Both stacks validate same JWT; no session migration needed | N/A — tokens are stateless | 0 |
| Data corruption on dual-write | .NET reads from same PostgreSQL; no dual-write during transition | Rollback API route to Python | 0 |

### Phase 4 — Forge Migration

| Risk | Control | Rollback Procedure | Max Acceptable Downtime |
|------|---------|-------------------|------------------------|
| Canvas builder performance regression | Benchmark JS interop latency; target < 16ms per frame | Keep Astro Forge running; rollback Nginx | 30 seconds |
| Component isolation failure (CSS bleed) | Shadow DOM or iframe isolation; automated visual regression | Rollback Nginx route to Astro | 30 seconds |

### Phase 5 — Meridian

| Risk | Control | Rollback Procedure | Max Acceptable Downtime |
|------|---------|-------------------|------------------------|
| WASM bundle too large (> 10MB) | Measure bundle size in CI; set 8MB warning, 12MB failure threshold | Defer web delivery; desktop-only | 0 (new feature) |
| Rendering fidelity mismatch desktop vs web | Pixel-diff test suite for 5 reference .atlas files | Limit web to view-only mode | 0 (new feature) |
| Avalonia WASM breaks Blazor hosting | Evaluate in isolated spike before integration | Fall back to pure Blazor canvas | 0 (new feature) |

### Phase 6 — API Migration

| Risk | Control | Rollback Procedure | Max Acceptable Downtime |
|------|---------|-------------------|------------------------|
| API response schema mismatch | Dual-stack parity test suite (P6-17) must pass 100% before any cutover | Route `/api/` back to Python (127.0.0.1:8000) in Nginx | 30 seconds |
| Background job failure (missed task) | Run .NET workers in shadow mode alongside Celery for 1 week; compare output | Re-enable celery-worker systemd service | 1 minute |
| Database migration conflict | No schema changes during Phase 6; both stacks use identical schema | N/A — no schema changes | 0 |

### Phase 7 — Deployment & Decommission

| Risk | Control | Rollback Procedure | Max Acceptable Downtime |
|------|---------|-------------------|------------------------|
| Full cutover reveals edge-case bug | 48-hour burn-in (P7-08) with error monitoring before decommission | Restart Python services from systemd | 2 minutes |
| Disk space exhaustion after removing cleanup | Monitor disk usage; `/var/www` should drop after legacy removal | Keep legacy files for 30 days before delete | 0 |

---

## Section 4: CI/CD Evolution Plan

### Phase 0: Add .NET Pipeline (Alongside Existing)

```yaml
# .github/workflows/deploy-dotnet.yml
name: Deploy .NET to DigitalOcean

on:
  push:
    branches: ["master"]
    paths:
      - "Atlas.Web/**"
      - "Atlas.Api/**"
      - "Atlas.Shared/**"
      - "Atlas.UIKit/**"
      - "Atlas.Tests/**"

jobs:
  build-and-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup .NET 10
        uses: actions/setup-dotnet@v4
        with:
          dotnet-version: "10.0.x"

      - name: Restore
        run: dotnet restore Atlas.sln

      - name: Build
        run: dotnet build Atlas.sln --configuration Release --no-restore

      - name: Test
        run: dotnet test Atlas.sln --configuration Release --no-build --verbosity normal

      - name: Publish
        run: dotnet publish Atlas.Web/Atlas.Web.csproj -c Release -o ./publish

      - name: Deploy via SSH
        uses: appleboy/ssh-action@v1.0.3
        with:
          host: ${{ secrets.DROPLET_IP }}
          username: ${{ secrets.USERNAME }}
          key: ${{ secrets.SSH_KEY }}
          script: |
            cd /var/www/atlasuniversalis.com
            git pull origin master

            # Build on server (alternative: rsync publish artifacts)
            cd dotnet
            dotnet publish Atlas.Web/Atlas.Web.csproj -c Release -o /var/www/atlas-dotnet/publish

            # Restart .NET service
            sudo systemctl restart atlas-dotnet
```

### Phase 2+: Dual Deploy (Both Stacks)

```yaml
# Updated deploy.yml — both stacks in single workflow
name: Deploy Atlas Universalis

on:
  push:
    branches: ["master"]

jobs:
  deploy-legacy:
    runs-on: ubuntu-latest
    # Only build legacy if legacy files changed
    if: contains(github.event.head_commit.modified, 'atlasops/') ||
        contains(github.event.head_commit.modified, 'frontend/')
    steps:
      - uses: actions/checkout@v4
      - name: Deploy Legacy via SSH
        uses: appleboy/ssh-action@v1.0.3
        with:
          host: ${{ secrets.DROPLET_IP }}
          username: ${{ secrets.USERNAME }}
          key: ${{ secrets.SSH_KEY }}
          script: |
            cd /var/www/atlasuniversalis.com
            git pull origin master
            .venv/bin/pip install -r requirements.txt
            .venv/bin/alembic upgrade head
            cd frontend && npm ci && npm run build && cd ..
            sudo systemctl restart atlasuniversalis
            sudo systemctl restart celery-worker || true

  deploy-dotnet:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-dotnet@v4
        with:
          dotnet-version: "10.0.x"
      - run: dotnet test Atlas.sln -c Release
      - name: Deploy .NET via SSH
        uses: appleboy/ssh-action@v1.0.3
        with:
          host: ${{ secrets.DROPLET_IP }}
          username: ${{ secrets.USERNAME }}
          key: ${{ secrets.SSH_KEY }}
          script: |
            cd /var/www/atlasuniversalis.com
            git pull origin master
            dotnet publish Atlas.Web/Atlas.Web.csproj -c Release \
              -o /var/www/atlas-dotnet/publish
            sudo systemctl restart atlas-dotnet
```

### Phase 6+: Dual-Stack Parity Gate

```yaml
  parity-test:
    runs-on: ubuntu-latest
    needs: [deploy-legacy, deploy-dotnet]
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-dotnet@v4
        with:
          dotnet-version: "10.0.x"
      - name: Run parity tests
        run: dotnet test Atlas.Tests/Parity/ -c Release --logger "trx"
        env:
          PYTHON_API_URL: http://${{ secrets.DROPLET_IP }}:8000
          DOTNET_API_URL: http://${{ secrets.DROPLET_IP }}:5000
      - name: Upload parity results
        uses: actions/upload-artifact@v4
        with:
          name: parity-results
          path: "**/*.trx"
```

### Phase 7: Final Pipeline (.NET Only)

```yaml
name: Deploy Atlas Universalis

on:
  push:
    branches: ["master"]

jobs:
  build-test-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-dotnet@v4
        with:
          dotnet-version: "10.0.x"

      - name: Restore & Build
        run: dotnet build Atlas.sln -c Release

      - name: Run Tests
        run: dotnet test Atlas.sln -c Release --no-build

      - name: Deploy
        uses: appleboy/ssh-action@v1.0.3
        with:
          host: ${{ secrets.DROPLET_IP }}
          username: ${{ secrets.USERNAME }}
          key: ${{ secrets.SSH_KEY }}
          script: |
            cd /var/www/atlasuniversalis.com
            git pull origin master
            dotnet publish Atlas.Web/Atlas.Web.csproj -c Release \
              -o /var/www/atlas-dotnet/publish
            sudo systemctl restart atlas-dotnet

      - name: Smoke Test
        run: |
          sleep 10
          curl -sf https://atlasuniversalis.com/healthz || exit 1
          curl -sf https://apply.atlasuniversalis.com/healthz || exit 1
          curl -sf https://forge.atlasuniversalis.com/healthz || exit 1
```

---

## Section 5: Rollback Windows

### Phase 0

| Change | Rollback Window | Rollback Steps | Data Risk |
|--------|----------------|----------------|-----------|
| .NET SDK install on droplet | Indefinite | `sudo apt remove dotnet-sdk-10.0` | None |
| Nginx blue/green config | Indefinite | Restore `.bak` files; `sudo nginx -s reload` | None |
| systemd atlas-dotnet service | Indefinite | `sudo systemctl stop atlas-dotnet && sudo systemctl disable atlas-dotnet` | None |

### Phase 2

| Change | Rollback Window | Rollback Steps | Data Risk |
|--------|----------------|----------------|-----------|
| Main site routes → .NET | Indefinite (until Phase 7 decommission) | Edit `/etc/nginx/conf.d/route-map.conf`: set routes back to `legacy`; `sudo nginx -s reload` | None (static pages) |
| Remove frontend-main from deploy | Indefinite | Re-add `npm ci && npm run build` lines to deploy.yml | None |

### Phase 3

| Change | Rollback Window | Rollback Steps | Data Risk |
|--------|----------------|----------------|-----------|
| Apply frontend routes → .NET | Until Phase 7 decommission | Edit route-map; `sudo nginx -s reload` | None (same DB) |
| Auth handling → .NET JWT | Until Python service stopped | Route `/api/v1/auth/*` back to port 8000 | None (stateless JWT) |
| OAuth callbacks → .NET | 72 hours (Google/GitHub app settings cached) | Revert OAuth callback URLs in provider consoles; route back | Low (users may need to re-auth) |

### Phase 4

| Change | Rollback Window | Rollback Steps | Data Risk |
|--------|----------------|----------------|-----------|
| Forge routes → .NET | Until Phase 7 decommission | Route back to Astro dist in Nginx; `sudo nginx -s reload` | None (saved designs in DB unaffected) |

### Phase 5

| Change | Rollback Window | Rollback Steps | Data Risk |
|--------|----------------|----------------|-----------|
| Meridian web player live | Indefinite (new feature) | Remove `/meridian` player route; show static info page | None (new feature, no legacy data) |

### Phase 6

| Change | Rollback Window | Rollback Steps | Data Risk |
|--------|----------------|----------------|-----------|
| `/api/` → .NET on apply subdomain | Until Python decommission | Change `proxy_pass` back to `127.0.0.1:8000`; reload Nginx | None (same DB, no schema changes) |
| `/api/` → .NET on forge subdomain | Until Python decommission | Same as above | None |
| Celery → .NET BackgroundService | Until Redis/Celery decommission | `sudo systemctl start celery-worker` | Low (in-flight jobs may duplicate; add idempotency keys) |

### Phase 7

| Change | Rollback Window | Rollback Steps | Data Risk |
|--------|----------------|----------------|-----------|
| Python service decommission | 30 days (legacy branch preserved) | `git checkout legacy; .venv/bin/pip install -r requirements.txt; sudo systemctl start atlasuniversalis` | None (DB unchanged) |
| Celery decommission | 30 days | `sudo systemctl start celery-worker` | Low |
| Legacy file cleanup | 30 days (branch archived) | `git checkout legacy` to restore files | None |

---

## Section 6: Validation Gates

| Gate ID | Gate Name | Pass Criteria | Required Sign-off |
|---------|-----------|---------------|-------------------|
| G0→1 | Infrastructure Ready | `.NET build green on CI; Kestrel responds on :5000; Nginx blue/green toggles one test route successfully; EF Core reads from prod DB` | Project lead |
| G1→2 | UIKit Complete | `All 12+ components have bUnit tests passing; /showcase page renders all components; visual review against concept art approved` | Project lead + design review |
| G2→3 | Main Site Live | `All main-site routes serve from .NET; screenshot diff < 5% vs legacy; SEO meta tags present; dev portal fully functional; 24h error rate = 0` | Project lead |
| G3→4 | Apply Auth Live | `Login/register/OAuth/dashboard/profile/applications/admin all functional via .NET; JWT cross-validation passes; existing mobile/extension clients unaffected` | Project lead + security review |
| G4→5 | Forge Live | `Forge loads via .NET; component browser lists all UIKit components; canvas drag-drop works; code export produces valid output; < 3s load time` | Project lead |
| G5→6 | Meridian Web Viable | `Meridian Player loads .atlas files in browser; slide navigation works; export produces valid output; decision doc on Avalonia WASM vs Blazor committed` | Project lead |
| G6→7 | API Parity | `100% parity test pass rate across all non-ElectraCast endpoints; .NET background jobs produce identical output to Celery for 7-day shadow run; all subdomains functional with .NET API backend` | Project lead + QA |
| G7→Done | Decommission Safe | `48-hour burn-in complete; error rate < 0.1%; p99 < 500ms; no Python processes serving traffic; legacy branch archived; documentation updated` | Project lead |

---

## Section 7: Production Cutover Sequence

### 7.1 Preparation (Day Before Cutover)

1. **Verify .NET service is running** on droplet:
   ```bash
   sudo systemctl status atlas-dotnet
   curl -s http://127.0.0.1:5000/healthz
   ```

2. **Backup current Nginx configs**:
   ```bash
   sudo cp -r /etc/nginx/sites-available /etc/nginx/sites-available.bak-$(date +%Y%m%d)
   ```

3. **Verify latest code is deployed**:
   ```bash
   cd /var/www/atlasuniversalis.com && git log -1 --oneline
   ```

### 7.2 Nginx Configuration Changes

#### Route Map File (`/etc/nginx/conf.d/atlas-route-map.conf`)

```nginx
# Phase 2 cutover: Main site routes
map $request_uri $main_backend {
    default                     dotnet;    # Was: legacy
}

# Phase 3 cutover: Apply routes
map $request_uri $apply_frontend_backend {
    default                     dotnet;    # Was: legacy
}

map $request_uri $apply_api_backend {
    default                     dotnet;    # Was: legacy (Phase 6)
}

# Phase 4 cutover: Forge routes
map $request_uri $forge_backend {
    default                     dotnet;    # Was: legacy
}
```

#### Upstream Definitions (`/etc/nginx/conf.d/atlas-upstreams.conf`)

```nginx
upstream atlas_legacy {
    server 127.0.0.1:8000;
}

upstream atlas_dotnet {
    server 127.0.0.1:5000;
}
```

#### Modified Location Blocks

For each subdomain config, the key `location /` and `location /api/` blocks change:

**`atlasuniversalis.com` (main site)**:
```nginx
location / {
    # Phase 2: Switch from static files to Kestrel proxy
    proxy_pass http://atlas_dotnet;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}
```

**`apply.atlasuniversalis.com`**:
```nginx
location /api/ {
    # Phase 6: Switch from Python to .NET
    proxy_pass http://atlas_dotnet;
    # ... (same proxy headers)
}

location / {
    # Phase 3: Switch from Vue SPA to Blazor
    proxy_pass http://atlas_dotnet;
    # ... (same proxy headers)
}
```

**`forge.atlasuniversalis.com`**:
```nginx
location / {
    # Phase 4: Switch from Astro to Blazor
    proxy_pass http://atlas_dotnet;
    # ... (same proxy headers)
}

location /api/ {
    # Phase 6: Switch from Python to .NET
    proxy_pass http://atlas_dotnet;
    # ... (same proxy headers)
}
```

### 7.3 DNS/Subdomain Changes

**No DNS changes required.** All subdomains already point to the same droplet IP. The cutover is entirely at the Nginx proxy layer.

Existing DNS records (no changes):
- `atlasuniversalis.com` → Droplet IP (A record)
- `www.atlasuniversalis.com` → Droplet IP (A record)
- `apply.atlasuniversalis.com` → Droplet IP (A record)
- `forge.atlasuniversalis.com` → Droplet IP (A record)

SSL certificates (Let's Encrypt) remain valid — same domain, same server.

### 7.4 Service Start/Stop Sequence

Execute in this exact order:

```bash
# 1. Ensure .NET is running and healthy
sudo systemctl start atlas-dotnet
sleep 5
curl -sf http://127.0.0.1:5000/healthz || { echo "ABORT: .NET not healthy"; exit 1; }

# 2. Apply new Nginx configuration
sudo nginx -t || { echo "ABORT: Nginx config invalid"; exit 1; }
sudo nginx -s reload

# 3. Verify traffic flows through .NET
curl -sf https://atlasuniversalis.com/healthz || { echo "WARN: main site issue"; }
curl -sf https://apply.atlasuniversalis.com/healthz || { echo "WARN: apply issue"; }
curl -sf https://forge.atlasuniversalis.com/healthz || { echo "WARN: forge issue"; }

# 4. After 48-hour burn-in (Phase 7 only):
sudo systemctl stop atlasuniversalis
sudo systemctl disable atlasuniversalis
sudo systemctl stop celery-worker
sudo systemctl disable celery-worker
```

### 7.5 Smoke Test Checklist Per Route

| Route | Method | Expected | Check |
|-------|--------|----------|-------|
| `GET /` (main) | GET | 200, HTML contains `<title>Atlas Universalis` | Content renders |
| `GET /meridian` (main) | GET | 200, Meridian info page | Content renders |
| `GET /dev` (main) | GET | 200, Login form | Form present |
| `GET /dev/dashboard` (main) | GET | 200 or 401 | Auth gate works |
| `GET /login` (apply) | GET | 200, Login form | Fields render |
| `POST /api/v1/auth/login` (apply) | POST | 200 with JWT or 401 | Auth works |
| `GET /dashboard` (apply) | GET | 200 with auth, 401 without | Auth gate works |
| `GET /applications` (apply) | GET | 200, application list | Data loads |
| `GET /profile` (apply) | GET | 200 with auth | Profile loads |
| `GET /admin` (apply) | GET | 200 admin-only, 403 for non-admin | RBAC works |
| `GET /` (forge) | GET | 200, Forge UI | Playground loads |
| `GET /api/v1/dev/status` | GET | 200, JSON response | API functional |
| `GET /api/v1/meridian/maps` | GET | 200, JSON response | API functional |
| `GET /healthz` (all subdomains) | GET | 200 | Service alive |

### 7.6 Monitoring & Alerting Setup

1. **Systemd watchdog** (add to `atlas-dotnet.service`):
   ```ini
   [Service]
   WatchdogSec=30
   Restart=on-failure
   RestartSec=5
   ```

2. **Liveness probe cron** (`/etc/cron.d/atlas-healthcheck`):
   ```cron
   * * * * * root curl -sf https://atlasuniversalis.com/healthz > /dev/null || systemctl restart atlas-dotnet && echo "$(date) atlas-dotnet restarted" >> /var/log/atlas-healthcheck.log
   ```

3. **Log monitoring** — Kestrel logs via journald:
   ```bash
   # Watch for errors in real-time
   journalctl -u atlas-dotnet -f --grep="ERROR|CRITICAL"

   # Check error rate over last hour
   journalctl -u atlas-dotnet --since "1 hour ago" --grep="ERROR" | wc -l
   ```

4. **Disk usage alert** (`/etc/cron.d/atlas-disk-check`):
   ```cron
   0 */6 * * * root df / --output=pcent | tail -1 | tr -dc '0-9' | awk '{if($1>85) system("echo DISK WARNING | mail -s atlas-alert admin@atlasuniversalis.com")}'
   ```

---

## Section 8: Resource & Timeline Summary

### Total Estimated Effort

| Phase | Person-Days | Notes |
|-------|-------------|-------|
| Phase 0 | 6.25 | Infrastructure + solution scaffolding |
| Phase 1 | 10.5 | Blazor UIKit component library |
| Phase 2 | 12.75 | Main site + dev portal (10 pages) |
| Phase 3 | 18 | Auth + Apply surface (11 views + 3 stores) |
| Phase 4 | 17 | Forge rebuild (12 components) |
| Phase 5 | 19 | Meridian web delivery (highest uncertainty) |
| Phase 6 | 26.25 | API migration (9 modules + workers + services) |
| Phase 7 | 7.5 | Cutover + decommission |
| **Total** | **~117 person-days** | |

> Note: ~20% contingency buffer recommended → **~141 person-days adjusted**.

### Recommended Team Size

| Scenario | Team | Calendar Duration | Notes |
|----------|------|-------------------|-------|
| Solo developer | 1 full-time | ~28 weeks (7 months) | Phases strictly sequential |
| Optimal | 2 developers | ~16 weeks (4 months) | Dev A: UI/Frontend, Dev B: API/Infra |
| Accelerated | 3 developers | ~12 weeks (3 months) | Add dedicated Meridian developer |

### Calendar Timeline with Milestones

Assuming **2 developers starting Week 1 (March 2026)**:

| Week | Dates | Milestone | Gate |
|------|-------|-----------|------|
| 1–2 | Mar 2–13 | Phase 0 complete: .NET builds, blue/green ready | G0→1 |
| 3–4 | Mar 16–27 | Phase 1 complete: UIKit library with showcase | G1→2 |
| 5–7 | Mar 30–Apr 17 | Phase 2 complete: Main site live on .NET | G2→3 |
| 7–10 | Apr 14–May 8 | Phase 3 complete: Apply auth + views live | G3→4 |
| 10–13 | May 11–Jun 5 | Phase 4 complete: Forge live on .NET | G4→5 |
| 10–14 | May 11–Jun 12 | Phase 5 complete: Meridian web player | G5→6 |
| 14–18 | Jun 15–Jul 10 | Phase 6 complete: All APIs on .NET | G6→7 |
| 18–19 | Jul 13–Jul 24 | Phase 7 complete: Legacy decommissioned | G7→Done |

**Target completion: Late July 2026**

### Infrastructure Budget

| Item | Cost | Timing |
|------|------|--------|
| DigitalOcean droplet (existing) | $0 additional (current plan sufficient) | Ongoing |
| RAM upgrade if .NET + Python dual-stack strains memory | ~$10-20/mo upgrade to 4GB droplet if on 2GB | Phase 2–6 (temporary) |
| Domain/SSL (existing Let's Encrypt) | $0 | Ongoing |
| GitHub Actions (existing free tier) | $0 (under 2000 min/month for private repo) | Ongoing |
| **Total additional infrastructure cost** | **$0–$120** (only if RAM upgrade needed for 6 months) | |

### Key Assumptions

1. PostgreSQL schema is stable; no breaking migrations planned during rebuild.
2. ElectraCast remains on its current stack and is excluded from all phases.
3. The existing DigitalOcean droplet has sufficient CPU/RAM for dual-stack during transition (monitor during Phase 2+; upgrade if needed).
4. No third-party API contracts (Stripe, Google OAuth, etc.) change during the migration window.
5. The `.NET 10` SDK is GA and stable by the time Phase 0 begins.

---

*End of Delivery & Cutover Plan*
