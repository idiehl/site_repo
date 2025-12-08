
# AtlasUniversalis Web Stack – Architectural Overview

This document describes how your current site is put together: code, infrastructure, and the bridge between Python (FastAPI/Jinja) and the Vue navigation, as it exists right now in the `site_repo` project.

---

## 1. High‑level architecture

At a birds‑eye view:

```text
GitHub repo (idiehl/site_repo)
    ↓ (push to master)
GitHub Actions "Deploy to DigitalOcean" workflow
    ↓ (SSH)
DigitalOcean droplet  (Ubuntu)
    ├─ Nginx  (public :80 / :443)
    │    ↓ reverse proxy
    └─ Uvicorn + FastAPI app in app.py  (127.0.0.1:8000)
            ↓
     PostgreSQL (pages table: slug, title, html)
            ↓
  Static assets (css/, image/, svg/, video/, javascript/dist/)
            ↓
  Vue 3 (ChapterNav) injected into templates/base.html
```

Key ideas:

- **GitHub** is the source of truth for code and deployment automation.
- The **DigitalOcean droplet** runs the Python app in a virtualenv under a systemd service (`atlasuniversalis`) and exposes it to the internet via **Nginx**.
- **FastAPI** serves both:
  - JSON APIs (`/api/pages*`)
  - HTML pages via **Jinja2 templates**.
- Page **content** lives in a **PostgreSQL** table `pages`.
- The **Vue 3 navigation** is dynamically hydrated from JSON data that the Python app injects into the base template.

---

## 2. Source control & CI/CD (GitHub)

### 2.1 Repository

- Repo root (on your machine / droplet):
  - `app.py` – main FastAPI application.
  - `requirements.txt` – Python dependencies.
  - `css/` – global CSS for layout and typography.
  - `html/` – original static chapter HTML files (source for DB import).
  - `templates/` – Jinja2 templates used by FastAPI for HTML responses.
  - `frontend/` – Vue 3 + Vite project (source for the chapter navigation bundle).
  - `javascript/` – compiled/bundled JS (including Vue bundle).
  - `image/`, `svg/`, `video/` – media assets.
  - `library/` – a separate HTML/JS sandbox for “library” content.
  - `README.md` – repo overview (currently more focused on static site history).

### 2.2 GitHub Actions deployment

File: `.github/workflows/deploy.yml`

- Trigger: `push` to `master`.
- Job:
  - Uses `appleboy/ssh-action` to SSH into the DigitalOcean droplet.
  - Script (on the droplet):
    ```bash
    cd /var/www/atlasuniversalis.com
    git pull origin master
    .venv/bin/pip install -r requirements.txt
    sudo systemctl restart atlasuniversalis
    ```
- This means:
  - **GitHub** is the canonical source for all code.
  - **Deployment** is a pull‑based, SSH‑triggered update:
    - Pull latest code.
    - Upgrade/install packages into the droplet’s `.venv`.
    - Restart the `atlasuniversalis` service to pick up changes.

---

## 3. Python backend – FastAPI app (`app.py`)

### 3.1 Configuration & environment

At the top of `app.py`:

- Uses `dotenv.load_dotenv()` to load environment variables from a `.env` file (if present).
- Key environment variables:
  - `DATABASE_URL` – required; e.g. `postgresql+asyncpg://user:pass@host/dbname`.
  - `HOST` – default `127.0.0.1`.
  - `PORT` – default `8000`.
- Establishes:
  - `BASE_DIR` – the filesystem root of the project.
  - `metadata` – SQLAlchemy metadata registry.

### 3.2 Data model: `pages` table

Defined via SQLAlchemy Core:

- Table: `pages`
  - `slug` (primary key, `String(128)`)
  - `title` (`String(255)`)
  - `html` (`Text`) – HTML fragment containing the page body.

This is the **canonical source** for chapter content in the running site. The `html` field is not a full page; it’s the inner content that is slotted into the shared layout.

A small `Settings` dataclass plus `get_settings()`:

- Creates an **async engine** with `create_async_engine(DATABASE_URL)`.
- Creates a `session_factory` for `AsyncSession`.
- `get_settings()` is cached with `@lru_cache`, so the engine/session factory is created once per process.

### 3.3 Static mounts

The FastAPI app mounts several static directories:

- `/css` → `css/`
- `/javascript` → `javascript/`
- `/image` → `image/`
- `/video` → `video/`
- `/svg` → `svg/`

