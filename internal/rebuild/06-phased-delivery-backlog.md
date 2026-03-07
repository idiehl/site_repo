# Atlas Rebuild Phased Delivery Backlog

## Backlog Legend

- Priority: `P0` (must-have), `P1` (important), `P2` (follow-up)
- Status tracking occurs in project management tooling; this file defines execution scope.

## Phase 0 - Foundation and Alignment

Objective: lock architecture, source-of-truth, and delivery standards before major build-out.

- `P0` Ratify platform topology and project boundaries (WASM client + ASP.NET API).
- `P0` Preserve operational constraints (`/healthz`, Nginx map-based cutover, rollback playbook).
- `P0` Establish canonical design source and token workflow.
- `P1` Define telemetry/event naming for landing and onboarding.
- `P1` Write baseline acceptance criteria for landing usability/accessibility/performance.

## Phase 1 - Landing Page + Auth/Profile Onramp

Objective: ship the first high-quality public experience with account creation path.

### Landing MVP

- `P0` Build landing IA sections with production-ready responsive layout.
- `P0` Implement primary/secondary CTA paths.
- `P0` Integrate brand token styling and typography baseline.
- `P1` Add credibility/trust section and operational proof points.
- `P1` Implement analytics events for CTA and section engagement.

### Auth/Profile MVP

- `P0` Implement register/sign-in/sign-out flow contracts.
- `P0` Create profile setup shell (display name, avatar placeholder, preferences baseline).
- `P0` Protect app entry routes with authentication gate.
- `P1` Add password reset and session refresh handling.

## Phase 2 - Atlas Explorer

Objective: deliver first core utility app experience post-auth onboarding.

- `P0` Explorer shell route and navigation integration.
- `P0` API-backed data retrieval contract for explorer content.
- `P1` Saved views or lightweight personalization tied to profile identity.

## Phase 3 - Knowledge Content

Objective: publish editorial/knowledge experiences with structured content support.

- `P0` Content index and detail experience.
- `P0` Metadata and SEO standards for content pages.
- `P1` Authoring/admin workflow foundations (if CMS path chosen).

## Phase 4 - Community

Objective: introduce user interaction layers on top of stable identity platform.

- `P0` Discussion/comment architecture decision and moderation model.
- `P1` Notification preferences integrated into profile settings.
- `P1` Engagement analytics tied to account identity.

## Cross-Phase Quality Gates

- CI checks pass on build/tests.
- Accessibility and performance baselines do not regress.
- Nginx/systemd operational behavior remains rollback-safe during each release.
- Route contracts and API versioning are documented for each phase boundary.
