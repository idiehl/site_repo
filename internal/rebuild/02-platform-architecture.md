# Atlas Rebuild Platform Architecture (Finalized Direction)

## Decision Summary

Atlas Universalis standardizes on:

- **Client:** Blazor WebAssembly
- **Backend:** ASP.NET Core APIs
- **Identity-first platform:** shared auth/profile capabilities consumed by every future app
- **Ops model:** Nginx + systemd + route-map cutover until legacy decommission is complete

## Target Topology

### Planned Logical Components

- `Atlas.Web.Client` (Blazor WASM)
  - Public landing page and future public sections
  - Auth/profile onboarding entry points
  - Shared design system + token usage
- `Atlas.Platform.Api` (ASP.NET Core API)
  - Auth endpoints, profile endpoints, and cross-app API foundation
  - Health and readiness endpoints for operations
- `Atlas.Platform.Application` (business use cases)
- `Atlas.Platform.Domain` (core entities/value objects)
- `Atlas.Platform.Infrastructure` (data persistence, email, external integrations)
- `Atlas.Platform.Contracts` (DTOs and shared contracts for API/client boundary)

## Hosting Model

- Preferred deployment shape for phase execution:
  - API hosted behind Nginx on existing `.NET` upstream pattern.
  - WASM static assets served by ASP.NET Core host or Nginx static pass-through.
  - Preserve `/healthz` on host and API entry points.
- Nginx route map remains source-of-truth for cutover and rollback until full legacy retirement.

## Identity/Profile Service Boundaries

### Auth Boundary

Auth service owns:

- account registration
- sign-in/sign-out
- password reset and recovery workflows
- token/session issuance and refresh

Suggested endpoint surface (versioned):

- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`
- `POST /api/v1/auth/logout`
- `POST /api/v1/auth/refresh`
- `POST /api/v1/auth/password/forgot`
- `POST /api/v1/auth/password/reset`

### Profile Boundary

Profile service owns:

- user identity profile (display name, bio, avatar URL)
- preferences (theme, locale, notification preferences)
- profile completion state for onboarding

Suggested endpoint surface:

- `GET /api/v1/me`
- `PATCH /api/v1/me`
- `GET /api/v1/me/preferences`
- `PUT /api/v1/me/preferences`

### Shared Rules

- `Auth` owns credentials and session security.
- `Profile` owns user-facing identity metadata.
- Public and future app modules must not bypass these boundaries.

## Security and Session Strategy

- Short-lived access tokens + rotating refresh tokens.
- Refresh token in secure, HTTP-only cookie.
- CSRF protections for cookie-based flows.
- Centralized authorization policies in API layer (roles/claims/scopes as needed).

## Migration Path From Current Placeholder

1. Keep `Atlas.Web` available as stable host with `/healthz`.
2. Add client/app layers incrementally without disrupting route-map rollback controls.
3. Remove Blazor Server-specific dependency (`/_blazor` path requirements) after full WASM cutover.
4. Retire legacy upstream when production traffic and rollback windows are complete.

## Architecture Exit Criteria (Phase 0 Complete)

- Topology and project boundaries accepted.
- Auth/profile API contracts drafted and versioned.
- Landing page consumes shared token system.
- Deployment runbook addendum exists for WASM + API route behavior.
