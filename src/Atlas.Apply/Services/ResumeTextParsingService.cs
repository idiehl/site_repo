using System.Text.Json;
using System.Text.RegularExpressions;
using Atlas.Apply.Features.Profile;

namespace Atlas.Apply.Services;

public interface IResumeTextParsingService
{
    bool TryParseStructuredJson(string rawJson, out ImportedProfileData profile);
    ImportedProfileData ParseResumeText(string text, List<string> warnings);
}

public sealed class ResumeTextParsingService : IResumeTextParsingService
{
    private static readonly Regex EmailRegex = new(@"(?<email>[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,})", RegexOptions.IgnoreCase | RegexOptions.Compiled);
    private static readonly Regex PhoneRegex = new(@"(?<!\d)(?<phone>\+?\d[\d\-\.\(\) ]{7,}\d)", RegexOptions.Compiled);
    private static readonly Regex UrlRegex = new(@"(?<url>https?://[^\s]+|www\.[^\s]+)", RegexOptions.IgnoreCase | RegexOptions.Compiled);

    public bool TryParseStructuredJson(string rawJson, out ImportedProfileData profile)
    {
        try
        {
            profile = JsonSerializer.Deserialize<ImportedProfileData>(rawJson, ProfileDocument.JsonOptions) ?? new ImportedProfileData();
            return profile.Skills.Count > 0
                || profile.Experience.Count > 0
                || profile.Education.Count > 0
                || profile.Projects.Count > 0
                || profile.Certifications.Count > 0
                || !string.IsNullOrWhiteSpace(profile.DisplayName)
                || !string.IsNullOrWhiteSpace(profile.Summary);
        }
        catch
        {
            profile = new ImportedProfileData();
            return false;
        }
    }

    public ImportedProfileData ParseResumeText(string text, List<string> warnings)
    {
        var (headerLines, sections) = SplitSections(text);
        var email = EmailRegex.Match(text).Groups["email"].Value;
        var phone = PhoneRegex.Match(text).Groups["phone"].Value;
        var urls = UrlRegex.Matches(text)
            .Select(x => x.Groups["url"].Value.Trim().TrimEnd('.', ',', ';'))
            .Distinct(StringComparer.OrdinalIgnoreCase)
            .ToArray();

        var linkedInUrl = urls.FirstOrDefault(x => x.Contains("linkedin", StringComparison.OrdinalIgnoreCase));
        var githubUrl = urls.FirstOrDefault(x => x.Contains("github", StringComparison.OrdinalIgnoreCase));
        var portfolioUrl = urls.FirstOrDefault(x =>
            !x.Equals(linkedInUrl, StringComparison.OrdinalIgnoreCase)
            && !x.Equals(githubUrl, StringComparison.OrdinalIgnoreCase));

        var summary = BuildSummary(sections, headerLines);
        var experience = ParseExperienceSection(GetSection(sections, "experience"));
        if (experience.Count == 0)
        {
            experience = InferExperienceEntries(text);
        }

        var education = ParseEducationSection(GetSection(sections, "education"));
        if (education.Count == 0)
        {
            education = InferEducationEntries(text);
        }

        var projects = ParseProjectSection(GetSection(sections, "projects"));
        var certifications = ParseCertificationSection(GetSection(sections, "certifications"));
        var skills = ParseSkillsSection(GetSection(sections, "skills"));
        if (skills.Count == 0)
        {
            skills = InferSkills(text, experience, projects);
        }

        experience = ProfileDocument.NormalizeExperienceEntries(experience, skills);

        if (experience.Count == 0 && education.Count == 0)
        {
            warnings.Add("The importer did not find explicit experience or education headings, so some details may need to be entered manually.");
        }

        return new ImportedProfileData
        {
            DisplayName = BuildDisplayName(headerLines, email),
            Headline = BuildHeadline(headerLines, email, phone),
            Summary = summary,
            Location = BuildLocation(headerLines, text, email, phone, urls),
            PhoneNumber = string.IsNullOrWhiteSpace(phone) ? null : phone.Trim(),
            LinkedInUrl = linkedInUrl,
            GithubUrl = githubUrl,
            PortfolioUrl = portfolioUrl,
            Skills = skills,
            Experience = experience,
            Education = education,
            Projects = projects,
            Certifications = certifications
        };
    }

