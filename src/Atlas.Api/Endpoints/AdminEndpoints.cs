namespace Atlas.Api.Endpoints;

public static class AdminEndpoints
{
    public static IEndpointRouteBuilder MapAdminEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/v2/admin")
            .RequireAuthorization("Admin");

        group.MapGet("/stats/overview", GetOverview);
        group.MapGet("/analytics/visits", GetVisitAnalytics);
        group.MapGet("/analytics/api-usage", GetApiUsageAnalytics);
        group.MapGet("/security/events", GetSecurityEvents);
        group.MapPost("/security/events/{eventId:guid}/resolve", ResolveSecurityEvent);

        return app;
    }

    private static async Task<IResult> GetOverview(HttpContext context) => Results.Ok();
    private static async Task<IResult> GetVisitAnalytics(HttpContext context) => Results.Ok();
    private static async Task<IResult> GetApiUsageAnalytics(HttpContext context) => Results.Ok();
    private static async Task<IResult> GetSecurityEvents(HttpContext context) => Results.Ok();
    private static async Task<IResult> ResolveSecurityEvent(Guid eventId, HttpContext context) => Results.Ok();
}
