namespace Atlas.Api.OAuth;

public interface IOAuthProviderClient
{
    Task<OAuthUserInfo?> ExchangeCodeForUserAsync(
        string provider,
        string code,
        CancellationToken ct = default);
}
