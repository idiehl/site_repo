# Phase 3 Readiness Report

Date: 2026-02-22  
Scope: Atlas Apply migration tasks P3-14 through P3-18 and post-port stabilization

## What Was Validated

- `dotnet test AtlasUniversalis.sln` completed with no test failures.
- `dotnet build src/Atlas.Apply/Atlas.Apply.csproj` completed cleanly after fixes.
- Local smoke run on `http://127.0.0.1:5620` verified:
  - `/` redirects to `/login`.
  - Protected routes redirect unauthenticated users to login with `redirect` query:
    - `/dashboard`
    - `/applications`
    - `/profile`
    - `/admin`
  - Public extension route renders:
    - `/extension`
  - Blazor bootstrap and SignalR negotiation are healthy:
    - `/_framework/blazor.web.*.js` returns `200`
    - `/_blazor/negotiate` returns `200`
    - WebSocket upgrade to `/_blazor` returns `101`
- Live token-path probe on `https://apply.atlasuniversalis.com` verified:
  - newly registered test user could login through `/api/v1/auth/login` and call `/api/v1/auth/me`, `/api/v1/jobs`, `/api/v1/applications` (`200`)
  - same token failed on `/api/v2/auth/me` and `/api/v2/jobs` (`401`)

## Fixes Applied During Readiness Pass

1. **Protected route regression**
   - Symptom: direct navigation to protected pages returned `401` main-frame responses (blank page).
   - Cause: endpoint-level `[Authorize]` attributes conflict with localStorage JWT model in this phase.
   - Resolution: removed endpoint-level page attributes and retained client-side route/token gating.

2. **Blazor script bootstrap failure**
   - Symptom: framework script returned `404`/`500` in local production-mode run.
   - Cause: static web assets were not enabled for this runtime mode.
   - Resolution:
     - switched asset references to `@Assets[...]` in `App.razor`,
     - mapped static assets in `Program.cs`,
     - enabled static web assets loading via `builder.WebHost.UseStaticWebAssets()`.

3. **JWT configuration precedence bug**
   - Symptom: live legacy-issued token succeeded on `/api/v1/*` but failed on `/api/v2/*` with `Could not validate credentials`.
   - Cause: .NET JWT settings resolution favored class defaults over environment variables, preventing `SECRET_KEY` and expiry env values from being honored.
   - Resolution: updated `JwtAuthenticationExtensions.ResolveJwtSettings` to prefer explicit config/env keys (`JwtSettings:*`, `SECRET_KEY`, `ACCESS_TOKEN_EXPIRE_MINUTES`, `REFRESH_TOKEN_EXPIRE_DAYS`) with sane fallbacks.

4. **.NET auth v2 endpoint stubs**
   - Symptom: `/api/v2/auth` core handlers were placeholders, preventing reliable .NET-token issuance for dual-stack validation.
   - Resolution: implemented concrete `/api/v2/auth/register`, `/api/v2/auth/login`, and `/api/v2/auth/me` behavior (password-hash verification, token issuance, and current-user response) to enable post-deploy gate re-run.

## Phase 3 Task Status (Current Branch)

- P3-14: Auth state provider migration - **implemented**
- P3-15: Applications store migration to scoped service - **implemented**
- P3-16: Jobs store migration to scoped service - **implemented**
- P3-17: Apply frontend route-map cutover to .NET - **implemented in deploy map**
- P3-18: Identity migration decision document - **implemented** (`JWT-only for Phase 3`)

## Open Risks / Follow-up

- Some non-API test projects currently report "No test is available" (infrastructure issue, not failure).
- Full authenticated journey still needs staging-level verification with real backend credentials and data:
  - login/register/OAuth end-to-end
  - ingest -> job detail -> application updates
  - admin overview/analytics/security with live API responses
- Live OAuth providers are currently not configured on `apply.atlasuniversalis.com` (`Google OAuth not configured`, `LinkedIn OAuth not configured` observed from login page start-flow checks).
- Live `/api/v2/auth/login` and `/api/v2/auth/register` currently return `500`, so .NET-token issuance validation must be repeated after deploying the latest auth endpoint fixes.
- Promotion gate summary and current go/no-go status are tracked in `docs/architecture/Phase3_Promotion_Gates_2026-02-22.md`.
