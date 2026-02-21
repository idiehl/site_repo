using Atlas.Contracts.Profile;

namespace Atlas.Api.Endpoints;

public static class ProfileEndpoints
{
    public static IEndpointRouteBuilder MapProfileEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/v2/profile").RequireAuthorization();

        group.MapGet("/", GetProfile);
        group.MapPatch("/", UpdateProfile);
        group.MapPost("/enhance", EnhanceProfile);
        group.MapPost("/upload-resume", UploadResume);
        group.MapGet("/completeness", GetCompleteness);
        group.MapPost("/upload-picture", UploadPicture);
        group.MapDelete("/picture", DeletePicture);

        return app;
    }

    private static async Task<IResult> GetProfile(HttpContext context) => Results.Ok();
    private static async Task<IResult> UpdateProfile(ProfileUpdateRequest request, HttpContext context) => Results.Ok();
    private static async Task<IResult> EnhanceProfile(HttpContext context) => Results.Ok();
    private static async Task<IResult> UploadResume(HttpContext context) => Results.Ok();
    private static async Task<IResult> GetCompleteness(HttpContext context) => Results.Ok();
    private static async Task<IResult> UploadPicture(HttpContext context) => Results.Ok();
    private static async Task<IResult> DeletePicture(HttpContext context) => Results.Ok();
}
