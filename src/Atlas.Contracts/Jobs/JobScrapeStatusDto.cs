namespace Atlas.Contracts.Jobs;

public sealed record JobScrapeStatusDto(
    Guid JobId,
    string Status,
    string? ErrorMessage);
