namespace Atlas.Contracts.Billing;

public sealed record SubscriptionStatusDto(
    string Tier,
    string Status,
    DateTime? CurrentPeriodEnd,
    int ResumeGenerationsUsed,
    int ResumeGenerationLimit,
    bool CanAccessPremiumFeatures);
