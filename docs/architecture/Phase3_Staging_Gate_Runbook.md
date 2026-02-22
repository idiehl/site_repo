# Phase 3 Staging Gate Runbook

Date: 2026-02-22  
Purpose: close remaining NO-GO promotion gates with reproducible evidence

Current blocker observed on live site:

- Login start-flow currently reports `Google OAuth not configured` and `LinkedIn OAuth not configured`.  
  Configure provider credentials/redirects before attempting OAuth gate closure.
- `/api/v2/auth/login` and `/api/v2/auth/register` currently return `500` on live.
  Deploy the latest auth endpoint and JWT-config fixes before final dual-stack validation.

## Remaining Gates

- `oauth_roundtrip_pass`
- `jwt_dual_stack_compatibility_pass`
- `ci_green_for_batch`

## 1) OAuth Roundtrip (Google + LinkedIn)

Execute on staging environment where OAuth secrets and redirect URIs are configured.

Steps:

1. Open `/login`.
2. Click **Continue with Google**.
3. Complete provider auth and return to `/oauth/callback`.
4. Verify redirect to `/dashboard` and authenticated API traffic succeeds.
5. Repeat with **Continue with LinkedIn**.

Evidence to capture:

- Screenshot/video of provider redirect -> callback -> dashboard.
- Browser network logs:
  - callback URL reached without error query
  - authenticated API request returns `200` after callback
- Any server logs for callback success.

Pass criteria:

- Both providers complete callback without blank/error state.
- Session behaves as authenticated immediately after callback.

## 2) JWT Dual-Stack Compatibility

Goal: prove coexistence safety while API traffic remains mixed during migration.

Steps:

1. Obtain a legacy-issued token (current Python auth path).
2. Call a protected API endpoint with that token (`/api/v1/...`) and verify `200`.
3. Obtain a .NET-issued token through migrated auth flow.
4. Call the same protected endpoint(s) with .NET token and verify `200`.
5. Confirm key claims shape required by current clients remains compatible.
6. Confirm .NET runtime reads the same JWT secret/expiry settings as legacy (`SECRET_KEY`, expiry envs); deploy JWT-config precedence fix before final gate run if needed.
7. Confirm `/api/v2/auth/login` and `/api/v2/auth/me` are running non-stub logic on the target environment before capturing final gate evidence.

Recommended endpoint set:

- current user endpoint
- jobs list/detail endpoint
- applications endpoint

Evidence to capture:

- Curl/Postman request logs (status + response snippets) for both token types.
- Claim payload comparison (decoded token body, sensitive values redacted).

Pass criteria:

- Both token types authorize required protected endpoints.
- No client-breaking claim contract differences.

## 3) CI Green For Batch

Steps:

1. Ensure branch with Phase 3 changes is pushed.
2. Confirm required CI workflows complete successfully.
3. Capture run URLs and final statuses.

Evidence to capture:

- Workflow name + run URL + terminal status (`success`).
- Timestamp and commit SHA for each required workflow.

Pass criteria:

- All required workflows for this batch are green.
- No in-progress/unknown/failure workflow for the promotion set.

## 4) Final Gate Packet Update

After collecting evidence, update:

- `docs/architecture/Phase3_Promotion_Gates_2026-02-22.md`

Set each gate to `pass` only when evidence is attached.  
Promotion decision becomes **GO** only when all required gates are `pass`.
