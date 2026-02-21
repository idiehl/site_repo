# Atlas Universalis (Main Site) -- Codebase Inventory

**Generated:** 2026-02-18
**Codebase:** `d:\www\atlasuniversalis\frontend-main`
**Framework:** Vue 3.4 + Vite 5 + Tailwind CSS
**Architecture:** SPA with vue-router, landing page + developer portal

## Repository Metrics

| Metric | Value |
|--------|-------|
| Authored source files | ~21 |
| Vue + JS + CSS LOC | ~3,170 |
| Views | 11 |
| Components | 6 |

## Architecture Overview

Single-page Vue 3 app serving the Atlas Universalis main website and developer portal. The landing page (HomeView) renders Hero, About, Apps, Projects, and Footer sections. The developer portal (/dev/*) provides log viewers, overview editors, checklists, and inventory displays powered by the AtlasOps dev API.

---

## File Inventory

### Configuration

| File | Lines | Description |
|------|-------|-------------|
| `package.json` | ~15 | Vue 3, vue-router, Tailwind, Vite dependencies. |
| `vite.config.js` | ~6 | Vite with Vue plugin. |
| `tailwind.config.js` | ~35 | Tailwind with custom night/brand color palette. |
| `postcss.config.js` | ~3 | Tailwind + autoprefixer PostCSS config. |
| `index.html` | ~25 | SPA entry point with Atlas Universalis meta tags. |

### App Entry

#### `src/main.js`
Creates Vue app with router. 7 lines.

#### `src/App.vue`
Root component rendering RouterView. 8 lines.

### Router

#### `src/router/index.js`
| Path | Lines | Description |
|------|-------|-------------|
| `src/router/index.js` | 71 | Vue Router with 11 routes and smooth scroll behavior. |

Routes: / (home), /meridian, /dev (login), /dev/dashboard, /dev/log, /dev/overview, /dev/apps/:appId/log, /dev/apps/:appId/overview, /dev/apps/:appId/checklist, /dev/apps/:appId/inventory

---

### Landing Page Components

#### `src/components/HeroSection.vue`
| Path | Lines | Description |
|------|-------|-------------|
| `src/components/HeroSection.vue` | 55 | Hero banner with tagline, animated background, CTA buttons. |

#### `src/components/AboutSection.vue`
| Path | Lines | Description |
|------|-------|-------------|
| `src/components/AboutSection.vue` | 260 | About section: mission statement, team info, technology stack overview. |

#### `src/components/AppsSection.vue`
| Path | Lines | Description |
|------|-------|-------------|
| `src/components/AppsSection.vue` | 142 | App showcase cards: Atlas Apply, Atlas Forge, Atlas Meridian, ElectraCast with links. |

#### `src/components/ProjectsSection.vue`
| Path | Lines | Description |
|------|-------|-------------|
| `src/components/ProjectsSection.vue` | 225 | Projects portfolio section with feature highlights and screenshots. |

#### `src/components/NavBar.vue`
| Path | Lines | Description |
|------|-------|-------------|
| `src/components/NavBar.vue` | 95 | Top navigation bar with logo, nav links, mobile menu toggle. |

#### `src/components/FooterSection.vue`
| Path | Lines | Description |
|------|-------|-------------|
| `src/components/FooterSection.vue` | 77 | Footer with links, branding, copyright. |

#### `src/components/DevStatusBanner.vue`
| Path | Lines | Description |
|------|-------|-------------|
| `src/components/DevStatusBanner.vue` | 158 | Developer portal status banner: shows current dev status (READY/PENDING/BLOCKED) fetched from API. |

---

### Views

#### `src/views/HomeView.vue`
| Path | Lines | Description |
|------|-------|-------------|
| `src/views/HomeView.vue` | 20 | Home page composing NavBar, Hero, About, Apps, Projects, Footer sections. |

#### `src/views/MeridianView.vue`
| Path | Lines | Description |
|------|-------|-------------|
| `src/views/MeridianView.vue` | 192 | Atlas Meridian product page: feature description, screenshots, download info. |

---

### Developer Portal Views

#### `src/views/DevLoginView.vue`
| Path | Lines | Description |
|------|-------|-------------|
| `src/views/DevLoginView.vue` | 107 | Developer portal login with token authentication. |

#### `src/views/DevDashboardView.vue`
| Path | Lines | Description |
|------|-------|-------------|
| `src/views/DevDashboardView.vue` | 217 | Dev dashboard: app cards with status indicators, quick links to logs/overview/checklist per app. DevStatusBanner integration. |

#### `src/views/DevLogView.vue`
| Path | Lines | Description |
|------|-------|-------------|
| `src/views/DevLogView.vue` | 182 | Master log viewer: rendered markdown from AtlasOps API with refresh. |

#### `src/views/DevOverviewView.vue`
| Path | Lines | Description |
|------|-------|-------------|
| `src/views/DevOverviewView.vue` | 182 | Project overview viewer: rendered markdown sections from API. |

#### `src/views/DevAppLogView.vue`
| Path | Lines | Description |
|------|-------|-------------|
| `src/views/DevAppLogView.vue` | 227 | Per-app log viewer with appId routing. Fetches and renders app-specific log markdown. |

#### `src/views/DevAppOverviewView.vue`
| Path | Lines | Description |
|------|-------|-------------|
| `src/views/DevAppOverviewView.vue` | 227 | Per-app overview viewer with section editing capability. |

#### `src/views/DevAppChecklistView.vue`
| Path | Lines | Description |
|------|-------|-------------|
| `src/views/DevAppChecklistView.vue` | 283 | Per-app checklist viewer: rendered markdown checklist with interactive checkboxes. |

#### `src/views/DevAppInventoryView.vue`
| Path | Lines | Description |
|------|-------|-------------|
| `src/views/DevAppInventoryView.vue` | 226 | Per-app inventory viewer: renders codebase inventory markdown from API. |

---

### Assets

#### `src/assets/main.css`
| Path | Lines | Description |
|------|-------|-------------|
| `src/assets/main.css` | 105 | Global styles: Tailwind directives, dark theme, custom font imports, scrollbar styling. |