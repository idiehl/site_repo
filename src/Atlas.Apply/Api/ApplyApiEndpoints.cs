using System.Security.Claims;
using System.ComponentModel.DataAnnotations;
using System.Text.Json;
using System.Text.Json.Nodes;
using Atlas.Apply.Data;
using Atlas.Apply.Domain;
using Atlas.Apply.Features.Jobs;
using Atlas.Apply.Features.Profile;
using Atlas.Apply.Services;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Mvc;
using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;

namespace Atlas.Apply.Api;

public static partial class ApplyApiEndpoints
{
    public static IEndpointRouteBuilder MapApplyApi(this IEndpointRouteBuilder app)
    {
        var auth = app.MapGroup("/api/v2/auth");
        auth.MapPost("/register", Register);
        auth.MapPost("/login", Login);
        auth.MapPost("/logout", async (HttpContext httpContext) =>
        {
            await httpContext.SignOutAsync(CookieAuthenticationDefaults.AuthenticationScheme);
            return Results.Ok(new { ok = true });
        }).RequireAuthorization();
        auth.MapGet("/session", Session);

        var profile = app.MapGroup("/api/v2/profile").RequireAuthorization();
        profile.MapGet("/", GetProfile);
        profile.MapPut("/", UpsertProfile);
        profile.MapPost("/image", UploadProfileImage).DisableAntiforgery();
        profile.MapDelete("/image", DeleteProfileImage);
        profile.MapGet("/image", GetProfileImage);
        profile.MapGet("/imported-resume", GetImportedResume);
        profile.MapGet("/imported-resume/preview", GetImportedResumePreview);
        profile.MapPost("/import-resume", ImportResume).DisableAntiforgery();
        profile.MapPost("/import-linkedin", ImportLinkedInProfile).DisableAntiforgery();
        profile.MapPost("/section-documents/{section}", UploadProfileSectionDocument).DisableAntiforgery();
        profile.MapGet("/section-documents/{section}/file", GetProfileSectionDocumentFile);
        profile.MapGet("/section-documents/{section}/preview", GetProfileSectionDocumentPreview);
        profile.MapDelete("/section-documents/{section}", DeleteProfileSectionDocument);

        var opportunities = app.MapGroup("/api/v2/opportunities").RequireAuthorization();
        opportunities.MapGet("/", ListOpportunities);
        opportunities.MapPost("/", CreateOpportunity);

        var applications = app.MapGroup("/api/v2/applications").RequireAuthorization();
        applications.MapGet("/", ListApplications);
        applications.MapGet("/pipeline", GetPipelineSummary);
        applications.MapGet("/{applicationId:guid}/history", GetApplicationHistory);
        applications.MapPost("/", CreateApplication);
        applications.MapPut("/{applicationId:guid}/status", UpdateApplicationStatus);
        applications.MapPut("/{applicationId:guid}/priority", UpdateApplicationPriority);
        applications.MapPost("/{applicationId:guid}/note", AddApplicationNote);
        applications.MapDelete("/{applicationId:guid}", DeleteApplication);

        var ingestion = app.MapGroup("/api/v2/ingestion").RequireAuthorization();
        ingestion.MapPost("/extension", IngestExtensionPayload);

        var workspace = app.MapGroup("/api/v2/workspace").RequireAuthorization();
        workspace.MapGet("/summary", WorkspaceSummary);
        workspace.MapGet("/feed", WorkspaceFeed);

        var workflow = app.MapGroup("/api/v2/workflow").RequireAuthorization();
        workflow.MapGet("/events", ListWorkflowEvents);

        var automation = app.MapGroup("/api/v2/automation").RequireAuthorization();
        automation.MapPost("/company-report", GenerateCompanyReport);
        automation.MapPost("/job-summary", GenerateJobSummary);
        automation.MapPost("/cover-letter-draft", GenerateCoverLetterDraft);
        automation.MapPost("/resume-pdf", GenerateResumePdf);
        automation.MapGet("/resume-pdf/{opportunityId:guid}", DownloadResumePdf);
        automation.MapPost("/application-package", GenerateApplicationPackage);
        automation.MapPost("/interview-questions", GenerateInterviewQuestionSet);
        automation.MapPost("/follow-up-email", GenerateFollowUpEmail);

        return app;
    }

    private static async Task<IResult> Register(
        RegisterRequest request,
        ApplyDbContext db,
        IPasswordService passwords,
        HttpContext httpContext)
    {
        if (string.IsNullOrWhiteSpace(request.Email) || string.IsNullOrWhiteSpace(request.Password))
        {
            return Results.BadRequest(new { error = "Email and password are required." });
        }

        var email = request.Email.Trim().ToLowerInvariant();
        var existing = await db.Users.FirstOrDefaultAsync(x => x.Email == email);
        if (existing is not null)
        {
            return Results.Conflict(new { error = "An account already exists for this email." });
        }

        var user = new UserAccount
        {
            Email = email,
            PasswordHash = passwords.Hash(request.Password),
            DisplayName = string.IsNullOrWhiteSpace(request.DisplayName) ? email : request.DisplayName.Trim()
        };
        db.Users.Add(user);
        db.WorkflowEvents.Add(new WorkflowEvent
        {
            UserId = user.Id,
            EventType = "auth.registered",
            PayloadJson = "{}"
        });
        await db.SaveChangesAsync();

        await SignInAsync(httpContext, user);
        return Results.Ok(new SessionResponse(user.Id, user.Email, user.DisplayName, true));
    }

    private static async Task<IResult> Login(
        LoginRequest request,
        ApplyDbContext db,
        IPasswordService passwords,
        HttpContext httpContext)
    {
        var email = request.Email.Trim().ToLowerInvariant();
        var user = await db.Users.FirstOrDefaultAsync(x => x.Email == email && x.IsActive);
        if (user is null || !passwords.Verify(request.Password, user.PasswordHash))
        {
            return Results.BadRequest(new { error = "Invalid credentials." });
        }

        user.LastLoginUtc = DateTime.UtcNow;
        user.UpdatedUtc = DateTime.UtcNow;
        db.WorkflowEvents.Add(new WorkflowEvent
        {
            UserId = user.Id,
            EventType = "auth.logged_in",
            PayloadJson = "{}"
        });
        await db.SaveChangesAsync();

        await SignInAsync(httpContext, user);
        return Results.Ok(new SessionResponse(user.Id, user.Email, user.DisplayName, true));
    }

    private static IResult Session(ClaimsPrincipal user)
    {
        if (!user.Identity?.IsAuthenticated ?? true)
        {
            return Results.Ok(new SessionResponse(null, null, null, false));
        }

        var userId = user.FindFirstValue(ClaimTypes.NameIdentifier);
        var email = user.FindFirstValue(ClaimTypes.Email);
        var displayName = user.FindFirstValue("display_name");
        return Results.Ok(new SessionResponse(Guid.Parse(userId!), email, displayName, true));
    }

    private static async Task<IResult> GetProfile(ClaimsPrincipal user, ApplyDbContext db)
    {
        var userId = user.GetUserId();
        var account = await db.Users.FirstOrDefaultAsync(x => x.Id == userId && x.IsActive);
        if (account is null)
        {
            return Results.NotFound(new { error = "User account not found." });
        }

        var profile = await db.Profiles.FirstOrDefaultAsync(x => x.UserId == userId);
        return Results.Ok(ProfileApiMapping.ToResponse(account, profile));
    }

