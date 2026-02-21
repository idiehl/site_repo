# Atlas Universalis — Hybrid Architecture Specification

> **Version:** 1.0.0  
> **Date:** 2026-02-19  
> **Scope:** C#/Razor/Blazor + Meridian hybrid rebuild. ElectraCast is **OUT** of scope.  
> **Target Framework:** .NET 10 (net10.0), already used in existing Meridian projects.

---

## Section 1: Target .NET Solution Structure

### 1.1 File Tree

```
AtlasUniversalis.sln
│
├── src/
│   ├── Atlas.Web/                          # Main web host (Razor Pages + Blazor Server)
│   │   ├── Atlas.Web.csproj
│   │   ├── Program.cs
│   │   ├── appsettings.json
│   │   ├── appsettings.Development.json
│   │   ├── Pages/                          # Razor Pages (portfolio, landing, dev portal)
│   │   │   ├── Index.cshtml / .cs
│   │   │   ├── About.cshtml / .cs
│   │   │   ├── Projects.cshtml / .cs
│   │   │   ├── Meridian.cshtml / .cs
│   │   │   ├── Error.cshtml / .cs
│   │   │   ├── Dev/                        # Dev portal pages
│   │   │   │   ├── Login.cshtml / .cs
│   │   │   │   ├── Dashboard.cshtml / .cs
│   │   │   │   ├── Overview.cshtml / .cs
│   │   │   │   ├── Log.cshtml / .cs
│   │   │   │   ├── Checklist.cshtml / .cs
│   │   │   │   └── Inventory.cshtml / .cs
│   │   │   └── _ViewImports.cshtml
│   │   ├── Components/                     # Blazor Server components (interactive islands)
│   │   │   ├── MeridianPlayer.razor
│   │   │   ├── MeridianToolbar.razor
│   │   │   └── _Imports.razor
│   │   ├── wwwroot/
│   │   │   ├── css/
│   │   │   ├── js/
│   │   │   ├── images/
│   │   │   └── fonts/
│   │   └── Areas/
│   │       └── Identity/                   # ASP.NET Identity scaffolded pages (if needed)
│   │
│   ├── Atlas.Apply/                        # Apply subdomain app (Blazor Server interactive)
│   │   ├── Atlas.Apply.csproj
│   │   ├── Program.cs
│   │   ├── appsettings.json
│   │   ├── Components/
│   │   │   ├── Pages/
│   │   │   │   ├── Dashboard.razor
│   │   │   │   ├── Login.razor
│   │   │   │   ├── Register.razor
│   │   │   │   ├── OAuthCallback.razor
│   │   │   │   ├── Profile.razor
│   │   │   │   ├── Jobs/
│   │   │   │   │   ├── JobList.razor
│   │   │   │   │   └── JobDetail.razor
│   │   │   │   ├── Applications/
│   │   │   │   │   └── ApplicationList.razor
│   │   │   │   ├── Admin/
│   │   │   │   │   ├── AdminDashboard.razor
│   │   │   │   │   ├── AdminAnalytics.razor
│   │   │   │   │   └── AdminSecurity.razor
│   │   │   │   └── Extension.razor
│   │   │   ├── Layout/
│   │   │   │   ├── MainLayout.razor
│   │   │   │   └── NavMenu.razor
│   │   │   └── Shared/
│   │   │       ├── StatusBadge.razor
│   │   │       ├── JobTable.razor
│   │   │       ├── IngestModal.razor
│   │   │       └── GenerateSection.razor
│   │   └── wwwroot/
│   │
│   ├── Atlas.Forge/                        # Forge subdomain (Blazor Server)
│   │   ├── Atlas.Forge.csproj
│   │   ├── Program.cs
│   │   ├── Components/
│   │   │   ├── Pages/
│   │   │   │   └── Playground.razor
│   │   │   ├── Core/
│   │   │   │   ├── PlaygroundApp.razor
│   │   │   │   ├── ComponentBrowser.razor
│   │   │   │   ├── PreviewPanel.razor
│   │   │   │   ├── PropsEditor.razor
│   │   │   │   ├── CodeExporter.razor
│   │   │   │   ├── CanvasBuilder.razor
│   │   │   │   ├── CanvasElementRenderer.razor
│   │   │   │   ├── TopBar.razor
│   │   │   │   └── SaveDesignModal.razor
│   │   │   └── CustomControls/
│   │   │       ├── AtlasButton.razor
│   │   │       ├── AtlasCard.razor
│   │   │       ├── AtlasInput.razor
│   │   │       ├── AtlasBadge.razor
│   │   │       ├── AtlasTabs.razor
│   │   │       ├── AtlasProgress.razor
│   │   │       ├── AtlasAlert.razor
│   │   │       └── AtlasAvatar.razor
│   │   └── wwwroot/
│   │
│   ├── Atlas.Api/                          # Minimal API project (all HTTP endpoints)
│   │   ├── Atlas.Api.csproj
│   │   ├── Program.cs
│   │   ├── Endpoints/
│   │   │   ├── AuthEndpoints.cs
│   │   │   ├── JobEndpoints.cs
│   │   │   ├── ApplicationEndpoints.cs
│   │   │   ├── ProfileEndpoints.cs
│   │   │   ├── BillingEndpoints.cs
│   │   │   ├── AdminEndpoints.cs
│   │   │   ├── MeridianEndpoints.cs
│   │   │   ├── PlaygroundEndpoints.cs
│   │   │   └── DevEndpoints.cs
│   │   ├── Filters/
│   │   │   └── ValidationFilter.cs
│   │   └── Middleware/
│   │       ├── AnalyticsMiddleware.cs
│   │       └── ErrorHandlingMiddleware.cs
│   │
│   ├── Atlas.Core/                         # Domain models, business logic, interfaces
│   │   ├── Atlas.Core.csproj
│   │   ├── Entities/
│   │   │   ├── User.cs
│   │   │   ├── UserProfile.cs
│   │   │   ├── JobPosting.cs
│   │   │   ├── CompanyDeepDive.cs
│   │   │   ├── Application.cs
│   │   │   ├── ApplicationEvent.cs
│   │   │   ├── GeneratedResume.cs
│   │   │   ├── GeneratedCoverLetter.cs
│   │   │   └── AnalyticsEvent.cs
│   │   ├── Enums/
│   │   │   └── ApplicationStatus.cs
│   │   ├── Interfaces/
│   │   │   ├── IJobRepository.cs
│   │   │   ├── IApplicationRepository.cs
│   │   │   ├── IUserRepository.cs
│   │   │   ├── ILlmClient.cs
│   │   │   ├── IScraperService.cs
│   │   │   └── IEntitlementService.cs
│   │   └── Services/
│   │       ├── EntitlementService.cs
│   │       └── ResumeGenerationService.cs
│   │
│   ├── Atlas.Infrastructure/               # EF Core, external services, background jobs
│   │   ├── Atlas.Infrastructure.csproj
│   │   ├── Data/
│   │   │   ├── AtlasDbContext.cs
│   │   │   ├── Configurations/             # IEntityTypeConfiguration<T> classes
│   │   │   │   ├── UserConfiguration.cs
│   │   │   │   ├── JobPostingConfiguration.cs
│   │   │   │   ├── ApplicationConfiguration.cs
│   │   │   │   └── ...
│   │   │   └── Migrations/                 # EF Core migrations
│   │   ├── Repositories/
│   │   │   ├── JobRepository.cs
│   │   │   ├── ApplicationRepository.cs
│   │   │   └── UserRepository.cs
│   │   ├── ExternalServices/
│   │   │   ├── LlmClient.cs               # OpenAI integration
│   │   │   ├── ScraperService.cs
│   │   │   ├── StripeService.cs
│   │   │   └── OAuthProviders/
│   │   │       ├── LinkedInOAuthProvider.cs
│   │   │       └── GoogleOAuthProvider.cs
│   │   └── BackgroundJobs/
│   │       ├── JobScrapingWorker.cs         # IHostedService / BackgroundService
│   │       ├── StaleApplicationWorker.cs
│   │       └── JobChannel.cs               # System.Threading.Channels producer/consumer
│   │
│   ├── Atlas.Contracts/                    # Shared DTOs, request/response types, configs
│   │   ├── Atlas.Contracts.csproj
│   │   ├── Auth/
│   │   │   ├── TokenResponse.cs
│   │   │   ├── UserCreateRequest.cs
│   │   │   ├── UserResponse.cs
│   │   │   ├── CurrentUserResponse.cs
│   │   │   ├── PasswordResetRequest.cs
│   │   │   └── PasswordResetConfirm.cs
│   │   ├── Jobs/
│   │   │   ├── JobPostingDto.cs
│   │   │   ├── JobIngestRequest.cs
│   │   │   └── JobScrapeStatusDto.cs
│   │   ├── Applications/
│   │   │   ├── ApplicationDto.cs
│   │   │   ├── ApplicationCreateRequest.cs
│   │   │   └── ApplicationEventDto.cs
│   │   ├── Profile/
│   │   │   ├── UserProfileDto.cs
│   │   │   └── ProfileUpdateRequest.cs
│   │   ├── Billing/
│   │   │   ├── CheckoutSessionRequest.cs
│   │   │   └── SubscriptionStatusDto.cs
│   │   ├── Meridian/
│   │   │   ├── MeridianProjectSummary.cs
│   │   │   ├── MeridianProjectDetail.cs
│   │   │   ├── MeridianProjectCreate.cs
│   │   │   ├── MeridianSyncPullRequest.cs
│   │   │   ├── MeridianSyncPullResponse.cs
│   │   │   ├── MeridianSyncPushRequest.cs
│   │   │   ├── MeridianSyncPushResponse.cs
│   │   │   ├── MeridianDocumentPayload.cs
│   │   │   └── MeridianStatusResponse.cs
│   │   ├── Admin/
│   │   │   └── AdminDashboardDto.cs
│   │   └── Configuration/
│   │       ├── JwtSettings.cs
│   │       ├── OAuthSettings.cs
│   │       ├── StripeSettings.cs
│   │       ├── OpenAiSettings.cs
│   │       └── AppSettings.cs
│   │
│   ├── Atlas.Meridian.Core/               # EXISTING — document model (unchanged)
│   │   ├── Atlas.Meridian.Core.csproj
│   │   ├── Class1.cs                      # MeridianDocument, MeridianNode, etc.
│   │   └── DocumentSerializer.cs
│   │
│   ├── Atlas.Meridian.Player/             # Web-embeddable Meridian canvas renderer
│   │   ├── Atlas.Meridian.Player.csproj
│   │   ├── MeridianCanvasComponent.razor  # Blazor component wrapping SkiaSharp canvas
│   │   ├── Rendering/
│   │   │   ├── CanvasRenderer.cs          # SkiaSharp rendering pipeline
│   │   │   ├── NodeRenderer.cs
│   │   │   ├── LinkRenderer.cs
│   │   │   ├── FrameRenderer.cs
│   │   │   └── HitTestService.cs
│   │   ├── Interaction/
│   │   │   ├── PanZoomHandler.cs
│   │   │   ├── SelectionManager.cs
│   │   │   └── InputRouter.cs
│   │   └── Bridge/
│   │       ├── IMeridianPlayerBridge.cs   # Interface for host ↔ canvas communication
│   │       └── PlayerState.cs
│   │
│   └── Atlas.UIKit/                       # Shared Blazor component library (design system)
│       ├── Atlas.UIKit.csproj
│       ├── Components/
│       │   ├── AtlasButton.razor
│       │   ├── AtlasCard.razor
│       │   ├── AtlasInput.razor
│       │   ├── AtlasBadge.razor
│       │   ├── AtlasTabs.razor
│       │   ├── AtlasProgress.razor
│       │   ├── AtlasAlert.razor
│       │   ├── AtlasAvatar.razor
│       │   ├── AtlasNavBar.razor
│       │   ├── AtlasFooter.razor
│       │   ├── AtlasHero.razor
│       │   ├── AtlasPageDivider.razor
│       │   └── AtlasStatusBanner.razor
│       ├── Tokens/
│       │   ├── _tokens.css                # CSS custom properties: colors, spacing, typography
│       │   └── _typography.css
│       ├── wwwroot/
│       │   ├── atlas-uikit.css            # Bundled stylesheet
│       │   └── atlas-uikit.js             # JS interop (if any)
│       └── _Imports.razor
│
├── tests/
│   ├── Atlas.Core.Tests/
│   │   └── Atlas.Core.Tests.csproj
│   ├── Atlas.Infrastructure.Tests/
│   │   └── Atlas.Infrastructure.Tests.csproj
│   ├── Atlas.Api.Tests/
│   │   └── Atlas.Api.Tests.csproj
│   ├── Atlas.Web.Tests/
│   │   └── Atlas.Web.Tests.csproj
│   └── Atlas.Meridian.Player.Tests/
│       └── Atlas.Meridian.Player.Tests.csproj
│
├── tools/
│   ├── Atlas.DbMigrator/                  # CLI tool for one-time Alembic → EF Core migration
│   │   ├── Atlas.DbMigrator.csproj
│   │   └── Program.cs
│   └── Atlas.SeedData/                    # Development seed data
│       ├── Atlas.SeedData.csproj
│       └── Program.cs
│
├── deploy/                                # Existing deploy configs (Nginx, systemd, scripts)
│   ├── nginx-main-site.conf
│   ├── nginx-atlas-apply.conf
│   ├── nginx-atlasforge.conf
│   ├── systemd/
│   │   ├── atlas-web.service
│   │   ├── atlas-apply.service
│   │   └── atlas-forge.service
│   └── deploy.sh
│
├── .github/
│   └── workflows/
│       └── deploy.yml
│
├── Directory.Build.props                  # Shared MSBuild properties
├── Directory.Packages.props               # Central package management
├── global.json                            # SDK version pin
├── .editorconfig
└── README.md
```

