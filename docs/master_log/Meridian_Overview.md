# Atlas Meridian — Overview

**Last Updated:** 2026-02-18

## Concept

Atlas Meridian is a **Dynamic Visual Interface** and **Canvas Operating System** built with Avalonia UI and .NET 10. Unlike traditional diagramming tools, Meridian treats nodes as interactive containers that can host content (text, media, web, terminal, code) and connect via semantically typed links. The workspace is a zoomable, pannable 2D canvas where frames organize nodes into nested hierarchies.

The long-term vision positions Meridian as a "God Mode" workspace for developers, data scientists, and systems architects who need a spatial view of complex systems — with nodes that execute code, links that drive data flow, and an embedded scripting language for automation.

## Architecture

Meridian follows a straightforward **MVVM** structure across 4 projects:

| Project | Purpose |
|---------|---------|
| `Atlas.Universalis.App` | Avalonia UI shell, inspector panels, menus, MainWindowViewModel |
| `Atlas.Universalis.Canvas` | Custom Skia-backed rendering + interaction (pan/zoom, hit-testing, selection) |
| `Atlas.Universalis.Core` | Persistent document model (Node, Link, Frame, CanvasDocument) + JSON serialization |
| `Atlas.Universalis.Interop` | Placeholder for native platform extensions |

**Interaction flow:** CanvasView owns low-level pointer logic (pan/zoom/drag, hit tests) and publishes selection changes. MainWindowViewModel owns the document and implements all mutations (add/remove/style/save/load). MVVM bindings keep selection state synchronized.

## Technology Stack

| Technology | Version | Role |
|-----------|---------|------|
| .NET | 10.0 | Runtime |
| Avalonia UI | 11.3.11 | Cross-platform UI framework |
| Skia | (via Avalonia) | Canvas rendering |
| LibVLCSharp | 3.9.5 | Video playback in nodes |
| PdfForge.Avalonia | 2.1.2 | PDF preview in nodes |
| WebView.Avalonia | 11.0.0.1 | Embedded web content |
| System.Text.Json | (built-in) | .atlas file serialization |

## Current Capabilities (Implemented)

### Canvas Workspace
- Pan/zoom with mouse wheel and middle-click drag
- Hit-testing for nodes, links, and frames
- Marquee (box) selection, multi-select with Shift
- Node dragging (single and multi-node)

### Nodes
- Geometry and styling (position, size, shape, fill/border colors)
- Content list (multiple entries per node: text, image, video, file, URL)
- Display content selection (choose which content shows on the node surface)
- Image and text preview rendering on canvas
- Service type field (string, for future node runtimes)

### Links
- Curved and straight rendering styles
- Optional arrowheads and labels
- Link selection and hover highlighting
- Context menu for delete, toggle style, toggle arrowhead

### Frames
- Visual grouping containers with nested frame support (ParentFrameId)
- Frame header region and resize handles
- Frame tree UI in sidebar (FrameTreeItem)
- Draw ordering (larger/parent frames behind smaller ones)

### Editing
- Inline rename editor overlay (Alt + double-click)
- Content panel to attach files/URLs/text to nodes
- Batch styling (fill, border, shape, thickness) and batch sizing
- Alignment tools (left, center, right, top, middle, bottom)
- Auto-arrange (basic grid layout)

### Persistence
- Save/load as `.atlas` JSON files (CanvasDocument serialization)
- Recent canvases dashboard with load/create actions
- Document metadata: title, background color, format version, timestamps, workspace ID

### Overlays
- Dashboard overlay (workspace home)
- Node expanded overlay (scaffolding)
- Active nodes overlay (NodeOverlayControl with media support)

## Data Model

### Core Entities
- **Node** — Position, size, shape, styling, service type, content list, display content
- **NodeContent** — Type, value, sort order, source path/URL
- **Link** — Source/target node IDs, style, label, color, thickness, arrowhead
- **Frame** — Position, size, styling, parent frame ID, name
- **CanvasDocument** — Collections of nodes/links/frames/changes, metadata
- **CanvasChange** — Audit log entry (action, target, actor, timestamp, payload)

### File Format
The `.atlas` format is a JSON serialization of CanvasDocument. Currently lacks schema versioning (planned for Phase 1).

## Gaps vs. Full Concept

The following major features from the design documents are **not yet implemented**:

| Feature | Status | Priority |
|---------|--------|----------|
| Node service types (terminal, browser, video player runtimes) | String field stored, no dispatch | P1 |
| Link type semantics (Associative / Operative / Structural) | Not modeled | P0 |
| NodeMap / NodeHash addressing | Not implemented | P1 |
| Presentation Mode | Conceptual only | P2 |
| Embedded terminal + scripting language | Not implemented | P1 |
| AI agent integration | Not implemented | P2 |
| Undo/redo system | CanvasChange exists but no undo stack | P1 |
| Schema versioning for .atlas format | Not implemented | P0 |
| Strong typing for Shape, ServiceType, LinkStyle | Currently strings | P0 |

## Development Phases (Planned)

1. **Phase 0 — Hygiene**: Clean build, .gitignore, dependency fixes, schema versioning
2. **Phase 1 — Data Model**: Strong types, LinkType semantics, NodeHash, NodeMap definition
3. **Phase 2 — Canvas Interaction**: Auto containment, node resize, snap/grid, link editing
4. **Phase 3 — UI Restructure**: Three-tab sidebar (Style/Structure/Content), workspace tree, quick toolbar
5. **Phase 4 — Node Services**: INodeService contract, service registry, built-in types (Text, Image, PDF, Web)
6. **Phase 5 — Scripting + Terminal**: Embedded JS interpreter (Jint), Meridian Terminal, standard library
7. **Phase 6 — Presentation Mode**: PresentationDocument model, Content Editor, Preview, PDF export
8. **Phase 7 — AI Agent**: Proposal engine, diff-based edits, context tools, provenance tagging
9. **Phase 8 — Polish**: Undo/redo, search, performance virtualization, testing, accessibility

## Build & Run

```bash
cd D:\local\Atlas_Meridian
dotnet build .\AtlasUniversalisAvalonia.sln
dotnet run --project .\Atlas.Universalis.App\Atlas.Universalis.App.csproj
```

## References

- Codebase: `D:\local\Atlas_Meridian`
- Landing page: `https://atlasuniversalis.com/meridian`
- Dev portal: `https://atlasuniversalis.com/dev/apps/atlas-meridian/overview`
