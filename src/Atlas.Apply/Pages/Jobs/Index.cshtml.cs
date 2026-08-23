using System.Security.Claims;
using Atlas.Apply.Data;
using Atlas.Apply.Features.Jobs;
using Atlas.Apply.Features.Profile;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.EntityFrameworkCore;

namespace Atlas.Apply.Pages.Jobs;

[Authorize]
public class IndexModel(ApplyDbContext db) : PageModel
{
    public JobDetailView? Job { get; private set; }
    public IReadOnlyList<string> StatusOptions => JobWorkflow.StatusOptions;
    public IReadOnlyList<string> PriorityOptions { get; } = ["Low", "Normal", "High", "Critical"];

    public async Task<IActionResult> OnGet(Guid applicationId)
    {
        var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        var row = await db.Applications
            .Where(x => x.Id == applicationId && x.UserId == userId)
            .Join(
                db.Opportunities,
                app => app.OpportunityId,
                opp => opp.Id,
                (app, opp) => new { app, opp })
            .Select(x => new
            {
                ApplicationId = x.app.Id,
                x.app.Status,
                x.app.Priority,
                x.app.Notes,
                x.app.AppliedUtc,
                x.app.UpdatedUtc,
                OpportunityId = x.opp.Id,
                x.opp.Company,
                x.opp.RoleTitle,
                x.opp.Location,
                x.opp.SourceType,
                x.opp.PostingUrl,
                x.opp.DescriptionRaw,
                x.opp.DescriptionNormalized,
                x.opp.MetadataJson
            })
            .FirstOrDefaultAsync();

        if (row is null)
        {
            return NotFound();
        }

        var profile = await db.Profiles
            .AsNoTracking()
            .FirstOrDefaultAsync(x => x.UserId == userId);

        var history = await db.WorkflowEvents
            .Where(x =>
                x.UserId == userId &&
                (x.ApplicationId == row.ApplicationId || (x.OpportunityId == row.OpportunityId && x.ApplicationId == null)))
            .OrderByDescending(x => x.CreatedUtc)
            .Take(20)
            .Select(x => new JobHistoryItem(
                FormatHistoryLabel(x.EventType),
                FormatHistoryDetail(x.EventType),
                x.CreatedUtc))
            .ToListAsync();

        var metadata = JobPresentation.ParseMetadata(row.MetadataJson);
        var readyState = JobPresentation.EvaluateReadyState(
            row.Company,
            row.RoleTitle,
            row.DescriptionNormalized,
            metadata);

        Job = new JobDetailView(
            row.ApplicationId,
            row.OpportunityId,
            row.RoleTitle,
            row.Company,
            JobWorkflow.NormalizeStatus(row.Status),
            row.Priority,
            readyState.Label,
            readyState.IsReady,
            row.Location,
            row.SourceType,
            row.PostingUrl,
            metadata.JobSummary,
            string.IsNullOrWhiteSpace(row.DescriptionNormalized)
                ? (row.DescriptionRaw ?? "No job description is available yet.")
                : row.DescriptionNormalized,
            metadata.CompanyReport,
            row.Notes ?? string.Empty,
            metadata.ResumeDraft ?? string.Empty,
            metadata.InterviewQuestions,
            metadata.FollowUpEmailSubject ?? string.Empty,
            metadata.FollowUpEmailBody ?? string.Empty,
            row.AppliedUtc,
            row.UpdatedUtc,
            ProfileDocument.HasMeaningfulProfileData(profile),
            history);

        return Page();
    }

    private static string FormatHistoryLabel(string eventType)
    {
        return eventType switch
        {
            "opportunity.created" => "Job added",
            "application.created" => "Tracker entry created",
            "application.status_changed" => "Status updated",
            "application.priority_changed" => "Priority updated",
            "application.note_added" => "Note added",
            "application.deleted" => "Job deleted",
            "automation.resume_draft_generated" => "Resume drafted",
            "automation.interview_questions_generated" => "Interview questions generated",
            "automation.follow_up_email_generated" => "Follow-up drafted",
            "automation.cover_letter_generated" => "Cover letter drafted",
            "automation.application_package_generated" => "Application package generated",
            "ingestion.extension_processed" => "Extension import completed",
            _ => eventType.Replace('.', ' ')
        };
    }

    private static string FormatHistoryDetail(string eventType)
    {
        return eventType switch
        {
            "application.status_changed" => "Application tracker state changed.",
            "application.note_added" => "A new note was appended to this job.",
            "automation.resume_draft_generated" => "Tailored resume content was regenerated.",
            "automation.interview_questions_generated" => "Practice questions were refreshed for this role.",
            "automation.follow_up_email_generated" => "A follow-up email draft was created for this job.",
            _ => string.Empty
        };
    }
}

public sealed record JobDetailView(
    Guid ApplicationId,
    Guid OpportunityId,
    string RoleTitle,
    string Company,
    string Status,
    string Priority,
    string ReadyStatus,
    bool IsReady,
    string? Location,
    string SourceType,
    string? PostingUrl,
    JobSummarySnapshot JobSummary,
    string Description,
    CompanyReportSnapshot CompanyReport,
    string Notes,
    string ResumeDraft,
    IReadOnlyList<string> InterviewQuestions,
    string FollowUpEmailSubject,
    string FollowUpEmailBody,
    DateTime? AppliedUtc,
    DateTime UpdatedUtc,
    bool HasProfileData,
    IReadOnlyList<JobHistoryItem> History);

public sealed record JobHistoryItem(string Label, string Detail, DateTime CreatedUtc);
