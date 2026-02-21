namespace Atlas.Contracts.Auth;

public sealed record TokenResponse(string AccessToken, string RefreshToken, string TokenType);
