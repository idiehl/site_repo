using Atlas.Apply.Data;
using Atlas.Apply.Domain;
using Atlas.Apply.Features.Profile;
using Atlas.Apply.Services;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using System.Text.RegularExpressions;

namespace Atlas.Apply.Api;

public static partial class ApplyApiEndpoints
{
    private static async Task<IResult> ImportLinkedInProfile(
        LinkedInImportRequest request,
        ClaimsPrincipal user,
        ApplyDbContext db,
        ILinkedInImportService linkedInImportService,
        CancellationToken cancellationToken)
    {
        var userId = user.GetUserId();
        var account = await db.Users.FirstOrDefaultAsync(x => x.Id == userId && x.IsActive, cancellationToken);
        if (account is null)
        {
            return Results.NotFound(new { error = "User account not found." });
        }

        var profile = await EnsureProfileAsync(db, userId, cancellationToken);

        try
        {
            var importResult = await linkedInImportService.ImportAsync(request.LinkedInUrl, request.ProfileText, cancellationToken);
            ProfileDocument.ApplyImportedProfileData(account, profile, importResult.Profile);
            if (!string.IsNullOrWhiteSpace(importResult.Profile.LinkedInUrl))
            {
                profile.LinkedInUrl = importResult.Profile.LinkedInUrl;
            }

            db.WorkflowEvents.Add(new WorkflowEvent
            {
                UserId = userId,
                EventType = "profile.linkedin_imported",
                PayloadJson = "{}"
            });

            await db.SaveChangesAsync(cancellationToken);
            return Results.Ok(new ProfileImportResponse
            {
                Profile = ProfileApiMapping.ToResponse(account, profile),
                Warnings = importResult.Warnings
            });
        }
        catch (InvalidOperationException ex)
        {
            return Results.BadRequest(new { error = ex.Message });
        }
    }

    private static async Task<IResult> UploadProfileImage(
        ClaimsPrincipal user,
        ApplyDbContext db,
        IProfileAssetService profileAssets,
        [FromForm] IFormFile? file,
        CancellationToken cancellationToken)
    {
        if (file is null)
        {
            return Results.BadRequest(new { error = "Select an image file to upload." });
        }

        var userId = user.GetUserId();
        var account = await db.Users.FirstOrDefaultAsync(x => x.Id == userId && x.IsActive, cancellationToken);
        if (account is null)
        {
            return Results.NotFound(new { error = "User account not found." });
        }

        var profile = await EnsureProfileAsync(db, userId, cancellationToken);
        try
        {
            var stored = await profileAssets.SaveProfileImageAsync(userId, file, profile.ProfileImagePath, cancellationToken);
            profile.ProfileImagePath = stored.RelativePath;
            profile.ProfileImageContentType = stored.ContentType;
            profile.ProfileImageFileName = stored.OriginalFileName;
            profile.UpdatedUtc = DateTime.UtcNow;

            db.WorkflowEvents.Add(new WorkflowEvent
            {
                UserId = userId,
                EventType = "profile.image_updated",
                PayloadJson = "{}"
            });

            await db.SaveChangesAsync(cancellationToken);
            return Results.Ok(ProfileApiMapping.ToResponse(account, profile));
        }
        catch (InvalidOperationException ex)
        {
            return Results.BadRequest(new { error = ex.Message });
        }
    }

