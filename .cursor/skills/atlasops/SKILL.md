# AtlasOps — Cursor Agent Rules (Project-Specific)

You are the Cursor IDE coding agent for **AtlasOps**, an AI-powered job application management and resume generation platform that is being built **inside** an existing site repo currently running:
- **FastAPI + Jinja2** (server-rendered HTML + JSON APIs)
- **PostgreSQL** (existing `pages` table for content)
- **Vue 3 + Vite** (currently used for nav injection)
- **DigitalOcean droplet** + **Nginx reverse proxy** + **systemd** service + GitHub Actions SSH deploy

Your job is to help implement AtlasOps incrementally without breaking the existing site.

---

## 0) North Star

Build an end-to-end workflow:
1) User saves job posting URL(s) → system extracts structured job data → creates dashboard entry
2) System produces “Company Deep Dive” + role summary tailored to user goals
3) User builds/enhances profile (work history, skills, education, projects)
4) System generates job-tailored resumes from templates (PDF/DOCX export)
5) Track application lifecycle, reminders, follow-ups
6) If interview → generate interview prep sheet
7) If rejected/timeout → generate gap analysis + improvement plan + practice project ideas

---

## 1) Non-Negotiable Guardrails

### Preserve the existing website
- **Do not break** the current public routes: `/` and `/pages/{slug}`.
- Treat the existing `pages` table as **read-only content storage** unless explicitly asked to change it.
- Any AtlasOps UI should live under a new route namespace (e.g., `/app` or `/atlasops`) and new APIs under `/api/v1/...`.

### Security + privacy
- Never hardcode secrets. Use env vars (`OPENAI_API_KEY`, `DATABASE_URL`, etc).
- Do not log sensitive user data (resume content, PII, job application notes) at INFO level.
- Add rate limiting for auth + URL ingestion endpoints.
- Sanitize user-supplied URLs; block SSRF (no internal IPs, no file://, no localhost).
- Treat all external HTML as untrusted; sanitize before rendering or storing as HTML.

### Scraping ethics / ToS
- Respect robots.txt and target site ToS.
- Do **not** implement paywall/captcha bypass.
- When a source cannot be legally/reliably fetched, fall back to user-provided inputs and/or public sources.

### Incremental delivery
- Prefer small, reversible PR-sized changes.
- Add new modules and routers instead of rewriting `app.py` in one go.

---

## 2) Repo & Architecture Conventions

### Backend (Python/FastAPI) — required patterns
- Keep `app.py` as the entrypoint, but move AtlasOps into a package:
  - `atlasops/`
    - `api/` (FastAPI routers)
    - `models/` (SQLAlchemy models)
    - `schemas/` (Pydantic request/response models)
    - `services/` (business logic: scraping, LLM, PDF generation)
    - `workers/` (background tasks)
    - `prompts/` (versioned prompt templates + JSON schemas)
    - `utils/` (shared helpers: url validation, sanitization, etc.)
- Prefer **async** end-to-end (FastAPI async routes, async SQLAlchemy sessions, async HTTP).
- Add **Alembic** migrations for any new tables (do not hand-edit schema on prod).

### Frontend — recommended approach
- Prefer continuing with **Vue 3 + Vite** for the app UI (dashboard/profile/resume builder).
- Use:
  - Vue Router (app routes)
  - Pinia (state)
  - Fetch/Axios client with auth handling
- Serve the app at `/app` (single-page) while keeping marketing/content pages intact.

### Deployment constraints
- Assume production runs on a DigitalOcean droplet behind Nginx.
- Any build steps must fit the existing GitHub Actions deploy pattern (SSH pull + restart).
- If frontend requires a build, ensure the deploy workflow builds or ships built assets.

---

## 3) Data Model Rules (PostgreSQL)

### New tables (AtlasOps domain)
Design around these core entities (names can vary, but keep the concepts):
- `users` (auth, subscription tier)
- `user_profiles` (normalized or JSON fields for work history, education, projects, skills)
- `job_postings` (raw URL, extracted structured fields, raw_text snapshot, hash, timestamps)
- `company_deep_dives` (structured summary + sources metadata + timestamps)
- `generated_resumes` (content JSON + rendered file path + match score + template ID)
- `applications` (status machine + timestamps + reminders + notes)
- `interview_prep` (questions, study plan, ask-the-interviewer questions)
- `improvement_suggestions` (gap analysis + recommended skills/courses/projects)

### Design rules
- Use UUID primary keys.
- Add `created_at`, `updated_at` everywhere.
- Use status enums (or constrained strings) for application lifecycle.
- Store AI outputs as:
  - structured JSON (validated) + a human-readable summary
  - include `model`, `prompt_version`, `generated_at`, `input_hash` for reproducibility
- Prefer pgvector (optional) for embeddings; if enabled, use migrations and feature flags.

---

## 4) API Rules (FastAPI)

### Namespacing
- All AtlasOps APIs go under `/api/v1/...` (never mixed into existing `/api/pages`).
- Use REST-ish resources:
  - POST `/api/v1/jobs/ingest` (accept URL list)
  - GET `/api/v1/jobs` / GET `/api/v1/jobs/{id}`
  - POST `/api/v1/profile/enhance`
  - POST `/api/v1/jobs/{id}/deep-dive`
  - POST `/api/v1/jobs/{id}/resumes` (generate resume)
  - PATCH `/api/v1/applications/{id}` (status updates, reminders)
  - POST `/api/v1/applications/{id}/followup`
  - POST `/api/v1/applications/{id}/interview-prep`
  - POST `/api/v1/applications/{id}/improvement`

### Response contract
- Every endpoint returns:
  - `data` (payload)
  - `error` (null or structured error)
  - `meta` (timings, version, pagination)
- Validate with Pydantic models.
- Use meaningful HTTP status codes.

### Background processing
- Any slow work (scrape, deep dive, resume generation, embeddings) MUST be async background job:
  - API returns `job_id` and initial status
  - client polls `/api/v1/jobs/{job_id}/status` or uses SSE/WebSocket later

---

## 5) Background Jobs & Scheduling

### Queue
- Use Redis + a job queue (Celery/RQ/Arq). Pick ONE and be consistent.
- Jobs must be idempotent:
  - dedupe by `(user_id, url_hash, job_type)` where possible
- Store job state in DB:
  - `queued`, `running`, `succeeded`, `failed`, `retrying`

### Scheduled workflows
- Follow-up reminders (3/5/7 days) and the 30-day auto-outcome update should be scheduled via:
  - a periodic scheduler (Celery beat / cron) that checks DB for due reminders
  - never rely only on in-memory timers

---

## 6) Scraping / Extraction Rules (Job Posting Analysis)

### Ingestion pipeline
For each URL:
1) Validate URL (scheme, host, block internal/private ranges)
2) Fetch content
   - First try simple HTTP GET with proper headers
   - If content is JS-rendered, fall back to Playwright
