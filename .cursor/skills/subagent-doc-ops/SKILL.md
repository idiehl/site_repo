---
name: subagent-doc-ops
description: Launch a doc-ops subagent to draft MCP payloads for logs, checklists, overview sections, and dev status updates. Use when documentation updates can be parallelized or standardized.
---

# Subagent: Doc Ops

## When to use
- After code changes, before commits, to prepare MCP payloads
- When multiple docs need updates (log + checklist + overview + status)

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
- Status updates needed: ...

Return JSON objects only, ready to pass into MCP tools.
```
