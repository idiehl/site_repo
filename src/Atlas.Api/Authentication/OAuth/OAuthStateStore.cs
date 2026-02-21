using System.Collections.Concurrent;
using System.Security.Cryptography;

namespace Atlas.Api.Authentication.OAuth;

/// <summary>
/// In-memory OAuth state store with ~10 minute TTL and consume-once behavior.
/// Mirrors Python oauth_states dict with cutoff cleanup.
/// </summary>
public sealed class OAuthStateStore : IOAuthStateStore
{
    private static readonly TimeSpan StateTtl = TimeSpan.FromMinutes(10);
    private readonly ConcurrentDictionary<string, DateTimeOffset> _states = new();

    public string CreateState()
    {
        PurgeExpired();
        var bytes = RandomNumberGenerator.GetBytes(32);
        var state = Convert.ToBase64String(bytes).Replace("/", "_").Replace("+", "-").TrimEnd('=');
        _states[state] = DateTimeOffset.UtcNow;
        return state;
    }

    public bool TryConsume(string state)
    {
        if (string.IsNullOrWhiteSpace(state))
            return false;

        if (!_states.TryRemove(state, out var createdAt))
            return false;

        return DateTimeOffset.UtcNow - createdAt <= StateTtl;
    }

    private void PurgeExpired()
    {
        var cutoff = DateTimeOffset.UtcNow - StateTtl;
        foreach (var kv in _states)
        {
            if (kv.Value < cutoff)
                _states.TryRemove(kv.Key, out _);
        }
    }
}
