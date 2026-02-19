---
name: subagent-doc-ops
description: Launch a doc-ops subagent to draft MCP payloads for logs, checklists, overview sections, and dev status updates. Use when documentation updates can be parallelized or standardized.
---

# Subagent: Doc Ops

## When to use
- After code changes, before commits, to prepare MCP payloads
- When multiple docs need updates (log + checklist + overview + inventory + status)
- **Include inventory** whenever code files or symbols changed

## How to run
Use a Subagent with `subagent_type="generalPurpose"` (fast model).

Provide:
- Task summary and intent
- Files touched
- Commands run
- Verification notes
- Desired status updates
- App ID (if applicable)

## Expected output
JSON payloads for MCP tools:
- `append_master_log_entry`
- `append_app_log_entry`
- **Inventory updates** (when code files/symbols changed) — Forge_Inventory.md, Apply_Inventory.md, Universalis_Inventory.md, Electracast_Inventory.md, Meridian_Inventory.md per app
- `update_app_checklist` or `update_app_overview_section` (if needed)
- `set_dev_status` (if needed)

## Prompt template
```
Draft MCP payloads for documentation updates.
Context:
- Task summary: ...
- App ID: ...
- Files touched: ...
- Commands run: ...
- Verification: ...
- Code structure changed? (if yes → include inventory update)
- Status updates needed: ...

Return JSON objects only, ready to pass into MCP tools.
Include inventory add/remove entries for affected app(s) when code files/symbols changed.
```
