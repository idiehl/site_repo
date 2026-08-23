using System.Text;
using Atlas.Apply.Domain;
using Atlas.Apply.Features.Jobs;
using Atlas.Apply.Features.Profile;
using Atlas.Apply.Services;
using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;

namespace Atlas.Apply.Api;

internal static class ResumeComposer
{
    public static string BuildResumeDraft(
        UserProfile? profile,
        Opportunity opportunity,
        string displayName,
        string[] fallbackSkills,
        string template,
        string quality,
        string? focusAreasCsv)
    {
        var focusAreas = ParseFocusAreas(focusAreasCsv);
        var skills = ResolveSkills(profile, fallbackSkills, quality);
        var experience = SelectExperience(profile, focusAreas, quality);
        var education = SelectEducation(profile, quality);
        var projects = SelectProjects(profile, focusAreas, quality);
        var certifications = SelectCertifications(profile, quality);
        var links = BuildLinks(profile);

        var summary = BuildSummary(profile, opportunity, focusAreas);
        var headline = string.IsNullOrWhiteSpace(profile?.Headline)
            ? $"Candidate for {opportunity.RoleTitle}"
            : profile!.Headline!;
        var location = profile?.Location ?? opportunity.Location ?? "Location flexible";
        var phone = profile?.PhoneNumber;

        var builder = new StringBuilder();
        builder.AppendLine(displayName);
        builder.AppendLine(headline);
        builder.AppendLine(location);
        if (!string.IsNullOrWhiteSpace(phone))
        {
            builder.AppendLine(phone);
        }

        builder.AppendLine();
        builder.AppendLine("Professional Summary");
        builder.AppendLine(summary);

        if (skills.Length > 0)
        {
            builder.AppendLine();
            builder.AppendLine("Core Skills");
            foreach (var skill in skills)
            {
                builder.AppendLine($"- {skill}");
            }
        }

        if (experience.Count > 0)
        {
            builder.AppendLine();
            builder.AppendLine("Experience");
            foreach (var item in experience)
            {
                builder.AppendLine($"{item.RoleTitle} | {item.Company}");
                builder.AppendLine(BuildDateLine(item.StartDate, item.EndDate, item.IsCurrent, item.Location));
                if (!string.IsNullOrWhiteSpace(item.Summary))
                {
                    builder.AppendLine(item.Summary);
                }

                foreach (var bullet in item.Highlights.Take(quality == "Premium" ? 5 : 4))
                {
                    builder.AppendLine($"- {bullet}");
                }

                builder.AppendLine();
            }
        }

        if (projects.Count > 0)
        {
            builder.AppendLine("Projects");
            foreach (var item in projects)
            {
                builder.AppendLine(string.IsNullOrWhiteSpace(item.Role)
                    ? item.Name ?? "Project"
                    : $"{item.Name} | {item.Role}");
                if (!string.IsNullOrWhiteSpace(item.Summary))
                {
                    builder.AppendLine(item.Summary);
                }

                if (item.Technologies.Count > 0)
                {
                    builder.AppendLine($"Tech: {string.Join(", ", item.Technologies)}");
                }

                foreach (var bullet in item.Highlights.Take(2))
                {
                    builder.AppendLine($"- {bullet}");
                }

                builder.AppendLine();
            }
        }

        if (education.Count > 0)
        {
            builder.AppendLine("Education");
            foreach (var item in education)
            {
                builder.AppendLine(BuildEducationTitle(item));
                var detailLine = BuildDateLine(item.StartDate, item.EndDate, false, item.Location);
                if (!string.IsNullOrWhiteSpace(detailLine))
                {
                    builder.AppendLine(detailLine);
                }

                if (!string.IsNullOrWhiteSpace(item.Summary))
                {
                    builder.AppendLine(item.Summary);
                }

                builder.AppendLine();
            }
        }

        if (certifications.Count > 0)
        {
            builder.AppendLine("Certifications");
            foreach (var item in certifications)
            {
                builder.AppendLine(BuildCertificationTitle(item));
                if (!string.IsNullOrWhiteSpace(item.Summary))
                {
                    builder.AppendLine(item.Summary);
                }
            }

            builder.AppendLine();
        }

        if (links.Count > 0)
        {
            builder.AppendLine("Links");
            foreach (var line in links)
            {
                builder.AppendLine($"- {line}");
            }
        }

        return builder.ToString().Trim();
    }