These are served by FastAPI/Uvicorn rather than directly by Nginx. From the browser’s perspective, URLs like `/css/style.css` and `/image/greenhouse.png` come from the same origin as the HTML.

### 3.4 Jinja2 templates

`templates = Jinja2Templates(directory=str(BASE_DIR / "templates"))`

Templates:

- `templates/base.html`
- `templates/index.html`
- `templates/page.html`

(These are described in detail in section 4.)

### 3.5 Navigation order

`NAV_ORDER` in `app.py` defines the canonical order of chapters (by slug):

```python
NAV_ORDER = [
    "earth_climate",
    "ice_age",
    "evolution",
    "genus_homo",
    "speech_evolution",
    "culture",
    "human_emission",
    "oral_tradition",
    "new_age",
    "coming_storm",
    "perfect_storm",
    "citations",
]
```

This list controls chapter ordering anywhere the nav is generated.

### 3.6 JSON API endpoints

All page content can be accessed/manipulated programmatically via JSON APIs:

- `GET /api/pages`
  - Returns `list[Page]` with `{slug, title, html}`.
- `GET /api/pages/{slug}`
  - Returns a single page.
  - `404` if slug not found.
- `POST /api/pages`
  - Accepts a JSON body with `slug`, `title`, `html`.
  - Inserts a row into `pages`.
- `DELETE /api/pages/{slug}`
  - Removes a page from the table.

Currently these endpoints are primarily for **maintenance/admin** (import tools, future editors), not used directly by the Vue nav.

### 3.7 HTML endpoints (templated pages)

These are the core user‑facing routes:

1. `GET /` (`home` endpoint)
   - Fetches navigation items via `_get_nav_items(session)`:
     - Selects `slug` and `title` from `pages`.
     - Sorts them according to `NAV_ORDER`.
   - Builds:
     - `nav_items` – Python list of `{slug, title}`.
     - `nav_items_json` – JSON stringified version of that list.
   - Renders `templates/index.html` with context:
     - `request`
     - `nav_items`
     - `nav_items_json`
     - `current_slug = None`

2. `GET /pages/{slug}` (`render_page` endpoint)
   - Fetches the requested page from the `pages` table.
   - If not found, raises 404.
   - Also fetches nav items as above.
   - Renders `templates/page.html` with:
     - `request`
     - `page` – a `Page` model instance with `slug`, `title`, `html`.
     - `nav_items`
     - `nav_items_json`
     - `current_slug = slug`

These endpoints are where **Jinja2** and **Vue** meet: the same context populates both the Jinja layout and the Vue navigation.

### 3.8 DB utilities & CLI helpers

Inside `app.py` there are utility functions that are usually run manually from the command line:

1. **`init_db()`**
   - Runs `metadata.create_all` against the configured database.
   - Creates the `pages` table if it does not exist.

2. **`import_html_dir(html_dir: Path | str | None = None)`**
   - Default `html_dir` is `BASE_DIR / "html"`.
   - For each `.html` file:
     - Derives a slug from the filename (special case: `landing.html` → slug `"coming_storm"`).
     - Extracts a title from:
       - `<div class= "pagetitle"><h1>…</h1>` if present; otherwise a prettified slug.
     - Extracts the main body from between:
       - `<div class= "sectioncenter">` and `<div class= "footwrapper">`.
     - Rewrites internal links:
       - `href="name.html"` → `href="/pages/name"`.
       - `href="name.html#anchor"` → `href="/pages/name#anchor"`.
   - Upserts into the `pages` table:
     - Insert if no row exists for `slug`.
     - Update existing rows otherwise.

3. **Command‑line usage**
   - `python app.py --init-db`
     - Creates tables.
   - `python app.py --import-html ./html`
     - Imports all chapter HTML from `html/` into the DB.
   - `python app.py` (no args)
     - Runs a local development server via `uvicorn.run("app:app", host=HOST, port=PORT, reload=True)`.

---

## 4. Templating & page layout (Jinja2 + CSS)

### 4.1 `templates/base.html`

The base template provides the shared frame that every page uses:

- `<head>`:
  - Sets HTML `<title>` using `page.title` or `"Home"` with a `head_title` block.
  - Loads:
    - `/css/style.css`
    - Google font **Aldrich**.

- `<body>`:
  - Contains the main **grid layout** wrapping header, left nav, main content, right sidebar, and footer.
  - Uses classes defined in `css/style.css` such as `.wrapper`, `.headerbox`, `.navbox`, `.sectionwrapper`, etc.

