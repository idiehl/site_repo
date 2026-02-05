# Server Deployment Setup

This document describes how to set up the server for the Atlas Universalis website restructure.

## Architecture Overview

- **atlasuniversalis.com** - Main portfolio/hub site (static Vue app)
- **apply.atlasuniversalis.com** - Atlas Apply application (Vue + FastAPI)
- **forge.atlasuniversalis.com** - Atlas Forge UI playground (Astro + Vue + React)
- **electracast.atlasuniversalis.com** - ElectraCast development mirror (static)

## Prerequisites

- DigitalOcean droplet with Ubuntu
- Domain `atlasuniversalis.com` pointing to the droplet
- Nginx installed
- Certbot installed for SSL

## Step 1: DNS Configuration

Add A records for the Atlas Apply and ElectraCast subdomains:

```
Type: A
Host: apply
Value: [Your Droplet IP]
TTL: 3600

Type: A
Host: electracast
Value: [Your Droplet IP]
TTL: 3600
```

## Step 2: Expand SSL Certificate

Run certbot to add the subdomain to your existing certificate:

```bash
sudo certbot certonly --expand \
  -d atlasuniversalis.com \
  -d www.atlasuniversalis.com \
  -d apply.atlasuniversalis.com \
  -d forge.atlasuniversalis.com \
  -d electracast.atlasuniversalis.com
```

Or if using nginx plugin:

```bash
sudo certbot --nginx --expand \
  -d atlasuniversalis.com \
  -d www.atlasuniversalis.com \
  -d apply.atlasuniversalis.com \
  -d forge.atlasuniversalis.com \
  -d electracast.atlasuniversalis.com
```

## Step 3: Install Nginx Configurations

1. Copy the configuration files:

```bash
sudo cp deploy/nginx-main-site.conf /etc/nginx/sites-available/atlasuniversalis-main
sudo cp deploy/nginx-atlas-apply.conf /etc/nginx/sites-available/atlas-apply
sudo cp deploy/nginx-electracast.conf /etc/nginx/sites-available/electracast
```

2. Remove the old configuration:

```bash
sudo rm /etc/nginx/sites-enabled/atlasuniversalis.com
```

3. Enable the new configurations:

```bash
sudo ln -sf /etc/nginx/sites-available/atlasuniversalis-main /etc/nginx/sites-enabled/
sudo ln -sf /etc/nginx/sites-available/atlas-apply /etc/nginx/sites-enabled/
sudo ln -sf /etc/nginx/sites-available/electracast /etc/nginx/sites-enabled/
```

4. Test and reload:

```bash
sudo nginx -t
sudo systemctl reload nginx
```

## Step 4: Update Production Environment

Update `/var/www/atlasuniversalis.com/.env` with subdomain URLs:

```env
ALLOWED_ORIGINS=https://apply.atlasuniversalis.com,https://atlasuniversalis.com
FRONTEND_URL=https://apply.atlasuniversalis.com
LINKEDIN_REDIRECT_URI=https://apply.atlasuniversalis.com/api/v1/auth/linkedin/callback
GOOGLE_REDIRECT_URI=https://apply.atlasuniversalis.com/api/v1/auth/google/callback
STRIPE_SUCCESS_URL=https://apply.atlasuniversalis.com/profile?billing=success
STRIPE_CANCEL_URL=https://apply.atlasuniversalis.com/profile?billing=cancel
```

## Step 5: Build Both Frontends

The GitHub Actions workflow will automatically build both frontends on push to master.

For manual deployment:

```bash
cd /var/www/atlasuniversalis.com

# Build main portfolio site
cd frontend-main
npm ci
npm run build
cd ..

# Build Atlas Apply app
cd frontend
npm ci
npm run build
cd ..

# ElectraCast mirror is static (no build step)
```

## Step 6: Restart Services

```bash
sudo systemctl restart atlasuniversalis
sudo systemctl reload nginx
```

## Verification

1. Visit https://atlasuniversalis.com - should show the portfolio site
2. Visit https://apply.atlasuniversalis.com - should show Atlas Apply login
3. Test the API: https://apply.atlasuniversalis.com/health
