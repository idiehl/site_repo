using System.IdentityModel.Tokens.Jwt;
using System.Text;
using Atlas.Contracts.Configuration;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;

namespace Atlas.Api.OAuth;

/// <summary>
/// Creates JWT access and refresh tokens using JwtSettings.
/// Uses safe defaults when settings are empty or invalid (30 min access, 7 days refresh).
/// </summary>
public sealed class JwtTokenFactory : IJwtTokenFactory
{
    private const string Algorithm = "HS256";
    private const int DefaultAccessTokenExpireMinutes = 30;
    private const int DefaultRefreshTokenExpireDays = 7;

    private readonly JwtSettings _settings;

    public JwtTokenFactory(IOptions<JwtSettings> options)
    {
        var raw = options?.Value;
        _settings = raw ?? new JwtSettings();

        if (string.IsNullOrWhiteSpace(_settings.SecretKey))
            _settings.SecretKey = "CHANGE-ME-IN-PRODUCTION";
        if (string.IsNullOrWhiteSpace(_settings.Algorithm))
            _settings.Algorithm = Algorithm;
    }

    public Task<string> CreateAccessTokenAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        cancellationToken.ThrowIfCancellationRequested();
        var minutes = _settings.AccessTokenExpireMinutes;
        if (minutes <= 0)
            minutes = DefaultAccessTokenExpireMinutes;

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_settings.SecretKey));
        var creds = new SigningCredentials(key, _settings.Algorithm);
        var expires = DateTime.UtcNow.AddMinutes(minutes);

        var token = new JwtSecurityToken(
            claims: [new System.Security.Claims.Claim("sub", userId.ToString())],
            expires: expires,
            signingCredentials: creds);

        var handler = new JwtSecurityTokenHandler();
        return Task.FromResult(handler.WriteToken(token));
    }

    public Task<string> CreateRefreshTokenAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        cancellationToken.ThrowIfCancellationRequested();
        var days = _settings.RefreshTokenExpireDays;
        if (days <= 0)
            days = DefaultRefreshTokenExpireDays;

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_settings.SecretKey));
        var creds = new SigningCredentials(key, _settings.Algorithm);
        var expires = DateTime.UtcNow.AddDays(days);

        var token = new JwtSecurityToken(
            claims:
            [
                new System.Security.Claims.Claim("sub", userId.ToString()),
                new System.Security.Claims.Claim("type", "refresh"),
            ],
            expires: expires,
            signingCredentials: creds);

        var handler = new JwtSecurityTokenHandler();
        return Task.FromResult(handler.WriteToken(token));
    }
}
