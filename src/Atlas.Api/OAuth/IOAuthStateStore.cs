namespace Atlas.Api.OAuth;

public interface IOAuthStateStore
{
    Task<string> CreateStateAsync(CancellationToken cancellationToken = default);

    Task<bool> TryConsumeStateAsync(string state, CancellationToken cancellationToken = default);
}
