# Atlas Meridian - Codebase Inventory

**Last Updated:** 2026-02-18
**Snapshot:** 47 authored files | ~4,405 C# + XAML LOC | 4 projects (App, Canvas, Core, Interop)

---

## Atlas.Universalis.App

---

### App.axaml

| Attribute | Value |
|-----------|-------|
| **Type** | XAML |
| **Size** | 0.5 KB |
| **Lines** | ~11 |
| **Namespace** | -- |

Application-level XAML resource file. Declares the Fluent theme, global styles, and shared resources used across the entire desktop application.

---

### App.axaml.cs

| Attribute | Value |
|-----------|-------|
| **Type** | C# (code-behind) |
| **Size** | 0.5 KB |
| **Lines** | ~23 |
| **Namespace** | `Atlas.Universalis.App` |

Application bootstrap logic. Initializes XAML resources and creates the main window with its view-model when the framework signals readiness.

**Types defined:** `App`

#### Methods

| Name | Return | Access | Description |
|------|--------|--------|-------------|
| Initialize | void | public | Loads XAML resources via AvaloniaXamlLoader. |
| OnFrameworkInitializationCompleted | void | public | Creates MainWindow bound to MainWindowViewModel on desktop lifetime. |

---

### Atlas.Universalis.App.csproj

| Attribute | Value |
|-----------|-------|
| **Type** | MSBuild project |
| **Size** | 1.8 KB |
| **Lines** | ~33 |
| **Namespace** | -- |

Main desktop application project targeting net10.0. References Canvas, Core, and Interop projects.

**NuGet Dependencies:**

| Package | Version |
|---------|---------|
| Avalonia | 11.3.11 |
| Avalonia.Controls.ColorPicker | 11.3.11 |
| Avalonia.Desktop | 11.3.11 |
| Avalonia.Themes.Fluent | 11.3.11 |
| Avalonia.Fonts.Inter | 11.3.11 |
| Avalonia.Diagnostics | 11.3.11 |
| LibVLCSharp.Avalonia | 3.9.5 |
| PdfForge.Avalonia | 2.1.2 |
| VideoLAN.LibVLC.Windows | 3.0.23 |
| WebView.Avalonia | 11.0.0.1 |
| WebView.Avalonia.Desktop | 11.0.0.1 |

---

### ColorStringConverter.cs

| Attribute | Value |
|-----------|-------|
| **Type** | C# source |
| **Size** | 1.2 KB |
| **Lines** | ~48 |
| **Namespace** | `Atlas.Universalis.App` |

IValueConverter that converts hex color strings to and from Avalonia Color / SolidColorBrush instances for XAML data binding.

**Types defined:** `ColorStringConverter`

#### Methods

| Name | Return | Access | Description |
|------|--------|--------|-------------|
| Convert | object | public | Parses a hex string into an Avalonia SolidColorBrush. |
| ConvertBack | object | public | Serializes an Avalonia color back to a hex string. |
| FormatColor | string | private static | Formats an Avalonia Color as a hex string. |

---

### FrameTreeItem.cs

| Attribute | Value |
|-----------|-------|
| **Type** | C# source |
| **Size** | 1.3 KB |
| **Lines** | ~52 |
| **Namespace** | `Atlas.Universalis.App` |

Helper model that represents a single item in the frame hierarchy tree UI, wrapping either a Frame or a Node reference.

**Types defined:** `FrameTreeItem`

#### Properties

| Name | Type | Access | Description |
|------|------|--------|-------------|
| Title | string | public | Display label shown in the tree view. |
| IsFrame | bool | public | True when the item wraps a Frame; false for a Node. |
| Frame | Frame? | public | The underlying Frame model, if applicable. |
| Node | Node? | public | The underlying Node model, if applicable. |
| Children | ObservableCollection<FrameTreeItem> | public | Child items nested under this tree node. |
| IsExpanded | bool | public | Whether the tree item is expanded in the UI. |

#### Methods

| Name | Return | Access | Description |
|------|--------|--------|-------------|
| OnPropertyChanged | void | protected | Raises PropertyChanged for the given property name. |
| SetProperty | bool | protected | Sets a backing field and raises change notification if the value changed. |

---

### MainWindow.axaml

| Attribute | Value |
|-----------|-------|
| **Type** | XAML |
| **Size** | 29.8 KB |
| **Lines** | ~462 |
| **Namespace** | -- |

Primary window layout defining the toolbar, canvas surface, right-side property/style panels, overlay regions, and all visual structure for the editor.

