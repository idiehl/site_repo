# Atlas Universalis — Project Overview

This document provides a comprehensive inventory of all files in the Atlas Universalis project with descriptions of their purpose.

**Last Updated:** 2026-02-09  
**Project Repository:** `github.com/idiehl/site_repo`  
**Production URL:** `atlasuniversalis.com`

---

## Project Summary

Atlas Universalis is a multi-application platform consisting of:

1. **Main Portfolio Site** (`atlasuniversalis.com`) - Company landing page showcasing projects and applications
2. **Atlas Apply** (`apply.atlasuniversalis.com`) - AI-powered job application management and resume generation platform (AtlasOps)
3. **Atlas Forge** (`forge.atlasuniversalis.com`) - UI Design Laboratory for exploring Vue and React components
4. **Browser Extension** - Chrome/Edge extension for capturing job postings
5. **ElectraCast** (`electracast.atlasuniversalis.com`) - Podcast network site rebuild

---

## Technology Stack

| Layer | Technology |
|-------|------------|
| **Backend** | Python 3.11+, FastAPI, SQLAlchemy (async) |
| **Database** | PostgreSQL |
| **Migrations** | Alembic |
| **Queue** | Redis + Celery |
| **Frontend (Main)** | Vue 3 + Vite + Tailwind CSS |
| **Frontend (Atlas Apply)** | Vue 3 + Vite + Pinia + Vue Router |
| **Frontend (Atlas Forge)** | Astro + Vue 3 + React |
| **Frontend (ElectraCast)** | React + Vite + Tailwind CSS |
| **Reverse Proxy** | Nginx |
| **Hosting** | DigitalOcean Droplet |
| **CI/CD** | GitHub Actions (SSH deploy) |

---

## Directory Structure

```
site_repo/
├── alembic/                 # Database migrations
├── atlasops/                # Atlas Apply backend application
├── deploy/                  # Deployment configurations
├── docs/                    # Documentation
├── extension/               # Browser extension (legacy location)
├── frontend/                # Atlas Apply Vue frontend
├── atlasforge/              # Atlas Forge (Astro + Vue + React)
├── frontend-main/           # Main portfolio site Vue frontend
├── electracast/             # ElectraCast site React frontend
├── internal/                # Internal assets (wireframes, logo concepts)
├── mcp/                     # Model Context Protocol server
├── quickpro-extension/      # Browser extension (current)
├── scripts/                 # Utility scripts
├── templates/               # Resume HTML templates
├── app.py                   # FastAPI application entrypoint
└── requirements.txt         # Python dependencies
```

---

## File Inventory

### Root Configuration Files

| File | Purpose |
|------|---------|
| `app.py` | FastAPI application entrypoint. Mounts AtlasOps API, serves static files, handles routing |
| `requirements.txt` | Python package dependencies |
| `alembic.ini` | Alembic migration configuration |
| `.env.example` | Environment variable template (secrets, API keys, database URL) |
| `.gitignore` | Git ignore patterns for node_modules, dist, __pycache__, .env |
| `README.md` | Project readme |
| `package-lock.json` | Root-level npm lock file |

---

### Cursor IDE Configuration: `.cursor/`

| File | Purpose |
|------|---------|
| `.cursor/mcp.json` | Local Cursor MCP config for n8n + atlasops dashboard tools |
| `.cursor/rules/` | Cursor rules for workflow tiering, subagent usage, and standard commands |
| `.cursor/skills/` | Project skills (version-logger, doc-ops, deploy-checklist, test-runner, subagent profiles) |

---

### Backend: `atlasops/`

Core Atlas Apply/AtlasOps backend application.

#### Configuration & Database

| File | Purpose |
|------|---------|
| `atlasops/__init__.py` | Package initialization |
| `atlasops/config.py` | Application configuration (env vars, settings) |
| `atlasops/db.py` | Database session management, SQLAlchemy async engine |

#### API Layer: `atlasops/api/`

