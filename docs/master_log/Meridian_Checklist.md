# Atlas Meridian — Checklist

**Last Updated:** 2026-02-04

**Purpose:** Rapid capture of medium-term objectives, then refine into a step-by-step path.

## Rapid Capture (Objectives)
- [ ] Fix node shape rendering so ellipse/circle selections update appearance.
- [ ] Add native color picker for node fill and border (no manual hex).
- [ ] Add canvas background color control.
- [ ] Define node content model (text, image, video, file, URL; multiple entries per node).
- [ ] Support file ingestion into nodes (.md, .py, etc.) and URL-based content.
- [ ] Node display shows title + one selected content entry.
- [ ] Decide how full node content inventory is viewed (expand-on-double-click, modal, or side panel).
- [ ] Build dashboard/home page listing canvases with load/create actions.
- [ ] Define canvas file format (serialization, assets, versioning).
- [ ] Add export/import flows for sharing canvases.
- [ ] Plan real-time shared workspace editing (CRDT/OT, presence, conflict resolution).
- [ ] Integrate AI for generative node arrangement and layout suggestions.
- [ ] Explore MCP server integration for external client workflows.

## Focused Path (Step-by-step)
1. [x] Fix node shape rendering (ellipse/circle).
2. [x] Add node/border color pickers and canvas background color.
3. [x] Implement node content model + storage (typed entries, multi-entry per node).
4. [x] Add node display rules (title + selected entry) and expanded view for full inventory.
5. [x] Build canvas dashboard/home and define canvas file format + import/export.
6. [ ] Design shared workspace collaboration (realtime model + sync).
7. [ ] Add AI-assisted node arrangement features.
8. [ ] Evaluate MCP server integration strategy.

## Notes / Dependencies
- Node expansion view is available on double-click; inline rename moved to Alt + double-click.
- Canvas files now use `.atlas` (JSON) with metadata and a recent-files dashboard.
- Collaboration groundwork started: workspace/revision metadata and change log scaffolding.
- AI layout groundwork started: added a basic auto-arrange (grid) action as a placeholder.
- Node content rendering now supports images and text previews; video/URL show placeholders with open file/URL actions; PDF preview is pending richer parsing.
