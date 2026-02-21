using System.Text.Json;

namespace Atlas.Core.Entities;

public class GeneratedResume
{
    public Guid Id { get; set; }
    public Guid JobPostingId { get; set; }

    // Resume content
    public string TemplateId { get; set; } = "default";
    public JsonDocument? ContentJson { get; set; }
    public string? RenderedHtml { get; set; }
    public string? FilePath { get; set; }

    // Matching analysis
    public double? MatchScore { get; set; }
    public JsonDocument? MatchedKeywords { get; set; }
    public JsonDocument? Gaps { get; set; }

    // Generation metadata
    public string? ModelUsed { get; set; }
    public string? PromptVersion { get; set; }

    public DateTime CreatedAt { get; set; }

    // Navigation
    public JobPosting JobPosting { get; set; } = null!;
}
