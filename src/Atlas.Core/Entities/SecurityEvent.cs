using System.Text.Json;

namespace Atlas.Core.Entities;

public class SecurityEvent
{
    public Guid Id { get; set; }
    public string EventType { get; set; } = "";
    public string Severity { get; set; } = "low";
    public Guid? UserId { get; set; }
    public string? IpAddress { get; set; }
    public string? UserAgent { get; set; }
    public JsonDocument? Details { get; set; }
    public bool Resolved { get; set; }
    public DateTime? ResolvedAt { get; set; }
    public Guid? ResolvedBy { get; set; }
    public DateTime CreatedAt { get; set; }
}
