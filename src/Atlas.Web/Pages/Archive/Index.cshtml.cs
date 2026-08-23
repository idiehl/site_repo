using Atlas.Web.Archive;
using Microsoft.AspNetCore.Mvc.RazorPages;

namespace Atlas.Web.Pages.Archive;

public sealed class IndexModel(ArchiveCatalogService catalog) : PageModel
{
    public IReadOnlyList<ArchivePageManifest> Pages { get; private set; } = [];

    public void OnGet()
    {
        Pages = catalog.LoadPublicPages();
    }
}
