namespace Atlas.Contracts.Configuration;

public sealed class OAuthSettings
{
    public string FrontendUrl { get; set; } = "http://localhost:5010";
    public string LinkedInClientId { get; set; } = "";
    public string LinkedInClientSecret { get; set; } = "";
    public string LinkedInRedirectUri { get; set; } = "";
    public string GoogleClientId { get; set; } = "";
    public string GoogleClientSecret { get; set; } = "";
    public string GoogleRedirectUri { get; set; } = "";
}
