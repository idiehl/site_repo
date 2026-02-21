using Atlas.Contracts.Applications;

namespace Atlas.Api.Endpoints;

public static class ApplicationEndpoints
{
    public static IEndpointRouteBuilder MapApplicationEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/v2/applications").RequireAuthorization();

        group.MapGet("/", GetApplications);
        group.MapPost("/", CreateApplication);
        group.MapGet("/{appId:guid}", GetApplication);
        group.MapPatch("/{appId:guid}", UpdateApplication);
        group.MapPost("/{appId:guid}/followup-message", GenerateFollowUp);
        group.MapPost("/{appId:guid}/interview-prep", GenerateInterviewPrep);
        group.MapPost("/{appId:guid}/improvement", GenerateImprovement);

        return app;
    }

    private static async Task<IResult> GetApplications(HttpContext context) => Results.Ok();
    private static async Task<IResult> CreateApplication(ApplicationCreateRequest request, HttpContext context) => Results.Ok();
    private static async Task<IResult> GetApplication(Guid appId, HttpContext context) => Results.Ok();
    private static async Task<IResult> UpdateApplication(Guid appId, HttpContext context) => Results.Ok();
    private static async Task<IResult> GenerateFollowUp(Guid appId, HttpContext context) => Results.Ok();
    private static async Task<IResult> GenerateInterviewPrep(Guid appId, HttpContext context) => Results.Ok();
    private static async Task<IResult> GenerateImprovement(Guid appId, HttpContext context) => Results.Ok();
}
