namespace Atlas.Contracts.Profile;

public sealed record UserProfileDto(
    Guid Id,
    string? FullName,
    string? Headline,
    string? Summary,
    string? ProfilePictureUrl,
    string? Location,
    string? Phone,
    object? SocialLinks,
    string? ResumeFileUrl,
    DateTime? ResumeParsedAt,
    int CompletenessScore,
    object? WorkHistory,
    object? Education,
    object? Skills,
    object? Projects,
    object? Certifications,
    object? ContactInfo,
    DateTime CreatedAt,
    DateTime UpdatedAt);