**Chapter navigation root:**

Inside the `navbox` area:

```html
<div class="navbox"
     id="chapter-nav-root"
     data-current-slug="{{ current_slug or '' }}"
     data-nav-items='{{ nav_items_json | safe }}'>

    <!-- Fallback if JS is disabled -->
    <noscript>
        {% if nav_items %}
            <ul class="chapter-nav">
                {% for item in nav_items %}
                    <li class="chapter-nav-item{% if current_slug == item.slug %} is-active{% endif %}">
                        <a href="{{ request.url_for('render_page', slug=item.slug) }}">
                            {{ item.title }}
                        </a>
                    </li>
                {% endfor %}
            </ul>
        {% endif %}
    </noscript>
</div>
```

- The `data-*` attributes are critical:
  - `data-nav-items` carries the JSON created by Python.
  - `data-current-slug` tells Vue which item is active.
- The `<noscript>` block ensures navigation still works without JavaScript.

At the bottom of the body:

```html
<script type="module" src="/javascript/dist/assets/main.js"></script>
```

- Loads the bundled Vue code that will “take over” `#chapter-nav-root`.

There are also template blocks for inserting:

- `page_title` – displayed within the layout’s title area.
- `page_subtitle` – a subtitle text block.
- `content` – main section body content.

These blocks are used by `index.html` and `page.html`.

### 4.2 `templates/index.html`

Home page template:

```jinja2
{% extends "base.html" %}

{% block page_title %}
    <h1>Welcome</h1>
{% endblock %}

{% block page_subtitle %}
    <p>A guided tour through climate, evolution, speech, and culture.</p>
{% endblock %}

{% block content %}
    <div class="sectiontitle">
        <h1>Chapters</h1>
    </div>

    <div class="sectionbody">
        <p>Select a chapter to begin:</p>
        <ul>
            {% for item in nav_items %}
                <li>
                    <a href="{{ request.url_for('render_page', slug=item.slug) }}">
                        {{ item.title }}
                    </a>
                </li>
            {% endfor %}
        </ul>
    </div>
{% endblock %}
```

- Uses server‑rendered list of `nav_items` in the main content.
- Navigation sidebar is independently rendered by Vue.

### 4.3 `templates/page.html`

Per‑chapter page:

```jinja2
{% extends "base.html" %}

{% block content %}
    {{ page.html | safe }}
{% endblock %}
```

- Injects the HTML fragment from the `pages.html` column **inside** the shared layout.
- This is where all imported chapter content shows up.

### 4.4 Global styles (`css/style.css`)

Key responsibilities:

- Defines the **grid layout**:
  - Header, left nav, main content, right sidebar, footer.
  - Ensures `.navbox`, `.sectionwrapper`, `.rightsidebarwrapper`, etc. align.
- Typography:
  - Uses **Aldrich** for headings and various title elements.
  - Provides classes like `.pagetitle`, `.pagetitlesub`, `.sectiontitle`, `.sectionbody`.
- Nav & sidebars:
  - `.chapter-nav`, `.chapter-nav-item`, `.chapter-nav-item.is-active`.
- Handles the issues you’ve been tuning recently:
  - Making sure nav items stay in the container.
  - Ensuring the footer sits below the page content.
  - Ensuring the right sidebar is aligned (and not forced to the bottom) once all pages share the same structural wrappers.

---

## 5. Vue 3 chapter navigation (frontend/ → javascript/dist/)

### 5.1 Vue source project (`frontend/`)

The Vue side is a standard Vite project:

- `frontend/package.json` – declares `"vue"` and `"vite"` plus build scripts.
- `frontend/src/main.js` – entry point:
  - Waits for `DOMContentLoaded`.
  - Locates `const navRoot = document.getElementById('chapter-nav-root')`.
  - Reads:
    - `const itemsJson = navRoot.dataset.navItems || '[]'`
    - `const currentSlug = navRoot.dataset.currentSlug || ''`
  - Safely `JSON.parse`s the items string.
  - Calls:
    ```js
    createApp(ChapterNav, {
      items,
      currentSlug,
    }).mount(navRoot)
    ```