    private static async Task<IResult> UpsertProfile(ProfileEditorRequest request, ClaimsPrincipal user, ApplyDbContext db, CancellationToken cancellationToken)
    {
        var userId = user.GetUserId();
        var account = await db.Users.FirstOrDefaultAsync(x => x.Id == userId && x.IsActive);
        if (account is null)
        {
            return Results.NotFound(new { error = "User account not found." });
        }

        var profile = await db.Profiles.FirstOrDefaultAsync(x => x.UserId == userId);
        if (profile is null)
        {
            profile = new UserProfile { UserId = userId };
            db.Profiles.Add(profile);
        }

        var requestedEmail = request.Email?.Trim().ToLowerInvariant();
        if (!string.IsNullOrWhiteSpace(requestedEmail) &&
            !requestedEmail.Equals(account.Email, StringComparison.OrdinalIgnoreCase))
        {
            if (!new EmailAddressAttribute().IsValid(requestedEmail))
            {
                return Results.BadRequest(new { error = "Enter a valid email address." });
            }

            var emailInUse = await db.Users.AnyAsync(
                x => x.Id != account.Id && x.Email == requestedEmail,
                cancellationToken);
            if (emailInUse)
            {
                return Results.Conflict(new { error = "That email address is already in use." });
            }

            account.Email = requestedEmail;
        }

        ProfileApiMapping.ApplyRequest(request, account, profile);

        db.WorkflowEvents.Add(new WorkflowEvent
        {
            UserId = userId,
            EventType = "profile.updated",
            PayloadJson = "{}"
        });

        await db.SaveChangesAsync();
        return Results.Ok(ProfileApiMapping.ToResponse(account, profile));
    }

    private static async Task<IResult> ListOpportunities(ClaimsPrincipal user, ApplyDbContext db)
    {
        var userId = user.GetUserId();
        var data = await db.Opportunities
            .Where(x => x.UserId == userId)
            .OrderByDescending(x => x.UpdatedUtc)
            .Take(100)
            .Select(x => new
            {
                x.Id,
                x.Company,
                x.RoleTitle,
                x.Location,
                x.SourceType,
                x.PostingUrl,
                x.UpdatedUtc
            })
            .ToListAsync();
        return Results.Ok(data);
    }

    private static async Task<IResult> CreateOpportunity(
        OpportunityRequest request,
        ClaimsPrincipal user,
        ApplyDbContext db,
        IAutomationService automation,
        [FromServices] IJobSummaryService jobSummaryService)
    {
        var userId = user.GetUserId();
        var sourceType = string.IsNullOrWhiteSpace(request.SourceType) ? "Manual" : request.SourceType.Trim();
        var company = ResolveCompanyName(request.Company, request.PostingUrl);
        var roleTitle = ResolveRoleTitle(request.RoleTitle, request.DescriptionRaw);
        var normalizedDescription = automation.NormalizeDescription(request.DescriptionRaw);
        var metadataJson = BuildOpportunityMetadata(
            company,
            roleTitle,
            sourceType,
            request.PostingUrl,
            normalizedDescription,
            request.ApplicationOptionsJson,
            request.MetadataJson);

        var initialSummary = await jobSummaryService.BuildSummaryAsync(
            roleTitle,
            company,
            request.Location,
            request.DescriptionRaw,
            normalizedDescription);
        metadataJson = JobPresentation.UpsertJobSummary(metadataJson, initialSummary);

        var entity = new Opportunity
        {
            UserId = userId,
            SourceType = sourceType,
            Company = company,
            RoleTitle = roleTitle,
            Location = request.Location,
            CompensationText = request.CompensationText,
            PostingUrl = request.PostingUrl,
            DescriptionRaw = request.DescriptionRaw,
            DescriptionNormalized = normalizedDescription,
            MetadataJson = metadataJson,
            UpdatedUtc = DateTime.UtcNow
        };

        db.Opportunities.Add(entity);
        db.WorkflowEvents.Add(new WorkflowEvent
        {
            UserId = userId,
            OpportunityId = entity.Id,
            EventType = "opportunity.created",
            PayloadJson = "{}"
        });

        Guid? applicationId = null;
        if (request.CreateBoardEntry != false)
        {
            var application = new ApplicationRecord
            {
                UserId = userId,
                OpportunityId = entity.Id,
                Status = NormalizeStatus(request.ApplicationStatus),
                Priority = NormalizePriority(request.ApplicationPriority),
                AppliedUtc = null,
                UpdatedUtc = DateTime.UtcNow
            };
            db.Applications.Add(application);
            applicationId = application.Id;
            db.WorkflowEvents.Add(new WorkflowEvent
            {
                UserId = userId,
                OpportunityId = entity.Id,
                ApplicationId = application.Id,
                EventType = "application.created",
                PayloadJson = JsonSerializer.Serialize(new { sourceType = "opportunity.create" })
            });
        }

        await db.SaveChangesAsync();

        return Results.Ok(new { entity.Id, applicationId });
    }

    private static async Task<IResult> ListApplications(ClaimsPrincipal user, ApplyDbContext db)
    {
        var userId = user.GetUserId();
        var data = await db.Applications
            .Where(x => x.UserId == userId)
            .OrderByDescending(x => x.UpdatedUtc)
            .Take(100)
            .Select(x => new
            {
                x.Id,
                x.OpportunityId,
                x.Status,
                x.Priority,
                x.AppliedUtc,
                x.UpdatedUtc
            })
            .ToListAsync();
        return Results.Ok(data);
    }

    private static async Task<IResult> CreateApplication(ApplicationRequest request, ClaimsPrincipal user, ApplyDbContext db)
    {
        var userId = user.GetUserId();
        var opportunityExists = await db.Opportunities.AnyAsync(x => x.Id == request.OpportunityId && x.UserId == userId);
        if (!opportunityExists)
        {
            return Results.NotFound(new { error = "Opportunity not found." });
        }

        var record = new ApplicationRecord
        {
            UserId = userId,
            OpportunityId = request.OpportunityId,
            Status = NormalizeStatus(request.Status),
            Priority = string.IsNullOrWhiteSpace(request.Priority) ? "Normal" : request.Priority,
            Notes = request.Notes,
            AppliedUtc = request.AppliedUtc,
            UpdatedUtc = DateTime.UtcNow
        };

        db.Applications.Add(record);
        db.WorkflowEvents.Add(new WorkflowEvent
        {
            UserId = userId,
            ApplicationId = record.Id,
            OpportunityId = request.OpportunityId,
            EventType = "application.created",
            PayloadJson = "{}"
        });
        await db.SaveChangesAsync();

        return Results.Ok(new { record.Id });
    }

    private static async Task<IResult> UpdateApplicationStatus(Guid applicationId, ApplicationStatusRequest request, ClaimsPrincipal user, ApplyDbContext db)
    {
        var userId = user.GetUserId();
        var record = await db.Applications.FirstOrDefaultAsync(x => x.Id == applicationId && x.UserId == userId);
        if (record is null)
        {
            return Results.NotFound(new { error = "Application not found." });
        }

        var nextStatus = NormalizeStatus(request.Status);
        if (!IsValidStatusTransition(record.Status, nextStatus))
        {
            return Results.BadRequest(new { error = $"Invalid transition from {record.Status} to {nextStatus}." });
        }

        record.Status = nextStatus;
        record.UpdatedUtc = DateTime.UtcNow;
        if (nextStatus.Equals("Applied", StringComparison.OrdinalIgnoreCase) && record.AppliedUtc is null)
        {
            record.AppliedUtc = DateTime.UtcNow;
        }

        db.WorkflowEvents.Add(new WorkflowEvent
        {
            UserId = userId,
            ApplicationId = record.Id,
            OpportunityId = record.OpportunityId,
            EventType = "application.status_changed",
            PayloadJson = JsonSerializer.Serialize(new { status = nextStatus })
        });

        await db.SaveChangesAsync();
        return Results.Ok(new { ok = true });
    }

