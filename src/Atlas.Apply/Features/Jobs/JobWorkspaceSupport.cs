using System.Globalization;
using System.Text.Json.Nodes;

namespace Atlas.Apply.Features.Jobs;

internal static class JobWorkflow
{
    public static readonly string[] StatusOptions =
    [
        "Saved",
        "Applied",
        "Follow Up",
        "Interview Scheduled",
        "Second Interview",
        "Rejected",
        "Offer Made"
    ];

    public static string NormalizeStatus(string? requestedStatus)
    {
        if (string.IsNullOrWhiteSpace(requestedStatus))
        {
            return "Saved";
        }

        return requestedStatus.Trim().ToLowerInvariant() switch
        {
            "saved" => "Saved",
            "queued" => "Saved",
            "applied" => "Applied",
            "follow up" => "Follow Up",
            "follow-up" => "Follow Up",
            "followup" => "Follow Up",
            "interview" => "Interview Scheduled",
            "interview scheduled" => "Interview Scheduled",
            "second interview" => "Second Interview",
            "rejected" => "Rejected",
            "closed" => "Rejected",
            "offer" => "Offer Made",
            "offer made" => "Offer Made",
            _ => "Saved"
        };
    }
}

internal static class JobPresentation
{
    public static JobMetadataSnapshot ParseMetadata(string? metadataJson)
    {
        if (string.IsNullOrWhiteSpace(metadataJson))
        {
            return new JobMetadataSnapshot();
        }

        try
        {
            var root = JsonNode.Parse(metadataJson) as JsonObject;
            if (root is null)
            {
                return new JobMetadataSnapshot();
            }

            var companyProfile = root["companyProfile"] as JsonObject;
            var research = companyProfile?["research"] as JsonObject;
            var artifacts = root["artifacts"] as JsonObject;
            var resumeDraft = artifacts?["resumeDraft"] as JsonObject;
            var followUpEmail = artifacts?["followUpEmail"] as JsonObject;

            return new JobMetadataSnapshot
            {
                CompanyReport = ParseCompanyReport(root, companyProfile, research),
                JobSummary = ParseJobSummary(root["jobSummary"]),
                InterviewQuestions = ReadInterviewQuestions(root["interviewQuestions"]),
                ResumeDraft = ReadString(resumeDraft?["content"]),
                FollowUpEmailSubject = ReadString(followUpEmail?["subject"]),
                FollowUpEmailBody = ReadString(followUpEmail?["body"])
            };
        }
        catch
        {
            return new JobMetadataSnapshot();
        }
    }

    public static ReadyState EvaluateReadyState(
        string company,
        string roleTitle,
        string? descriptionNormalized,
        JobMetadataSnapshot metadata)
    {
        var hasCompany = !string.IsNullOrWhiteSpace(company) &&
                         !company.Equals("Unknown Company", StringComparison.OrdinalIgnoreCase);
        var hasRole = !string.IsNullOrWhiteSpace(roleTitle) &&
                      !roleTitle.Equals("Unspecified Role", StringComparison.OrdinalIgnoreCase);
        var hasDescription = !string.IsNullOrWhiteSpace(descriptionNormalized);
        var hasCompanyReport = metadata.CompanyReport.HasMeaningfulContent;

        if (hasCompany && hasRole && hasDescription && hasCompanyReport)
        {
            return new ReadyState(true, "Ready");
        }

        if (hasCompany || hasRole || hasDescription || hasCompanyReport)
        {
            return new ReadyState(false, "Needs Attention");
        }

        return new ReadyState(false, "Needs Details");
    }

    public static IReadOnlyList<string> ParseSkills(string? skillsJson)
    {
        if (string.IsNullOrWhiteSpace(skillsJson))
        {
            return [];
        }

        try
        {
            var node = JsonNode.Parse(skillsJson);
            if (node is not JsonArray array)
            {
                return [];
            }

            var skills = new List<string>();
            foreach (var item in array)
            {
                var value = item switch
                {
                    JsonValue => item?.ToString(),
                    JsonObject obj => ReadString(obj["name"]) ?? ReadString(obj["skill"]) ?? ReadString(obj["label"]),
                    _ => null
                };

                if (!string.IsNullOrWhiteSpace(value))
                {
                    skills.Add(value.Trim());
                }
            }

            return skills
                .Distinct(StringComparer.OrdinalIgnoreCase)
                .Take(16)
                .ToArray();
        }
        catch
        {
            return [];
        }
    }

