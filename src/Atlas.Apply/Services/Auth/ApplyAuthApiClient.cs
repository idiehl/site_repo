using System.Net.Http.Json;
using System.Text.Json;

namespace Atlas.Apply.Services.Auth;

public sealed class ApplyAuthApiClient
{
    private readonly HttpClient _httpClient;

    public ApplyAuthApiClient(HttpClient httpClient)
    {
        _httpClient = httpClient;
    }

    public async Task<AuthCallResult> LoginAsync(string email, string password, CancellationToken cancellationToken = default)
    {
        using var content = new FormUrlEncodedContent(
        [
            new KeyValuePair<string, string>("username", email),
            new KeyValuePair<string, string>("password", password),
        ]);

        using var response = await _httpClient.PostAsync("/api/v1/auth/login", content, cancellationToken);
        if (!response.IsSuccessStatusCode)
        {
            var error = await ReadErrorAsync(response, "Login failed", cancellationToken);
            return AuthCallResult.Fail(error);
        }

        var payload = await response.Content.ReadFromJsonAsync<LoginResponse>(cancellationToken: cancellationToken);
        if (payload is null || string.IsNullOrWhiteSpace(payload.AccessToken) || string.IsNullOrWhiteSpace(payload.RefreshToken))
        {
            return AuthCallResult.Fail("Login response did not include required tokens.");
        }

        return AuthCallResult.Success(payload.AccessToken, payload.RefreshToken);
    }

    public async Task<AuthCallResult> RegisterThenLoginAsync(string email, string password, CancellationToken cancellationToken = default)
    {
        using var response = await _httpClient.PostAsJsonAsync(
            "/api/v1/auth/register",
            new RegisterRequest(email, password),
            cancellationToken);

        if (!response.IsSuccessStatusCode)
        {
            var error = await ReadErrorAsync(response, "Registration failed", cancellationToken);
            return AuthCallResult.Fail(error);
        }

        return await LoginAsync(email, password, cancellationToken);
    }

    public async Task<AuthorizeUrlResult> GetGoogleAuthorizeUrlAsync(CancellationToken cancellationToken = default)
    {
        return await GetAuthorizeUrlAsync("/api/v1/auth/google/authorize", "Failed to initiate Google login", cancellationToken);
    }

    public async Task<AuthorizeUrlResult> GetLinkedInAuthorizeUrlAsync(CancellationToken cancellationToken = default)
    {
        return await GetAuthorizeUrlAsync("/api/v1/auth/linkedin/authorize", "Failed to initiate LinkedIn login", cancellationToken);
    }

    private async Task<AuthorizeUrlResult> GetAuthorizeUrlAsync(string endpoint, string fallbackError, CancellationToken cancellationToken)
    {
        using var response = await _httpClient.GetAsync(endpoint, cancellationToken);
        if (!response.IsSuccessStatusCode)
        {
            var error = await ReadErrorAsync(response, fallbackError, cancellationToken);
            return AuthorizeUrlResult.Fail(error);
        }

        var payload = await response.Content.ReadFromJsonAsync<AuthorizeUrlResponse>(cancellationToken: cancellationToken);
        if (payload is null || string.IsNullOrWhiteSpace(payload.Url))
        {
            return AuthorizeUrlResult.Fail("Authorization URL was not returned by the API.");
        }

        return AuthorizeUrlResult.Success(payload.Url);
    }

    private static async Task<string> ReadErrorAsync(HttpResponseMessage response, string fallback, CancellationToken cancellationToken)
    {
        try
        {
            var text = await response.Content.ReadAsStringAsync(cancellationToken);
            if (string.IsNullOrWhiteSpace(text))
            {
                return fallback;
            }

            using var document = JsonDocument.Parse(text);
            if (document.RootElement.TryGetProperty("detail", out var detail))
            {
                if (detail.ValueKind == JsonValueKind.String)
                {
                    return detail.GetString() ?? fallback;
                }

                return detail.ToString();
            }
        }
        catch
        {
            // fall through to fallback message
        }

        return fallback;
    }

    private sealed record LoginResponse(string AccessToken, string RefreshToken);
    private sealed record RegisterRequest(string Email, string Password);
    private sealed record AuthorizeUrlResponse(string Url);
}

public sealed record AuthCallResult(bool IsSuccess, string? Error, string? AccessToken, string? RefreshToken)
{
    public static AuthCallResult Success(string accessToken, string refreshToken) =>
        new(true, null, accessToken, refreshToken);

    public static AuthCallResult Fail(string error) =>
        new(false, error, null, null);
}

public sealed record AuthorizeUrlResult(bool IsSuccess, string? Error, string? Url)
{
    public static AuthorizeUrlResult Success(string url) =>
        new(true, null, url);

    public static AuthorizeUrlResult Fail(string error) =>
        new(false, error, null);
}
