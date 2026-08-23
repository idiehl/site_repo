# Bringing the Legacy Site Back Online

While the C# migration continues, the **legacy** stack (site-repo: Python FastAPI + Vue frontends) can run alongside it. The Nginx route map already defines `atlas_legacy` → `127.0.0.1:8000`. When the legacy service is running and the map points the main site to `atlas_legacy`, the public site is the legacy Vue app and API.

## Prerequisites

- **Legacy source:** A clone or copy of the pre–C# site repo (e.g. `github.com/idiehl/site-repo` or `C:\Users\ihigg\Git\github\site_repo`) at `/var/www/atlasuniversalis.com/legacy` on the server.
- **Python 3.11+**, **Node.js 18+**, **PostgreSQL**, **Redis** on the droplet (same as current RUNBOOK assumptions).

## 1. Put Legacy Code on the Server

On the server (or from your machine with deploy access):

```bash
# Example: clone site-repo into legacy directory (do this once)
sudo mkdir -p /var/www/atlasuniversalis.com
cd /var/www/atlasuniversalis.com
sudo git clone <your-site-repo-url> legacy
sudo chown -R www-data:www-data legacy
```

If you already have the repo elsewhere, copy or rsync it into `/var/www/atlasuniversalis.com/legacy` so that paths below match.

## 2. Python Environment and Dependencies

```bash
cd /var/www/atlasuniversalis.com/legacy
sudo -u www-data python3 -m venv .venv
sudo -u www-data .venv/bin/pip install -r requirements.txt
# If you use async PostgreSQL driver:
# sudo -u www-data .venv/bin/pip install asyncpg
```

## 3. Environment and Database

```bash
cd /var/www/atlasuniversalis.com/legacy
sudo -u www-data cp .env.example .env
# Edit .env with production values: DATABASE_URL, REDIS_URL, SECRET_KEY,
# ALLOWED_ORIGINS (include https://atlasuniversalis.com, https://apply.atlasuniversalis.com), etc.

# Run migrations
sudo -u www-data .venv/bin/alembic upgrade head
```

## 4. Build Frontends

The process on port 8000 serves the **main site** from `frontend-main/dist`. Build it so the legacy app can mount it at `/`.

```bash
cd /var/www/atlasuniversalis.com/legacy

# Main portfolio site (required for main site when traffic goes to atlas_legacy)
sudo -u www-data bash -c "cd frontend-main && npm ci && npm run build"

# Optional: Atlas Apply Vue frontend (if you want Apply to use legacy frontend)
# sudo -u www-data bash -c "cd frontend && npm ci && npm run build"

# Optional: Forge, ElectraCast (if you use legacy Nginx configs that serve them)
# sudo -u www-data bash -c "cd atlasforge && npm ci && npm run build"
# electracast may be static or have its own build
```

## 5. Uploads and Extensions (if used)

```bash
# Uploads directory is created by the app; ensure writable
sudo -u www-data mkdir -p /var/www/atlasuniversalis.com/legacy/uploads/avatars
# Nginx atlas-apply.conf aliases /uploads/ to atlasops/uploads — use a symlink so Apply sees legacy uploads:
sudo mkdir -p /var/www/atlasuniversalis.com
sudo ln -sfn /var/www/atlasuniversalis.com/legacy/uploads /var/www/atlasuniversalis.com/atlasops/uploads
```

If you do not use a symlink, ensure the app and Nginx use the same uploads path (e.g. set Nginx alias to `legacy/uploads` if you prefer).

## 6. Install and Start the Legacy Service

From the **current** (C#) repo on the server:

```bash
cd /var/www/atlasuniversalis.com
sudo cp deploy/systemd/atlas-legacy.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable atlas-legacy
sudo systemctl start atlas-legacy
sudo systemctl status atlas-legacy
```

Verify:

```bash
curl -s http://127.0.0.1:8000/health
# Expect: {"status":"healthy","version":"0.1.0"}
```

## 7. Route Main Site Traffic to Legacy

The main site backend is controlled by the Nginx route map. To send **main site** traffic to the legacy app:

```bash
sudo nano /etc/nginx/conf.d/atlas-route-map.conf
```

Set:

```nginx
map $request_uri $main_backend {
    default atlas_legacy;
}
```

Then:

```bash
sudo nginx -t && sudo nginx -s reload
```

After this, `https://atlasuniversalis.com/` is served by the legacy app (frontend-main at `/`). Apply and Forge continue to use their current backends unless you change their map variables.

## 8. Optional: Apply API on Legacy

Apply **API** is already wired to legacy when `$apply_api_backend` is `atlas_legacy` (see `atlas-route-map.conf`). Apply **frontend** is currently `atlas_dotnet_apply`. To serve the legacy Vue Apply frontend you’d either:

- Point Apply Nginx to static `legacy/frontend/dist` and keep API to `atlas_legacy`, or
- Change `$apply_frontend_backend` to `atlas_legacy` and have the legacy app serve both main site and Apply (would require Host-based or path-based logic in the app).

For “bring as much back as possible” without changing the app further, keeping Apply API on legacy (default) and main site on legacy is enough.

## 9. Optional: Forge and ElectraCast

- **Forge:** Current config proxies to `$forge_backend` (default `atlas_legacy`). So Forge traffic hits the Python app on 8000. The legacy app does not serve Forge’s Astro app by default; you’d need either a separate static server block for `legacy/atlasforge/dist` or Host-based serving in the app. Easiest: leave Forge on .NET for now, or add a legacy Nginx server block that serves `legacy/atlasforge/dist` for `forge.atlasuniversalis.com`.
- **ElectraCast:** Usually a static site; add a server block that serves `legacy/electracast/dist` if you want it from the legacy repo.

## 10. Roll Back to .NET Main Site

To switch the main site back to the C# app:

```bash
sudo nano /etc/nginx/conf.d/atlas-route-map.conf
# Set: default atlas_dotnet_web;
sudo nginx -t && sudo nginx -s reload
```

You can leave `atlas-legacy.service` running; only the route map determines which backend answers for the main site.

## Quick Reference (Legacy)

| Item | Value |
|------|--------|
| Legacy code path | `/var/www/atlasuniversalis.com/legacy` |
| Port | 8000 |
| systemd unit | `atlas-legacy.service` |
| Health | `http://127.0.0.1:8000/health` |
| Main site static | `legacy/frontend-main/dist` (served by app at `/`) |
