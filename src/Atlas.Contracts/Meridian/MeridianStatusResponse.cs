namespace Atlas.Contracts.Meridian;

public sealed record MeridianStatusResponse(string Status, DateTime ServerTime, Guid UserId);