    private static async Task<IResult> DeleteProfileImage(
        ClaimsPrincipal user,
        ApplyDbContext db,
        IProfileAssetService profileAssets,
        CancellationToken cancellationToken)
    {
        var userId = user.GetUserId();
        var account = await db.Users.FirstOrDefaultAsync(x => x.Id == userId && x.IsActive, cancellationToken);
        if (account is null)
        {
            return Results.NotFound(new { error = "User account not found." });
        }

        var profile = await db.Profiles.FirstOrDefaultAsync(x => x.UserId == userId, cancellationToken);
        if (profile is null || string.IsNullOrWhiteSpace(profile.ProfileImagePath))
        {
            return Results.Ok(ProfileApiMapping.ToResponse(account, profile));
        }

        await profileAssets.DeleteAsync(profile.ProfileImagePath, cancellationToken);
        profile.ProfileImagePath = null;
        profile.ProfileImageFileName = null;
        profile.ProfileImageContentType = null;
        profile.UpdatedUtc = DateTime.UtcNow;

        db.WorkflowEvents.Add(new WorkflowEvent
        {
            UserId = userId,
            EventType = "profile.image_deleted",
            PayloadJson = "{}"
        });

        await db.SaveChangesAsync(cancellationToken);
        return Results.Ok(ProfileApiMapping.ToResponse(account, profile));
    }

    private static async Task<IResult> GetProfileImage(
        ClaimsPrincipal user,
        ApplyDbContext db,
        IProfileAssetService profileAssets,
        CancellationToken cancellationToken)
    {
        var userId = user.GetUserId();
        var profile = await db.Profiles.AsNoTracking().FirstOrDefaultAsync(x => x.UserId == userId, cancellationToken);
        if (profile is null)
        {
            return Results.NotFound(new { error = "Profile image not found." });
        }

        var asset = await profileAssets.TryReadProfileImageAsync(profile, cancellationToken);
        if (asset is null)
        {
            return Results.NotFound(new { error = "Profile image not found." });
        }

        return Results.File(asset.Bytes, asset.ContentType, asset.FileName);
    }

    private static async Task<IResult> GetImportedResume(
        ClaimsPrincipal user,
        ApplyDbContext db,
        IProfileAssetService profileAssets,
        CancellationToken cancellationToken)
    {
        var userId = user.GetUserId();
        var profile = await db.Profiles.AsNoTracking()
            .FirstOrDefaultAsync(x => x.UserId == userId, cancellationToken);
        if (profile is null)
        {
            return Results.NotFound();
        }

        var asset = await profileAssets.TryReadImportedResumeAsync(userId, profile, cancellationToken);
        if (asset is null)
        {
            return Results.NotFound();
        }

        return Results.File(asset.Bytes, asset.ContentType, asset.FileName);
    }

    private static async Task<IResult> GetImportedResumePreview(
        ClaimsPrincipal user,
        ApplyDbContext db,
        IProfileAssetService profileAssets,
        CancellationToken cancellationToken)
    {
        var userId = user.GetUserId();
        var profile = await db.Profiles.AsNoTracking()
            .FirstOrDefaultAsync(x => x.UserId == userId, cancellationToken);
        if (profile is null)
        {
            return Results.NotFound();
        }

        var asset = await profileAssets.TryReadImportedResumePreviewAsync(userId, profile, cancellationToken);
        if (asset is null)
        {
            return Results.NotFound();
        }

        return Results.File(asset.Bytes, asset.ContentType, asset.FileName);
    }

    private static async Task<IResult> ImportResume(
        ClaimsPrincipal user,
        ApplyDbContext db,
        IResumeImportService resumeImportService,
        IProfileAssetService profileAssets,
        [FromForm] IFormFile? file,
        CancellationToken cancellationToken)
    {
        if (file is null)
        {
            return Results.BadRequest(new { error = "Select a resume file to import." });
        }

        var userId = user.GetUserId();
        var account = await db.Users.FirstOrDefaultAsync(x => x.Id == userId && x.IsActive, cancellationToken);
        if (account is null)
        {
            return Results.NotFound(new { error = "User account not found." });
        }

        var profile = await EnsureProfileAsync(db, userId, cancellationToken);

        try
        {
            var importResult = await resumeImportService.ParseAsync(file, cancellationToken);
            ProfileDocument.ApplyImportedData(account, profile, importResult);
            var assetResult = await profileAssets.SaveImportedResumeAsync(userId, file, cancellationToken);
            db.WorkflowEvents.Add(new WorkflowEvent
            {
                UserId = userId,
                EventType = "profile.resume_imported",
                PayloadJson = "{}"
            });

            await db.SaveChangesAsync(cancellationToken);
            var response = ProfileApiMapping.ToResponse(account, profile);
            response = response with
            {
                ImportedResumeProcessor = importResult.ImportProcessor,
                ImportedResumeSummary = BuildResumeImportSummary(importResult.ImportSummary, assetResult.Warnings),
                ImportedResumePreviewUrl = assetResult.HasPreview ? "/api/v2/profile/imported-resume/preview" : null,
                ImportedResumeDownloadUrl = "/api/v2/profile/imported-resume"
            };
            return Results.Ok(new ProfileImportResponse
            {
                Profile = response,
                Warnings = importResult.Warnings.Concat(assetResult.Warnings).ToArray()
            });
        }
        catch (InvalidOperationException ex)
        {
            return Results.BadRequest(new { error = ex.Message });
        }
    }

