using Atlas.Core.Entities;

namespace Atlas.Core.Interfaces;

public interface IEntitlementService
{
    Task<bool> CanGenerateResumeAsync(User user, CancellationToken ct = default);
    Task<bool> CanAccessPremiumAsync(User user, CancellationToken ct = default);
    Task<UsageLimits> GetUsageLimitsAsync(User user, CancellationToken ct = default);
}

public record UsageLimits(
    int ResumeGenerationLimit,
    int ResumeGenerationsUsed,
    bool CanAccessPremiumFeatures);
