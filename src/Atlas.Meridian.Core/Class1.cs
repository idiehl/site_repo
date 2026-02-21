namespace Atlas.Meridian.Core;

public sealed class MeridianDocument
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Name { get; set; } = "Untitled Meridian";
    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;
    public DateTimeOffset UpdatedAt { get; set; } = DateTimeOffset.UtcNow;
    public List<MeridianNode> Nodes { get; set; } = new();
    public List<MeridianLink> Links { get; set; } = new();
    public List<MeridianFrame> Frames { get; set; } = new();
}

public sealed class MeridianNode
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Title { get; set; } = "Node";
    public double X { get; set; }
    public double Y { get; set; }
    public double Width { get; set; } = 240;
    public double Height { get; set; } = 140;
    public string Fill { get; set; } = "#1f2937";
    public string Border { get; set; } = "#3b4252";
    public double BorderThickness { get; set; } = 2;
    public Guid? ParentFrameId { get; set; }
    public List<MeridianContent> Contents { get; set; } = new();
}

public sealed class MeridianLink
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid SourceId { get; set; }
    public Guid TargetId { get; set; }
    public string Label { get; set; } = string.Empty;
    public string Color { get; set; } = "#94a3b8";
    public double Thickness { get; set; } = 2;
    public bool ArrowHead { get; set; } = true;
    public MeridianLinkStyle Style { get; set; } = MeridianLinkStyle.Curved;
}

public sealed class MeridianFrame
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Title { get; set; } = "Frame";
    public double X { get; set; }
    public double Y { get; set; }
    public double Width { get; set; } = 520;
    public double Height { get; set; } = 360;
    public string Fill { get; set; } = "#111827";
    public string Border { get; set; } = "#4b5563";
    public double BorderThickness { get; set; } = 2;
    public Guid? ParentFrameId { get; set; }
}

public sealed class MeridianContent
{
    public string Type { get; set; } = "text";
    public string? Text { get; set; }
    public string? Source { get; set; }
    public double Scale { get; set; } = 1;
    public double OffsetX { get; set; }
    public double OffsetY { get; set; }
}

public enum MeridianLinkStyle
{
    Straight,
    Curved,
}
