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
- Homepage prototype has been ported into React components with data modules backing the content.
- `electracast/index.html` is now the Vite SPA entry point; legacy login stub was removed.
- Dev portal tracking is active via ElectraCast log/overview/checklist entries.
- CI deploy workflow now builds the ElectraCast app on pushes to `master`.

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
- Implement auth/account flows and decide backend integration path.
- Integrate Megaphone APIs for publishing and analytics.
