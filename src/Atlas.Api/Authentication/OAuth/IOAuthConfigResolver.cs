namespace Atlas.Api.Authentication.OAuth;

/// <summary>
/// Resolves OAuth configuration from OAuthSettings section and env vars matching Python names.
/// </summary>
public interface IOAuthConfigResolver
{
    OAuthResolvedConfig Resolve();
}
