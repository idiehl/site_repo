using System.Security.Cryptography;
using Microsoft.Extensions.Caching.Distributed;

namespace Atlas.Api.OAuth;

/// <summary>
/// Distributed-cache-backed OAuth state store with one-time consumption semantics.
/// Falls back to whichever IDistributedCache provider is registered by DI.
/// </summary>
public sealed class DistributedCacheOAuthStateStore : IOAuthStateStore
{
    private static readonly TimeSpan StateTtl = TimeSpan.FromMinutes(10);
    private const string KeyPrefix = "oauth_state:";

    private readonly IDistributedCache _cache;

    public DistributedCacheOAuthStateStore(IDistributedCache cache)
    {
        _cache = cache;
    }

    public async Task<string> CreateStateAsync(CancellationToken cancellationToken = default)
    {
        cancellationToken.ThrowIfCancellationRequested();

        var state = GenerateUrlSafeState();
        var key = BuildKey(state);
        await _cache.SetStringAsync(
            key,
            "1",
            new DistributedCacheEntryOptions
            {
                AbsoluteExpirationRelativeToNow = StateTtl,
            },
            cancellationToken);

        return state;
    }

    public async Task<bool> TryConsumeStateAsync(string state, CancellationToken cancellationToken = default)
    {
        cancellationToken.ThrowIfCancellationRequested();
        if (string.IsNullOrWhiteSpace(state))
            return false;

        var key = BuildKey(state);
        var marker = await _cache.GetStringAsync(key, cancellationToken);
        if (string.IsNullOrWhiteSpace(marker))
            return false;

        await _cache.RemoveAsync(key, cancellationToken);
        return true;
    }

    private static string GenerateUrlSafeState()
    {
        var bytes = new byte[32];
        RandomNumberGenerator.Fill(bytes);
        return Convert.ToBase64String(bytes).Replace("+", "-").Replace("/", "_").TrimEnd('=');
    }

    private static string BuildKey(string state) => $"{KeyPrefix}{state}";
}
