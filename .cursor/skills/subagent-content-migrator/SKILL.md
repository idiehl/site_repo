---
name: subagent-content-migrator
description: Launch a content-migrator subagent to extract legacy HTML/text/assets into structured data modules. Use during ElectraCast or legacy page migrations.
---

# Subagent: Content Migrator

## When to use
- Migrating legacy HTML content into React data modules
- Extracting copy, lists, and image URLs

## How to run
Use a Subagent with `subagent_type="explore"`.

Provide:
- Target page or section
- Source file paths
- Desired output shape (bullets or data module fields)

## Expected output
- Structured content summary
- Source file references
- Suggested data module entries