    private static (List<string> HeaderLines, Dictionary<string, string> Sections) SplitSections(string text)
    {
        var headerLines = new List<string>();
        var sections = new Dictionary<string, List<string>>(StringComparer.OrdinalIgnoreCase);
        string? currentSection = null;

        foreach (var rawLine in text.Split('\n'))
        {
            var trimmed = rawLine.Trim();
            if (IsSectionHeading(trimmed, out var heading))
            {
                currentSection = heading;
                if (!sections.ContainsKey(heading))
                {
                    sections[heading] = [];
                }

                continue;
            }

            if (currentSection is null)
            {
                headerLines.Add(trimmed);
                continue;
            }

            sections[currentSection].Add(trimmed);
        }

        return (headerLines, sections.ToDictionary(x => x.Key, x => string.Join("\n", x.Value), StringComparer.OrdinalIgnoreCase));
    }

    private static bool IsSectionHeading(string line, out string heading)
    {
        heading = string.Empty;
        if (string.IsNullOrWhiteSpace(line) || line.Length > 48)
        {
            return false;
        }

        var normalized = Regex.Replace(line.Trim().Trim(':').ToLowerInvariant(), @"[^a-z ]", " ");
        normalized = Regex.Replace(normalized, @"\s+", " ").Trim();

        heading = normalized switch
        {
            "summary" or "professional summary" or "profile" or "about" or "objective" => "summary",
            "experience" or "work experience" or "professional experience" or "employment history" or "career history" => "experience",
            "education" or "academic background" => "education",
            "projects" or "selected projects" or "personal projects" or "professional projects" => "projects",
            "certifications" or "certificates" or "licenses" or "licenses certifications" or "licenses and certifications" => "certifications",
            "skills" or "technical skills" or "core skills" or "core competencies" or "competencies" or "tooling" or "technologies" or "tech stack" => "skills",
            _ => string.Empty
        };

        return !string.IsNullOrWhiteSpace(heading);
    }

    private static string GetSection(IReadOnlyDictionary<string, string> sections, string key)
    {
        return sections.TryGetValue(key, out var value) ? value : string.Empty;
    }

    private static string? BuildDisplayName(IEnumerable<string> headerLines, string email)
    {
        foreach (var line in headerLines)
        {
            if (string.IsNullOrWhiteSpace(line) || line.Contains('@') || LooksLikeContactLine(line))
            {
                continue;
            }

            return line.Trim(' ', '-', '|');
        }

        return string.IsNullOrWhiteSpace(email)
            ? null
            : email.Split('@')[0].Replace('.', ' ');
    }

    private static string? BuildHeadline(IEnumerable<string> headerLines, string email, string phone)
    {
        foreach (var line in headerLines.Skip(1))
        {
            if (string.IsNullOrWhiteSpace(line)
                || line.Contains(email, StringComparison.OrdinalIgnoreCase)
                || (!string.IsNullOrWhiteSpace(phone) && line.Contains(phone, StringComparison.OrdinalIgnoreCase))
                || LooksLikeContactLine(line))
            {
                continue;
            }

            return line.Trim();
        }

        return null;
    }

    private static string? BuildLocation(IEnumerable<string> headerLines, string fullText, string email, string phone, IEnumerable<string> urls)
    {
        foreach (var line in headerLines.Take(8))
        {
            if (string.IsNullOrWhiteSpace(line)
                || line.Contains(email, StringComparison.OrdinalIgnoreCase)
                || (!string.IsNullOrWhiteSpace(phone) && line.Contains(phone, StringComparison.OrdinalIgnoreCase))
                || urls.Any(url => line.Contains(url, StringComparison.OrdinalIgnoreCase)))
            {
                continue;
            }

            var normalizedLocation = ProfileDocument.NormalizeLocationValue(line);
            if (!string.IsNullOrWhiteSpace(normalizedLocation))
            {
                return normalizedLocation;
            }
        }

        return ProfileDocument.FindLocationInText(fullText);
    }

    private static string? BuildSummary(IReadOnlyDictionary<string, string> sections, IEnumerable<string> headerLines)
    {
        var summarySection = GetSection(sections, "summary");
        if (!string.IsNullOrWhiteSpace(summarySection))
        {
            return NormalizeParagraph(summarySection);
        }

        var fallbackLines = headerLines
            .Where(x => !string.IsNullOrWhiteSpace(x) && !LooksLikeContactLine(x))
            .Skip(2)
            .Take(3);
        return NormalizeParagraph(string.Join(" ", fallbackLines));
    }

