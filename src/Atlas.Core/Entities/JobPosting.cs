using System.Text.Json;

namespace Atlas.Core.Entities;

public class JobPosting
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }

    // Source data
    public string Url { get; set; } = "";
    public string? UrlHash { get; set; }
    public string? RawText { get; set; }

    // Extracted structured data
    public string? CompanyName { get; set; }
    public string? JobTitle { get; set; }
    public string? Location { get; set; }
    public string? RemotePolicy { get; set; }
    public string? SalaryRange { get; set; }
    public string? JobDescription { get; set; }
    public JsonDocument? Requirements { get; set; }
    public JsonDocument? Benefits { get; set; }
    public JsonDocument? StructuredData { get; set; }

    // Processing status: pending, processing, completed, failed
    public string Status { get; set; } = "pending";
    public double? ExtractionConfidence { get; set; }
    public string? ErrorMessage { get; set; }

    // Application tracking (inline status on JobPosting)
    public string? ApplicationStatus { get; set; }
    public DateTime? InterviewDate { get; set; }
    public string? InterviewNotes { get; set; }
    public DateTime? AppliedAt { get; set; }

    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    // Navigation properties
    public User User { get; set; } = null!;
    public ICollection<Application> Applications { get; set; } = [];
    public ICollection<GeneratedResume> Resumes { get; set; } = [];
    public ICollection<GeneratedCoverLetter> CoverLetters { get; set; } = [];
    public CompanyDeepDive? DeepDive { get; set; }
}
