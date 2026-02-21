namespace Atlas.Contracts.Applications;

public sealed record ApplicationCreateRequest(
    Guid JobPostingId,
    string? Notes = null);