- `frontend/src/components/ChapterNav.vue`:
  - `props`:
    - `items: Array`
    - `currentSlug: String`
  - `computed normalizedItems`:
    - Maps each item and adds `isActive: item.slug === currentSlug`.
  - Template:
    ```vue
    <ul class="chapter-nav">
      <li
        v-for="item in normalizedItems"
        :key="item.slug"
        class="chapter-nav-item"
        :class="{ 'is-active': item.isActive }"
      >
        <a :href="`/pages/${item.slug}`">
          {{ item.title }}
        </a>
      </li>
    </ul>
    ```

### 5.2 Bundled output (`javascript/dist/assets/main.js`)

- The Vite build produces a bundle under `frontend/dist/assets/…`.
- That bundle has been copied into `javascript/dist/assets/main.js`.
- `base.html` loads it as:

  ```html
  <script type="module" src="/javascript/dist/assets/main.js"></script>
  ```

- **Do not edit** `main.js` directly; instead:
  - Edit the Vue code under `frontend/src/`.
  - Run `npm run build` in `frontend/`.
  - Copy/update the generated assets into `javascript/dist/assets/`.

### 5.3 Template injection flow (Python → Jinja → Vue)

Putting it all together:

1. **FastAPI** obtains `nav_items` from PostgreSQL and JSON‑encodes it (`nav_items_json`).
2. **Jinja2** renders `base.html`, embedding:
   - The human‑readable nav in `<noscript>` using `{% for item in nav_items %}`.
   - The same nav serialized into `data-nav-items='{{ nav_items_json | safe }}'`.
3. On the client, the **Vue bundle** reads `data-nav-items` and `data-current-slug`, then:
   - Parses the JSON.
   - Mounts `ChapterNav` into `#chapter-nav-root`.
4. The Vue component **replaces** the inner DOM of `#chapter-nav-root` (except `<noscript>`) with the dynamic list:
   - Visual highlighting of the active chapter.
   - Future enhancements (e.g., collapsible sections, progress UI) can be added here without changing Python.

---

## 6. Static & legacy files

### 6.1 `html/` – original static chapters

- Files such as:
  - `earth_climate.html`
  - `ice_age.html`
  - `evolution.html`
  - `genus_homo.html`
  - `speech_evolution.html`
  - `culture.html`
  - `human_emission.html`
  - `new_age.html`
  - `coming_storm.html`
  - `perfect_storm.html`
  - `citations.html`
- These are no longer served directly in production.
- Instead, they are **source documents** for `import_html_dir`, which populates the `pages` table.

### 6.2 Root `index.html`

- A static HTML file in the repo root:
  - Represents an earlier “standalone” introduction page.
  - It demonstrates the same CSS layout and a hand‑written chapter index.
- Functionally replaced by the dynamic `templates/index.html` in the running FastAPI app.

### 6.3 `library/` directory

- Contains:
  - `library.html`
  - `info.js` – lots of jQuery experimentation.
- Currently behaves as a **sandbox/demo** and is not wired into the new FastAPI/Jinja/Vue architecture.

### 6.4 Media: `image/`, `svg/`, `video/`

- `image/` – PNG, JPG, GIF assets used throughout the chapters.
- `svg/` – vector diagrams.
- `video/` – MP4 and GIF animations.
- All are exposed via FastAPI static mounts and referenced within the chapter HTML and templates.

---

## 7. Runtime environment on DigitalOcean

### 7.1 Directory layout & virtualenv

On the droplet, your deployment script implies:

- Project directory: `/var/www/atlasuniversalis.com`
  - `app.py`, `requirements.txt`, and all project folders live here.
  - Python virtualenv: `/var/www/atlasuniversalis.com/.venv`
    - Uvicorn and all Python packages are installed into this venv.
- You often work with:
  ```bash
  cd /var/www/atlasuniversalis.com
  source .venv/bin/activate
  sudo systemctl restart atlasuniversalis
  ```

### 7.2 Systemd service (`atlasuniversalis`)

While the unit file isn’t in the repo, the pattern is:

- A systemd service named `atlasuniversalis` that:
  - Sets `WorkingDirectory=/var/www/atlasuniversalis.com`.
  - Uses the virtualenv’s Python/uvicorn, for example:
    ```ini
    ExecStart=/var/www/atlasuniversalis.com/.venv/bin/uvicorn app:app         --host 127.0.0.1 --port 8000
    ```
  - Runs as a non‑root user.
  - Restarts on failure.
  - Starts automatically on boot.

This is the process that GitHub Actions restarts.

### 7.3 Nginx

Nginx runs in front of Uvicorn and handles:

