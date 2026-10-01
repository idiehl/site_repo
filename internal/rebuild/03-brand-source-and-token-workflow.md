# Atlas Brand Source of Truth and Token Workflow

## Canonical Design Source

The approved Atlas logo is the restored antique gold Atlas-and-globe emblem in
`src/Atlas.Web/wwwroot/brand/atlas-emblem.png` (transparent PNG, 1254 × 1254).
It replaces both the circular A mark and the earlier parchment-backed artwork.
Use this same image for website branding, hero artwork, tabs and saved shortcuts;
do not redraw it from the historical Figma references below.
Run `tools/Export-AtlasBrand.ps1` on Windows to package the checked-in PNG and ICO
sizes without changing the master artwork. Older public image paths are retained
as copies of the new emblem for cached pages and shortcuts.

The canonical aesthetic baseline for the rebuild is:

- `internal/UI/Figma/Atlas_Pages/atlas_brand`

Primary files:

- `internal/UI/Figma/Atlas_Pages/atlas_brand/README.md`
- `internal/UI/Figma/Atlas_Pages/atlas_brand/src/styles/globals.css`
- `internal/UI/Figma/Atlas_Pages/atlas_brand/src/components/color-palette.tsx`
- `internal/UI/Figma/Atlas_Pages/atlas_brand/src/components/typography-section.tsx`
- `internal/UI/Figma/Atlas_Pages/atlas_brand/src/components/logo-showcase.tsx`

Secondary supporting references (component behaviors/patterns):

- `internal/UI/Figma/Isolated_Elements/Create UI Toolkit for Atlas Universalis/src/App.tsx`
- `internal/UI/Figma/Isolated_Elements/Create UI Toolkit for Atlas Universalis/src/components/atlas-ui/*`
- `internal/UI/Figma/Isolated_Elements/Create UI Toolkit for Atlas Universalis/src/components/decorative/*`

## Canonicalization Rules

1. `atlas_brand` is the only primary branding source for color, typography, and motif semantics.
2. Duplicate concept directories are treated as reference-only and must not redefine base tokens.
3. No one-off hardcoded hex values in production pages when an equivalent token exists.
4. Any new visual value must be added to the token layer first, then consumed by components.

## Initial Token Extraction

Seed tokens are extracted from `globals.css` and validated against the palette component:

- Foundation blues: `#070D1A`, `#0B1226`, `#101B35`, `#1A2744`
- Heritage golds: `#C8963E`, `#A87B2F`, `#D4A94E`, `#E8C97A`
- Silver neutrals: `#E8ECF1`, `#BCC5D0`, `#8A94A6`

Typography intent:

- Sans: Inter
- Mono: JetBrains Mono
- Editorial serif: Playfair Display

## Implementation Output

Primary production token file:

- `src/Atlas.Web/wwwroot/css/atlas.tokens.css`

This file is the first runtime bridge between concept styling and the C# site.

## Token Normalization Workflow

1. Propose token change in Figma source.
2. Add/adjust token in `atlas.tokens.css`.
3. Replace component/page hardcoded value with token usage.
4. Validate contrast and readability requirements.
5. Record change notes in this rebuild documentation set.

## Gaps and Guardrails

- Current Figma-exported code references `figma:asset/*`; do not rely on those imports for production.
- Prefer owned local assets for logos/illustrations before public launch.
- Font loading should move to explicit, production-safe delivery strategy in Phase 1 hardening.
