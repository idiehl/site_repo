using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Atlas.Web.Filters;
using Atlas.Web.Services;

namespace Atlas.Web.Pages.Dev;

[ServiceFilter(typeof(DevAuthFilter))]
public class LogModel : PageModel
{
    private readonly IDevDocService _docService;

    public LogModel(IDevDocService docService)
    {
        _docService = docService;
    }

    public DevDocResult Document { get; private set; } = null!;

    public void OnGet()
    {
        Document = _docService.GetDocument("Master_Log.md", "Master Log");
    }
}
