namespace Atlas.Api.OAuth;

public sealed record OAuthUserInfo(
    string ProviderId,
    string Email,
    string? Name,
    string? GivenName,
    string? FamilyName,
    string? PictureUrl);