    private static async Task<IResult> UpdateApplicationPriority(Guid applicationId, ApplicationPriorityRequest request, ClaimsPrincipal user, ApplyDbContext db)
    {
        var userId = user.GetUserId();
        var record = await db.Applications.FirstOrDefaultAsync(x => x.Id == applicationId && x.UserId == userId);
        if (record is null)
        {
            return Results.NotFound(new { error = "Application not found." });
        }

        var nextPriority = NormalizePriority(request.Priority);
        record.Priority = nextPriority;
        record.UpdatedUtc = DateTime.UtcNow;

        db.WorkflowEvents.Add(new WorkflowEvent
        {
            UserId = userId,
            ApplicationId = record.Id,
            OpportunityId = record.OpportunityId,
            EventType = "application.priority_changed",
            PayloadJson = JsonSerializer.Serialize(new { priority = nextPriority })
        });

        await db.SaveChangesAsync();
        return Results.Ok(new { ok = true });
    }

    private static async Task<IResult> AddApplicationNote(Guid applicationId, ApplicationNoteRequest request, ClaimsPrincipal user, ApplyDbContext db)
    {
        var userId = user.GetUserId();
        var record = await db.Applications.FirstOrDefaultAsync(x => x.Id == applicationId && x.UserId == userId);
        if (record is null)
        {
            return Results.NotFound(new { error = "Application not found." });
        }

        if (string.IsNullOrWhiteSpace(request.Note))
        {
            return Results.BadRequest(new { error = "Note cannot be empty." });
        }

        var nextNote = string.IsNullOrWhiteSpace(record.Notes)
            ? request.Note.Trim()
            : record.Notes + Environment.NewLine + request.Note.Trim();

        record.Notes = nextNote;
        record.UpdatedUtc = DateTime.UtcNow;

        db.WorkflowEvents.Add(new WorkflowEvent
        {
            UserId = userId,
            ApplicationId = record.Id,
            OpportunityId = record.OpportunityId,
            EventType = "application.note_added",
            PayloadJson = JsonSerializer.Serialize(new { request.Note })
        });

        await db.SaveChangesAsync();
        return Results.Ok(new { ok = true, record.Notes });
    }

    private static async Task<IResult> DeleteApplication(Guid applicationId, ClaimsPrincipal user, ApplyDbContext db)
    {
        var userId = user.GetUserId();
        var record = await db.Applications.FirstOrDefaultAsync(x => x.Id == applicationId && x.UserId == userId);
        if (record is null)
        {
            return Results.NotFound(new { error = "Application not found." });
        }

        db.WorkflowEvents.Add(new WorkflowEvent
        {
            UserId = userId,
            ApplicationId = record.Id,
            OpportunityId = record.OpportunityId,
            EventType = "application.deleted",
            PayloadJson = "{}"
        });
        db.Applications.Remove(record);
        await db.SaveChangesAsync();
        return Results.Ok(new { ok = true });
    }

    private static async Task<IResult> GetApplicationHistory(Guid applicationId, ClaimsPrincipal user, ApplyDbContext db)
    {
        var userId = user.GetUserId();
        var record = await db.Applications.FirstOrDefaultAsync(x => x.Id == applicationId && x.UserId == userId);
        if (record is null)
        {
            return Results.NotFound(new { error = "Application not found." });
        }

        var events = await db.WorkflowEvents
            .Where(x => x.UserId == userId && x.ApplicationId == applicationId)
            .OrderByDescending(x => x.CreatedUtc)
            .Take(40)
            .Select(x => new
            {
                x.EventType,
                x.PayloadJson,
                x.CreatedUtc
            })
            .ToListAsync();

        return Results.Ok(new
        {
            applicationId,
            notes = record.Notes,
            events
        });
    }

    private static async Task<IResult> IngestExtensionPayload(
        ExtensionIngestionRequest request,
        ClaimsPrincipal user,
        ApplyDbContext db,
        IAutomationService automation,
        [FromServices] IJobSummaryService jobSummaryService)
    {
        var userId = user.GetUserId();
        var payload = JsonSerializer.Serialize(request);
        var ingestion = new ExtensionIngestion
        {
            UserId = userId,
            SourceDomain = request.SourceDomain,
            PageUrl = request.PageUrl,
            PayloadJson = payload,
            ProcessingStatus = "Processed",
            ProcessedUtc = DateTime.UtcNow
        };
        db.ExtensionIngestions.Add(ingestion);

        // Baseline salvage behavior: create an opportunity directly from extension payload.
        var normalizedDescription = automation.NormalizeDescription(request.RawDescription);
        var metadataJson = BuildOpportunityMetadata(
            ResolveCompanyName(request.Company, request.PageUrl),
            ResolveRoleTitle(request.RoleTitle, request.RawDescription),
            "Extension",
            request.PageUrl,
            normalizedDescription,
            request.ApplicationOptionsJson,
            request.MetadataJson);
        var jobSummary = await jobSummaryService.BuildSummaryAsync(
            ResolveRoleTitle(request.RoleTitle, request.RawDescription),
            ResolveCompanyName(request.Company, request.PageUrl),
            request.Location,
            request.RawDescription,
            normalizedDescription);
        metadataJson = JobPresentation.UpsertJobSummary(metadataJson, jobSummary);

        var opportunity = new Opportunity
        {
            UserId = userId,
            SourceType = "Extension",
            Company = ResolveCompanyName(request.Company, request.PageUrl),
            RoleTitle = ResolveRoleTitle(request.RoleTitle, request.RawDescription),
            Location = request.Location,
            PostingUrl = request.PageUrl,
            DescriptionRaw = request.RawDescription,
            DescriptionNormalized = normalizedDescription,
            MetadataJson = metadataJson,
            UpdatedUtc = DateTime.UtcNow
        };
        db.Opportunities.Add(opportunity);

        var application = new ApplicationRecord
        {
            UserId = userId,
            OpportunityId = opportunity.Id,
            Status = NormalizeStatus(string.IsNullOrWhiteSpace(request.ApplicationStatus) ? "Saved" : request.ApplicationStatus),
            Priority = NormalizePriority(request.ApplicationPriority),
            AppliedUtc = null,
            UpdatedUtc = DateTime.UtcNow
        };
        db.Applications.Add(application);

        db.WorkflowEvents.Add(new WorkflowEvent
        {
            UserId = userId,
            OpportunityId = opportunity.Id,
            EventType = "ingestion.extension_processed",
            PayloadJson = "{}"
        });
        db.WorkflowEvents.Add(new WorkflowEvent
        {
            UserId = userId,
            OpportunityId = opportunity.Id,
            ApplicationId = application.Id,
            EventType = "application.created",
            PayloadJson = JsonSerializer.Serialize(new { sourceType = "extension.ingestion" })
        });

        await db.SaveChangesAsync();
        return Results.Ok(new { ingestionId = ingestion.Id, opportunityId = opportunity.Id, applicationId = application.Id });
    }

