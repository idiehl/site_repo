using Atlas.Apply.Domain;
using Atlas.Apply.Features.Profile;

namespace Atlas.Apply.Api;

public sealed class ProfileEditorRequest
{
    public string? Email { get; set; }
    public string? DisplayName { get; set; }
    public string? Headline { get; set; }
    public string? Summary { get; set; }
    public string? Location { get; set; }
    public string? PhoneNumber { get; set; }
    public string? LinkedInUrl { get; set; }
    public string? XUrl { get; set; }
    public string? InstagramUrl { get; set; }
    public string? GithubUrl { get; set; }
    public string? PortfolioUrl { get; set; }
    public string? CurrentRoleTitle { get; set; }
    public string? CurrentCompany { get; set; }
    public IReadOnlyList<string> Skills { get; set; } = [];
    public IReadOnlyList<ProfileExperienceEntry> Experience { get; set; } = [];
    public IReadOnlyList<ProfileEducationEntry> Education { get; set; } = [];
    public IReadOnlyList<ProfileProjectEntry> Projects { get; set; } = [];
    public IReadOnlyList<ProfileCertificationEntry> Certifications { get; set; } = [];
    public ProfilePreferences Preferences { get; set; } = new();
}

public sealed record ProfileEditorResponse
{
    public Guid UserId { get; init; }
    public string? Email { get; init; }
    public string? DisplayName { get; init; }
    public string? Headline { get; init; }
    public string? Summary { get; init; }
    public string? Location { get; init; }
    public string? PhoneNumber { get; init; }
    public string? LinkedInUrl { get; init; }
    public string? XUrl { get; init; }
    public string? InstagramUrl { get; init; }
    public string? GithubUrl { get; init; }
    public string? PortfolioUrl { get; init; }
    public string? CurrentRoleTitle { get; init; }
    public string? CurrentCompany { get; init; }
    public IReadOnlyList<string> Skills { get; init; } = [];
    public IReadOnlyList<ProfileExperienceEntry> Experience { get; init; } = [];
    public IReadOnlyList<ProfileEducationEntry> Education { get; init; } = [];
    public IReadOnlyList<ProfileProjectEntry> Projects { get; init; } = [];
    public IReadOnlyList<ProfileCertificationEntry> Certifications { get; init; } = [];
    public ProfilePreferences Preferences { get; init; } = new();
    public bool HasProfileImage { get; init; }
    public string? ProfileImageUrl { get; init; }
    public string? ProfileImageFileName { get; init; }
    public bool HasImportedResume { get; init; }
    public string? ImportedResumeFileName { get; init; }
    public string? ImportedResumePreview { get; init; }
    public DateTime? ImportedResumeUtc { get; init; }
    public string? ImportedResumeDownloadUrl { get; init; }
    public string? ImportedResumePreviewUrl { get; init; }
    public string? ImportedResumeProcessor { get; init; }
    public string? ImportedResumeSummary { get; init; }
    public bool HasProfileData { get; init; }
    public ProfileSectionDocumentView? SectionDocumentBio { get; init; }
    public ProfileSectionDocumentView? SectionDocumentExperience { get; init; }
}

public sealed record ProfileSectionDocumentView
{
    public bool HasDocument { get; init; }
    public string? FileName { get; init; }
    public DateTime? UploadedUtc { get; init; }
    public string? DownloadUrl { get; init; }
    public string? PreviewUrl { get; init; }
}

public sealed class ProfileImportResponse
{
    public ProfileEditorResponse Profile { get; init; } = new();
    public IReadOnlyList<string> Warnings { get; init; } = [];
}

public sealed class LinkedInImportRequest
{
    public string? LinkedInUrl { get; set; }
    public string? ProfileText { get; set; }
}

