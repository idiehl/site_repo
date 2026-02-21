namespace Atlas.Contracts.Meridian;

public sealed record MeridianSyncPushRequest(string? DeviceId, List<MeridianDocumentPayload> Changes);
