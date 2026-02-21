using Microsoft.Extensions.DependencyInjection;

namespace Atlas.Api.Authentication.OAuth;

/// <summary>
/// DI registration for OAuth core services.
/// Call from host: services.AddOAuthCore();
/// </summary>
public static class OAuthServiceCollectionExtensions
{
    public static IServiceCollection AddOAuthCore(this IServiceCollection services)
    {
        services.AddSingleton<IOAuthStateStore, OAuthStateStore>();
        services.AddSingleton<IOAuthConfigResolver, OAuthConfigResolver>();
        services.AddHttpClient<IOAuthProviderClient, OAuthProviderClient>();
        services.AddScoped<IJwtTokenFactory, JwtTokenFactory>();
        return services;
    }
}
