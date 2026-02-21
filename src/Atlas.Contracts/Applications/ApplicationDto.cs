namespace Atlas.Contracts.Applications;

public sealed record ApplicationDto(
    Guid Id,
    Guid JobPostingId,
    string Status,
    DateTime? AppliedAt,
    DateTime? ReminderAt,
    string? Notes,
    DateTime CreatedAt,
    List<ApplicationEventDto> Events);
