# ElectraCast — Checklist

**Last Updated:** 2026-02-09

**Purpose:** Rapid capture of medium-term objectives, then refine into a step-by-step path.

## Rapid Capture (Objectives)
- [x] Convert static homepage prototype into React components
- [x] Implement navigation, footer, and global styling system in React
- [x] Build route views for podcasts, networks, custom branded podcasts, music, about, contact, advertising, register
- [x] Add My ElectraCast Account page with legacy login + resource links
- [x] Restore production webhook registration for the ElectraCast intake
- [x] Fix production HTTPS cert and serve the built ElectraCast SPA
- [x] Migrate podcast and network data with thumbnail coverage
- [ ] Wire asset ingestion to local media paths and finalize asset base URL
- [x] Implement account creation and login flows (UI + backend integration)
- [ ] Add podcast creation, publishing, and management tools
- [ ] Finalize n8n workflow automation for ingest, mapping, checklist, and GitHub actions
- [ ] Plan Megaphone API integration and data syncing

## Focused Path (Step-by-step)
1. [x] Split `electracast/index.html` into reusable React components and route views
2. [x] Create data modules for podcasts, networks, news, and music (asset base helper wired)
3. [x] Add My ElectraCast Account page content + resource lists
4. [ ] Wire asset pipeline (mounted asset dir + base URL resolution)
5. [x] Implement auth/account flows and define backend integration
6. [ ] Connect n8n intake workflow to populate assets/content and open PRs (production webhook verified)
7. [ ] Add podcast creation + publishing flows
8. [ ] Integrate Megaphone and external services
9. [x] Update CI deploy to build the ElectraCast app

## Page Coverage Checklist

### Route Shells (added to app)
- [x] Home
- [x] Podcasts
- [x] Networks
- [x] Custom Branded Podcasts
- [x] Music
- [x] Advertising
- [x] About
- [x] Contact
- [x] Register
- [x] My ElectraCast Account

### Legacy Content Migration (HTML → React)
- [x] Home: headline, CTA, and featured originals copy aligned
- [x] Podcasts: directory list + legacy links (artwork pending)
- [x] Networks: network directory list + legacy links (artwork pending)
- [x] Custom Branded Podcasts: demo reel + contact form layout (artwork pending)
- [x] Music: release copy + catalog list (artwork pending)
- [x] Advertising: advertisers banner + inquiry form layout (submission pending)
- [x] About: mission statement + team/advisor bios
- [x] Contact: inquiry form layout (submission pending)
- [x] Register: welcome copy + registration form layout
- [x] My ElectraCast Account: legacy links + resource lists

## Notes / Dependencies
- Asset ingest pipeline and storage path for media files (`ELECTRACAST_ASSET_DIR`)
- GitHub token + workflow dispatch for n8n GitHub automation
- API design for podcasts, episodes, and accounts
