# Main Site VNext Cutover Runbook

Purpose: switch only the main site backend to `Atlas.Web.VNext` after gates pass, with fast rollback.

## Preconditions

1. `Atlas.Web.VNext` deployed and healthy on `http://127.0.0.1:5003/healthz`.
2. Readiness packet produced from smoke checks and tests.
3. Route map file available at `/etc/nginx/conf.d/atlas-route-map.conf`.

## Gate Commands

Run from repo root:

```bash
dotnet build tests/Atlas.Web.VNext.Tests/Atlas.Web.VNext.Tests.csproj -c Release
dotnet test tests/Atlas.Web.VNext.Tests/Atlas.Web.VNext.Tests.csproj -c Release --no-build
bash scripts/vnext/main-site-smoke.sh http://127.0.0.1:5003 > deploy/readiness/main-site-vnext-readiness.md
```

Gate outcome must contain:

```text
Overall: PASS
```

## Rehearsal (No Live Change)

Use dry-run against the route map to confirm the switch command is valid:

```bash
bash deploy/switch-main-site-backend.sh \
  --target vnext \
  --route-map /etc/nginx/conf.d/atlas-route-map.conf \
  --readiness-packet deploy/readiness/main-site-vnext-readiness.md \
  --dry-run
```

## Live Switch To VNext

```bash
bash deploy/switch-main-site-backend.sh \
  --target vnext \
  --route-map /etc/nginx/conf.d/atlas-route-map.conf \
  --readiness-packet deploy/readiness/main-site-vnext-readiness.md
```

Expected behavior:

- `main_backend` becomes `atlas_dotnet_web_vnext`
- nginx configuration validates and reloads
- backup route-map file is created automatically

## Fast Rollback To Legacy

```bash
bash deploy/switch-main-site-backend.sh \
  --target legacy \
  --route-map /etc/nginx/conf.d/atlas-route-map.conf
```

## Optional PowerShell Equivalent

```powershell
pwsh -File deploy/switch-main-site-backend.ps1 `
  -Target vnext `
  -RouteMap /etc/nginx/conf.d/atlas-route-map.conf `
  -ReadinessPacket deploy/readiness/main-site-vnext-readiness.md
```