### 1.2 NuGet Package References

| Project | Key Packages |
|---------|-------------|
| **Atlas.Web** | `Microsoft.AspNetCore.Components.Server`, `SkiaSharp.Views.Blazor` |
| **Atlas.Apply** | `Microsoft.AspNetCore.Components.Server`, `Microsoft.AspNetCore.Identity.UI` |
| **Atlas.Forge** | `Microsoft.AspNetCore.Components.Server` |
| **Atlas.Api** | `Microsoft.AspNetCore.OpenApi`, `Swashbuckle.AspNetCore` |
| **Atlas.Core** | *(no external packages — pure domain)* |
| **Atlas.Infrastructure** | `Npgsql.EntityFrameworkCore.PostgreSQL`, `Microsoft.EntityFrameworkCore.Tools`, `Microsoft.AspNetCore.Identity.EntityFrameworkCore`, `Stripe.net`, `Microsoft.Extensions.Http`, `OpenAI` (official SDK), `Microsoft.Extensions.Hosting` |
| **Atlas.Contracts** | `System.ComponentModel.Annotations` |
| **Atlas.Meridian.Core** | *(existing — no changes)* |
| **Atlas.Meridian.Player** | `SkiaSharp`, `SkiaSharp.Views.Blazor` |
| **Atlas.UIKit** | *(no external packages — pure Razor/CSS)* |
| **Test projects** | `xunit`, `xunit.runner.visualstudio`, `Moq`, `FluentAssertions`, `Microsoft.AspNetCore.Mvc.Testing`, `Testcontainers.PostgreSql` |

