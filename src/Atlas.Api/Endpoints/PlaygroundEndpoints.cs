namespace Atlas.Api.Endpoints;

public static class PlaygroundEndpoints
{
    public static IEndpointRouteBuilder MapPlaygroundEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/v2/playground");

        group.MapGet("/designs", GetDesigns);
        group.MapGet("/designs/{designId:guid}", GetDesign);
        group.MapPost("/designs", CreateDesign);
        group.MapPut("/designs/{designId:guid}", UpdateDesign);
        group.MapDelete("/designs/{designId:guid}", DeleteDesign);

        return app;
    }

    private static async Task<IResult> GetDesigns(HttpContext context) => Results.Ok();
    private static async Task<IResult> GetDesign(Guid designId, HttpContext context) => Results.Ok();
    private static async Task<IResult> CreateDesign(HttpContext context) => Results.Ok();
    private static async Task<IResult> UpdateDesign(Guid designId, HttpContext context) => Results.Ok();
    private static async Task<IResult> DeleteDesign(Guid designId, HttpContext context) => Results.Ok();
}
