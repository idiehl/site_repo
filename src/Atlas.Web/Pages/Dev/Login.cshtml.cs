using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;

namespace Atlas.Web.Pages.Dev;

public class LoginModel : PageModel
{
    private readonly IHttpClientFactory _httpClientFactory;

    public LoginModel(IHttpClientFactory httpClientFactory)
    {
        _httpClientFactory = httpClientFactory;
    }

    [BindProperty]
    public string Email { get; set; } = string.Empty;

    [BindProperty]
    public string Password { get; set; } = string.Empty;

    public string? ErrorMessage { get; set; }

    public void OnGet()
    {
        if (Request.Cookies.ContainsKey("atlas_dev_auth"))
        {
            Response.Redirect("/dev/dashboard");
        }
    }

    public async Task<IActionResult> OnPostAsync()
    {
        if (string.IsNullOrWhiteSpace(Email) || string.IsNullOrWhiteSpace(Password))
        {
            ErrorMessage = "Email and password are required.";
            return Page();
        }

        try
        {
            var client = _httpClientFactory.CreateClient("AtlasApplyApi");

            var loginContent = new FormUrlEncodedContent(new[]
            {
                new KeyValuePair<string, string>("username", Email),
                new KeyValuePair<string, string>("password", Password)
            });

            var loginResponse = await client.PostAsync("/api/v1/auth/login", loginContent);

            if (!loginResponse.IsSuccessStatusCode)
            {
                ErrorMessage = "Invalid email or password.";
                return Page();
            }

            var loginData = await loginResponse.Content.ReadFromJsonAsync<LoginResponse>();
            if (loginData?.access_token == null)
            {
                ErrorMessage = "Invalid response from authentication server.";
                return Page();
            }

            var meRequest = new HttpRequestMessage(HttpMethod.Get, "/api/v1/auth/me");
            meRequest.Headers.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", loginData.access_token);
            var meResponse = await client.SendAsync(meRequest);

            if (!meResponse.IsSuccessStatusCode)
            {
                ErrorMessage = "Failed to verify admin access.";
                return Page();
            }

            var meData = await meResponse.Content.ReadFromJsonAsync<MeResponse>();
            if (meData?.is_admin != true)
            {
                ErrorMessage = "Admin access required.";
                return Page();
            }

            Response.Cookies.Append("atlas_dev_auth", "authenticated", new CookieOptions
            {
                HttpOnly = true,
                Secure = true,
                SameSite = SameSiteMode.Strict,
                MaxAge = TimeSpan.FromHours(24)
            });

            return RedirectToPage("/Dev/Dashboard");
        }
        catch
        {
            ErrorMessage = "Failed to sign in. Please try again.";
            return Page();
        }
    }

    private record LoginResponse(string? access_token, string? refresh_token);
    private record MeResponse(bool is_admin, string? email);
}
