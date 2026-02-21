using System.Text.Json;
using Atlas.Api.Authentication.OAuth;
using Atlas.Contracts.Auth;
using Atlas.Core.Entities;
using Atlas.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Atlas.Api.Endpoints;

public static class AuthEndpoints
{
    public static IEndpointRouteBuilder MapAuthEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/v2/auth");

        group.MapPost("/register", Register);
        group.MapPost("/login", Login);
        group.MapGet("/me", GetCurrentUser).RequireAuthorization();
        group.MapPost("/logout", Logout).RequireAuthorization();
        group.MapPost("/password-reset/request", RequestPasswordReset);
        group.MapPost("/password-reset/confirm", ConfirmPasswordReset);
        group.MapGet("/linkedin/authorize", LinkedInAuthorize);
        group.MapGet("/linkedin/callback", LinkedInCallback);
        group.MapGet("/google/authorize", GoogleAuthorize);
        group.MapGet("/google/callback", GoogleCallback);

        return app;
    }

    private static IResult Register(UserCreateRequest request)
    {
        return Results.Ok();
    }

    private static IResult Login(HttpContext context)
    {
        return Results.Ok();
    }

    private static IResult GetCurrentUser(HttpContext context)
    {
        return Results.Ok();
    }

    private static IResult Logout()
    {
        return Results.Ok();
    }

    private static IResult RequestPasswordReset(PasswordResetRequest request)
    {
        return Results.Ok();
    }

    private static IResult ConfirmPasswordReset(PasswordResetConfirm request)
    {
        return Results.Ok();
    }

    private static IResult LinkedInAuthorize(
        IOAuthStateStore stateStore,
        IOAuthConfigResolver configResolver)
    {
        var config = configResolver.Resolve();
        if (!config.IsLinkedInConfigured)
        {
            return Results.Json(
                new { detail = "LinkedIn OAuth not configured" },
                statusCode: StatusCodes.Status503ServiceUnavailable);
        }

        var state = stateStore.CreateState();
        var authUrl = OAuthUrlBuilder.BuildLinkedInAuthorizeUrl(
            config.LinkedInClientId,
            config.LinkedInRedirectUri,
            state);

        return Results.Ok(new
        {
            url = authUrl,
            state,
        });
    }

    private static Task<IResult> LinkedInCallback(
        string code,
        string state,
        AtlasDbContext db,
        IOAuthStateStore stateStore,
        IOAuthConfigResolver configResolver,
        IOAuthProviderClient providerClient,
        IJwtTokenFactory jwtTokenFactory,
        CancellationToken cancellationToken)
    {
        return HandleOAuthCallbackAsync(
            code,
            state,
            provider: "linkedin",
            isProviderConfigured: config => config.IsLinkedInConfigured,
            getUserInfo: (client, authCode, config, ct) =>
                client.GetLinkedInUserInfoAsync(authCode, config, ct),
            linkOnlyIfProviderUnset: false,
            db,
            stateStore,
            configResolver,
            providerClient,
            jwtTokenFactory,
            cancellationToken);
    }

    private static IResult GoogleAuthorize(
        IOAuthStateStore stateStore,
        IOAuthConfigResolver configResolver)
    {
        var config = configResolver.Resolve();
        if (!config.IsGoogleConfigured)
        {
            return Results.Json(
                new { detail = "Google OAuth not configured" },
                statusCode: StatusCodes.Status503ServiceUnavailable);
        }

        var state = stateStore.CreateState();
        var authUrl = OAuthUrlBuilder.BuildGoogleAuthorizeUrl(
            config.GoogleClientId,
            config.GoogleRedirectUri,
            state);

        return Results.Ok(new
        {
            url = authUrl,
            state,
        });
    }

    private static Task<IResult> GoogleCallback(
        string code,
        string state,
        AtlasDbContext db,
        IOAuthStateStore stateStore,
        IOAuthConfigResolver configResolver,
        IOAuthProviderClient providerClient,
        IJwtTokenFactory jwtTokenFactory,
        CancellationToken cancellationToken)
    {
        return HandleOAuthCallbackAsync(
            code,
            state,
            provider: "google",
            isProviderConfigured: config => config.IsGoogleConfigured,
            getUserInfo: (client, authCode, config, ct) =>
                client.GetGoogleUserInfoAsync(authCode, config, ct),
            linkOnlyIfProviderUnset: true,
            db,
            stateStore,
            configResolver,
            providerClient,
            jwtTokenFactory,
            cancellationToken);
    }

    private static async Task<IResult> HandleOAuthCallbackAsync(
        string code,
        string state,
        string provider,
        Func<OAuthResolvedConfig, bool> isProviderConfigured,
        Func<IOAuthProviderClient, string, OAuthResolvedConfig, CancellationToken, Task<(OAuthUserInfo? UserInfo, string? ErrorCode)>> getUserInfo,
        bool linkOnlyIfProviderUnset,
        AtlasDbContext db,
        IOAuthStateStore stateStore,
        IOAuthConfigResolver configResolver,
        IOAuthProviderClient providerClient,
        IJwtTokenFactory jwtTokenFactory,
        CancellationToken cancellationToken)
    {
        var config = configResolver.Resolve();
        if (!stateStore.TryConsume(state))
        {
            return RedirectToLoginWithError(config.FrontendUrl, "invalid_state");
        }

        if (!isProviderConfigured(config))
        {
            return RedirectToLoginWithError(config.FrontendUrl, "oauth_not_configured");
        }

        try
        {
            var (userInfo, errorCode) = await getUserInfo(providerClient, code, config, cancellationToken);
            if (!string.IsNullOrWhiteSpace(errorCode))
            {
                return RedirectToLoginWithError(config.FrontendUrl, errorCode);
            }

            if (string.IsNullOrWhiteSpace(userInfo?.Sub) || string.IsNullOrWhiteSpace(userInfo?.Email))
            {
                return RedirectToLoginWithError(config.FrontendUrl, "missing_user_data");
            }

            var user = await UpsertOAuthUserAsync(
                db,
                provider,
                userInfo,
                linkOnlyIfProviderUnset,
                cancellationToken);

            var tokens = jwtTokenFactory.CreateTokenPair(user.Id);
            return Results.Redirect(BuildCallbackRedirectUrl(config.FrontendUrl, tokens));
        }
        catch (HttpRequestException)
        {
            return RedirectToLoginWithError(config.FrontendUrl, "network_error");
        }
    }

    private static async Task<User> UpsertOAuthUserAsync(
        AtlasDbContext db,
        string provider,
        OAuthUserInfo userInfo,
        bool linkOnlyIfProviderUnset,
        CancellationToken cancellationToken)
    {
        var providerId = userInfo.Sub!;
        var email = userInfo.Email!;
        var now = DateTime.UtcNow;

        var user = await db.Users.SingleOrDefaultAsync(
            u => u.OauthProvider == provider && u.OauthProviderId == providerId,
            cancellationToken);

        if (user is null)
        {
            user = await db.Users.SingleOrDefaultAsync(u => u.Email == email, cancellationToken);
            if (user is null)
            {
                user = new User
                {
                    Id = Guid.NewGuid(),
                    Email = email,
                    HashedPassword = null,
                    OauthProvider = provider,
                    OauthProviderId = providerId,
                    SubscriptionTier = "free",
                    SubscriptionStatus = "free",
                    ResumeGenerationsUsed = 0,
                    CreatedAt = now,
                    UpdatedAt = now,
                };
                db.Users.Add(user);
            }
            else
            {
                if (!linkOnlyIfProviderUnset || string.IsNullOrWhiteSpace(user.OauthProvider))
                {
                    user.OauthProvider = provider;
                    user.OauthProviderId = providerId;
                }

                user.UpdatedAt = now;
            }
        }
        else
        {
            user.UpdatedAt = now;
        }

        await db.SaveChangesAsync(cancellationToken);
        await UpsertUserProfileAsync(db, user, provider, providerId, userInfo, now, cancellationToken);

        return user;
    }

    private static async Task UpsertUserProfileAsync(
        AtlasDbContext db,
        User user,
        string provider,
        string providerId,
        OAuthUserInfo userInfo,
        DateTime now,
        CancellationToken cancellationToken)
    {
        var profile = await db.UserProfiles
            .SingleOrDefaultAsync(p => p.UserId == user.Id, cancellationToken);

        var fullName = ResolveDisplayName(userInfo);

        if (profile is null)
        {
            profile = new UserProfile
            {
                Id = Guid.NewGuid(),
                UserId = user.Id,
                FullName = fullName,
                ProfilePictureUrl = userInfo.Picture,
                SocialLinks = BuildSocialLinksDocument(provider, providerId),
                CompletenessScore = 0,
                CreatedAt = now,
                UpdatedAt = now,
            };
            db.UserProfiles.Add(profile);
        }
        else
        {
            if (string.IsNullOrWhiteSpace(profile.FullName) && !string.IsNullOrWhiteSpace(fullName))
            {
                profile.FullName = fullName;
            }

            if (!string.IsNullOrWhiteSpace(userInfo.Picture) && string.IsNullOrWhiteSpace(profile.ProfilePictureUrl))
            {
                profile.ProfilePictureUrl = userInfo.Picture;
            }

            profile.SocialLinks = MergeSocialLinks(profile.SocialLinks, provider, providerId);
            profile.UpdatedAt = now;
        }

        await db.SaveChangesAsync(cancellationToken);
    }

    private static string ResolveDisplayName(OAuthUserInfo userInfo)
    {
        if (!string.IsNullOrWhiteSpace(userInfo.Name))
        {
            return userInfo.Name;
        }

        var composite = $"{userInfo.GivenName} {userInfo.FamilyName}".Trim();
        return string.IsNullOrWhiteSpace(composite) ? "" : composite;
    }

    private static JsonDocument? BuildSocialLinksDocument(string provider, string providerId)
    {
        var profileUrl = BuildProviderProfileUrl(provider, providerId);
        if (profileUrl is null)
        {
            return null;
        }

        var map = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase)
        {
            [provider] = profileUrl,
        };

        return JsonDocument.Parse(JsonSerializer.Serialize(map));
    }

    private static JsonDocument? MergeSocialLinks(JsonDocument? existing, string provider, string providerId)
    {
        var profileUrl = BuildProviderProfileUrl(provider, providerId);
        if (profileUrl is null)
        {
            return existing;
        }

        Dictionary<string, string> map;
        if (existing is null)
        {
            map = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase);
        }
        else
        {
            map = JsonSerializer.Deserialize<Dictionary<string, string>>(existing.RootElement.GetRawText())
                ?? new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase);
        }

        if (!map.ContainsKey(provider))
        {
            map[provider] = profileUrl;
        }

        return JsonDocument.Parse(JsonSerializer.Serialize(map));
    }

    private static string? BuildProviderProfileUrl(string provider, string providerId)
    {
        return provider.Equals("linkedin", StringComparison.OrdinalIgnoreCase)
            ? $"https://linkedin.com/in/{providerId}"
            : null;
    }

    private static IResult RedirectToLoginWithError(string frontendUrl, string errorCode)
    {
        var baseUrl = frontendUrl.TrimEnd('/');
        return Results.Redirect($"{baseUrl}/login?error={Uri.EscapeDataString(errorCode)}");
    }

    private static string BuildCallbackRedirectUrl(string frontendUrl, TokenResponse tokenResponse)
    {
        var baseUrl = frontendUrl.TrimEnd('/');
        return $"{baseUrl}/oauth/callback" +
               $"#access_token={Uri.EscapeDataString(tokenResponse.AccessToken)}" +
               $"&refresh_token={Uri.EscapeDataString(tokenResponse.RefreshToken)}" +
               $"&token_type={Uri.EscapeDataString(tokenResponse.TokenType)}";
    }
}
