using Atlas.Contracts.Billing;

namespace Atlas.Api.Endpoints;

public static class BillingEndpoints
{
    public static IEndpointRouteBuilder MapBillingEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/v2/billing");

        group.MapGet("/status", GetStatus).RequireAuthorization();
        group.MapPost("/checkout", CreateCheckout).RequireAuthorization();
        group.MapPost("/webhook", HandleWebhook);

        return app;
    }

    private static async Task<IResult> GetStatus(HttpContext context) => Results.Ok();
    private static async Task<IResult> CreateCheckout(CheckoutSessionRequest request, HttpContext context) => Results.Ok();
    private static async Task<IResult> HandleWebhook(HttpContext context) => Results.Ok();
}