**Named elements:** CanvasSurface, InlineEditor, Root

---

### MainWindow.axaml.cs

| Attribute | Value |
|-----------|-------|
| **Type** | C# (code-behind) |
| **Size** | 10.4 KB |
| **Lines** | ~300 |
| **Namespace** | `Atlas.Universalis.App` |

Code-behind for MainWindow. Wires UI events, builds context menus, opens file dialogs, and delegates actions to the view-model.

**Types defined:** `MainWindow`, `ContextMenuType` (enum)

#### Fields

| Name | Type | Access | Description |
|------|------|--------|-------------|
| ViewModel | MainWindowViewModel | private | Reference to the bound view-model instance. |

#### Methods

| Name | Return | Access | Description |
|------|--------|--------|-------------|
| AddNode_Click | void | private | Handles the Add Node toolbar button click. |
| AddFrame_Click | void | private | Handles the Add Frame toolbar button click. |
| DeleteSelected_Click | void | private | Deletes the currently selected node, frame, or link. |
| Save_Click | void | private | Opens a save-file dialog and serializes the canvas document. |
| Load_Click | void | private | Opens an open-file dialog and deserializes a canvas document. |
| OnCanvasRightClick | void | private | Shows the canvas context menu at the pointer position. |
| OnNodeRightClick | void | private | Shows the node-specific context menu. |
| OnFrameRightClick | void | private | Shows the frame-specific context menu. |
| OnLinkRightClick | void | private | Shows the link-specific context menu. |
| BuildContextMenu | ContextMenu | private | Constructs a context menu based on ContextMenuType. |
| AlignLeft_Click | void | private | Aligns selected nodes to the left edge. |
| AlignRight_Click | void | private | Aligns selected nodes to the right edge. |
| AlignTop_Click | void | private | Aligns selected nodes to the top edge. |
| AlignBottom_Click | void | private | Aligns selected nodes to the bottom edge. |
| AlignCenterH_Click | void | private | Centers selected nodes horizontally. |
| AlignCenterV_Click | void | private | Centers selected nodes vertically. |
| DistributeH_Click | void | private | Distributes selected nodes evenly on the horizontal axis. |
| DistributeV_Click | void | private | Distributes selected nodes evenly on the vertical axis. |
| AddContent_Click | void | private | Opens a dialog to add content to the selected node. |
| RemoveContent_Click | void | private | Removes content from the selected node. |
| BrowseContent_Click | void | private | Opens a file browser for node content selection. |
| DuplicateNode_Click | void | private | Creates a copy of the selected node with offset position. |
| DuplicateFrame_Click | void | private | Creates a copy of the selected frame with offset position. |
| ToggleLinkMode_Click | void | private | Toggles the canvas into link-drawing mode. |
| ZoomIn_Click | void | private | Increases canvas zoom level. |
| ZoomOut_Click | void | private | Decreases canvas zoom level. |
| ZoomReset_Click | void | private | Resets canvas zoom to 100%. |
| Undo_Click | void | private | Undoes the last canvas change. |
| Redo_Click | void | private | Redoes the last undone canvas change. |
| NewCanvas_Click | void | private | Clears the canvas and starts a new document. |
| Export_Click | void | private | Exports the canvas to an image or other format. |
| OnKeyDown | void | protected override | Handles keyboard shortcuts for the window. |
| OnCanvasNodeSelected | void | private | Responds to node selection events from the canvas. |
| OnCanvasFrameSelected | void | private | Responds to frame selection events from the canvas. |
| OnCanvasLinkSelected | void | private | Responds to link selection events from the canvas. |
| OnCanvasSelectionCleared | void | private | Clears property panels when selection is dismissed. |

---

### MainWindowViewModel.cs

| Attribute | Value |
|-----------|-------|
| **Type** | C# source |
| **Size** | 41.0 KB |
| **Lines** | ~1,425 |
| **Namespace** | `Atlas.Universalis.App` |

Primary view-model driving the entire editor. Manages document state, selection, undo/redo, serialization, alignment, batch styling, content management, and frame-tree synchronization.

**Types defined:** `MainWindowViewModel`, `AlignmentMode` (enum), `RecentCanvasEntry`

#### Fields

