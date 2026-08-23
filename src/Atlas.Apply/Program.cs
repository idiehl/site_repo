using Atlas.Apply.Api;
using Atlas.Apply.Data;
using Atlas.Apply.Services;
using Microsoft.AspNetCore.DataProtection;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.HttpOverrides;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddRazorPages();
builder.Services.AddAuthentication(CookieAuthenticationDefaults.AuthenticationScheme)
    .AddCookie(options =>
    {
        options.LoginPath = "/Login";
        options.LogoutPath = "/Logout";
        options.SlidingExpiration = true;
        options.Cookie.Name = "atlas_apply_session";
        options.Cookie.HttpOnly = true;
        options.Cookie.SameSite = SameSiteMode.Lax;
    });
builder.Services.AddAuthorization();

var dataProtectionPath = builder.Configuration["DataProtectionKeysPath"];
if (string.IsNullOrWhiteSpace(dataProtectionPath))
{
    dataProtectionPath = OperatingSystem.IsWindows()
        ? Path.Combine(builder.Environment.ContentRootPath, ".keys")
        : "/var/lib/atlas-apply/dataprotection-keys";
}

if (!Path.IsPathRooted(dataProtectionPath))
{
    dataProtectionPath = Path.GetFullPath(dataProtectionPath, builder.Environment.ContentRootPath);
}

Directory.CreateDirectory(dataProtectionPath);
builder.Services
    .AddDataProtection()
    .PersistKeysToFileSystem(new DirectoryInfo(dataProtectionPath));

var provider = builder.Configuration["ApplyDbProvider"] ?? "Sqlite";
var connectionString = builder.Configuration.GetConnectionString("ApplyDb");
builder.Services.AddDbContext<ApplyDbContext>(options =>
{
    if (provider.Equals("Sqlite", StringComparison.OrdinalIgnoreCase))
    {
        options.UseSqlite(connectionString ?? "Data Source=.runtime/atlas-apply.db");
        return;
    }

    if (!provider.Equals("Postgres", StringComparison.OrdinalIgnoreCase))
    {
        throw new InvalidOperationException($"Unsupported ApplyDbProvider '{provider}'.");
    }

    if (string.IsNullOrWhiteSpace(connectionString))
    {
        throw new InvalidOperationException(
            "ConnectionStrings:ApplyDb is required when ApplyDbProvider is Postgres. " +
            "Supply it through the protected service environment; credentials must not be committed.");
    }

    options.UseNpgsql(connectionString);
});

builder.Services.AddScoped<IPasswordService, PasswordService>();
builder.Services.AddScoped<IAutomationService, AutomationService>();
builder.Services.AddScoped<IProfileAssetService, ProfileAssetService>();
builder.Services.AddScoped<ILinkedInImportService, LinkedInImportService>();
builder.Services.AddScoped<IResumeTextParsingService, ResumeTextParsingService>();
builder.Services.AddScoped<ILocalPdfImportService, LocalPdfImportService>();
builder.Services.AddScoped<IResumeImportService, ResumeImportService>();
builder.Services.AddHttpClient<ICompanyIntelligenceService, CompanyIntelligenceService>();
builder.Services.AddHttpClient<IJobSummaryService, JobSummaryService>();
builder.Services.Configure<PdfImportOptions>(builder.Configuration.GetSection("PdfImport"));

var app = builder.Build();

if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Error");
    app.UseHsts();
}

app.UseForwardedHeaders(new ForwardedHeadersOptions
{
    ForwardedHeaders = ForwardedHeaders.XForwardedFor | ForwardedHeaders.XForwardedProto
});
app.UseWhen(
    context => !context.Request.Path.StartsWithSegments("/healthz"),
    branch => branch.UseHttpsRedirection());
app.UseRouting();
app.UseAuthentication();
app.UseAuthorization();

app.MapStaticAssets();
app.MapRazorPages().WithStaticAssets();
app.MapApplyApi();
app.MapGet("/healthz", () => Results.Ok(new { status = "healthy", app = "atlas-apply" }));

// Keep this explicit for nginx compatibility and diagnostics.
app.MapGet("/atlas-apply-extension.zip", () =>
{
    var extensionPath = Path.Combine(app.Environment.WebRootPath, "atlas-apply-extension.zip");
    if (!File.Exists(extensionPath))
    {
        return Results.NotFound(new { error = "Extension package not found." });
    }

    return Results.File(
        extensionPath,
        "application/zip",
        "atlas-apply-extension.zip");
});

using (var scope = app.Services.CreateScope())
{
    var logger = scope.ServiceProvider.GetRequiredService<ILoggerFactory>().CreateLogger("Atlas.Apply.Startup");
    try
    {
        var db = scope.ServiceProvider.GetRequiredService<ApplyDbContext>();
        if (provider.Equals("Sqlite", StringComparison.OrdinalIgnoreCase))
        {
            SqliteMigrationBootstrap.EnsureMigrated(db, logger);
        }
        else
        {
            db.Database.Migrate();
        }
    }
    catch (Exception ex)
    {
        logger.LogCritical(ex, "Database migration failed during startup; refusing to report a healthy service.");
        throw;
    }
}

app.Run();

public partial class Program;
