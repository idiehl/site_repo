using Atlas.Core.Enums;

namespace Atlas.Core.Entities;

public class ApplicationEvent
{
    public Guid Id { get; set; }
    public Guid ApplicationId { get; set; }

    public ApplicationStatus? FromStatus { get; set; }
    public ApplicationStatus ToStatus { get; set; }
    public string? Notes { get; set; }

    public DateTime CreatedAt { get; set; }

    // Navigation
    public Application Application { get; set; } = null!;
}
