---
name: subagent-ci-monitor
description: Launch a CI monitor subagent to check GitHub Actions status and report failures. Use after pushes or when deploys stall.
---

# Subagent: CI Monitor

## When to use
- After a push when deploys are expected
- When CI/CD appears stalled or failing

## How to run
Use a Subagent with `subagent_type="shell"` and the `gh` CLI.

Provide:
- Repo name
- Branch or workflow name (if specific)

## Expected output
- Latest workflow status
- Failed jobs and links
- Suggested next actions