| Name | Type | Access | Description |
|------|------|--------|-------------|
| _document | CanvasDocument | private | The active canvas document model. |
| _selectedNode | Node? | private | Currently selected node. |
| _selectedFrame | Frame? | private | Currently selected frame. |
| _selectedLink | Link? | private | Currently selected link. |
| _isLinkMode | bool | private | Whether the canvas is in link-drawing mode. |
| _linkSourceNode | Node? | private | Source node when drawing a new link. |
| _zoom | double | private | Current zoom level. |
| _panX | double | private | Horizontal pan offset. |
| _panY | double | private | Vertical pan offset. |
| _undoStack | Stack<string> | private | Serialized snapshots for undo. |
| _redoStack | Stack<string> | private | Serialized snapshots for redo. |
| _isDirty | bool | private | Whether the document has unsaved changes. |
| _currentFilePath | string? | private | Path to the currently loaded file. |
| _batchFillColor | string | private | Fill color used in batch-style operations. |
| _batchBorderColor | string | private | Border color used in batch-style operations. |
| _batchShape | string | private | Shape used in batch-style operations. |
| _title | string | private | Window title / document name. |
| _statusMessage | string | private | Status bar text. |
| _backgroundColorString | string | private | Canvas background color as hex. |
| _recentFiles | ObservableCollection<RecentCanvasEntry> | private | Recently opened file entries. |
| _frameTreeRoots | ObservableCollection<FrameTreeItem> | private | Root items for the frame-tree panel. |
| _selectedTreeItem | FrameTreeItem? | private | Currently selected item in the frame tree. |
| _showOverlay | bool | private | Whether the node overlay panel is visible. |
| _overlayNode | Node? | private | Node displayed in the overlay panel. |
| _clipboardJson | string? | private | Serialized clipboard content for copy/paste. |

#### Properties

| Name | Type | Access | Description |
|------|------|--------|-------------|
| Document | CanvasDocument | public | The active canvas document. |
| Nodes | ObservableCollection<Node> | public | Shortcut to Document.Nodes. |
| Links | ObservableCollection<Link> | public | Shortcut to Document.Links. |
| Frames | ObservableCollection<Frame> | public | Shortcut to Document.Frames. |
| SelectedNode | Node? | public | Currently selected node, raises change notification. |
| SelectedFrame | Frame? | public | Currently selected frame, raises change notification. |
| SelectedLink | Link? | public | Currently selected link, raises change notification. |
| IsLinkMode | bool | public | Whether the editor is in link-drawing mode. |
| LinkSourceNode | Node? | public | Source node for an in-progress link. |
| Zoom | double | public | Current canvas zoom factor. |
| PanX | double | public | Horizontal pan offset. |
| PanY | double | public | Vertical pan offset. |
| IsDirty | bool | public | Whether the document has unsaved changes. |
| CurrentFilePath | string? | public | File path of the loaded document. |
| Title | string | public | Document / window title. |
| StatusMessage | string | public | Status bar message text. |
| BackgroundColorString | string | public | Canvas background color as a hex string. |
| BatchFillColor | string | public | Fill color for batch styling. |
| BatchBorderColor | string | public | Border color for batch styling. |
| BatchShape | string | public | Shape for batch styling. |
| CanUndo | bool | public | Whether the undo stack is non-empty. |
| CanRedo | bool | public | Whether the redo stack is non-empty. |
| RecentFiles | ObservableCollection<RecentCanvasEntry> | public | List of recently opened files. |
| FrameTreeRoots | ObservableCollection<FrameTreeItem> | public | Root nodes of the frame tree. |
| SelectedTreeItem | FrameTreeItem? | public | Currently selected frame-tree item. |
| ShowOverlay | bool | public | Whether the overlay panel is visible. |
| OverlayNode | Node? | public | Node rendered in the overlay. |
| HasSelection | bool | public | Whether any element is currently selected. |
| ClipboardJson | string? | public | Serialized content on the internal clipboard. |

#### Methods

