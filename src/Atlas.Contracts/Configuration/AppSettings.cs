namespace Atlas.Contracts.Configuration;

public sealed class AppSettings
{
    public string Environment { get; set; } = "development";
    public bool Debug { get; set; }
    public string FrontendUrl { get; set; } = "http://localhost:5010";
    public string DevToken { get; set; } = "";
    public string[] AllowedOrigins { get; set; } = [];
}
