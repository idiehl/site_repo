using Atlas.Contracts.Meridian;

namespace Atlas.Api.Endpoints;

public static class MeridianEndpoints
{
    public static IEndpointRouteBuilder MapMeridianEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/v2/meridian").RequireAuthorization();

        group.MapGet("/status", GetStatus);
        group.MapGet("/projects", GetProjects);
        group.MapPost("/projects", CreateProject);
        group.MapGet("/projects/{projectId:guid}", GetProject);
        group.MapPost("/sync/pull", SyncPull);
        group.MapPost("/sync/push", SyncPush);

        return app;
    }

    private static async Task<IResult> GetStatus(HttpContext context) => Results.Ok();
    private static async Task<IResult> GetProjects(HttpContext context) => Results.Ok();
    private static async Task<IResult> CreateProject(MeridianProjectCreate request, HttpContext context) => Results.Ok();
    private static async Task<IResult> GetProject(Guid projectId, HttpContext context) => Results.Ok();
    private static async Task<IResult> SyncPull(MeridianSyncPullRequest request, HttpContext context) => Results.Ok();
    private static async Task<IResult> SyncPush(MeridianSyncPushRequest request, HttpContext context) => Results.Ok();
}
