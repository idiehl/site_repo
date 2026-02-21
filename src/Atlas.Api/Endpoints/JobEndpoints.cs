using Atlas.Contracts.Jobs;

namespace Atlas.Api.Endpoints;

public static class JobEndpoints
{
    public static IEndpointRouteBuilder MapJobEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/v2/jobs").RequireAuthorization();

        group.MapGet("/templates", GetTemplates);
        group.MapPost("/ingest", IngestJob);
        group.MapPost("/ingest-html", IngestHtml);
        group.MapGet("/", GetJobs);
        group.MapGet("/{jobId:guid}", GetJob);
        group.MapDelete("/{jobId:guid}", DeleteJob);
        group.MapPatch("/{jobId:guid}", UpdateJob);
        group.MapPatch("/{jobId:guid}/application-status", UpdateApplicationStatus);
        group.MapPost("/{jobId:guid}/extract-requirements", ExtractRequirements);
        group.MapPost("/{jobId:guid}/retry", RetryJob);
        group.MapPost("/retry-all-failed", RetryAllFailed);
        group.MapPost("/{jobId:guid}/manual-content", SaveManualContent);
        group.MapPost("/{jobId:guid}/resumes", GenerateResume);
        group.MapGet("/{jobId:guid}/resumes", GetResumes);
        group.MapGet("/{jobId:guid}/resumes/{resumeId:guid}", GetResume);
        group.MapPost("/{jobId:guid}/cover-letters", GenerateCoverLetter);
        group.MapGet("/{jobId:guid}/cover-letters", GetCoverLetters);
        group.MapGet("/{jobId:guid}/cover-letters/{coverLetterId:guid}", GetCoverLetter);
        group.MapGet("/{jobId:guid}/deep-dive", GetDeepDive);
        group.MapPost("/{jobId:guid}/deep-dive", GenerateDeepDive);

        return app;
    }

    private static async Task<IResult> GetTemplates(HttpContext context) => Results.Ok();
    private static async Task<IResult> IngestJob(JobIngestRequest request, HttpContext context) => Results.Ok();
    private static async Task<IResult> IngestHtml(JobIngestRequest request, HttpContext context) => Results.Ok();
    private static async Task<IResult> GetJobs(HttpContext context) => Results.Ok();
    private static async Task<IResult> GetJob(Guid jobId, HttpContext context) => Results.Ok();
    private static async Task<IResult> DeleteJob(Guid jobId, HttpContext context) => Results.Ok();
    private static async Task<IResult> UpdateJob(Guid jobId, HttpContext context) => Results.Ok();
    private static async Task<IResult> UpdateApplicationStatus(Guid jobId, HttpContext context) => Results.Ok();
    private static async Task<IResult> ExtractRequirements(Guid jobId, HttpContext context) => Results.Ok();
    private static async Task<IResult> RetryJob(Guid jobId, HttpContext context) => Results.Ok();
    private static async Task<IResult> RetryAllFailed(HttpContext context) => Results.Ok();
    private static async Task<IResult> SaveManualContent(Guid jobId, HttpContext context) => Results.Ok();
    private static async Task<IResult> GenerateResume(Guid jobId, HttpContext context) => Results.Ok();
    private static async Task<IResult> GetResumes(Guid jobId, HttpContext context) => Results.Ok();
    private static async Task<IResult> GetResume(Guid jobId, Guid resumeId, HttpContext context) => Results.Ok();
    private static async Task<IResult> GenerateCoverLetter(Guid jobId, HttpContext context) => Results.Ok();
    private static async Task<IResult> GetCoverLetters(Guid jobId, HttpContext context) => Results.Ok();
    private static async Task<IResult> GetCoverLetter(Guid jobId, Guid coverLetterId, HttpContext context) => Results.Ok();
    private static async Task<IResult> GetDeepDive(Guid jobId, HttpContext context) => Results.Ok();
    private static async Task<IResult> GenerateDeepDive(Guid jobId, HttpContext context) => Results.Ok();
}
