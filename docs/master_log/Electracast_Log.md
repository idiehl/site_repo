# ElectraCast — Log

This log tracks changes specific to the ElectraCast mirror/rebuild.

## 2026-02-05
- Added ElectraCast to the developer portal application list and API mapping.
- Created ElectraCast log, overview, and checklist documentation.

## 2026-02-07
- Captured ElectraCast reference sources in `internal/Electracast_Codebase/` and `docs/electracast_snapshot/`.
- Scaffolded the ElectraCast frontend (`electracast/`) with Vite + Vue 3 + Tailwind, global styles, and a router skeleton.
- Implemented a static HTML prototype in `electracast/index.html` with login shell and homepage sections.
- Confirmed subdomain routing support via `deploy/nginx-electracast.conf` and manual build steps on the droplet.
- Documented the n8n automation workflow plan for asset ingest, mapping, checklist tracking, and GitHub issue/PR/deploy triggers.
- Integrated ElectraCast build steps into the CI deploy workflow.
- Migrated the ElectraCast frontend to React + TypeScript, ported the homepage into components, added data modules, and removed the legacy login stub.

## 2026-02-08
- Enabled env access for the ElectraCast n8n intake workflow and confirmed a safe test webhook run.
- Added the My ElectraCast Account page with legacy login links and resource lists.
- Styled the account/resource layout and wired a new `/account` route.
- Restored the production webhook endpoint (`/webhook/electracast-rebuild-live`) and removed smoke test workflows.
- Began legacy page migration by rebuilding the Advertising page banner + inquiry form layout.
- Ported About and Contact pages with legacy mission copy, team/advisor bios, and contact form layout.
- Added the Podcasts directory list with legacy links and featured lineup.
- Added the Networks directory list and updated the network pill data.
- Added the Custom Branded Podcasts demo reel and contact form layout.
- Ported the Music page release copy and featured catalog list.
- Ported the Register page welcome copy with a static registration form layout.
- Updated homepage copy to mirror featured originals from the legacy snapshot.
- Mapped artwork for featured podcasts, music releases, and network tiles.
- Wired ElectraCast registration, login, and profile updates to new backend endpoints.
- Added a password reset flow for ElectraCast accounts.

## 2026-02-09
- Fixed ElectraCast HTTPS by pointing Nginx at the cert that includes the electracast SAN.
- Updated Nginx to serve the built Vite `dist` output instead of the source root, resolving the blank page.
- Rebuilt the ElectraCast SPA on the droplet and reloaded Nginx.

## 2026-02-10
- Added ElectraCast podcast data model, migration, and create/list API endpoints.
- Expanded the My Account dashboard with podcast submission and listing UI.
- Updated ElectraCast frontend API client/types and README endpoint list.
- Added Megaphone API client + configuration for ElectraCast.
- Podcast submissions now attempt Megaphone creation and store sync status + IDs.
- Documented Megaphone env vars in README and .env example.
- Updated nav links to route to standalone pages instead of home anchors.
- Fixed the site header logout button and added auth state syncing.
- Updated the homepage account card CTA to point to /account and /register.
- Removed legacy login CTA and clarified internal account access messaging.
- Improved API fetch error messaging for account actions.
- Updated CORS env/setup examples to include electracast.atlasuniversalis.com.
- Deployed updated ALLOWED_ORIGINS on production, rebuilt the ElectraCast frontend, and restarted app + Nginx.

## 2026-02-11
- Removed legacy login CTA and clarified internal account access.
- Added API fetch debug logging to capture Failed to fetch errors.
- Updated CORS example config to include electracast.atlasuniversalis.com.
- Removed temporary fetch debug logging from the ElectraCast API client after confirming account flow.
- Scraped 90 podcasts and 19 networks from electracast.com into internal/Electracast_Codebase
- Added scrape_electracast_entries.py and normalize_electracast_dirs.py to automate snapshots
- Per-entry folders now include HTML, assets, cover images, summaries, and network_podcasts.txt
- Ingested 90 podcasts and 19 networks into database
- Added ElectraCastNetwork model and cover_image_url to Podcast model
- Copied scraped assets to public/uploads for serving
- Integrated podcaster dashboard from Dashboard repo with layout, nav, and nested account routes (/account/overview, /account/analytics, etc.).
- Added dashboard components (Overview, Analytics, Episodes, Recording, Upload, Settings) plus dashboard data context mapped to account/podcast API.
- Added dashboard-logo.png asset and lucide-react/recharts dependencies.
- Updated PROJECT_OVERVIEW inventory for ElectraCast dashboard structure.
- Added Create Podcast dashboard route and navigation item for new show submissions.
- Wired Create Podcast form to the ElectraCast podcast API with live list updates.
- Extended dashboard data context to expose account/podcast data for Overview and Podcasts views.
- Derived dashboard stats, analytics, and pipeline lists from real podcast statuses, categories, and activity.

## 2026-02-12
- Standardized UI palette to brand gold/black across public site and dashboard
- Added ElectraCast logo to public SiteHeader, dashboard header, and login screen header (MyAccount)
- Updated palette in Analytics, CreatePodcast, Episodes, Overview, Recording, Settings, Upload components
- Renamed 'My ElectraCast Account' to 'Profile' in navigation
- Added public SiteHeader to authenticated dashboard page (electracast.atlasuniversalis.com/account)
- Files: navigation.ts, Home.tsx, DashboardLayout.tsx
- Fix deploy build: added missing d3-color dependency (required by d3-interpolate)
- Updated package.json and package-lock.json; npm install succeeds locally
- Pending redeploy verification; set dev status READY after successful deploy
- Fix: Added cookie dependency for react-router compatibility
- Files: package.json, package-lock.json updated
- Verification: npm install passed locally; redeploy pending
