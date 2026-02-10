---
name: subagent-code-explorer
description: Launch a code-explorer subagent to scan the repo for relevant files, symbols, or patterns. Use when scope is unclear or codebase exploration is needed.
---

# Subagent: Code Explorer

## When to use
- When you need fast repo discovery
- When searching for usage patterns or entry points

## How to run
Use a Subagent with `subagent_type="explore"` (fast model).

Provide:
- What you’re looking for (concepts, files, endpoints)
- Target directories if known

## Expected output
- File list with brief notes
- Pointers to the most relevant files/sections

## Prompt template
```
Find where <concept> is handled in the repo.
Focus on <dirs> if applicable.
Return a short list of files and why they matter.
```