    private static IReadOnlyList<string> ParseSkillsSection(string sectionText)
    {
        if (string.IsNullOrWhiteSpace(sectionText))
        {
            return [];
        }

        var directLines = sectionText
            .Split('\n', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries)
            .SelectMany(line =>
            {
                var extracted = ExtractInlineSkillLists(line).ToArray();
                return extracted.Length > 0 ? extracted : [CleanupBullet(line)];
            })
            .ToArray();

        return ProfileDocument.NormalizeSkills(directLines);
    }

    private static IReadOnlyList<ProfileExperienceEntry> ParseExperienceSection(string sectionText)
    {
        var results = new List<ProfileExperienceEntry>();
        foreach (var block in SplitBlocks(sectionText))
        {
            var lines = GetBlockLines(block);
            if (lines.Count == 0)
            {
                continue;
            }

            var entry = new ProfileExperienceEntry();
            ParseRoleAndCompany(lines[0], out var roleTitle, out var company);
            entry.RoleTitle = roleTitle;
            entry.Company = company;

            var detailIndex = 1;
            if (lines.Count > 1)
            {
                ParseMetaLine(lines[1], out var startDate, out var endDate, out var isCurrent, out var location);
                if (!string.IsNullOrWhiteSpace(startDate) || !string.IsNullOrWhiteSpace(location))
                {
                    entry.StartDate = startDate;
                    entry.EndDate = endDate;
                    entry.IsCurrent = isCurrent;
                    entry.Location = location;
                    detailIndex = 2;
                }
            }

            var detailLines = lines.Skip(detailIndex).ToList();
            var bulletLines = detailLines.Where(LooksLikeBulletLine).Select(CleanupBullet).ToArray();
            var proseLines = detailLines.Where(line => !LooksLikeBulletLine(line)).Select(CleanupBullet).ToArray();

            entry.Summary = proseLines.Length > 0
                ? NormalizeParagraph(string.Join(" ", proseLines.Take(3)))
                : null;
            entry.Highlights = bulletLines;

            results.Add(entry);
        }

        return results;
    }

    private static IReadOnlyList<ProfileEducationEntry> ParseEducationSection(string sectionText)
    {
        var results = new List<ProfileEducationEntry>();
        foreach (var block in SplitBlocks(sectionText))
        {
            var lines = GetBlockLines(block);
            if (lines.Count == 0)
            {
                continue;
            }

            var entry = new ProfileEducationEntry
            {
                School = lines[0]
            };

            var detailIndex = 1;
            if (lines.Count > 1)
            {
                if (LooksLikeMetaLine(lines[1]))
                {
                    ParseMetaLine(lines[1], out var startDate, out var endDate, out _, out var location);
                    entry.StartDate = startDate;
                    entry.EndDate = endDate;
                    entry.Location = location;
                    detailIndex = 2;
                }
                else
                {
                    entry.Degree = lines[1];
                    detailIndex = 2;
                }
            }

            if (lines.Count > detailIndex && string.IsNullOrWhiteSpace(entry.Degree))
            {
                entry.Degree = lines[detailIndex];
                detailIndex++;
            }

            if (!string.IsNullOrWhiteSpace(entry.Degree) && entry.Degree!.Contains(" in ", StringComparison.OrdinalIgnoreCase))
            {
                var pieces = entry.Degree.Split(" in ", 2, StringSplitOptions.TrimEntries);
                entry.Degree = pieces[0];
                entry.FieldOfStudy = pieces[1];
            }

            entry.Summary = NormalizeParagraph(string.Join(" ", lines.Skip(detailIndex)));
            results.Add(entry);
        }

        return results;
    }

