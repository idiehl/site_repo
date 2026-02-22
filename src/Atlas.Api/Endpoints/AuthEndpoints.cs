using System.Security.Claims;
using System.Text.Json;
using Atlas.Api.Authentication;
using Atlas.Api.OAuth;
using Atlas.Contracts.Auth;
using Atlas.Contracts.Configuration;
using Atlas.Core.Entities;
using Atlas.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace Atlas.Api.Endpoints;

public static class AuthEndpoints
{
    private const string LinkedInAuthUrl = "https://www.linkedin.com/oauth/v2/authorization";
    private const string GoogleAuthUrl = "https://accounts.google.com/o/oauth2/v2/auth";

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

    private static async Task<IResult> Register(UserCreateRequest request, AtlasDbContext db)
    {
        var email = NormalizeEmail(request.Email);
        if (string.IsNullOrWhiteSpace(email) || string.IsNullOrWhiteSpace(request.Password))
        {
            return Results.Json(new { detail = "Email and password are required." }, statusCode: StatusCodes.Status400BadRequest);
        }

        var exists = await db.Users
            .AsNoTracking()
            .AnyAsync(u => u.Email == email);
        if (exists)
        {
            return Results.Json(new { detail = "Email already registered" }, statusCode: StatusCodes.Status400BadRequest);
        }

        var now = DateTime.UtcNow;
        var user = new User
        {
            Id = Guid.NewGuid(),
            Email = email,
            HashedPassword = BCrypt.Net.BCrypt.HashPassword(request.Password),
            IsAdmin = false,
            SubscriptionTier = "free",
            SubscriptionStatus = "free",
            CreatedAt = now,
            UpdatedAt = now,
        };
        db.Users.Add(user);
        db.UserProfiles.Add(new UserProfile
        {
            Id = Guid.NewGuid(),
            UserId = user.Id,
            CreatedAt = now,
            UpdatedAt = now,
        });
        await db.SaveChangesAsync();

        return Results.Json(
            new UserResponse(
                user.Id,
                user.Email,
                user.CreatedAt,
                user.SubscriptionTier,
                user.IsAdmin),
            statusCode: StatusCodes.Status201Created);
    }

    private static async Task<IResult> Login(HttpContext context)
    {
        var db = context.RequestServices.GetRequiredService<AtlasDbContext>();
        var tokenFactory = context.RequestServices.GetRequiredService<IJwtTokenFactory>();
        var login = await ReadLoginRequestAsync(context);
        if (!login.IsValid)
        {
            return Results.Json(new { detail = "Email and password are required." }, statusCode: StatusCodes.Status400BadRequest);
        }

        var email = NormalizeEmail(login.Email);
        var user = await db.Users
            .AsNoTracking()
            .SingleOrDefaultAsync(u => u.Email == email, context.RequestAborted);

        if (user is null ||
            string.IsNullOrWhiteSpace(user.HashedPassword) ||
            !BCrypt.Net.BCrypt.Verify(login.Password, user.HashedPassword))
        {
            return Results.Json(new { detail = "Incorrect email or password" }, statusCode: StatusCodes.Status401Unauthorized);
        }

        var accessToken = await tokenFactory.CreateAccessTokenAsync(user.Id, context.RequestAborted);
        var refreshToken = await tokenFactory.CreateRefreshTokenAsync(user.Id, context.RequestAborted);

        return Results.Ok(new TokenResponse(accessToken, refreshToken, "bearer"));
    }

    private static async Task<IResult> GetCurrentUser(HttpContext context)
    {
        var db = context.RequestServices.GetRequiredService<AtlasDbContext>();
        var user = await ResolveCurrentUserAsync(context, db);
        if (user is null)
        {
            return Results.Json(new { detail = "Could not validate credentials" }, statusCode: StatusCodes.Status401Unauthorized);
        }

        var isPaid = string.Equals(user.SubscriptionTier, "paid", StringComparison.OrdinalIgnoreCase);
        var isActive = string.Equals(user.SubscriptionStatus, "active", StringComparison.OrdinalIgnoreCase);
        var canAccessPremium = isPaid && isActive;
        var resumeGenerationLimit = isPaid ? 9999 : 3;

        return Results.Ok(new CurrentUserResponse(
            user.Id,
            user.Email,
            user.CreatedAt,
            user.SubscriptionTier,
            user.IsAdmin,
            resumeGenerationLimit,
            canAccessPremium));
    }

    private static IResult Logout()
    {
        return Results.Ok(new { message = "Successfully logged out" });
    }

    private static IResult RequestPasswordReset(PasswordResetRequest request)
    {
        return Results.Ok();
    }

