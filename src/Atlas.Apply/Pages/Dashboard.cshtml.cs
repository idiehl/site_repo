using System.Security.Claims;
using Atlas.Apply.Data;
using Atlas.Apply.Features.Jobs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.EntityFrameworkCore;

namespace Atlas.Apply.Pages;

[Authorize]
public class DashboardModel(ApplyDbContext db) : PageModel
{
    public IReadOnlyList<WorkspaceJobRow> Jobs { get; private set; } = [];
    public IReadOnlyList<string> StatusOptions => JobWorkflow.StatusOptions;

    public async Task OnGet()
    {
        var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        var rows = await db.Applications
            .Where(x => x.UserId == userId)
            .Join(
                db.Opportunities,
                app => app.OpportunityId,
                opp => opp.Id,
                (app, opp) => new { app, opp })
            .OrderByDescending(x => x.app.UpdatedUtc)
            .Select(x => new
            {
                ApplicationId = x.app.Id,
                x.app.Status,
                x.app.UpdatedUtc,
                x.opp.Company,
                x.opp.RoleTitle,
                x.opp.DescriptionNormalized,
                x.opp.MetadataJson
            })
            .ToListAsync();

        Jobs = rows.Select(row =>
        {
            var metadata = JobPresentation.ParseMetadata(row.MetadataJson);
            var readyState = JobPresentation.EvaluateReadyState(
                row.Company,
                row.RoleTitle,
                row.DescriptionNormalized,
                metadata);

            return new WorkspaceJobRow(
                row.ApplicationId,
                row.RoleTitle,
                row.Company,
                JobWorkflow.NormalizeStatus(row.Status),
                readyState.Label,
                readyState.IsReady,
                row.UpdatedUtc);
        }).ToList();
    }
}

public sealed record WorkspaceJobRow(
    Guid ApplicationId,
    string RoleTitle,
    string Company,
    string Status,
    string ReadyStatus,
    bool IsReady,
    DateTime UpdatedUtc);
