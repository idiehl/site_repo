namespace Atlas.Api.Authentication.OAuth;

/// <summary>
/// Builds OAuth authorize URLs for LinkedIn and Google, matching Python query params.
/// </summary>
public static class OAuthUrlBuilder
{
    private const string LinkedInAuthUrl = "https://www.linkedin.com/oauth/v2/authorization";
    private const string GoogleAuthUrl = "https://accounts.google.com/o/oauth2/v2/auth";

    /// <summary>
    /// Builds LinkedIn OAuth authorize URL with response_type=code, scope=openid profile email.
    /// </summary>
    public static string BuildLinkedInAuthorizeUrl(string clientId, string redirectUri, string state)
    {
        var query = new Dictionary<string, string>
        {
            ["response_type"] = "code",
            ["client_id"] = clientId,
            ["redirect_uri"] = redirectUri,
            ["state"] = state,
            ["scope"] = "openid profile email",
        };
        return BuildUrl(LinkedInAuthUrl, query);
    }

    /// <summary>
    /// Builds Google OAuth authorize URL with response_type=code, scope=openid email profile, access_type=offline, prompt=select_account.
    /// </summary>
    public static string BuildGoogleAuthorizeUrl(string clientId, string redirectUri, string state)
    {
        var query = new Dictionary<string, string>
        {
            ["response_type"] = "code",
            ["client_id"] = clientId,
            ["redirect_uri"] = redirectUri,
            ["state"] = state,
            ["scope"] = "openid email profile",
            ["access_type"] = "offline",
            ["prompt"] = "select_account",
        };
        return BuildUrl(GoogleAuthUrl, query);
    }

    private static string BuildUrl(string baseUrl, Dictionary<string, string> query)
    {
        var pairs = query
            .Where(kv => !string.IsNullOrEmpty(kv.Value))
            .Select(kv => $"{Uri.EscapeDataString(kv.Key)}={Uri.EscapeDataString(kv.Value)}");
        var qs = string.Join("&", pairs);
        return string.IsNullOrEmpty(qs) ? baseUrl : $"{baseUrl}?{qs}";
    }
}
