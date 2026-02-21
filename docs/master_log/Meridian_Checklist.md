# Atlas Meridian — Checklist

**Last Updated:** 2026-02-18

**Purpose:** Phased development roadmap derived from architecture analysis and feature design documents.

## Rapid Capture (Objectives)
- [ ] Remove bin/obj from source control; add proper .gitignore
- [ ] Fix ServiceTypeVisibilityConverter missing reference
- [ ] Add UglyToad.PdfPig NuGet dependency explicitly
- [ ] Add schema versioning to CanvasDocument (SchemaVersion field)
- [ ] Replace stringly-typed enums (NodeShape, NodeServiceType, LinkRenderStyle) with strong types
- [ ] Introduce LinkType semantics (Associative / Operative / Structural)
- [ ] Define NodeHash addressing scheme (computed human-readable address)
- [ ] Define NodeMap data structure (frame layout metadata vs. explicit entity)
- [ ] Implement auto ParentFrameId assignment on drag-end
- [ ] Add node resize handles + snap/grid
- [ ] Refactor right sidebar into three-tab model (Style / Structure / Content)
- [ ] Implement workspace tree with search and NodeHash jump-to
- [ ] Define INodeService contract (preview renderer, expanded view, lifecycle)
- [ ] Implement service registry keyed by NodeServiceType enum
- [ ] Add built-in services: Text, Image, PDF, Web
- [ ] Choose embedded interpreter (recommended: Jint/JS)
- [ ] Implement Meridian Terminal as command console
- [ ] Define standard library: workspace/node/frame/link queries
- [ ] Add Script nodes (output = generated nodes/links/content)
- [ ] Define PresentationDocument model (slides/scenes/assets)
- [ ] Implement Content Editor for node content editing
- [ ] Implement PDF export pipeline
- [ ] Design AI proposal engine (diff-based edits)
- [ ] Implement undo/redo based on CanvasChange
- [ ] Add search across nodes, content, NodeHash, frames
- [ ] Implement render virtualization for large canvases

## Focused Path (Step-by-step)

### Phase 0 — Hygiene + Build Determinism (P0)
1. [x] Fix node shape rendering (ellipse/circle)
2. [x] Add node/border color pickers and canvas background color
3. [x] Implement node content model + storage (typed entries, multi-entry per node)
4. [x] Add node display rules (title + selected entry) and expanded view
5. [x] Build canvas dashboard/home and define canvas file format + import/export
6. [ ] Remove bin/obj from source control; configure .gitignore
7. [ ] Fix missing ServiceTypeVisibilityConverter symbol
8. [ ] Verify/add PdfPig NuGet dependency
9. [ ] Centralize persistence (ICanvasStore service layer)
10. [ ] Add minimal CI step (restore/build/test)

### Phase 1 — Data Model + Schema Foundations (P0)
11. [ ] Add SchemaVersion to CanvasDocument + migration pipeline
12. [ ] Replace string enums with strong types (NodeShape, LinkRenderStyle, etc.)
13. [ ] Introduce LinkType (Associative / Operative / Structural) to Link model
14. [ ] Implement NodeHash as computed address with alias resolution
15. [ ] Define NodeMap as frame layout mode (FrameLayoutKind metadata)

### Phase 2 — Canvas Interaction + Containment (P1)
16. [ ] Implement auto ParentFrameId on drag-end (smallest containing frame)
17. [ ] Add node and frame resize handles with full interaction flow
18. [ ] Add snap/grid and alignment guides
19. [ ] Improve link editing (create, delete, relabel, re-route)

### Phase 3 — UI Restructure (P1)
20. [ ] Refactor sidebar to three tabs: Style, Structure, Content (later AI)
21. [ ] Implement workspace tree (FrameTreeItem) with search + NodeHash jump
22. [ ] Add bottom-left quick toolbar for core actions
23. [ ] Implement Node Expanded overlay with connected-nodes by LinkType
24. [ ] Add command palette (Ctrl+P)
25. [ ] Add mode indicator strip (Link Mode, Presentation Mode, etc.)

### Phase 4 — Node Services Framework (P1)
26. [ ] Define INodeService contract (capabilities, preview, expanded view, lifecycle)
27. [ ] Implement service registry keyed by NodeServiceType enum
28. [ ] Built-in services: Text, Image, PDF (text preview), Web (WebView)
29. [ ] Add Terminal as service type (Phase 5 dependency)
30. [ ] Move content preview rendering from CanvasView to service-specific logic

### Phase 5 — Scripting + Terminal (P1)
31. [ ] Integrate Jint (JavaScript) as embedded interpreter
32. [ ] Implement Meridian Terminal (command console, not OS shell)
33. [ ] Define standard library: workspace, node, frame, presentation objects
34. [ ] Add Script nodes with generated output
35. [ ] Establish deterministic execution + logging

### Phase 6 — Presentation Mode (P2)
36. [ ] Define PresentationDocument model (slides/scenes/assets)
37. [ ] Implement Content Editor (edit node content as slide assets)
38. [ ] Implement Preview runtime (play slides, step timeline)
39. [ ] PDF export pipeline
40. [ ] Integrate scripting for scene orchestration

### Phase 7 — AI Agent Integration (P2)
41. [ ] Design AI as proposal engine (generate diffs)
42. [ ] Create AI sidebar tab with chat + actions
43. [ ] Add context tools (use selection, frame, connected nodes)
44. [ ] Add provenance tagging (AI-generated nodes tagged in CanvasChange)

### Phase 8 — Polish + QA (P3)
45. [ ] Undo/redo based on CanvasChange entries
46. [ ] Search everywhere (nodes, content, NodeHash, frames)
47. [ ] Performance: render virtualization, image cache policy, large-canvas optimization
48. [ ] Testing: serializer round-trip + migration tests
49. [ ] Accessibility + theming polish

## Notes / Dependencies
- Node expansion view is available on double-click; inline rename moved to Alt + double-click.
- Canvas files use `.atlas` (JSON) with metadata and a recent-files dashboard.
- Collaboration groundwork started: workspace/revision metadata and change log scaffolding.
- AI layout groundwork started: basic auto-arrange (grid) action as placeholder.
- Node content rendering supports images and text previews; video/URL show placeholders.
- Recommended interpreter for scripting: JavaScript via Jint (pure .NET, good sandbox).
- Recommended first export format: PDF (easiest to implement).
- Schema versioning and strong typing are P0 blockers that should be resolved before building on top.
