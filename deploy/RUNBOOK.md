# Atlas Universalis — Server Setup & Operations Runbook

> **Target:** DigitalOcean Ubuntu droplet at `167.71.179.90`
> **Stack:** .NET 10 / ASP.NET Core (Kestrel) behind Nginx

---

## 1. Install .NET 10 SDK

```bash
# Add Microsoft package repository
wget https://dot.net/v1/dotnet-install.sh -O dotnet-install.sh
chmod +x dotnet-install.sh

# Install .NET 10 SDK (system-wide)
sudo ./dotnet-install.sh --channel 10.0 --install-dir /usr/share/dotnet
sudo ln -sf /usr/share/dotnet/dotnet /usr/bin/dotnet

# Verify
dotnet --version
dotnet --list-sdks
```

Alternative (APT):
```bash
sudo apt-get update
sudo apt-get install -y dotnet-sdk-10.0
```

---

## 2. Create Application Directories

```bash
sudo mkdir -p /opt/atlas/{web,apply,forge}
sudo mkdir -p /opt/atlas/backups/{web,apply,forge}

sudo chown -R www-data:www-data /opt/atlas
sudo chmod -R 755 /opt/atlas
```

---

## 3. Install systemd Service Units

```bash
# Copy unit files from the repo
sudo cp /var/www/atlasuniversalis.com/deploy/systemd/atlas-web.service   /etc/systemd/system/
sudo cp /var/www/atlasuniversalis.com/deploy/systemd/atlas-apply.service /etc/systemd/system/
sudo cp /var/www/atlasuniversalis.com/deploy/systemd/atlas-forge.service /etc/systemd/system/

# Reload systemd to pick up new units
sudo systemctl daemon-reload

# Enable services (start on boot)
sudo systemctl enable atlas-web
sudo systemctl enable atlas-apply
sudo systemctl enable atlas-forge
```

---

## 4. Start Services

```bash
sudo systemctl start atlas-web
sudo systemctl start atlas-apply
sudo systemctl start atlas-forge

# Verify
sudo systemctl status atlas-web
sudo systemctl status atlas-apply
sudo systemctl status atlas-forge
```

---

## 5. Install Nginx Configurations

### 5.1 Upstream & Route Map (loaded globally via conf.d)

```bash
sudo cp /var/www/atlasuniversalis.com/deploy/nginx/atlas-upstreams.conf  /etc/nginx/conf.d/
sudo cp /var/www/atlasuniversalis.com/deploy/nginx/atlas-route-map.conf  /etc/nginx/conf.d/
```

### 5.2 Server Blocks (sites-available + symlink)

```bash
# Copy server block configs
sudo cp /var/www/atlasuniversalis.com/deploy/nginx/atlas-web.conf   /etc/nginx/sites-available/
sudo cp /var/www/atlasuniversalis.com/deploy/nginx/atlas-apply.conf /etc/nginx/sites-available/
sudo cp /var/www/atlasuniversalis.com/deploy/nginx/atlas-forge.conf /etc/nginx/sites-available/

# Enable sites
sudo ln -sf /etc/nginx/sites-available/atlas-web.conf   /etc/nginx/sites-enabled/
sudo ln -sf /etc/nginx/sites-available/atlas-apply.conf /etc/nginx/sites-enabled/
sudo ln -sf /etc/nginx/sites-available/atlas-forge.conf /etc/nginx/sites-enabled/

# Remove old configs if replacing (only after cutover)
# sudo rm /etc/nginx/sites-enabled/atlasuniversalis-main
# sudo rm /etc/nginx/sites-enabled/atlas-apply
# sudo rm /etc/nginx/sites-enabled/atlas-forge
```

---

## 6. Test Nginx Configuration

```bash
sudo nginx -t
```

Expected output:
```
nginx: the configuration file /etc/nginx/nginx.conf syntax is ok
nginx: configuration file /etc/nginx/nginx.conf test is successful
```

If the test fails, check the error message and fix the config before proceeding.

---

## 7. Reload Nginx

```bash
sudo nginx -s reload
```

Or:
```bash
sudo systemctl reload nginx
```

---

## 8. Verify with curl