    private static IReadOnlyList<ProfileProjectEntry> ParseProjectSection(string sectionText)
    {
        var results = new List<ProfileProjectEntry>();
        foreach (var block in SplitBlocks(sectionText))
        {
            var lines = GetBlockLines(block);
            if (lines.Count == 0)
            {
                continue;
            }

            var entry = new ProfileProjectEntry
            {
                Name = lines[0]
            };

            var detailIndex = 1;
            if (lines.Count > 1)
            {
                var url = UrlRegex.Match(lines[1]).Groups["url"].Value;
                if (!string.IsNullOrWhiteSpace(url))
                {
                    entry.Url = url;
                    detailIndex = 2;
                }
                else if (LooksLikeMetaLine(lines[1]))
                {
                    ParseMetaLine(lines[1], out var startDate, out var endDate, out _, out _);
                    entry.StartDate = startDate;
                    entry.EndDate = endDate;
                    detailIndex = 2;
                }
                else
                {
                    entry.Role = lines[1];
                    detailIndex = 2;
                }
            }

            var detailLines = lines.Skip(detailIndex).ToArray();
            entry.Technologies = detailLines
                .Where(line => line.StartsWith("Tech", StringComparison.OrdinalIgnoreCase) || line.StartsWith("Stack", StringComparison.OrdinalIgnoreCase))
                .SelectMany(line => line.Split(':', 2).Skip(1))
                .SelectMany(line => line.Split([',', '|', ';'], StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries))
                .ToArray();
            var highlightLines = detailLines.Where(LooksLikeBulletLine).Select(CleanupBullet).ToArray();
            var summaryLines = detailLines
                .Where(line => !LooksLikeBulletLine(line))
                .Where(line => !line.StartsWith("Tech", StringComparison.OrdinalIgnoreCase) && !line.StartsWith("Stack", StringComparison.OrdinalIgnoreCase))
                .ToArray();
            entry.Summary = NormalizeParagraph(string.Join(" ", summaryLines));
            entry.Highlights = highlightLines;
            results.Add(entry);
        }

        return results;
    }

    private static IReadOnlyList<ProfileCertificationEntry> ParseCertificationSection(string sectionText)
    {
        var results = new List<ProfileCertificationEntry>();
        foreach (var block in SplitBlocks(sectionText))
        {
            var lines = GetBlockLines(block);
            if (lines.Count == 0)
            {
                continue;
            }

            var entry = new ProfileCertificationEntry
            {
                Name = lines[0]
            };

            if (lines.Count > 1)
            {
                entry.Issuer = lines[1];
            }

            if (lines.Count > 2)
            {
                ParseMetaLine(lines[2], out var issueDate, out var expirationDate, out _, out _);
                entry.IssueDate = issueDate;
                entry.ExpirationDate = expirationDate;
            }

            entry.CredentialUrl = UrlRegex.Match(block).Groups["url"].Value;
            entry.Summary = NormalizeParagraph(string.Join(" ", lines.Skip(3)));
            results.Add(entry);
        }

        return results;
    }

    private static IReadOnlyList<string> InferSkills(
        string fullText,
        IReadOnlyList<ProfileExperienceEntry> experience,
        IReadOnlyList<ProfileProjectEntry> projects)
    {
        var candidates = new List<string>();

        foreach (var line in fullText.Split('\n', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries))
        {
            candidates.AddRange(ExtractInlineSkillLists(line));
        }

        foreach (var project in projects)
        {
            candidates.AddRange(project.Technologies);
        }

        foreach (var item in experience)
        {
            candidates.AddRange(item.Highlights
                .Where(x => x.Contains(':'))
                .SelectMany(ExtractInlineSkillLists));
            candidates.AddRange(ProfileDocument.InferExperienceSkills(item));
        }

        return ProfileDocument.NormalizeSkills(candidates);
    }

    private static IEnumerable<string> ExtractInlineSkillLists(string line)
    {
        if (string.IsNullOrWhiteSpace(line))
        {
            return [];
        }

        var cleaned = CleanupBullet(line);
        var lowered = cleaned.ToLowerInvariant();
        if (lowered.StartsWith("skills:") ||
            lowered.StartsWith("technical skills:") ||
            lowered.StartsWith("technologies:") ||
            lowered.StartsWith("tools:") ||
            lowered.StartsWith("tech stack:"))
        {
            var split = cleaned.Split(':', 2);
            return split.Length == 2
                ? split[1].Split([',', ';', '|', '\u2022'], StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries)
                : [];
        }

        if (cleaned.Count(c => c == ',' || c == ';' || c == '|') >= 2 && cleaned.Length < 180)
        {
            return cleaned.Split([',', ';', '|'], StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);
        }

        return [];
    }

