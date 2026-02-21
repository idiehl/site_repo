Run a full production health check for Atlas Universalis. Execute both checks in parallel:

**1. Infrastructure audit** — Use the `/ops-auditor` subagent to check:
- DNS resolution for all domains (atlasuniversalis.com, apply.atlasuniversalis.com, forge.atlasuniversalis.com, electracast.atlasuniversalis.com)
- SSL certificate validity and expiry
- Nginx config test and service status
- FastAPI backend service status (`atlasuniversalis.service`)
- Port listeners (80, 443, 8000)

**2. Smoke tests** — Use the `/test-runner` subagent to verify all app URLs load correctly (HTTP 200, visible content, no blank screens).

After both complete, produce a combined summary:
- Infrastructure: all green / issues found
- Smoke tests: all pass / N failures
- Action items: any recommended fixes

If the user provided additional context after `/health`, focus the checks on those specific domains or services.