    private static async Task<IResult> WorkspaceSummary(ClaimsPrincipal user, ApplyDbContext db)
    {
        var userId = user.GetUserId();
        var opportunities = await db.Opportunities.CountAsync(x => x.UserId == userId);
        var applications = await db.Applications.CountAsync(x => x.UserId == userId);
        var ingestions = await db.ExtensionIngestions.CountAsync(x => x.UserId == userId);
        var latestEvent = await db.WorkflowEvents
            .Where(x => x.UserId == userId)
            .OrderByDescending(x => x.CreatedUtc)
            .Select(x => new { x.EventType, x.CreatedUtc })
            .FirstOrDefaultAsync();

        return Results.Ok(new
        {
            opportunities,
            applications,
            ingestions,
            latestEvent
        });
    }

    private static async Task<IResult> GetPipelineSummary(ClaimsPrincipal user, ApplyDbContext db)
    {
        var userId = user.GetUserId();
        var rows = await db.Applications
            .Where(x => x.UserId == userId)
            .GroupBy(x => x.Status)
            .Select(g => new { status = g.Key, count = g.Count() })
            .ToListAsync();

        var defaults = JobWorkflow.StatusOptions
            .Select(status => new
            {
                status,
                count = rows.FirstOrDefault(x => x.status.Equals(status, StringComparison.OrdinalIgnoreCase))?.count ?? 0
            });

        return Results.Ok(defaults);
    }

    private static async Task<IResult> WorkspaceFeed(ClaimsPrincipal user, ApplyDbContext db)
    {
        var userId = user.GetUserId();
        var feed = await db.WorkflowEvents
            .Where(x => x.UserId == userId)
            .OrderByDescending(x => x.CreatedUtc)
            .Take(50)
            .Select(x => new
            {
                x.Id,
                x.EventType,
                x.ApplicationId,
                x.OpportunityId,
                x.PayloadJson,
                x.CreatedUtc
            })
            .ToListAsync();
        return Results.Ok(feed);
    }

    private static async Task<IResult> GenerateCoverLetterDraft(
        CoverLetterDraftRequest request,
        ClaimsPrincipal user,
        ApplyDbContext db)
    {
        var userId = user.GetUserId();
        var profile = await db.Profiles.FirstOrDefaultAsync(x => x.UserId == userId);
        var opportunity = await db.Opportunities.FirstOrDefaultAsync(x => x.Id == request.OpportunityId && x.UserId == userId);
        if (opportunity is null)
        {
            return Results.NotFound(new { error = "Opportunity not found." });
        }

        var openingName = string.IsNullOrWhiteSpace(profile?.Headline) ? "Hiring Team" : profile!.Headline;
        var summary = profile?.Summary ?? "I focus on building reliable, practical software that improves day-to-day workflows.";
        var body = $"""
Dear {openingName},

I am writing to express interest in the {opportunity.RoleTitle} role at {opportunity.Company}.
{summary}

This opportunity stands out because it aligns with my focus on shipping maintainable systems and improving delivery speed.
I would welcome the chance to contribute to your team.

Sincerely,
{user.FindFirstValue("display_name") ?? "Candidate"}
""";

        db.WorkflowEvents.Add(new WorkflowEvent
        {
            UserId = userId,
            OpportunityId = opportunity.Id,
            EventType = "automation.cover_letter_generated",
            PayloadJson = JsonSerializer.Serialize(new { opportunity.RoleTitle, opportunity.Company })
        });
        await db.SaveChangesAsync();

        return Results.Ok(new
        {
            opportunityId = opportunity.Id,
            company = opportunity.Company,
            roleTitle = opportunity.RoleTitle,
            draft = body
        });
    }

    private static async Task<IResult> GenerateCompanyReport(
        CompanyReportRequest request,
        ClaimsPrincipal user,
        ApplyDbContext db,
        [FromServices] ICompanyIntelligenceService companyIntelligence)
    {
        var userId = user.GetUserId();
        var opportunity = await db.Opportunities.FirstOrDefaultAsync(x => x.Id == request.OpportunityId && x.UserId == userId);
        if (opportunity is null)
        {
            return Results.NotFound(new { error = "Opportunity not found." });
        }

        var report = await companyIntelligence.BuildReportAsync(opportunity.Company, opportunity.PostingUrl);
        opportunity.MetadataJson = JobPresentation.UpsertCompanyReport(opportunity.MetadataJson, report);
        opportunity.UpdatedUtc = DateTime.UtcNow;

        db.WorkflowEvents.Add(new WorkflowEvent
        {
            UserId = userId,
            OpportunityId = opportunity.Id,
            EventType = "automation.company_report_generated",
            PayloadJson = JsonSerializer.Serialize(new { report.Name, report.Ticker })
        });
        await db.SaveChangesAsync();

        return Results.Ok(new
        {
            opportunityId = opportunity.Id,
            report = new
            {
                report.Name,
                report.Summary,
                report.Description,
                report.OfficialWebsiteUrl,
                report.CompanyPageUrl,
                report.Domain,
                report.Industry,
                report.SizeBand,
                report.FoundedYear,
                employeeCount = report.EmployeeCountDisplay,
                report.RevenueDisplay,
                report.Ticker,
                report.Exchange,
                report.MarketChartUrl,
                generatedUtc = report.GeneratedUtc,
                recentNews = report.RecentNews.Select(x => new
                {
                    x.Title,
                    x.Url,
                    x.Source,
                    x.PublishedUtc
                })
            }
        });
    }

    private static async Task<IResult> GenerateJobSummary(
        JobSummaryRequest request,
        ClaimsPrincipal user,
        ApplyDbContext db,
        [FromServices] IJobSummaryService jobSummaryService)
    {
        var userId = user.GetUserId();
        var opportunity = await db.Opportunities.FirstOrDefaultAsync(x => x.Id == request.OpportunityId && x.UserId == userId);
        if (opportunity is null)
        {
            return Results.NotFound(new { error = "Opportunity not found." });
        }

        var summary = await jobSummaryService.BuildSummaryAsync(
            opportunity.RoleTitle,
            opportunity.Company,
            opportunity.Location,
            opportunity.DescriptionRaw,
            opportunity.DescriptionNormalized);

        opportunity.MetadataJson = JobPresentation.UpsertJobSummary(opportunity.MetadataJson, summary);
        opportunity.UpdatedUtc = DateTime.UtcNow;

        db.WorkflowEvents.Add(new WorkflowEvent
        {
            UserId = userId,
            OpportunityId = opportunity.Id,
            EventType = "automation.job_summary_generated",
            PayloadJson = JsonSerializer.Serialize(new { summary.JobRatingLabel })
        });
        await db.SaveChangesAsync();

        return Results.Ok(new
        {
            opportunityId = opportunity.Id,
            summary = new
            {
                summary.PlainLanguageOverview,
                summary.JobRatingLabel,
                summary.JobRatingSummary,
                summary.JobExpectations,
                summary.KeySkills,
                summary.WorkHours,
                summary.WorkplaceEnvironment,
                generatedUtc = summary.GeneratedUtc
            }
        });
    }