### 1.3 Project Dependency Graph

```
Atlas.Web ──────────► Atlas.UIKit
  │                     ▲  ▲  ▲
  ├──► Atlas.Api ───┐   │  │  │
  │                 │   │  │  │
  ├──► Atlas.Meridian.Player ──► Atlas.Meridian.Core
  │                 │   │  │
  │                 ▼   │  │
  │    Atlas.Infrastructure ──► Atlas.Core
  │         │       ▲   │
  │         │       │   │
  │         ▼       │   │
  │    Atlas.Contracts ◄─┘
  │         ▲
  │         │
Atlas.Apply ─┼──► Atlas.UIKit
  │         │
  │         ├──► Atlas.Infrastructure
  │         │
  │         └──► Atlas.Api (shared endpoint registration)
  │
Atlas.Forge ─┼──► Atlas.UIKit
             └──► Atlas.Contracts
```

**Dependency rules:**
- `Atlas.Core` depends on **nothing** (pure domain).
- `Atlas.Contracts` depends on **nothing** (pure DTOs).
- `Atlas.Meridian.Core` depends on **nothing** (existing, unchanged).
- `Atlas.Infrastructure` depends on `Atlas.Core` + `Atlas.Contracts`.
- `Atlas.Api` depends on `Atlas.Infrastructure` + `Atlas.Contracts`.
- `Atlas.UIKit` depends on **nothing** (Razor class library).
- `Atlas.Meridian.Player` depends on `Atlas.Meridian.Core`.
- Host apps (`Atlas.Web`, `Atlas.Apply`, `Atlas.Forge`) depend on everything they need.

---

## Section 2: Service Boundaries

| # | Project | Responsibility | Hosting Model | Port / Domain | Dependencies |
|---|---------|---------------|---------------|---------------|-------------|
| 1 | **Atlas.Web** | Portfolio site, Meridian viewer page, dev portal | Razor Pages SSR + Blazor Server (interactive islands for Meridian Player) | `atlasuniversalis.com` — Kestrel `:5000` behind Nginx | Atlas.Api, Atlas.UIKit, Atlas.Meridian.Player, Atlas.Infrastructure |
| 2 | **Atlas.Apply** | Job tracking, resume generation, profile, billing, admin | Blazor Server (fully interactive) | `apply.atlasuniversalis.com` — Kestrel `:5010` behind Nginx | Atlas.Api, Atlas.UIKit, Atlas.Infrastructure |
| 3 | **Atlas.Forge** | UI design system playground/laboratory | Blazor Server (fully interactive) | `forge.atlasuniversalis.com` — Kestrel `:5020` behind Nginx | Atlas.UIKit, Atlas.Contracts |
| 4 | **Atlas.Api** | All HTTP API endpoints (REST, JSON) | Minimal API, hosted in-process within Atlas.Apply (primary) and Atlas.Web | `apply.atlasuniversalis.com/api/*` — reverse-proxied from other hosts as needed | Atlas.Infrastructure, Atlas.Contracts |
| 5 | **Atlas.Infrastructure** | EF Core, repositories, external service clients, background jobs | Class library + `IHostedService` workers running inside Atlas.Apply host | — | Atlas.Core, Atlas.Contracts, PostgreSQL, Redis (cache only), OpenAI, Stripe |
| 6 | **Atlas.Core** | Domain entities, enums, interfaces, pure business logic | Class library (no hosting) | — | None |
| 7 | **Atlas.Contracts** | Shared DTOs, request/response types, configuration POCOs | Class library (no hosting) | — | None |
| 8 | **Atlas.Meridian.Core** | Document model: `MeridianDocument`, `MeridianNode`, `MeridianLink`, `MeridianFrame`, `MeridianContent`, serialization | Class library (no hosting) | — | None |
| 9 | **Atlas.Meridian.Player** | Web-embeddable canvas renderer (read-only or interactive) via SkiaSharp on Blazor Server | Razor class library, consumed as a Blazor component | Embedded in Atlas.Web pages | Atlas.Meridian.Core, SkiaSharp |
| 10 | **Atlas.UIKit** | Design system component library: buttons, cards, inputs, layout primitives, design tokens | Razor class library | — | None |

### 2.1 Hosting Architecture Notes

**Why Blazor Server (not WASM)?**
- Single DigitalOcean droplet constraint rules out large WASM payloads hammering bandwidth.
- Blazor Server keeps .NET runtime on the server, sends only UI diffs over SignalR.
- SkiaSharp rendering for Meridian Player works natively on the server; WASM SkiaSharp requires a 4+ MB download.
- Server-side rendering gives better SEO for the portfolio site (Razor Pages).
- If the droplet is later upgraded or moved to a cluster, Blazor WASM can be adopted per-app without changing component code.

**API co-hosting strategy:**
- `Atlas.Api` endpoint registrations are shared code (`IEndpointRouteBuilder` extension methods).
- `Atlas.Apply` hosts the API at `/api/v1/*` in-process (no network hop for its own UI).
- `Atlas.Web` proxies `/api/v1/*` to Atlas.Apply via Nginx (same as today).
- During migration, the Python FastAPI and .NET API can coexist behind the same Nginx config by path prefix versioning (`/api/v1/` for Python, `/api/v2/` for .NET, then swap).

---

## Section 3: Shared Contracts

### 3.1 DTOs / Models That Cross Boundaries

All shared types live in `Atlas.Contracts`. They are grouped by domain:

**Auth contracts** (`Atlas.Contracts.Auth`):
```csharp
public sealed record UserCreateRequest(string Email, string Password);
public sealed record TokenResponse(string AccessToken, string RefreshToken, string TokenType);
public sealed record UserResponse(Guid Id, string Email, DateTime CreatedAt, string SubscriptionTier, bool IsAdmin);
public sealed record CurrentUserResponse : UserResponse
{
    public int ResumeGenerationLimit { get; init; }
    public bool CanAccessPremiumFeatures { get; init; }
}
public sealed record PasswordResetRequest(string Email);
public sealed record PasswordResetConfirm(string Token, string NewPassword);
```

**Job contracts** (`Atlas.Contracts.Jobs`):
```csharp
public sealed record JobIngestRequest(string Url, string? HtmlContent = null);
public sealed record JobPostingDto(
    Guid Id, string Url, string? CompanyName, string? JobTitle,
    string? Location, string? RemotePolicy, string? SalaryRange,
    string? JobDescription, object? Requirements, object? Benefits,
    string Status, string? ApplicationStatus, DateTime CreatedAt);
```

**Application contracts** (`Atlas.Contracts.Applications`):
```csharp
public sealed record ApplicationDto(
    Guid Id, Guid JobPostingId, string Status,
    DateTime? AppliedAt, DateTime? ReminderAt, string? Notes,
    DateTime CreatedAt, List<ApplicationEventDto> Events);
public sealed record ApplicationEventDto(
    Guid Id, string? FromStatus, string ToStatus, string? Notes, DateTime CreatedAt);
```

