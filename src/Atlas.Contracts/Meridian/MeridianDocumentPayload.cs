namespace Atlas.Contracts.Meridian;

public sealed record MeridianDocumentPayload(Guid Id, string Name, int Version, DateTime UpdatedAt);
