using Atlas.Contracts.Configuration;
using Microsoft.Extensions.Configuration;

namespace Atlas.Api.Authentication.OAuth;

/// <summary>
/// Resolves OAuth config from OAuthSettings section and env vars (LINKEDIN_*, GOOGLE_*, FRONTEND_URL).
/// </summary>
public sealed class OAuthConfigResolver : IOAuthConfigResolver
{
    private readonly IConfiguration _configuration;

    public OAuthConfigResolver(IConfiguration configuration)
    {
        _configuration = configuration;
    }

    public OAuthResolvedConfig Resolve()
    {
        var section = _configuration.GetSection("OAuthSettings").Get<OAuthSettings>() ?? new OAuthSettings();

        return new OAuthResolvedConfig
        {
            LinkedInClientId = FirstNonEmpty(section.LinkedInClientId, _configuration["LINKEDIN_CLIENT_ID"]),
            LinkedInClientSecret = FirstNonEmpty(section.LinkedInClientSecret, _configuration["LINKEDIN_CLIENT_SECRET"]),
            LinkedInRedirectUri = FirstNonEmpty(section.LinkedInRedirectUri, _configuration["LINKEDIN_REDIRECT_URI"]),
            GoogleClientId = FirstNonEmpty(section.GoogleClientId, _configuration["GOOGLE_CLIENT_ID"]),
            GoogleClientSecret = FirstNonEmpty(section.GoogleClientSecret, _configuration["GOOGLE_CLIENT_SECRET"]),
            GoogleRedirectUri = FirstNonEmpty(section.GoogleRedirectUri, _configuration["GOOGLE_REDIRECT_URI"]),
            FrontendUrl = FirstNonEmpty(
                section.FrontendUrl,
                _configuration["AppSettings:FrontendUrl"],
                _configuration["OAuthSettings:FrontendUrl"],
                _configuration["FrontendUrl"],
                _configuration["FRONTEND_URL"],
                "http://localhost:5173"),
        };
    }

    private static string FirstNonEmpty(params string?[] values)
    {
        foreach (var value in values)
        {
            if (!string.IsNullOrWhiteSpace(value))
                return value;
        }
        return "";
    }
}
