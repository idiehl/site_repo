# ElectraCast — Checklist

**Last Updated:** 2026-02-07

**Purpose:** Rapid capture of medium-term objectives, then refine into a step-by-step path.

## Rapid Capture (Objectives)
- [ ] Convert static homepage prototype into Vue components
- [ ] Implement navigation, footer, and global styling system in Vue
- [ ] Build route views for podcasts, networks, custom branded podcasts, music, about, contact, advertising, register
- [ ] Migrate podcast and network data with thumbnail coverage
- [ ] Wire asset ingestion to local media paths and finalize asset base URL
- [ ] Implement account creation and login flows (UI + backend integration)
- [ ] Add podcast creation, publishing, and management tools
- [ ] Finalize n8n workflow automation for ingest, mapping, checklist, and GitHub actions
- [ ] Plan Megaphone API integration and data syncing

## Focused Path (Step-by-step)
1. [ ] Split `electracast/index.html` into reusable Vue components and route views
2. [ ] Create data modules for podcasts, networks, news, and music with asset references
3. [ ] Wire asset pipeline (mounted asset dir + base URL resolution)
4. [ ] Implement auth/account flows and define backend integration
5. [ ] Connect n8n intake workflow to populate assets/content and open PRs
6. [ ] Add podcast creation + publishing flows
7. [ ] Integrate Megaphone and external services
8. [ ] Update CI deploy to build the ElectraCast app

## Notes / Dependencies
- Asset ingest pipeline and storage path for media files (`ELECTRACAST_ASSET_DIR`)
- GitHub token + workflow dispatch for n8n GitHub automation
- API design for podcasts, episodes, and accounts