    private static async Task<IResult> GenerateResumePdf(
        ResumePdfRequest request,
        ClaimsPrincipal user,
        ApplyDbContext db,
        IProfileAssetService profileAssets)
    {
        QuestPDF.Settings.License = LicenseType.Community;

        var userId = user.GetUserId();
        var profile = await db.Profiles.FirstOrDefaultAsync(x => x.UserId == userId);
        var opportunity = await db.Opportunities.FirstOrDefaultAsync(x => x.Id == request.OpportunityId && x.UserId == userId);
        if (opportunity is null)
        {
            return Results.NotFound(new { error = "Opportunity not found." });
        }

        var displayName = user.FindFirstValue("display_name") ?? "Candidate";
        var quality = NormalizeResumeQuality(request.Quality);
        var template = NormalizeResumeTemplate(request.Template);
        var skillLimit = quality switch
        {
            "Targeted" => 10,
            "Premium" => 12,
            _ => 8
        };

        var skills = JobPresentation.ParseSkills(profile?.SkillsJson).Take(skillLimit).ToArray();
        var profileImage = profile is null
            ? null
            : await profileAssets.TryReadProfileImageAsync(profile);
        var draft = ResumeComposer.BuildResumeDraft(profile, opportunity, displayName, skills, template, quality, request.FocusAreasCsv);
        var pdfBytes = ResumeComposer.BuildResumePdfBytes(displayName, profile, opportunity, draft, template, quality, skills, profileImage);

        var base64 = Convert.ToBase64String(pdfBytes);
        var fileName = $"{SanitizeFilePart(opportunity.Company)}-{SanitizeFilePart(opportunity.RoleTitle)}-{template.ToLowerInvariant()}.pdf";

        var root = JobPresentation.ParseMetadataObject(opportunity.MetadataJson);
        var artifacts = root["artifacts"] as JsonObject ?? new JsonObject();
        artifacts["resumeDraft"] = new JsonObject
        {
            ["generatedUtc"] = DateTime.UtcNow.ToString("O"),
            ["content"] = draft,
            ["template"] = template,
            ["quality"] = quality,
            ["fileName"] = fileName,
            ["pdfBase64"] = base64
        };
        root["artifacts"] = artifacts;
        opportunity.MetadataJson = root.ToJsonString();
        opportunity.UpdatedUtc = DateTime.UtcNow;

        db.WorkflowEvents.Add(new WorkflowEvent
        {
            UserId = userId,
            OpportunityId = opportunity.Id,
            EventType = "automation.resume_draft_generated",
            PayloadJson = JsonSerializer.Serialize(new { template, quality, skillCount = skills.Length })
        });
        await db.SaveChangesAsync();

        return Results.Ok(new
        {
            opportunityId = opportunity.Id,
            company = opportunity.Company,
            roleTitle = opportunity.RoleTitle,
            draft,
            template,
            quality,
            fileName,
            downloadUrl = $"/api/v2/automation/resume-pdf/{opportunity.Id}",
            usedProfile = ProfileDocument.HasMeaningfulProfileData(profile)
        });
    }

    private static async Task<IResult> GenerateApplicationPackage(
        ApplicationPackageRequest request,
        ClaimsPrincipal user,
        ApplyDbContext db)
    {
        var userId = user.GetUserId();
        var profile = await db.Profiles.FirstOrDefaultAsync(x => x.UserId == userId);
        var opportunity = await db.Opportunities.FirstOrDefaultAsync(x => x.Id == request.OpportunityId && x.UserId == userId);
        if (opportunity is null)
        {
            return Results.NotFound(new { error = "Opportunity not found." });
        }

        var resumeVariant = string.IsNullOrWhiteSpace(request.ResumeVariant) ? "General" : request.ResumeVariant.Trim();
        var coverTone = string.IsNullOrWhiteSpace(request.CoverLetterTone) ? "Direct" : request.CoverLetterTone.Trim();
        var focusAreas = (request.FocusAreasCsv ?? "delivery,collaboration,problem-solving")
            .Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries)
            .Where(x => !string.IsNullOrWhiteSpace(x))
            .Take(8)
            .ToArray();

        var openingName = string.IsNullOrWhiteSpace(profile?.Headline) ? "Hiring Team" : profile!.Headline;
        var summary = profile?.Summary ?? "I focus on building reliable, practical software that improves day-to-day workflows.";
        var tonePrefix = coverTone.Equals("Warm", StringComparison.OrdinalIgnoreCase)
            ? "I am excited to submit my application"
            : coverTone.Equals("Assertive", StringComparison.OrdinalIgnoreCase)
                ? "I am well positioned to contribute immediately"
                : "I am writing to express interest";

        var coverLetter = $"""
Dear {openingName},

{tonePrefix} for the {opportunity.RoleTitle} role at {opportunity.Company}.
{summary}

My primary focus areas for this role are: {string.Join(", ", focusAreas)}.
I align my execution style to measurable outcomes, maintainable implementation, and cross-team communication.

Sincerely,
{user.FindFirstValue("display_name") ?? "Candidate"}
""";

        var talkingPoints = BuildTalkingPoints(opportunity, focusAreas);

        db.WorkflowEvents.Add(new WorkflowEvent
        {
            UserId = userId,
            OpportunityId = opportunity.Id,
            EventType = "automation.application_package_generated",
            PayloadJson = JsonSerializer.Serialize(new { resumeVariant, coverTone, focusAreas })
        });
        await db.SaveChangesAsync();

