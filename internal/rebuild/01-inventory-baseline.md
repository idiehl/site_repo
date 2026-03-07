# Atlas Rebuild Baseline Inventory

## Purpose

This document captures the current technical baseline and non-negotiable constraints that must be preserved while rebuilding Atlas Universalis on C#.

## Current Application Baseline

- Active solution: `AtlasUniversalis.sln`
- Active web project: `src/Atlas.Web/Atlas.Web.csproj` (`net10.0`)
- Active test project: `tests/Atlas.Web.Tests/Atlas.Web.Tests.csproj`

### Runtime Behavior (Current)

From `src/Atlas.Web/Program.cs`:

- Razor Pages is enabled (`AddRazorPages`).
- Blazor Server services/endpoints are enabled (`AddServerSideBlazor`, `MapBlazorHub`).
- Static asset mapping is enabled (`MapStaticAssets`, `WithStaticAssets`).
- Health endpoint exists at `/healthz`.

From `src/Atlas.Web/Pages/Index.cshtml`:

- The public root route `/` is still a placeholder landing page.

From `tests/Atlas.Web.Tests/UnitTest1.cs`:

- Automated coverage currently validates:
  - `/` responds `200 OK`
  - `/healthz` returns healthy payload

## Infrastructure Baseline

### Host/Edge Topology

- Host model remains VM-based on DigitalOcean (no container orchestrator currently in use).
- Reverse proxy is Nginx.
- Process management is systemd.
- Operational runbook references this model in `deploy/RUNBOOK.md`.

### Upstream and Routing Constraints

From `deploy/nginx/atlas-upstreams.conf`:

- `atlas_legacy` -> `127.0.0.1:8000`
- `atlas_dotnet_web` -> `127.0.0.1:5000`
- `atlas_dotnet_web_vnext` -> `127.0.0.1:5003`
- `atlas_dotnet_apply` -> `127.0.0.1:5010`
- `atlas_dotnet_forge` -> `127.0.0.1:5020`

From `deploy/nginx/atlas-route-map.conf`:

- Main-site default still points to `atlas_legacy`.
- Subdomain cutover is controlled through map-variable defaults.
- Blue/green behavior must be preserved until explicit full cutover.

From `deploy/nginx/atlas-web.conf`:

- `/healthz` is always routed to `.NET` upstream.
- `/` and static assets are routed via `$main_backend`.
- `/_blazor` websocket proxy exists for current server-side Blazor behavior.

## Constraints To Preserve During Rebuild

1. Keep `/healthz` contract available through Nginx and direct Kestrel checks.
2. Do not break existing port expectations (`5000`, `5003`, `5010`, `5020`, `8000`) during phased migration.
3. Maintain route-map based cutover/rollback flow in Nginx while legacy is still present.
4. Keep deployment compatibility with current branch/workflow assumptions (`master`, `.NET 10`) until workflows are intentionally changed.
5. Treat current Blazor Server wiring as transitional state, not final architecture.

## Baseline Decision

The rebuild will proceed as an incremental migration from a Blazor Server placeholder to a hosted Blazor WebAssembly + API topology while preserving existing Nginx/systemd operational controls and health-check behavior.
