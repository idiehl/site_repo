---
name: test-runner
description: Run lightweight smoke tests for Atlas Universalis apps. Use when verifying UI or backend changes before/after deploy.
---

# Smoke Test Runner

## When to use
- After frontend changes
- After backend changes or deploys

## Default checks (adjust per task)
1. Main site loads: `https://atlasuniversalis.com`
2. Atlas Apply loads: `https://apply.atlasuniversalis.com`
3. ElectraCast loads: `https://electracast.atlasuniversalis.com`
4. Atlas Forge loads: `https://forge.atlasuniversalis.com`

## App-specific checks
- If only one app is touched, focus on that app’s key routes
- Skip disabled forms or features; note this in verification

## Reporting
- Record results in Master Log verification field
- Note any partial checks or skipped items