    private static IReadOnlyList<ProfileExperienceEntry> InferExperienceEntries(string fullText)
    {
        var results = new List<ProfileExperienceEntry>();
        foreach (var block in SplitBlocks(fullText))
        {
            var lines = GetBlockLines(block);
            if (lines.Count < 2)
            {
                continue;
            }

            var hasDate = lines.Any(LooksLikeDateRange);
            if (!hasDate)
            {
                continue;
            }

            if (lines.Any(x => x.Contains("education", StringComparison.OrdinalIgnoreCase) || x.Contains("university", StringComparison.OrdinalIgnoreCase)))
            {
                continue;
            }

            var first = lines[0];
            var second = lines.Count > 1 ? lines[1] : string.Empty;
            var titleLike = !LooksLikeMetaLine(first);
            var companyLike = !string.IsNullOrWhiteSpace(second);
            if (!titleLike || !companyLike)
            {
                continue;
            }

            ParseRoleAndCompany(first, out var roleTitle, out var company);
            var entry = new ProfileExperienceEntry
            {
                RoleTitle = roleTitle,
                Company = company
            };

            foreach (var line in lines.Skip(1))
            {
                ParseMetaLine(line, out var startDate, out var endDate, out var isCurrent, out var location);
                if (!string.IsNullOrWhiteSpace(startDate) && string.IsNullOrWhiteSpace(entry.StartDate))
                {
                    entry.StartDate = startDate;
                    entry.EndDate = endDate;
                    entry.IsCurrent = isCurrent;
                    entry.Location ??= location;
                }
            }

            var details = lines.Skip(2).ToArray();
            entry.Summary = NormalizeParagraph(string.Join(" ", details.Where(x => !LooksLikeBulletLine(x)).Take(2)));
            entry.Highlights = details.Where(LooksLikeBulletLine).Select(CleanupBullet).ToArray();

            if (!string.IsNullOrWhiteSpace(entry.RoleTitle) || !string.IsNullOrWhiteSpace(entry.Company))
            {
                results.Add(entry);
            }
        }

        return results;
    }

    private static IReadOnlyList<ProfileEducationEntry> InferEducationEntries(string fullText)
    {
        var results = new List<ProfileEducationEntry>();
        foreach (var block in SplitBlocks(fullText))
        {
            var lines = GetBlockLines(block);
            if (lines.Count == 0)
            {
                continue;
            }

            var combined = string.Join(" ", lines).ToLowerInvariant();
            var looksAcademic = combined.Contains("university")
                || combined.Contains("college")
                || combined.Contains("bachelor")
                || combined.Contains("master")
                || combined.Contains("associate")
                || combined.Contains("phd")
                || combined.Contains("b.s.")
                || combined.Contains("m.s.");
            if (!looksAcademic)
            {
                continue;
            }

            var entry = new ProfileEducationEntry
            {
                School = lines[0]
            };

            if (lines.Count > 1)
            {
                entry.Degree = lines[1];
            }

            if (!string.IsNullOrWhiteSpace(entry.Degree) && entry.Degree!.Contains(" in ", StringComparison.OrdinalIgnoreCase))
            {
                var pieces = entry.Degree.Split(" in ", 2, StringSplitOptions.TrimEntries);
                entry.Degree = pieces[0];
                entry.FieldOfStudy = pieces[1];
            }

            foreach (var line in lines)
            {
                ParseMetaLine(line, out var startDate, out var endDate, out _, out var location);
                entry.StartDate ??= startDate;
                entry.EndDate ??= endDate;
                entry.Location ??= location;
            }

            entry.Summary = NormalizeParagraph(string.Join(" ", lines.Skip(2)));
            results.Add(entry);
        }

        return results;
    }

    private static void ParseRoleAndCompany(string line, out string? roleTitle, out string? company)
    {
        roleTitle = null;
        company = null;
        if (string.IsNullOrWhiteSpace(line))
        {
            return;
        }

        if (line.Contains(" at ", StringComparison.OrdinalIgnoreCase))
        {
            var parts = line.Split(" at ", 2, StringSplitOptions.TrimEntries);
            roleTitle = parts[0];
            company = parts[1];
            return;
        }

        if (line.Contains(" | ", StringComparison.Ordinal))
        {
            var parts = line.Split(" | ", 2, StringSplitOptions.TrimEntries);
            roleTitle = parts[0];
            company = parts[1];
            return;
        }

        if (line.Contains(" - ", StringComparison.Ordinal) && !LooksLikeMetaLine(line))
        {
            var parts = line.Split(" - ", 2, StringSplitOptions.TrimEntries);
            roleTitle = parts[0];
            company = parts[1];
            return;
        }

        roleTitle = line.Trim();
    }

