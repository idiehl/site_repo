# ASP.NET Identity Migration Decision (Phase 3)

- Date: 2026-02-22
- Status: Accepted
- Scope: `apply.atlasuniversalis.com` authentication during Phase 3 cutover

## Context

Atlas Apply is running a coexistence period where:

- frontend traffic is moving to Blazor (`:5010`)
- API traffic still targets legacy `/api/v1/*` handlers
- multiple clients (web, extension, and existing integrations) rely on current JWT contracts and claims

A full ASP.NET Identity migration is possible, but it would require:

- user/account schema migration and password hash migration strategy
- token issuance contract changes (or a compatibility layer)
- additional rollout risk while frontend and API cutovers are already in progress

## Options Considered

1. **Adopt ASP.NET Identity now (Phase 3)**  
   Pros: standard framework primitives, built-in account workflows.  
   Cons: high migration risk, parallel token models, extra scope during active route cutover.

2. **Keep JWT-only compatibility model for Phase 3**  
   Pros: preserves existing token behavior and client compatibility, minimizes auth regression risk.  
   Cons: postpones Identity-specific features and cleanup.

## Decision

For Phase 3, **keep the current JWT-only compatibility model** and do **not** adopt ASP.NET Identity yet.

## Rationale

- Protects login/OAuth continuity while Blazor routes are being migrated.
- Avoids introducing dual-auth complexity during blue/green traffic switching.
- Keeps extension and existing `/api/v1/*` clients unaffected.
- Separates "platform migration" risk from "identity model redesign" risk.

## Consequences

- Current auth flow remains token-centric with existing claims shape.
- Auth improvements continue through `AuthenticationStateProvider` + route policies in Blazor.
- Identity migration is deferred to a dedicated post-cutover phase.

## Revisit Criteria

Re-evaluate adoption of ASP.NET Identity after:

1. Phase 6 API cutover is stable (v2 serving all auth traffic),
2. seven-day zero-critical-auth-regression window is achieved, and
3. extension/mobile token compatibility requirements are fully mapped.