```bash
# Health checks (always route to .NET regardless of blue/green state)
curl -sf http://127.0.0.1:5000/healthz && echo "Web OK"     || echo "Web FAIL"
curl -sf http://127.0.0.1:5010/healthz && echo "Apply OK"   || echo "Apply FAIL"
curl -sf http://127.0.0.1:5020/healthz && echo "Forge OK"   || echo "Forge FAIL"

# Public endpoints (through Nginx / SSL)
curl -sf https://atlasuniversalis.com/healthz
curl -sf https://apply.atlasuniversalis.com/healthz
curl -sf https://forge.atlasuniversalis.com/healthz

# Verify WebSocket upgrade (Blazor SignalR)
curl -sf -H "Upgrade: websocket" -H "Connection: upgrade" \
     https://atlasuniversalis.com/_blazor -o /dev/null -w "%{http_code}"
# Expect: 101 (Switching Protocols) or 400 (expected without full handshake)
```

---

## 9. Monitoring Commands

### Service Status
```bash
sudo systemctl status atlas-web atlas-apply atlas-forge
```

### Live Logs
```bash
# All .NET services
journalctl -u atlas-web -u atlas-apply -u atlas-forge -f

# Single service
journalctl -u atlas-web -f

# Errors only
journalctl -u atlas-web --since "1 hour ago" --grep="ERROR|CRITICAL"

# Last 100 lines
journalctl -u atlas-apply -n 100 --no-pager
```

### Resource Usage
```bash
# Memory per service
systemctl show atlas-web -p MemoryCurrent
systemctl show atlas-apply -p MemoryCurrent
systemctl show atlas-forge -p MemoryCurrent

# CPU & memory overview
ps aux | grep -E "Atlas\.(Web|Apply|Forge)" | grep -v grep

# Disk usage
df -h /opt/atlas
du -sh /opt/atlas/web /opt/atlas/apply /opt/atlas/forge
du -sh /opt/atlas/backups
```

### Nginx Access & Error Logs
```bash
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log
```

---

## 10. Blue/Green Cutover Procedure

### Cut a Subdomain to .NET

1. Verify .NET service is healthy:
   ```bash
   curl -sf http://127.0.0.1:5000/healthz   # web
   curl -sf http://127.0.0.1:5010/healthz   # apply
   curl -sf http://127.0.0.1:5020/healthz   # forge
   ```

2. Edit the route map — change the default from `atlas_legacy` to the .NET upstream:
   ```bash
   sudo nano /etc/nginx/conf.d/atlas-route-map.conf
   ```
   For example, to cut over the main site:
   ```nginx
   map $request_uri $main_backend {
       default atlas_dotnet_web;   # was: atlas_legacy
   }
   ```

3. Test and reload Nginx:
   ```bash
   sudo nginx -t && sudo nginx -s reload
   ```

4. Verify traffic flows through .NET:
   ```bash
   curl -sf https://atlasuniversalis.com/ -o /dev/null -w "%{http_code}"
   ```

### Roll Back to Legacy

1. Edit the route map — change the default back to `atlas_legacy`:
   ```bash
   sudo nano /etc/nginx/conf.d/atlas-route-map.conf
   ```

2. Test and reload:
   ```bash
   sudo nginx -t && sudo nginx -s reload
   ```

Total rollback time: < 30 seconds.

---

## 11. Rollback Procedures

### Rollback a .NET Deployment (Restore Previous Build)

Using the deploy script:
```bash
cd /var/www/atlasuniversalis.com
./deploy/deploy-dotnet.sh --rollback web     # or apply, forge, all
```

Manually:
```bash
# List available backups
ls -lt /opt/atlas/backups/web/

# Stop service
sudo systemctl stop atlas-web

# Restore from latest backup
LATEST=$(ls -1t /opt/atlas/backups/web/ | head -1)
rsync -a --delete "/opt/atlas/backups/web/${LATEST}/" /opt/atlas/web/

# Restart
sudo systemctl start atlas-web

# Verify
curl -sf http://127.0.0.1:5000/healthz
```

### Rollback Nginx to Pre-Migration Config