    public static byte[] BuildResumePdfBytes(
        string displayName,
        UserProfile? profile,
        Opportunity opportunity,
        string draft,
        string template,
        string quality,
        string[] skills,
        StoredProfileAsset? profileImage)
    {
        var accent = template switch
        {
            "Executive" => Colors.Blue.Darken3,
            "Modern" => Colors.Teal.Darken2,
            _ => Colors.Grey.Darken3
        };

        return Document.Create(container =>
        {
            container.Page(page =>
            {
                page.Margin(32);
                page.Size(PageSizes.Letter);
                page.DefaultTextStyle(x => x.FontSize(10).FontFamily("Arial"));
                page.Header().Row(row =>
                {
                    row.RelativeItem().Column(col =>
                    {
                        col.Item().Text(displayName).FontSize(22).SemiBold().FontColor(accent);
                        col.Item().Text($"Target role: {opportunity.RoleTitle}").FontSize(12);
                        if (!string.IsNullOrWhiteSpace(profile?.Location))
                        {
                            col.Item().Text(profile.Location).FontSize(10);
                        }
                    });

                    if (profileImage is not null && !template.Equals("Classic", StringComparison.OrdinalIgnoreCase))
                    {
                        row.ConstantItem(72).Height(72).Image(profileImage.Bytes).FitArea();
                    }
                });

                page.Content().PaddingVertical(14).Column(col =>
                {
                    col.Spacing(10);
                    col.Item().Text(draft).LineHeight(1.35f);
                });
            });
        }).GeneratePdf();
    }

    private static string BuildSummary(UserProfile? profile, Opportunity opportunity, IReadOnlyList<string> focusAreas)
    {
        var baseSummary = string.IsNullOrWhiteSpace(profile?.Summary)
            ? "Professional focused on reliable delivery, thoughtful collaboration, and practical problem solving."
            : profile!.Summary!;
        if (focusAreas.Count == 0)
        {
            return baseSummary;
        }

        return $"{baseSummary} Targeting {opportunity.RoleTitle} opportunities with emphasis on {string.Join(", ", focusAreas.Take(4))}.";
    }

    private static string[] ResolveSkills(UserProfile? profile, string[] fallbackSkills, string quality)
    {
        var profileSkills = ProfileDocument.ParseSkills(profile?.SkillsJson);
        if (profileSkills.Count == 0)
        {
            return fallbackSkills;
        }

        var limit = quality switch
        {
            "Premium" => 12,
            "Targeted" => 10,
            _ => 8
        };
        return profileSkills.Take(limit).ToArray();
    }

    private static IReadOnlyList<ProfileExperienceEntry> SelectExperience(UserProfile? profile, IReadOnlyList<string> focusAreas, string quality)
    {
        var profileSkills = ProfileDocument.ParseSkills(profile?.SkillsJson);
        var entries = ProfileDocument.NormalizeExperienceEntries(ProfileDocument.ParseExperience(profile?.ExperienceJson), profileSkills);
        return RankExperience(entries, focusAreas)
            .Take(quality == "Premium" ? 4 : 3)
            .ToArray();
    }

    private static IReadOnlyList<ProfileEducationEntry> SelectEducation(UserProfile? profile, string quality)
    {
        var entries = ProfileDocument.ParseEducation(profile?.EducationJson);
        return entries.Take(quality == "Premium" ? 2 : 1).ToArray();
    }

    private static IReadOnlyList<ProfileProjectEntry> SelectProjects(UserProfile? profile, IReadOnlyList<string> focusAreas, string quality)
    {
        var entries = ProfileDocument.ParseProjects(profile?.ProjectsJson);
        return RankProjects(entries, focusAreas)
            .Take(quality == "Premium" ? 3 : 2)
            .ToArray();
    }

    private static IReadOnlyList<ProfileCertificationEntry> SelectCertifications(UserProfile? profile, string quality)
    {
        var entries = ProfileDocument.ParseCertifications(profile?.CertificationsJson);
        return entries.Take(quality == "Premium" ? 3 : 2).ToArray();
    }