internal static class ProfileApiMapping
{
    public static ProfileEditorResponse ToResponse(UserAccount account, UserProfile? profile)
    {
        var skills = ProfileDocument.ParseSkills(profile?.SkillsJson);
        var experience = ProfileDocument.NormalizeExperienceEntries(ProfileDocument.ParseExperience(profile?.ExperienceJson), skills);
        var education = ProfileDocument.ParseEducation(profile?.EducationJson);
        var projects = ProfileDocument.ParseProjects(profile?.ProjectsJson);
        var certifications = ProfileDocument.ParseCertifications(profile?.CertificationsJson);
        var preferences = ProfileDocument.ParsePreferences(profile?.PreferencesJson);
        var updatedTicks = profile?.UpdatedUtc.Ticks ?? 0;
        var currentExperience = experience.FirstOrDefault(x => x.IsCurrent) ?? experience.FirstOrDefault();
        var normalizedLocation = ProfileDocument.NormalizeLocationValue(profile?.Location)
            ?? ProfileDocument.FindLocationInText(profile?.ImportedResumeText);

        return new ProfileEditorResponse
        {
            UserId = account.Id,
            Email = account.Email,
            DisplayName = account.DisplayName,
            Headline = profile?.Headline,
            Summary = profile?.Summary,
            Location = normalizedLocation,
            PhoneNumber = profile?.PhoneNumber,
            LinkedInUrl = profile?.LinkedInUrl,
            XUrl = preferences.XUrl,
            InstagramUrl = preferences.InstagramUrl,
            GithubUrl = profile?.GithubUrl,
            PortfolioUrl = profile?.PortfolioUrl,
            CurrentRoleTitle = preferences.CurrentRoleTitle ?? currentExperience?.RoleTitle,
            CurrentCompany = preferences.CurrentCompany ?? currentExperience?.Company,
            Skills = skills,
            Experience = experience,
            Education = education,
            Projects = projects,
            Certifications = certifications,
            Preferences = preferences,
            HasProfileImage = !string.IsNullOrWhiteSpace(profile?.ProfileImagePath),
            ProfileImageUrl = string.IsNullOrWhiteSpace(profile?.ProfileImagePath)
                ? null
                : $"/api/v2/profile/image?v={updatedTicks}",
            ProfileImageFileName = profile?.ProfileImageFileName,
            HasImportedResume = !string.IsNullOrWhiteSpace(profile?.ImportedResumeText),
            ImportedResumeFileName = profile?.ImportedResumeFileName,
            ImportedResumePreview = ProfileDocument.CreateResumePreview(profile?.ImportedResumeText),
            ImportedResumeUtc = profile?.ImportedResumeUtc,
            ImportedResumeDownloadUrl = !string.IsNullOrWhiteSpace(profile?.ImportedResumeFileName) ? "/api/v2/profile/imported-resume" : null,
            ImportedResumePreviewUrl = profile?.ImportedResumeContentType?.Equals("application/pdf", StringComparison.OrdinalIgnoreCase) == true
                ? "/api/v2/profile/imported-resume/preview"
                : null,
            ImportedResumeProcessor = null,
            ImportedResumeSummary = !string.IsNullOrWhiteSpace(profile?.ImportedResumeFileName)
                ? "Open the original resume or preview the first page below."
                : null,
            HasProfileData = ProfileDocument.HasMeaningfulProfileData(profile),
            SectionDocumentBio = BuildSectionDocumentView(profile, "bio", updatedTicks),
            SectionDocumentExperience = BuildSectionDocumentView(profile, "experience", updatedTicks)
        };
    }

    private static ProfileSectionDocumentView BuildSectionDocumentView(UserProfile? profile, string sectionKey, long versionTicks)
    {
        if (profile is null)
        {
            return new ProfileSectionDocumentView { HasDocument = false };
        }

        var documents = ProfileDocument.ParseSectionDocuments(profile.SectionDocumentsJson);
        if (!documents.TryGetValue(sectionKey, out var entry) || string.IsNullOrWhiteSpace(entry.FileExtension))
        {
            return new ProfileSectionDocumentView { HasDocument = false };
        }

        var fileName = string.IsNullOrWhiteSpace(entry.OriginalFileName)
            ? $"document{entry.FileExtension}"
            : entry.OriginalFileName;
        var isPdf = string.Equals(entry.ContentType, "application/pdf", StringComparison.OrdinalIgnoreCase);
        return new ProfileSectionDocumentView
        {
            HasDocument = true,
            FileName = fileName,
            UploadedUtc = entry.UploadedUtc,
            DownloadUrl = $"/api/v2/profile/section-documents/{sectionKey}/file?v={versionTicks}",
            PreviewUrl = isPdf ? $"/api/v2/profile/section-documents/{sectionKey}/preview?v={versionTicks}" : null
        };
    }

    public static void ApplyRequest(ProfileEditorRequest request, UserAccount account, UserProfile profile)
    {
        account.DisplayName = CoalesceDisplayName(request.DisplayName, account.DisplayName);
        account.UpdatedUtc = DateTime.UtcNow;

        profile.Headline = Clean(request.Headline, 256);
        profile.Summary = Clean(request.Summary);
        profile.Location = Clean(request.Location, 128);
        profile.PhoneNumber = Clean(request.PhoneNumber, 64);
        profile.LinkedInUrl = Clean(request.LinkedInUrl, 300);
        profile.GithubUrl = Clean(request.GithubUrl, 300);
        profile.PortfolioUrl = Clean(request.PortfolioUrl, 300);
        profile.SkillsJson = ProfileDocument.SerializeSkills(request.Skills);
        profile.ExperienceJson = ProfileDocument.SerializeExperience(request.Experience.Select(NormalizeExperience), request.Skills);
        profile.EducationJson = ProfileDocument.SerializeEducation(request.Education.Select(NormalizeEducation));
        profile.ProjectsJson = ProfileDocument.SerializeProjects(request.Projects.Select(NormalizeProject));
        profile.CertificationsJson = ProfileDocument.SerializeCertifications(request.Certifications.Select(NormalizeCertification));
        var preferences = request.Preferences ?? new ProfilePreferences();
        preferences.CurrentRoleTitle = request.CurrentRoleTitle ?? preferences.CurrentRoleTitle;
        preferences.CurrentCompany = request.CurrentCompany ?? preferences.CurrentCompany;
        preferences.XUrl = request.XUrl ?? preferences.XUrl;
        preferences.InstagramUrl = request.InstagramUrl ?? preferences.InstagramUrl;
        profile.PreferencesJson = ProfileDocument.SerializePreferences(NormalizePreferences(preferences));
        profile.UpdatedUtc = DateTime.UtcNow;
    }

