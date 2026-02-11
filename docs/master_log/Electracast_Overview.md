# ElectraCast — Overview

## Concept
ElectraCast is a faithful rebuild of electracast.com, hosted at
`electracast.atlasuniversalis.com`, reusing the original branding and media assets.

## Reference Sources
- Full HTML + asset snapshots: `internal/Electracast_Codebase/`
- Branding, homepage summary, and section map: `docs/electracast_snapshot/`
- Subdomain routing: `deploy/nginx-electracast.conf`

## Current State
- ElectraCast frontend now runs as a React + TypeScript SPA in `electracast/` using Vite + Tailwind.
- Tailwind config captures ElectraCast fonts and gold/black palette; base styles live in `src/assets/main.css`.
- React routes cover core pages: home, podcasts, networks, custom branded podcasts, music, about, contact, advertising, register.
- Added a dedicated `/account` page with legacy login links and production resource lists.
- Advertising page now includes the legacy advertisers banner and an inquiry form layout.
- About and Contact pages now mirror the legacy mission copy, leadership bios, and inquiry form layout.
- Podcasts page now includes a featured lineup plus a full directory list with legacy links.
- Networks page now includes the full legacy network directory and updated network pills.
- Custom Branded Podcasts page now includes the demo reel and contact form layout.
- Music page now includes the Pod Till You Drop album copy and featured release list.
- Register page now mirrors the legacy welcome copy and registration form layout.
- Homepage featured originals copy now aligns with the legacy snapshot.
- Artwork mapping now covers featured podcast covers, music releases, and network tiles.
- ElectraCast account registration, login, and profile updates are now wired to backend endpoints.
- Password reset requests and confirmations are now supported for ElectraCast accounts.
- Homepage prototype has been ported into React components with data modules backing the content.
- `electracast/index.html` is now the Vite SPA entry point; legacy login stub was removed.
- Dev portal tracking is active via ElectraCast log/overview/checklist entries.
- CI deploy workflow now builds the ElectraCast app on pushes to `master`.
- Production Nginx now serves the built `dist` output and uses the SAN cert that includes electracast.

- ElectraCast dashboard now includes podcast submission and listing for signed-in users.
- Backend now stores ElectraCast podcast records with create/list API endpoints and a migration.
- ElectraCast frontend API client now supports podcast creation and retrieval.
- Podcast submissions now attempt Megaphone creation and record sync status + IDs.
- Megaphone API settings are now configurable via environment variables.
- Navigation now routes to standalone pages (no more home-page anchors).
- Header logout now clears auth and redirects to the account dashboard.
- Legacy ElectraCast.com login CTA removed; account page now reflects internal account flow only.
- CORS config examples now include the ElectraCast subdomain for API access.
- Account page now reflects internal ElectraCast auth only (legacy login removed).
- ElectraCast API client now includes debug logging for fetch failures during registration/login.
## n8n Integration (Automation)
An n8n workflow ("ElectraCast Rebuild Intake") is set up to reduce manual migration work.
- Trigger: Webhook `POST /webhook/electracast-rebuild-live`.
- Normalize payload and build an asset manifest.
- Map homepage sections into structured JSON for the rebuild.
- Track rebuild checklist items for progress visibility.
- Optional GitHub automation: create issue + PR and trigger deploy workflow.
- Optional asset ingestion: download media and persist to a mounted asset directory (e.g., `ELECTRACAST_ASSET_DIR`).
- Env access is enabled for Code nodes; production webhook `/webhook/electracast-rebuild-live` is verified.

## Long-Term Goals
- Recreate the full UI, layout, and aesthetic of the original site.
- Migrate the complete podcast and network catalogs with accurate artwork.
- Build account creation, login, and profile management flows.
- Add podcast creation, publishing, and management tools.
- Integrate Megaphone APIs and external services for sync and analytics.

## Next Steps
- Expand route views with full content from the HTML snapshot folders.
- Enrich content data (podcasts, networks, news, music) with media assets and metadata.
- Wire asset ingestion and resolve local asset paths (planned alias `/electracast-assets` or `VITE_ELECTRACAST_ASSET_BASE`).
- Connect intake workflow outputs to asset ingestion + GitHub automation steps.
- Expand ElectraCast profile fields and onboarding flows.
- Integrate Megaphone APIs for publishing and analytics.
