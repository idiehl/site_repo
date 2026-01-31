---
name: version-logger
description: Manages version history, logging, and documentation for Atlas Universalis. Invoke this skill after any meaningful edit to the local directory, GitHub repository, or droplet server. Updates Master_Log.md, PROJECT_OVERVIEW.md, README.md, and ensures dev pages reflect changes.
---

# Version Logger Subagent

This skill manages project documentation, version history, and change logging for the Atlas Universalis platform. It should be invoked by primary agents after completing any meaningful work.

## When to Invoke This Skill

A primary agent MUST invoke this skill after:

1. **File changes** — Creating, modifying, or deleting files in the repository
2. **Git operations** — Commits, merges, or branch operations
3. **Deployment actions** — Changes pushed to the production droplet
4. **Configuration changes** — Environment, nginx, database migrations
5. **Feature additions** — New functionality, components, or endpoints
6. **Bug fixes** — Error corrections or issue resolutions
7. **Refactoring** — Code restructuring or cleanup
8. **Decision points** — Choosing between alternatives

## Quick Reference

### Documentation File Locations

| File | Path | Purpose |
|------|------|---------|
| README | `README.md` | Public project documentation |
| Master Log | `docs/master_log/Master_Log.md` | Chronological change history |
| Project Overview | `docs/master_log/PROJECT_OVERVIEW.md` | File inventory with descriptions |
| PDF Stylesheet | `docs/master_log/pdf.css` | PDF rendering styles |

### Dev Portal Endpoints

The dev pages automatically refresh from disk:
- `/dev` — Login
- `/dev/dashboard` — Portal home
- `/dev/log` — Master Log viewer
- `/dev/overview` — Project Overview viewer

---

## Workflow

When invoked, follow this checklist:

```
Version Logger Workflow:
- [ ] Step 1: Gather change context
- [ ] Step 2: Generate Log ID
- [ ] Step 3: Create Master Log entry
- [ ] Step 4: Update PROJECT_OVERVIEW.md (if files changed)
- [ ] Step 5: Update README.md (if public-facing changes)
- [ ] Step 6: Verify dev pages will reflect updates
- [ ] Step 7: Report completion to primary agent
```

---

## Step 1: Gather Change Context

Collect this information from the primary agent or infer from recent tool calls:

| Field | Source |
|-------|--------|
| Type | What kind of work (Feature, Fix, Refactor, Decision, Docs, Ops) |
| Context | Why this work was done (user request, bug report, etc.) |
| Change summary | Plain English description of what changed |
| Files touched | List of files created, modified, or deleted |
| Commands run | Shell commands executed (git, npm, ssh, etc.) |
| Verification | How the change was tested/confirmed |

---

## Step 2: Generate Log ID

Format: `AU-<CYCLE>-<YYYYMMDD>-<NNN>`

| Component | Description |
|-----------|-------------|
| `AU` | Project slug (Atlas Universalis) |
| `CYCLE` | Development cycle (currently `C01`) |
| `YYYYMMDD` | Date in America/Kentucky/Louisville timezone |
| `NNN` | 3-digit sequence number for that day (001, 002, ...) |

**To determine sequence number:**
1. Read the current Master_Log.md
2. Find the highest sequence number for today's date
3. Increment by 1

Example: If last entry is `AU-C01-20260131-002`, next is `AU-C01-20260131-003`

---

## Step 3: Create Master Log Entry

Append this template to `docs/master_log/Master_Log.md`:

```markdown
---

## AU-C01-YYYYMMDD-NNN — Title (short + specific)

**Type:** Feature | Fix | Refactor | Decision | Docs | Ops  
**Context:** why this work happened / trigger  
**Change summary:** what changed (plain English)  
**Rationale / tradeoffs:** why this approach, what alternatives were rejected  
**Files touched:**
- `path/to/file1.ext`
- `path/to/file2.ext`

**Commands run:**
```bash
commands executed
```

**Verification:** what you checked + results  
**Notes:** edge cases, follow-ups, TODOs  
**Concepts:** @concept:tag1 @concept:tag2
```