| File | Purpose |
|------|---------|
| `api/__init__.py` | API package init |
| `api/deps.py` | FastAPI dependencies (auth, database sessions) |
| `api/v1/__init__.py` | V1 API package init |
| `api/v1/router.py` | Main API router, aggregates all v1 endpoints |
| `api/v1/auth.py` | Authentication endpoints (login, register, OAuth) |
| `api/v1/jobs.py` | Job posting endpoints (ingest, list, detail, deep-dive) |
| `api/v1/applications.py` | Application tracking endpoints (status updates, follow-ups) |
| `api/v1/profile.py` | User profile endpoints (resume upload, profile enhancement) |
| `api/v1/electracast.py` | ElectraCast account + profile endpoints |
| `api/v1/admin.py` | Admin dashboard endpoints (user management, analytics) |
| `api/v1/billing.py` | Subscription/billing endpoints |

#### Models: `atlasops/models/`

SQLAlchemy ORM models for database tables.

| File | Purpose |
|------|---------|
| `models/__init__.py` | Model exports |
| `models/user.py` | User model (auth, profile, subscription) |
| `models/electracast.py` | ElectraCast profile model |
| `models/job.py` | JobPosting model (scraped job data) |
| `models/application.py` | Application model (status tracking, events) |
| `models/resume.py` | GeneratedResume model (content, file paths) |
| `models/analytics.py` | Analytics/event tracking models |

#### Schemas: `atlasops/schemas/`

Pydantic models for request/response validation.

| File | Purpose |
|------|---------|
| `schemas/__init__.py` | Schema exports |
| `schemas/user.py` | User-related schemas (registration, profile, auth) |
| `schemas/electracast.py` | ElectraCast profile schemas |
| `schemas/job.py` | Job posting schemas (ingest request, job detail response) |
| `schemas/application.py` | Application schemas (status updates, events) |
| `schemas/resume.py` | Resume schemas (generation request, content structure) |

#### Services: `atlasops/services/`

Business logic layer.

| File | Purpose |
|------|---------|
| `services/__init__.py` | Service exports |
| `services/llm_client.py` | Unified LLM wrapper (OpenAI API calls, retries, logging) |
| `services/scraper.py` | Job posting scraper (HTTP + Playwright fallback) |
| `services/resume_generator.py` | Resume generation service (template rendering, PDF) |
| `services/resume_parser.py` | Resume parsing service (extract structure from uploaded resume) |
| `services/entitlements.py` | Subscription/entitlement checking |

#### Prompts: `atlasops/prompts/`

Versioned LLM prompt templates.

| File | Purpose |
|------|---------|
| `job_extraction_v1.md` | Prompt for extracting structured job data from raw text |
| `deep_dive_v1.md` | Prompt for generating company deep-dive analysis |
| `resume_optimizer_v1.md` | Prompt for optimizing resume content for job match |
| `resume_generator_v1.md` | Prompt for generating tailored resume bullets |
| `resume_parser_v1.md` | Prompt for parsing uploaded resume into structured data |
| `cover_letter_v1.md` | Prompt for generating cover letters |

#### Utilities: `atlasops/utils/`

| File | Purpose |
|------|---------|
| `utils/__init__.py` | Utility exports |
| `utils/url_validator.py` | URL validation, SSRF protection |
| `utils/sanitize.py` | HTML/text sanitization |

#### Middleware: `atlasops/middleware/`

| File | Purpose |
|------|---------|
| `middleware/__init__.py` | Middleware exports |
| `middleware/analytics.py` | Request/response analytics tracking |

#### Workers: `atlasops/workers/`

| File | Purpose |
|------|---------|
| `workers/__init__.py` | Worker exports |
| `workers/tasks.py` | Celery background tasks (scraping, resume generation) |

---

### Database Migrations: `alembic/`

| File | Purpose |
|------|---------|
| `env.py` | Alembic environment configuration |
| `script.py.mako` | Migration script template |
| `versions/20260111_0001_initial_schema.py` | Initial database schema |
| `versions/20260115_0002_add_oauth_fields.py` | OAuth provider fields |
| `versions/20260115_0003_enhance_user_profile.py` | Extended user profile fields |
| `versions/20260115_0010_add_cover_letters.py` | Cover letter table |
| `versions/20260115_0011_add_admin_and_analytics.py` | Admin/analytics tables |
| `versions/20260115_0012_add_subscription_fields.py` | Subscription tier fields |
| `versions/20260116_0001_add_job_application_status.py` | Application status enhancements |
| `versions/20260208_0014_add_electracast_profiles.py` | ElectraCast profile table |
| `versions/20260208_0015_add_password_reset_fields.py` | Password reset token fields |