    private static IResult ConfirmPasswordReset(PasswordResetConfirm request)
    {
        return Results.Ok();
    }

    private static string NormalizeEmail(string? email)
    {
        return string.IsNullOrWhiteSpace(email)
            ? string.Empty
            : email.Trim().ToLowerInvariant();
    }

    private static async Task<(bool IsValid, string Email, string Password)> ReadLoginRequestAsync(HttpContext context)
    {
        if (context.Request.HasFormContentType)
        {
            var form = await context.Request.ReadFormAsync(context.RequestAborted);
            var email = form["username"].FirstOrDefault() ?? form["email"].FirstOrDefault() ?? string.Empty;
            var password = form["password"].FirstOrDefault() ?? string.Empty;
            return (!string.IsNullOrWhiteSpace(email) && !string.IsNullOrWhiteSpace(password), email, password);
        }

        var payload = await context.Request.ReadFromJsonAsync<LoginRequestBody>(cancellationToken: context.RequestAborted);
        var jsonEmail = payload?.Email ?? payload?.Username ?? string.Empty;
        var jsonPassword = payload?.Password ?? string.Empty;
        return (!string.IsNullOrWhiteSpace(jsonEmail) && !string.IsNullOrWhiteSpace(jsonPassword), jsonEmail, jsonPassword);
    }

    private static async Task<User?> ResolveCurrentUserAsync(HttpContext context, AtlasDbContext db)
    {
        if (context.Items.TryGetValue(AtlasApiHttpContextItems.CurrentUser, out var item) && item is User cachedUser)
        {
            return cachedUser;
        }

        var userId = context.User.FindFirstValue("sub");
        if (!Guid.TryParse(userId, out var parsed))
        {
            return null;
        }

        return await db.Users
            .AsNoTracking()
            .SingleOrDefaultAsync(u => u.Id == parsed, context.RequestAborted);
    }

    private sealed record LoginRequestBody(string? Email, string? Username, string? Password);

    private static async Task<IResult> LinkedInAuthorize(
        IConfiguration configuration,
        IOAuthStateStore stateStore,
        CancellationToken cancellationToken)
    {
        var oauth = GetOAuthSettings(configuration);
        if (string.IsNullOrWhiteSpace(oauth.LinkedInClientId))
        {
            return Results.Json(
                new { detail = "LinkedIn OAuth not configured" },
                statusCode: StatusCodes.Status503ServiceUnavailable);
        }

        var state = await stateStore.CreateStateAsync(cancellationToken);
        var query = new Dictionary<string, string>
        {
            ["response_type"] = "code",
            ["client_id"] = oauth.LinkedInClientId,
            ["redirect_uri"] = oauth.LinkedInRedirectUri,
            ["state"] = state,
            ["scope"] = "openid profile email",
        };
        var authUrl = $"{LinkedInAuthUrl}?{BuildQueryString(query)}";
        return Results.Json(new { url = authUrl, state });
    }

    private static async Task<IResult> GoogleAuthorize(
        IConfiguration configuration,
        IOAuthStateStore stateStore,
        CancellationToken cancellationToken)
    {
        var oauth = GetOAuthSettings(configuration);
        if (string.IsNullOrWhiteSpace(oauth.GoogleClientId))
        {
            return Results.Json(
                new { detail = "Google OAuth not configured" },
                statusCode: StatusCodes.Status503ServiceUnavailable);
        }

        var state = await stateStore.CreateStateAsync(cancellationToken);
        var query = new Dictionary<string, string>
        {
            ["response_type"] = "code",
            ["client_id"] = oauth.GoogleClientId,
            ["redirect_uri"] = oauth.GoogleRedirectUri,
            ["state"] = state,
            ["scope"] = "openid email profile",
            ["access_type"] = "offline",
            ["prompt"] = "select_account",
        };
        var authUrl = $"{GoogleAuthUrl}?{BuildQueryString(query)}";
        return Results.Json(new { url = authUrl, state });
    }

