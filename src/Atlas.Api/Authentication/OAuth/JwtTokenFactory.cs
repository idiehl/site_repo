using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Atlas.Contracts.Auth;
using Atlas.Contracts.Configuration;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;

namespace Atlas.Api.Authentication.OAuth;

public sealed class JwtTokenFactory : IJwtTokenFactory
{
    private readonly JwtSettings _settings;
    private readonly JwtSecurityTokenHandler _tokenHandler = new();

    public JwtTokenFactory(IOptions<JwtSettings> options)
    {
        _settings = options.Value;
    }

    public TokenResponse CreateTokenPair(Guid userId)
    {
        var accessToken = CreateToken(
            userId,
            DateTime.UtcNow.AddMinutes(_settings.AccessTokenExpireMinutes));

        var refreshToken = CreateToken(
            userId,
            DateTime.UtcNow.AddDays(_settings.RefreshTokenExpireDays),
            "refresh");

        return new TokenResponse(accessToken, refreshToken, "bearer");
    }

    private string CreateToken(Guid userId, DateTime expiresAtUtc, string? tokenType = null)
    {
        var claims = new List<Claim>
        {
            new(JwtRegisteredClaimNames.Sub, userId.ToString()),
        };

        if (!string.IsNullOrWhiteSpace(tokenType))
        {
            claims.Add(new Claim("type", tokenType));
        }

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_settings.SecretKey));
        var credentials = new SigningCredentials(key, ResolveSigningAlgorithm(_settings.Algorithm));

        var jwt = new JwtSecurityToken(
            claims: claims,
            expires: expiresAtUtc,
            signingCredentials: credentials);

        return _tokenHandler.WriteToken(jwt);
    }

    private static string ResolveSigningAlgorithm(string? algorithm)
    {
        return algorithm?.ToUpperInvariant() switch
        {
            "HS256" => SecurityAlgorithms.HmacSha256,
            _ => SecurityAlgorithms.HmacSha256,
        };
    }
}
