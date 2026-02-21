using Atlas.Api.Authentication;
using Atlas.Api.Authentication.OAuth;
using Atlas.Api.Endpoints;
using Atlas.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddRazorComponents()
    .AddInteractiveServerComponents();

var defaultConnection = builder.Configuration.GetConnectionString("DefaultConnection")
    ?? throw new InvalidOperationException("ConnectionStrings:DefaultConnection is required.");

builder.Services.AddDbContext<AtlasDbContext>(options =>
    options.UseNpgsql(defaultConnection));

builder.Services.AddAtlasJwtAuthentication(builder.Configuration);
builder.Services.AddOAuthCore();

var app = builder.Build();

if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Error");
    app.UseHsts();
}

app.UseStaticFiles();
app.UseAntiforgery();
app.UseAuthentication();
app.UseAuthorization();

app.MapAtlasApiEndpoints();

app.MapRazorComponents<Atlas.Apply.Components.App>()
    .AddInteractiveServerRenderMode();

app.MapGet("/healthz", () => Results.Ok(new { status = "healthy" }));

app.Run();

public partial class Program { }