    public static bool HasProfileData(string? summary, string? skillsJson)
    {
        return !string.IsNullOrWhiteSpace(summary) || ParseSkills(skillsJson).Count > 0;
    }

    public static JsonObject ParseMetadataObject(string? rawMetadata)
    {
        if (!string.IsNullOrWhiteSpace(rawMetadata))
        {
            try
            {
                var node = JsonNode.Parse(rawMetadata) as JsonObject;
                if (node is not null)
                {
                    return node;
                }
            }
            catch
            {
                // Ignore invalid metadata and rebuild.
            }
        }

        return new JsonObject();
    }

    public static string UpsertCompanyReport(string? metadataJson, CompanyReportSnapshot report)
    {
        var root = ParseMetadataObject(metadataJson);
        root["companyReport"] = new JsonObject
        {
            ["name"] = JsonValue.Create(report.Name),
            ["summary"] = JsonValue.Create(report.Summary),
            ["description"] = JsonValue.Create(report.Description),
            ["officialWebsiteUrl"] = JsonValue.Create(report.OfficialWebsiteUrl),
            ["companyPageUrl"] = JsonValue.Create(report.CompanyPageUrl),
            ["domain"] = JsonValue.Create(report.Domain),
            ["industry"] = JsonValue.Create(report.Industry),
            ["sizeBand"] = JsonValue.Create(report.SizeBand),
            ["foundedYear"] = JsonValue.Create(report.FoundedYear),
            ["employeeCount"] = JsonValue.Create(report.EmployeeCount),
            ["revenueDisplay"] = JsonValue.Create(report.RevenueDisplay),
            ["ticker"] = JsonValue.Create(report.Ticker),
            ["exchange"] = JsonValue.Create(report.Exchange),
            ["marketChartUrl"] = JsonValue.Create(report.MarketChartUrl),
            ["generatedUtc"] = JsonValue.Create(report.GeneratedUtc?.ToString("O")),
            ["recentNews"] = new JsonArray(report.RecentNews.Select(ToJsonNewsItem).ToArray())
        };

        var companyProfile = root["companyProfile"] as JsonObject ?? new JsonObject();
        if (!string.IsNullOrWhiteSpace(report.Summary))
        {
            companyProfile["summary"] = report.Summary;
        }

        if (!string.IsNullOrWhiteSpace(report.Domain))
        {
            companyProfile["domain"] = report.Domain;
        }

        root["companyProfile"] = companyProfile;
        return root.ToJsonString();
    }

    public static string UpsertJobSummary(string? metadataJson, JobSummarySnapshot summary)
    {
        var root = ParseMetadataObject(metadataJson);
        root["jobSummary"] = new JsonObject
        {
            ["plainLanguageOverview"] = JsonValue.Create(summary.PlainLanguageOverview),
            ["jobRatingLabel"] = JsonValue.Create(summary.JobRatingLabel),
            ["jobRatingSummary"] = JsonValue.Create(summary.JobRatingSummary),
            ["workHours"] = JsonValue.Create(summary.WorkHours),
            ["workplaceEnvironment"] = JsonValue.Create(summary.WorkplaceEnvironment),
            ["generatedUtc"] = JsonValue.Create(summary.GeneratedUtc?.ToString("O")),
            ["jobExpectations"] = new JsonArray(summary.JobExpectations.Select(x => (JsonNode?)JsonValue.Create(x)).ToArray()),
            ["keySkills"] = new JsonArray(summary.KeySkills.Select(x => (JsonNode?)JsonValue.Create(x)).ToArray())
        };
        return root.ToJsonString();
    }