---

### Atlas Apply Frontend: `frontend/`

Vue 3 SPA for the Atlas Apply application (served at `apply.atlasuniversalis.com`).

#### Configuration

| File | Purpose |
|------|---------|
| `index.html` | HTML entry point |
| `package.json` | npm dependencies and scripts |
| `vite.config.js` | Vite build configuration |
| `tailwind.config.js` | Tailwind CSS configuration |
| `postcss.config.js` | PostCSS configuration |

#### Source: `frontend/src/`

| File | Purpose |
|------|---------|
| `main.js` | Vue app initialization |
| `App.vue` | Root Vue component |
| `assets/main.css` | Global styles, Tailwind imports |

#### API Client: `frontend/src/api/`

| File | Purpose |
|------|---------|
| `client.js` | Axios HTTP client with auth interceptors |

#### Router: `frontend/src/router/`

| File | Purpose |
|------|---------|
| `index.js` | Vue Router configuration, route definitions |

#### State Stores: `frontend/src/stores/`

| File | Purpose |
|------|---------|
| `auth.js` | Pinia store for authentication state |
| `jobs.js` | Pinia store for job postings state |
| `applications.js` | Pinia store for applications state |

#### Components: `frontend/src/components/`

| File | Purpose |
|------|---------|
| `JobTable.vue` | Data table displaying job postings |
| `IngestModal.vue` | Modal for URL ingestion |
| `GenerateSection.vue` | Resume generation interface |
| `StatusBadge.vue` | Application status badge component |

#### Views: `frontend/src/views/`

| File | Purpose |
|------|---------|
| `LoginView.vue` | Login page |
| `RegisterView.vue` | Registration page |
| `OAuthCallbackView.vue` | OAuth callback handler |
| `DashboardView.vue` | Main user dashboard |
| `JobDetailView.vue` | Individual job posting detail |
| `ApplicationsView.vue` | Application tracking view |
| `ProfileView.vue` | User profile management |
| `ExtensionView.vue` | Browser extension info/download page |
| `AdminDashboardView.vue` | Admin overview dashboard |
| `AdminAnalyticsView.vue` | Admin analytics view |
| `AdminSecurityView.vue` | Admin security settings |

#### Public Assets: `frontend/public/`

| File | Purpose |
|------|---------|
| `atlas-icon.svg` | Atlas Apply app icon |
| `atlas-apply-extension.zip` | Packaged browser extension |
| `templates/*.svg` | Resume template preview images |

---

### Main Portfolio Site: `frontend-main/`

Vue 3 SPA for the main Atlas Universalis landing page (served at `atlasuniversalis.com`).

#### Configuration

| File | Purpose |
|------|---------|
| `index.html` | HTML entry point, favicon reference |
| `package.json` | npm dependencies |
| `vite.config.js` | Vite build configuration |
| `tailwind.config.js` | Tailwind CSS with custom color palette (atlas, night, gold) |
| `postcss.config.js` | PostCSS configuration |

#### Source: `frontend-main/src/`

| File | Purpose |
|------|---------|
| `main.js` | Vue app initialization |
| `App.vue` | Root component |
| `assets/main.css` | Global styles, custom animations (fadeInUp, float) |

#### Router: `frontend-main/src/router/`

| File | Purpose |
|------|---------|
| `index.js` | Route definitions (currently just home) |

#### Components: `frontend-main/src/components/`

| File | Purpose |
|------|---------|
| `NavBar.vue` | Site navigation with mobile menu |
| `HeroSection.vue` | Homepage hero with logo, tagline, CTAs, scroll indicator |
| `AppsSection.vue` | Featured applications showcase |
| `ProjectsSection.vue` | Project portfolio section |
| `AboutSection.vue` | About/company information |
| `FooterSection.vue` | Site footer with contact info |
| `DevStatusBanner.vue` | Status indicator banner for the dev portal |

#### Views: `frontend-main/src/views/`

| File | Purpose |
|------|---------|
| `HomeView.vue` | Homepage composition (assembles all sections) |

