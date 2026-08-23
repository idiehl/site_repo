using System.Text.Json;
using System.Text.Json.Serialization;
using System.Globalization;
using System.Text.RegularExpressions;
using Atlas.Apply.Domain;

namespace Atlas.Apply.Features.Profile;

internal static class ProfileDocument
{
    private static readonly Dictionary<string, string> StateAbbreviations = new(StringComparer.OrdinalIgnoreCase)
    {
        ["alabama"] = "AL",
        ["alaska"] = "AK",
        ["arizona"] = "AZ",
        ["arkansas"] = "AR",
        ["california"] = "CA",
        ["colorado"] = "CO",
        ["connecticut"] = "CT",
        ["delaware"] = "DE",
        ["florida"] = "FL",
        ["georgia"] = "GA",
        ["hawaii"] = "HI",
        ["idaho"] = "ID",
        ["illinois"] = "IL",
        ["indiana"] = "IN",
        ["iowa"] = "IA",
        ["kansas"] = "KS",
        ["kentucky"] = "KY",
        ["louisiana"] = "LA",
        ["maine"] = "ME",
        ["maryland"] = "MD",
        ["massachusetts"] = "MA",
        ["michigan"] = "MI",
        ["minnesota"] = "MN",
        ["mississippi"] = "MS",
        ["missouri"] = "MO",
        ["montana"] = "MT",
        ["nebraska"] = "NE",
        ["nevada"] = "NV",
        ["new hampshire"] = "NH",
        ["new jersey"] = "NJ",
        ["new mexico"] = "NM",
        ["new york"] = "NY",
        ["north carolina"] = "NC",
        ["north dakota"] = "ND",
        ["ohio"] = "OH",
        ["oklahoma"] = "OK",
        ["oregon"] = "OR",
        ["pennsylvania"] = "PA",
        ["rhode island"] = "RI",
        ["south carolina"] = "SC",
        ["south dakota"] = "SD",
        ["tennessee"] = "TN",
        ["texas"] = "TX",
        ["utah"] = "UT",
        ["vermont"] = "VT",
        ["virginia"] = "VA",
        ["washington"] = "WA",
        ["west virginia"] = "WV",
        ["wisconsin"] = "WI",
        ["wyoming"] = "WY",
        ["district of columbia"] = "DC"
    };

    public static readonly JsonSerializerOptions JsonOptions = new(JsonSerializerDefaults.Web)
    {
        DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull
    };

    public static string? NormalizeLocationValue(string? raw)
    {
        if (string.IsNullOrWhiteSpace(raw))
        {
            return null;
        }

        var line = raw.Trim();
        line = line.Replace("\r", " ", StringComparison.Ordinal).Replace("\n", " ", StringComparison.Ordinal);
        line = line.Replace("Location:", string.Empty, StringComparison.OrdinalIgnoreCase).Trim();
        line = line.Replace("Based in", string.Empty, StringComparison.OrdinalIgnoreCase).Trim();
        line = string.Join(" ", line.Split(' ', StringSplitOptions.RemoveEmptyEntries));

        if (line.Length > 80 ||
            line.Contains('@') ||
            line.Contains("http", StringComparison.OrdinalIgnoreCase) ||
            line.Contains("address", StringComparison.OrdinalIgnoreCase) ||
            line.Contains(':') ||
            line.Contains('.') ||
            line.Any(char.IsDigit))
        {
            return null;
        }

        var parts = line.Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);
        if (parts.Length < 2)
        {
            return null;
        }

        var city = parts[0].Trim();
        if (city.Split(' ', StringSplitOptions.RemoveEmptyEntries).Length > 4)
        {
            return null;
        }

        var stateToken = parts[1]
            .Split(' ', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries)
            .FirstOrDefault();
        if (string.IsNullOrWhiteSpace(stateToken))
        {
            return null;
        }

        var state = NormalizeStateToken(stateToken);
        if (state is null)
        {
            return null;
        }