    private static async Task<UserProfile> EnsureProfileAsync(ApplyDbContext db, Guid userId, CancellationToken cancellationToken)
    {
        var profile = await db.Profiles.FirstOrDefaultAsync(x => x.UserId == userId, cancellationToken);
        if (profile is not null)
        {
            return profile;
        }

        profile = new UserProfile { UserId = userId };
        db.Profiles.Add(profile);
        return profile;
    }

    private static string BuildResumeImportSummary(string importSummary, IReadOnlyList<string> warnings)
    {
        var firstWarning = warnings.FirstOrDefault();
        return string.IsNullOrWhiteSpace(firstWarning)
            ? importSummary
            : $"{importSummary} {firstWarning}";
    }

    private static async Task<IResult> UploadProfileSectionDocument(
        string section,
        ClaimsPrincipal user,
        ApplyDbContext db,
        IProfileAssetService profileAssets,
        IFormFile? file,
        CancellationToken cancellationToken)
    {
        if (file is null)
        {
            return Results.BadRequest(new { error = "Select a file to upload." });
        }

        var key = NormalizeProfileSectionKey(section);
        if (key is null)
        {
            return Results.BadRequest(new { error = "Unsupported document section." });
        }

        var userId = user.GetUserId();
        var account = await db.Users.FirstOrDefaultAsync(x => x.Id == userId && x.IsActive, cancellationToken);
        if (account is null)
        {
            return Results.NotFound(new { error = "User account not found." });
        }

        var profile = await EnsureProfileAsync(db, userId, cancellationToken);

        try
        {
            var result = await profileAssets.SaveProfileSectionDocumentAsync(userId, key, file, cancellationToken);
            var map = new Dictionary<string, ProfileSectionDocumentEntry>(StringComparer.OrdinalIgnoreCase);
            foreach (var kv in ProfileDocument.ParseSectionDocuments(profile.SectionDocumentsJson))
            {
                map[kv.Key] = kv.Value;
            }

            map[key] = result.Entry;
            profile.SectionDocumentsJson = ProfileDocument.SerializeSectionDocuments(map);
            profile.UpdatedUtc = DateTime.UtcNow;

            db.WorkflowEvents.Add(new WorkflowEvent
            {
                UserId = userId,
                EventType = "profile.section_document_uploaded",
                PayloadJson = "{}"
            });

            await db.SaveChangesAsync(cancellationToken);
            var response = ProfileApiMapping.ToResponse(account, profile);
            return Results.Ok(new { profile = response, warnings = result.Warnings });
        }
        catch (InvalidOperationException ex)
        {
            return Results.BadRequest(new { error = ex.Message });
        }
    }

