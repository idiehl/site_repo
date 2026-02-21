using Atlas.Core.Enums;

namespace Atlas.Core.Entities;

public class Application
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public Guid JobPostingId { get; set; }

    public ApplicationStatus Status { get; set; } = ApplicationStatus.Pending;
    public DateTime? AppliedAt { get; set; }
    public DateTime? ReminderAt { get; set; }
    public string? Notes { get; set; }

    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    // Navigation
    public User User { get; set; } = null!;
    public JobPosting JobPosting { get; set; } = null!;
    public ICollection<ApplicationEvent> Events { get; set; } = [];
}
