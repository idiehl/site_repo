---
name: meridian-map-generator
description: Generate Atlas Meridian map files (.atlas) from a topic prompt and save them to the Atlas Meridian Maps directory. Use when the user asks for a Meridian Map, Atlas Meridian map, or a .atlas file.
---

# Meridian Map Generator

## Quick Start
When the user provides a topic, create a new `.atlas` file using the Atlas Meridian JSON format and save it to:
`C:\Users\ihigg\Git\github\Atlas_Apps\Atlas_Meridian\Maps`.

## Output Requirements
- Use the topic as the map title (`Title` field) and as the base for the filename.
- Filename: `<topic>.atlas` with spaces replaced by underscores and punctuation removed.
- JSON fields must match the `CanvasDocument` model.
- Store the file in the Maps directory above.

## Default Styling
Use these defaults unless the user requests different styling:
- Node: `Shape="Rectangle"`, `FillColor="#2A2F3A"`, `BorderColor="#718096"`, `BorderThickness=1`
- Link: `Style="Curved"`, `Color="#8B80FF"`, `Thickness=2`, `ArrowHead=true`
- Frame: `FillColor="#151A22"`, `BorderColor="#3A3A44"`, `BorderThickness=1`
- Background: `BackgroundColor="#0F1115"`

## Generation Workflow
1. **Derive structure**: Create 6-12 nodes from the topic (overview, key concepts, relationships, timeline, risks, examples, sources). Adapt to the prompt.
2. **Add content**: Each node should have `Contents` with 1-3 concise text lines. Use `Type="Text"`.
3. **Optional media**: If the user provides image or video assets:
   - Add a `NodeContent` with `Type="Image"` or `Type="Video"`.
   - Use `SourceUrl` for web assets or `SourcePath` for local files.
4. **Layout**: Use a simple grid layout (3 columns) with:
   - `Width=240`, `Height=90`
   - `X` starting at 120 and stepping by 280
   - `Y` starting at 120 and stepping by 140
5. **Linking**: Add links from the central overview node to all other nodes. Add extra links only if explicitly referenced.
6. **Metadata**: Set `FormatVersion="1.0"`, `Revision=1`, `Changes=[]`, and `CreatedUtc/UpdatedUtc` to current UTC ISO 8601.
7. **WorkspaceId**: Use a slug based on the topic and date (e.g., `topic-20260210`).

## Required JSON Shape (Minimal Example)
```json
{
  "Nodes": [
    {
      "Id": 1,
      "Title": "Topic Overview",
      "X": 120,
      "Y": 120,
      "Width": 240,
      "Height": 90,
      "Shape": "Rectangle",
      "FillColor": "#2A2F3A",
      "BorderColor": "#718096",
      "BorderThickness": 1,
      "DisplayType": "Text",
      "DisplayValue": "Topic Overview",
      "DisplayContentId": 1001,
      "ParentFrameId": 1,
      "Contents": [
        { "Id": 1001, "Type": "Text", "Value": "One-line summary.", "SortOrder": 1, "SourcePath": null, "SourceUrl": null }
      ]
    }
  ],
  "Links": [],
  "Frames": [
    {
      "Id": 1,
      "Name": "Topic",
      "X": 80,
      "Y": 80,
      "Width": 1100,
      "Height": 700,
      "FillColor": "#151A22",
      "BorderColor": "#3A3A44",
      "BorderThickness": 1,
      "ParentFrameId": null
    }
  ],
  "Changes": [],
  "BackgroundColor": "#0F1115",
  "Title": "Topic",
  "FormatVersion": "1.0",
  "CreatedUtc": "2026-02-10T18:30:00Z",
  "UpdatedUtc": "2026-02-10T18:30:00Z",
  "WorkspaceId": "topic-20260210",
  "Revision": 1
}
```

## Notes
- Keep IDs unique: Node IDs from 1..n, Content IDs from 1001.., Link IDs from 1..m.
- Use forward slashes in paths.