3) Extract readable text (boilerplate removal)
4) LLM parses into a strict schema:
   - company_name
   - job_title
   - job_description
   - requirements (hard/soft)
   - location / remote policy
   - pay rate (if present)
   - work hours / schedule (if present)
   - benefits (if present)
   - application instructions / deadline (if present)
5) Store structured data + raw_text snapshot + extraction confidence

### Robustness rules
- Always save the raw_text snapshot used for parsing (for debugging).
- Detect and tag partial extraction (missing pay, etc.) rather than hallucinating.
- Never invent pay rates, hours, benefits, or credentials.

---

## 7) LLM / AI Integration Rules (All Agents)

### One LLM wrapper
Create a single `atlasops/services/llm_client.py` that:
- standardizes calls across the codebase
- supports:
  - structured output (JSON schema)
  - retries with exponential backoff
  - timeouts
  - cost/token logging (aggregate only, no PII in logs)
- supports model selection per task (cheap model for extraction; stronger model for synthesis)

### Prompt-as-code
- Prompts live in `atlasops/prompts/` with versioning:
  - `job_extraction_v1.md`
  - `deep_dive_v1.md`
  - `resume_optimizer_v1.md`
  - etc.
- Each prompt must define:
  - input contract
  - output JSON schema
  - explicit “no hallucination” rules
  - citations/sources policy where relevant

### Truthfulness rules
- If data is missing, output `null`/`unknown` with a short reason.
- Prefer summarization over fabrication.
- For deep dives, store a `sources` array (URLs/identifiers) and produce summaries only.

---

## 8) Resume Generation Rules

### Separation of concerns
- “Resume content” is structured JSON (sections, bullets, skills).
- “Rendering” uses templates (HTML/CSS, DOCX, etc.) and produces files.

### Template library
- Store templates under `templates/resumes/` (or `atlasops/templates/resumes/`) with IDs.
- Templates must be ATS-friendly:
  - semantic headings
  - minimal columns/tables for ATS (or provide both ATS and “modern” variants)
- Render to PDF using a deterministic renderer:
  - preferred: HTML → PDF via server-side renderer (WeasyPrint or Playwright PDF)
  - optional: DOCX via python-docx for editable output

### Matching algorithm (v1)
- Extract job keywords and required skills.
- Rank user profile elements by relevance.
- Select top experiences/projects.
- Generate bullets with quantified impact when user data supports it.
- Return a `match_score` and a `gaps` list (missing skills).

---

## 9) Application Tracking State Machine

Supported statuses (must be consistent everywhere):
- `pending` (saved)
- `applied` (timestamp)
- `followup_scheduled`
- `interview_scheduled`
- `offer_received`
- `rejected`
- `withdrawn`
- `no_response_closed` (auto after 30 days)

Rules:
- Status changes are append-only in an `application_events` log.
- Auto-close after 30 days ONLY if still in `applied` (or equivalent) and no interview/offer update.

---

## 10) Testing & Quality Gates

### Required for backend changes
- Add/maintain unit tests (pytest) for:
  - URL validation / SSRF blocking
  - extraction schema validation
  - resume selection logic (non-LLM parts)
- For LLM tasks:
  - create “golden” fixtures with deterministic mocked responses
  - add schema validation tests

### Code quality
- Use `ruff` + `black` + `mypy` (or pyright) where possible.
- Keep functions small; explicit error handling.

---

## 11) How You (the agent) Should Respond While Coding

When the user asks to build/change something:
1) Provide a short plan (files touched, migrations, API routes)
2) Implement with minimal diffs
3) Show a clear file list + what changed
4) Include how to run locally (commands + env vars)
5) Call out any deployment considerations (migrations, new services like Redis)

Never:
- propose a full rewrite unless explicitly asked
- add a new framework when existing stack can solve it
- add “magic” without tests for critical logic

---

## 12) Default Tech Choices (unless user overrides)

- Backend: Python + FastAPI + SQLAlchemy (async) + Alembic
- DB: Postgres
- Queue: Redis + Celery (or Redis + RQ; pick one early)
- Scraping: Playwright (fallback) + plain HTTP (primary)
- Auth: JWT/cookie-based sessions (keep it simple for MVP)
- Frontend: Vue 3 + Vite + Pinia + Vue Router
- PDF: HTML templates → PDF renderer
- Storage: S3/R2-compatible bucket for generated resumes

END OF RULES
