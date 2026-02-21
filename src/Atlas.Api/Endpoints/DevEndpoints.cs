namespace Atlas.Api.Endpoints;

public static class DevEndpoints
{
    public static IEndpointRouteBuilder MapDevEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/v2/dev");

        group.MapGet("/verify", Verify);
        group.MapGet("/apps", GetApps);
        group.MapGet("/log", GetLog);
        group.MapGet("/overview", GetOverview);
        group.MapGet("/docs", GetDocs);
        group.MapGet("/status", GetStatus);
        group.MapPut("/status", UpdateStatus);
        group.MapGet("/apps/{appId}", GetAppLog);
        group.MapGet("/apps/{appId}/log", GetAppLog);
        group.MapGet("/apps/{appId}/overview", GetAppOverview);
        group.MapGet("/apps/{appId}/checklist", GetAppChecklist);
        group.MapGet("/apps/{appId}/inventory", GetAppInventory);
        group.MapPost("/apps/{appId}/checklist/tasks", AddChecklistTask);

        return app;
    }

    private static async Task<IResult> Verify(HttpContext context) => Results.Ok();
    private static async Task<IResult> GetApps(HttpContext context) => Results.Ok();
    private static async Task<IResult> GetLog(HttpContext context) => Results.Ok();
    private static async Task<IResult> GetOverview(HttpContext context) => Results.Ok();
    private static async Task<IResult> GetDocs(HttpContext context) => Results.Ok();
    private static async Task<IResult> GetStatus(HttpContext context) => Results.Ok();
    private static async Task<IResult> UpdateStatus(HttpContext context) => Results.Ok();
    private static async Task<IResult> GetAppLog(string appId, HttpContext context) => Results.Ok();
    private static async Task<IResult> GetAppOverview(string appId, HttpContext context) => Results.Ok();
    private static async Task<IResult> GetAppChecklist(string appId, HttpContext context) => Results.Ok();
    private static async Task<IResult> GetAppInventory(string appId, HttpContext context) => Results.Ok();
    private static async Task<IResult> AddChecklistTask(string appId, HttpContext context) => Results.Ok();
}