        return Results.Ok(new
        {
            opportunityId = opportunity.Id,
            company = opportunity.Company,
            roleTitle = opportunity.RoleTitle,
            options = new
            {
                resumeVariant,
                coverTone,
                focusAreas
            },
            talkingPoints,
            coverLetter
        });
    }

    private static async Task<IResult> GenerateInterviewQuestionSet(
        InterviewQuestionsRequest request,
        ClaimsPrincipal user,
        ApplyDbContext db)
    {
        var userId = user.GetUserId();
        var opportunity = await db.Opportunities.FirstOrDefaultAsync(x => x.Id == request.OpportunityId && x.UserId == userId);
        if (opportunity is null)
        {
            return Results.NotFound(new { error = "Opportunity not found." });
        }

        var questionType = NormalizeQuestionType(request.QuestionType);
        var questions = BuildQuestionSet(opportunity, questionType);

        if (request.SaveToMetadata != false)
        {
            var root = JobPresentation.ParseMetadataObject(opportunity.MetadataJson);
            var interviewObj = root["interviewQuestions"] as JsonObject ?? new JsonObject();
            interviewObj["lastType"] = questionType;
            interviewObj["generatedUtc"] = DateTime.UtcNow.ToString("O");
            interviewObj["latest"] = new JsonArray(questions.Select(q => (JsonNode?)JsonValue.Create(q)).ToArray());
            interviewObj[questionType] = new JsonArray(questions.Select(q => (JsonNode?)JsonValue.Create(q)).ToArray());
            root["interviewQuestions"] = interviewObj;
            opportunity.MetadataJson = root.ToJsonString();
            opportunity.UpdatedUtc = DateTime.UtcNow;
        }

        db.WorkflowEvents.Add(new WorkflowEvent
        {
            UserId = userId,
            OpportunityId = opportunity.Id,
            EventType = "automation.interview_questions_generated",
            PayloadJson = JsonSerializer.Serialize(new { questionType, count = questions.Length })
        });
        await db.SaveChangesAsync();

        return Results.Ok(new
        {
            opportunityId = opportunity.Id,
            company = opportunity.Company,
            roleTitle = opportunity.RoleTitle,
            questionType,
            questions
        });
    }

    private static async Task<IResult> GenerateFollowUpEmail(
        FollowUpEmailRequest request,
        ClaimsPrincipal user,
        ApplyDbContext db)
    {
        var userId = user.GetUserId();
        var profile = await db.Profiles.FirstOrDefaultAsync(x => x.UserId == userId);
        var opportunity = await db.Opportunities.FirstOrDefaultAsync(x => x.Id == request.OpportunityId && x.UserId == userId);
        if (opportunity is null)
        {
            return Results.NotFound(new { error = "Opportunity not found." });
        }

        var application = await db.Applications
            .Where(x => x.UserId == userId && x.OpportunityId == opportunity.Id)
            .OrderByDescending(x => x.UpdatedUtc)
            .FirstOrDefaultAsync();
        var currentStatus = application is null ? "Saved" : NormalizeStatus(application.Status);
        var displayName = user.FindFirstValue("display_name") ?? "Candidate";
        var (subject, body) = BuildFollowUpEmail(profile, opportunity, currentStatus, displayName);

        var root = JobPresentation.ParseMetadataObject(opportunity.MetadataJson);
        var artifacts = root["artifacts"] as JsonObject ?? new JsonObject();
        artifacts["followUpEmail"] = new JsonObject
        {
            ["generatedUtc"] = DateTime.UtcNow.ToString("O"),
            ["status"] = currentStatus,
            ["subject"] = subject,
            ["body"] = body
        };
        root["artifacts"] = artifacts;
        opportunity.MetadataJson = root.ToJsonString();
        opportunity.UpdatedUtc = DateTime.UtcNow;

        db.WorkflowEvents.Add(new WorkflowEvent
        {
            UserId = userId,
            OpportunityId = opportunity.Id,
            ApplicationId = application?.Id,
            EventType = "automation.follow_up_email_generated",
            PayloadJson = JsonSerializer.Serialize(new { status = currentStatus })
        });
        await db.SaveChangesAsync();

        return Results.Ok(new
        {
            opportunityId = opportunity.Id,
            company = opportunity.Company,
            roleTitle = opportunity.RoleTitle,
            status = currentStatus,
            subject,
            body
        });
    }

    private static async Task<IResult> DownloadResumePdf(
        Guid opportunityId,
        ClaimsPrincipal user,
        ApplyDbContext db)
    {
        var userId = user.GetUserId();
        var opportunity = await db.Opportunities.FirstOrDefaultAsync(x => x.Id == opportunityId && x.UserId == userId);
        if (opportunity is null)
        {
            return Results.NotFound(new { error = "Opportunity not found." });
        }

        var root = JobPresentation.ParseMetadataObject(opportunity.MetadataJson);
        var artifacts = root["artifacts"] as JsonObject;
        var resumeDraft = artifacts?["resumeDraft"] as JsonObject;
        var base64 = resumeDraft?["pdfBase64"]?.ToString();
        if (string.IsNullOrWhiteSpace(base64))
        {
            return Results.NotFound(new { error = "Resume PDF not found. Generate it first." });
        }

        byte[] bytes;
        try
        {
            bytes = Convert.FromBase64String(base64);
        }
        catch
        {
            return Results.BadRequest(new { error = "Stored resume PDF is invalid." });
        }

        var fileName = resumeDraft?["fileName"]?.ToString();
        if (string.IsNullOrWhiteSpace(fileName))
        {
            fileName = $"{SanitizeFilePart(opportunity.Company)}-{SanitizeFilePart(opportunity.RoleTitle)}.pdf";
        }

        return Results.File(bytes, "application/pdf", fileName);
    }

    private static async Task<IResult> ListWorkflowEvents(ClaimsPrincipal user, ApplyDbContext db)
    {
        var userId = user.GetUserId();
        var events = await db.WorkflowEvents
            .Where(x => x.UserId == userId)
            .OrderByDescending(x => x.CreatedUtc)
            .Take(100)
            .Select(x => new
            {
                x.Id,
                x.EventType,
                x.ApplicationId,
                x.OpportunityId,
                x.CreatedUtc
            })
            .ToListAsync();

        return Results.Ok(events);
    }

    private static async Task SignInAsync(HttpContext context, UserAccount user)
    {
        var claims = new List<Claim>
        {
            new(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new(ClaimTypes.Email, user.Email),
            new("display_name", user.DisplayName)
        };
        var identity = new ClaimsIdentity(claims, CookieAuthenticationDefaults.AuthenticationScheme);
        await context.SignInAsync(CookieAuthenticationDefaults.AuthenticationScheme, new ClaimsPrincipal(identity));
    }

    private static string NormalizeStatus(string? requestedStatus)
    {
        return JobWorkflow.NormalizeStatus(requestedStatus);
    }

    private static string NormalizePriority(string? requestedPriority)
    {
        var allowed = new HashSet<string>(StringComparer.OrdinalIgnoreCase) { "Low", "Normal", "High", "Critical" };
        if (string.IsNullOrWhiteSpace(requestedPriority) || !allowed.Contains(requestedPriority))
        {
            return "Normal";
        }

        return allowed.First(x => x.Equals(requestedPriority, StringComparison.OrdinalIgnoreCase));
    }

    private static bool IsValidStatusTransition(string currentStatus, string nextStatus)
    {
        return !string.IsNullOrWhiteSpace(currentStatus) && !string.IsNullOrWhiteSpace(nextStatus);
    }

    private static string ResolveCompanyName(string? requestedCompany, string? postingUrl)
    {
        if (!string.IsNullOrWhiteSpace(requestedCompany))
        {
            return requestedCompany.Trim();
        }

        if (Uri.TryCreate(postingUrl, UriKind.Absolute, out var uri))
        {
            var host = uri.Host.Replace("www.", string.Empty, StringComparison.OrdinalIgnoreCase);
            var root = host.Split('.').FirstOrDefault() ?? "Unknown Company";
            return string.IsNullOrWhiteSpace(root)
                ? "Unknown Company"
                : char.ToUpperInvariant(root[0]) + root[1..];
        }

        return "Unknown Company";
    }

    private static string ResolveRoleTitle(string? requestedRole, string? descriptionRaw)
    {
        if (!string.IsNullOrWhiteSpace(requestedRole))
        {
            return requestedRole.Trim();
        }

        if (!string.IsNullOrWhiteSpace(descriptionRaw))
        {
            var firstLine = descriptionRaw
                .Split(['\r', '\n'], StringSplitOptions.RemoveEmptyEntries)
                .FirstOrDefault();
            if (!string.IsNullOrWhiteSpace(firstLine))
            {
                return firstLine.Length > 80 ? firstLine[..80] : firstLine;
            }
        }

        return "Unspecified Role";
    }

    private static string BuildOpportunityMetadata(
        string company,
        string roleTitle,
        string sourceType,
        string? postingUrl,
        string? normalizedDescription,
        string? applicationOptionsJson,
        string? clientMetadataJson)
    {
        var options = ParseApplicationOptions(applicationOptionsJson);
        var questions = GenerateInterviewQuestions(company, roleTitle, normalizedDescription);

        var payload = new
        {
            companyProfile = new
            {
                summary = BuildCompanySummary(company, sourceType, postingUrl),
                source = sourceType,
                domain = ExtractDomain(postingUrl),
                research = BuildCompanyResearch(company, sourceType, postingUrl, roleTitle, normalizedDescription)
            },
            applicationOptions = options,
            interviewQuestions = questions,
            clientMetadata = ParseJsonOrNull(clientMetadataJson)
        };

        return JsonSerializer.Serialize(payload);
    }

    private static object ParseApplicationOptions(string? rawOptionsJson)
    {
        if (string.IsNullOrWhiteSpace(rawOptionsJson))
        {
            return new
            {
                resumeVariant = "General",
                coverLetterTone = "Direct",
                focusAreas = new[] { "delivery", "collaboration", "problem-solving" }
            };
        }

        try
        {
            using var doc = JsonDocument.Parse(rawOptionsJson);
            return JsonSerializer.Deserialize<object>(doc.RootElement.GetRawText()) ?? new { };
        }
        catch
        {
            return new
            {
                resumeVariant = "General",
                coverLetterTone = "Direct",
                focusAreas = new[] { "delivery", "collaboration", "problem-solving" }
            };
        }
    }

    private static object? ParseJsonOrNull(string? raw)
    {
        if (string.IsNullOrWhiteSpace(raw))
        {
            return null;
        }

        try
        {
            using var doc = JsonDocument.Parse(raw);
            return JsonSerializer.Deserialize<object>(doc.RootElement.GetRawText());
        }
        catch
        {
            return null;
        }
    }

    private static string[] GenerateInterviewQuestions(string company, string roleTitle, string? normalizedDescription)
    {
        var focus = string.IsNullOrWhiteSpace(normalizedDescription)
            ? "relevant production delivery scenarios"
            : normalizedDescription.Length > 120
                ? normalizedDescription[..120]
                : normalizedDescription;

        return
        [
            $"What attracts you to the {roleTitle} opportunity at {company}?",
            $"Describe a project where you handled {focus}.",
            $"How do you prioritize quality and delivery speed when deadlines tighten?",
            $"Walk through your approach for debugging an incident in production.",
            $"How do you communicate trade-offs to non-technical stakeholders?"
        ];
    }

    private static object BuildCompanyResearch(
        string company,
        string sourceType,
        string? postingUrl,
        string roleTitle,
        string? normalizedDescription)
    {
        var domain = ExtractDomain(postingUrl) ?? "unknown";
        var industry = GuessIndustry(domain, roleTitle, normalizedDescription);
        var sizeBand = GuessCompanySize(domain);
        var signals = new[]
        {
            $"Source: {sourceType}",
            $"Domain: {domain}",
            $"Role focus: {roleTitle}"
        };

        return new
        {
            company,
            industry,
            sizeBand,
            signals
        };
    }

    private static string GuessIndustry(string domain, string roleTitle, string? normalizedDescription)
    {
        var probe = $"{domain} {roleTitle} {normalizedDescription}".ToLowerInvariant();
        if (probe.Contains("health") || probe.Contains("medical")) return "Health / MedTech";
        if (probe.Contains("bank") || probe.Contains("fin") || probe.Contains("payment")) return "FinTech";
        if (probe.Contains("retail") || probe.Contains("commerce") || probe.Contains("ecom")) return "Commerce";
        if (probe.Contains("edu") || probe.Contains("learning")) return "Education";
        if (probe.Contains("cloud") || probe.Contains("platform") || probe.Contains("devops")) return "SaaS / Platform";
        return "General Technology";
    }

    private static string GuessCompanySize(string domain)
    {
        if (string.IsNullOrWhiteSpace(domain) || domain == "unknown") return "Undetermined";
        if (domain.Contains("inc") || domain.Contains("corp")) return "Mid to Large";
        if (domain.Contains("io") || domain.Contains("ai") || domain.Contains("labs")) return "Startup / Growth";
        return "Small to Mid";
    }

    private static string[] BuildTalkingPoints(Opportunity opportunity, string[] focusAreas)
    {
        var basePoints = new List<string>
        {
            $"Connect prior delivery outcomes to the {opportunity.RoleTitle} scope.",
            $"Highlight collaboration style for stakeholders at {opportunity.Company}.",
            "Use one concrete production example with measurable impact."
        };
        basePoints.AddRange(focusAreas.Select(x => $"Emphasize {x} with role-specific evidence."));
        return basePoints.Distinct(StringComparer.OrdinalIgnoreCase).Take(8).ToArray();
    }

    private static string NormalizeQuestionType(string? questionType)
    {
        if (string.IsNullOrWhiteSpace(questionType))
        {
            return "mixed";
        }

        var raw = questionType.Trim().ToLowerInvariant();
        return raw switch
        {
            "behavioral" => "behavioral",
            "technical" => "technical",
            "system" => "system-design",
            "system-design" => "system-design",
            _ => "mixed"
        };
    }

    private static string[] BuildQuestionSet(Opportunity opportunity, string questionType)
    {
        return questionType switch
        {
            "behavioral" =>
            [
                $"Tell me about a time you delivered under pressure in a role similar to {opportunity.RoleTitle}.",
                $"Describe a disagreement with a teammate and how you resolved it.",
                "How do you prioritize competing deadlines without sacrificing quality?",
                "Share an example where feedback changed your implementation approach.",
                "What does ownership look like for you in ambiguous projects?"
            ],
            "technical" =>
            [
                $"How would you design a reliable workflow for the core responsibilities in this {opportunity.RoleTitle} posting?",
                "Describe your debugging process when a production issue has incomplete logs.",
                "How do you evaluate trade-offs between shipping quickly and reducing technical debt?",
                "What signals tell you an architecture needs refactoring?",
                "How do you verify quality before release in a fast-moving environment?"
            ],
            "system-design" =>
            [
                $"Design a scalable job-tracking workflow that could support the operational needs of {opportunity.Company}.",
                "How would you model data boundaries and ownership across services?",
                "What observability stack would you include and why?",
                "How would you design for graceful degradation during partial outages?",
                "What migration strategy would you use to evolve schema without downtime?"
            ],
            _ =>
            [
                $"What attracts you to this {opportunity.RoleTitle} opportunity at {opportunity.Company}?",
                "Walk through a production incident and your root-cause process.",
                "How do you communicate delivery risk to non-technical stakeholders?",
                "How would you improve an inherited workflow with poor documentation?",
                "Which of your strengths best maps to this role and why?"
            ]
        };
    }

    private static string BuildResumeDraft(
        UserProfile? profile,
        Opportunity opportunity,
        string displayName,
        string[] skills,
        string template,
        string quality,
        string? focusAreasCsv)
    {
        var headline = string.IsNullOrWhiteSpace(profile?.Headline)
            ? $"Candidate for {opportunity.RoleTitle}"
            : profile!.Headline!;
        var summary = string.IsNullOrWhiteSpace(profile?.Summary)
            ? "Professional focused on reliable delivery, thoughtful collaboration, and practical problem solving."
            : profile!.Summary!;
        var focusAreas = string.IsNullOrWhiteSpace(focusAreasCsv)
            ? []
            : focusAreasCsv
                .Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries)
                .Where(x => !string.IsNullOrWhiteSpace(x))
                .Take(6)
                .ToArray();
        var skillsLine = skills.Length == 0
            ? "delivery, collaboration, systems thinking, problem solving"
            : string.Join(", ", skills);
        var location = profile?.Location ?? opportunity.Location ?? "Location flexible";
        var linkedIn = string.IsNullOrWhiteSpace(profile?.LinkedInUrl) ? "Not provided" : profile!.LinkedInUrl!;
        var github = string.IsNullOrWhiteSpace(profile?.GithubUrl) ? "Not provided" : profile!.GithubUrl!;
        var strengthAreas = focusAreas.Length == 0 ? skills.Take(4).ToArray() : focusAreas;
        var highlights = new List<string>
        {
            $"Pursuing {opportunity.RoleTitle} opportunities with an emphasis on {string.Join(", ", strengthAreas)}.",
            "Known for dependable execution, clear communication, and steady follow-through.",
            "Comfortable contributing in teams that value ownership, collaboration, and quality."
        };

        if (quality is "Targeted" or "Premium")
        {
            highlights.Add($"Strong fit for roles that prioritize {string.Join(", ", strengthAreas.Take(3))}.");
        }

        if (quality == "Premium")
        {
            highlights.Add("Prepared to support fast-moving teams that need thoughtful judgment and consistent delivery.");
        }

        return $"""
{displayName}
{headline}
{location}

Professional Summary
{summary}

Selected Highlights
{string.Join(Environment.NewLine, highlights.Select(x => $"- {x}"))}

Core Skills
- {skillsLine}

Links
- LinkedIn: {linkedIn}
- GitHub: {github}
""";
    }

    private static byte[] BuildResumePdfBytes(
        string displayName,
        UserProfile? profile,
        Opportunity opportunity,
        string draft,
        string template,
        string quality,
        string[] skills)
    {
        var accent = template switch
        {
            "Executive" => Colors.Blue.Darken3,
            "Modern" => Colors.Teal.Darken2,
            _ => Colors.Grey.Darken3
        };

        return Document.Create(container =>
        {
            container.Page(page =>
            {
                page.Margin(32);
                page.Size(PageSizes.Letter);
                page.DefaultTextStyle(x => x.FontSize(10).FontFamily("Arial"));
                page.Header().Column(col =>
                {
                    col.Item().Text(displayName).FontSize(22).SemiBold().FontColor(accent);
                    col.Item().Text($"Target role: {opportunity.RoleTitle}").FontSize(12);
                });

                page.Content().PaddingVertical(14).Column(col =>
                {
                    col.Spacing(10);
                    col.Item().Text(draft).LineHeight(1.35f);
                });
            });
        }).GeneratePdf();
    }

    private static void ResumeSection(IContainer container, string title, string body, string accent)
    {
        container.Column(col =>
        {
            col.Item().Text(title).FontSize(11).SemiBold().FontColor(accent);
            col.Item().PaddingTop(4).Text(body).LineHeight(1.35f);
        });
    }

    private static (string Subject, string Body) BuildFollowUpEmail(
        UserProfile? profile,
        Opportunity opportunity,
        string currentStatus,
        string displayName)
    {
        var summary = string.IsNullOrWhiteSpace(profile?.Summary)
            ? "my background in reliable delivery and practical problem solving"
            : profile!.Summary!;
        var subject = currentStatus switch
        {
            "Interview Scheduled" or "Second Interview" => $"Thank you for discussing the {opportunity.RoleTitle} role",
            "Offer Made" => $"Thank you for the offer for {opportunity.RoleTitle}",
            _ => $"Following up on the {opportunity.RoleTitle} application"
        };

        var body = currentStatus switch
        {
            "Interview Scheduled" or "Second Interview" => $"""
Hello {opportunity.Company} team,

Thank you again for the conversation about the {opportunity.RoleTitle} opportunity. I enjoyed learning more about the role and how the team is approaching the work.

The discussion reinforced how well the position aligns with {summary}. Please let me know if there is anything else I can provide ahead of the next step.

Best,
{displayName}
""",
            "Offer Made" => $"""
Hello {opportunity.Company} team,

Thank you for the offer for the {opportunity.RoleTitle} role. I appreciate the time and care your team has put into the process.

I am reviewing the details now and will follow up shortly with any questions or next steps.

Best,
{displayName}
""",
            _ => $"""
Hello {opportunity.Company} team,

I wanted to follow up on my application for the {opportunity.RoleTitle} role. I remain very interested in the opportunity and believe my background aligns well with the work described.

In particular, I would bring {summary}. Please let me know if there are any updates on the timeline or if additional information would be helpful.

Best,
{displayName}
"""
        };

        return (subject, body);
    }

    private static string NormalizeResumeTemplate(string? template)
    {
        return template?.Trim().ToLowerInvariant() switch
        {
            "modern" => "Modern",
            "executive" => "Executive",
            _ => "Classic"
        };
    }

    private static string NormalizeResumeQuality(string? quality)
    {
        return quality?.Trim().ToLowerInvariant() switch
        {
            "targeted" => "Targeted",
            "premium" => "Premium",
            _ => "Standard"
        };
    }

    private static string SanitizeFilePart(string value)
    {
        var invalid = Path.GetInvalidFileNameChars();
        var cleaned = new string(value.Where(c => !invalid.Contains(c)).ToArray()).Trim();
        return string.IsNullOrWhiteSpace(cleaned) ? "resume" : cleaned.Replace(' ', '-');
    }

    private static string BuildCompanySummary(string company, string sourceType, string? postingUrl)
    {
        var domain = ExtractDomain(postingUrl);
        if (string.IsNullOrWhiteSpace(domain))
        {
            return $"{company} opportunity sourced via {sourceType}. Build messaging around product impact, execution rigor, and cross-functional collaboration.";
        }

        return $"{company} opportunity sourced via {sourceType} from {domain}. Position your application around measurable outcomes, maintainable implementation, and communication across teams.";
    }

    private static string? ExtractDomain(string? postingUrl)
    {
        if (Uri.TryCreate(postingUrl, UriKind.Absolute, out var uri))
        {
            return uri.Host.Replace("www.", string.Empty, StringComparison.OrdinalIgnoreCase);
        }

        return null;
    }
}

