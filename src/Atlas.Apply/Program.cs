using Atlas.Api.Authentication;
using Atlas.Api.Endpoints;
using Atlas.Apply.Services.Admin;
using Atlas.Apply.Services.Applications;
using Atlas.Apply.Services.Auth;
using Atlas.Apply.Services.Dashboard;
using Atlas.Apply.Services.Jobs;
using Atlas.Apply.Services.Profile;
using Atlas.Infrastructure.Data;
using Microsoft.AspNetCore.Components.Authorization;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);
builder.WebHost.UseStaticWebAssets();

builder.Services.AddRazorComponents()
    .AddInteractiveServerComponents();
builder.Services.AddCascadingAuthenticationState();

var defaultConnection = builder.Configuration.GetConnectionString("DefaultConnection")
    ?? throw new InvalidOperationException("ConnectionStrings:DefaultConnection is required.");

builder.Services.AddDbContext<AtlasDbContext>(options =>
    options.UseNpgsql(defaultConnection));

builder.Services.AddAtlasJwtAuthentication(builder.Configuration);
builder.Services.AddAtlasOAuthServices(builder.Configuration);
builder.Services.AddScoped<BrowserTokenStore>();
builder.Services.AddScoped<ApplyAuthenticationStateProvider>();
builder.Services.AddScoped<AuthenticationStateProvider>(sp => sp.GetRequiredService<ApplyAuthenticationStateProvider>());
builder.Services.AddAuthorization(options =>
{
    options.AddPolicy("AdminOnly", policy =>
    {
        policy.RequireAssertion(context =>
            context.User.HasClaim("is_admin", "true") ||
            context.User.IsInRole("admin") ||
            context.User.HasClaim("role", "admin") ||
            context.User.HasClaim("http://schemas.microsoft.com/ws/2008/06/identity/claims/role", "admin"));
    });
});
builder.Services.AddHttpClient<ApplyAuthApiClient>(client =>
{
    client.BaseAddress = new Uri(ResolveAuthApiBaseUrl(builder.Configuration), UriKind.Absolute);
});
builder.Services.AddHttpClient<ApplyDashboardApiClient>(client =>
{
    client.BaseAddress = new Uri(ResolveAuthApiBaseUrl(builder.Configuration), UriKind.Absolute);
});
builder.Services.AddHttpClient<ApplyJobDetailApiClient>(client =>
{
    client.BaseAddress = new Uri(ResolveAuthApiBaseUrl(builder.Configuration), UriKind.Absolute);
});
builder.Services.AddHttpClient<ApplyProfileApiClient>(client =>
{
    client.BaseAddress = new Uri(ResolveAuthApiBaseUrl(builder.Configuration), UriKind.Absolute);
});
builder.Services.AddHttpClient<ApplyApplicationsApiClient>(client =>
{
    client.BaseAddress = new Uri(ResolveAuthApiBaseUrl(builder.Configuration), UriKind.Absolute);
});
builder.Services.AddScoped<ApplyApplicationStateService>();
builder.Services.AddHttpClient<ApplyAdminApiClient>(client =>
{
    client.BaseAddress = new Uri(ResolveAuthApiBaseUrl(builder.Configuration), UriKind.Absolute);
});
builder.Services.AddScoped<ApplyJobStateService>();

var app = builder.Build();

if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Error");
    app.UseHsts();
}

app.UseAntiforgery();
app.UseAuthentication();
app.UseAuthorization();

app.MapAtlasApiEndpoints();
app.MapStaticAssets();

app.MapRazorComponents<Atlas.Apply.Components.App>()
    .AddInteractiveServerRenderMode();

app.MapGet("/healthz", () => Results.Ok(new { status = "healthy" }));

app.Run();

static string ResolveAuthApiBaseUrl(IConfiguration configuration)
{
    var value = configuration["AUTH_API_BASE_URL"];
    if (string.IsNullOrWhiteSpace(value))
    {
        value = configuration["AuthApi:BaseUrl"];
    }

    if (string.IsNullOrWhiteSpace(value))
    {
        value = "http://localhost:8000";
    }

    return value.TrimEnd('/');
}

public partial class Program { }
