namespace Atlas.Contracts.Auth;

public sealed record CurrentUserResponse(
    Guid Id,
    string Email,
    DateTime CreatedAt,
    string SubscriptionTier,
    bool IsAdmin,
    int ResumeGenerationLimit,
    bool CanAccessPremiumFeatures);
