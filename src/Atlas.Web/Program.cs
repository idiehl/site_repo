using Atlas.Web.Services;
using Atlas.Web.Filters;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddRazorPages();
builder.Services.AddServerSideBlazor();

builder.Services.AddSingleton<IMarkdownService, MarkdownService>();
builder.Services.AddSingleton<IDevDocService, DevDocService>();
builder.Services.AddScoped<DevAuthFilter>();

builder.Services.AddHttpClient("AtlasApplyApi", client =>
{
    client.BaseAddress = new Uri("https://apply.atlasuniversalis.com");
});

var app = builder.Build();

if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Error");
    app.UseHsts();
}

app.UseStaticFiles();
app.UseRouting();

app.MapRazorPages();
app.MapBlazorHub();

app.MapGet("/healthz", () => Results.Ok(new { status = "healthy" }));

app.Run();

public partial class Program { }