| Name | Return | Access | Description |
|------|--------|--------|-------------|
| AddNode | void | public | Creates a new node at the center of the viewport. |
| AddFrame | void | public | Creates a new frame at the center of the viewport. |
| DeleteSelected | void | public | Removes the currently selected node, frame, or link. |
| ToggleLinkMode | void | public | Toggles link-drawing mode on or off. |
| BeginLink | void | public | Sets the source node for a new link. |
| CompleteLink | void | public | Finalizes a link from the source to the target node. |
| CancelLink | void | public | Cancels an in-progress link operation. |
| SaveToFile | Task | public | Serializes the document and writes it to disk. |
| LoadFromFile | Task | public | Reads a file from disk and deserializes it into the document. |
| NewDocument | void | public | Clears the canvas and initializes a blank document. |
| Undo | void | public | Restores the previous document snapshot from the undo stack. |
| Redo | void | public | Restores the next document snapshot from the redo stack. |
| RecordChange | void | public | Pushes a snapshot onto the undo stack and clears redo. |
| SelectNode | void | public | Sets the selected node and clears other selections. |
| SelectFrame | void | public | Sets the selected frame and clears other selections. |
| SelectLink | void | public | Sets the selected link and clears other selections. |
| ClearSelection | void | public | Deselects all elements. |
| ApplyBatchStyles | void | public | Applies batch fill, border, and shape to all selected nodes. |
| AlignNodes | void | public | Aligns selected nodes according to the given AlignmentMode. |
| AlignLeft | void | public | Aligns selected nodes to the leftmost edge. |
| AlignRight | void | public | Aligns selected nodes to the rightmost edge. |
| AlignTop | void | public | Aligns selected nodes to the topmost edge. |
| AlignBottom | void | public | Aligns selected nodes to the bottommost edge. |
| AlignCenterH | void | public | Centers selected nodes on the horizontal midpoint. |
| AlignCenterV | void | public | Centers selected nodes on the vertical midpoint. |
| DistributeH | void | public | Distributes selected nodes evenly along the X axis. |
| DistributeV | void | public | Distributes selected nodes evenly along the Y axis. |
| ZoomIn | void | public | Increases the zoom factor. |
| ZoomOut | void | public | Decreases the zoom factor. |
| ZoomReset | void | public | Resets zoom to 1.0. |
| SetBackgroundColor | void | public | Updates the canvas background color. |
| AddContent | void | public | Adds a NodeContent entry to the selected node. |
| RemoveContent | void | public | Removes a NodeContent entry from the selected node. |
| SetDisplayContent | void | public | Sets the display content ID on the selected node. |
| CopySelected | void | public | Serializes the selected element to the internal clipboard. |
| PasteFromClipboard | void | public | Deserializes and inserts a pasted element with offset. |
| DuplicateNode | void | public | Clones the selected node with a positional offset. |
| DuplicateFrame | void | public | Clones the selected frame with a positional offset. |
| RebuildFrameTree | void | public | Reconstructs the frame hierarchy tree from the document. |
| UpdateStatus | void | private | Sets the status bar message. |
| AddToRecentFiles | void | private | Inserts a path into the recent-files list. |
| LoadRecentFiles | void | private | Reads persisted recent-files from disk. |
| SaveRecentFiles | void | private | Writes the recent-files list to disk. |
| ExportToImage | Task | public | Renders the canvas to a bitmap and saves it. |
| ShowOverlayForNode | void | public | Opens the overlay panel for a given node. |
| HideOverlay | void | public | Closes the overlay panel. |
| OnPropertyChanged | void | protected | Raises PropertyChanged for the given property name. |
| SetProperty | bool | protected | Sets a backing field and raises change notification if the value changed. |

---

### NodeOverlayControl.axaml

| Attribute | Value |
|-----------|-------|
| **Type** | XAML |
| **Size** | 3.7 KB |
| **Lines** | ~69 |
| **Namespace** | -- |

XAML template that renders an overlay for the active node, showing a content preview panel with support for images, video, PDF, and web content types.

---

### NodeOverlayControl.axaml.cs

| Attribute | Value |
|-----------|-------|
| **Type** | C# (code-behind) |
| **Size** | 4.8 KB |
| **Lines** | ~164 |
| **Namespace** | `Atlas.Universalis.App` |

Code-behind for the node overlay control. Manages content-type switching and handles LibVLC-based video playback lifecycle.

**Types defined:** `NodeOverlayControl`, `ServiceTypeVisibilityConverter`

#### Methods

| Name | Return | Access | Description |
|------|--------|--------|-------------|
| OnDataContextChanged | void | protected override | Reacts to data-context changes to load or unload content. |
| LoadContent | void | private | Determines the content type and initializes the appropriate renderer. |
| InitializeVideo | void | private | Sets up LibVLC media player for video content. |
| StopVideo | void | private | Stops and disposes video playback resources. |
| OnDetachedFromVisualTree | void | protected override | Cleans up video resources when the control is removed. |

---

### Program.cs

| Attribute | Value |
|-----------|-------|
| **Type** | C# source |
| **Size** | 0.9 KB |
| **Lines** | ~31 |
| **Namespace** | `Atlas.Universalis.App` |

