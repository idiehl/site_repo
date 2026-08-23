using Atlas.Apply.Api;
using Atlas.Apply.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace Atlas.Apply.Pages;

public class ProfileModel(ApplyDbContext db) : PageModel
{
    public ProfileEditorResponse Profile { get; private set; } = new();
    public bool CanEditProfile { get; private set; }
    public bool IsVisitorView => !CanEditProfile;

    public async Task<IActionResult> OnGet(Guid? userId)
    {
        Guid? currentUserId = null;
        if (User.Identity?.IsAuthenticated == true)
        {
            currentUserId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        }

        if (userId is null && currentUserId is null)
        {
            return RedirectToPage("/Login", new { ReturnUrl = Request.Path + Request.QueryString });
        }

        var targetUserId = userId ?? currentUserId!.Value;
        var account = await db.Users.FirstOrDefaultAsync(x => x.Id == targetUserId && x.IsActive);
        if (account is null)
        {
            return NotFound();
        }

        var profile = await db.Profiles.AsNoTracking().FirstOrDefaultAsync(x => x.UserId == targetUserId);
        Profile = ProfileApiMapping.ToResponse(account, profile);
        CanEditProfile = currentUserId == targetUserId;
        return Page();
    }
}
