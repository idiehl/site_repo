# Atlas Universalis — Master Log

This document tracks all meaningful changes to the Atlas Universalis project. Each entry follows the standard format defined in the project rules.

**Project Slug:** `AU`  
**Current Cycle:** `C01`  
**Timezone:** America/Kentucky/Louisville

---

## AU-C01-20260130-001 — Fix animated arrow overlap on homepage hero section

**Type:** Fix  
**Context:** User reported animated scroll arrow overlapping other visual elements on the homepage  
**Change summary:** Moved scroll indicator outside the content container and adjusted positioning from `bottom-10` to `bottom-4`  
**Rationale / tradeoffs:** The arrow was inside the centered flex content div, causing overlap with CTA buttons. Moving it to be a direct child of the section element with absolute positioning relative to the full viewport height prevents overlap.  
**Files touched:**
- `frontend-main/src/components/HeroSection.vue`

**Commands run:**
```bash
git add && git commit && git push
ssh root@167.71.179.90 "cd /var/www/atlasuniversalis.com && git pull && cd frontend-main && npm run build"
```

**Verification:** Visual inspection of live site  
**Notes:** None  
**Concepts:** @concept:homepage-hero @concept:scroll-indicator

---

## AU-C01-20260130-002 — Replace PNG logo with transparent SVG icon

**Type:** Feature  
**Context:** User requested removing the banner-style logo that had color mismatch with page background  
**Change summary:** Switched from `atlas-logo.png` to `atlas-icon.svg` in HeroSection, increased logo height from h-32 to h-40  
**Rationale / tradeoffs:** SVG allows transparent background, scales perfectly, and reduces file size. The existing atlas-icon.svg contained globe + compass rose + Atlas figure.  
**Files touched:**
- `frontend-main/src/components/HeroSection.vue`

**Commands run:**
```bash
git commit -m "Improve hero section: use SVG logo and fix scroll indicator position"
git push origin master
```

**Verification:** Deployed to production, verified visual appearance  
**Notes:** Initial SVG had a stick figure for Atlas character  
**Concepts:** @concept:branding @concept:logo

---

## AU-C01-20260130-003 — Remove stick figure from logo, update favicon

**Type:** Fix  
**Context:** User feedback that Atlas stick figure looked "awful" and unprofessional  
**Change summary:** 
- Removed Atlas figure from SVG, kept only globe with compass rose
- Updated favicon from PNG to SVG (`atlas-icon.svg`)
- Updated NavBar and Footer to use consistent SVG icon

**Rationale / tradeoffs:** Clean globe-only design is more professional and scalable. SVG favicon provides crisp rendering at all sizes.  
**Files touched:**
- `frontend-main/public/atlas-icon.svg`
- `frontend-main/index.html`
- `frontend-main/src/components/NavBar.vue`
- `frontend-main/src/components/FooterSection.vue`

**Commands run:**
```bash
git commit -m "Clean up logo: remove stick figure, use globe-only SVG, update favicon"
```

**Verification:** Checked all logo instances on site, verified favicon in browser tab  
**Notes:** None  
**Concepts:** @concept:branding @concept:favicon

---

## AU-C01-20260130-004 — Design new distinctive logo with "A" letterform

**Type:** Feature  
**Context:** User requested more unique, identifiable logo instead of generic globe  
**Change summary:** Created new logo concept featuring stylized "A" with orbital rings and compass accents. Design includes:
- Central stylized "A" letterform
- Outer orbital ring representing globe
- Tilted orbital arcs suggesting global reach
- Gold compass points at cardinal directions

**Rationale / tradeoffs:** Incorporating the "A" from "Atlas" makes the logo instantly recognizable and unique. Orbital theme connects to "Universalis" (universal/global reach).  
**Files touched:**
- `frontend-main/public/atlas-icon.svg`

**Commands run:**
```bash
git commit -m "New distinctive logo: stylized A with orbital rings and compass accents"
```

**Verification:** Deployed to production  
**Notes:** User requested more creative variations  
**Concepts:** @concept:branding @concept:logo-design

---

## AU-C01-20260130-005 — Create 5 logo design options for user selection

**Type:** Feature  
**Context:** User wanted to compare multiple logo concepts before choosing  
**Change summary:** Created 5 distinct logo variations and a preview page:
1. Minimalist Clean - Simple A with single orbit
2. Hexagonal Tech - A inside hexagon with circuit details
3. Dynamic Arcs - Sweeping motion arcs with rising star
4. Globe Integration - A formed by globe meridian lines
5. Shield Badge - A in protective shield shape

