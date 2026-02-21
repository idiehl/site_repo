namespace Atlas.Contracts.Configuration;

public sealed class SubscriptionLimits
{
    public int FreeResumeGenerationLimit { get; set; } = 3;
    public int PaidResumeGenerationLimit { get; set; } = 9999;
}