    private static CompanyReportSnapshot ParseCompanyReport(
        JsonObject root,
        JsonObject? companyProfile,
        JsonObject? research)
    {
        var companyReport = root["companyReport"] as JsonObject;
        if (companyReport is not null)
        {
            return new CompanyReportSnapshot
            {
                Name = ReadString(companyReport["name"]),
                Summary = ReadString(companyReport["summary"]) ?? ReadString(companyProfile?["summary"]),
                Description = ReadString(companyReport["description"]),
                OfficialWebsiteUrl = ReadString(companyReport["officialWebsiteUrl"]),
                CompanyPageUrl = ReadString(companyReport["companyPageUrl"]) ?? ReadString(companyReport["officialWebsiteUrl"]),
                Domain = ReadString(companyReport["domain"]) ?? ReadString(companyProfile?["domain"]) ?? ReadString(research?["domain"]),
                Industry = ReadString(companyReport["industry"]) ?? ReadString(research?["industry"]),
                SizeBand = ReadString(companyReport["sizeBand"]) ?? ReadString(research?["sizeBand"]),
                FoundedYear = ReadInt(companyReport["foundedYear"]),
                EmployeeCount = ReadLong(companyReport["employeeCount"]),
                RevenueDisplay = ReadString(companyReport["revenueDisplay"]),
                Ticker = ReadString(companyReport["ticker"]),
                Exchange = ReadString(companyReport["exchange"]),
                MarketChartUrl = ReadString(companyReport["marketChartUrl"]),
                GeneratedUtc = ReadDateTime(companyReport["generatedUtc"]),
                RecentNews = ReadNews(companyReport["recentNews"])
            };
        }

        return new CompanyReportSnapshot
        {
            Summary = ReadString(companyProfile?["summary"]),
            Domain = ReadString(companyProfile?["domain"]) ?? ReadString(research?["domain"]),
            Industry = ReadString(research?["industry"]),
            SizeBand = ReadString(research?["sizeBand"]),
            GeneratedUtc = null,
            RecentNews = []
        };
    }

    private static JobSummarySnapshot ParseJobSummary(JsonNode? node)
    {
        if (node is not JsonObject summaryObj)
        {
            return new JobSummarySnapshot();
        }

        return new JobSummarySnapshot
        {
            PlainLanguageOverview = ReadString(summaryObj["plainLanguageOverview"]),
            JobRatingLabel = ReadString(summaryObj["jobRatingLabel"]),
            JobRatingSummary = ReadString(summaryObj["jobRatingSummary"]),
            WorkHours = ReadString(summaryObj["workHours"]),
            WorkplaceEnvironment = ReadString(summaryObj["workplaceEnvironment"]),
            GeneratedUtc = ReadDateTime(summaryObj["generatedUtc"]),
            JobExpectations = ReadStringArray(summaryObj["jobExpectations"]),
            KeySkills = ReadStringArray(summaryObj["keySkills"])
        };
    }

    private static JsonNode? ToJsonNewsItem(CompanyNewsItem item)
    {
        return new JsonObject
        {
            ["title"] = JsonValue.Create(item.Title),
            ["url"] = JsonValue.Create(item.Url),
            ["source"] = JsonValue.Create(item.Source),
            ["publishedUtc"] = JsonValue.Create(item.PublishedUtc?.ToString("O"))
        };
    }

    private static string? ReadString(JsonNode? node)
    {
        if (node is null)
        {
            return null;
        }

        return node switch
        {
            JsonValue => node.ToString(),
            _ => null
        };
    }

    private static int? ReadInt(JsonNode? node)
    {
        var raw = ReadString(node);
        if (int.TryParse(raw, NumberStyles.Integer, CultureInfo.InvariantCulture, out var value))
        {
            return value;
        }

        return null;
    }

    private static long? ReadLong(JsonNode? node)
    {
        var raw = ReadString(node);
        if (long.TryParse(raw, NumberStyles.Integer, CultureInfo.InvariantCulture, out var value))
        {
            return value;
        }

        return null;
    }

    private static DateTime? ReadDateTime(JsonNode? node)
    {
        var raw = ReadString(node);
        if (DateTime.TryParse(raw, CultureInfo.InvariantCulture, DateTimeStyles.AdjustToUniversal, out var value))
        {
            return value;
        }

        return null;
    }

