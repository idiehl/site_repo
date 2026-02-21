namespace Atlas.Contracts.Profile;

public sealed record ProfileUpdateRequest(
    string? FullName = null,
    string? Headline = null,
    string? Summary = null,
    string? Location = null,
    string? Phone = null,
    object? SocialLinks = null,
    object? WorkHistory = null,
    object? Education = null,
    object? Skills = null,
    object? Projects = null,
    object? Certifications = null,
    object? ContactInfo = null);