Application entry point. Configures and launches the Avalonia application builder.

**Types defined:** `Program`

#### Methods

| Name | Return | Access | Description |
|------|--------|--------|-------------|
| Main | void | public static | Entry point that builds and runs the Avalonia app. |
| BuildAvaloniaApp | AppBuilder | public static | Configures Avalonia with platform detection and Inter font. |

---

### app.manifest

| Attribute | Value |
|-----------|-------|
| **Type** | XML manifest |
| **Size** | 0.9 KB |
| **Lines** | ~18 |
| **Namespace** | -- |

Windows application manifest enabling per-monitor DPI awareness for crisp rendering on high-DPI displays.

---

## Atlas.Universalis.Canvas

---

### Atlas.Universalis.Canvas.csproj

| Attribute | Value |
|-----------|-------|
| **Type** | MSBuild project |
| **Size** | 0.4 KB |
| **Lines** | ~17 |
| **Namespace** | -- |

Class library project for the CanvasView custom control. Targets net10.0, references the Core project, and depends on Avalonia 11.3.11.

---

### CanvasView.cs

| Attribute | Value |
|-----------|-------|
| **Type** | C# source |
| **Size** | 41.6 KB |
| **Lines** | ~1,316 |
| **Namespace** | `Atlas.Universalis.Canvas` |

Custom Avalonia control responsible for all canvas rendering (nodes, frames, links, selection handles, grid) and pointer-based interaction (select, drag, resize, pan, zoom, link-drawing).

**Types defined:** `CanvasView`, `NodeSelectedEventArgs`, `FrameSelectedEventArgs`, `LinkSelectedEventArgs`, `SelectionClearedEventArgs`, `CanvasRightClickEventArgs`

#### Fields

| Name | Type | Access | Description |
|------|------|--------|-------------|
| _document | CanvasDocument? | private | Reference to the bound document model. |
| _zoom | double | private | Current zoom factor. |
| _panX | double | private | Horizontal pan offset in canvas coordinates. |
| _panY | double | private | Vertical pan offset in canvas coordinates. |
| _isDragging | bool | private | Whether a drag operation is in progress. |
| _isPanning | bool | private | Whether a pan operation is in progress. |
| _isResizing | bool | private | Whether a resize operation is in progress. |
| _isSelecting | bool | private | Whether a marquee selection is in progress. |
| _isLinkMode | bool | private | Whether link-drawing mode is active. |
| _dragStartPoint | Point | private | Screen position where the current drag began. |
| _dragNodeOffset | Point | private | Offset from the node origin to the grab point. |
| _selectedNodes | HashSet<Node> | private | Set of currently selected nodes. |
| _selectedFrame | Frame? | private | Currently selected frame. |
| _selectedLink | Link? | private | Currently selected link. |
| _hoveredNode | Node? | private | Node currently under the pointer. |
| _hoveredFrame | Frame? | private | Frame currently under the pointer. |
| _hoveredLink | Link? | private | Link currently under the pointer. |
| _resizeHandle | int | private | Index of the active resize handle (0-7). |
| _resizeTarget | object? | private | The node or frame being resized. |
| _linkSourceNode | Node? | private | Source node when drawing a link. |
| _linkPreviewEnd | Point? | private | Current endpoint of the in-progress link preview. |
| _selectionRect | Rect? | private | Rectangle for marquee selection. |
| _lastPointerPos | Point | private | Most recent pointer position in screen space. |
| _gridSize | double | private | Spacing of the background grid. |
| _showGrid | bool | private | Whether the grid is rendered. |
| _snapToGrid | bool | private | Whether positions snap to the grid. |
| _pointerCaptured | bool | private | Whether the pointer is currently captured. |
| _contextMenuPos | Point | private | Position where the last context menu was invoked. |
| _multiDragOffsets | Dictionary<Node, Point> | private | Per-node offsets during multi-node drag. |
| _renderTimer | DispatcherTimer? | private | Timer that triggers periodic re-renders. |

#### Styled Properties

| Name | Type | Description |
|------|------|-------------|
| DocumentProperty | StyledProperty<CanvasDocument?> | Bindable document property. |
| ZoomProperty | StyledProperty<double> | Bindable zoom level. |
| PanXProperty | StyledProperty<double> | Bindable horizontal pan. |
| PanYProperty | StyledProperty<double> | Bindable vertical pan. |
| IsLinkModeProperty | StyledProperty<bool> | Bindable link-mode flag. |
| ShowGridProperty | StyledProperty<bool> | Bindable grid visibility. |

