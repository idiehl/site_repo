# Main Site VNext Readiness Packet

Date: `<YYYY-MM-DD>`
Environment: `<local|staging>`
Commit: `<sha>`

## Route Smoke Matrix

| Route | Expected | Actual | Result |
|---|---:|---:|---|
| `/healthz` | 200 |  |  |
| `/` | 200 |  |  |
| `/meridian` | 200 |  |  |
| `/pages/about` | 200 |  |  |
| `/pages/does-not-exist` | 404 |  |  |

## Build/Test Gate

- `dotnet build tests/Atlas.Web.VNext.Tests/Atlas.Web.VNext.Tests.csproj -c Release`
- `dotnet test tests/Atlas.Web.VNext.Tests/Atlas.Web.VNext.Tests.csproj -c Release --no-build`

## Decision

- `GO` only if all smoke checks and tests pass.
- `NO-GO` otherwise.