    private static async Task<IResult> GetProfileSectionDocumentFile(
        string section,
        ClaimsPrincipal user,
        ApplyDbContext db,
        IProfileAssetService profileAssets,
        CancellationToken cancellationToken)
    {
        var key = NormalizeProfileSectionKey(section);
        if (key is null)
        {
            return Results.NotFound();
        }

        var userId = user.GetUserId();
        var profile = await db.Profiles.AsNoTracking().FirstOrDefaultAsync(x => x.UserId == userId, cancellationToken);
        if (profile is null)
        {
            return Results.NotFound();
        }

        var map = ProfileDocument.ParseSectionDocuments(profile.SectionDocumentsJson);
        if (!map.TryGetValue(key, out var entry))
        {
            return Results.NotFound();
        }

        var asset = await profileAssets.TryReadProfileSectionDocumentAsync(userId, key, entry, cancellationToken);
        if (asset is null)
        {
            return Results.NotFound();
        }

        return Results.File(asset.Bytes, asset.ContentType, asset.FileName);
    }

    private static async Task<IResult> GetProfileSectionDocumentPreview(
        string section,
        ClaimsPrincipal user,
        ApplyDbContext db,
        IProfileAssetService profileAssets,
        CancellationToken cancellationToken)
    {
        var key = NormalizeProfileSectionKey(section);
        if (key is null)
        {
            return Results.NotFound();
        }

        var userId = user.GetUserId();
        var profile = await db.Profiles.AsNoTracking().FirstOrDefaultAsync(x => x.UserId == userId, cancellationToken);
        if (profile is null)
        {
            return Results.NotFound();
        }

        var map = ProfileDocument.ParseSectionDocuments(profile.SectionDocumentsJson);
        if (!map.TryGetValue(key, out var entry))
        {
            return Results.NotFound();
        }

        var asset = await profileAssets.TryReadProfileSectionDocumentPreviewAsync(userId, key, entry, cancellationToken);
        if (asset is null)
        {
            return Results.NotFound();
        }

        return Results.File(asset.Bytes, asset.ContentType, asset.FileName);
    }

    private static async Task<IResult> DeleteProfileSectionDocument(
        string section,
        ClaimsPrincipal user,
        ApplyDbContext db,
        IProfileAssetService profileAssets,
        CancellationToken cancellationToken)
    {
        var key = NormalizeProfileSectionKey(section);
        if (key is null)
        {
            return Results.BadRequest(new { error = "Unsupported document section." });
        }

        var userId = user.GetUserId();
        var account = await db.Users.FirstOrDefaultAsync(x => x.Id == userId && x.IsActive, cancellationToken);
        if (account is null)
        {
            return Results.NotFound(new { error = "User account not found." });
        }

        var profile = await db.Profiles.FirstOrDefaultAsync(x => x.UserId == userId, cancellationToken);
        if (profile is null)
        {
            return Results.Ok(ProfileApiMapping.ToResponse(account, profile));
        }

        var map = new Dictionary<string, ProfileSectionDocumentEntry>(StringComparer.OrdinalIgnoreCase);
        foreach (var kv in ProfileDocument.ParseSectionDocuments(profile.SectionDocumentsJson))
        {
            map[kv.Key] = kv.Value;
        }

        map.Remove(key);
        profile.SectionDocumentsJson = map.Count == 0 ? "{}" : ProfileDocument.SerializeSectionDocuments(map);
        profile.UpdatedUtc = DateTime.UtcNow;

        await profileAssets.DeleteProfileSectionDocumentFilesAsync(userId, key, cancellationToken);

        db.WorkflowEvents.Add(new WorkflowEvent
        {
            UserId = userId,
            EventType = "profile.section_document_deleted",
            PayloadJson = "{}"
        });

        await db.SaveChangesAsync(cancellationToken);
        return Results.Ok(ProfileApiMapping.ToResponse(account, profile));
    }

    private static string? NormalizeProfileSectionKey(string section)
    {
        if (string.Equals(section, "bio", StringComparison.OrdinalIgnoreCase))
        {
            return "bio";
        }

        if (string.Equals(section, "experience", StringComparison.OrdinalIgnoreCase))
        {
            return "experience";
        }

        return null;
    }
}
