namespace Atlas.Contracts.Meridian;

public sealed record MeridianSyncPullResponse(DateTime ServerTime, List<MeridianDocumentPayload> Changes);
