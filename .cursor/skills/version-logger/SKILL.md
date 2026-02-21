---
name: version-logger
description: Format specs for Atlas Universalis log entries and inventory records. Reference this skill when creating Master Log entries or updating app inventories.
---

# Version Logger — Format Reference

## Log ID Format

`AU-<CYCLE>-<YYYYMMDD>-<NNN>`

| Component | Description |
|-----------|-------------|
| `AU` | Project slug |
| `CYCLE` | Development cycle (currently `C01`) |
| `YYYYMMDD` | Date in America/Kentucky/Louisville timezone |
| `NNN` | 3-digit sequence number for that day (001, 002, ...) |

To determine sequence: read `docs/master_log/Master_Log.md`, find the highest NNN for today, increment by 1.

## Master Log Entry Template

Append to `docs/master_log/Master_Log.md`:

```markdown
---

## AU-C01-YYYYMMDD-NNN — Title (short + specific)

**Type:** Feature | Fix | Refactor | Decision | Docs | Ops
**Context:** why this work happened
**Change summary:** what changed (plain English)
**Rationale / tradeoffs:** why this approach
**Files touched:**
- `path/to/file.ext`

**Commands run:**
```bash
commands executed
```

**Verification:** what you checked + results
**Notes:** edge cases, follow-ups
**Concepts:** @concept:tag1 @concept:tag2
```

## Concept Tags

Common tags for cross-reference:
`@concept:branding`, `@concept:auth`, `@concept:api`, `@concept:frontend`, `@concept:deployment`, `@concept:atlas-forge`, `@concept:quickpro`, `@concept:master-log`

## Inventory Entry Format

Used in `docs/master_log/*_Inventory.md` files:

| App ID | File |
|--------|------|
| atlas-forge | `Forge_Inventory.md` |
| atlas-apply | `Apply_Inventory.md` |
| atlas-universalis | `Universalis_Inventory.md` |
| electracast | `Electracast_Inventory.md` |
| atlas-meridian | `Meridian_Inventory.md` |

Per-file entry structure:

```markdown
### `path/to/file.ext`

| Attribute | Value |
|-----------|-------|
| Type | .ext |
| Size | X KB |
| Lines | ~N |

Description of what the file does.

**Types defined:** `ClassName1`, `ClassName2`

**Methods:**

| Name | Return Type | Access | Description |
|------|------------|--------|-------------|
| methodName | void | public | What it does |

**State Variables:**

| Name | Type | Role |
|------|------|------|
| _fieldName | string | Backing field for X |
```
