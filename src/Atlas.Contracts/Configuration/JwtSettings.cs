namespace Atlas.Contracts.Configuration;

public sealed class JwtSettings
{
    public string SecretKey { get; set; } = "";
    public string Algorithm { get; set; } = "HS256";
    public int AccessTokenExpireMinutes { get; set; } = 30;
    public int RefreshTokenExpireDays { get; set; } = 7;
    public string Issuer { get; set; } = "atlasuniversalis.com";
    public string Audience { get; set; } = "atlasuniversalis.com";
}
