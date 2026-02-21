namespace Atlas.Core.Entities;

public class ApiUsage
{
    public Guid Id { get; set; }
    public Guid? UserId { get; set; }
    public string Endpoint { get; set; } = "";
    public string Method { get; set; } = "";
    public int StatusCode { get; set; }
    public int ResponseTimeMs { get; set; }
    public string? IpAddress { get; set; }
    public string? ErrorMessage { get; set; }
    public DateTime CreatedAt { get; set; }
}
