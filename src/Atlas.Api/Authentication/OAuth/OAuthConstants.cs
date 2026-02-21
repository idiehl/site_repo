namespace Atlas.Api.Authentication.OAuth;

/// <summary>
/// OAuth provider URLs for token exchange and userinfo (Python parity).
/// </summary>
public static class OAuthConstants
{
    public static class LinkedIn
    {
        public const string TokenUrl = "https://www.linkedin.com/oauth/v2/accessToken";
        public const string UserInfoUrl = "https://api.linkedin.com/v2/userinfo";
    }

    public static class Google
    {
        public const string TokenUrl = "https://oauth2.googleapis.com/token";
        public const string UserInfoUrl = "https://www.googleapis.com/oauth2/v3/userinfo";
    }
}
