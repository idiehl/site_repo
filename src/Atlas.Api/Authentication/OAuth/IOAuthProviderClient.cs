namespace Atlas.Api.Authentication.OAuth;

public interface IOAuthProviderClient
{
    Task<(OAuthUserInfo? UserInfo, string? ErrorCode)> GetLinkedInUserInfoAsync(
        string code,
        OAuthResolvedConfig config,
        CancellationToken cancellationToken);

    Task<(OAuthUserInfo? UserInfo, string? ErrorCode)> GetGoogleUserInfoAsync(
        string code,
        OAuthResolvedConfig config,
        CancellationToken cancellationToken);
}
