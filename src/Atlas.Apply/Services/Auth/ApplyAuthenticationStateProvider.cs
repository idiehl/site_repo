using System.Security.Claims;
using System.Text;
using System.Text.Json;
using Microsoft.AspNetCore.Components.Authorization;
using Microsoft.JSInterop;

namespace Atlas.Apply.Services.Auth;

public sealed class ApplyAuthenticationStateProvider : AuthenticationStateProvider
{
    private static readonly ClaimsPrincipal Anonymous = new(new ClaimsIdentity());

    private readonly BrowserTokenStore _tokenStore;

    public ApplyAuthenticationStateProvider(BrowserTokenStore tokenStore)
    {
        _tokenStore = tokenStore;
    }

    public override async Task<AuthenticationState> GetAuthenticationStateAsync()
    {
        var principal = await BuildPrincipalFromStorageAsync();
        return new AuthenticationState(principal);
    }

    public async Task SignInAsync(string accessToken, string refreshToken)
    {
        await _tokenStore.SetTokensAsync(accessToken, refreshToken);
        var principal = BuildPrincipal(accessToken);
        NotifyAuthenticationStateChanged(Task.FromResult(new AuthenticationState(principal)));
    }

    public async Task SignOutAsync()
    {
        await _tokenStore.ClearTokensAsync();
        NotifyAuthenticationStateChanged(Task.FromResult(new AuthenticationState(Anonymous)));
    }

    private async Task<ClaimsPrincipal> BuildPrincipalFromStorageAsync()
    {
        try
        {
            var accessToken = await _tokenStore.GetAccessTokenAsync();
            if (string.IsNullOrWhiteSpace(accessToken))
            {
                return Anonymous;
            }

            return BuildPrincipal(accessToken);
        }
        catch (JSException)
        {
            return Anonymous;
        }
        catch (InvalidOperationException)
        {
            return Anonymous;
        }
    }

    private static ClaimsPrincipal BuildPrincipal(string accessToken)
    {
        if (!TryReadJwtPayload(accessToken, out var payload))
        {
            return Anonymous;
        }

        if (IsExpired(payload))
        {
            return Anonymous;
        }

        var claims = new List<Claim>();
        foreach (var property in payload.EnumerateObject())
        {
            AddClaimValues(claims, property.Name, property.Value);
        }

        var identity = new ClaimsIdentity(claims, authenticationType: "Bearer");
        return new ClaimsPrincipal(identity);
    }

    private static void AddClaimValues(List<Claim> claims, string claimType, JsonElement value)
    {
        switch (value.ValueKind)
        {
            case JsonValueKind.String:
                var text = value.GetString();
                if (!string.IsNullOrWhiteSpace(text))
                {
                    claims.Add(new Claim(claimType, text));
                }
                break;
            case JsonValueKind.Number:
            case JsonValueKind.True:
            case JsonValueKind.False:
                claims.Add(new Claim(claimType, value.ToString()));
                break;
            case JsonValueKind.Array:
                foreach (var item in value.EnumerateArray())
                {
                    AddClaimValues(claims, claimType, item);
                }
                break;
        }
    }

    private static bool IsExpired(JsonElement payload)
    {
        if (!payload.TryGetProperty("exp", out var exp))
        {
            return false;
        }

        long expSeconds;
        if (exp.ValueKind == JsonValueKind.Number && exp.TryGetInt64(out expSeconds))
        {
            var expiresAt = DateTimeOffset.FromUnixTimeSeconds(expSeconds);
            return expiresAt <= DateTimeOffset.UtcNow;
        }

        if (exp.ValueKind == JsonValueKind.String && long.TryParse(exp.GetString(), out expSeconds))
        {
            var expiresAt = DateTimeOffset.FromUnixTimeSeconds(expSeconds);
            return expiresAt <= DateTimeOffset.UtcNow;
        }

        return false;
    }

    private static bool TryReadJwtPayload(string token, out JsonElement payload)
    {
        payload = default;
        try
        {
            var parts = token.Split('.');
            if (parts.Length < 2)
            {
                return false;
            }

            var segment = parts[1].Replace('-', '+').Replace('_', '/');
            var remainder = segment.Length % 4;
            if (remainder > 0)
            {
                segment = segment.PadRight(segment.Length + (4 - remainder), '=');
            }

            var json = Encoding.UTF8.GetString(Convert.FromBase64String(segment));
            using var document = JsonDocument.Parse(json);
            payload = document.RootElement.Clone();
            return true;
        }
        catch
        {
            return false;
        }
    }
}
