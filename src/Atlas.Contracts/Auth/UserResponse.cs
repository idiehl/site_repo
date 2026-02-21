namespace Atlas.Contracts.Auth;

public sealed record UserResponse(
    Guid Id,
    string Email,
    DateTime CreatedAt,
    string SubscriptionTier,
    bool IsAdmin);
