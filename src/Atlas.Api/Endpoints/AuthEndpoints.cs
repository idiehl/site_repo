using Atlas.Contracts.Auth;

namespace Atlas.Api.Endpoints;

public static class AuthEndpoints
{
    public static IEndpointRouteBuilder MapAuthEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/v2/auth");

        group.MapPost("/register", Register);
        group.MapPost("/login", Login);
        group.MapGet("/me", GetCurrentUser).RequireAuthorization();
        group.MapPost("/logout", Logout).RequireAuthorization();
        group.MapPost("/password-reset/request", RequestPasswordReset);
        group.MapPost("/password-reset/confirm", ConfirmPasswordReset);
        group.MapGet("/linkedin/authorize", LinkedInAuthorize);
        group.MapGet("/linkedin/callback", LinkedInCallback);
        group.MapGet("/google/authorize", GoogleAuthorize);
        group.MapGet("/google/callback", GoogleCallback);

        return app;
    }

    private static async Task<IResult> Register(UserCreateRequest request)
    {
        return Results.Ok();
    }

    private static async Task<IResult> Login(HttpContext context)
    {
        return Results.Ok();
    }

    private static async Task<IResult> GetCurrentUser(HttpContext context)
    {
        return Results.Ok();
    }

    private static async Task<IResult> Logout()
    {
        return Results.Ok();
    }

    private static async Task<IResult> RequestPasswordReset(PasswordResetRequest request)
    {
        return Results.Ok();
    }

    private static async Task<IResult> ConfirmPasswordReset(PasswordResetConfirm request)
    {
        return Results.Ok();
    }

    private static async Task<IResult> LinkedInAuthorize()
    {
        return Results.Ok();
    }

    private static async Task<IResult> LinkedInCallback(HttpContext context)
    {
        return Results.Ok();
    }

    private static async Task<IResult> GoogleAuthorize()
    {
        return Results.Ok();
    }

    private static async Task<IResult> GoogleCallback(HttpContext context)
    {
        return Results.Ok();
    }
}
