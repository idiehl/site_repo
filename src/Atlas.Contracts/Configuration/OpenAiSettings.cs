namespace Atlas.Contracts.Configuration;

public sealed class OpenAiSettings
{
    public string ApiKey { get; set; } = "";
    public string Model { get; set; } = "gpt-4o-mini";
    public string ExtractionModel { get; set; } = "gpt-4o-mini";
}
