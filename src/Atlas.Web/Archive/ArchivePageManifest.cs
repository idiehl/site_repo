using System.Text.Json.Serialization;

namespace Atlas.Web.Archive;

public sealed class ArchivePageManifest
{
    public int SchemaVersion { get; init; } = 1;
    public required string Slug { get; init; }
    public required string Route { get; init; }
    public required string Title { get; init; }
    public required string Description { get; init; }
    public string Visibility { get; init; } = "Public";
    public required string SourceProjectId { get; init; }
    public required string SourcePageId { get; init; }
    public required string SourceRevision { get; init; }
    public required string ComponentType { get; init; }
    public required string AssemblyName { get; init; }
    public IReadOnlyList<string> Classifications { get; init; } = [];
    public IReadOnlyList<ArchiveArtifactHash> Artifacts { get; init; } = [];

    [JsonIgnore]
    public Type? ResolvedComponentType { get; internal set; }
}

public sealed class ArchiveArtifactHash
{
    public required string RelativePath { get; init; }
    public required string Sha256 { get; init; }
}
