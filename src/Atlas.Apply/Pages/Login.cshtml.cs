using System.ComponentModel.DataAnnotations;
using System.Security.Claims;
using Atlas.Apply.Data;
using Atlas.Apply.Domain;
using Atlas.Apply.Services;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.EntityFrameworkCore;

namespace Atlas.Apply.Pages;

public class LoginModel(ApplyDbContext db, IPasswordService passwordService) : PageModel
{
    [BindProperty]
    public LoginInputModel LoginInput { get; set; } = new();

    [BindProperty]
    public RegisterInputModel RegisterInput { get; set; } = new();

    public string? ErrorMessage { get; private set; }

    public IActionResult OnGet()
    {
        // Clear stale antiforgery cookies left from prior key rings after deploys.
        foreach (var cookieKey in Request.Cookies.Keys.Where(x => x.StartsWith(".AspNetCore.Antiforgery.", StringComparison.Ordinal)))
        {
            Response.Cookies.Delete(cookieKey);
        }

        if (User.Identity?.IsAuthenticated == true)
        {
            return RedirectToPage("/Dashboard");
        }

        return Page();
    }

    public async Task<IActionResult> OnPostLoginAsync()
    {
        var email = LoginInput.Email?.Trim() ?? string.Empty;
        var password = LoginInput.Password ?? string.Empty;
        if (string.IsNullOrWhiteSpace(email) || string.IsNullOrWhiteSpace(password))
        {
            ErrorMessage = "Email and password are required.";
            return Page();
        }
        if (!new EmailAddressAttribute().IsValid(email))
        {
            ErrorMessage = "Please enter a valid email address.";
            return Page();
        }

        try
        {
            email = email.ToLowerInvariant();
            var user = await db.Users.FirstOrDefaultAsync(x => x.Email == email && x.IsActive);
            if (user is null || !passwordService.Verify(password, user.PasswordHash))
            {
                ErrorMessage = "Invalid credentials.";
                return Page();
            }

            user.LastLoginUtc = DateTime.UtcNow;
            user.UpdatedUtc = DateTime.UtcNow;
            await db.SaveChangesAsync();

            await SignInAsync(user);
            return RedirectToPage("/Dashboard");
        }
        catch
        {
            ErrorMessage = "Authentication is temporarily unavailable. Please try again shortly.";
            return Page();
        }
    }

    public async Task<IActionResult> OnPostRegisterAsync()
    {
        var email = RegisterInput.Email?.Trim() ?? string.Empty;
        var password = RegisterInput.Password ?? string.Empty;
        var displayName = RegisterInput.DisplayName?.Trim() ?? string.Empty;
        if (string.IsNullOrWhiteSpace(email) || string.IsNullOrWhiteSpace(password))
        {
            ErrorMessage = "Email and password are required.";
            return Page();
        }
        if (!new EmailAddressAttribute().IsValid(email))
        {
            ErrorMessage = "Please enter a valid email address.";
            return Page();
        }

        try
        {
            email = email.ToLowerInvariant();
            var existing = await db.Users.AnyAsync(x => x.Email == email);
            if (existing)
            {
                ErrorMessage = "An account with this email already exists.";
                return Page();
            }

            var user = new UserAccount
            {
                Email = email,
                PasswordHash = passwordService.Hash(password),
                DisplayName = string.IsNullOrWhiteSpace(displayName) ? email : displayName
            };
            db.Users.Add(user);
            await db.SaveChangesAsync();

            await SignInAsync(user);
            return RedirectToPage("/Dashboard");
        }
        catch
        {
            ErrorMessage = "Account creation is temporarily unavailable. Please try again shortly.";
            return Page();
        }
    }

    private async Task SignInAsync(UserAccount user)
    {
        var claims = new List<Claim>
        {
            new(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new(ClaimTypes.Email, user.Email),
            new("display_name", user.DisplayName)
        };
        var identity = new ClaimsIdentity(claims, CookieAuthenticationDefaults.AuthenticationScheme);
        await HttpContext.SignInAsync(CookieAuthenticationDefaults.AuthenticationScheme, new ClaimsPrincipal(identity));
    }

}

public sealed class LoginInputModel
{
    public string Email { get; set; } = string.Empty;

    public string Password { get; set; } = string.Empty;
}

public sealed class RegisterInputModel
{
    public string DisplayName { get; set; } = string.Empty;

    public string Email { get; set; } = string.Empty;

    public string Password { get; set; } = string.Empty;
}
