# Phase 3 Promotion Gates

Date: 2026-02-22  
Batch Scope: Apply migration completion pass (P3-14 through P3-18)

## Gate Results

| Gate | Status | Evidence | Notes |
|---|---|---|---|
| `oauth_roundtrip_pass` | `fail` | Live check at `https://apply.atlasuniversalis.com/login`: Google and LinkedIn start-flow buttons return in-page errors | Observed messages: `Google OAuth not configured` and `LinkedIn OAuth not configured`; no provider callback roundtrip possible |
| `jwt_dual_stack_compatibility_pass` | `fail` | Live legacy token validation succeeded on `/api/v1/auth/me`, `/api/v1/jobs`, `/api/v1/applications` (`200`), but the same token failed on `/api/v2/auth/me` and `/api/v2/jobs` (`401`); additionally, live `/api/v2/auth/login` and `/api/v2/auth/register` currently return `500` | Confirms current live environment is not dual-stack compatible yet; JWT config precedence fix + concrete `/api/v2/auth` login/register/me handlers are implemented locally, but deploy verification is pending |
| `protected_route_enforcement_pass` | `pass` | Live unauthenticated route checks redirect correctly to login with `redirect` query | Verified on `https://apply.atlasuniversalis.com` for `/dashboard`, `/applications`, `/profile`, `/admin` |
| `ci_green_for_batch` | `fail` | Public GitHub Actions API shows latest `master` deploy workflows are green, but this local migration batch has no pushed branch/run evidence | Recent success examples: runs `22266098140`, `22266098139`, `22265539588`; gate remains fail until batch-specific CI evidence exists |
| `docs_sync_ready` | `pass` | Decision + readiness + gate docs updated in repo | Includes identity decision and readiness artifacts |

## Promotion Decision

**NO-GO**

Promotion remains blocked until these gates are moved to `pass` with trustworthy evidence:

1. `oauth_roundtrip_pass`
2. `jwt_dual_stack_compatibility_pass`
3. `ci_green_for_batch`

## Required Next Verifications

1. Execute real Google/LinkedIn OAuth roundtrip in staging and confirm callback/token persistence path.
2. Deploy latest JWT + `/api/v2/auth` endpoint fixes, confirm `/api/v2/auth/login` and `/api/v2/auth/register` return non-500 responses, then re-run cross-check: legacy token on `/api/v1/*` and `/api/v2/*`, plus .NET-issued token on both stacks.
3. Push this migration batch to a remote branch and capture successful workflow runs for that branch/commit.

Detailed execution guidance is captured in `docs/architecture/Phase3_Staging_Gate_Runbook.md`.
