# Atlas Apply — Overview

## Concept
Atlas Apply is an AI-powered job application management platform that ingests job postings,
generates tailored resumes, tracks applications, and provides interview prep.

## Long-Term Goals
- End-to-end application workflow automation.
- High-quality resume and cover letter generation with personalization controls.
- Analytics for application performance and feedback loops.
- Premium subscription and team plans.

## Current State
- FastAPI backend with auth, jobs, applications, profile, billing.
- Vue frontend with login, dashboard, job detail, applications, profile.
- LLM services for deep dives, resume generation, and parsing.

## Next Steps
- Improve ingestion accuracy and job normalization.
- Add refresh token support and session stability.
- Expand admin analytics and security controls.
- Production hardening for queue workers and retries.

## Phase 3 Progress
- P3-01 JWT Middleware: COMPLETE - bcrypt hashing, token factory, claim hydration
- P3-02 OAuth Integration: COMPLETE - LinkedIn/Google authorize+callback with state management
- Auth endpoint hardening: COMPLETE - all 6 stub endpoints now have real business logic
- P3-03 Blazor route migration: COMPLETE - login/register/oauth callback/dashboard/job detail/profile/applications/extension/admin moved to src/Atlas.Apply.
- P3-04 Auth state provider + route gating: COMPLETE - route authorization behavior updated for migrated Blazor pages.
- P3-05 Apply services/state services: COMPLETE - auth/admin/profile/applications/jobs service layer established for Apply.
- P3-06 Deploy map switch: COMPLETE - deploy/nginx/atlas-route-map.conf apply_frontend_backend default switched to atlas_dotnet_apply.
- P3 governance artifacts: COMPLETE - Identity_Migration_Decision.md, Phase3_Readiness_Report_2026-02-22.md, and Phase3_Promotion_Gates_2026-02-22.md added under docs/architecture.
