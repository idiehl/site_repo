namespace Atlas.Contracts.Jobs;

public sealed record JobIngestRequest(string Url, string? HtmlContent = null);
