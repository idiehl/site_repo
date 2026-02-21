namespace Atlas.Contracts.Meridian;

public sealed record MeridianSyncPullRequest(DateTime? Since, string? DeviceId);
