using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Atlas.Web.Filters;
using Atlas.Web.Services;

namespace Atlas.Web.Pages.Dev;

[ServiceFilter(typeof(DevAuthFilter))]
public class AppChecklistModel : PageModel
{
    private readonly IDevDocService _docService;

    public AppChecklistModel(IDevDocService docService)
    {
        _docService = docService;
    }

    [BindProperty(SupportsGet = true)]
    public string AppId { get; set; } = string.Empty;

    public string AppName { get; private set; } = "Unknown App";
    public DevDocResult? Document { get; private set; }

    [BindProperty]
    public string? NewTask { get; set; }

    public string? TaskMessage { get; set; }

    public IActionResult OnGet()
    {
        AppName = _docService.GetAppName(AppId) ?? "Unknown App";
        Document = _docService.GetAppDocument(AppId, "checklist");

        if (Document == null)
            return NotFound();

        return Page();
    }

    public IActionResult OnPost()
    {
        AppName = _docService.GetAppName(AppId) ?? "Unknown App";

        if (string.IsNullOrWhiteSpace(NewTask))
        {
            TaskMessage = "Enter a task before saving.";
            Document = _docService.GetAppDocument(AppId, "checklist");
            return Page();
        }

        _docService.AppendChecklistTask(AppId, NewTask.Trim());
        Document = _docService.GetAppDocument(AppId, "checklist");
        NewTask = string.Empty;
        TaskMessage = "Task added successfully.";
        return Page();
    }
}
