# Atlas Forge -- Codebase Inventory

**Generated:** 2026-02-18
**Codebase:** `d:\www\atlasuniversalis\atlasforge`
**Framework:** Astro 4.15 + Vue 3.4 + React 18.3
**Architecture:** Multi-framework UI playground with nanostores for cross-framework state

## Repository Metrics

| Metric | Value |
|--------|-------|
| Authored source files | ~59 |
| TypeScript + Vue + TSX LOC | ~5,800 |
| Frameworks | Vue 3, React 18, Astro 4 |
| UI Libraries | Vuetify, PrimeVue, NaiveUI, Chakra UI, Mantine, Radix, shadcn, Headless UI, Heroicons |

## Architecture Overview

Astro SSG hosts a Vue+React playground app. The PlaygroundApp (Vue) provides a canvas builder where users drag UI components from multiple libraries onto a freeform canvas. nanostores provides cross-framework reactivity. A registry system catalogs all available components across 13 UI libraries. Code can be exported as Vue SFC, React JSX, or HTML.

---

## File Inventory

### Configuration

#### `astro.config.mjs`
| Path | Type | Lines | Description |
|------|------|-------|-------------|
| `astro.config.mjs` | JS Config | ~96 | Astro config: Vue (with appEntrypoint), React, Tailwind integrations. Vite SSR noExternal for all UI libs. Manual chunks for Vuetify, PrimeVue, NaiveUI, Chakra, Mantine. |

#### `package.json`
| Path | Type | Lines | Description |
|------|------|-------|-------------|
| `package.json` | JSON | 90 | Dependencies for 13 UI libraries across Vue and React. Dev deps include TypeScript, Sass, PostCSS. |

#### `tailwind.config.mjs`
Config for Tailwind with custom dark theme (night palette). ~30 lines.

#### `tsconfig.json`
TypeScript strict config extending Astro. ~8 lines.

#### `postcss.config.cjs` / `postcss.config.mjs`
PostCSS configurations for Tailwind and Mantine. ~15 lines total.

---

### Astro Pages and Layouts

#### `src/pages/index.astro`
| Path | Lines | Description |
|------|-------|-------------|
| `src/pages/index.astro` | ~10 | Single page wrapping PlaygroundLayout with PlaygroundApp Vue island. |

#### `src/layouts/PlaygroundLayout.astro`
| Path | Lines | Description |
|------|-------|-------------|
| `src/layouts/PlaygroundLayout.astro` | ~45 | HTML shell with Tailwind, playground.css, meta tags. Renders slot. |

---

### Core Components (Vue)

#### `src/components/core/PlaygroundApp.vue`
| Path | Lines | Description |
|------|-------|-------------|
| `src/components/core/PlaygroundApp.vue` | ~60 | Root app component: three-panel layout (ComponentBrowser, CanvasBuilder, PreviewPanel) with TopBar. |

#### `src/components/core/ComponentBrowser.vue`
| Path | Lines | Description |
|------|-------|-------------|
| `src/components/core/ComponentBrowser.vue` | ~280 | Left sidebar: library selector, component list with search, click-to-add-to-canvas. Lazy-loads libraries via library-loader. |

Reactive State: selectedLibraryId, searchQuery, libraryItems, loading, error

#### `src/components/core/CanvasBuilder.vue`
| Path | Lines | Description |
|------|-------|-------------|
| `src/components/core/CanvasBuilder.vue` | ~370 | Central canvas: freeform/grid/flex layouts, element drag/resize, selection, zoom controls, grid overlay. |

Reactive State: elements (from nanostore), selectedId, canvasDrag state, zoom

#### `src/components/core/CanvasElementRenderer.vue`
| Path | Lines | Description |
|------|-------|-------------|
| `src/components/core/CanvasElementRenderer.vue` | ~680 | Renders individual canvas elements: resolves library component, handles drag/resize handles, selection highlights. Supports both Vue and React components. |

