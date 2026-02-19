# Atlas Meridian — Checklist

**Last Updated:** 2026-02-18

**Purpose:** Convert Meridian concept documents into a staged implementation queue for the `/dev` To-Do page.

## Rapid Capture (Objectives)
- [ ] Finalize link taxonomy and behavior contracts (`Relational`, `Live`, plus `Associative/Operative/Structural` metadata).
- [ ] Add stable Node addressing (`NodeGuid` + `NodeHash` aliases) so scripts survive re-organization.
- [ ] Implement NodeMap/table addressing conventions (`GET (Table, Frame, Node)` style lookup).
- [ ] Move persistence to a dedicated store layer (`ICanvasStore`) instead of scattered ViewModel file I/O.
- [ ] Add deterministic Meridian terminal command set (canvas-native, not raw OS shell).
- [ ] Define Script node contract for generated nodes/links/content.
- [ ] Build Presentation pipeline (`CanvasDocument -> PresentationDocument -> Preview/Export`).
- [ ] Add AI proposal workflow (diff + review/accept, never silent mutation).
- [ ] Introduce graph-scale performance targets (virtualization, cache policy, large-map QA fixtures).

## Step-by-Step Path

### Phase 0 — Hygiene + Build Determinism
- [ ] Remove generated `bin/` and `obj/` artifacts from source control and lock `.gitignore`.
- [ ] Resolve missing symbols/dependencies (`ServiceTypeVisibilityConverter`, PDF extraction package consistency).
- [ ] Add CI restore/build/test workflow for Meridian projects.
- [ ] Canonicalize save/load ownership behind one persistence interface.

### Phase 1 — Data Model + Schema Foundations
- [ ] Add document schema version + migration pipeline for `.atlas`.
- [ ] Replace stringly typed fields with enums (`NodeShape`, `NodeServiceType`, `LinkRenderStyle`, `LinkType`).
- [ ] Introduce `LinkType` on model now (UI exposure can follow later).
- [ ] Implement hybrid node identity (`stable GUID` + derived `NodeHash` + alias history).
- [ ] Decide NodeMap representation (stored entity vs frame layout metadata) and codify it.

### Phase 2 — Canvas Interaction + Containment
- [ ] Auto-assign `Node.ParentFrameId` on drag end via geometry containment rules.
- [ ] Implement deterministic frame nesting + draw-order rules.
- [ ] Complete resize handles/flows for nodes and frames.
- [ ] Add snap/grid + alignment guides for NodeMap and presentation layouts.
- [ ] Expand link editing (create/delete/relabel/reroute).

### Phase 3 — UI Restructure
- [ ] Refactor right sidebar into `Style`, `Structure`, `Content`, `AI`.
- [ ] Build searchable workspace tree with `NodeHash` jump-to.
- [ ] Add quick-action toolbar and hotkey discoverability.
- [ ] Expand node overlay with connected-node navigation by link type.

### Phase 4 — Node Services Framework
- [ ] Define `INodeService` contract (preview, expanded renderer, lifecycle, serialization hooks).
- [ ] Implement service registry keyed by `Node.ServiceType`.
- [ ] Ship baseline services: Text, Image, PDF preview, Web.
- [ ] Promote Terminal to a service type once script host is stable.
- [ ] Move content preview logic out of `CanvasView` into service adapters.

### Phase 5 — Scripting + Terminal
- [ ] Adopt JS/Jint as default embedded interpreter with sandbox controls.
- [ ] Implement Meridian terminal command console + execution logs.
- [ ] Add standard library (`workspace`, `node`, `frame`, `presentation`, `export`, `resolve(NodeHash)`).
- [ ] Add Script nodes whose outputs can mutate graph/content deterministically.
- [ ] Persist script run history and replay metadata for debugging.

### Phase 6 — Presentation Mode
- [ ] Define `PresentationDocument` model and builder pipeline from frames/NodeMaps.
- [ ] Implement Content Editor variants for text/image/PDF/video assets.
- [ ] Add Preview runtime with timeline stepping and presenter controls.
- [ ] Ship PDF export first; stage PPTX/HTML export after stable core.
- [ ] Add script hooks for deck generation/orchestration.

### Phase 7 — AI Integration
- [ ] Add AI sidebar with context targeting (`selection`, `frame`, `connected-by-link-type`).
- [ ] Enforce proposal-first edits (diff preview + user acceptance).
- [ ] Record AI provenance in `CanvasChange` (`actorId`, prompt/action metadata).
- [ ] Add rate/cost controls for API-backed AI operations.

### Phase 8 — Polish + QA
- [ ] Implement undo/redo over `CanvasChange` or command stack.
- [ ] Add global search (nodes, content, NodeHash, frame names).
- [ ] Add large-canvas performance profiling + regression checks.
- [ ] Add serializer round-trip + migration compatibility tests.
- [ ] Complete accessibility, keyboard flow, and theming polish.

## Current-State Checks (Already Present)
- [x] Canvas pan/zoom, selection, drag, and base hit-testing.
- [x] Core model entities (`CanvasDocument`, `Node`, `Link`, `Frame`, `NodeContent`).
- [x] `.atlas` save/load and recent-canvas dashboard scaffolding.
- [x] Basic expanded-node/content and inline-edit workflows.
