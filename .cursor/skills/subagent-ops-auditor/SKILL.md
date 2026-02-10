---
name: subagent-ops-auditor
description: Launch an ops-auditor subagent to check DNS, SSL, and Nginx health. Use for production incidents, HTTPS warnings, or connectivity failures.
---

# Subagent: Ops Auditor

## When to use
- HTTPS/SSL warnings
- DNS resolution issues
- Nginx listener or routing problems
- Mobile/IPv6 connectivity incidents

## How to run
Use a Subagent with `subagent_type="shell"`.

Provide:
- Domains to check
- Expected behavior
- Any recent config changes

## Expected output
- DNS A/AAAA resolution summary
- Cert validity + SAN coverage
- Nginx listener status
- Recommended next actions