        var titleCity = CultureInfo.InvariantCulture.TextInfo.ToTitleCase(city.ToLowerInvariant());
        return $"{titleCity}, {state}";
    }

    public static string? FindLocationInText(string? rawText)
    {
        if (string.IsNullOrWhiteSpace(rawText))
        {
            return null;
        }

        foreach (var line in rawText.Split(['\r', '\n'], StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries).Take(20))
        {
            var normalized = NormalizeLocationValue(line);
            if (!string.IsNullOrWhiteSpace(normalized))
            {
                return normalized;
            }
        }

        return null;
    }

    public static IReadOnlyList<string> ParseSkills(string? rawJson)
    {
        if (string.IsNullOrWhiteSpace(rawJson))
        {
            return [];
        }

        try
        {
            var values = JsonSerializer.Deserialize<List<string>>(rawJson, JsonOptions);
            return NormalizeSkills(values);
        }
        catch
        {
            return NormalizeSkills([rawJson]);
        }
    }

    public static string SerializeSkills(IEnumerable<string>? skills)
    {
        return JsonSerializer.Serialize(NormalizeSkills(skills), JsonOptions);
    }

    public static ProfilePreferences ParsePreferences(string? rawJson)
    {
        if (string.IsNullOrWhiteSpace(rawJson))
        {
            return new ProfilePreferences();
        }

        try
        {
            return JsonSerializer.Deserialize<ProfilePreferences>(rawJson, JsonOptions) ?? new ProfilePreferences();
        }
        catch
        {
            return new ProfilePreferences();
        }
    }

    public static string SerializePreferences(ProfilePreferences? preferences)
    {
        return JsonSerializer.Serialize(preferences ?? new ProfilePreferences(), JsonOptions);
    }

    public static IReadOnlyList<ProfileExperienceEntry> ParseExperience(string? rawJson)
    {
        return NormalizeExperienceEntries(ParseList<ProfileExperienceEntry>(rawJson));
    }

    public static string SerializeExperience(IEnumerable<ProfileExperienceEntry>? entries, IEnumerable<string>? profileSkills = null)
    {
        return SerializeList(NormalizeExperienceEntries(entries, profileSkills));
    }

    public static IReadOnlyList<ProfileEducationEntry> ParseEducation(string? rawJson)
    {
        return ParseList<ProfileEducationEntry>(rawJson);
    }

    public static string SerializeEducation(IEnumerable<ProfileEducationEntry>? entries)
    {
        return SerializeList((entries ?? []).Where(HasMeaningfulEducation));
    }

    public static IReadOnlyList<ProfileProjectEntry> ParseProjects(string? rawJson)
    {
        return ParseList<ProfileProjectEntry>(rawJson);
    }

    public static string SerializeProjects(IEnumerable<ProfileProjectEntry>? entries)
    {
        return SerializeList((entries ?? []).Where(HasMeaningfulProject));
    }

    public static IReadOnlyList<ProfileCertificationEntry> ParseCertifications(string? rawJson)
    {
        return ParseList<ProfileCertificationEntry>(rawJson);
    }

    public static string SerializeCertifications(IEnumerable<ProfileCertificationEntry>? entries)
    {
        return SerializeList((entries ?? []).Where(HasMeaningfulCertification));
    }

    public static bool HasMeaningfulProfileData(UserProfile? profile)
    {
        if (profile is null)
        {
            return false;
        }

        return !string.IsNullOrWhiteSpace(profile.Summary)
            || !string.IsNullOrWhiteSpace(profile.Headline)
            || ParseSkills(profile.SkillsJson).Count > 0
            || ParseExperience(profile.ExperienceJson).Count > 0
            || ParseEducation(profile.EducationJson).Count > 0
            || ParseProjects(profile.ProjectsJson).Count > 0
            || ParseCertifications(profile.CertificationsJson).Count > 0;
    }

    public static string? CreateResumePreview(string? rawText, int maxLength = 320)
    {
        if (string.IsNullOrWhiteSpace(rawText))
        {
            return null;
        }

        var flattened = rawText
            .Replace("\r", " ", StringComparison.Ordinal)
            .Replace("\n", " ", StringComparison.Ordinal)
            .Trim();
        if (flattened.Length <= maxLength)
        {
            return flattened;
        }

        return flattened[..maxLength].TrimEnd() + "...";
    }

    public static void ApplyImportedProfileData(
        UserAccount account,
        UserProfile profile,
        ImportedProfileData data)
    {
        var preferences = ParsePreferences(profile.PreferencesJson);

        if (!string.IsNullOrWhiteSpace(data.DisplayName))
        {
            account.DisplayName = data.DisplayName.Trim();
            account.UpdatedUtc = DateTime.UtcNow;
        }

        if (!string.IsNullOrWhiteSpace(data.Headline))
        {
            profile.Headline = data.Headline.Trim();
        }

        if (!string.IsNullOrWhiteSpace(data.Summary))
        {
            profile.Summary = data.Summary.Trim();
        }

        if (!string.IsNullOrWhiteSpace(data.Location))
        {
            var normalizedLocation = NormalizeLocationValue(data.Location);
            if (!string.IsNullOrWhiteSpace(normalizedLocation))
            {
                profile.Location = normalizedLocation;
            }
        }

        if (!string.IsNullOrWhiteSpace(data.PhoneNumber))
        {
            profile.PhoneNumber = data.PhoneNumber.Trim();
        }

        if (!string.IsNullOrWhiteSpace(data.LinkedInUrl))
        {
            profile.LinkedInUrl = data.LinkedInUrl.Trim();
        }

        if (!string.IsNullOrWhiteSpace(data.GithubUrl))
        {
            profile.GithubUrl = data.GithubUrl.Trim();
        }

        if (!string.IsNullOrWhiteSpace(data.PortfolioUrl))
        {
            profile.PortfolioUrl = data.PortfolioUrl.Trim();
        }

        if (data.Skills.Count > 0)
        {
            profile.SkillsJson = SerializeSkills(data.Skills);
        }

        if (data.Experience.Count > 0)
        {
            profile.ExperienceJson = SerializeExperience(data.Experience, data.Skills);
        }

        if (data.Education.Count > 0)
        {
            profile.EducationJson = SerializeEducation(data.Education);
        }

        if (data.Projects.Count > 0)
        {
            profile.ProjectsJson = SerializeProjects(data.Projects);
        }

        if (data.Certifications.Count > 0)
        {
            profile.CertificationsJson = SerializeCertifications(data.Certifications);
        }

        var primaryExperience = data.Experience.FirstOrDefault(x => x.IsCurrent) ?? data.Experience.FirstOrDefault();
        if (primaryExperience is not null)
        {
            preferences.CurrentRoleTitle = primaryExperience.RoleTitle ?? preferences.CurrentRoleTitle;
            preferences.CurrentCompany = primaryExperience.Company ?? preferences.CurrentCompany;
        }

        profile.PreferencesJson = SerializePreferences(preferences);

        profile.UpdatedUtc = DateTime.UtcNow;
    }

    public static void ApplyImportedData(
        UserAccount account,
        UserProfile profile,
        ResumeImportResult importResult)
    {
        ApplyImportedProfileData(account, profile, importResult.Profile);

        profile.ImportedResumeFileName = importResult.FileName;
        profile.ImportedResumeContentType = importResult.ContentType;
        profile.ImportedResumeText = importResult.ExtractedText;
        profile.ImportedResumeUtc = DateTime.UtcNow;
    }

    public static IReadOnlyList<string> NormalizeSkills(IEnumerable<string>? rawSkills)
    {
        var values = rawSkills ?? [];
        return values
            .SelectMany(SplitSkillLine)
            .Where(x => !string.IsNullOrWhiteSpace(x))
            .Select(x => x.Trim())
            .Distinct(StringComparer.OrdinalIgnoreCase)
            .Take(32)
            .ToArray();
    }

    public static IReadOnlyList<ProfileExperienceEntry> NormalizeExperienceEntries(
        IEnumerable<ProfileExperienceEntry>? entries,
        IEnumerable<string>? profileSkills = null)
    {
        var normalizedProfileSkills = NormalizeSkills(profileSkills);
        return (entries ?? [])
            .Select(entry => NormalizeExperienceEntry(entry, normalizedProfileSkills))
            .Where(HasMeaningfulExperience)
            .ToArray();
    }

    public static IReadOnlyList<string> InferExperienceSkills(
        ProfileExperienceEntry? entry,
        IEnumerable<string>? profileSkills = null)
    {
        if (entry is null)
        {
            return [];
        }

        var candidates = new List<string>();
        candidates.AddRange(entry.Skills ?? []);

        var rawSearchText = BuildExperienceSearchText(entry.RoleTitle, entry.Company, entry.Summary, entry.Highlights);
        if (string.IsNullOrWhiteSpace(rawSearchText))
        {
            return NormalizeSkills(candidates).Take(8).ToArray();
        }

        var normalizedSearchText = NormalizeSkillSearchText(rawSearchText);
        var loweredRawSearchText = rawSearchText.ToLowerInvariant();

        foreach (var skill in NormalizeSkills(profileSkills))
        {
            if (SkillAppearsInText(skill, normalizedSearchText, loweredRawSearchText))
            {
                candidates.Add(skill);
            }
        }

        AddIfContains(candidates, normalizedSearchText, "AI Training", " ai training ", " reinforcement learning from human feedback ", " rlhf ");
        AddIfContains(candidates, normalizedSearchText, "LLMs", " llm ", " llms ", " large language model ", " large language models ", " generative ai ");
        if (ContainsAny(normalizedSearchText, " llm ", " llms ", " large language model ", " large language models ", " generative ai ")
            && ContainsAny(normalizedSearchText, " evaluate ", " evaluation ", " reviewing ", " review ", " ranking ", " rank ", " grading ", " scoring ", " score "))
        {
            candidates.Add("LLM Evaluation");
        }

        AddIfContains(candidates, normalizedSearchText, "Prompt Engineering", " prompt engineering ", " prompt design ", " prompt writing ", " prompt optimization ", " prompts ");
        AddIfContains(candidates, normalizedSearchText, "Data Annotation", " data annotation ", " annotation ", " annotations ", " annotate ", " annotating ", " labeling ", " labelling ");
        AddIfContains(candidates, normalizedSearchText, "Quality Assurance", " quality assurance ", " quality review ", " quality control ", " accuracy ", " validation ", " qa ");
        AddIfContains(candidates, normalizedSearchText, "Safety Review", " safety ", " trust and safety ", " policy compliance ", " moderation ");
        AddIfContains(candidates, normalizedSearchText, "Python", " python ");
        AddIfContains(candidates, normalizedSearchText, "SQL", " sql ");
        AddIfContains(candidates, normalizedSearchText, "Excel", " excel ", " spreadsheets ");
        AddIfContains(candidates, normalizedSearchText, "Data Analysis", " data analysis ", " analyze data ", " analysing data ", " analysis ");
        AddIfContains(candidates, normalizedSearchText, "Analytics", " analytics ", " reporting ", " dashboard ");
        AddIfContains(candidates, normalizedSearchText, "Machine Learning", " machine learning ", " ml ");
        AddIfContains(candidates, normalizedSearchText, "Research", " research ", " researcher ");
        AddIfContains(candidates, normalizedSearchText, "Automation", " automation ", " automate ", " automated ");
        AddIfContains(candidates, normalizedSearchText, "Testing", " testing ", " test ", " tests ", " qa ");
        AddIfContains(candidates, normalizedSearchText, "API Design", " api design ", " apis ", " api ", " endpoint ", " endpoints ", " rest api ", " rest apis ");
        AddIfContains(candidates, normalizedSearchText, "JavaScript", " javascript ");
        AddIfContains(candidates, normalizedSearchText, "TypeScript", " typescript ");
        AddIfContains(candidates, normalizedSearchText, "React", " react ");
        AddIfContains(candidates, normalizedSearchText, "Node.js", " node.js ", " nodejs ", " node js ");
        AddIfContains(candidates, normalizedSearchText, "HTML", " html ");
        AddIfContains(candidates, normalizedSearchText, "CSS", " css ");
        AddIfContains(candidates, normalizedSearchText, "Git", " git ", " version control ");
        AddIfContains(candidates, normalizedSearchText, "GitHub", " github ");
        AddIfContains(candidates, normalizedSearchText, "Docker", " docker ");
        AddIfContains(candidates, normalizedSearchText, "Kubernetes", " kubernetes ", " k8s ");
        AddIfContains(candidates, normalizedSearchText, "AWS", " aws ", " amazon web services ");
        AddIfContains(candidates, normalizedSearchText, "Azure", " azure ");
        AddIfContains(candidates, normalizedSearchText, "GCP", " gcp ", " google cloud ");
        AddIfContains(candidates, normalizedSearchText, "Power BI", " power bi ");
        AddIfContains(candidates, normalizedSearchText, "Tableau", " tableau ");
        AddIfContains(candidates, normalizedSearchText, "Figma", " figma ");
        AddIfContains(candidates, normalizedSearchText, "UX Research", " ux research ", " user research ");
        AddIfContains(candidates, normalizedSearchText, "Product Design", " product design ", " design systems ", " interface design ", " ui design ", " ux design ");
        AddIfContains(candidates, normalizedSearchText, "Project Management", " project management ", " program management ", " roadmap ", " planning ");
        AddIfContains(candidates, normalizedSearchText, "Stakeholder Management", " stakeholder ", " cross functional ", " cross-functional ");
        AddIfContains(candidates, normalizedSearchText, "Leadership", " leadership ", " led ", " managed ", " mentoring ", " mentored ");
        AddIfContains(candidates, normalizedSearchText, "Training & Enablement", " training ", " enablement ", " onboarding ", " coaching ");

        return NormalizeSkills(candidates).Take(8).ToArray();
    }

    private static IReadOnlyList<T> ParseList<T>(string? rawJson)
    {
        if (string.IsNullOrWhiteSpace(rawJson))
        {
            return [];
        }

        try
        {
            return JsonSerializer.Deserialize<List<T>>(rawJson, JsonOptions) ?? [];
        }
        catch
        {
            return [];
        }
    }

    private static string SerializeList<T>(IEnumerable<T> items)
    {
        return JsonSerializer.Serialize(items.ToArray(), JsonOptions);
    }

    private static ProfileExperienceEntry NormalizeExperienceEntry(
        ProfileExperienceEntry entry,
        IReadOnlyList<string> profileSkills)
    {
        var summary = NormalizeExperienceSummary(entry.Summary);
        var highlights = NormalizeExperienceHighlights(summary, entry.Highlights);
        if (!string.IsNullOrWhiteSpace(summary) && highlights.Contains(summary, StringComparer.OrdinalIgnoreCase))
        {
            summary = null;
        }

        var normalizedEntry = new ProfileExperienceEntry
        {
            Id = string.IsNullOrWhiteSpace(entry.Id) ? Guid.NewGuid().ToString("N") : entry.Id,
            RoleTitle = NormalizeExperienceText(entry.RoleTitle),
            Company = NormalizeExperienceText(entry.Company),
            Location = NormalizeExperienceText(entry.Location),
            StartDate = NormalizeExperienceText(entry.StartDate),
            EndDate = entry.IsCurrent ? null : NormalizeExperienceText(entry.EndDate),
            IsCurrent = entry.IsCurrent,
            Summary = summary,
            Highlights = highlights,
            Skills = NormalizeSkills(entry.Skills).Take(8).ToArray()
        };

        normalizedEntry.Skills = InferExperienceSkills(normalizedEntry, profileSkills);
        return normalizedEntry;
    }

    private static bool HasMeaningfulExperience(ProfileExperienceEntry entry)
    {
        return !string.IsNullOrWhiteSpace(entry.RoleTitle)
            || !string.IsNullOrWhiteSpace(entry.Company)
            || !string.IsNullOrWhiteSpace(entry.Location)
            || !string.IsNullOrWhiteSpace(entry.StartDate)
            || !string.IsNullOrWhiteSpace(entry.EndDate)
            || !string.IsNullOrWhiteSpace(entry.Summary)
            || entry.Highlights.Count > 0
            || entry.Skills.Count > 0;
    }

    private static bool HasMeaningfulEducation(ProfileEducationEntry entry)
    {
        return !string.IsNullOrWhiteSpace(entry.School)
            || !string.IsNullOrWhiteSpace(entry.Degree)
            || !string.IsNullOrWhiteSpace(entry.FieldOfStudy)
            || !string.IsNullOrWhiteSpace(entry.Location)
            || !string.IsNullOrWhiteSpace(entry.StartDate)
            || !string.IsNullOrWhiteSpace(entry.EndDate)
            || !string.IsNullOrWhiteSpace(entry.Summary);
    }

    private static bool HasMeaningfulProject(ProfileProjectEntry entry)
    {
        return !string.IsNullOrWhiteSpace(entry.Name)
            || !string.IsNullOrWhiteSpace(entry.Role)
            || !string.IsNullOrWhiteSpace(entry.Url)
            || !string.IsNullOrWhiteSpace(entry.StartDate)
            || !string.IsNullOrWhiteSpace(entry.EndDate)
            || !string.IsNullOrWhiteSpace(entry.Summary)
            || entry.Technologies.Count > 0
            || entry.Highlights.Count > 0;
    }

    private static bool HasMeaningfulCertification(ProfileCertificationEntry entry)
    {
        return !string.IsNullOrWhiteSpace(entry.Name)
            || !string.IsNullOrWhiteSpace(entry.Issuer)
            || !string.IsNullOrWhiteSpace(entry.IssueDate)
            || !string.IsNullOrWhiteSpace(entry.ExpirationDate)
            || !string.IsNullOrWhiteSpace(entry.CredentialId)
            || !string.IsNullOrWhiteSpace(entry.CredentialUrl)
            || !string.IsNullOrWhiteSpace(entry.Summary);
    }

    private static IEnumerable<string> SplitSkillLine(string? value)
    {
        if (string.IsNullOrWhiteSpace(value))
        {
            return [];
        }

        return value
            .Split([',', '\n', '\r', '|', ';', '\u2022'], StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries)
            .Select(x => x.TrimStart('-', '*', ' ').Trim());
    }

    private static string BuildExperienceSearchText(
        string? roleTitle,
        string? company,
        string? summary,
        IEnumerable<string>? highlights)
    {
        return string.Join(" ", new[]
        {
            roleTitle,
            company,
            summary,
            string.Join(" ", highlights ?? [])
        }.Where(x => !string.IsNullOrWhiteSpace(x)));
    }

    private static string NormalizeSkillSearchText(string text)
    {
        var normalized = Regex.Replace(text.ToLowerInvariant(), @"[^a-z0-9\+#\.]+", " ");
        normalized = Regex.Replace(normalized, @"\s+", " ").Trim();
        return $" {normalized} ";
    }

    private static bool SkillAppearsInText(string skill, string normalizedSearchText, string loweredRawSearchText)
    {
        if (string.IsNullOrWhiteSpace(skill))
        {
            return false;
        }

        var loweredSkill = skill.Trim().ToLowerInvariant();
        return loweredSkill switch
        {
            ".net" => loweredRawSearchText.Contains(".net", StringComparison.Ordinal) || normalizedSearchText.Contains(" dotnet ", StringComparison.Ordinal) || loweredRawSearchText.Contains("asp.net", StringComparison.Ordinal),
            "c#" => loweredRawSearchText.Contains("c#", StringComparison.Ordinal) || normalizedSearchText.Contains(" c sharp ", StringComparison.Ordinal),
            "node.js" => loweredRawSearchText.Contains("node.js", StringComparison.Ordinal) || normalizedSearchText.Contains(" nodejs ", StringComparison.Ordinal),
            "ai" => normalizedSearchText.Contains(" ai ", StringComparison.Ordinal) || normalizedSearchText.Contains(" artificial intelligence ", StringComparison.Ordinal),
            _ when loweredSkill.Length <= 3 => normalizedSearchText.Contains($" {loweredSkill} ", StringComparison.Ordinal),
            _ => loweredRawSearchText.Contains(loweredSkill, StringComparison.Ordinal)
        };
    }

    private static void AddIfContains(List<string> candidates, string normalizedSearchText, string skill, params string[] tokens)
    {
        if (ContainsAny(normalizedSearchText, tokens))
        {
            candidates.Add(skill);
        }
    }

    private static bool ContainsAny(string normalizedSearchText, params string[] tokens)
    {
        return tokens.Any(token => normalizedSearchText.Contains(token, StringComparison.Ordinal));
    }

    private static string? NormalizeExperienceSummary(string? value)
    {
        return NormalizeExperienceSummaryMultiline(value);
    }

    /// <summary>
    /// Normalizes role summary for persistence: up to 5 lines, newlines preserved, total length capped.
    /// </summary>
    public static string? NormalizeExperienceSummaryInput(string? value)
    {
        return NormalizeExperienceSummaryMultiline(value);
    }

    private static string? NormalizeExperienceSummaryMultiline(string? value)
    {
        if (string.IsNullOrWhiteSpace(value))
        {
            return null;
        }

        var normalized = value.Replace("\r\n", "\n", StringComparison.Ordinal).Replace('\r', '\n').Trim();
        var parts = normalized.Split('\n');
        var lines = new List<string>();
        foreach (var part in parts.Take(5))
        {
            lines.Add(Regex.Replace(part.Trim(), @"\s+", " "));
        }

        var text = string.Join("\n", lines).Trim();
        if (string.IsNullOrWhiteSpace(text))
        {
            return null;
        }

        return text.Length > 2000 ? text[..2000] : text;
    }

    private static string? NormalizeExperienceText(string? value)
    {
        if (string.IsNullOrWhiteSpace(value))
        {
            return null;
        }

        var normalized = value
            .Replace("\r", " ", StringComparison.Ordinal)
            .Replace("\n", " ", StringComparison.Ordinal)
            .Trim();
        normalized = Regex.Replace(normalized, @"\s+", " ");
        return string.IsNullOrWhiteSpace(normalized) ? null : normalized;
    }

    private static IReadOnlyList<string> NormalizeExperienceHighlights(string? summary, IEnumerable<string>? rawHighlights)
    {
        var highlights = new List<string>();
        foreach (var highlight in rawHighlights ?? [])
        {
            AddExperienceHighlightCandidates(highlights, highlight);
        }

        if (highlights.Count == 0)
        {
            AddExperienceHighlightCandidates(highlights, summary);
        }

        return highlights
            .Where(x => !string.IsNullOrWhiteSpace(x))
            .Select(x => x.Trim())
            .Distinct(StringComparer.OrdinalIgnoreCase)
            .Take(5)
            .ToArray();
    }

    private static void AddExperienceHighlightCandidates(List<string> highlights, string? source)
    {
        foreach (var candidate in SplitExperienceHighlightCandidates(source))
        {
            if (!string.IsNullOrWhiteSpace(candidate))
            {
                highlights.Add(candidate);
            }
        }
    }

    private static IEnumerable<string> SplitExperienceHighlightCandidates(string? source)
    {
        var normalized = NormalizeExperienceText(source);
        if (string.IsNullOrWhiteSpace(normalized))
        {
            return [];
        }

        var sentenceParts = Regex.Split(normalized, @"(?<=[.!?])\s+|;\s+")
            .Select(x => x.Trim())
            .Where(x => !string.IsNullOrWhiteSpace(x))
            .ToArray();
        if (sentenceParts.Length > 1)
        {
            return sentenceParts;
        }

        if (normalized.Contains(',', StringComparison.Ordinal) && normalized.Length > 120)
        {
            var clauseParts = normalized
                .Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries)
                .Where(x => x.Split(' ', StringSplitOptions.RemoveEmptyEntries).Length >= 4)
                .ToArray();
            if (clauseParts.Length > 1)
            {
                return clauseParts;
            }
        }

        return [normalized];
    }

    private static string? NormalizeStateToken(string token)
    {
        var cleaned = token.Trim().TrimEnd(',');
        if (cleaned.Length == 2 && cleaned.All(char.IsLetter))
        {
            return cleaned.ToUpperInvariant();
        }

        return StateAbbreviations.TryGetValue(cleaned, out var abbreviation)
            ? abbreviation
            : null;
    }

    public static IReadOnlyDictionary<string, ProfileSectionDocumentEntry> ParseSectionDocuments(string? json)
    {
        if (string.IsNullOrWhiteSpace(json) || json == "{}")
        {
            return new Dictionary<string, ProfileSectionDocumentEntry>(StringComparer.OrdinalIgnoreCase);
        }

        try
        {
            var dict = JsonSerializer.Deserialize<Dictionary<string, ProfileSectionDocumentEntry>>(json, JsonOptions);
            return dict ?? new Dictionary<string, ProfileSectionDocumentEntry>(StringComparer.OrdinalIgnoreCase);
        }
        catch
        {
            return new Dictionary<string, ProfileSectionDocumentEntry>(StringComparer.OrdinalIgnoreCase);
        }
    }

    public static string SerializeSectionDocuments(Dictionary<string, ProfileSectionDocumentEntry> items)
    {
        return JsonSerializer.Serialize(items, JsonOptions);
    }
}