**Meridian contracts** (`Atlas.Contracts.Meridian`):
```csharp
public sealed record MeridianProjectSummary(Guid Id, string Name, DateTime UpdatedAt);
public sealed record MeridianProjectCreate(string Name);
public sealed record MeridianProjectDetail(Guid Id, string Name, MeridianDocumentPayload Document);
public sealed record MeridianDocumentPayload(Guid Id, string Name, int Version, DateTime UpdatedAt);
public sealed record MeridianSyncPullRequest(DateTime? Since, string? DeviceId);
public sealed record MeridianSyncPullResponse(DateTime ServerTime, List<MeridianDocumentPayload> Changes);
public sealed record MeridianSyncPushRequest(string? DeviceId, List<MeridianDocumentPayload> Changes);
public sealed record MeridianSyncPushResponse(DateTime ServerTime, int Accepted);
public sealed record MeridianStatusResponse(string Status, DateTime ServerTime, Guid UserId);
```

### 3.2 Authentication / Authorization Contracts

```csharp
// Atlas.Contracts.Configuration
public sealed class JwtSettings
{
    public string SecretKey { get; set; } = "";
    public string Algorithm { get; set; } = "HS256";
    public int AccessTokenExpireMinutes { get; set; } = 30;
    public int RefreshTokenExpireDays { get; set; } = 7;
    public string Issuer { get; set; } = "atlasuniversalis.com";
    public string Audience { get; set; } = "atlasuniversalis.com";
}

public sealed class OAuthSettings
{
    public string LinkedInClientId { get; set; } = "";
    public string LinkedInClientSecret { get; set; } = "";
    public string LinkedInRedirectUri { get; set; } = "";
    public string GoogleClientId { get; set; } = "";
    public string GoogleClientSecret { get; set; } = "";
    public string GoogleRedirectUri { get; set; } = "";
}
```

### 3.3 API Contracts

All API endpoints use the DTOs above as their request/response shapes. Endpoint method signatures serve as the API contract:

```csharp
// Atlas.Api endpoint registration pattern
public static class AuthEndpoints
{
    public static IEndpointRouteBuilder MapAuthEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/v2/auth");
        group.MapPost("/register", Register);
        group.MapPost("/login", Login);
        group.MapGet("/me", GetCurrentUser).RequireAuthorization();
        group.MapPost("/logout", Logout).RequireAuthorization();
        group.MapPost("/password-reset/request", RequestPasswordReset);
        group.MapPost("/password-reset/confirm", ConfirmPasswordReset);
        group.MapGet("/linkedin/authorize", LinkedInAuthorize);
        group.MapGet("/linkedin/callback", LinkedInCallback);
        group.MapGet("/google/authorize", GoogleAuthorize);
        group.MapGet("/google/callback", GoogleCallback);
        return app;
    }
}
```

### 3.4 Configuration Contracts

```csharp
public sealed class AppSettings
{
    public string Environment { get; set; } = "development";
    public bool Debug { get; set; } = false;
    public string FrontendUrl { get; set; } = "http://localhost:5010";
    public string DevToken { get; set; } = "";
    public string[] AllowedOrigins { get; set; } = [];
}

public sealed class StripeSettings
{
    public string SecretKey { get; set; } = "";
    public string WebhookSecret { get; set; } = "";
    public string PriceId { get; set; } = "";
    public string SuccessUrl { get; set; } = "";
    public string CancelUrl { get; set; } = "";
}

public sealed class OpenAiSettings
{
    public string ApiKey { get; set; } = "";
    public string Model { get; set; } = "gpt-4o-mini";
    public string ExtractionModel { get; set; } = "gpt-4o-mini";
}

public sealed class SubscriptionLimits
{
    public int FreeResumeGenerationLimit { get; set; } = 3;
    public int PaidResumeGenerationLimit { get; set; } = 9999;
}
```

---

## Section 4: Meridian Integration Architecture

### 4.1 Shared Core Between Desktop and Web

`Atlas.Meridian.Core` is already a standalone `net10.0` class library with zero dependencies beyond `System.Text.Json`. This project is consumed by:

| Consumer | Reference Type | Purpose |
|----------|---------------|---------|
| **Atlas.Meridian.App** (Avalonia desktop) | `<ProjectReference>` | Full editor: create, edit, save `.atlas` documents |
| **Atlas.Meridian.Player** (Blazor web) | `<ProjectReference>` | Read-only or limited-edit web viewer |
| **Atlas.Api** (via Atlas.Infrastructure) | `<ProjectReference>` | Sync API: serialize/deserialize documents for cloud storage |

No code duplication. The same `MeridianDocument`, `MeridianNode`, `MeridianLink`, `MeridianFrame`, and `DocumentSerializer` classes are used everywhere.

### 4.2 Meridian Player Web Delivery Strategy

**Choice: Blazor Server + SkiaSharp.Views.Blazor** (not Avalonia WASM, not custom JS)

Rationale:
- Avalonia's WASM support is experimental and carries a 15+ MB initial download. Not viable on a single droplet with limited bandwidth.
- A pure-JS canvas renderer would require duplicating the rendering logic in TypeScript, creating a maintenance burden.
- SkiaSharp.Views.Blazor provides a `SKCanvasView` Blazor component that renders via a `<canvas>` element using SkiaSharp's WebGL backend.
- On Blazor Server, rendering happens server-side and the resulting canvas commands are sent to the client. This keeps the document model and rendering code in C# with no JS duplication.
- For a read-only "viewer" mode, the latency of Blazor Server SignalR is acceptable (< 100ms round trip on the same server).

**Architecture:**

```
┌─────────────────────────────────────────────────────┐
│  Browser                                            │
│  ┌─────────────────────────────────────────────┐    │
│  │  <canvas> element (WebGL)                   │    │
│  │  ← SkiaSharp.Views.Blazor renders here      │    │
│  │                                             │    │
│  │  Mouse/touch events ──► SignalR ──►         │    │
│  └──────────────────────────────────┘──────────┘    │
│                    │                                │
└────────────────────┼────────────────────────────────┘
                     │ SignalR WebSocket
                     ▼
┌─────────────────────────────────────────────────────┐
│  Server (Kestrel)                                   │
│  ┌─────────────────────────────────────────────┐    │
│  │  MeridianCanvasComponent.razor               │    │
│  │    │                                        │    │
│  │    ├── CanvasRenderer (SkiaSharp)            │    │
│  │    │     ├── NodeRenderer                   │    │
│  │    │     ├── LinkRenderer                   │    │
│  │    │     └── FrameRenderer                  │    │
│  │    │                                        │    │
│  │    ├── PanZoomHandler                       │    │
│  │    ├── SelectionManager                     │    │
│  │    └── InputRouter                          │    │
│  │              │                              │    │
│  │              ▼                              │    │
│  │    MeridianDocument (Atlas.Meridian.Core)    │    │
│  └─────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────┘
```

### 4.3 Bridge API: Host Shell ↔ Canvas

```csharp
public interface IMeridianPlayerBridge
{
    // Load a document into the player
    Task LoadDocumentAsync(MeridianDocument document);

    // Navigate to a specific node (scroll + zoom)
    Task FocusNodeAsync(Guid nodeId);

    // Get the currently selected node (if any)
    MeridianNode? GetSelectedNode();

    // Toggle edit mode (viewer vs editor)
    Task SetEditModeAsync(bool enabled);

    // Subscribe to selection changes
    event EventHandler<MeridianNode?> SelectionChanged;

    // Subscribe to document mutations (when in edit mode)
    event EventHandler<MeridianDocument> DocumentChanged;

    // Export current view as PNG
    Task<byte[]> ExportPngAsync(int width, int height);
}
```

