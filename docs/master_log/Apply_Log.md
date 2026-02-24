# Atlas Apply — Log

This log tracks changes specific to Atlas Apply (AtlasOps).

## 2026-02-01
- Initialized dedicated app log and overview in the dev portal.
- Current focus: auth stability, job ingestion quality, and AI output consistency.

## 2026-02-08
- Upgraded `jspdf` to 4.1.0 in the Atlas Apply frontend to address the npm audit vulnerability.

## 2026-02-21
- Phase 3 reconciliation: synced local with origin/master (63656e8), resolved duplicate OAuth paths, added five-agent workflow with gate enforcement.
- Phase 3 auth endpoint hardening: implemented Register, Login, GetCurrentUser, Logout, RequestPasswordReset, ConfirmPasswordReset with full business logic
- Added BCrypt.Net-Next for password hashing parity with Python passlib
- Resolved duplicate OAuth paths; canonical implementation at Authentication/OAuth/
- Commit 16eaf35 pushed to master, deploy workflows triggered
- Ported Pinia auth store: all auth calls now use /api/v2/auth/* (JSON body, .NET backend)
- Nginx cutover performed: /api/v2/ routes to .NET Kestrel on port 5010, /api/ (v1) still routes to Python
- Added JsonNamingPolicy.SnakeCaseLower for Python parity on all JSON responses
- Updated Vite dev proxy for local v2 development against .NET at localhost:5010
- All deploy workflows green for commit f72bcf8, 6/6 smoke tests pass

## 2026-02-22
- Phase 3 Blazor route migration recorded complete for login/register/oauth callback/dashboard/job detail/profile/applications/extension/admin in src/Atlas.Apply.
- Auth state provider and route gating updates documented for migrated route access control.
- New Apply services/state services documented for auth/admin/profile/applications/jobs.
- Deploy route map update documented: deploy/nginx/atlas-route-map.conf apply_frontend_backend default switched to atlas_dotnet_apply.
- Architecture governance docs scoped for this batch: Identity_Migration_Decision.md, Phase3_Readiness_Report_2026-02-22.md, Phase3_Promotion_Gates_2026-02-22.md.

## 2026-02-24
- Canonical OAuth implementation path is now `src/Atlas.Api/OAuth/`; deprecated `src/Atlas.Api/Authentication/OAuth/` was removed in reconciliation.
- Atlas Apply auth client calls were aligned to `/api/v2/auth/*` for login, register, Google/LinkedIn authorize, and current-user fetch.
- Added auth hardening in API: refresh tokens are rejected for protected-route access and malformed OAuth provider payloads now fail closed.
- Added regression tests for refresh-token rejection and invalid OAuth provider JSON handling (7/7 tests passing).