```bash
# Restore backed-up configs
sudo cp /etc/nginx/sites-available.bak-*/* /etc/nginx/sites-available/
sudo nginx -t && sudo nginx -s reload
```

### Full Rollback to Legacy Stack

```bash
# 1. Route all traffic back to legacy
sudo nano /etc/nginx/conf.d/atlas-route-map.conf
# Set ALL defaults back to atlas_legacy

# 2. Reload Nginx
sudo nginx -t && sudo nginx -s reload

# 3. Ensure legacy services are running
sudo systemctl start atlasuniversalis
sudo systemctl start celery-worker || true

# 4. Stop .NET services (optional)
sudo systemctl stop atlas-web atlas-apply atlas-forge
```

---

## 12. Common Troubleshooting

### Service Won't Start

```bash
# Check logs
journalctl -u atlas-web -n 50 --no-pager

# Common causes:
# - Port already in use: check with `ss -tlnp | grep 5000`
# - Missing appsettings.json: verify /opt/atlas/web/appsettings.json exists
# - Permission denied: verify ownership is www-data
sudo chown -R www-data:www-data /opt/atlas/web
```

### 502 Bad Gateway from Nginx

The upstream (Kestrel) is not responding.

```bash
# Is the service running?
sudo systemctl status atlas-web

# Is it listening?
ss -tlnp | grep -E "5000|5010|5020"

# Can you reach it directly?
curl -v http://127.0.0.1:5000/healthz
```

### Blazor SignalR Connection Failures

```bash
# Verify WebSocket upgrade is working in Nginx
grep -i "upgrade" /var/log/nginx/error.log

# Check /_blazor location block is present
nginx -T | grep -A5 "_blazor"

# Verify proxy_read_timeout is set (SignalR needs long-lived connections)
nginx -T | grep proxy_read_timeout
```

### High Memory Usage

```bash
# Check per-service memory
systemctl show atlas-web -p MemoryCurrent

# If a service exceeds limits, restart it
sudo systemctl restart atlas-web

# Consider setting MemoryMax in the systemd unit
# [Service]
# MemoryMax=512M
```

### Database Connection Issues

```bash
# Test PostgreSQL connectivity
sudo -u www-data psql -h localhost -U postgres -d atlasops -c "SELECT 1;"

# Check connection string in appsettings
cat /opt/atlas/apply/appsettings.json | grep -i "connection"

# Verify PostgreSQL is running
sudo systemctl status postgresql
```

### SSL Certificate Renewal

Certbot auto-renewal should handle this. Verify:
```bash
sudo certbot certificates
sudo certbot renew --dry-run
```

### Cleaning Up Old Backups

```bash
# List all backups sorted by date
ls -lt /opt/atlas/backups/web/
ls -lt /opt/atlas/backups/apply/
ls -lt /opt/atlas/backups/forge/

# Remove backups older than 14 days
find /opt/atlas/backups -maxdepth 2 -mindepth 2 -type d -mtime +14 -exec rm -rf {} +

# Check disk savings
du -sh /opt/atlas/backups
```

---

## Quick Reference

| Service | Port | systemd unit | Health endpoint |
|---------|------|-------------|-----------------|
| Atlas Web | 5000 | `atlas-web.service` | `http://127.0.0.1:5000/healthz` |
| Atlas Apply | 5010 | `atlas-apply.service` | `http://127.0.0.1:5010/healthz` |
| Atlas Forge | 5020 | `atlas-forge.service` | `http://127.0.0.1:5020/healthz` |
| Legacy (Python) | 8000 | `atlasuniversalis.service` | `http://127.0.0.1:8000/health` |

| Action | Command |
|--------|---------|
| Deploy all | `./deploy/deploy-dotnet.sh all` |
| Deploy one app | `./deploy/deploy-dotnet.sh web` |
| Rollback | `./deploy/deploy-dotnet.sh --rollback web` |
| Cut over to .NET | Edit `atlas-route-map.conf`, `nginx -t && nginx -s reload` |
| Roll back to legacy | Reverse `atlas-route-map.conf`, `nginx -t && nginx -s reload` |
| View logs | `journalctl -u atlas-web -f` |
| Restart service | `sudo systemctl restart atlas-web` |
