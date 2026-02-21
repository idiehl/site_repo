namespace Atlas.Api.Endpoints;

public static class AtlasApiEndpointExtensions
{
    public static IEndpointRouteBuilder MapAtlasApiEndpoints(this IEndpointRouteBuilder app)
    {
        app.MapAuthEndpoints();
        app.MapProfileEndpoints();
        app.MapApplicationEndpoints();
        app.MapJobEndpoints();
        app.MapBillingEndpoints();
        app.MapAdminEndpoints();
        app.MapMeridianEndpoints();
        app.MapDevEndpoints();
        app.MapPlaygroundEndpoints();

        return app;
    }
}
