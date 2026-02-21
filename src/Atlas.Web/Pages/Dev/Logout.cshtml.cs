using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;

namespace Atlas.Web.Pages.Dev;

public class LogoutModel : PageModel
{
    public IActionResult OnGet()
    {
        Response.Cookies.Delete("atlas_dev_auth");
        return RedirectToPage("/Dev/Login");
    }
}