The host page (`Meridian.cshtml`) uses `<MeridianCanvasComponent>` as a Blazor Server interactive island and communicates via this interface using cascading parameters or DI.

### 4.4 Document Model Sharing Strategy

| Scenario | Serialization Format | Transport |
|----------|---------------------|-----------|
| Desktop ↔ file system | JSON (`.atlas` files) via `DocumentSerializer` | File I/O |
| Desktop ↔ cloud | JSON over HTTPS (`/api/v2/meridian/sync/*`) | REST API |
| Web player ↔ API | JSON over HTTPS or in-process (same host) | REST or DI |
| Web player ↔ browser | Blazor Server SignalR (opaque, handled by framework) | SignalR |

`DocumentSerializer` uses `System.Text.Json` with `camelCase` naming policy, matching the existing implementation. The `.atlas` file format is already a JSON serialization of `MeridianDocument`.

### 4.5 Performance Considerations

| Concern | Target | Mitigation |
|---------|--------|-----------|
| Canvas FPS | 30 FPS minimum for pan/zoom | SkiaSharp hardware-accelerated rendering. Dirty-rect invalidation (only re-render changed regions). Debounce input events to 16ms. |
| Memory (server) | < 50 MB per active Meridian session | Documents are typically < 1 MB JSON. SkiaSharp surfaces are allocated per render call, not persistent bitmaps. |
| SignalR latency | < 100ms round trip | Server and client on same machine (droplet). Binary SignalR protocol (MessagePack). |
| Concurrent sessions | 10–50 simultaneous viewers | Blazor Server circuit management. Auto-disconnect idle circuits after 5 min. |
| Large documents (1000+ nodes) | Smooth pan, < 200ms initial render | Viewport culling: only render nodes within the visible bounds. Level-of-detail: simplify nodes when zoomed far out. |

---

## Section 5: Database & Data Access Strategy

### 5.1 Current State

- **ORM:** SQLAlchemy 2.x with async sessions (`asyncpg` driver)
- **Migrations:** Alembic (14 migration files, `20260111` through `20260212`)
- **Database:** PostgreSQL (managed on droplet or external managed instance)
- **Tables:** `users`, `user_profiles`, `job_postings`, `company_deep_dives`, `applications`, `application_events`, `generated_resumes`, `generated_cover_letters`, `analytics_events`, `electracast_profiles`, `electracast_podcasts`, `electracast_networks`

### 5.2 Target State

- **ORM:** Entity Framework Core 10 with `Npgsql.EntityFrameworkCore.PostgreSQL`
- **Migrations:** EF Core Migrations
- **Database:** Same PostgreSQL instance (no data loss)
- **Driver:** Npgsql (connection string: `Host=localhost;Database=atlasops;Username=postgres;Password=...`)

### 5.3 Schema Migration Strategy (Alembic → EF Core)

This is the highest-risk operation. The strategy ensures **zero data loss** and **zero downtime**:

**Phase 1: Snapshot the existing schema**
1. Run final `alembic upgrade head` to ensure the database is at the latest Alembic revision.
2. Use `dotnet ef dbcontext scaffold` to reverse-engineer the existing PostgreSQL schema into EF Core entity classes. This produces a 1:1 match of the current schema.
3. Compare the scaffolded entities with the manually-written `Atlas.Core.Entities` classes. Reconcile any differences (column names, types, defaults).

**Phase 2: Create a baseline EF Core migration**
1. Configure `AtlasDbContext` with all entity configurations matching the existing schema exactly.
2. Run `dotnet ef migrations add InitialBaseline`.
3. Instead of applying this migration (which would try to create tables that already exist), mark it as already applied:
   ```sql
   INSERT INTO "__EFMigrationsHistory" ("MigrationId", "ProductVersion")
   VALUES ('20260301000000_InitialBaseline', '10.0.0');
   ```
4. This tells EF Core "the database is already at this state."

**Phase 3: Normal EF Core migrations going forward**
- All future schema changes use `dotnet ef migrations add <Name>`.
- Alembic's `alembic_version` table is left in place (harmless) or dropped after full cutover.
- The `Atlas.DbMigrator` tool project handles the one-time baseline insertion.

**Phase 4: Dual-stack validation**
- During migration, both Python and .NET read/write the same PostgreSQL database.
- Run integration tests comparing EF Core query results against known SQLAlchemy results.
- Only decommission the Python stack after all API endpoints are ported and validated.

### 5.4 Redis Usage Migration

| Current (Python) | Target (.NET) | Notes |
|------------------|--------------|-------|
| Celery broker + result backend | **Removed** — replaced by `System.Threading.Channels` + `BackgroundService` | In-process background job queue. No external broker needed for current workload (< 100 jobs/day). |
| Redis for Celery Beat schedule | **Removed** — replaced by `IHostedService` with `PeriodicTimer` | `StaleApplicationWorker` runs every 24h using .NET's built-in timer. |
| No Redis caching currently | **Optional** — `IDistributedCache` with `Microsoft.Extensions.Caching.StackExchangeRedis` if needed | Can add response caching or session state later. Redis stays installed on the droplet but is no longer a hard dependency. |

**Background job architecture:**

```csharp
// Producer: API endpoint enqueues work
public class JobChannel
{
    private readonly Channel<JobScrapeCommand> _channel =
        Channel.CreateBounded<JobScrapeCommand>(100);

    public ChannelWriter<JobScrapeCommand> Writer => _channel.Writer;
    public ChannelReader<JobScrapeCommand> Reader => _channel.Reader;
}

// Consumer: BackgroundService processes work
public class JobScrapingWorker : BackgroundService
{
    protected override async Task ExecuteAsync(CancellationToken ct)
    {
        await foreach (var command in _channel.Reader.ReadAllAsync(ct))
        {
            // Scrape, extract, update DB
        }
    }
}
```

---

## Section 6: Authentication Architecture

### 6.1 Current State

- **Auth method:** Custom JWT (python-jose) with HS256 signing
- **Password hashing:** bcrypt via passlib
- **OAuth providers:** LinkedIn (OpenID Connect), Google (OAuth 2.0)
- **Token flow:** Access token (30 min) + refresh token (7 days), returned as JSON, stored in browser `localStorage`
- **Admin auth:** `is_admin` flag on User model
- **Dev portal auth:** Simple token comparison (`dev_token` in settings)
- **OAuth state:** In-memory dictionary (not Redis)

### 6.2 Target State

**Choice: Custom JWT (matching current behavior) with ASP.NET authentication middleware.**

Rationale for NOT using ASP.NET Identity:
- ASP.NET Identity introduces its own schema (`AspNetUsers`, `AspNetRoles`, `AspNetUserClaims`, etc.) that would conflict with the existing `users` table.
- The current auth system is simple and well-understood. The User entity already has `hashed_password`, `oauth_provider`, `oauth_provider_id`.
- Migration risk is lower by keeping the same JWT format so existing tokens remain valid during cutover.

**Implementation plan:**

```csharp
// Program.cs (Atlas.Apply)
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        var jwt = builder.Configuration.GetSection("Jwt").Get<JwtSettings>()!;
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidIssuer = jwt.Issuer,
            ValidateAudience = true,
            ValidAudience = jwt.Audience,
            ValidateLifetime = true,
            IssuerSigningKey = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(jwt.SecretKey)),
            ClockSkew = TimeSpan.Zero,
        };
    });

builder.Services.AddAuthorization(options =>
{
    options.AddPolicy("Admin", p => p.RequireClaim("is_admin", "true"));
    options.AddPolicy("Premium", p => p.RequireClaim("tier", "paid"));
});
```

