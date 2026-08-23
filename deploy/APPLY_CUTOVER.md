# Atlas Apply Cutover and Rollback

This runbook controls routing cutover from legacy Apply API to the rebuilt C# Apply host.

## Preconditions

- `src/Atlas.Apply` builds and starts successfully.
- `atlas-apply` systemd unit points to `/opt/atlas/apply/Atlas.Apply`.
- `https://apply.atlasuniversalis.com/healthz` returns healthy.
- `pwsh -File deploy/smoke-apply.ps1` passes locally.

## Cutover File

- `deploy/nginx/atlas-route-map.conf`

Current target block:

```nginx
map $request_uri $apply_api_backend {
    default atlas_dotnet_apply;
}
```

## Server Cutover Steps

1. Copy updated config to server.
2. Install to `/etc/nginx/conf.d/atlas-route-map.conf`.
3. Validate config:
   - `sudo nginx -t`
4. Reload nginx:
   - `sudo nginx -s reload`
5. Run quick validation:
   - `curl -I https://apply.atlasuniversalis.com/healthz`
   - `curl -I https://apply.atlasuniversalis.com/api/v2/auth/session`

## Rollback Controls

If errors spike or API behavior regresses:

1. Revert API map default to legacy:

```nginx
map $request_uri $apply_api_backend {
    default atlas_legacy;
}
```

2. Run:
   - `sudo nginx -t`
   - `sudo nginx -s reload`
3. Confirm legacy recovery by checking known stable endpoints.

## Operational Commands

- Restart apply service:
  - `sudo systemctl restart atlas-apply`
- Tail logs:
  - `journalctl -u atlas-apply -n 100 --no-pager`
- Health:
  - `curl -sf http://127.0.0.1:5010/healthz`
