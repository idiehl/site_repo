using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using Atlas.Api.Authentication;
using Atlas.Api.Authentication.OAuth;
using Atlas.Contracts.Auth;
using Atlas.Contracts.Configuration;
using Atlas.Core.Entities;
using Atlas.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;

namespace Atlas.Api.Endpoints;

public static class AuthEndpoints
{
    private const int FreeResumeGenerationLimit = 3;
    private const int PaidResumeGenerationLimit = 50;

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

    private static async Task<IResult> Register(
        UserCreateRequest request,
        AtlasDbContext db,
        IJwtTokenFactory jwtTokenFactory,
        CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(request.Email) || string.IsNullOrWhiteSpace(request.Password))
        {
            return Results.Json(
                new { detail = "Email and password are required" },
                statusCode: StatusCodes.Status400BadRequest);
        }

        var existingUser = await db.Users
            .AnyAsync(u => u.Email == request.Email, cancellationToken);

        if (existingUser)
        {
            return Results.Json(
                new { detail = "Email already registered" },
                statusCode: StatusCodes.Status400BadRequest);
        }

        var now = DateTime.UtcNow;
        var user = new User
        {
            Id = Guid.NewGuid(),
            Email = request.Email,
            HashedPassword = BCrypt.Net.BCrypt.HashPassword(request.Password),
            SubscriptionTier = "free",
            SubscriptionStatus = "free",
            ResumeGenerationsUsed = 0,
            CreatedAt = now,
            UpdatedAt = now,
        };
        db.Users.Add(user);
        await db.SaveChangesAsync(cancellationToken);

        var profile = new UserProfile
        {
            Id = Guid.NewGuid(),
            UserId = user.Id,
            CompletenessScore = 0,
            CreatedAt = now,
            UpdatedAt = now,
        };
        db.UserProfiles.Add(profile);
        await db.SaveChangesAsync(cancellationToken);

        return Results.Json(
            new UserResponse(user.Id, user.Email, user.CreatedAt, user.SubscriptionTier, user.IsAdmin),
            statusCode: StatusCodes.Status201Created);
    }

    private static async Task<IResult> Login(
        LoginRequest request,
        AtlasDbContext db,
        IJwtTokenFactory jwtTokenFactory,
        CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(request.Email) || string.IsNullOrWhiteSpace(request.Password))
        {
            return Results.Json(
                new { detail = "Incorrect email or password" },
                statusCode: StatusCodes.Status401Unauthorized);
        }

        var user = await db.Users
            .SingleOrDefaultAsync(u => u.Email == request.Email, cancellationToken);

        if (user is null
            || string.IsNullOrWhiteSpace(user.HashedPassword)
            || !BCrypt.Net.BCrypt.Verify(request.Password, user.HashedPassword))
        {
            return Results.Json(
                new { detail = "Incorrect email or password" },
                statusCode: StatusCodes.Status401Unauthorized);
        }

        var tokens = jwtTokenFactory.CreateTokenPair(user.Id);
        return Results.Ok(new
        {
            access_token = tokens.AccessToken,
            refresh_token = tokens.RefreshToken,
            token_type = tokens.TokenType,
        });
    }

    private static IResult GetCurrentUser(HttpContext context)
    {
        if (context.Items[AtlasApiHttpContextItems.CurrentUser] is not User user)
        {
            return Results.Json(
                new { detail = "Could not validate credentials" },
                statusCode: StatusCodes.Status401Unauthorized);
        }

        var isPremium = CanAccessPremiumFeatures(user);
        var limit = isPremium ? PaidResumeGenerationLimit : FreeResumeGenerationLimit;

        return Results.Ok(new CurrentUserResponse(
            user.Id,
            user.Email,
            user.CreatedAt,
            user.SubscriptionTier,
            user.IsAdmin,
            limit,
            isPremium));
    }

    private static IResult Logout()
    {
        return Results.Ok(new { message = "Successfully logged out" });
    }

    private static async Task<IResult> RequestPasswordReset(
        PasswordResetRequest request,
        AtlasDbContext db,
        IOptions<JwtSettings> jwtOptions,
        CancellationToken cancellationToken)
    {
        var user = await db.Users
            .SingleOrDefaultAsync(u => u.Email == request.Email, cancellationToken);

        if (user is not null)
        {
            var resetToken = GeneratePasswordResetToken();
            user.PasswordResetTokenHash = HashResetToken(resetToken, jwtOptions.Value.SecretKey);
            user.PasswordResetRequestedAt = DateTime.UtcNow;
            user.PasswordResetExpiresAt = DateTime.UtcNow.AddHours(2);
            await db.SaveChangesAsync(cancellationToken);
        }

        return Results.Ok(new
        {
            message = "If an account exists for that email, a reset link will be sent shortly.",
        });
    }

    private static async Task<IResult> ConfirmPasswordReset(
        PasswordResetConfirm request,
        AtlasDbContext db,
        IOptions<JwtSettings> jwtOptions,
        CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(request.Token) || string.IsNullOrWhiteSpace(request.NewPassword))
        {
            return Results.Json(
                new { detail = "Invalid or expired reset token" },
                statusCode: StatusCodes.Status400BadRequest);
        }

        var tokenHash = HashResetToken(request.Token, jwtOptions.Value.SecretKey);
        var user = await db.Users
            .SingleOrDefaultAsync(u => u.PasswordResetTokenHash == tokenHash, cancellationToken);

        if (user is null
            || user.PasswordResetExpiresAt is null
            || user.PasswordResetExpiresAt < DateTime.UtcNow)
        {
            return Results.Json(
                new { detail = "Invalid or expired reset token" },
                statusCode: StatusCodes.Status400BadRequest);
        }

        user.HashedPassword = BCrypt.Net.BCrypt.HashPassword(request.NewPassword);
        user.PasswordResetTokenHash = null;
        user.PasswordResetRequestedAt = null;
        user.PasswordResetExpiresAt = null;
        user.UpdatedAt = DateTime.UtcNow;
        await db.SaveChangesAsync(cancellationToken);

        return Results.Ok(new { message = "Password updated successfully." });
    }

    // --- OAuth endpoints (already implemented in 63656e8) ---

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

    // --- Shared helpers ---

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

    private static bool CanAccessPremiumFeatures(User user)
    {
        if (user.IsAdmin)
            return true;

        return user.SubscriptionTier == "paid"
               && user.SubscriptionStatus is "active" or "trialing" or "past_due";
    }

    private static string GeneratePasswordResetToken()
    {
        var bytes = new byte[32];
        RandomNumberGenerator.Fill(bytes);
        return Convert.ToBase64String(bytes)
            .Replace("+", "-")
            .Replace("/", "_")
            .TrimEnd('=');
    }

    private static string HashResetToken(string token, string secretKey)
    {
        var salted = $"{token}{secretKey}";
        var hashBytes = SHA256.HashData(Encoding.UTF8.GetBytes(salted));
        return Convert.ToHexStringLower(hashBytes);
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
