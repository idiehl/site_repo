using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Atlas.Web.Filters;
using Atlas.Web.Services;

namespace Atlas.Web.Pages.Dev;

[ServiceFilter(typeof(DevAuthFilter))]
public class OverviewModel : PageModel
{
    private readonly IDevDocService _docService;

    public OverviewModel(IDevDocService docService)
    {
        _docService = docService;
    }

    public DevDocResult Document { get; private set; } = null!;

    public void OnGet()
    {
        Document = _docService.GetDocument("PROJECT_OVERVIEW.md", "Project Overview");
    }
}