#### `src/components/core/PreviewPanel.vue`
| Path | Lines | Description |
|------|-------|-------------|
| `src/components/core/PreviewPanel.vue` | ~330 | Right panel: live component preview with mock preview or isolated preview, props editor, code exporter tabs. |

#### `src/components/core/PropsEditor.vue`
| Path | Lines | Description |
|------|-------|-------------|
| `src/components/core/PropsEditor.vue` | ~290 | Dynamic property editor: generates form fields from component prop definitions (string, boolean, number, select). |

#### `src/components/core/CodeExporter.vue`
| Path | Lines | Description |
|------|-------|-------------|
| `src/components/core/CodeExporter.vue` | ~140 | Export panel: generates Vue SFC, React JSX, or HTML code from canvas elements. Copy/download buttons. |

#### `src/components/core/MockPreview.vue`
| Path | Lines | Description |
|------|-------|-------------|
| `src/components/core/MockPreview.vue` | ~950 | Renders inline mock previews of components from all libraries without loading actual library code. |

#### `src/components/core/IsolatedPreview.vue`
| Path | Lines | Description |
|------|-------|-------------|
| `src/components/core/IsolatedPreview.vue` | ~230 | Renders components inside library-specific providers (Vuetify, PrimeVue, etc.). Handles loading states. |

#### `src/components/core/LibraryLoadingState.vue`
| Path | Lines | Description |
|------|-------|-------------|
| `src/components/core/LibraryLoadingState.vue` | ~80 | Loading/error state display for lazy-loaded libraries. |

#### `src/components/core/SaveDesignModal.vue`
| Path | Lines | Description |
|------|-------|-------------|
| `src/components/core/SaveDesignModal.vue` | ~200 | Modal for saving/loading canvas designs to/from localStorage. Lists saved designs. |

#### `src/components/core/TopBar.vue`
| Path | Lines | Description |
|------|-------|-------------|
| `src/components/core/TopBar.vue` | ~85 | Toolbar: layout mode selector, zoom, grid toggle, save/clear canvas. |

---

### Library Providers

| File | Lines | Description |
|------|-------|-------------|
| `src/components/providers/VuetifyProvider.vue` | ~55 | Wraps children with Vuetify createVuetify + dark theme. |
| `src/components/providers/PrimeVueProvider.vue` | ~35 | Wraps with PrimeVue plugin + Aura theme. |
| `src/components/providers/NaiveUIProvider.vue` | ~55 | Wraps with NaiveUI NConfigProvider + dark theme. |
| `src/components/providers/ChakraProviderWrapper.tsx` | ~60 | React: wraps with ChakraProvider + dark theme. |
| `src/components/providers/MantineProviderWrapper.tsx` | ~55 | React: wraps with MantineProvider + dark theme. |
| `src/components/providers/RadixProviderWrapper.tsx` | ~45 | React: wraps with Radix Theme provider. |
| `src/components/providers/ShadcnProviderWrapper.tsx` | ~40 | React: minimal wrapper for shadcn components. |

---

### React Preview Components

| File | Lines | Description |
|------|-------|-------------|
| `src/components/react/ReactPreview.tsx` | ~240 | Renders React components in an isolated root with library-specific providers. |
| `src/components/react/ReactPreviewWrapper.tsx` | ~570 | Manages React root lifecycle, bridges Vue props to React rendering. |

---

### Custom Vue Components

| File | Lines | Description |
|------|-------|-------------|
| `src/components/vue/CustomAlert.vue` | ~40 | Custom alert component with variants. |
| `src/components/vue/CustomAvatar.vue` | ~30 | Custom avatar with initials fallback. |
| `src/components/vue/CustomBadge.vue` | ~20 | Custom badge with color variants. |
| `src/components/vue/CustomButton.vue` | ~30 | Custom button with variants and sizes. |
| `src/components/vue/CustomCard.vue` | ~15 | Custom card container component. |
| `src/components/vue/CustomInput.vue` | ~20 | Custom text input component. |
| `src/components/vue/CustomProgress.vue` | ~25 | Custom progress bar component. |
| `src/components/vue/CustomTabs.vue` | ~30 | Custom tabbed content component. |

