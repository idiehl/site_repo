namespace Atlas.Core.Entities;

public class SiteVisit
{
    public Guid Id { get; set; }
    public Guid? UserId { get; set; }
    public string Path { get; set; } = "";
    public string Method { get; set; } = "";
    public string? IpAddress { get; set; }
    public string? UserAgent { get; set; }
    public string? Referer { get; set; }
    public string? SessionId { get; set; }
    public DateTime CreatedAt { get; set; }
}