#### Events

| Name | Type | Description |
|------|------|-------------|
| NodeSelected | EventHandler<NodeSelectedEventArgs> | Raised when a node is selected. |
| FrameSelected | EventHandler<FrameSelectedEventArgs> | Raised when a frame is selected. |
| LinkSelected | EventHandler<LinkSelectedEventArgs> | Raised when a link is selected. |
| SelectionCleared | EventHandler<SelectionClearedEventArgs> | Raised when all selections are dismissed. |
| CanvasRightClick | EventHandler<CanvasRightClickEventArgs> | Raised on right-click for context menu. |

#### Methods

| Name | Return | Access | Description |
|------|--------|--------|-------------|
| Render | void | public override | Entry point for the Avalonia render pass; orchestrates all drawing. |
| DrawGrid | void | private | Renders the background dot or line grid. |
| DrawFrames | void | private | Renders all frames with fill, border, and label. |
| DrawNodes | void | private | Renders all nodes with shape, fill, border, and title text. |
| DrawLinks | void | private | Renders all links with lines, arrowheads, and optional labels. |
| DrawSelectionHandles | void | private | Renders resize handles around the selected element. |
| DrawSelectionRect | void | private | Renders the marquee selection rectangle. |
| DrawLinkPreview | void | private | Renders the dashed line while drawing a new link. |
| OnPointerPressed | void | protected override | Handles pointer-down for selection, drag start, resize start, or link start. |
| OnPointerMoved | void | protected override | Handles pointer-move for dragging, resizing, panning, or link preview. |
| OnPointerReleased | void | protected override | Handles pointer-up to finalize drag, resize, pan, selection, or link. |
| OnPointerWheelChanged | void | protected override | Handles mouse wheel for zoom in/out. |
| FindNode | Node? | private | Returns the topmost node at the given canvas point. |
| HitTestFrame | Frame? | private | Returns the topmost frame at the given canvas point. |
| HitTestLink | Link? | private | Returns the link closest to the given canvas point within tolerance. |
| HitTestResizeHandle | int | private | Returns the resize handle index at the given point, or -1. |
| GetResizeHandleRects | Rect[] | private | Computes the eight resize handle rectangles for an element. |
| ScreenToCanvas | Point | private | Converts a screen-space point to canvas coordinates. |
| CanvasToScreen | Point | private | Converts a canvas-space point to screen coordinates. |
| SnapToGrid | double | private | Rounds a coordinate to the nearest grid line. |
| SelectNode | void | private | Adds or sets a node as selected and raises NodeSelected. |
| SelectFrame | void | private | Sets a frame as selected and raises FrameSelected. |
| SelectLink | void | private | Sets a link as selected and raises LinkSelected. |
| ClearSelection | void | private | Deselects everything and raises SelectionCleared. |
| ApplyMarqueeSelection | void | private | Selects all nodes within the marquee rectangle. |
| BeginDrag | void | private | Initializes a node drag operation with offsets. |
| ApplyDrag | void | private | Moves selected nodes by the drag delta. |
| BeginResize | void | private | Initializes a resize operation on the target element. |
| ApplyResize | void | private | Updates the target element dimensions from the resize delta. |
| InvalidateCanvas | void | private | Requests a re-render of the canvas control. |

---

## Atlas.Universalis.Core

---

### Atlas.Universalis.Core.csproj

| Attribute | Value |
|-----------|-------|
| **Type** | MSBuild project |
| **Size** | 0.2 KB |
| **Lines** | ~9 |
| **Namespace** | -- |

Core model library targeting net10.0 with no external NuGet dependencies. Contains all domain models and serialization logic.

---

### CanvasChange.cs

| Attribute | Value |
|-----------|-------|
| **Type** | C# source |
| **Size** | 1.3 KB |
| **Lines** | ~63 |
| **Namespace** | `Atlas.Universalis.Core` |

Immutable audit-log record capturing a single change made to the canvas document for history tracking.

**Types defined:** `CanvasChange`

#### Properties

| Name | Type | Access | Description |
|------|------|--------|-------------|
| Id | Guid | public | Unique identifier for this change record. |
| Revision | int | public | Monotonically increasing revision number. |
| Action | string | public | Type of change (e.g. Add, Delete, Modify). |
| TargetType | string | public | Kind of element affected (Node, Frame, Link). |
| TargetId | Guid | public | ID of the affected element. |
| ActorId | string | public | Identifier of the user or system that made the change. |
| TimestampUtc | DateTime | public | UTC timestamp of when the change occurred. |
| PayloadJson | string? | public | Optional JSON snapshot of the changed state. |

