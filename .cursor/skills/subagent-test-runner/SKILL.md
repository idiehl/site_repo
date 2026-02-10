---
name: subagent-test-runner
description: Launch a test-runner subagent to smoke test key URLs and report pass/fail results. Use after deploys or UI changes.
---

# Subagent: Test Runner

## When to use
- After deploys
- After frontend or routing changes

## How to run
Use a Subagent with `subagent_type="browser-use"`.

Provide:
- URLs to verify
- Any expected content or checks
- Optional screenshots needed

## Expected output
- Pass/fail for each URL
- Notes on errors

## Prompt template
```
Smoke test the following URLs:
- https://atlasuniversalis.com
- https://apply.atlasuniversalis.com
- https://electracast.atlasuniversalis.com
- https://forge.atlasuniversalis.com

Report pass/fail and any visible errors.
```
