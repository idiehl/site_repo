# Atlas Apply Connector Extension

## Purpose

Collect job listing context from the active browser tab and submit it to:

- `POST /api/v2/ingestion/extension`

## Load Locally

1. Open Chrome extensions page.
2. Enable Developer Mode.
3. Load unpacked extension from `src/Atlas.Apply/extension`.

## Packaging

Run:

`pwsh -File deploy/package-apply-extension.ps1`

This creates `src/Atlas.Apply/wwwroot/atlas-apply-extension.zip` for nginx and app download compatibility.

## Release Notes

### 0.2.0

- Added capture defaults in popup for status, priority, resume variant, cover tone, and focus areas.
- Added persisted popup preferences using `chrome.storage.local`.
- Added reset-to-defaults action and clearer success/error capture feedback.
- Aligned payload fields with current Atlas Apply ingestion and board workflows.
