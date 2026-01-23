# Server Deployment Setup

This document describes how to set up the server for the Atlas Universalis website restructure.

## Architecture Overview

- **atlasuniversalis.com** - Main portfolio/hub site (static Vue app)
- **quickpro.atlasuniversalis.com** - QuickPRO application (Vue + FastAPI)

## Prerequisites

- DigitalOcean droplet with Ubuntu
- Domain `atlasuniversalis.com` pointing to the droplet
- Nginx installed
- Certbot installed for SSL

## Step 1: DNS Configuration

Add an A record for the QuickPRO subdomain:

```
Type: A
Host: quickpro
Value: [Your Droplet IP]
TTL: 3600
```

## Step 2: Expand SSL Certificate

Run certbot to add the subdomain to your existing certificate:

```bash
sudo certbot certonly --expand \
  -d atlasuniversalis.com \
  -d www.atlasuniversalis.com \
  -d quickpro.atlasuniversalis.com
```

Or if using nginx plugin:

```bash
sudo certbot --nginx --expand \
  -d atlasuniversalis.com \
  -d www.atlasuniversalis.com \
  -d quickpro.atlasuniversalis.com
```

## Step 3: Install Nginx Configurations

1. Copy the configuration files:

```bash
sudo cp deploy/nginx-main-site.conf /etc/nginx/sites-available/atlasuniversalis-main
sudo cp deploy/nginx-quickpro.conf /etc/nginx/sites-available/quickpro
```

2. Remove the old configuration:

```bash
sudo rm /etc/nginx/sites-enabled/atlasuniversalis.com
```

3. Enable the new configurations:

```bash
sudo ln -sf /etc/nginx/sites-available/atlasuniversalis-main /etc/nginx/sites-enabled/
sudo ln -sf /etc/nginx/sites-available/quickpro /etc/nginx/sites-enabled/
```

4. Test and reload:

```bash
sudo nginx -t
sudo systemctl reload nginx
```

## Step 4: Update Production Environment

Update `/var/www/atlasuniversalis.com/.env` with subdomain URLs:

```env
ALLOWED_ORIGINS=https://quickpro.atlasuniversalis.com,https://atlasuniversalis.com
FRONTEND_URL=https://quickpro.atlasuniversalis.com
LINKEDIN_REDIRECT_URI=https://quickpro.atlasuniversalis.com/api/v1/auth/linkedin/callback
GOOGLE_REDIRECT_URI=https://quickpro.atlasuniversalis.com/api/v1/auth/google/callback
STRIPE_SUCCESS_URL=https://quickpro.atlasuniversalis.com/profile?billing=success
STRIPE_CANCEL_URL=https://quickpro.atlasuniversalis.com/profile?billing=cancel
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

# Build QuickPRO app
cd frontend
npm ci
npm run build
cd ..
```

## Step 6: Restart Services

```bash
sudo systemctl restart atlasuniversalis
sudo systemctl reload nginx
```

## Verification

1. Visit https://atlasuniversalis.com - should show the portfolio site
2. Visit https://quickpro.atlasuniversalis.com - should show QuickPRO login
3. Test the API: https://quickpro.atlasuniversalis.com/health
