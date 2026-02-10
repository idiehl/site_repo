---
name: subagent-deploy
description: Launch a deploy subagent to push changes and run droplet pull/build/reload steps. Use when publishing changes to production.
---

# Subagent: Deploy

## When to use
- After commits are ready to push
- When deploy steps can be delegated

## How to run
Use a Subagent with `subagent_type="shell"`.

Provide:
- Branch name
- Required build/migration steps
- Services to restart or reload
- Any verification checks

## Expected output
- Command transcript + outcomes
- Errors or warnings called out explicitly

## Prompt template
```
Deploy to production.
Steps:
1) git push
2) ssh pull on droplet
3) run build/migrations if needed
4) restart/reload services
5) report success/failure
```
