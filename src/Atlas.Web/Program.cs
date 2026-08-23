using Atlas.Web.Archive;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddRazorPages();
builder.Services.AddServerSideBlazor();
builder.Services.AddSingleton<ArchiveCatalogService>();

var app = builder.Build();

// Fail candidate startup before health checks if a publication manifest cannot be resolved.
_ = app.Services.GetRequiredService<ArchiveCatalogService>().LoadPublicPages();

// Configure the HTTP request pipeline.
if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Error");
    // The default HSTS value is 30 days. You may want to change this for production scenarios, see https://aka.ms/aspnetcore-hsts.
    app.UseHsts();
}

app.UseHttpsRedirection();

app.UseRouting();

app.UseAuthorization();

app.MapStaticAssets();
app.MapRazorPages()
   .WithStaticAssets();
app.MapBlazorHub();
app.MapGet("/healthz", () => Results.Ok(new
{
    status = "healthy",
    app = "atlas-web",
    release = Environment.GetEnvironmentVariable("ATLAS_RELEASE_COMMIT") ?? "development"
}));

app.Run();

public partial class Program;
