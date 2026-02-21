namespace Atlas.Api.Authentication.OAuth;

/// <summary>
/// In-memory OAuth state store with TTL and consume-once behavior for CSRF protection.
/// </summary>
public interface IOAuthStateStore
{
    /// <summary>
    /// Creates a new state value, stores it with TTL, and returns it.
    /// </summary>
    string CreateState();

    /// <summary>
    /// Attempts to consume the state once. Returns true if the state was valid and consumed; false if invalid, expired, or already consumed.
    /// </summary>
    bool TryConsume(string state);
}
