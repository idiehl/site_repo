using System.Reflection;
using System.Text.Json;
using System.Text.Json.Serialization;
using System.Text.RegularExpressions;

namespace Atlas.Web.Archive;

public sealed partial class ArchiveCatalogService(IWebHostEnvironment environment)
{
    private readonly object _gate = new();
    private IReadOnlyList<ArchivePageManifest>? _pages;

    public IReadOnlyList<ArchivePageManifest> LoadPublicPages()
    {
        lock (_gate)
        {
            return _pages ??= LoadAndValidate()
                .Where(page => string.Equals(page.Visibility, "Public", StringComparison.OrdinalIgnoreCase))
                .OrderBy(page => page.Title, StringComparer.OrdinalIgnoreCase)
                .ToArray();
        }
    }

    public ArchivePageManifest? FindPublicPage(string? slug)
    {
        if (string.IsNullOrWhiteSpace(slug) || !SlugPattern().IsMatch(slug))
        {
            return null;
        }

        return LoadPublicPages().SingleOrDefault(
            page => string.Equals(page.Slug, slug, StringComparison.OrdinalIgnoreCase));
    }

    private IEnumerable<ArchivePageManifest> LoadAndValidate()
    {
        var manifestRoot = Path.GetFullPath(
            Path.Combine(environment.ContentRootPath, "Archive", "manifests"));
        if (!Directory.Exists(manifestRoot))
        {
            return [];
        }

        var options = new JsonSerializerOptions(JsonSerializerDefaults.Web)
        {
            UnmappedMemberHandling = JsonUnmappedMemberHandling.Disallow
        };
        var pages = new List<ArchivePageManifest>();
        foreach (var path in Directory.EnumerateFiles(manifestRoot, "*.json", SearchOption.TopDirectoryOnly)
                     .OrderBy(path => path, StringComparer.OrdinalIgnoreCase))
        {
            var page = JsonSerializer.Deserialize<ArchivePageManifest>(File.ReadAllText(path), options)
                ?? throw new InvalidDataException($"Archive manifest '{path}' was empty.");
            Validate(page, path);
            pages.Add(page);
        }

        var duplicate = pages.GroupBy(page => page.Slug, StringComparer.OrdinalIgnoreCase)
            .FirstOrDefault(group => group.Count() > 1);
        if (duplicate is not null)
        {
            throw new InvalidDataException($"Duplicate Archive slug '{duplicate.Key}'.");
        }

        return pages;
    }

    private static void Validate(ArchivePageManifest page, string path)
    {
        if (page.SchemaVersion != 1)
        {
            throw new InvalidDataException($"Unsupported Archive schema in '{path}'.");
        }

        if (!SlugPattern().IsMatch(page.Slug) ||
            !string.Equals(page.Route, $"/Archive/{page.Slug}", StringComparison.Ordinal))
        {
            throw new InvalidDataException($"Unsafe Archive slug or route in '{path}'.");
        }

        if (string.IsNullOrWhiteSpace(page.Title) || string.IsNullOrWhiteSpace(page.Description) ||
            !Guid.TryParse(page.SourceProjectId, out _) || !Guid.TryParse(page.SourcePageId, out _) ||
            !Sha256Pattern().IsMatch(page.SourceRevision) || string.IsNullOrWhiteSpace(page.AssemblyName) ||
            string.IsNullOrWhiteSpace(page.ComponentType))
        {
            throw new InvalidDataException($"Archive manifest '{path}' is incomplete.");
        }

        foreach (var artifact in page.Artifacts)
        {
            if (string.IsNullOrWhiteSpace(artifact.RelativePath) ||
                Path.IsPathRooted(artifact.RelativePath) ||
                artifact.RelativePath.Split('/', '\\').Any(segment => segment is "" or "." or "..") ||
                !Sha256Pattern().IsMatch(artifact.Sha256))
            {
                throw new InvalidDataException($"Archive manifest '{path}' contains an invalid artifact hash.");
            }
        }

        Assembly assembly;
        try
        {
            assembly = Assembly.Load(new AssemblyName(page.AssemblyName));
        }
        catch (Exception ex)
        {
            throw new InvalidDataException($"Archive assembly '{page.AssemblyName}' could not be loaded.", ex);
        }

        page.ResolvedComponentType = assembly.GetType(page.ComponentType, throwOnError: false, ignoreCase: false)
            ?? throw new InvalidDataException(
                $"Archive component '{page.ComponentType}' was not found in '{page.AssemblyName}'.");
    }

    [GeneratedRegex("^[a-z0-9]+(?:-[a-z0-9]+)*$", RegexOptions.CultureInvariant)]
    private static partial Regex SlugPattern();

    [GeneratedRegex("^[a-fA-F0-9]{64}$", RegexOptions.CultureInvariant)]
    private static partial Regex Sha256Pattern();
}
