using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Atlas.Web.Filters;
using Atlas.Web.Services;

namespace Atlas.Web.Pages.Dev;

[ServiceFilter(typeof(DevAuthFilter))]
public class AppOverviewModel : PageModel
{
    private readonly IDevDocService _docService;

    public AppOverviewModel(IDevDocService docService)
    {
        _docService = docService;
    }

    [BindProperty(SupportsGet = true)]
    public string AppId { get; set; } = string.Empty;

    public string AppName { get; private set; } = "Unknown App";
    public DevDocResult? Document { get; private set; }

    public IActionResult OnGet()
    {
        AppName = _docService.GetAppName(AppId) ?? "Unknown App";
        Document = _docService.GetAppDocument(AppId, "overview");

        if (Document == null)
            return NotFound();

        return Page();
    }
}