---

### CanvasDocument.cs

| Attribute | Value |
|-----------|-------|
| **Type** | C# source |
| **Size** | 2.1 KB |
| **Lines** | ~85 |
| **Namespace** | `Atlas.Universalis.Core` |

Root document model representing an entire canvas with its nodes, links, frames, and metadata.

**Types defined:** `CanvasDocument`

#### Properties

| Name | Type | Access | Description |
|------|------|--------|-------------|
| Nodes | ObservableCollection<Node> | public | All nodes on the canvas. |
| Links | ObservableCollection<Link> | public | All links connecting nodes. |
| Frames | ObservableCollection<Frame> | public | All frames grouping nodes. |
| Changes | ObservableCollection<CanvasChange> | public | Audit log of document changes. |
| BackgroundColor | string | public | Canvas background color as a hex string. |
| Title | string | public | Document title. |
| FormatVersion | int | public | Schema version for forward compatibility. |
| CreatedUtc | DateTime | public | UTC creation timestamp. |
| UpdatedUtc | DateTime | public | UTC last-modified timestamp. |
| WorkspaceId | Guid | public | Identifier for the workspace this document belongs to. |
| Revision | int | public | Current revision counter. |

---

### DocumentSerializer.cs

| Attribute | Value |
|-----------|-------|
| **Type** | C# source |
| **Size** | 0.5 KB |
| **Lines** | ~21 |
| **Namespace** | `Atlas.Universalis.Core` |

Static utility for serializing and deserializing CanvasDocument instances to and from JSON using System.Text.Json.

**Types defined:** `DocumentSerializer`

#### Methods

| Name | Return | Access | Description |
|------|--------|--------|-------------|
| ToJson | string | public static | Serializes a CanvasDocument to an indented JSON string. |
| FromJson | CanvasDocument | public static | Deserializes a JSON string into a CanvasDocument. |

---

### Frame.cs

| Attribute | Value |
|-----------|-------|
| **Type** | C# source |
| **Size** | 1.6 KB |
| **Lines** | ~75 |
| **Namespace** | `Atlas.Universalis.Core` |

Model representing a visual frame (grouping rectangle) on the canvas that can contain nodes and nest within other frames.

**Types defined:** `Frame`

#### Properties

| Name | Type | Access | Description |
|------|------|--------|-------------|
| Id | Guid | public | Unique identifier. |
| Name | string | public | Display name shown on the frame header. |
| X | double | public | Left edge position in canvas coordinates. |
| Y | double | public | Top edge position in canvas coordinates. |
| Width | double | public | Frame width in canvas units. |
| Height | double | public | Frame height in canvas units. |
| FillColor | string | public | Interior fill color as a hex string. |
| BorderColor | string | public | Border stroke color as a hex string. |
| BorderThickness | double | public | Border stroke width. |
| ParentFrameId | Guid? | public | ID of the parent frame for nesting, or null. |

---

### Link.cs

| Attribute | Value |
|-----------|-------|
| **Type** | C# source |
| **Size** | 1.3 KB |
| **Lines** | ~61 |
| **Namespace** | `Atlas.Universalis.Core` |

Model representing a directed connection (edge) between two nodes on the canvas.

**Types defined:** `Link`

#### Properties

| Name | Type | Access | Description |
|------|------|--------|-------------|
| Id | Guid | public | Unique identifier. |
| SourceNodeId | Guid | public | ID of the node this link originates from. |
| TargetNodeId | Guid | public | ID of the node this link points to. |
| Style | string | public | Visual style (e.g. solid, dashed). |
| Label | string? | public | Optional text label displayed on the link. |
| Color | string | public | Stroke color as a hex string. |
| Thickness | double | public | Stroke width. |
| ArrowHead | string | public | Arrow-head style (e.g. triangle, none). |

---

### Node.cs

| Attribute | Value |
|-----------|-------|
| **Type** | C# source |
| **Size** | 3.9 KB |
| **Lines** | ~175 |
| **Namespace** | `Atlas.Universalis.Core` |

Model representing a visual node on the canvas, including its geometry, styling, content attachments, and optional service integration.

**Types defined:** `Node`, `NodeContent`

#### Node Properties

