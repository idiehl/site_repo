using System.Security.Claims;
using Atlas.Api.Authentication;
using FluentAssertions;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Options;
using Xunit;

namespace Atlas.Api.Tests.Authentication;

public sealed class JwtAuthenticationExtensionsTests
{
    [Fact]
    public async Task TokenValidated_WithRefreshTokenClaim_ShouldFailBeforeDatabaseLookup()
    {
        var services = new ServiceCollection();
        var configuration = new ConfigurationBuilder()
            .AddInMemoryCollection(new Dictionary<string, string?>
            {
                ["JwtSettings:SecretKey"] = "test-secret-key-for-phase3-validation",
            })
            .Build();

        services.AddAtlasJwtAuthentication(configuration);
        using var serviceProvider = services.BuildServiceProvider();

        var optionsMonitor = serviceProvider.GetRequiredService<IOptionsMonitor<JwtBearerOptions>>();
        var options = optionsMonitor.Get(JwtBearerDefaults.AuthenticationScheme);
        var scheme = new AuthenticationScheme(
            JwtBearerDefaults.AuthenticationScheme,
            JwtBearerDefaults.AuthenticationScheme,
            typeof(JwtBearerHandler));
        var httpContext = new DefaultHttpContext
        {
            RequestServices = serviceProvider,
        };

        var context = new TokenValidatedContext(httpContext, scheme, options)
        {
            Principal = new ClaimsPrincipal(
                new ClaimsIdentity(
                [
                    new Claim("sub", Guid.NewGuid().ToString()),
                    new Claim("type", "refresh"),
                ], JwtBearerDefaults.AuthenticationScheme)),
        };

        await options.Events.TokenValidated(context);

        context.Result.Should().NotBeNull();
        context.Result!.Failure.Should().NotBeNull();
        context.Result!.Failure!.Message.Should().Contain("Refresh token");
    }
}
