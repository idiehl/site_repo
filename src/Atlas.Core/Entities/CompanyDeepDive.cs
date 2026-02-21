using System.Text.Json;

namespace Atlas.Core.Entities;

public class CompanyDeepDive
{
    public Guid Id { get; set; }
    public Guid JobPostingId { get; set; }

    // Generated content
    public string? CompanyOverview { get; set; }
    public string? CultureInsights { get; set; }
    public string? RoleAnalysis { get; set; }
    public string? InterviewTips { get; set; }
    public JsonDocument? SummaryJson { get; set; }
    public JsonDocument? Sources { get; set; }

    // Generation metadata
    public string? ModelUsed { get; set; }
    public string? PromptVersion { get; set; }

    public DateTime GeneratedAt { get; set; }

    // Navigation
    public JobPosting JobPosting { get; set; } = null!;
}