| Name | Type | Access | Description |
|------|------|--------|-------------|
| Id | Guid | public | Unique identifier. |
| Title | string | public | Display title shown on the node. |
| X | double | public | Left edge position in canvas coordinates. |
| Y | double | public | Top edge position in canvas coordinates. |
| Width | double | public | Node width in canvas units. |
| Height | double | public | Node height in canvas units. |
| Shape | string | public | Visual shape (e.g. rectangle, ellipse, diamond). |
| FillColor | string | public | Interior fill color as a hex string. |
| BorderColor | string | public | Border stroke color as a hex string. |
| BorderThickness | double | public | Border stroke width. |
| DisplayType | string? | public | Type of inline content display (e.g. image, video). |
| DisplayValue | string? | public | Value or path for the display content. |
| DisplayContentId | Guid? | public | ID of the NodeContent used for display. |
| ParentFrameId | Guid? | public | ID of the containing frame, or null. |
| ServiceType | string? | public | External service integration type (e.g. webview, vlc). |
| ServiceConfig | string? | public | JSON configuration for the service integration. |
| Contents | ObservableCollection<NodeContent> | public | Attached content items. |

#### NodeContent Properties

| Name | Type | Access | Description |
|------|------|--------|-------------|
| Id | Guid | public | Unique identifier. |
| Type | string | public | Content type (e.g. text, image, pdf, url). |
| Value | string | public | Content value or inline data. |
| SortOrder | int | public | Display order within the node. |
| SourcePath | string? | public | Local file path to the content source. |
| SourceUrl | string? | public | Remote URL to the content source. |

---

### ObservableObject.cs

| Attribute | Value |
|-----------|-------|
| **Type** | C# source |
| **Size** | 0.6 KB |
| **Lines** | ~18 |
| **Namespace** | `Atlas.Universalis.Core` |

Lightweight base class implementing INotifyPropertyChanged for all observable models in the Core library.

**Types defined:** `ObservableObject`

#### Methods

| Name | Return | Access | Description |
|------|--------|--------|-------------|
| SetProperty<T> | bool | protected | Sets a backing field and raises PropertyChanged if the new value differs. |

---

## Atlas.Universalis.Interop

---

### Atlas.Universalis.Interop.csproj

| Attribute | Value |
|-----------|-------|
| **Type** | MSBuild project |
| **Size** | 0.2 KB |
| **Lines** | ~9 |
| **Namespace** | -- |

Interop library project targeting net10.0. Reserved for native platform interop bridges.

---

### Class1.cs

| Attribute | Value |
|-----------|-------|
| **Type** | C# source |
| **Size** | 0.1 KB |
| **Lines** | ~6 |
| **Namespace** | `Atlas.Universalis.Interop` |

Placeholder class for future native interop functionality.

**Types defined:** `NativeBridge`

---

## Solution and Build Files

---

### AtlasUniversalisAvalonia.sln

| Attribute | Value |
|-----------|-------|
| **Type** | Visual Studio solution |
| **Size** | 5.1 KB |
| **Lines** | ~76 |

Solution file binding all four projects (App, Canvas, Core, Interop) with Debug and Release configurations for Any CPU.

---

### BUILD MERIDIAN.txt

| Attribute | Value |
|-----------|-------|
| **Type** | Text |
| **Size** | 0.2 KB |

Build and run instructions for the Atlas Meridian desktop application.

---

### README.md

| Attribute | Value |
|-----------|-------|
| **Type** | Markdown |
| **Size** | 3.2 KB |
| **Lines** | ~79 |

Top-level project README covering purpose, architecture, prerequisites, build steps, and project structure.

---

## Maps (Example .atlas Files)

The following .atlas files are example canvas documents shipped with the repository for demonstration and testing:

| File | Nodes | Links | Frames |
|------|------:|------:|-------:|
| ElectraCast_Architecture_Mapping.atlas | 13 | 7 | 2 |
| ElectraCast_Copy_Website_Plan.atlas | 11 | 7 | 1 |
| ElectraCast_Provisional_Integration_Plan.atlas | 8 | 7 | 1 |
| ElectraCast_WP_Megaphone_Architecture.atlas | 11 | 10 | 1 |
| Popular_Coding_Languages.atlas | 13 | 15 | 3 |
| electracast-active-plugins.atlas | 76 | 67 | 2 |

Each .atlas file is a JSON-serialized CanvasDocument containing nodes, links, and frames that can be loaded directly by Atlas Meridian.
