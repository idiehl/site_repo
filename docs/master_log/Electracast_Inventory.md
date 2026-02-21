# ElectraCast -- Codebase Inventory

**Generated:** 2026-02-18
**Codebase:** `d:\www\atlasuniversalis\electracast`
**Framework:** React 18 + TypeScript + Vite + Tailwind CSS + React Router
**Architecture:** SPA with public marketing site + authenticated creator dashboard

## Repository Metrics

| Metric | Value |
|--------|-------|
| Authored source files | ~55 (excl. images) |
| TSX + TS + CSS LOC | ~5,100 |
| Pages | 12 |
| Components | 15 |
| Dashboard views | 8 |
| Data modules | 12 |

## Architecture Overview

React SPA for the ElectraCast podcast network. Two main sections: (1) public marketing site with Home, Podcasts, Networks, Music, About, Contact, Advertising, Custom Branded, Register, Search pages inside a SiteLayout with header/footer; (2) authenticated creator dashboard (/account) with Overview, Episodes, Create Podcast, Analytics, Upload, Recording, Settings, Help views inside a DashboardLayout. API client communicates with the AtlasOps backend for auth and podcast management. Catalog data (podcasts, networks) loaded from local JSON.

---

## File Inventory

### Configuration

| File | Lines | Description |
|------|-------|-------------|
| `package.json` | ~20 | React 18, react-router-dom, TypeScript, Vite, Tailwind deps. |
| `vite.config.js` | ~7 | Vite with React plugin. |
| `tailwind.config.js` | ~18 | Tailwind with ElectraCast brand colors. |
| `tsconfig.json` | ~15 | Strict TypeScript config. |
| `tsconfig.node.json` | ~8 | Node-side TS config for Vite. |
| `postcss.config.js` | ~3 | Tailwind PostCSS plugin. |
| `index.html` | ~15 | SPA entry point. |
| `styles.css` | ~350 | Global stylesheet with ElectraCast theme, animations, responsive utilities. |

---

### App Entry

#### `src/main.tsx`
| Path | Lines | Description |
|------|-------|-------------|
| `src/main.tsx` | 13 | React 18 createRoot, BrowserRouter wrapping App. |

#### `src/App.tsx`
| Path | Lines | Description |
|------|-------|-------------|
| `src/App.tsx` | 40 | Root component: Routes definition with SiteLayout for public pages, nested /account routes for dashboard. |

Imports: ScrollToHash, SiteLayout, usePageTitle, all dashboard components

#### `src/routes.tsx`
| Path | Lines | Description |
|------|-------|-------------|
| `src/routes.tsx` | 38 | Route definitions array with path, element, title. |

Types: `AppRoute` (path, element, title)

Constants: `defaultTitle`, `routes` (12 public routes)

Routes: /, /search, /podcasts, /podcast/:slug, /networks, /network/:slug, /custom-branded-podcasts, /music, /about, /contact, /advertising, /advertise, /register

#### `src/vite-env.d.ts`
Vite client type reference. 7 lines.

---

### Public Site Components

| File | Lines | Description |
|------|-------|-------------|
| `src/components/SiteLayout.tsx` | 15 | Layout wrapper with SiteHeader, Outlet, SiteFooter. |
| `src/components/SiteHeader.tsx` | 75 | Top nav: logo, nav links, search, mobile menu, login/register buttons. |
| `src/components/SiteFooter.tsx` | 19 | Footer with links and copyright. |
| `src/components/HomeHero.tsx` | 25 | Hero section with tagline and CTA. |
| `src/components/SectionHeader.tsx` | 13 | Reusable section title component. |
| `src/components/PodcastGrid.tsx` | 39 | Grid display of podcast cards with cover art. |
| `src/components/NetworkPills.tsx` | 11 | Pill-style network category filter badges. |
| `src/components/MusicGrid.tsx` | 30 | Grid of music/audio cards. |
| `src/components/FeatureGrid.tsx` | 15 | Feature highlight cards grid. |
| `src/components/NewsList.tsx` | 14 | News/update list items. |
| `src/components/ContactCard.tsx` | 14 | Contact info card. |
| `src/components/AccountCard.tsx` | 20 | Account summary card for logged-in users. |
| `src/components/ScrollToHash.tsx` | 17 | Scrolls to hash fragment on navigation. |

---

### Public Pages

| File | Lines | Description |
|------|-------|-------------|
| `src/pages/Home.tsx` | 63 | Home page: hero, podcast grid, network pills, features, news. |
| `src/pages/Podcasts.tsx` | 23 | Podcast catalog browser with grid. |
| `src/pages/PodcastDetail.tsx` | 131 | Individual podcast page: description, episodes, subscribe links. |
| `src/pages/Networks.tsx` | 44 | Network catalog browser. |
| `src/pages/NetworkDetail.tsx` | 147 | Network detail page: description, podcasts in network. |
| `src/pages/Music.tsx` | 52 | Music catalog with grid. |
| `src/pages/About.tsx` | 130 | About page: company story, team, mission. |
| `src/pages/Contact.tsx` | 85 | Contact form with intake API submission. |
| `src/pages/Advertising.tsx` | 153 | Advertising/sponsorship info and inquiry form. |
| `src/pages/CustomBranded.tsx` | 116 | Custom branded podcasts service page. |
| `src/pages/Register.tsx` | 167 | User registration form with validation. |
| `src/pages/Search.tsx` | 72 | Search page filtering podcasts and networks. |
| `src/pages/MyAccount.tsx` | 340 | Account wrapper: auth check, sidebar nav, dashboard outlet. |

