# ElectraCast — Overview

## Concept
ElectraCast is a faithful rebuild of electracast.com, hosted at
`electracast.atlasuniversalis.com`, reusing the original branding and media assets.

## Reference Sources
- Full HTML + asset snapshots: `internal/Electracast_Codebase/`
- Branding, homepage summary, and section map: `docs/electracast_snapshot/`
- Subdomain routing: `deploy/nginx-electracast.conf`

## Current State
- ElectraCast frontend scaffolded in `electracast/` using Vite + Vue 3 + Tailwind.
- Tailwind config captures ElectraCast fonts and gold/black palette; base styles live in `src/assets/main.css`.
- Router skeleton defines core pages: home, podcasts, networks, custom branded podcasts, music, about, contact, advertising, register.
- Static UI prototype lives in `electracast/index.html` with login shell and homepage sections for layout reference.
- Vue route view components are not implemented yet; the static HTML is the current source of truth.
- Dev portal tracking is active via ElectraCast log/overview/checklist entries.

## n8n Integration (Automation)
An n8n workflow ("ElectraCast Rebuild Intake") is set up to reduce manual migration work.
- Trigger: Webhook `POST /electracast-rebuild`.
- Normalize payload and build an asset manifest.
- Map homepage sections into structured JSON for the rebuild.
- Track rebuild checklist items for progress visibility.
- Optional GitHub automation: create issue + PR and trigger deploy workflow.
- Optional asset ingestion: download media and persist to a mounted asset directory (e.g., `ELECTRACAST_ASSET_DIR`).

## Long-Term Goals
- Recreate the full UI, layout, and aesthetic of the original site.
- Migrate the complete podcast and network catalogs with accurate artwork.
- Build account creation, login, and profile management flows.
- Add podcast creation, publishing, and management tools.
- Integrate Megaphone APIs and external services for sync and analytics.

## Next Steps
- Convert the static HTML prototype into Vue components and route views.
- Centralize content data (podcasts, networks, news, music) into structured files.
- Wire asset ingestion and resolve local asset paths (planned alias `/electracast-assets` or `VITE_ELECTRACAST_ASSET_BASE`).
- Implement auth/account flows and decide backend integration path.
- Integrate Megaphone APIs for publishing and analytics.
- Extend CI deploy to build the ElectraCast app in GitHub Actions.
