using System.Text.Json;

namespace Atlas.Core.Entities;

public class GeneratedCoverLetter
{
    public Guid Id { get; set; }
    public Guid JobPostingId { get; set; }

    // Cover letter content
    public JsonDocument? ContentJson { get; set; }
    public string? FullText { get; set; }

    // Generation metadata
    public string? ModelUsed { get; set; }
    public string? PromptVersion { get; set; }

    public DateTime CreatedAt { get; set; }

    // Navigation
    public JobPosting JobPosting { get; set; } = null!;
}
