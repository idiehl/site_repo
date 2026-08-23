# Atlas Apply API Map (Legacy to C#)

This document maps the known Atlas Apply API surface from legacy sources to the new C# rebuild target.

## Source of Truth

- Legacy archive root: `D:/www/legacy/atlasuniversalis-legacy-20260307-080256`
- Primary legacy backend behavior: `atlasops/api/v1/*.py` (FastAPI)
- Existing C# route scaffolding from legacy archive: `src/Atlas.Api/Endpoints/*.cs`
- Existing C# route maps in current repo:
  - `deploy/nginx/atlas-apply.conf`
  - `deploy/nginx/atlas-route-map.conf`

## Runtime Route Expectations to Preserve

- `apply.atlasuniversalis.com/healthz` -> C# Apply host (`127.0.0.1:5010`)
- `apply.atlasuniversalis.com/_blazor` -> C# Apply host (`127.0.0.1:5010`)
- `apply.atlasuniversalis.com/api/*` -> C# Apply API (final cutover target)
- `apply.atlasuniversalis.com/uploads/*` -> static uploads path
- `apply.atlasuniversalis.com/atlas-apply-extension.zip` -> extension package download

## Domain Endpoint Groups (Parity Targets)

### Auth and Identity

Legacy origin:
- `atlasops/api/v1/auth.py`

Expected operations:
- register
- login
- refresh token/session
- logout
- forgot/reset password
- OAuth callback flows (Google, LinkedIn)

C# target:
- `/api/v2/auth/*` in `Atlas.Apply` host
- Cookie/session first, optional JWT only for extension/client integrations

### Profile and Resume

Legacy origin:
- `atlasops/api/v1/profile.py`
- services under `atlasops/services/` for parsing/generation

Expected operations:
- create/update user profile
- upload and manage resume assets
- parse and normalize resume data

C# target:
- `/api/v2/profile/*`

### Job Ingestion and Processing

Legacy origin:
- `atlasops/api/v1/jobs.py`
- scraping and generation services (`scraper.py`, `llm_client.py`, resume/cover services)
- worker tasks under `atlasops/workers/`

Expected operations:
- ingest jobs from manual input and extension payloads
- normalize posting data
- generate AI-assisted drafts (cover letter, summaries)
- queue background processing

C# target:
- `/api/v2/jobs/*`
- async processing via background queue/hosted services

### Application Tracking

Legacy origin:
- `atlasops/api/v1/applications.py`

Expected operations:
- CRUD application records
- status pipeline transitions
- event timeline logging

C# target:
- `/api/v2/applications/*`

### Billing and Entitlements

Legacy origin:
- `atlasops/api/v1/billing.py`

Expected operations:
- subscription checkout/session
- webhook handling
- entitlement checks

C# target:
- `/api/v2/billing/*`

### Admin and Analytics

Legacy origin:
- `atlasops/api/v1/admin.py`
- analytics models under `atlasops/models/analytics.py`

Expected operations:
- user/admin summaries
- security/admin actions
- analytics snapshots

C# target:
- `/api/v2/admin/*`

## Initial C# Endpoint Milestones

1. Health + auth registration/login + session validation.
2. Extension ingestion endpoint with payload persistence.
3. Profile CRUD and application CRUD.
4. Job processing queue endpoints and status checks.
5. Billing webhook and entitlement gate.

## Open Contract Items to Verify During Rebuild

- Exact request/response schema differences between `v1` (FastAPI) and legacy `v2` C# contracts.
- OAuth callback route compatibility with current production provider settings.
- Extension auth handshake (session cookie vs token-based).