    private static void ParseMetaLine(string line, out string? startDate, out string? endDate, out bool isCurrent, out string? location)
    {
        startDate = null;
        endDate = null;
        isCurrent = false;
        location = null;

        if (string.IsNullOrWhiteSpace(line))
        {
            return;
        }

        var parts = line.Split(['|', '\u2022'], StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);
        foreach (var part in parts)
        {
            if (LooksLikeDateRange(part))
            {
                ParseDateRange(part, out startDate, out endDate, out isCurrent);
                continue;
            }

            if (location is null)
            {
                location = part;
            }
        }

        if (startDate is null && LooksLikeDateRange(line))
        {
            ParseDateRange(line, out startDate, out endDate, out isCurrent);
        }
    }

    private static void ParseDateRange(string line, out string? startDate, out string? endDate, out bool isCurrent)
    {
        startDate = null;
        endDate = null;
        isCurrent = false;

        var separators = new[] { " - ", " – ", " — ", " to " };
        foreach (var separator in separators)
        {
            if (!line.Contains(separator, StringComparison.OrdinalIgnoreCase))
            {
                continue;
            }

            var parts = line.Split(separator, 2, StringSplitOptions.TrimEntries);
            startDate = parts[0];
            endDate = parts[1];
            isCurrent = parts[1].Contains("present", StringComparison.OrdinalIgnoreCase)
                || parts[1].Contains("current", StringComparison.OrdinalIgnoreCase);
            return;
        }

        startDate = line.Trim();
    }

    private static bool LooksLikeMetaLine(string line)
    {
        return LooksLikeDateRange(line) || line.Contains('|') || line.Contains('\u2022');
    }

    private static bool LooksLikeDateRange(string line)
    {
        return Regex.IsMatch(line, @"\b(19|20)\d{2}\b", RegexOptions.Compiled)
            || line.Contains("present", StringComparison.OrdinalIgnoreCase)
            || line.Contains("current", StringComparison.OrdinalIgnoreCase)
            || Regex.IsMatch(line, @"\b(jan|feb|mar|apr|may|jun|jul|aug|sep|sept|oct|nov|dec)\b", RegexOptions.IgnoreCase | RegexOptions.Compiled);
    }

    private static IReadOnlyList<string> SplitBlocks(string sectionText)
    {
        if (string.IsNullOrWhiteSpace(sectionText))
        {
            return [];
        }

        return Regex.Split(sectionText.Trim(), @"\n\s*\n")
            .Where(block => !string.IsNullOrWhiteSpace(block))
            .ToArray();
    }

    private static List<string> GetBlockLines(string block)
    {
        return block
            .Split('\n')
            .Select(line => line.Trim())
            .Where(line => !string.IsNullOrWhiteSpace(line))
            .ToList();
    }

    private static bool LooksLikeBulletLine(string line)
    {
        var trimmed = line.TrimStart();
        return trimmed.StartsWith("-", StringComparison.Ordinal)
            || trimmed.StartsWith("*", StringComparison.Ordinal)
            || trimmed.StartsWith("•", StringComparison.Ordinal)
            || Regex.IsMatch(trimmed, @"^\d+\.", RegexOptions.Compiled);
    }

    private static string CleanupBullet(string line)
    {
        var trimmed = line.Trim();
        trimmed = Regex.Replace(trimmed, @"^(\-|\*|•|\d+\.)\s*", string.Empty);
        return trimmed.Trim();
    }

    private static bool LooksLikeContactLine(string line)
    {
        return line.Contains('@')
            || UrlRegex.IsMatch(line)
            || PhoneRegex.IsMatch(line)
            || line.Contains("linkedin", StringComparison.OrdinalIgnoreCase)
            || line.Contains("github", StringComparison.OrdinalIgnoreCase);
    }

    private static string? NormalizeParagraph(string? text)
    {
        if (string.IsNullOrWhiteSpace(text))
        {
            return null;
        }

        var normalized = Regex.Replace(text, @"\s+", " ").Trim();
        return string.IsNullOrWhiteSpace(normalized) ? null : normalized;
    }
}
