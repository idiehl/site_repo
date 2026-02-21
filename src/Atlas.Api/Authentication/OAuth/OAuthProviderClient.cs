using System.Net.Http.Headers;
using System.Net.Http.Json;

namespace Atlas.Api.Authentication.OAuth;

public sealed class OAuthProviderClient : IOAuthProviderClient
{
    private readonly HttpClient _httpClient;

    public OAuthProviderClient(HttpClient httpClient)
    {
        _httpClient = httpClient;
    }

    public async Task<(OAuthUserInfo? UserInfo, string? ErrorCode)> GetLinkedInUserInfoAsync(
        string code,
        OAuthResolvedConfig config,
        CancellationToken cancellationToken)
    {
        return await GetUserInfoAsync(
            OAuthConstants.LinkedIn.TokenUrl,
            OAuthConstants.LinkedIn.UserInfoUrl,
            code,
            config.LinkedInClientId,
            config.LinkedInClientSecret,
            config.LinkedInRedirectUri,
            cancellationToken);
    }

    public async Task<(OAuthUserInfo? UserInfo, string? ErrorCode)> GetGoogleUserInfoAsync(
        string code,
        OAuthResolvedConfig config,
        CancellationToken cancellationToken)
    {
        return await GetUserInfoAsync(
            OAuthConstants.Google.TokenUrl,
            OAuthConstants.Google.UserInfoUrl,
            code,
            config.GoogleClientId,
            config.GoogleClientSecret,
            config.GoogleRedirectUri,
            cancellationToken);
    }

    private async Task<(OAuthUserInfo? UserInfo, string? ErrorCode)> GetUserInfoAsync(
        string tokenUrl,
        string userInfoUrl,
        string code,
        string clientId,
        string clientSecret,
        string redirectUri,
        CancellationToken cancellationToken)
    {
        var tokenResponse = await _httpClient.PostAsync(
            tokenUrl,
            new FormUrlEncodedContent(new Dictionary<string, string>
            {
                ["grant_type"] = "authorization_code",
                ["code"] = code,
                ["redirect_uri"] = redirectUri,
                ["client_id"] = clientId,
                ["client_secret"] = clientSecret,
            }),
            cancellationToken);

        if (!tokenResponse.IsSuccessStatusCode)
        {
            return (null, "token_exchange_failed");
        }

        var tokenPayload = await tokenResponse.Content.ReadFromJsonAsync<OAuthTokenResponse>(
            cancellationToken: cancellationToken);

        if (string.IsNullOrWhiteSpace(tokenPayload?.AccessToken))
        {
            return (null, "token_exchange_failed");
        }

        using var userInfoRequest = new HttpRequestMessage(HttpMethod.Get, userInfoUrl);
        userInfoRequest.Headers.Authorization = new AuthenticationHeaderValue("Bearer", tokenPayload.AccessToken);

        var userInfoResponse = await _httpClient.SendAsync(userInfoRequest, cancellationToken);
        if (!userInfoResponse.IsSuccessStatusCode)
        {
            return (null, "userinfo_failed");
        }

        var userInfo = await userInfoResponse.Content.ReadFromJsonAsync<OAuthUserInfo>(
            cancellationToken: cancellationToken);

        return (userInfo, null);
    }
}
