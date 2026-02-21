using Atlas.Contracts.Auth;

namespace Atlas.Api.Authentication.OAuth;

public interface IJwtTokenFactory
{
    TokenResponse CreateTokenPair(Guid userId);
}