---

### Library Modules (src/lib/)

#### `src/lib/canvas-store.ts`
| Path | Lines | Description |
|------|-------|-------------|
| `src/lib/canvas-store.ts` | 258 | Nanostore-based state management for canvas. |

Types: CanvasElement, CanvasState, Design

Stores: canvasElements, selectedElementId, canvasLayout, canvasZoom, gridVisible, currentDesign, previewComponent

Functions: generateElementId(), addElement(), removeElement(), updateElement(), updateElementProps/Position/Size(), selectElement(), getSelectedElement(), moveElementUp/Down(), duplicateElement(), clearCanvas(), setPreviewComponent(), updatePreviewProps(), clearPreview(), saveDesign(), loadDesign(), getLocalDesigns(), deleteLocalDesign(), exportCanvasState()

#### `src/lib/code-generator.ts`
| Path | Lines | Description |
|------|-------|-------------|
| `src/lib/code-generator.ts` | 241 | Exports canvas designs as Vue SFC, React JSX, or HTML. |

Types: ExportFormat, ExportOptions

Functions: generatePropsString(), getImportPath(), generateVueCode(), generateReactCode(), generateHtmlCode(), generateCode(), copyToClipboard(), downloadAsFile()

#### `src/lib/library-loader.ts`
| Path | Lines | Description |
|------|-------|-------------|
| `src/lib/library-loader.ts` | 145 | Dynamic import system for lazy-loading UI libraries with caching. |

Types: LibraryId (union of 13 IDs), LoadedLibrary

Functions: isLibraryLoaded(), getLoadedLibrary(), loadLibrary(), doLoadLibrary(), preloadLibraries(), getAllLoadedLibraries(), clearLibraryCache()

#### `src/lib/registry.ts`
| Path | Lines | Description |
|------|-------|-------------|
| `src/lib/registry.ts` | ~3,000 | Master component registry: defines all available components across 13 libraries with props, defaults, categories. |

Types: ComponentProp, ComponentDefinition, LibraryDefinition

Functions: getLibraries(), getLibrary(), getComponent(), getComponentsByCategory()

---

### Library Loaders (src/lib/libraries/)

| File | Lines | Description |
|------|-------|-------------|
| `vuetify-loader.ts` | ~160 | Loads Vuetify components (Button, Card, etc.) with dark theme. |
| `primevue-loader.ts` | ~185 | Loads PrimeVue components with Aura preset. |
| `naiveui-loader.ts` | ~150 | Loads Naive UI components with dark theme. |
| `chakra-loader.ts` | ~215 | Loads Chakra UI React components. |
| `mantine-loader.ts` | ~150 | Loads Mantine React components. |
| `radix-loader.ts` | ~260 | Loads Radix UI primitives. |
| `shadcn-loader.ts` | ~400 | Loads shadcn/ui style components. |
| `heroicons-vue-loader.ts` | ~20 | Loads Heroicons Vue components. |
| `heroicons-react-loader.ts` | ~20 | Loads Heroicons React components. |
| `headless-vue-loader.ts` | ~10 | Loads Headless UI Vue components. |
| `headless-react-loader.ts` | ~10 | Loads Headless UI React components. |
| `custom-vue-loader.ts` | ~30 | Loads custom Vue components. |
| `custom-react-loader.tsx` | ~170 | Loads custom React components. |

---

### Styles

#### `src/styles/playground.css`
Custom dark-theme styles for the playground UI. ~30 lines.

#### `src/vue-app.ts`
Vue app entry point: configures global error/warning handlers. ~22 lines.

#### `src/env.d.ts`
Astro environment type reference. 1 line.