### 6.3 Token Compatibility During Transition

| Phase | Python (FastAPI) | .NET (ASP.NET) | Token Format |
|-------|-----------------|----------------|-------------|
| **Phase 1** (coexistence) | Issues tokens at `/api/v1/auth/*` | Validates same tokens (shared secret key + algorithm) | `{"sub": "<user_id>", "exp": ..., "iss": "atlasuniversalis.com"}` |
| **Phase 2** (switchover) | Decommissioned | Issues + validates all tokens at `/api/v2/auth/*` | Same format, adds `iss` and `aud` claims |
| **Phase 3** (cleanup) | Removed | Sole auth provider | Optional: rotate secret key, invalidate all old tokens |

**Critical:** During Phase 1, both stacks MUST use the same `SECRET_KEY`, `ALGORITHM`, and claim structure (`sub` = user ID as string UUID). The .NET `JwtBearer` middleware is configured to accept tokens without `iss`/`aud` validation initially (set `ValidateIssuer = false`, `ValidateAudience = false`), then tighten after Python is removed.

### 6.4 Admin / Dev Portal Auth Model

| Portal | Current | Target |
|--------|---------|--------|
| **Admin** (inside Apply) | JWT + `is_admin` flag checked per-endpoint | `[Authorize(Policy = "Admin")]` on admin endpoint group |
| **Dev portal** (on main site) | Simple `dev_token` query param or header | Same mechanism: `DevEndpoints` check `X-Dev-Token` header against config value. No user login required. |

### 6.5 Password Hashing Compatibility

The current system uses `bcrypt` via passlib. .NET's `BCrypt.Net-Next` NuGet package produces compatible hashes. Existing bcrypt hashes in the database will validate correctly without re-hashing.

---

## Section 7: Deployment Architecture

### 7.1 Current State

- **Server:** Single DigitalOcean Ubuntu droplet
- **Web server:** Nginx as reverse proxy + static file server
- **Process management:** systemd (`atlasuniversalis.service` for uvicorn, `celery-worker.service`)
- **CI/CD:** GitHub Actions → SSH → `git pull` + `npm ci` + `npm run build` + `alembic upgrade head` + `systemctl restart`
- **SSL:** Let's Encrypt (Certbot) with wildcard or multi-domain cert

### 7.2 Target State

**Same infrastructure**, but replacing the Python processes and Vue/Astro builds with .NET processes.

```
┌─────────────────────────────────────────────────────┐
│  DigitalOcean Droplet (Ubuntu)                      │
│                                                     │
│  Nginx (:80/:443)                                   │
│    │                                                │
│    ├─ atlasuniversalis.com ──► Kestrel :5000         │
│    │   (Atlas.Web — Razor Pages + Blazor Server)    │
│    │                                                │
│    ├─ apply.atlasuniversalis.com ──► Kestrel :5010   │
│    │   (Atlas.Apply — Blazor Server + API)          │
│    │                                                │
│    ├─ forge.atlasuniversalis.com ──► Kestrel :5020   │
│    │   (Atlas.Forge — Blazor Server)                │
│    │                                                │
│    └─ (static assets served directly by Nginx)      │
│                                                     │
│  systemd services:                                  │
│    ├─ atlas-web.service                             │
│    ├─ atlas-apply.service                           │
│    └─ atlas-forge.service                           │
│                                                     │
│  PostgreSQL (localhost:5432)                         │
│  Redis (localhost:6379) — optional cache             │
└─────────────────────────────────────────────────────┘
```

### 7.3 Nginx Config Changes

Replace static file serving + FastAPI proxy with Kestrel proxying. Example for the main site:

```nginx
# /etc/nginx/sites-available/atlasuniversalis-main
server {
    listen 443 ssl http2;
    server_name atlasuniversalis.com www.atlasuniversalis.com;

    ssl_certificate /etc/letsencrypt/live/atlasuniversalis.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/atlasuniversalis.com/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;

    location / {
        proxy_pass http://127.0.0.1:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection $http_connection;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Blazor SignalR requires WebSocket support
    location /_blazor {
        proxy_pass http://127.0.0.1:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_read_timeout 86400;
    }
}
```

Key changes from current config:
- No more `root /var/www/.../dist` — Kestrel serves everything.
- Added `/_blazor` WebSocket location for SignalR.
- `proxy_read_timeout 86400` for long-lived SignalR connections.
- Same pattern repeated for `apply.*` and `forge.*` subdomains.

### 7.4 CI/CD Pipeline

```yaml
name: Deploy to DigitalOcean

on:
  push:
    branches: [master]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup .NET 10
        uses: actions/setup-dotnet@v4
        with:
          dotnet-version: '10.0.x'

      - name: Restore
        run: dotnet restore AtlasUniversalis.sln

      - name: Build
        run: dotnet build AtlasUniversalis.sln -c Release --no-restore

      - name: Test
        run: dotnet test AtlasUniversalis.sln -c Release --no-build --verbosity normal

      - name: Publish Atlas.Web
        run: dotnet publish src/Atlas.Web/Atlas.Web.csproj -c Release -o publish/web

      - name: Publish Atlas.Apply
        run: dotnet publish src/Atlas.Apply/Atlas.Apply.csproj -c Release -o publish/apply

      - name: Publish Atlas.Forge
        run: dotnet publish src/Atlas.Forge/Atlas.Forge.csproj -c Release -o publish/forge

      - name: Deploy via SSH
        uses: appleboy/ssh-action@v1.0.0
        with:
          host: ${{ secrets.DROPLET_IP }}
          username: ${{ secrets.USERNAME }}
          key: ${{ secrets.SSH_KEY }}
          script: |
            cd /var/www/atlasuniversalis.com
            git pull origin master

            # Stop services
            sudo systemctl stop atlas-web atlas-apply atlas-forge

            # Copy published artifacts
            rsync -a --delete publish/web/ /opt/atlas/web/
            rsync -a --delete publish/apply/ /opt/atlas/apply/
            rsync -a --delete publish/forge/ /opt/atlas/forge/

            # Run EF Core migrations
            /opt/atlas/apply/Atlas.Apply --migrate

            # Start services
            sudo systemctl start atlas-web atlas-apply atlas-forge

  # Alternative: use the rsync action to copy artifacts from build runner
  # to avoid building on the droplet (saves CPU/RAM).
```

### 7.5 Route-by-Route Cutover Strategy

A **blue/green per-subdomain** approach:

| Phase | atlasuniversalis.com | apply.atlasuniversalis.com | forge.atlasuniversalis.com |
|-------|---------------------|---------------------------|---------------------------|
| **0 (now)** | Vue SPA (Nginx static) | Vue SPA + FastAPI (:8000) | Astro SSG (Nginx static) |
| **1** | Vue SPA (unchanged) | Vue SPA + FastAPI + .NET API (`:5010`, `/api/v2/*`) | Astro SSG (unchanged) |
| **2** | **Atlas.Web (.NET)** `:5000` | Vue SPA → **Atlas.Apply (.NET)** `:5010` | Astro → **Atlas.Forge (.NET)** `:5020` |
| **3** | .NET (sole) | .NET (sole), FastAPI decommissioned | .NET (sole) |