### Entry Type Guidelines

| Type | Use When |
|------|----------|
| Feature | New capability or functionality |
| Fix | Bug fix or error correction |
| Refactor | Code restructuring without behavior change |
| Decision | Choosing between alternatives (ADR-lite) |
| Docs | Documentation-only changes |
| Ops | Deployment, infrastructure, or operational changes |

### Concept Tags

Use `@concept:slug` for cross-reference. Common tags:

- `@concept:branding` — Logo, colors, visual identity
- `@concept:auth` — Authentication/authorization
- `@concept:api` — API endpoints
- `@concept:frontend` — UI/UX changes
- `@concept:deployment` — Deployment/infrastructure
- `@concept:atlas-forge` — AtlasForge playground
- `@concept:quickpro` — QuickPRO/AtlasOps app
- `@concept:master-log` — Documentation system

---

## Step 4: Update PROJECT_OVERVIEW.md

Update `docs/master_log/PROJECT_OVERVIEW.md` when:

1. **New files created** — Add to appropriate section
2. **Files deleted** — Remove from inventory
3. **New directories added** — Add new section
4. **File purpose changed** — Update description

### Update Process

1. Read current PROJECT_OVERVIEW.md
2. Identify which section(s) need updating based on file paths:
   - `atlasops/` → Backend sections
   - `atlasforge/` → Atlas Forge section
   - `frontend-main/` → Main Portfolio Site section
   - `frontend/` → QuickPRO Frontend section
   - `deploy/` → Deployment section
   - etc.
3. Add/remove entries in the appropriate table
4. Update "Last Updated" date in header

### File Entry Format

```markdown
| `filename.ext` | Brief description of purpose |
```

---

## Step 5: Update README.md

Update `README.md` when changes affect public-facing documentation.

### When to Update README

| Change Type | README Section to Update |
|-------------|--------------------------|
| New feature | **Features** section |
| New API endpoint | **API Endpoints** section |
| New directory/structure | **Project Structure** section |
| New dependency | **Tech Stack** section |
| New script | **User Management Scripts** or relevant section |
| New environment variable | **Environment Variables** section |
| Setup process change | **Development Setup** section |
| Deployment change | **Deployment** section |

### README Sections Reference

```markdown
# AtlasOps

## Features
- Feature list with brief descriptions

## Tech Stack
### Backend / ### Frontend
- Technology: version and purpose

## Development Setup
### Prerequisites / ### Backend Setup / ### Frontend Setup
- Step-by-step instructions

## Project Structure
- Directory tree with descriptions

## API Endpoints
### Authentication / ### Jobs / ### Profile / ### Applications
- `METHOD /path` - Description

## Environment Variables
- Variable explanations and examples

## User Management Scripts
- Script commands and descriptions

## Deployment
- Deployment instructions and secrets
```

### Update Process

1. Read current README.md
2. Identify which section(s) need updating based on change type
3. Add/update entries in the appropriate section
4. Maintain consistent formatting with existing entries
5. Keep descriptions concise and actionable

### README Update Guidelines

- **Features**: Use bullet points with bold feature name followed by description
- **API Endpoints**: Use `METHOD /path` format with dash and description
- **Project Structure**: Keep tree format, add new directories/files in correct position
- **Tech Stack**: Include version numbers when relevant
- **Scripts**: Show command and explain what it does

---

## Step 6: Verify Dev Pages

The dev pages (`/dev/log` and `/dev/overview`) read from disk on each request. After updating the markdown files:

1. No additional action needed for content sync
2. If the API endpoints (`/api/v1/dev/log`, `/api/v1/dev/overview`) were modified, ensure they still work
3. If new documentation sections were added, verify they render correctly in the prose styles

---

## Step 7: Report Completion

Return this summary to the primary agent:

