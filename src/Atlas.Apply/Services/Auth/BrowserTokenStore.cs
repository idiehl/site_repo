using Microsoft.JSInterop;

namespace Atlas.Apply.Services.Auth;

public sealed class BrowserTokenStore
{
    public const string AccessTokenKey = "access_token";
    public const string RefreshTokenKey = "refresh_token";

    private readonly IJSRuntime _jsRuntime;

    public BrowserTokenStore(IJSRuntime jsRuntime)
    {
        _jsRuntime = jsRuntime;
    }

    public async Task SetTokensAsync(string accessToken, string refreshToken)
    {
        await _jsRuntime.InvokeVoidAsync("localStorage.setItem", AccessTokenKey, accessToken);
        await _jsRuntime.InvokeVoidAsync("localStorage.setItem", RefreshTokenKey, refreshToken);
    }

    public async Task<string?> GetAccessTokenAsync()
    {
        return await _jsRuntime.InvokeAsync<string?>("localStorage.getItem", AccessTokenKey);
    }

    public async Task ClearTokensAsync()
    {
        await _jsRuntime.InvokeVoidAsync("localStorage.removeItem", AccessTokenKey);
        await _jsRuntime.InvokeVoidAsync("localStorage.removeItem", RefreshTokenKey);
    }
}