#### Public Assets: `frontend-main/public/`

| File | Purpose |
|------|---------|
| `atlas-icon.svg` | **Current logo** - Orbital Hexagon design with A letterform |
| `atlas-icon.png` | Legacy PNG icon |
| `atlas-logo.png` | Legacy banner logo |
| `profile.png` | Profile photo |
| `atlas-icon.svg` | Atlas icon |
| `logo-option-1.svg` through `logo-option-5.svg` | Logo design exploration |
| `logo-hex-1.svg` through `logo-hex-5.svg` | Hexagon logo variations |
| `logo-preview.html` | Logo comparison preview page |

---

### ElectraCast Frontend: `electracast/`

React + Vite SPA for the ElectraCast site (served at `electracast.atlasuniversalis.com`).

#### Configuration

| File | Purpose |
|------|---------|
| `index.html` | HTML entry point |
| `package.json` | npm dependencies |
| `package-lock.json` | npm lock file |
| `vite.config.js` | Vite build configuration |
| `tailwind.config.js` | Tailwind CSS configuration |
| `postcss.config.js` | PostCSS configuration |
| `tsconfig.json` | TypeScript configuration |
| `tsconfig.node.json` | TypeScript config for tooling |
| `styles.css` | Global layout styles for the ElectraCast UI |

#### Source: `electracast/src/`

| File | Purpose |
|------|---------|
| `main.tsx` | React app initialization |
| `App.tsx` | Root layout and route host |
| `routes.tsx` | Route definitions and titles |
| `assets/main.css` | Global styles, Tailwind imports |
| `components/*` | Site layout, hero, and section components |
| `pages/*` | Route views (home, podcasts, networks, etc.) |
| `pages/MyAccount.tsx` | My ElectraCast Account page with login, profile, + resources |
| `data/podcasts.ts` | Featured podcast list and directory slugs |
| `data/networks.ts` | Network directory metadata and legacy links |
| `data/*` | Structured content data modules |
| `hooks/usePageTitle.ts` | Route-aware document title logic |
| `lib/assets.ts` | Asset base URL helper |
| `lib/api.ts` | ElectraCast API client helpers |
| `vite-env.d.ts` | Vite environment typing |

---

### Browser Extension: `quickpro-extension/` (Atlas Apply Extension)

Chrome/Edge extension for capturing job postings from web pages.

| File | Purpose |
|------|---------|
| `manifest.json` | Extension manifest (permissions, scripts, icons) |
| `background.js` | Service worker for extension lifecycle |
| `content.js` | Content script injected into job posting pages |
| `content.css` | Styles for injected UI elements |
| `popup.html` | Extension popup UI |
| `popup.js` | Popup logic |
| `popup.css` | Popup styles |
| `generate_icons.py` | Script to generate icon sizes from SVG |
| `README.md` | Extension documentation |
| `icons/*.png` | Extension icons at various sizes |
| `img/*.png` | Store listing screenshots |

---

### Resume Templates: `templates/resumes/`

HTML templates for PDF resume generation.

| File | Purpose |
|------|---------|
| `basic.html` | Simple, ATS-friendly template |
| `classic.html` | Traditional professional template |
| `modern.html` | Contemporary design with accent colors |
| `creative.html` | Designer-style template |
| `executive.html` | Senior/leadership focused template |
| `simple.html` | Minimal, clean template |
| `technical.html` | Developer/engineering focused template |

---

### Deployment: `deploy/`

Nginx configurations and deployment utilities.

| File | Purpose |
|------|---------|
| `nginx-main-site.conf` | Nginx config for atlasuniversalis.com |
| `nginx-atlas-apply.conf` | Nginx config for apply subdomain |
| `nginx-quickpro.conf` | Legacy nginx config (deprecated) |
| `SETUP.md` | Deployment setup documentation |
| `clean_env.py` | Environment cleanup utility |
| `fix_env.py` | Environment fix utility |

---

### GitHub Actions: `.github/workflows/`

| File | Purpose |
|------|---------|
| `deploy.yml` | CI/CD workflow: SSH deploy on push to master |

---

### Documentation: `docs/master_log/`

