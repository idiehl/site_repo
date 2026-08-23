namespace Atlas.Apply.Domain;

public class UserAccount
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Email { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public string DisplayName { get; set; } = string.Empty;
    public DateTime CreatedUtc { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedUtc { get; set; } = DateTime.UtcNow;
    public DateTime? LastLoginUtc { get; set; }
    public bool IsActive { get; set; } = true;
}

public class UserProfile
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid UserId { get; set; }
    public string? Headline { get; set; }
    public string? Summary { get; set; }
    public string? Location { get; set; }
    public string? PhoneNumber { get; set; }
    public string? LinkedInUrl { get; set; }
    public string? GithubUrl { get; set; }
    public string? PortfolioUrl { get; set; }
    public string? ProfileImagePath { get; set; }
    public string? ProfileImageFileName { get; set; }
    public string? ProfileImageContentType { get; set; }
    public string? ImportedResumeFileName { get; set; }
    public string? ImportedResumeContentType { get; set; }
    public string? ImportedResumeText { get; set; }
    public DateTime? ImportedResumeUtc { get; set; }
    public string SkillsJson { get; set; } = "[]";
    public string ExperienceJson { get; set; } = "[]";
    public string EducationJson { get; set; } = "[]";
    public string ProjectsJson { get; set; } = "[]";
    public string CertificationsJson { get; set; } = "[]";
    public string PreferencesJson { get; set; } = "{}";
    public string SectionDocumentsJson { get; set; } = "{}";
    public DateTime CreatedUtc { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedUtc { get; set; } = DateTime.UtcNow;
}

public class Opportunity
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid UserId { get; set; }
    public string SourceType { get; set; } = "Manual";
    public string? ExternalId { get; set; }
    public string Company { get; set; } = string.Empty;
    public string RoleTitle { get; set; } = string.Empty;
    public string? Location { get; set; }
    public string? CompensationText { get; set; }
    public string? PostingUrl { get; set; }
    public string? DescriptionRaw { get; set; }
    public string? DescriptionNormalized { get; set; }
    public string? MetadataJson { get; set; } = "{}";
    public DateTime CreatedUtc { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedUtc { get; set; } = DateTime.UtcNow;
}

public class ApplicationRecord
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid UserId { get; set; }
    public Guid OpportunityId { get; set; }
    public string Status { get; set; } = "Saved";
    public string Priority { get; set; } = "Normal";
    public DateTime? AppliedUtc { get; set; }
    public string? Notes { get; set; }
    public DateTime CreatedUtc { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedUtc { get; set; } = DateTime.UtcNow;
}

public class WorkflowEvent
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid UserId { get; set; }
    public Guid? ApplicationId { get; set; }
    public Guid? OpportunityId { get; set; }
    public string EventType { get; set; } = string.Empty;
    public string PayloadJson { get; set; } = "{}";
    public DateTime CreatedUtc { get; set; } = DateTime.UtcNow;
}

public class ExtensionIngestion
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid? UserId { get; set; }
    public string? SourceDomain { get; set; }
    public string? PageUrl { get; set; }
    public string PayloadJson { get; set; } = "{}";
    public string ProcessingStatus { get; set; } = "Pending";
    public string? ErrorMessage { get; set; }
    public DateTime CreatedUtc { get; set; } = DateTime.UtcNow;
    public DateTime? ProcessedUtc { get; set; }
}