    private static IReadOnlyList<string> BuildLinks(UserProfile? profile)
    {
        var links = new List<string>();
        if (!string.IsNullOrWhiteSpace(profile?.LinkedInUrl))
        {
            links.Add($"LinkedIn: {profile.LinkedInUrl}");
        }

        if (!string.IsNullOrWhiteSpace(profile?.GithubUrl))
        {
            links.Add($"GitHub: {profile.GithubUrl}");
        }

        if (!string.IsNullOrWhiteSpace(profile?.PortfolioUrl))
        {
            links.Add($"Portfolio: {profile.PortfolioUrl}");
        }

        return links;
    }

    private static IReadOnlyList<string> ParseFocusAreas(string? focusAreasCsv)
    {
        if (string.IsNullOrWhiteSpace(focusAreasCsv))
        {
            return [];
        }

        return focusAreasCsv
            .Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries)
            .Where(x => !string.IsNullOrWhiteSpace(x))
            .Distinct(StringComparer.OrdinalIgnoreCase)
            .Take(8)
            .ToArray();
    }

    private static IEnumerable<ProfileExperienceEntry> RankExperience(IEnumerable<ProfileExperienceEntry> entries, IReadOnlyList<string> focusAreas)
    {
        return entries
            .OrderByDescending(x => x.IsCurrent)
            .ThenByDescending(x => ScoreText($"{x.RoleTitle} {x.Company} {x.Summary} {string.Join(' ', x.Highlights)} {string.Join(' ', x.Skills)}", focusAreas))
            .ThenByDescending(x => x.StartDate);
    }

    private static IEnumerable<ProfileProjectEntry> RankProjects(IEnumerable<ProfileProjectEntry> entries, IReadOnlyList<string> focusAreas)
    {
        return entries
            .OrderByDescending(x => ScoreText($"{x.Name} {x.Role} {x.Summary} {string.Join(' ', x.Technologies)} {string.Join(' ', x.Highlights)}", focusAreas))
            .ThenByDescending(x => x.StartDate);
    }

    private static int ScoreText(string? source, IReadOnlyList<string> focusAreas)
    {
        if (string.IsNullOrWhiteSpace(source) || focusAreas.Count == 0)
        {
            return 0;
        }

        var normalized = source.ToLowerInvariant();
        var score = 0;
        foreach (var focus in focusAreas)
        {
            if (normalized.Contains(focus.ToLowerInvariant(), StringComparison.Ordinal))
            {
                score++;
            }
        }

        return score;
    }

    private static string BuildDateLine(string? startDate, string? endDate, bool isCurrent, string? location)
    {
        var range = string.IsNullOrWhiteSpace(startDate) && string.IsNullOrWhiteSpace(endDate)
            ? null
            : $"{startDate ?? string.Empty} - {(isCurrent ? "Present" : endDate ?? string.Empty)}".Trim(' ', '-');
        if (string.IsNullOrWhiteSpace(range))
        {
            return location ?? string.Empty;
        }

        return string.IsNullOrWhiteSpace(location) ? range : $"{range} | {location}";
    }

    private static string BuildEducationTitle(ProfileEducationEntry entry)
    {
        var degreeParts = new List<string>();
        if (!string.IsNullOrWhiteSpace(entry.Degree))
        {
            degreeParts.Add(entry.Degree);
        }

        if (!string.IsNullOrWhiteSpace(entry.FieldOfStudy))
        {
            degreeParts.Add(entry.FieldOfStudy);
        }

        if (degreeParts.Count == 0)
        {
            return entry.School ?? "Education";
        }

        return string.IsNullOrWhiteSpace(entry.School)
            ? string.Join(", ", degreeParts)
            : $"{string.Join(", ", degreeParts)} | {entry.School}";
    }

    private static string BuildCertificationTitle(ProfileCertificationEntry entry)
    {
        var parts = new List<string>();
        if (!string.IsNullOrWhiteSpace(entry.Name))
        {
            parts.Add(entry.Name);
        }

        if (!string.IsNullOrWhiteSpace(entry.Issuer))
        {
            parts.Add(entry.Issuer);
        }

        if (!string.IsNullOrWhiteSpace(entry.IssueDate))
        {
            parts.Add(entry.IssueDate);
        }

        return parts.Count == 0 ? "Certification" : string.Join(" | ", parts);
    }
}
