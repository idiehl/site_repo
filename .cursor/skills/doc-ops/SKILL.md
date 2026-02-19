---
name: doc-ops
description: Update Atlas Universalis documentation via atlasops-dashboard MCP tools (master log, app logs, inventory, checklist, overview sections, dev status). Use when a task requires documentation updates or status changes.
---

# Doc Ops (MCP)

## When to use
- Any task that needs log/overview/checklist/inventory/status updates
- After deploys or documentation-only changes
- **Inventory required** when code files or symbols are added/modified/deleted

## Required inputs
- App ID when applicable: `atlas-forge`, `atlas-apply`, `atlas-universalis`, `electracast`, `atlas-meridian`
- Short, plain-language summary of the task
- Files touched + commands run (if any)

## Workflow (pick tier)
**Fast Path** — tiny non-code changes (copy, typo)
1. `append_master_log_entry`

**Standard Path** — code files/symbols changed
1. `append_master_log_entry`
2. `append_app_log_entry`
3. **Inventory update** when code structure/behavior changes (MCP or manual):
   - `docs/master_log/{Forge,Apply,Universalis,Electracast,Meridian}_Inventory.md` — per app affected
4. `update_app_checklist` or `update_app_overview_section` if needed

**Full Path**
1. `append_master_log_entry`
2. `append_app_log_entry`
3. **Inventory update** (per app affected)
4. `update_app_checklist` and/or `update_app_overview_section`
5. `set_dev_status` (PENDING → READY as appropriate)

## MCP tool templates

### append_master_log_entry
Required: `title`, `entry_type`, `context`, `change_summary`
Optional: `rationale`, `files_touched`, `commands_run`, `verification`, `notes`, `concepts`

### append_app_log_entry
Required: `app_id`, `items`

### update_app_checklist
Use one or more: `tasks_to_add`, `tasks_to_check`, `tasks_to_uncheck`

### update_app_overview_section
Required: `app_id`, `section`, `items`
Optional: `mode` (`append`, `prepend`, `replace`)

### set_dev_status
Required: `status` (`READY`, `PENDING`, `BLOCKED`)
Optional: `message`, `updated_by`

### App Inventory (manual or MCP when available)
Files: `docs/master_log/Forge_Inventory.md`, `Apply_Inventory.md`, `Universalis_Inventory.md`, `Electracast_Inventory.md`, `Meridian_Inventory.md`
Update when: code files/symbols added, modified, or removed for that app.

## Verification
- Read updated files after MCP calls to confirm content
- If MCP is unavailable, edit manually and note the fallback in Master Log
