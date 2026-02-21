namespace Atlas.Api.Authentication.OAuth;

/// <summary>
/// Resolved OAuth configuration from OAuthSettings section and env vars (Python parity).
/// </summary>
public sealed record OAuthResolvedConfig
{
    public string LinkedInClientId { get; init; } = "";
    public string LinkedInClientSecret { get; init; } = "";
    public string LinkedInRedirectUri { get; init; } = "";
    public string GoogleClientId { get; init; } = "";
    public string GoogleClientSecret { get; init; } = "";
    public string GoogleRedirectUri { get; init; } = "";
    public string FrontendUrl { get; init; } = "http://localhost:5173";

    public bool IsLinkedInConfigured =>
        !string.IsNullOrWhiteSpace(LinkedInClientId) && !string.IsNullOrWhiteSpace(LinkedInClientSecret);

    public bool IsGoogleConfigured =>
        !string.IsNullOrWhiteSpace(GoogleClientId) && !string.IsNullOrWhiteSpace(GoogleClientSecret);
}
