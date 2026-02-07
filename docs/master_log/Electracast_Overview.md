# ElectraCast — Overview

## Concept
ElectraCast is a faithful rebuild of electracast.com, hosted at
`electracast.atlasuniversalis.com`, reusing the original branding and media assets.

## Long-Term Goals
- Recreate the full UI, layout, and aesthetic of the original site.
- Migrate the complete podcast and network catalogs with accurate artwork.
- Build account creation, login, and profile management flows.
- Add podcast creation, publishing, and management tools.
- Integrate Megaphone APIs and external services for sync and analytics.

## Current State
- Vue 3 + Vite + Tailwind app scaffolded in `electracast/`.
- Route structure defined for core pages (home, podcasts, networks, about, contact).
- Original HTML and media snapshots captured under `internal/Electracast_Codebase/`.
- Branding reference data stored in `docs/electracast_snapshot/`.

## Next Steps
- Implement the homepage and shared layout components.
- Recreate the main subpages from the captured HTML snapshots.
- Wire asset ingestion to local media paths for thumbnails and logos.
- Design the auth and podcast management data flows.
