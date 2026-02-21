using System.Text.Json;

namespace Atlas.Core.Entities;

public class UserProfile
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }

    // Basic info
    public string? FullName { get; set; }
    public string? Headline { get; set; }
    public string? Summary { get; set; }
    public string? ProfilePictureUrl { get; set; }
    public string? Location { get; set; }
    public string? Phone { get; set; }

    // Social links (JSON)
    public JsonDocument? SocialLinks { get; set; }

    // Resume storage
    public string? ResumeFileUrl { get; set; }
    public DateTime? ResumeParsedAt { get; set; }

    // Profile completeness (0-100)
    public int CompletenessScore { get; set; }

    // Structured data stored as JSON
    public JsonDocument? WorkHistory { get; set; }
    public JsonDocument? Education { get; set; }
    public JsonDocument? Skills { get; set; }
    public JsonDocument? Projects { get; set; }
    public JsonDocument? Certifications { get; set; }
    public JsonDocument? ContactInfo { get; set; }

    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    // Navigation
    public User User { get; set; } = null!;
}