---

### Dashboard Components

#### `src/dashboard/DashboardDataContext.tsx`
| Path | Lines | Description |
|------|-------|-------------|
| `src/dashboard/DashboardDataContext.tsx` | 36 | React context provider for shared dashboard data (account, podcasts). |

#### `src/dashboard/components/DashboardLayout.tsx`
| Path | Lines | Description |
|------|-------|-------------|
| `src/dashboard/components/DashboardLayout.tsx` | 153 | Dashboard shell: sidebar navigation, header with user info, content area with Outlet. |

#### `src/dashboard/components/Overview.tsx`
| Path | Lines | Description |
|------|-------|-------------|
| `src/dashboard/components/Overview.tsx` | 321 | Dashboard home: podcast list, quick stats, recent activity, getting started guide. |

#### `src/dashboard/components/Episodes.tsx`
| Path | Lines | Description |
|------|-------|-------------|
| `src/dashboard/components/Episodes.tsx` | 132 | Episode management: list, status badges, publish/unpublish actions. |

#### `src/dashboard/components/CreatePodcast.tsx`
| Path | Lines | Description |
|------|-------|-------------|
| `src/dashboard/components/CreatePodcast.tsx` | 299 | Multi-step podcast creation form: title, description, categories, language, settings. Submits to API. |

#### `src/dashboard/components/Analytics.tsx`
| Path | Lines | Description |
|------|-------|-------------|
| `src/dashboard/components/Analytics.tsx` | 240 | Analytics dashboard: listen counts, geographic data, device breakdown, time-series charts. |

#### `src/dashboard/components/Upload.tsx`
| Path | Lines | Description |
|------|-------|-------------|
| `src/dashboard/components/Upload.tsx` | 213 | Episode upload: file picker, metadata form, progress tracking. |

#### `src/dashboard/components/Recording.tsx`
| Path | Lines | Description |
|------|-------|-------------|
| `src/dashboard/components/Recording.tsx` | 275 | In-browser recording UI: controls, waveform display, save/export. |

#### `src/dashboard/components/Settings.tsx`
| Path | Lines | Description |
|------|-------|-------------|
| `src/dashboard/components/Settings.tsx` | 219 | Podcast settings: RSS feed config, distribution, monetization, danger zone. |

#### `src/dashboard/components/Help.tsx`
| Path | Lines | Description |
|------|-------|-------------|
| `src/dashboard/components/Help.tsx` | 57 | Help center: FAQ, contact support, documentation links. |

---

### Dashboard Data

#### `src/dashboard/data/mockData.ts`
| Path | Lines | Description |
|------|-------|-------------|
| `src/dashboard/data/mockData.ts` | 182 | Mock data for dashboard development: sample podcasts, episodes, analytics data. |

---

### Data Modules

| File | Lines | Description |
|------|-------|-------------|
| `src/data/podcasts.ts` | 34 | Featured podcast entries for home page. |
| `src/data/networks.ts` | 19 | Network summary data. |
| `src/data/networkPills.ts` | 2 | Network category pill labels. |
| `src/data/music.ts` | 39 | Music catalog entries. |
| `src/data/features.ts` | 25 | Feature highlight content. |
| `src/data/news.ts` | 30 | News/update entries. |
| `src/data/navigation.ts` | 15 | Navigation link definitions. |
| `src/data/social.ts` | 11 | Social media link data. |
| `src/data/advertisers.ts` | 20 | Advertiser info. |
| `src/data/catalog/podcasts.json` | 725 | Full podcast catalog (65 KB). |
| `src/data/catalog/networks.json` | 297 | Network catalog (10 KB). |
| `src/data/catalog/podcastsCatalog.ts` | 14 | Typed loader for podcasts.json. |
| `src/data/catalog/networksCatalog.ts` | 15 | Typed loader for networks.json. |

---

### Library Modules

#### `src/lib/api.ts`
| Path | Lines | Description |
|------|-------|-------------|
| `src/lib/api.ts` | 243 | API client for ElectraCast backend endpoints. |

Types: AuthTokens, PasswordResetResponse, ElectraCastProfile, ElectraCastAccount, ElectraCastPodcast, ElectraCastPodcastCreate, ElectraCastIntakePayload, ElectraCastIntakeResponse

Functions: getStoredAuth(), setStoredAuth(), clearStoredAuth(), registerUser(), loginUser(), requestPasswordReset(), confirmPasswordReset(), getElectraCastAccount(), updateElectraCastProfile(), getElectraCastPodcasts(), createElectraCastPodcast(), submitElectraCastIntake()

Internal: buildUrl(), getErrorMessage(), requestJson(), notifyAuthChange()

#### `src/lib/assets.ts`
| Path | Lines | Description |
|------|-------|-------------|
| `src/lib/assets.ts` | 7 | Asset path helpers for public images. |

---

### Hooks

#### `src/hooks/usePageTitle.ts`
| Path | Lines | Description |
|------|-------|-------------|
| `src/hooks/usePageTitle.ts` | 17 | React hook that sets document.title based on current route. |

---

### Assets

#### `src/assets/main.css`
| Path | Lines | Description |
|------|-------|-------------|
| `src/assets/main.css` | 57 | Component-level styles, Tailwind directives. |