internal static class ClaimsPrincipalExtensions
{
    public static Guid GetUserId(this ClaimsPrincipal user)
    {
        var raw = user.FindFirstValue(ClaimTypes.NameIdentifier);
        return Guid.Parse(raw!);
    }
}

public sealed record RegisterRequest(string Email, string Password, string? DisplayName);
public sealed record LoginRequest(string Email, string Password);
public sealed record SessionResponse(Guid? UserId, string? Email, string? DisplayName, bool IsAuthenticated);

public sealed record ProfileRequest(
    string? Headline,
    string? Summary,
    string? Location,
    string? LinkedInUrl,
    string? GithubUrl,
    string? SkillsJson,
    string? PreferencesJson);

public sealed record ProfileResponse(
    string? Headline,
    string? Summary,
    string? Location,
    string? LinkedInUrl,
    string? GithubUrl,
    string SkillsJson,
    string PreferencesJson);

public sealed record OpportunityRequest(
    string SourceType,
    string? Company,
    string? RoleTitle,
    string? Location,
    string? CompensationText,
    string? PostingUrl,
    string? DescriptionRaw,
    string? MetadataJson,
    bool? CreateBoardEntry,
    string? ApplicationStatus,
    string? ApplicationPriority,
    string? ApplicationOptionsJson);

