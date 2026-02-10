---
name: deploy-checklist
description: Standardize deploy workflow to the DigitalOcean droplet. Use when publishing changes to production or running deploy steps.
---

# Deploy Checklist

## When to use
- Any task that updates production
- Infra/config changes
- Backend schema changes

## Pre-flight
1. Check `/dev` status; must be READY
2. Ensure working tree is clean (except unrelated changes)

## Deploy flow
1. Set STATUS → PENDING with a short note
2. Commit + push local changes
3. SSH pull on droplet
4. Run required build/migration steps
5. Restart or reload services as needed
6. Set STATUS → READY with a short note
7. Record verification in Master Log

## Minimum verification
- Confirm key page loads for the affected app
- Check any updated endpoints respond without errors

## Notes
- If deploy fails, stop and report immediately
- Use Doc Ops (MCP) for log + status updates