Added `logo-preview.html` for side-by-side comparison.

**Rationale / tradeoffs:** Multiple options allow user to evaluate different design directions before committing.  
**Files touched:**
- `frontend-main/public/logo-option-1.svg` through `logo-option-5.svg`
- `frontend-main/public/logo-preview.html`

**Commands run:**
```bash
git commit -m "Add 5 logo options with preview page"
```

**Verification:** Preview page deployed at /logo-preview.html  
**Notes:** User liked hexagonal tech concept (#2)  
**Concepts:** @concept:branding @concept:design-iteration

---

## AU-C01-20260130-006 — Create 5 hexagonal logo variations

**Type:** Feature  
**Context:** User liked hexagonal concept but wanted more creative variations  
**Change summary:** Created 5 variations of the hexagonal "A" design:
1. Layered Depth - 3D shadow effect with multiple hex layers
2. Circuit Network - Connected nodes with data flow lines
3. Segmented Modern - Broken hexagon with gaps
4. Crystalline Gem - Faceted gemstone appearance
5. Orbital System - Hexagon with orbiting satellites

Updated preview page to show hex variations with size demos (64px, 32px, 16px).

**Rationale / tradeoffs:** Each variation emphasizes different brand attributes (tech, modern, premium, dynamic).  
**Files touched:**
- `frontend-main/public/logo-hex-1.svg` through `logo-hex-5.svg`
- `frontend-main/public/logo-preview.html`

**Commands run:**
```bash
git commit -m "Add 5 hexagon logo variations with updated preview"
```

**Verification:** Preview page showed all variations with size demos  
**Notes:** User selected Hex 5 (Orbital System)  
**Concepts:** @concept:branding @concept:hexagon-logo

---

## AU-C01-20260130-007 — Deploy Orbital Hexagon as final logo

**Type:** Decision  
**Context:** User selected Hex 5 (Orbital System) as the final logo design  
**Change summary:** Updated `atlas-icon.svg` with the Orbital Hexagon design featuring:
- Bold hexagon outline
- Two crossing orbital ellipses at ±30° rotation
- Solid filled "A" letterform
- Gold orbiting satellite nodes
- Top apex star accent

**Rationale / tradeoffs:** 
- Alternatives considered: Layered Depth, Circuit Network, Segmented Modern, Crystalline Gem
- Orbital System chosen for its dynamic feel and suggestion of global reach
- Works well at small sizes (tested at 16px, 32px, 64px)

**Files touched:**
- `frontend-main/public/atlas-icon.svg`

**Commands run:**
```bash
git commit -m "Update logo to Orbital Hexagon design"
```

**Verification:** Logo appears correctly in hero, navbar, footer, and browser tab  
**Notes:** None  
**Concepts:** @concept:branding @concept:final-logo

---

## AU-C01-20260130-008 — Update contact email to Microsoft 365 address (temporary)

**Type:** Fix  
**Context:** Contact email in footer was non-functional placeholder  
**Change summary:** Changed contact email from `contact@atlasuniversalis.com` (non-functional) to `idiehl@atlasuniversalis.onmicrosoft.com` (working M365 address)  
**Rationale / tradeoffs:** Temporary fix while custom domain email is configured in M365  
**Files touched:**
- `frontend-main/src/components/FooterSection.vue`

**Commands run:**
```bash
git commit -m "Update contact email to working Microsoft 365 address"
```

**Verification:** Email link works in footer  
**Notes:** Superseded by AU-C01-20260130-009  
**Concepts:** @concept:contact-info

---

## AU-C01-20260130-009 — Configure custom domain email and update contact

**Type:** Ops  
**Context:** User set up M365 custom domain email after discovering DNS was already configured  
**Change summary:** 
- Verified DNS records (MX, SPF, MS verification already in place)
- User created `contact@atlasuniversalis.com` in M365 admin
- Updated footer to use professional custom domain email

**Rationale / tradeoffs:** Custom domain email looks more professional than .onmicrosoft.com address  
**Files touched:**
- `frontend-main/src/components/FooterSection.vue`

**Commands run:**
```bash
git commit -m "Update contact email to contact@atlasuniversalis.com"
```

**Verification:** 
- DNS records verified via nslookup (MX pointing to Outlook, SPF configured)
- Email account accessible at outlook.office.com

**Notes:** DKIM setup recommended for improved deliverability  
**Concepts:** @concept:email @concept:dns

---

## AU-C01-20260130-010 — Add node_modules and dist to gitignore

**Type:** Refactor  
**Context:** Git status on server showed thousands of changed files due to node_modules/dist being tracked  
**Change summary:** 
- Updated `.gitignore` to exclude `node_modules/` and `dist/`
- Removed these directories from git tracking using `git rm --cached`
- Cleaned up server git state

**Rationale / tradeoffs:** Build artifacts should never be in version control. They differ between environments (Windows vs Linux) and cause unnecessary noise.  
**Files touched:**
- `.gitignore`

**Commands run:**
```bash
git rm -r --cached frontend-main/node_modules frontend-main/dist frontend/node_modules frontend/dist
git commit -m "Add node_modules and dist to gitignore, remove from tracking"
```

**Verification:** Server now shows clean git status (only untracked local files)  
**Notes:** Should have been configured from project inception  
**Concepts:** @concept:git-hygiene @concept:build-artifacts

---

## AU-C01-20260130-011 — Create Master Log and Project Documentation

**Type:** Docs  
**Context:** Project rules require maintaining a Master Log for all changes  
**Change summary:** 
- Created `docs/master_log/` directory structure
- Created `Master_Log.md` with entries for all session work
- Created `PROJECT_OVERVIEW.md` with complete file inventory
- Added PDF build tooling

**Rationale / tradeoffs:** Documentation enables project continuity and provides audit trail  
**Files touched:**
- `docs/master_log/Master_Log.md`
- `docs/master_log/PROJECT_OVERVIEW.md`
- `docs/master_log/pdf.css`
- `scripts/build_master_log.ps1`
- `scripts/build_master_log.sh`

**Commands run:**
```bash
git add docs/ scripts/build_master_log.*
git commit -m "AU-C01-20260130-011: Add Master Log and project documentation"
```

**Verification:** Documentation complete and committed  
**Notes:** PDF generation requires markdown-pdf or similar tool  
**Concepts:** @concept:documentation @concept:master-log

---

## AU-C01-20260130-012 — Add Developer Portal with Protected Documentation Pages

**Type:** Feature  
**Context:** User requested developer-only pages to view Master Log and Project Overview in real-time  
**Change summary:** 
- Added token-based dev authentication via `DEV_TOKEN` environment variable
- Created `/api/v1/dev/*` API endpoints to serve markdown documentation
- Created Vue pages: DevLoginView, DevDashboardView, DevLogView, DevOverviewView
- Dev pages render markdown to styled HTML with toggle for raw markdown view
- Content is read from disk on each request for real-time updates

**Rationale / tradeoffs:** 
- Simple token auth chosen over full user auth for developer convenience
- Token stored in localStorage for session persistence
- Markdown converted to HTML server-side for consistent rendering
- Real-time updates achieved by reading files on each request (no caching)

**Files touched:**
- `atlasops/config.py` - Added `dev_token` setting
- `atlasops/api/v1/dev.py` - New dev API router
- `atlasops/api/v1/router.py` - Included dev router
- `frontend-main/src/views/DevLoginView.vue` - Token login page
- `frontend-main/src/views/DevDashboardView.vue` - Dev portal dashboard
- `frontend-main/src/views/DevLogView.vue` - Master Log viewer
- `frontend-main/src/views/DevOverviewView.vue` - Project Overview viewer
- `frontend-main/src/router/index.js` - Added dev routes
- `requirements.txt` - Added markdown package
- `.env.example` - Added DEV_TOKEN example

**Commands run:**
```bash
git add -A
git commit -m "AU-C01-20260130-012: Add Developer Portal with protected documentation pages"
```

**Verification:** Pages accessible at /dev on main site with valid token  
**Notes:** Set `DEV_TOKEN` in production .env file  
**Concepts:** @concept:dev-portal @concept:documentation @concept:authentication

---

## AU-C01-20260131-001 — Build UI Playground Design System Laboratory

**Type:** Feature (Major)  
**Context:** User requested a tool to experiment with different UI frameworks, themes, and components with live preview  
**Change summary:** 
- Created new Astro project at `playground/` with Vue and React integrations
- Built component registry system supporting multiple UI libraries (Heroicons, Headless UI, custom components)
- Implemented ComponentBrowser with search, filter by framework, and categorization
- Built PropsEditor with dynamic form generation, color pickers, Tailwind class builder
- Created CanvasBuilder with drag-and-drop, element selection, layer management, grid snap
- Added PreviewPanel for live component preview with framework indicator
- Implemented CodeExporter modal with Vue SFC, React JSX, and HTML+Tailwind export formats
- Added SaveDesignModal with localStorage persistence for designs
- Created 8 custom Vue components: Card, Badge, Alert, Button, Input, Avatar, Progress, Tabs
- Added playground API endpoint for server-side design persistence
- Created nginx config for playground.atlasuniversalis.com subdomain

**Rationale / tradeoffs:** 
- Astro chosen for native Vue+React support ("islands" architecture)
- nanostores used for cross-framework state management
- Custom components render in both preview and canvas for WYSIWYG editing
- localStorage used for quick saves, API for named persistent designs
- Subdomain deployment requires DNS A record to be added by user

**Files touched:**
- `playground/` - Entire new Astro project (package.json, astro.config.mjs, tailwind.config.mjs, tsconfig.json)
- `playground/src/lib/registry.ts` - Component metadata registry
- `playground/src/lib/canvas-store.ts` - State management with nanostores
- `playground/src/lib/code-generator.ts` - Export logic for Vue/React/HTML
- `playground/src/components/core/` - PlaygroundApp, TopBar, ComponentBrowser, PropsEditor, CanvasBuilder, PreviewPanel, CodeExporter, SaveDesignModal
- `playground/src/components/vue/` - 8 custom Vue component wrappers
- `playground/src/layouts/PlaygroundLayout.astro` - Base layout
- `playground/src/pages/index.astro` - Main page
- `atlasops/api/v1/playground.py` - API for design persistence
- `atlasops/api/v1/router.py` - Included playground router
- `deploy/nginx-playground.conf` - Nginx configuration for subdomain

**Commands run:**
```bash
npm install && npm run build  # In playground/
git add -A && git commit && git push
ssh root@... "git pull && cd playground && npm install && npm run build"
```

**Verification:** Build successful, deployed to server, accessible once DNS configured  
**Notes:** 
- DNS A record for playground.atlasuniversalis.com must be added pointing to 167.71.179.90
- After DNS propagates, run: `certbot --nginx -d atlasuniversalis.com -d www.atlasuniversalis.com -d quickpro.atlasuniversalis.com -d playground.atlasuniversalis.com --expand`
**Concepts:** @concept:playground @concept:design-system @concept:astro @concept:vue @concept:react

---

## AU-C01-20260131-002 — Full Library Integration for Atlas Forge

**Type:** Feature (Major)  
**Context:** User requested full integration of all major Vue and React UI libraries with lazy-loading, complete component coverage (500+ components), and CSS isolation  
**Change summary:**
- Installed all major UI library dependencies:
  - Vue: Vuetify (80+ components), PrimeVue (90+ components), Naive UI (80+ components)
  - React: Chakra UI (60+ components), Mantine (100+ components), Radix UI (28 primitives), shadcn/ui (40+ components)
- Created dynamic library loader system (`library-loader.ts`) with:
  - Lazy-loading via dynamic imports
  - Library caching to prevent duplicate loads
  - Preloading support for background loading
- Created individual library loaders for each library:
  - `vuetify-loader.ts` - Full Vuetify component exports with Material Design Icons
  - `primevue-loader.ts` - 80+ PrimeVue components with dark theme
  - `naiveui-loader.ts` - 80+ Naive UI components
  - `chakra-loader.ts` - Full Chakra UI with provider setup
  - `mantine-loader.ts` - Full Mantine with dates module
  - `radix-loader.ts` - All 28 Radix UI primitives
  - `shadcn-loader.ts` - Pre-styled Radix + Tailwind components
  - Heroicons and Headless UI loaders for both Vue and React
- Created provider wrapper components for context injection:
  - Vue: VuetifyProvider, PrimeVueProvider, NaiveUIProvider
  - React: ChakraProviderWrapper, MantineProviderWrapper, RadixProviderWrapper, ShadcnProviderWrapper
- Updated PreviewPanel.vue to use library loader system with loading states
- Updated ReactPreviewWrapper.tsx to use library loader with mock fallbacks
- Configured Vite code splitting for optimal bundle sizes:
  - Each library loads as separate chunk (300KB-1.3MB per library)
  - Initial bundle stays lean (~150KB)
  - Libraries load on-demand when first selected
- Added PostCSS configuration for Mantine styles
- Created LibraryLoadingState.vue for visual loading feedback

**Rationale / tradeoffs:**
- Dynamic imports ensure initial page load is fast (~150KB)
- Individual chunks allow browser caching per library
- Provider wrappers ensure proper context for theming
- Mock previews provide fallback when component loading fails
- Large chunks (Naive UI: 1.2MB, PrimeVue: 1.3MB) acceptable with lazy loading

**Files touched:**
- `atlasforge/package.json` - Added all library dependencies
- `atlasforge/astro.config.mjs` - SSR config and code splitting
- `atlasforge/postcss.config.cjs` - Mantine PostCSS plugins
- `atlasforge/src/vue-app.ts` - Vue app entry point
- `atlasforge/src/lib/library-loader.ts` - Dynamic loader system
- `atlasforge/src/lib/libraries/*.ts` - 13 library loader modules
- `atlasforge/src/components/providers/*.vue/*.tsx` - 7 provider wrappers
- `atlasforge/src/components/core/PreviewPanel.vue` - Updated for library loading
- `atlasforge/src/components/core/IsolatedPreview.vue` - CSS isolation component
- `atlasforge/src/components/core/LibraryLoadingState.vue` - Loading indicator
- `atlasforge/src/components/react/ReactPreviewWrapper.tsx` - Updated for library loading

**Commands run:**
```bash
cd atlasforge && npm install
npm run build  # Successful with code splitting
```

**Verification:**
- Build output shows proper code splitting with separate chunks per library
- 317 components across 13 libraries registered
- Total uncompressed: ~6MB, Gzipped: ~1.8MB (loaded on-demand)

**Notes:**
- PrimeVue Editor component excluded (requires Quill dependency)
- Naive UI NMessage/NNotification are imperative APIs, not component exports
- Some libraries have large chunks due to comprehensive component sets

**Concepts:** @concept:atlas-forge @concept:ui-libraries @concept:lazy-loading @concept:code-splitting @concept:vuetify @concept:primevue @concept:naive-ui @concept:chakra-ui @concept:mantine @concept:radix-ui @concept:shadcn

---

## AU-C01-20260205-001 — Add ElectraCast to developer portal

**Type:** Feature  
**Context:** User requested tracking the ElectraCast rebuild on the dev dashboard  
**Change summary:**
- Added ElectraCast to the dev portal application list and labels
- Added ElectraCast dev docs in the master_log folder
- Wired ElectraCast docs into the dev API mapping
- Updated project overview to include ElectraCast documentation

**Rationale / tradeoffs:** Keeps dev portal aligned with active rebuild work and ensures docs are accessible in one place  
**Files touched:**
- `frontend-main/src/views/DevDashboardView.vue`
- `frontend-main/src/views/DevAppOverviewView.vue`
- `frontend-main/src/views/DevAppLogView.vue`
- `frontend-main/src/views/DevAppChecklistView.vue`
- `atlasops/api/v1/dev.py`
- `docs/master_log/Electracast_Log.md`
- `docs/master_log/Electracast_Overview.md`
- `docs/master_log/Electracast_Checklist.md`
- `docs/master_log/PROJECT_OVERVIEW.md`
- `docs/master_log/Master_Log.md`

**Commands run:**
```bash
git add frontend-main/src/views/DevDashboardView.vue frontend-main/src/views/DevAppOverviewView.vue frontend-main/src/views/DevAppLogView.vue frontend-main/src/views/DevAppChecklistView.vue frontend-main/src/router/index.js atlasops/api/v1/dev.py docs/master_log/Electracast_Log.md docs/master_log/Electracast_Overview.md docs/master_log/Electracast_Checklist.md docs/master_log/PROJECT_OVERVIEW.md docs/master_log/Master_Log.md
git commit -m "AU-C01-20260205-001: Add ElectraCast to dev portal"
git push origin master
```

**Verification:** Manual review of updated markdown and dev portal mappings  
**Notes:** Dev portal endpoints read docs from disk on request  
**Concepts:** @concept:documentation @concept:dev-portal @concept:electracast

---

## AU-C01-20260205-002 — Sync Meridian groundwork and ElectraCast assets

**Type:** Feature  
**Context:** User requested pushing uncommitted ElectraCast rebuild work, Meridian scaffolding, and dev portal updates to production  
**Change summary:**
- Added Meridian API router/schemas plus a landing view and wordmark
- Switched dev portal access from token-based login to admin credential auth
- Added ElectraCast frontend scaffold and captured snapshot assets for rebuild
- Added per-app logs/overviews/checklists and ElectraCast snapshot docs
- Tweaked main site hero/footer sizing and Atlas Apply admin/extension headers

**Rationale / tradeoffs:** Consolidates local progress into tracked history so dev portal and rebuild assets stay in sync  
**Files touched:**
- `atlasops/api/v1/router.py`
- `atlasops/api/v1/meridian.py`
- `atlasops/schemas/__init__.py`
- `atlasops/schemas/meridian.py`
- `frontend-main/src/components/AppsSection.vue`
- `frontend-main/src/components/HeroSection.vue`
- `frontend-main/src/components/FooterSection.vue`
- `frontend-main/src/views/DevLoginView.vue`
- `frontend-main/src/views/DevLogView.vue`
- `frontend-main/src/views/DevOverviewView.vue`
- `frontend-main/src/views/MeridianView.vue`
- `frontend-main/public/atlas-meridian-wordmark.svg`
- `frontend/src/views/AdminDashboardView.vue`
- `frontend/src/views/ExtensionView.vue`
- `docs/master_log/*.md`
- `docs/electracast_snapshot/*`
- `electracast/*`
- `internal/Electracast_Codebase/*`
- `meridian/*`

**Commands run:**
```bash
git add -A
git commit -m "AU-C01-20260205-002: Sync Meridian and ElectraCast groundwork"
git push origin master
```

**Verification:** Not run (CI deploy expected on push)  
**Notes:** ElectraCast snapshot assets add a large volume of static files  
**Concepts:** @concept:documentation @concept:electracast @concept:meridian @concept:dev-portal @concept:frontend @concept:api

---

## AU-C01-20260207-001 — Reconcile server worktree and deploy updates

**Type:** Ops  
**Context:** Production droplet had local changes blocking pull; reconcile and deploy latest master  
**Change summary:**
- Captured server-local changes and rebased onto origin/master (duplicate changes skipped)
- Deployed latest builds for `frontend-main`, `frontend`, and `electracast`
- Left runtime uploads (`atlasops/uploads/`) untracked to avoid committing user data

**Rationale / tradeoffs:** Keeps production repo clean and aligned with origin while avoiding data loss from runtime uploads  
**Files touched:**
- `atlasops/api/v1/*`
- `atlasops/schemas/*`
- `docs/master_log/*.md`
- `docs/electracast_snapshot/*`
- `electracast/*`
- `frontend-main/src/*`
- `frontend/src/*`

**Commands run:**
```bash
ssh root@167.71.179.90 "cd /var/www/atlasuniversalis.com && git add -A && git reset -- atlasops/uploads"
ssh root@167.71.179.90 "git -C /var/www/atlasuniversalis.com commit-tree ... -m \"AU-C01-20260205-002: Sync Meridian and ElectraCast groundwork\""
ssh root@167.71.179.90 "cd /var/www/atlasuniversalis.com && git pull --rebase origin master"
ssh root@167.71.179.90 "cd /var/www/atlasuniversalis.com && git rebase --skip"
ssh root@167.71.179.90 "cd /var/www/atlasuniversalis.com && cd frontend-main && npm install && npm run build && cd ../frontend && npm install && npm run build && cd ../electracast && npm install && npm run build"
```

**Verification:** Build logs completed on droplet  
**Notes:** Local gcloud ADC auth was triggered during a wait command; credentials saved to `AppData\\Roaming\\gcloud\\application_default_credentials.json`  
**Concepts:** @concept:deployment @concept:git-hygiene @concept:electracast @concept:meridian

---

## AU-C01-20260207-002 — Ignore ElectraCast archive and clear server stashes

**Type:** Ops  
**Context:** User requested cleanup to avoid future deploy conflicts and ignore local archive artifacts  
**Change summary:**
- Added `internal/Electracast_Codebase.zip` to `.gitignore`
- Cleared remaining git stashes on the production droplet

**Rationale / tradeoffs:** Prevents accidental commits of large archives and keeps server history clean for future pulls  
**Files touched:**
- `.gitignore`
- `docs/master_log/Master_Log.md`

**Commands run:**
```bash
ssh root@167.71.179.90 'cd /var/www/atlasuniversalis.com && git stash drop "stash@{0}"'
git add .gitignore docs/master_log/Master_Log.md
git commit -m "AU-C01-20260207-002: Ignore ElectraCast archive and clear stashes"
git push origin master
```

**Verification:** None  
**Notes:** Droplet still has runtime `atlasops/uploads/` as untracked data  
**Concepts:** @concept:git-hygiene @concept:deployment
