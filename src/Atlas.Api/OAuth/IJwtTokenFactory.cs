namespace Atlas.Api.OAuth;

/// <summary>
/// Creates JWT access and refresh tokens with HS256 signing.
/// </summary>
public interface IJwtTokenFactory
{
    Task<string> CreateAccessTokenAsync(Guid userId, CancellationToken cancellationToken = default);

    Task<string> CreateRefreshTokenAsync(Guid userId, CancellationToken cancellationToken = default);
}
