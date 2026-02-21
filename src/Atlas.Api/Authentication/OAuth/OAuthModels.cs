using System.Text.Json.Serialization;

namespace Atlas.Api.Authentication.OAuth;

/// <summary>
/// OAuth token exchange response (access_token from LinkedIn/Google).
/// </summary>
public sealed record OAuthTokenResponse
{
    [JsonPropertyName("access_token")]
    public string? AccessToken { get; init; }

    [JsonPropertyName("refresh_token")]
    public string? RefreshToken { get; init; }

    [JsonPropertyName("expires_in")]
    public int? ExpiresIn { get; init; }

    [JsonPropertyName("token_type")]
    public string? TokenType { get; init; }
}

/// <summary>
/// OAuth userinfo payload (LinkedIn OpenID Connect / Google userinfo).
/// Minimal fields for user creation/lookup.
/// </summary>
public sealed record OAuthUserInfo
{
    [JsonPropertyName("sub")]
    public string? Sub { get; init; }

    [JsonPropertyName("email")]
    public string? Email { get; init; }

    [JsonPropertyName("name")]
    public string? Name { get; init; }

    [JsonPropertyName("picture")]
    public string? Picture { get; init; }

    [JsonPropertyName("given_name")]
    public string? GivenName { get; init; }

    [JsonPropertyName("family_name")]
    public string? FamilyName { get; init; }
}