public sealed record ProfileSectionDocumentEntry
{
    public string OriginalFileName { get; init; } = "";
    public string ContentType { get; init; } = "application/octet-stream";
    public string FileExtension { get; init; } = "";
    public DateTime UploadedUtc { get; init; }
}

public sealed class ProfilePreferences
{
    public string? CurrentRoleTitle { get; set; }
    public string? CurrentCompany { get; set; }
    public string? TargetRoles { get; set; }
    public string? TargetIndustries { get; set; }
    public string? WorkModes { get; set; }
    public string? PreferredLocations { get; set; }
    public string? XUrl { get; set; }
    public string? InstagramUrl { get; set; }
    public string? Notes { get; set; }
}

public sealed class ProfileExperienceEntry
{
    public string Id { get; set; } = Guid.NewGuid().ToString("N");
    public string? RoleTitle { get; set; }
    public string? Company { get; set; }
    public string? Location { get; set; }
    public string? StartDate { get; set; }
    public string? EndDate { get; set; }
    public bool IsCurrent { get; set; }
    public string? Summary { get; set; }
    public IReadOnlyList<string> Highlights { get; set; } = [];
    public IReadOnlyList<string> Skills { get; set; } = [];
}

public sealed class ProfileEducationEntry
{
    public string Id { get; set; } = Guid.NewGuid().ToString("N");
    public string? School { get; set; }
    public string? Degree { get; set; }
    public string? FieldOfStudy { get; set; }
    public string? Location { get; set; }
    public string? StartDate { get; set; }
    public string? EndDate { get; set; }
    public string? Summary { get; set; }
}