public sealed record ApplicationRequest(
    Guid OpportunityId,
    string? Status,
    string? Priority,
    string? Notes,
    DateTime? AppliedUtc);

public sealed record ApplicationStatusRequest(string Status);
public sealed record ApplicationPriorityRequest(string Priority);
public sealed record ApplicationNoteRequest(string Note);
public sealed record CoverLetterDraftRequest(Guid OpportunityId);
public sealed record CompanyReportRequest(Guid OpportunityId);
public sealed record JobSummaryRequest(Guid OpportunityId);
public sealed record ResumePdfRequest(Guid OpportunityId, string? Template, string? Quality, string? FocusAreasCsv);
public sealed record ApplicationPackageRequest(Guid OpportunityId, string? ResumeVariant, string? CoverLetterTone, string? FocusAreasCsv);
public sealed record InterviewQuestionsRequest(Guid OpportunityId, string? QuestionType, bool? SaveToMetadata);
public sealed record FollowUpEmailRequest(Guid OpportunityId);

public sealed record ExtensionIngestionRequest(
    string? SourceDomain,
    string? PageUrl,
    string? RoleTitle,
    string? Company,
    string? Location,
    string? RawDescription,
    string? MetadataJson,
    string? ApplicationStatus,
    string? ApplicationPriority,
    string? ApplicationOptionsJson);
