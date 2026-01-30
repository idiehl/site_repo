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
