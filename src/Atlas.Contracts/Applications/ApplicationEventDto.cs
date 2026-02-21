namespace Atlas.Contracts.Applications;

public sealed record ApplicationEventDto(
    Guid Id,
    string? FromStatus,
    string ToStatus,
    string? Notes,
    DateTime CreatedAt);