| File | Purpose |
|------|---------|
| `Master_Log.md` | Chronological change history for the platform |
| `PROJECT_OVERVIEW.md` | File inventory and architecture overview |
| `pdf.css` | Stylesheet for PDF rendering of docs |
| `Apply_Log.md` | Atlas Apply change log |
| `Apply_Overview.md` | Atlas Apply project overview |
| `Apply_Checklist.md` | Atlas Apply objectives checklist |
| `Forge_Log.md` | Atlas Forge change log |
| `Forge_Overview.md` | Atlas Forge project overview |
| `Forge_Checklist.md` | Atlas Forge objectives checklist |
| `Universalis_Log.md` | Atlas Universalis change log |
| `Universalis_Overview.md` | Atlas Universalis project overview |
| `Universalis_Checklist.md` | Atlas Universalis objectives checklist |
| `Meridian_Log.md` | Atlas Meridian change log |
| `Meridian_Overview.md` | Atlas Meridian project overview |
| `Meridian_Checklist.md` | Atlas Meridian objectives checklist |
| `Electracast_Log.md` | ElectraCast change log |
| `Electracast_Overview.md` | ElectraCast project overview |
| `Electracast_Checklist.md` | ElectraCast objectives checklist |
| `dev_status.json` | Dev portal status indicator state |

---

### Utility Scripts: `scripts/`

| File | Purpose |
|------|---------|
| `setup_users.py` | Initial user setup script |
| `make_admin.py` | Promote user to admin |
| `create_test_user.py` | Create test user for development |
| `check_user.py` | User verification utility |
| `test_templates.py` | Template testing utility |
| `build_master_log.ps1` | Windows script to build Master_Log.pdf |
| `build_master_log.sh` | Linux/Mac script to build Master_Log.pdf |

---

### Internal Assets: `internal/`

Non-deployed internal resources.

| Directory | Contents |
|-----------|----------|
| `Documentation/` | Archived PDF snapshots (Master Log, Project Overview, AtlasOps docs) |
| `Electracast_Codebase/` | Legacy HTML + asset snapshot of electracast.com |
| `UI/` | Consolidated UI assets (logos, wireframes, Figma exports) |
| `UI/atlasops_wireframes/` | UI wireframe mockups |
| `UI/Figma/` | Clean wordmarks + Figma exports |
| `UI/Logo_Icon/` | Logo design concepts and high-res assets |
| `n8n_workflows_backup_20260208.json` | n8n workflow export backup (pre-reset) |
| `n8n_workflows_backup_20260208_postreset.json` | n8n workflow export backup (post-reset) |

---

### MCP Server: `mcp/`

Model Context Protocol server for Cursor IDE integration.

| File | Purpose |
|------|---------|
| `server.py` | MCP server for analytics + documentation/status automation |
| `requirements.txt` | Python dependencies |
| `README.md` | Setup instructions |
| `cursor-mcp-config.example.json` | Example Cursor configuration |

---

## Deployment Architecture

```
                    ┌─────────────────────────────────────┐
                    │         DigitalOcean Droplet        │
                    │                                     │
    Internet ──────▶│  Nginx (Reverse Proxy)              │
                    │    │                                │
                    │    ├── atlasuniversalis.com         │
                    │    │   └── /var/www/.../frontend-main/dist
                    │    │                                │
                    │    ├── apply.atlasuniversalis.com   │
                    │    │   ├── /app/* → frontend/dist   │
                    │    │   └── /api/* → FastAPI :8000   │
                    │    │                                │
                    │    ├── forge.atlasuniversalis.com   │
                    │    │   └── atlasforge/dist          │
                    │    │                                │
                    │    └── FastAPI (Gunicorn/Uvicorn)   │
                    │        └── app.py                   │
                    │            └── atlasops/            │
                    │                                     │
                    │  PostgreSQL                         │
                    │  Redis                              │
                    │  Celery Worker                      │
                    └─────────────────────────────────────┘

GitHub Actions deploys via SSH on push to master
```

---

## Key Concepts Reference

| Concept | Description |
|---------|-------------|
| @concept:branding | Logo, colors, visual identity |
| @concept:homepage-hero | Main landing page hero section |
| @concept:email | Email configuration (Microsoft 365) |
| @concept:git-hygiene | Version control best practices |
| @concept:master-log | This documentation system |