    private static async Task<IResult> LinkedInCallback(
        HttpContext context,
        string? code,
        string? state,
        IOAuthStateStore stateStore,
        IOAuthProviderClient providerClient,
        IJwtTokenFactory tokenFactory)
    {
        var frontend = GetFrontendUrl(context.RequestServices);
        if (string.IsNullOrEmpty(state) || !await stateStore.TryConsumeStateAsync(state, context.RequestAborted))
        {
            return Results.Redirect($"{frontend}/login?error=invalid_state");
        }

        var config = context.RequestServices.GetRequiredService<IConfiguration>();
        var oauth = GetOAuthSettings(config);
        if (string.IsNullOrWhiteSpace(oauth.LinkedInClientId) || string.IsNullOrWhiteSpace(oauth.LinkedInClientSecret))
        {
            return Results.Redirect($"{frontend}/login?error=oauth_not_configured");
        }

        if (string.IsNullOrEmpty(code))
        {
            return Results.Redirect($"{frontend}/login?error=token_exchange_failed");
        }

        try
        {
            var userInfo = await providerClient.ExchangeCodeForUserAsync("linkedin", code, context.RequestAborted);
            if (userInfo is null)
            {
                return Results.Redirect($"{frontend}/login?error=token_exchange_failed");
            }

            if (string.IsNullOrEmpty(userInfo.ProviderId) || string.IsNullOrEmpty(userInfo.Email))
            {
                return Results.Redirect($"{frontend}/login?error=missing_user_data");
            }

            var fullName = userInfo.Name ?? $"{userInfo.GivenName ?? ""} {userInfo.FamilyName ?? ""}".Trim();
            var socialLinks = JsonDocument.Parse(JsonSerializer.Serialize(new Dictionary<string, string> { ["linkedin"] = $"https://linkedin.com/in/{userInfo.ProviderId}" }));

            var db = context.RequestServices.GetRequiredService<AtlasDbContext>();
            var user = await UpsertOAuthUser(
                db,
                provider: "linkedin",
                providerId: userInfo.ProviderId,
                email: userInfo.Email,
                fullName,
                userInfo.PictureUrl,
                socialLinks);

            var accessToken = await tokenFactory.CreateAccessTokenAsync(user.Id, context.RequestAborted);
            var refreshToken = await tokenFactory.CreateRefreshTokenAsync(user.Id, context.RequestAborted);
            return Results.Redirect($"{frontend}/oauth/callback#access_token={Uri.EscapeDataString(accessToken)}&refresh_token={Uri.EscapeDataString(refreshToken)}&token_type=bearer");
        }
        catch (HttpRequestException)
        {
            return Results.Redirect($"{frontend}/login?error=token_exchange_failed");
        }
        catch (InvalidOperationException)
        {
            return Results.Redirect($"{frontend}/login?error=userinfo_failed");
        }
    }

    private static async Task<IResult> GoogleCallback(
        HttpContext context,
        string? code,
        string? state,
        IOAuthStateStore stateStore,
        IOAuthProviderClient providerClient,
        IJwtTokenFactory tokenFactory)
    {
        var frontend = GetFrontendUrl(context.RequestServices);
        if (string.IsNullOrEmpty(state) || !await stateStore.TryConsumeStateAsync(state, context.RequestAborted))
        {
            return Results.Redirect($"{frontend}/login?error=invalid_state");
        }

        var config = context.RequestServices.GetRequiredService<IConfiguration>();
        var oauth = GetOAuthSettings(config);
        if (string.IsNullOrWhiteSpace(oauth.GoogleClientId) || string.IsNullOrWhiteSpace(oauth.GoogleClientSecret))
        {
            return Results.Redirect($"{frontend}/login?error=oauth_not_configured");
        }

        if (string.IsNullOrEmpty(code))
        {
            return Results.Redirect($"{frontend}/login?error=token_exchange_failed");
        }

        try
        {
            var userInfo = await providerClient.ExchangeCodeForUserAsync("google", code, context.RequestAborted);
            if (userInfo is null)
            {
                return Results.Redirect($"{frontend}/login?error=token_exchange_failed");
            }

            if (string.IsNullOrEmpty(userInfo.ProviderId) || string.IsNullOrEmpty(userInfo.Email))
            {
                return Results.Redirect($"{frontend}/login?error=missing_user_data");
            }

            var fullName = userInfo.Name ?? $"{userInfo.GivenName ?? ""} {userInfo.FamilyName ?? ""}".Trim();

            var db = context.RequestServices.GetRequiredService<AtlasDbContext>();
            var user = await UpsertOAuthUser(
                db,
                provider: "google",
                providerId: userInfo.ProviderId,
                email: userInfo.Email,
                fullName,
                userInfo.PictureUrl,
                socialLinks: null);

            var accessToken = await tokenFactory.CreateAccessTokenAsync(user.Id, context.RequestAborted);
            var refreshToken = await tokenFactory.CreateRefreshTokenAsync(user.Id, context.RequestAborted);
            return Results.Redirect($"{frontend}/oauth/callback#access_token={Uri.EscapeDataString(accessToken)}&refresh_token={Uri.EscapeDataString(refreshToken)}&token_type=bearer");
        }
        catch (HttpRequestException)
        {
            return Results.Redirect($"{frontend}/login?error=token_exchange_failed");
        }
        catch (InvalidOperationException)
        {
            return Results.Redirect($"{frontend}/login?error=userinfo_failed");
        }
    }