    private static IReadOnlyList<string> ReadStringArray(JsonNode? node)
    {
        if (node is not JsonArray array)
        {
            return [];
        }

        return array
            .Select(ReadString)
            .Where(x => !string.IsNullOrWhiteSpace(x))
            .Select(x => x!.Trim())
            .ToArray();
    }

    private static IReadOnlyList<CompanyNewsItem> ReadNews(JsonNode? node)
    {
        if (node is not JsonArray array)
        {
            return [];
        }

        var items = new List<CompanyNewsItem>();
        foreach (var item in array.OfType<JsonObject>())
        {
            var title = ReadString(item["title"]);
            var url = ReadString(item["url"]);
            if (string.IsNullOrWhiteSpace(title) || string.IsNullOrWhiteSpace(url))
            {
                continue;
            }

            items.Add(new CompanyNewsItem(
                title.Trim(),
                url.Trim(),
                ReadString(item["source"]),
                ReadDateTime(item["publishedUtc"])));
        }

        return items;
    }

    private static IReadOnlyList<string> ReadInterviewQuestions(JsonNode? node)
    {
        if (node is JsonArray array)
        {
            return ReadStringArray(array);
        }

        if (node is JsonObject obj && obj["latest"] is JsonArray latest)
        {
            return ReadStringArray(latest);
        }

        return [];
    }
}

internal sealed class JobMetadataSnapshot
{
    public CompanyReportSnapshot CompanyReport { get; init; } = new();
    public JobSummarySnapshot JobSummary { get; init; } = new();
    public IReadOnlyList<string> InterviewQuestions { get; init; } = [];
    public string? ResumeDraft { get; init; }
    public string? FollowUpEmailSubject { get; init; }
    public string? FollowUpEmailBody { get; init; }
}

public sealed class JobSummarySnapshot
{
    public string? PlainLanguageOverview { get; init; }
    public string? JobRatingLabel { get; init; }
    public string? JobRatingSummary { get; init; }
    public IReadOnlyList<string> JobExpectations { get; init; } = [];
    public IReadOnlyList<string> KeySkills { get; init; } = [];
    public string? WorkHours { get; init; }
    public string? WorkplaceEnvironment { get; init; }
    public DateTime? GeneratedUtc { get; init; }

    public bool HasMeaningfulContent =>
        !string.IsNullOrWhiteSpace(PlainLanguageOverview) ||
        !string.IsNullOrWhiteSpace(JobRatingLabel) ||
        JobExpectations.Count > 0 ||
        KeySkills.Count > 0 ||
        !string.IsNullOrWhiteSpace(WorkHours) ||
        !string.IsNullOrWhiteSpace(WorkplaceEnvironment);
}

public sealed class CompanyReportSnapshot
{
    public string? Name { get; init; }
    public string? Summary { get; init; }
    public string? Description { get; init; }
    public string? OfficialWebsiteUrl { get; init; }
    public string? CompanyPageUrl { get; init; }
    public string? Domain { get; init; }
    public string? Industry { get; init; }
    public string? SizeBand { get; init; }
    public int? FoundedYear { get; init; }
    public long? EmployeeCount { get; init; }
    public string? RevenueDisplay { get; init; }
    public string? Ticker { get; init; }
    public string? Exchange { get; init; }
    public string? MarketChartUrl { get; init; }
    public DateTime? GeneratedUtc { get; init; }
    public IReadOnlyList<CompanyNewsItem> RecentNews { get; init; } = [];

    public bool HasMeaningfulContent =>
        !string.IsNullOrWhiteSpace(Summary) ||
        FoundedYear.HasValue ||
        EmployeeCount.HasValue ||
        !string.IsNullOrWhiteSpace(OfficialWebsiteUrl) ||
        !string.IsNullOrWhiteSpace(RevenueDisplay) ||
        RecentNews.Count > 0;

    public string EmployeeCountDisplay =>
        EmployeeCount.HasValue
            ? EmployeeCount.Value.ToString("N0", CultureInfo.InvariantCulture)
            : "Not available";
}

public sealed record CompanyNewsItem(string Title, string Url, string? Source, DateTime? PublishedUtc);

internal readonly record struct ReadyState(bool IsReady, string Label);