    private static string CoalesceDisplayName(string? requested, string fallback)
    {
        var cleaned = Clean(requested, 128);
        return string.IsNullOrWhiteSpace(cleaned) ? fallback : cleaned;
    }

    private static ProfileExperienceEntry NormalizeExperience(ProfileExperienceEntry entry)
    {
        return new ProfileExperienceEntry
        {
            Id = string.IsNullOrWhiteSpace(entry.Id) ? Guid.NewGuid().ToString("N") : entry.Id,
            RoleTitle = Clean(entry.RoleTitle, 180),
            Company = Clean(entry.Company, 180),
            Location = Clean(entry.Location, 160),
            StartDate = Clean(entry.StartDate, 64),
            EndDate = Clean(entry.EndDate, 64),
            IsCurrent = entry.IsCurrent,
            Summary = ProfileDocument.NormalizeExperienceSummaryInput(entry.Summary),
            Highlights = NormalizeExperienceHighlightLines(entry.Highlights),
            Skills = ProfileDocument.NormalizeSkills(entry.Skills).Take(8).ToArray()
        };
    }

    private static IReadOnlyList<string> NormalizeExperienceHighlightLines(IEnumerable<string>? values)
    {
        return values?
            .Where(x => !string.IsNullOrWhiteSpace(x))
            .Select(x => x.Trim())
            .Distinct(StringComparer.OrdinalIgnoreCase)
            .Take(5)
            .ToArray() ?? [];
    }

    private static ProfileEducationEntry NormalizeEducation(ProfileEducationEntry entry)
    {
        return new ProfileEducationEntry
        {
            Id = string.IsNullOrWhiteSpace(entry.Id) ? Guid.NewGuid().ToString("N") : entry.Id,
            School = Clean(entry.School, 180),
            Degree = Clean(entry.Degree, 180),
            FieldOfStudy = Clean(entry.FieldOfStudy, 180),
            Location = Clean(entry.Location, 160),
            StartDate = Clean(entry.StartDate, 64),
            EndDate = Clean(entry.EndDate, 64),
            Summary = Clean(entry.Summary)
        };
    }

    private static ProfileProjectEntry NormalizeProject(ProfileProjectEntry entry)
    {
        return new ProfileProjectEntry
        {
            Id = string.IsNullOrWhiteSpace(entry.Id) ? Guid.NewGuid().ToString("N") : entry.Id,
            Name = Clean(entry.Name, 180),
            Role = Clean(entry.Role, 180),
            Url = Clean(entry.Url, 300),
            StartDate = Clean(entry.StartDate, 64),
            EndDate = Clean(entry.EndDate, 64),
            Summary = Clean(entry.Summary),
            Technologies = NormalizeLines(entry.Technologies),
            Highlights = NormalizeLines(entry.Highlights)
        };
    }

    private static ProfileCertificationEntry NormalizeCertification(ProfileCertificationEntry entry)
    {
        return new ProfileCertificationEntry
        {
            Id = string.IsNullOrWhiteSpace(entry.Id) ? Guid.NewGuid().ToString("N") : entry.Id,
            Name = Clean(entry.Name, 180),
            Issuer = Clean(entry.Issuer, 180),
            IssueDate = Clean(entry.IssueDate, 64),
            ExpirationDate = Clean(entry.ExpirationDate, 64),
            CredentialId = Clean(entry.CredentialId, 160),
            CredentialUrl = Clean(entry.CredentialUrl, 300),
            Summary = Clean(entry.Summary)
        };
    }

    private static ProfilePreferences NormalizePreferences(ProfilePreferences preferences)
    {
        return new ProfilePreferences
        {
            CurrentRoleTitle = Clean(preferences.CurrentRoleTitle, 180),
            CurrentCompany = Clean(preferences.CurrentCompany, 180),
            TargetRoles = Clean(preferences.TargetRoles),
            TargetIndustries = Clean(preferences.TargetIndustries),
            WorkModes = Clean(preferences.WorkModes),
            PreferredLocations = Clean(preferences.PreferredLocations),
            XUrl = Clean(preferences.XUrl, 300),
            InstagramUrl = Clean(preferences.InstagramUrl, 300),
            Notes = Clean(preferences.Notes)
        };
    }

    private static IReadOnlyList<string> NormalizeLines(IEnumerable<string>? values)
    {
        return values?
            .Where(x => !string.IsNullOrWhiteSpace(x))
            .Select(x => x.Trim())
            .Distinct(StringComparer.OrdinalIgnoreCase)
            .Take(12)
            .ToArray()
            ?? [];
    }

    private static string? Clean(string? value, int? maxLength = null)
    {
        if (string.IsNullOrWhiteSpace(value))
        {
            return null;
        }

        var trimmed = value.Trim();
        return maxLength.HasValue && trimmed.Length > maxLength.Value
            ? trimmed[..maxLength.Value]
            : trimmed;
    }
}