Each phase can be independently tested and rolled back by swapping Nginx upstream configs. No all-or-nothing cutover.

---

## Section 8: Design System / UI Kit Architecture

### 8.1 Token Extraction from UI Concept Assets

The existing UI concept assets (`internal/UI/Figma/Isolated_Elements/UI_concept/`) contain:
- Background textures / patterns (PNGs)
- Button styles (PNGs — extract: border-radius, padding, font-size, colors)
- Font specimens (PNGs — extract: font-family, weights, sizes)
- Icon set (PNGs — catalog and convert to SVG where possible)
- Page dividers (PNGs — extract as SVG or CSS `border-image`)
- UI Toolkit Starter (PDF — primary source for color palette, spacing scale, typography scale)

**Extraction process:**
1. Parse the UI Toolkit Starter PDF to extract the design token values (colors, spacing, font sizes).
2. Define CSS custom properties in `Atlas.UIKit/Tokens/_tokens.css`:

```css
:root {
    /* Colors — extracted from UI Toolkit Starter */
    --atlas-bg-primary: #0f172a;
    --atlas-bg-secondary: #1e293b;
    --atlas-bg-surface: #1f2937;
    --atlas-text-primary: #f8fafc;
    --atlas-text-secondary: #94a3b8;
    --atlas-accent: #3b82f6;
    --atlas-accent-hover: #2563eb;
    --atlas-border: #334155;
    --atlas-success: #22c55e;
    --atlas-warning: #f59e0b;
    --atlas-error: #ef4444;

    /* Spacing — 4px base */
    --atlas-space-1: 0.25rem;
    --atlas-space-2: 0.5rem;
    --atlas-space-3: 0.75rem;
    --atlas-space-4: 1rem;
    --atlas-space-6: 1.5rem;
    --atlas-space-8: 2rem;
    --atlas-space-12: 3rem;
    --atlas-space-16: 4rem;

    /* Typography */
    --atlas-font-sans: 'Inter', system-ui, sans-serif;
    --atlas-font-mono: 'JetBrains Mono', monospace;
    --atlas-text-xs: 0.75rem;
    --atlas-text-sm: 0.875rem;
    --atlas-text-base: 1rem;
    --atlas-text-lg: 1.125rem;
    --atlas-text-xl: 1.25rem;
    --atlas-text-2xl: 1.5rem;
    --atlas-text-3xl: 1.875rem;

    /* Borders */
    --atlas-radius-sm: 0.25rem;
    --atlas-radius-md: 0.5rem;
    --atlas-radius-lg: 0.75rem;
    --atlas-radius-full: 9999px;
}
```

3. Convert PNG assets (icons, dividers) to SVGs where feasible. Store originals in `Atlas.UIKit/wwwroot/images/`.

### 8.2 Blazor Component Library Structure

`Atlas.UIKit` is a Razor Class Library (RCL). It ships as a project reference (during development) and can be packed as a NuGet package later.

Each component follows this pattern:
```
AtlasButton.razor          # Markup + Razor logic
AtlasButton.razor.css      # Scoped CSS (CSS isolation)
AtlasButton.razor.cs       # Code-behind (optional, for complex logic)
```

Component API example:
```razor
@* AtlasButton.razor *@
<button class="atlas-btn atlas-btn-@Variant atlas-btn-@Size"
        disabled="@Disabled"
        @onclick="OnClick"
        @attributes="AdditionalAttributes">
    @if (Loading)
    {
        <span class="atlas-spinner"></span>
    }
    @ChildContent
</button>

@code {
    [Parameter] public RenderFragment? ChildContent { get; set; }
    [Parameter] public string Variant { get; set; } = "primary";
    [Parameter] public string Size { get; set; } = "md";
    [Parameter] public bool Disabled { get; set; }
    [Parameter] public bool Loading { get; set; }
    [Parameter] public EventCallback<MouseEventArgs> OnClick { get; set; }
    [Parameter(CaptureUnmatchedValues = true)]
    public Dictionary<string, object>? AdditionalAttributes { get; set; }
}
```

### 8.3 CSS Strategy

**Choice: CSS Custom Properties (design tokens) + Scoped CSS (Blazor CSS isolation) + minimal utility classes.**

| Option | Verdict | Reason |
|--------|---------|--------|
| Tailwind CSS | **Rejected** | Blazor's CSS isolation doesn't integrate cleanly with Tailwind's utility-first approach. PostCSS build step adds complexity. |
| CSS-in-C# (e.g., Blazorise) | **Rejected** | Adds external dependency. Harder to customize to match the custom design language. |
| CSS Custom Properties + scoped CSS | **Chosen** | Native to Blazor. No build tools. Design tokens in `:root`, component styles in `.razor.css` files. Full control. |

Utility classes are limited to a small set (flex, grid, spacing, text alignment) defined in `Atlas.UIKit/wwwroot/atlas-uikit.css` alongside the tokens.

### 8.4 Showcase / Storybook Equivalent

**Atlas.Forge IS the storybook.** The existing Forge app at `forge.atlasuniversalis.com` is already a "UI Design System Laboratory." In the .NET rebuild:

- `Atlas.Forge` references `Atlas.UIKit` and renders every component with interactive props editors.
- Each component page shows: live preview, prop controls, code snippet, design token values used.
- This replaces the need for a separate Storybook instance.
- Developers visit `forge.atlasuniversalis.com` to browse the component library.

---

## Section 9: Technology Decisions

| # | Decision | Choice | Rationale | Alternatives Considered |
|---|----------|--------|-----------|------------------------|
| 1 | .NET version | **net10.0** | Already used in Meridian Core/App. LTS candidate. | net9.0 (shorter support) |
| 2 | Blazor hosting model | **Blazor Server** | Single droplet constraint (no WASM download cost), server-side SkiaSharp rendering, lower client bandwidth. | Blazor WASM (too heavy for droplet), Blazor United/Auto (adds complexity with no clear benefit on single server) |
| 3 | Portfolio site rendering | **Razor Pages SSR** + Blazor Server islands | SEO for portfolio pages. Interactive components only where needed (Meridian Player). | Full Blazor Server (unnecessary for static content), Static site generator (lose .NET integration) |
| 4 | ORM | **EF Core 10 + Npgsql** | Industry standard, excellent migration tooling, LINQ, strong typing. | Dapper (too low-level for this schema complexity), RepoDB |
| 5 | Background jobs | **BackgroundService + Channels** | In-process, zero external dependencies, sufficient for current volume (< 100 jobs/day). | Hangfire (adds dashboard + SQL storage overhead), Quartz.NET (overkill), keep Celery (defeats purpose of migration) |
| 6 | Auth system | **Custom JWT with ASP.NET JwtBearer middleware** | Preserves existing token format for zero-downtime migration. Existing bcrypt hashes are compatible. | ASP.NET Identity (schema conflict with existing `users` table), Duende IdentityServer (overkill) |
| 7 | CSS framework | **CSS Custom Properties + Blazor scoped CSS** | Native to Blazor, no build tools, full design control from UI concept assets. | Tailwind (poor Blazor integration), Bootstrap (generic look), MudBlazor (opinionated, hard to match custom design) |
| 8 | State management | **Cascading parameters + scoped services (DI)** | Blazor Server circuits are per-user; DI scoped services act as "stores." No need for Redux/Flux pattern. | Fluxor (overkill for this app size), custom global state service |
| 9 | Testing framework | **xUnit + FluentAssertions + Moq + Testcontainers** | xUnit is the .NET community standard. Testcontainers for integration tests against real PostgreSQL. | NUnit (equally valid, but xUnit is more common in ASP.NET projects), MSTest |
| 10 | Logging | **Serilog + Serilog.Sinks.Console + Serilog.Sinks.File** | Structured logging, easy to configure, supports seq/datadog/etc. later. | Built-in `ILogger` only (less flexibility), NLog |
| 11 | Package management | **Central Package Management (Directory.Packages.props)** | Single source of truth for NuGet versions across all projects. | Per-project `PackageReference` versions (version drift risk) |
| 12 | API documentation | **Scalar (OpenAPI UI)** via `Microsoft.AspNetCore.OpenApi` | Built into .NET 10 Minimal API. Modern alternative to Swagger UI. | Swashbuckle + Swagger UI (heavier, being phased out in .NET 10) |
| 13 | Meridian canvas renderer | **SkiaSharp.Views.Blazor** | Same rendering engine as desktop (Avalonia uses Skia). Code sharing between desktop and web renderers. | HTML5 Canvas via JS interop (duplicates rendering logic), Avalonia WASM (15 MB+ payload) |
| 14 | Secret management | **User secrets (dev) + env vars (prod)** | Simple, matches current `.env` approach. No Azure/AWS dependency. | Azure Key Vault (no Azure), HashiCorp Vault (overkill for single droplet) |

