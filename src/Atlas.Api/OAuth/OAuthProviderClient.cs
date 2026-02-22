using System.Net.Http.Json;
using System.Text.Json;
using Atlas.Contracts.Configuration;
using Microsoft.Extensions.Options;

namespace Atlas.Api.OAuth;

public sealed class OAuthProviderClient : IOAuthProviderClient
{
    private const string LinkedInTokenUrl = "https://www.linkedin.com/oauth/v2/accessToken";
    private const string LinkedInUserInfoUrl = "https://api.linkedin.com/v2/userinfo";
    private const string GoogleTokenUrl = "https://oauth2.googleapis.com/token";
    private const string GoogleUserInfoUrl = "https://www.googleapis.com/oauth2/v3/userinfo";

    private readonly HttpClient _httpClient;
    private readonly OAuthSettings _settings;

    public OAuthProviderClient(HttpClient httpClient, IOptions<OAuthSettings> options)
    {
        _httpClient = httpClient;
        _settings = options.Value ?? new OAuthSettings();
    }

    public async Task<OAuthUserInfo?> ExchangeCodeForUserAsync(string provider, string code, CancellationToken ct = default)
    {
        return provider.ToLowerInvariant() switch
        {
            "linkedin" => await ExchangeLinkedInAsync(code, ct),
            "google" => await ExchangeGoogleAsync(code, ct),
            _ => null,
        };
    }

    private async Task<OAuthUserInfo?> ExchangeLinkedInAsync(string code, CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(_settings.LinkedInClientId) ||
            string.IsNullOrWhiteSpace(_settings.LinkedInClientSecret) ||
            string.IsNullOrWhiteSpace(_settings.LinkedInRedirectUri))
        {
            return null;
        }

        using var tokenContent = new FormUrlEncodedContent(
        [
            new("grant_type", "authorization_code"),
            new("code", code),
            new("redirect_uri", _settings.LinkedInRedirectUri),
            new("client_id", _settings.LinkedInClientId),
            new("client_secret", _settings.LinkedInClientSecret),
        ]);

        using var tokenResponse = await _httpClient.PostAsync(LinkedInTokenUrl, tokenContent, ct);
        if (!tokenResponse.IsSuccessStatusCode)
            return null;

        var tokenJson = await tokenResponse.Content.ReadFromJsonAsync<JsonElement>(cancellationToken: ct);
        var accessToken = tokenJson.TryGetProperty("access_token", out var at) ? at.GetString() : null;
        if (string.IsNullOrEmpty(accessToken))
            return null;

        using var userinfoRequest = new HttpRequestMessage(HttpMethod.Get, LinkedInUserInfoUrl);
        userinfoRequest.Headers.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", accessToken);
        using var userinfoResponse = await _httpClient.SendAsync(userinfoRequest, ct);
        if (!userinfoResponse.IsSuccessStatusCode)
            return null;

        var userinfo = await userinfoResponse.Content.ReadFromJsonAsync<JsonElement>(cancellationToken: ct);
        return MapUserInfo(userinfo);
    }

    private async Task<OAuthUserInfo?> ExchangeGoogleAsync(string code, CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(_settings.GoogleClientId) ||
            string.IsNullOrWhiteSpace(_settings.GoogleClientSecret) ||
            string.IsNullOrWhiteSpace(_settings.GoogleRedirectUri))
        {
            return null;
        }

        using var tokenContent = new FormUrlEncodedContent(
        [
            new("grant_type", "authorization_code"),
            new("code", code),
            new("redirect_uri", _settings.GoogleRedirectUri),
            new("client_id", _settings.GoogleClientId),
            new("client_secret", _settings.GoogleClientSecret),
        ]);

        using var tokenResponse = await _httpClient.PostAsync(GoogleTokenUrl, tokenContent, ct);
        if (!tokenResponse.IsSuccessStatusCode)
            return null;

        var tokenJson = await tokenResponse.Content.ReadFromJsonAsync<JsonElement>(cancellationToken: ct);
        var accessToken = tokenJson.TryGetProperty("access_token", out var at) ? at.GetString() : null;
        if (string.IsNullOrEmpty(accessToken))
            return null;

        using var userinfoRequest = new HttpRequestMessage(HttpMethod.Get, GoogleUserInfoUrl);
        userinfoRequest.Headers.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", accessToken);
        using var userinfoResponse = await _httpClient.SendAsync(userinfoRequest, ct);
        if (!userinfoResponse.IsSuccessStatusCode)
            return null;

        var userinfo = await userinfoResponse.Content.ReadFromJsonAsync<JsonElement>(cancellationToken: ct);
        return MapUserInfo(userinfo);
    }

    private static OAuthUserInfo? MapUserInfo(JsonElement userinfo)
    {
        var providerId = userinfo.TryGetProperty("sub", out var sub) ? sub.GetString() : null;
        var email = userinfo.TryGetProperty("email", out var emailProp) ? emailProp.GetString() : null;
        if (string.IsNullOrWhiteSpace(providerId) || string.IsNullOrWhiteSpace(email))
            return null;

        var name = userinfo.TryGetProperty("name", out var nameProp) ? nameProp.GetString() : null;
        var givenName = userinfo.TryGetProperty("given_name", out var givenNameProp) ? givenNameProp.GetString() : null;
        var familyName = userinfo.TryGetProperty("family_name", out var familyNameProp) ? familyNameProp.GetString() : null;
        var picture = userinfo.TryGetProperty("picture", out var pictureProp) ? pictureProp.GetString() : null;

        return new OAuthUserInfo(providerId, email, name, givenName, familyName, picture);
    }
}
