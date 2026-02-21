using System.Text.Json;

namespace Atlas.Meridian.Core;

public static class DocumentSerializer
{
    private static readonly JsonSerializerOptions Options = new()
    {
        WriteIndented = true,
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
    };

    public static string Serialize(MeridianDocument document)
    {
        return JsonSerializer.Serialize(document, Options);
    }

    public static MeridianDocument? Deserialize(string json)
    {
        return JsonSerializer.Deserialize<MeridianDocument>(json, Options);
    }
}
