using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Atlas.Web.Filters;
using Atlas.Web.Services;

namespace Atlas.Web.Pages.Dev;

[ServiceFilter(typeof(DevAuthFilter))]
public class DashboardModel : PageModel
{
    private readonly IDevDocService _docService;

    public DashboardModel(IDevDocService docService)
    {
        _docService = docService;
    }

    public IReadOnlyList<AppInfo> Apps { get; private set; } = [];
    public DevStatus Status { get; private set; } = new("READY", null, null, null);

    [BindProperty]
    public string DraftStatus { get; set; } = "READY";
    [BindProperty]
    public string? DraftMessage { get; set; }

    public void OnGet()
    {
        Apps = _docService.GetApps();
        Status = _docService.GetStatus();
        DraftStatus = Status.Status;
        DraftMessage = Status.Message;
    }

    public IActionResult OnPostUpdateStatus()
    {
        _docService.UpdateStatus(DraftStatus, DraftMessage, "admin");
        return RedirectToPage();
    }
}