---

## Section 10: Risk Register

| # | Risk | Impact | Likelihood | Mitigation |
|---|------|--------|-----------|-----------|
| 1 | **Alembic → EF Core migration causes data loss or schema mismatch** | H | M | Phase 2 baseline migration strategy (Section 5.3). Dry-run on staging database clone first. Automated diff comparison between SQLAlchemy model output and EF Core model snapshot. |
| 2 | **SkiaSharp.Views.Blazor performance insufficient for Meridian canvas** | H | M | Prototype `MeridianCanvasComponent` early (before full migration). Benchmark with 500-node document. Fallback: JS Canvas renderer with JSON bridge. |
| 3 | **Blazor Server SignalR connection limits on single droplet** | M | M | Configure circuit options: `MaxRetainedDisconnectedCircuits = 20`, `DisconnectedCircuitRetentionPeriod = 5 min`. Monitor with Prometheus/Grafana. Droplet can be upgraded if needed. |
| 4 | **JWT token compatibility breaks during dual-stack period** | H | L | Shared secret key + algorithm. Disable issuer/audience validation in Phase 1. Automated integration tests that verify tokens from Python are accepted by .NET and vice versa. |
| 5 | **OAuth callback URLs break during migration** | M | L | Add both old (`/api/v1/auth/*/callback`) and new (`/api/v2/auth/*/callback`) redirect URIs to LinkedIn/Google OAuth app settings before migration. |
| 6 | **Blazor Server memory pressure with many concurrent users** | M | L | Current traffic is low (portfolio site). Circuit limits + aggressive idle disconnection. Monitor RSS memory per process. |
| 7 | **.NET 10 SDK not available in GitHub Actions runners at migration time** | L | L | Pin SDK version in `global.json`. Use `actions/setup-dotnet@v4` with explicit version. Self-hosted runner as backup. |
| 8 | **Browser extension compatibility with new API** | M | M | Version the API (`/api/v2/`). Keep `/api/v1/` routes alive (proxied to Python) until extension is updated. Extension update can be published independently. |
| 9 | **Nginx WebSocket config misconfiguration breaks Blazor Server** | M | L | Test WebSocket upgrade in staging. The `/_blazor` location block is well-documented. Include `proxy_set_header Connection "upgrade"`. |
| 10 | **CSS design system diverges from UI concept assets** | L | M | Extract tokens systematically from the UI Toolkit Starter PDF. Use Atlas.Forge as living documentation. Review against concept PNGs in each sprint. |
| 11 | **Celery → BackgroundService migration drops in-flight jobs** | M | L | Drain Celery queue before cutover (`celery -A atlasops.workers.tasks purge` after all tasks complete). .NET worker starts fresh. No persistent queue needed (jobs are re-fetchable from DB by status). |
| 12 | **bcrypt hash incompatibility between passlib and BCrypt.Net** | H | L | Both use the `$2b$` prefix and are interoperable. Validate with a test: hash with passlib, verify with BCrypt.Net. If any edge cases arise, re-hash on next login. |
| 13 | **Scope creep: ElectraCast features bleed into rebuild** | M | M | ElectraCast tables remain in PostgreSQL but are not mapped in EF Core. No `ElectraCast*` entities in `Atlas.Core`. ElectraCast Nginx config unchanged. |
| 14 | **Single point of failure: droplet goes down** | H | L | Existing risk (pre-migration). Mitigation: DigitalOcean snapshots (weekly), database backups, documented recovery runbook. Not introduced by this migration. |

---

## Appendix A: Migration Execution Order

For implementation sequencing, the recommended order is:

1. **Atlas.Core** + **Atlas.Contracts** — pure types, no infrastructure
2. **Atlas.Infrastructure** — EF Core context, repositories, baseline migration
3. **Atlas.Api** — Minimal API endpoints (can test against Swagger/Scalar immediately)
4. **Atlas.UIKit** — design tokens + first 5 components
5. **Atlas.Meridian.Player** — SkiaSharp canvas prototype
6. **Atlas.Web** — portfolio pages (Razor Pages) + Meridian viewer page
7. **Atlas.Apply** — Blazor Server pages replacing Vue SPA
8. **Atlas.Forge** — Blazor Server playground replacing Astro/Vue/React hybrid
9. **Database cutover** — Alembic baseline + EF Core migrations
10. **Auth cutover** — Dual-stack JWT validation → single .NET auth
11. **CI/CD cutover** — New deploy pipeline
12. **Decommission** — Remove Python, Vue, Astro code

## Appendix B: Environment Variable Mapping

| Current (Python `.env`) | Target (`appsettings.json` path) | Notes |
|------------------------|--------------------------------|-------|
| `DATABASE_URL` | `ConnectionStrings:DefaultConnection` | Format changes: `postgresql+asyncpg://` → `Host=...;Database=...` |
| `REDIS_URL` | `ConnectionStrings:Redis` | Optional in .NET stack |
| `SECRET_KEY` | `Jwt:SecretKey` | Same value, critical for token compat |
| `ALGORITHM` | `Jwt:Algorithm` | Same value |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | `Jwt:AccessTokenExpireMinutes` | Same value |
| `REFRESH_TOKEN_EXPIRE_DAYS` | `Jwt:RefreshTokenExpireDays` | Same value |
| `OPENAI_API_KEY` | `OpenAi:ApiKey` | Same value |
| `OPENAI_MODEL` | `OpenAi:Model` | Same value |
| `LINKEDIN_CLIENT_ID` | `OAuth:LinkedInClientId` | Same value |
| `LINKEDIN_CLIENT_SECRET` | `OAuth:LinkedInClientSecret` | Same value |
| `GOOGLE_CLIENT_ID` | `OAuth:GoogleClientId` | Same value |
| `GOOGLE_CLIENT_SECRET` | `OAuth:GoogleClientSecret` | Same value |
| `STRIPE_SECRET_KEY` | `Stripe:SecretKey` | Same value |
| `STRIPE_WEBHOOK_SECRET` | `Stripe:WebhookSecret` | Same value |
| `DEV_TOKEN` | `App:DevToken` | Same value |
| `ALLOWED_ORIGINS` | `App:AllowedOrigins` | Array in JSON |
