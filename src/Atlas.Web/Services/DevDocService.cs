using System.Text.Json;

namespace Atlas.Web.Services;

public class DevDocService : IDevDocService
{
    private readonly IMarkdownService _markdown;
    private readonly string _docsDir;

    private static readonly Dictionary<string, (string Name, string Description, string Prefix)> Apps = new()
    {
        ["atlas-forge"] = ("Atlas Forge", "UI design laboratory for Vue and React components", "Forge"),
        ["atlas-apply"] = ("Atlas Apply", "AI-powered job application and resume platform", "Apply"),
        ["atlas-universalis"] = ("Atlas Universalis", "Main site and product hub for the Atlas ecosystem", "Universalis"),
        ["electracast"] = ("ElectraCast", "ElectraCast mirror and podcast network rebuild", "Electracast"),
        ["atlas-meridian"] = ("Atlas Meridian", "Dynamic visual interface and canvas operating system", "Meridian"),
    };

    private static readonly Dictionary<string, string> DocTypeToSuffix = new()
    {
        ["log"] = "Log",
        ["overview"] = "Overview",
        ["checklist"] = "Checklist",
        ["inventory"] = "Inventory",
    };

    public DevDocService(IMarkdownService markdown, IWebHostEnvironment env)
    {
        _markdown = markdown;
        _docsDir = Path.GetFullPath(Path.Combine(env.ContentRootPath, "..", "..", "docs", "master_log"));
    }

    public DevDocResult GetDocument(string filename, string title)
    {
        var path = Path.Combine(_docsDir, filename);
        if (!File.Exists(path))
            return new DevDocResult(title, "", "<p>Document not found.</p>", null);

        var md = File.ReadAllText(path);
        var html = _markdown.ToHtml(md);
        var lastModified = File.GetLastWriteTimeUtc(path).ToString("o");
        return new DevDocResult(title, md, html, lastModified);
    }

    public DevDocResult? GetAppDocument(string appId, string docType)
    {
        if (!Apps.TryGetValue(appId, out var app))
            return null;
        if (!DocTypeToSuffix.TryGetValue(docType, out var suffix))
            return null;

        var filename = $"{app.Prefix}_{suffix}.md";
        var title = $"{app.Name} — {suffix}";
        return GetDocument(filename, title);
    }

    public string? GetAppName(string appId)
    {
        return Apps.TryGetValue(appId, out var app) ? app.Name : null;
    }

    public void AppendChecklistTask(string appId, string task)
    {
        if (!Apps.TryGetValue(appId, out var app))
            return;

        var filename = $"{app.Prefix}_Checklist.md";
        var path = Path.Combine(_docsDir, filename);
        if (!File.Exists(path))
            return;

        var cleaned = string.Join(" ", task.Replace("\r", " ").Replace("\n", " ").Split(' ', StringSplitOptions.RemoveEmptyEntries));
        if (string.IsNullOrEmpty(cleaned) || cleaned.Length > 240)
            return;

        var lines = File.ReadAllLines(path).ToList();
        var header = "## Rapid Capture (Objectives)";
        var placeholder = "- [ ] Add objectives here";
        var taskLine = $"- [ ] {cleaned}";

        var headerIndex = lines.IndexOf(header);
        if (headerIndex >= 0)
        {
            var insertIndex = headerIndex + 1;
            while (insertIndex < lines.Count && string.IsNullOrWhiteSpace(lines[insertIndex]))
                insertIndex++;

            if (insertIndex < lines.Count && lines[insertIndex].Trim() == placeholder)
                lines[insertIndex] = taskLine;
            else
                lines.Insert(insertIndex, taskLine);
        }
        else
        {
            if (lines.Count > 0 && !string.IsNullOrWhiteSpace(lines[^1]))
                lines.Add("");
            lines.Add(header);
            lines.Add(taskLine);
        }

        var content = string.Join("\n", lines);
        if (!content.EndsWith('\n'))
            content += "\n";
        File.WriteAllText(path, content);
    }

    public DevStatus GetStatus()
    {
        var path = Path.Combine(_docsDir, "dev_status.json");
        if (!File.Exists(path))
        {
            var defaultStatus = new DevStatus("READY", "All systems ready.", DateTime.UtcNow.ToString("o"), "system");
            SaveStatus(defaultStatus);
            return defaultStatus;
        }

        try
        {
            var json = File.ReadAllText(path);
            var data = JsonSerializer.Deserialize<DevStatus>(json, new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
            return data ?? new DevStatus("READY", "All systems ready.", DateTime.UtcNow.ToString("o"), "system");
        }
        catch
        {
            var defaultStatus = new DevStatus("READY", "All systems ready.", DateTime.UtcNow.ToString("o"), "system");
            SaveStatus(defaultStatus);
            return defaultStatus;
        }
    }

    public DevStatus UpdateStatus(string status, string? message, string? updatedBy)
    {
        var updated = new DevStatus(status, message, DateTime.UtcNow.ToString("o"), updatedBy);
        SaveStatus(updated);
        return updated;
    }

    public IReadOnlyList<AppInfo> GetApps()
    {
        return Apps.Select(kv => new AppInfo(kv.Key, kv.Value.Name, kv.Value.Description)).ToList();
    }

    private void SaveStatus(DevStatus status)
    {
        var path = Path.Combine(_docsDir, "dev_status.json");
        var json = JsonSerializer.Serialize(new
        {
            status = status.Status,
            message = status.Message,
            updated_at = status.UpdatedAt,
            updated_by = status.UpdatedBy
        }, new JsonSerializerOptions { WriteIndented = true });
        File.WriteAllText(path, json + "\n");
    }
}