public sealed class ProfileProjectEntry
{
    public string Id { get; set; } = Guid.NewGuid().ToString("N");
    public string? Name { get; set; }
    public string? Role { get; set; }
    public string? Url { get; set; }
    public string? StartDate { get; set; }
    public string? EndDate { get; set; }
    public string? Summary { get; set; }
    public IReadOnlyList<string> Technologies { get; set; } = [];
    public IReadOnlyList<string> Highlights { get; set; } = [];
}

public sealed class ProfileCertificationEntry
{
    public string Id { get; set; } = Guid.NewGuid().ToString("N");
    public string? Name { get; set; }
    public string? Issuer { get; set; }
    public string? IssueDate { get; set; }
    public string? ExpirationDate { get; set; }
    public string? CredentialId { get; set; }
    public string? CredentialUrl { get; set; }
    public string? Summary { get; set; }
}

public sealed class ImportedProfileData
{
    public string? DisplayName { get; set; }
    public string? Headline { get; set; }
    public string? Summary { get; set; }
    public string? Location { get; set; }
    public string? PhoneNumber { get; set; }
    public string? LinkedInUrl { get; set; }
    public string? GithubUrl { get; set; }
    public string? PortfolioUrl { get; set; }
    public IReadOnlyList<string> Skills { get; set; } = [];
    public IReadOnlyList<ProfileExperienceEntry> Experience { get; set; } = [];
    public IReadOnlyList<ProfileEducationEntry> Education { get; set; } = [];
    public IReadOnlyList<ProfileProjectEntry> Projects { get; set; } = [];
    public IReadOnlyList<ProfileCertificationEntry> Certifications { get; set; } = [];
}

public sealed class ResumeImportResult
{
    public string FileName { get; init; } = string.Empty;
    public string ContentType { get; init; } = "application/octet-stream";
    public string ExtractedText { get; init; } = string.Empty;
    public ImportedProfileData Profile { get; init; } = new();
    public string ImportProcessor { get; init; } = "Built-in parser";
    public string ImportSummary { get; init; } = string.Empty;
    public IReadOnlyList<string> Warnings { get; init; } = [];
}
