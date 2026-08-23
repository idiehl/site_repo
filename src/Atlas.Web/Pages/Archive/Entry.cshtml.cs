using Atlas.Web.Archive;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;

namespace Atlas.Web.Pages.Archive;

public sealed class EntryModel(ArchiveCatalogService catalog) : PageModel
{
    public ArchivePageManifest? Manifest { get; private set; }
    public Type ComponentType => Manifest?.ResolvedComponentType
        ?? throw new InvalidOperationException("The Archive component was not resolved.");

    public IActionResult OnGet(string? slug)
    {
        Manifest = catalog.FindPublicPage(slug);
        return Manifest is null ? NotFound() : Page();
    }
}