    private static string BuildQueryString(Dictionary<string, string> query)
    {
        return string.Join("&", query.Select(kv => $"{Uri.EscapeDataString(kv.Key)}={Uri.EscapeDataString(kv.Value)}"));
    }

    private static OAuthSettings GetOAuthSettings(IConfiguration configuration)
    {
        var oauth = configuration.GetSection("OAuthSettings").Get<OAuthSettings>() ?? new OAuthSettings();
        var app = configuration.GetSection("AppSettings").Get<AppSettings>();
        if (!string.IsNullOrWhiteSpace(app?.FrontendUrl))
        {
            oauth.FrontendUrl = app.FrontendUrl;
        }
        return oauth;
    }

    private static string GetFrontendUrl(IServiceProvider services)
    {
        var config = services.GetRequiredService<IConfiguration>();
        var oauth = GetOAuthSettings(config);
        return string.IsNullOrWhiteSpace(oauth.FrontendUrl) ? "http://localhost:5010" : oauth.FrontendUrl.TrimEnd('/');
    }

    private static async Task<User> UpsertOAuthUser(
        AtlasDbContext db,
        string provider,
        string providerId,
        string email,
        string fullName,
        string? profilePictureUrl,
        JsonDocument? socialLinks)
    {
        var user = await db.Users
            .Include(u => u.Profile)
            .FirstOrDefaultAsync(u => u.OauthProvider == provider && u.OauthProviderId == providerId);

        var isNewUser = false;

        if (user is null)
        {
            var existingByEmail = await db.Users.Include(u => u.Profile).FirstOrDefaultAsync(u => u.Email == email);
            if (existingByEmail is not null)
            {
                if (provider == "google" && !string.IsNullOrEmpty(existingByEmail.OauthProvider))
                {
                    user = existingByEmail;
                }
                else
                {
                    existingByEmail.OauthProvider = provider;
                    existingByEmail.OauthProviderId = providerId;
                    user = existingByEmail;
                }
            }

            if (user is null)
            {
                isNewUser = true;
                user = new User
                {
                    Id = Guid.NewGuid(),
                    Email = email,
                    HashedPassword = null,
                    OauthProvider = provider,
                    OauthProviderId = providerId,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow,
                };
                db.Users.Add(user);
                await db.SaveChangesAsync();

                var profile = new UserProfile
                {
                    Id = Guid.NewGuid(),
                    UserId = user.Id,
                    FullName = fullName,
                    ProfilePictureUrl = profilePictureUrl,
                    SocialLinks = socialLinks,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow,
                };
                db.UserProfiles.Add(profile);
            }

            await db.SaveChangesAsync();
        }

        if (!isNewUser)
        {
            var profile = user.Profile ?? await db.UserProfiles.FirstOrDefaultAsync(p => p.UserId == user.Id);
            if (profile is not null)
            {
                if (string.IsNullOrEmpty(profile.FullName) && !string.IsNullOrEmpty(fullName))
                    profile.FullName = fullName;

                if (provider == "linkedin")
                {
                    if (!string.IsNullOrEmpty(profilePictureUrl) &&
                        (string.IsNullOrEmpty(profile.ProfilePictureUrl) ||
                         (profile.ProfilePictureUrl?.StartsWith("http", StringComparison.OrdinalIgnoreCase) ?? false)))
                        profile.ProfilePictureUrl = profilePictureUrl;
                    if (socialLinks is not null && providerId is not null)
                        profile.SocialLinks = EnsureLinkedInSocialLink(profile.SocialLinks, providerId);
                }
                else if (provider == "google" && string.IsNullOrEmpty(profile.ProfilePictureUrl) && !string.IsNullOrEmpty(profilePictureUrl))
                {
                    profile.ProfilePictureUrl = profilePictureUrl;
                }

                profile.UpdatedAt = DateTime.UtcNow;
                await db.SaveChangesAsync();
            }
        }

        return user;
    }

    private static JsonDocument EnsureLinkedInSocialLink(JsonDocument? existing, string linkedinId)
    {
        var dict = new Dictionary<string, string>();
        if (existing is not null)
        {
            foreach (var prop in existing.RootElement.EnumerateObject())
            {
                if (prop.Value.ValueKind == JsonValueKind.String)
                    dict[prop.Name] = prop.Value.GetString() ?? "";
            }
        }
        if (!dict.ContainsKey("linkedin"))
            dict["linkedin"] = $"https://linkedin.com/in/{linkedinId}";
        return JsonDocument.Parse(JsonSerializer.Serialize(dict));
    }

}
