namespace Atlas.Contracts.Jobs;

public sealed record JobPostingDto(
    Guid Id,
    string Url,
    string? CompanyName,
    string? JobTitle,
    string? Location,
    string? RemotePolicy,
    string? SalaryRange,
    string? JobDescription,
    object? Requirements,
    object? Benefits,
    string Status,
    string? ApplicationStatus,
    DateTime CreatedAt);
