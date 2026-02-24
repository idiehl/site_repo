using System.Security.Claims;
using System.Text;
using Atlas.Contracts.Configuration;
using Atlas.Infrastructure.Data;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.IdentityModel.Tokens;

namespace Atlas.Api.Authentication;

public static class JwtAuthenticationExtensions
{
    public static IServiceCollection AddAtlasJwtAuthentication(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        var jwtSettings = ResolveJwtSettings(configuration);

        services.Configure<JwtSettings>(options =>
        {
            options.SecretKey = jwtSettings.SecretKey;
            options.Algorithm = jwtSettings.Algorithm;
            options.AccessTokenExpireMinutes = jwtSettings.AccessTokenExpireMinutes;
            options.RefreshTokenExpireDays = jwtSettings.RefreshTokenExpireDays;
            options.Issuer = jwtSettings.Issuer;
            options.Audience = jwtSettings.Audience;
        });

        services
            .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
            .AddJwtBearer(options =>
            {
                options.MapInboundClaims = false;
                options.TokenValidationParameters = new TokenValidationParameters
                {
                    ValidateIssuerSigningKey = true,
                    IssuerSigningKey = new SymmetricSecurityKey(
                        Encoding.UTF8.GetBytes(jwtSettings.SecretKey)),
                    // Phase-3 parity mode: Python tokens currently rely on sub + exp only.
                    ValidateIssuer = false,
                    ValidateAudience = false,
                    ValidateLifetime = true,
                    ClockSkew = TimeSpan.Zero,
                    NameClaimType = "sub",
                    RoleClaimType = "is_admin",
                };
                options.Events = BuildJwtEvents();
            });

        services.AddAuthorization(options =>
        {
            options.AddPolicy("Admin", policy =>
                policy.RequireClaim("is_admin", "true"));
        });

        return services;
    }

    private static JwtBearerEvents BuildJwtEvents()
    {
        return new JwtBearerEvents
        {
            OnTokenValidated = async context =>
            {
                var tokenType = context.Principal?.FindFirstValue("type");
                if (string.Equals(tokenType, "refresh", StringComparison.OrdinalIgnoreCase))
                {
                    context.Fail("Refresh token cannot be used to access protected routes");
                    return;
                }

                var userIdClaim = context.Principal?.FindFirstValue("sub");
                if (!Guid.TryParse(userIdClaim, out var userId))
                {
                    context.Fail("Could not validate credentials");
                    return;
                }

                var db = context.HttpContext.RequestServices.GetRequiredService<AtlasDbContext>();
                var user = await db.Users
                    .AsNoTracking()
                    .SingleOrDefaultAsync(
                        u => u.Id == userId,
                        context.HttpContext.RequestAborted);

                if (user is null)
                {
                    context.Fail("Could not validate credentials");
                    return;
                }

                context.HttpContext.Items[AtlasApiHttpContextItems.CurrentUser] = user;

                if (context.Principal?.Identity is ClaimsIdentity identity)
                {
                    if (!identity.HasClaim(c => c.Type == "is_admin"))
                    {
                        identity.AddClaim(new Claim("is_admin", user.IsAdmin ? "true" : "false"));
                    }

                    if (!identity.HasClaim(c => c.Type == "email"))
                    {
                        identity.AddClaim(new Claim("email", user.Email));
                    }
                }
            },
            OnChallenge = async context =>
            {
                context.HandleResponse();
                context.Response.StatusCode = StatusCodes.Status401Unauthorized;
                context.Response.Headers["WWW-Authenticate"] = "Bearer";
                context.Response.ContentType = "application/json";
                await context.Response.WriteAsJsonAsync(new
                {
                    detail = "Could not validate credentials",
                });
            },
        };
    }

    private static JwtSettings ResolveJwtSettings(IConfiguration configuration)
    {
        return new JwtSettings
        {
            SecretKey = FirstNonEmpty(
                configuration["JwtSettings:SecretKey"],
                configuration["SECRET_KEY"],
                "CHANGE-ME-IN-PRODUCTION"),
            Algorithm = FirstNonEmpty(
                configuration["JwtSettings:Algorithm"],
                configuration["ALGORITHM"],
                "HS256"),
            AccessTokenExpireMinutes = FirstPositiveInt(
                fallback: 30,
                configuration["JwtSettings:AccessTokenExpireMinutes"],
                configuration["ACCESS_TOKEN_EXPIRE_MINUTES"]),
            RefreshTokenExpireDays = FirstPositiveInt(
                fallback: 7,
                configuration["JwtSettings:RefreshTokenExpireDays"],
                configuration["REFRESH_TOKEN_EXPIRE_DAYS"]),
            Issuer = FirstNonEmpty(
                configuration["JwtSettings:Issuer"],
                "atlasuniversalis.com"),
            Audience = FirstNonEmpty(
                configuration["JwtSettings:Audience"],
                "atlasuniversalis.com"),
        };
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

    private static int FirstPositiveInt(int fallback, params string?[] candidates)
    {
        foreach (var candidate in candidates)
        {
            if (int.TryParse(candidate, out var parsed) && parsed > 0)
            {
                return parsed;
            }
        }

        return fallback;
    }
}

public static class AtlasApiHttpContextItems
{
    public const string CurrentUser = "CurrentUser";
}
