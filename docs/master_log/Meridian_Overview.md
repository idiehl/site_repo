# Atlas Meridian — Overview

**Last Updated:** 2026-02-18

## Concept

Atlas Meridian is a **dynamic visual interface** and **canvas operating system**: a 2D workspace where nodes are not just labels but containers that host content and tools (text, media, web, terminal, etc.) and connect via links. It targets developers, data scientists, and systems architects who need a "God Mode" view of their digital workspace—a zoomable, pannable canvas for organizing ideas, media, and workflows.

---

## Current Implementation

### What Exists Today

- **Canvas workspace**: Pan/zoom, hit-testing, selection (single/multi/marquee). Node dragging, multi-node drag. Basic link rendering with labels and arrowheads.
- **Nodes**: Geometry, styling, content list (`Node` + `NodeContent`). Multiple content items per node; `DisplayContentId` selects which shows on the node surface.
- **Frames**: Visual grouping containers with optional nesting (`Frame` + `ParentFrameId`). Frame header region and resize handle affordance.
- **Links**: Curved/straight, optional arrowheads, labels. Directional linking supported.
- **Editing**: Inline rename overlay (Alt + double-click); content panel to attach files/URLs/text; choose display content.
- **Persistence**: Save/load as `.atlas` JSON (`CanvasDocument` serialization).
- **Utilities**: Batch styling/sizing, basic alignment, auto-arrange.
- **Overlays**: Dashboard overlay + node-expanded overlay scaffolding.
- **Image preview caching**: `CanvasView._imageCache` for decoded bitmap previews.

### Architecture

- **Atlas.Universalis.Core**: Persistence model and JSON serialization (`CanvasDocument`, `Node`, `Link`, `Frame`, `NodeContent`, `DocumentSerializer`).
- **Atlas.Universalis.Canvas**: Custom Avalonia control for rendering + interaction (`CanvasView`).
- **Atlas.Universalis.App**: UI shell, panels, commands (`MainWindowViewModel`).

### Interaction Model

`CanvasView` owns low-level pointer logic (pan/zoom/drag, hit tests) and publishes selection changes. `MainWindowViewModel` owns the document and implements mutations. Bindings keep selection state synchronized.

---

## Canvas Architecture

The Canvas is the primary Meridian workspace: a zoomable, pannable surface that renders Frames, Nodes, and Links. It must remain responsive as documents grow.

### Near-Term Canvas Improvements

