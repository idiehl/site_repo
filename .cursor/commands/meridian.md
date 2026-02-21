Generate an Atlas Meridian map file (`.atlas`) from the topic provided after this command.

Save the file to: `D:\local\Atlas_Meridian\Maps`

**Filename:** `<topic>.atlas` with spaces replaced by underscores, punctuation removed.

## Map Structure

Create a JSON file matching the `CanvasDocument` model:

- **Nodes**: 6-12 nodes derived from the topic (overview, key concepts, relationships, timeline, risks, examples, sources). Adapt to the subject matter.
- **Contents**: Each node gets 1-3 concise text lines via `Contents` array with `Type: "Text"`.
- **Links**: Connect the central overview node to all other nodes. Add extra links only for explicitly related concepts.
- **Frames**: One parent frame containing all nodes.
- **Metadata**: `FormatVersion: "1.0"`, `Revision: 1`, `Changes: []`, `CreatedUtc`/`UpdatedUtc` set to current UTC ISO 8601. `WorkspaceId` as a slug from topic + date.

## Default Styling

- Node: `Shape: "Rectangle"`, `FillColor: "#2A2F3A"`, `BorderColor: "#718096"`, `BorderThickness: 1`
- Link: `Style: "Curved"`, `Color: "#8B80FF"`, `Thickness: 2`, `ArrowHead: true`
- Frame: `FillColor: "#151A22"`, `BorderColor: "#3A3A44"`, `BorderThickness: 1`
- Background: `BackgroundColor: "#0F1115"`

## Layout

Grid layout (3 columns):
- `Width: 240`, `Height: 90`
- `X` starting at 120, stepping by 280
- `Y` starting at 120, stepping by 140

## ID Rules

- Node IDs: 1..n
- Content IDs: 1001..
- Link IDs: 1..m
- Use forward slashes in paths.

## Minimal Example

```json
{
  "Nodes": [
    {
      "Id": 1, "Title": "Topic Overview",
      "X": 120, "Y": 120, "Width": 240, "Height": 90,
      "Shape": "Rectangle", "FillColor": "#2A2F3A",
      "BorderColor": "#718096", "BorderThickness": 1,
      "DisplayType": "Text", "DisplayValue": "Topic Overview",
      "DisplayContentId": 1001, "ParentFrameId": 1,
      "Contents": [
        { "Id": 1001, "Type": "Text", "Value": "One-line summary.", "SortOrder": 1, "SourcePath": null, "SourceUrl": null }
      ]
    }
  ],
  "Links": [],
  "Frames": [
    {
      "Id": 1, "Name": "Topic",
      "X": 80, "Y": 80, "Width": 1100, "Height": 700,
      "FillColor": "#151A22", "BorderColor": "#3A3A44",
      "BorderThickness": 1, "ParentFrameId": null
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