```
Version Logger Complete:
- Log Entry: AU-C01-YYYYMMDD-NNN
- Title: [entry title]
- Files updated:
  - docs/master_log/Master_Log.md ✓
  - docs/master_log/PROJECT_OVERVIEW.md [✓ if updated | — if unchanged]
  - README.md [✓ if updated | — if unchanged]
- Dev pages will auto-refresh on next load
```

---

## Examples

### Example 1: Feature Addition

```markdown
## AU-C01-20260131-003 — Add library lazy-loading for Atlas Forge

**Type:** Feature  
**Context:** User requested full integration of major UI libraries with lazy-loading  
**Change summary:** Created dynamic library loader system with lazy imports for Vue and React UI libraries  
**Rationale / tradeoffs:** Dynamic imports ensure fast initial load (~150KB), libraries load on-demand  
**Files touched:**
- `atlasforge/src/lib/library-loader.ts`
- `atlasforge/src/lib/libraries/vuetify-loader.ts`
- `atlasforge/package.json`

**Commands run:**
```bash
cd atlasforge && npm install && npm run build
```

**Verification:** Build output shows proper code splitting  
**Notes:** Large chunks acceptable with lazy loading  
**Concepts:** @concept:atlas-forge @concept:lazy-loading
```

### Example 2: Bug Fix

```markdown
## AU-C01-20260131-004 — Fix scroll indicator overlap on homepage

**Type:** Fix  
**Context:** User reported animated scroll arrow overlapping CTA buttons  
**Change summary:** Moved scroll indicator outside content container, adjusted positioning  
**Rationale / tradeoffs:** Element was inside flex container causing overlap; absolute positioning relative to viewport prevents this  
**Files touched:**
- `frontend-main/src/components/HeroSection.vue`

**Commands run:**
```bash
git add && git commit && git push
```

**Verification:** Visual inspection of live site  
**Notes:** None  
**Concepts:** @concept:homepage-hero @concept:scroll-indicator
```

### Example 3: Decision Record

```markdown
## AU-C01-20260131-005 — Select Orbital Hexagon as final logo

**Type:** Decision  
**Context:** User evaluated 5 hexagonal logo variations  
**Change summary:** Updated atlas-icon.svg with Orbital Hexagon design (bold hexagon, crossing orbital ellipses, A letterform, gold satellite nodes)  
**Rationale / tradeoffs:** 
- Alternatives considered: Layered Depth, Circuit Network, Segmented Modern, Crystalline Gem
- Orbital System chosen for dynamic feel and global reach suggestion
- Works well at small sizes (16px, 32px, 64px)

**Files touched:**
- `frontend-main/public/atlas-icon.svg`

**Commands run:**
```bash
git commit -m "Update logo to Orbital Hexagon design"
```

**Verification:** Logo renders correctly in hero, navbar, footer, and browser tab  
**Notes:** None  
**Concepts:** @concept:branding @concept:final-logo
```

---

## Integration with Primary Agents

### How Primary Agents Should Invoke

After completing work, the primary agent should:

1. Call this skill explicitly: "Invoke the version-logger skill"
2. Provide context about changes made
3. Wait for completion confirmation

### Automatic Invocation Triggers

Primary agents should invoke this skill after:

- Any file write operation
- Git commit or push
- SSH commands to production server
- Database migrations
- Package installations
- Configuration changes

### Commit Message Convention

Include the Log ID in commit messages:

```bash
git commit -m "AU-C01-20260131-003: Add library lazy-loading for Atlas Forge"
```

---

## Maintenance

### Cycle Management

When starting a new development cycle:
1. Increment the cycle number (C01 → C02)
2. Update this skill's documentation
3. Add a cycle boundary entry in Master Log

### PDF Generation

After updating Master_Log.md, regenerate PDF:

```bash
# Windows
.\scripts\build_master_log.ps1

# Linux/Mac
./scripts/build_master_log.sh
```

### Deployment Verification

After changes to documentation or dev portal:
1. Run local dev server to verify rendering
2. Push changes to GitHub
3. Deploy to production
4. Verify dev pages at `https://atlasuniversalis.com/dev/log`
