using Atlas.Api.OAuth;
using Atlas.Contracts.Configuration;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace Atlas.Api.Authentication;

public static class OAuthExtensions
{
    public static IServiceCollection AddAtlasOAuthServices(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        var oauthSettings = ResolveOAuthSettings(configuration);

        services.Configure<OAuthSettings>(options =>
        {
            options.LinkedInClientId = oauthSettings.LinkedInClientId;
            options.LinkedInClientSecret = oauthSettings.LinkedInClientSecret;
            options.LinkedInRedirectUri = oauthSettings.LinkedInRedirectUri;
            options.GoogleClientId = oauthSettings.GoogleClientId;
            options.GoogleClientSecret = oauthSettings.GoogleClientSecret;
            options.GoogleRedirectUri = oauthSettings.GoogleRedirectUri;
            options.FrontendUrl = oauthSettings.FrontendUrl;
        });

        var redisConnectionString = FirstNonEmpty(
            configuration["REDIS_CONNECTION_STRING"],
            configuration["Redis:ConnectionString"]);

        if (!string.IsNullOrWhiteSpace(redisConnectionString))
        {
            services.AddStackExchangeRedisCache(options =>
            {
                options.Configuration = redisConnectionString;
            });
        }
        else
        {
            services.AddDistributedMemoryCache();
        }

        services.AddHttpClient();
        services.AddSingleton<IOAuthStateStore, DistributedCacheOAuthStateStore>();
        services.AddSingleton<IJwtTokenFactory, JwtTokenFactory>();
        services.AddSingleton<IOAuthProviderClient, OAuthProviderClient>();

        return services;
    }

    private static OAuthSettings ResolveOAuthSettings(IConfiguration configuration)
    {
        var settings = configuration.GetSection("OAuthSettings").Get<OAuthSettings>() ?? new OAuthSettings();

        settings.LinkedInClientId = FirstNonEmpty(
            settings.LinkedInClientId,
            configuration["LINKEDIN_CLIENT_ID"]);

        settings.LinkedInClientSecret = FirstNonEmpty(
            settings.LinkedInClientSecret,
            configuration["LINKEDIN_CLIENT_SECRET"]);

        settings.LinkedInRedirectUri = FirstNonEmpty(
            settings.LinkedInRedirectUri,
            configuration["LINKEDIN_REDIRECT_URI"],
            "http://localhost:5010/api/v2/auth/linkedin/callback");

        settings.GoogleClientId = FirstNonEmpty(
            settings.GoogleClientId,
            configuration["GOOGLE_CLIENT_ID"]);

        settings.GoogleClientSecret = FirstNonEmpty(
            settings.GoogleClientSecret,
            configuration["GOOGLE_CLIENT_SECRET"]);

        settings.GoogleRedirectUri = FirstNonEmpty(
            settings.GoogleRedirectUri,
            configuration["GOOGLE_REDIRECT_URI"],
            "http://localhost:5010/api/v2/auth/google/callback");

        settings.FrontendUrl = FirstNonEmpty(
            settings.FrontendUrl,
            configuration["FRONTEND_URL"],
            configuration["AppSettings:FrontendUrl"],
            "http://localhost:5010");

        return settings;
    }

    private static string FirstNonEmpty(params string?[] values)
    {
        foreach (var value in values)
        {
            if (!string.IsNullOrWhiteSpace(value))
            {
                return value;
            }
        }

        return "";
    }
}
