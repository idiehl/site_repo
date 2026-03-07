using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;

namespace Atlas.Web.Pages.Account;

public sealed class CreateModel : PageModel
{
    [BindProperty(SupportsGet = true)]
    public string? Intent { get; set; }

    public void OnGet()
    {
    }

    public IActionResult OnPost()
    {
        // Placeholder endpoint until auth services are implemented.
        return RedirectToPage("/Account/Create", new { intent = Intent ?? "signup-submitted" });
    }
}