- Node resize handles + snap/grid.
- Robust frame containment rules (auto `ParentFrameId` assignment on drag-end).
- Link inspector + `LinkType` semantics (Associative / Operative / Structural) + filtering.
- Minimap + zoom-to-selection/frame.
- Virtualization for large graphs (render only what's on screen; throttle previews).

---

## Content Editor

The Content Editor is where Meridian transitions from "graph of ideas" to editable assets. It provides focused editing for content items attached to nodes while preserving traceability to the workspace graph.

### Responsibilities

- Edit a node's content item (text, image, PDF snippet, video clip) in an expanded, tool-rich view.
- Non-destructive edits via variants (e.g. `Slide02_v1`, `Slide02_v2`) with choice of displayed/published variant.
- Export assets to Presentation Mode and external files.
- Metadata: source path/URL, created/updated times, tags, script provenance.

### Suggested UI Structure

- Left: Associative set / selection set (nodes/assets being edited as a group).
- Main: Content-specific editor (image editor, text editor, PDF viewer).
- Tool strip: Format-specific tools + "Export as…" actions.
- Variant panel: Versions/variants of the asset.
- Breadcrumb: Source node + frame path (clickable to jump back).

---

## Script Runner & Scripting Tab

### Design Goals

- Scripts query and mutate the workspace graph deterministically.
- Stable addressing (NodeHash + stable Id/GUID).
- Cross-platform, sandboxable runtime (no arbitrary .NET execution).
- Observable: log output, diffs, replayability.

### Interpreter Choice

**Recommendation:** JavaScript via Jint as the default Meridian Script language. Pure .NET, cross-platform, easy sandbox (timeouts, no CLR access), familiar syntax. Lua and Python can follow as optional plugins.

### Terminal Integration

- **Command console (recommended):** Meridian-specific REPL running Meridian Script commands and built-in slash commands.
- **OS shell / PTY:** Only if "Meridian as IDE" is an explicit goal; higher security and cross-platform complexity.

### Default Script Library (conceptual)

- `workspace.nodes()`, `workspace.frames()`, `workspace.links()`
- `workspace.find(query)`, `workspace.resolve(nodeHash)`
- `workspace.selection`, `workspace.transaction(fn)`
- `node(idOrHash)`: `node.title`, `node.contents.add()`, `node.linkTo()`
- `frame(idOrHash)`: `frame.children()`, `frame.layout.set()`, `frame.createNodeMap()`
- `presentation.newDeck()`, `presentation.buildFromFrame()`, `presentation.export()`
- `ai.summarize()`, `ai.generateNodes()` (later)

### Scripting Tab UI

- Left: Operative context (inputs, outputs, connected nodes) driven by LinkType filters.
- Top: Script editor with tabs (workspace scripts, node scripts, templates).
- Bottom: Terminal output + prompt input + command history.
- Right: API browser + autocompletion hints.

---

## Presentation Mode

Presentation Mode is the *output runtime* of Meridian. The workspace graph feeds a derived presentation document (slides/scenes/timeline) that can be previewed and exported.

### Core Workflow

1. Select a frame or NodeMap representing a presentation unit (chapter / deck / section).
2. Run a build step (manual or scripted) to produce a `PresentationDocument` from the workspace graph.
3. Use Content Editor to refine assets (non-destructive variants).
4. Use Script tab to orchestrate generation (summaries, layout, exports).
5. Preview in Presentation Mode; export to PDF/PPTX/HTML.

### Use Cases

- Research → executive summary deck
- Engineering system design walkthrough
- Interactive guided tour (presenter + audience views)
- Automated weekly status report from a project frame

### Model Boundary

Define a `PresentationDocument` model separate from `CanvasDocument` and build a deterministic "builder" pipeline. Start with PDF export + internal preview player; add PPTX later.

---

## Link Semantics

Links drive workflows and context navigation. Three proposed types:

| Type | Purpose |
|------|---------|
| **Associative** | Conceptual/contextual association; same-type nodes; navigation in expanded view |
| **Operative** | Data flow, transformations; scripts, pipelines |
| **Structural** | Hierarchy, containment |

Related concept language from the design packet:
- **Relational links:** same-content-type navigation (e.g., text-to-text branch traversal in expanded mode).
- **Live links:** cross-type runtime composition (e.g., text + image/video behavior in a shared expanded context).

**Refinements:** Add `LinkType` and `Direction` (None/Forward/Bi) to the model early. Add link filtering in UI (toggle by type, show/hide labels). Consider link inspector in sidebar.

---

## NodeMaps & Addressing

- **NodeMaps**: Structured groupings inside frames; addressable (e.g. `Frame2|NodeMap5|2`). Can represent grids, lists, system diagrams.
- **NodeHash**: Human-readable address layered on stable Id/GUID. Resolvable through a lookup index; support aliasing when reorganizing.
- **Frame layout kinds:** Freeform, NodeMapGrid, NodeMapRadial.
- **Terminal-style addressing goals:** support symbolic and indexed calls such as `GET (MyTable, 4, 7)` in Meridian-native command runtime.

---

## AI Panel (Future)

- AI as a proposal engine: generate a diff (nodes/links/frames changes) that the user can accept/reject.
- AI sidebar tab with chat + actions (generate NodeMap, summarize node content, propose structure).
- Context tools: "Use selection", "Use frame", "Use connected nodes by link type".
- Provenance: AI-generated nodes tagged; changes recorded in `CanvasChange` with `actorId`.

---

## Roadmap (Phased)

| Phase | Focus |
|-------|--------|
| **P0** | Hygiene + build determinism: remove bin/obj from source control, fix missing symbols, add CI |
| **P1** | Data model + schema: versioning, enums for Shape/ServiceType/LinkType, NodeHash, NodeMap |
| **P2** | Canvas interaction + containment: auto ParentFrameId, resize handles, snap/grid |
| **P3** | UI restructure: Style/Structure/Content/AI tabs, workspace tree, Node Expanded |
| **P4** | Node services framework: `INodeService`, registry, Text/Image/PDF/Web/Terminal |
| **P5** | Scripting + terminal: Jint, command console, standard library |
| **P6** | Presentation Mode: PresentationDocument, Content Editor, Preview, PDF export |
| **P7** | AI Agent integration |
| **P8** | Polish: undo/redo, search, virtualization, tests |

---

## References

- `docs/master_log/Meridian_Log.md`
- `docs/master_log/Meridian_Checklist.md`
- `docs/master_log/Meridian_Inventory.md`
- `internal/MERIDIAN NOTES.md`, `internal/OVERVIEW.md`, `internal/TASK.md`
