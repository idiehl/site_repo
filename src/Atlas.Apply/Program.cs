var builder = WebApplication.CreateBuilder(args);

builder.Services.AddRazorComponents()
    .AddInteractiveServerComponents();

var app = builder.Build();

if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Error");
    app.UseHsts();
}

app.UseStaticFiles();
app.UseAntiforgery();

app.MapRazorComponents<Atlas.Apply.Components.App>()
    .AddInteractiveServerRenderMode();

app.MapGet("/healthz", () => Results.Ok(new { status = "healthy" }));

app.Run();

public partial class Program { }