- Listening on HTTP/HTTPS (ports 80/443).
- Terminating TLS (if certificates are configured).
- Proxying all application requests to the FastAPI app:
  - `location /` → `proxy_pass http://127.0.0.1:8000;`
- Optionally handling:
  - Compression, caching headers, security headers.
  - Redirects (e.g., `www` → bare domain, or HTTP → HTTPS).

For the Vue app and static assets, the paths like `/javascript/dist/assets/main.js` and `/css/style.css` are simply forwarded to Uvicorn, which serves them from the mounted static directories.

---

## 8. Development workflow (local vs. droplet)

### 8.1 Backend (FastAPI) – local

Typical local steps:

1. Create & activate a virtualenv:
   ```bash
   python -m venv .venv
   source .venv/bin/activate
   ```
2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
3. Ensure PostgreSQL is running and create a DB.
4. Set `DATABASE_URL` in `.env`.
5. Initialize schema & import HTML content:
   ```bash
   python app.py --init-db
   python app.py --import-html ./html
   ```
6. Run the dev server:
   ```bash
   python app.py
   # or, explicitly:
   uvicorn app:app --reload
   ```

### 8.2 Frontend (Vue) – local

In `frontend/`:

1. Install Node dependencies:
   ```bash
   cd frontend
   npm install
   ```
2. Run the dev server:
   ```bash
   npm run dev
   ```
   - For pure dev, you can temporarily point your base template’s `<script>` tag to the Vite dev server (typically `http://localhost:5173/src/main.js`) if you want full hot‑module reload.

3. Build for production:
   ```bash
   npm run build
   ```
   - Copy the resulting bundle from `frontend/dist/assets/` into `javascript/dist/assets/`.

### 8.3 Production deployment

- Commit and push changes to `master` on GitHub.
- GitHub Actions runs the `Deploy to DigitalOcean` workflow, which:
  - SSHes into the droplet.
  - Pulls the latest code.
  - Installs/updates Python dependencies.
  - Restarts the `atlasuniversalis` service.

No manual steps are required beyond pushing to `master`.

---

## 9. Current direction & design goals

Based on our recent work and discussions, the current trajectory is:

1. **Unify layout via templates**
   - All chapters are rendered through `base.html` → `page.html`.
   - This ensures:
     - Identical nav, header, right sidebar, and footer on every page.
     - Consistent grid behavior (no more right sidebar falling below content on some pages).

2. **Clean HTML structure for imported content**
   - Make sure each imported page’s HTML:
     - Fits cleanly inside the `.sectionwrapper` / `.sectioncenter` layout.
     - Avoids extra `<html>`, `<body>`, or mismatched wrappers that could break the grid.
   - Tweak `import_html_dir` or the source HTML as needed.

3. **Robust, dynamic chapter navigation**
   - Use the Vue `ChapterNav` component as the canonical nav implementation.
   - Keep server‑rendered `<noscript>` nav for accessibility and SEO.
   - Eventually add richer features:
     - Progress indication, hover/expand interactions, maybe ancillary metadata.

4. **Incremental modernization, minimal disruption**
   - Start from existing static content and styling.
   - Gradually move logic into:
     - The DB (`pages` table).
     - The Python app (FastAPI/Jinja2).
     - The Vue components (for interactivity).
   - Avoid large breaking changes so that the site stays deployable at all times.

5. **Foundation for future content editing**
   - JSON API (`/api/pages`) already supports basic CRUD.
   - Future work could add:
     - A simple authenticated admin UI that uses these endpoints.
     - Full replacement of the “import from HTML” workflow with in‑browser editing.

---

## 10. Summary

- **GitHub** is your collaboration hub and deployment trigger.
- The **DigitalOcean droplet** hosts a FastAPI app served by **Uvicorn**, fronted by **Nginx**, managed by **systemd**.
- A **PostgreSQL** database stores page content in a single `pages` table, populated by importing legacy HTML.
- **Jinja2 templates** define a consistent site‑wide layout; each page’s body is an HTML fragment stored in the DB.
- A **Vue 3** component (ChapterNav) renders an interactive chapter list, with data injected from Python via HTML `data-*` attributes.
- Static assets (CSS, images, SVGs, videos, and built JS) live in dedicated directories and are exposed via FastAPI’s static mounts.

This doc should be “good enough” for any future collaborator to understand how pieces fit together and where to look when changing content, layout, navigation, or infrastructure.
