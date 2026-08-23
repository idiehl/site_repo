using System.Net;
using System.Text.RegularExpressions;
using System.Xml.Linq;
using Atlas.Apply.Features.Jobs;

namespace Atlas.Apply.Services;

public interface IJobSummaryService
{
    Task<JobSummarySnapshot> BuildSummaryAsync(
        string roleTitle,
        string company,
        string? location,
        string? rawDescription,
        string? normalizedDescription,
        CancellationToken cancellationToken = default);
}

public class JobSummaryService(HttpClient httpClient) : IJobSummaryService
{
    public async Task<JobSummarySnapshot> BuildSummaryAsync(
        string roleTitle,
        string company,
        string? location,
        string? rawDescription,
        string? normalizedDescription,
        CancellationToken cancellationToken = default)
    {
        var sourceText = string.IsNullOrWhiteSpace(normalizedDescription)
            ? (rawDescription ?? string.Empty)
            : normalizedDescription!;

        var cleanText = CleanPostingText(sourceText);
        var titleLower = roleTitle.ToLowerInvariant();
        var publicSignals = await FetchRoleSignalsAsync(roleTitle, cancellationToken);
        var keySkills = ExtractKeySkills(cleanText, publicSignals, titleLower);
        var expectations = BuildExpectations(cleanText, keySkills, roleTitle, company);
        var workHours = InferWorkHours(cleanText, publicSignals);
        var environment = InferEnvironment(cleanText, publicSignals, location);
        var ratingLabel = InferJobRating(titleLower, cleanText, publicSignals);
        var ratingSummary = BuildJobRatingSummary(ratingLabel, publicSignals);
        var overview = BuildPlainLanguageOverview(roleTitle, company, location, expectations, keySkills, environment);

        return new JobSummarySnapshot
        {
            PlainLanguageOverview = overview,
            JobRatingLabel = ratingLabel,
            JobRatingSummary = ratingSummary,
            JobExpectations = expectations,
            KeySkills = keySkills,
            WorkHours = workHours,
            WorkplaceEnvironment = environment,
            GeneratedUtc = DateTime.UtcNow
        };
    }

    private async Task<IReadOnlyList<string>> FetchRoleSignalsAsync(string roleTitle, CancellationToken cancellationToken)
    {
        var query = $"{roleTitle} glassdoor work hours workplace environment expectations";
        var url = $"https://www.bing.com/search?format=rss&q={Uri.EscapeDataString(query)}";

        using var response = await httpClient.GetAsync(url, cancellationToken);
        if (!response.IsSuccessStatusCode)
        {
            return [];
        }

        await using var stream = await response.Content.ReadAsStreamAsync(cancellationToken);
        var doc = XDocument.Load(stream);

        return doc.Descendants("item")
            .Take(6)
            .SelectMany(item =>
            {
                var title = WebUtility.HtmlDecode(item.Element("title")?.Value ?? string.Empty);
                var description = WebUtility.HtmlDecode(item.Element("description")?.Value ?? string.Empty);
                return new[] { title, description };
            })
            .Where(x => !string.IsNullOrWhiteSpace(x))
            .ToArray();
    }

    private static string CleanPostingText(string raw)
    {
        if (string.IsNullOrWhiteSpace(raw))
        {
            return string.Empty;
        }

        var withoutHtml = Regex.Replace(raw, "<.*?>", " ");
        var normalized = Regex.Replace(withoutHtml, "\\s+", " ").Trim();
        return normalized;
    }

    private static IReadOnlyList<string> ExtractKeySkills(
        string cleanText,
        IReadOnlyList<string> publicSignals,
        string roleTitleLower)
    {
        var corpus = $"{cleanText} {string.Join(' ', publicSignals)} {roleTitleLower}".ToLowerInvariant();
        var candidates = new (string Skill, string[] Terms)[]
        {
            ("Communication", ["communication", "stakeholder", "collaboration"]),
            ("Problem Solving", ["problem", "debug", "troubleshoot"]),
            ("System Design", ["system design", "architecture", "distributed"]),
            ("Cloud Platforms", ["azure", "aws", "gcp", "cloud"]),
            ("Software Delivery", ["delivery", "shipping", "release", "production"]),
            ("Testing", ["testing", "quality", "automation", "qa"]),
            ("Data Work", ["sql", "data", "analytics", "warehouse"]),
            ("Frontend Development", ["react", "javascript", "css", "frontend"]),
            ("Backend Development", ["api", "backend", ".net", "c#", "java", "python"]),
            ("DevOps", ["devops", "ci/cd", "infrastructure", "observability"])
        };

        return candidates
            .Where(candidate => candidate.Terms.Any(term => corpus.Contains(term)))
            .Select(candidate => candidate.Skill)
            .Take(8)
            .DefaultIfEmpty("Adaptability")
            .ToArray();
    }

    private static IReadOnlyList<string> BuildExpectations(
        string cleanText,
        IReadOnlyList<string> skills,
        string roleTitle,
        string company)
    {
        var expectations = new List<string>
        {
            $"Own day-to-day work aligned to the {roleTitle} scope at {company}.",
            "Communicate clearly with teammates, stakeholders, and adjacent functions.",
            "Balance delivery speed with quality, maintainability, and follow-through."
        };

        if (skills.Contains("System Design"))
        {
            expectations.Add("Help shape technical decisions, not just complete assigned tasks.");
        }

        if (skills.Contains("Cloud Platforms") || skills.Contains("DevOps"))
        {
            expectations.Add("Be comfortable working with live systems, deployments, or infrastructure-related responsibilities.");
        }

        if (skills.Contains("Communication"))
        {
            expectations.Add("Explain progress, priorities, and trade-offs clearly to teammates and stakeholders.");
        }

        return expectations.Take(5).ToArray();
    }

    private static string InferWorkHours(string cleanText, IReadOnlyList<string> publicSignals)
    {
        var corpus = $"{cleanText} {string.Join(' ', publicSignals)}".ToLowerInvariant();

        if (corpus.Contains("weekend") || corpus.Contains("after hours") || corpus.Contains("on-call"))
        {
            return "Likely standard full-time hours with occasional off-hours, on-call, or deadline-driven spikes.";
        }

        if (corpus.Contains("flexible") || corpus.Contains("hybrid"))
        {
            return "Likely full-time with some scheduling flexibility depending on team rhythms.";
        }

        return "Likely standard full-time hours, though exact day-to-day intensity will depend on the team and release cadence.";
    }

    private static string InferEnvironment(string cleanText, IReadOnlyList<string> publicSignals, string? location)
    {
        var corpus = $"{cleanText} {string.Join(' ', publicSignals)} {location}".ToLowerInvariant();

        if (corpus.Contains("remote"))
        {
            return "Likely remote-friendly, with a strong emphasis on written communication and self-direction.";
        }

        if (corpus.Contains("hybrid"))
        {
            return "Likely hybrid, with a mix of in-person collaboration and independent focus time.";
        }

        if (corpus.Contains("cross-functional") || corpus.Contains("stakeholder"))
        {
            return "Collaborative team environment with regular cross-functional interaction and shared ownership.";
        }

        return "Likely a professional team setting that blends focused individual work with planning, reviews, and team collaboration.";
    }

    private static string InferJobRating(string roleTitleLower, string cleanText, IReadOnlyList<string> publicSignals)
    {
        var corpus = $"{roleTitleLower} {cleanText} {string.Join(' ', publicSignals)}".ToLowerInvariant();
        var score = 0;

        if (corpus.Contains("senior") || corpus.Contains("lead") || corpus.Contains("staff")) score += 2;
        if (corpus.Contains("architecture") || corpus.Contains("ownership") || corpus.Contains("strategy")) score += 2;
        if (corpus.Contains("stakeholder") || corpus.Contains("cross-functional")) score += 1;
        if (corpus.Contains("weekend") || corpus.Contains("on-call")) score += 1;

        return score switch
        {
            >= 5 => "Demanding",
            >= 3 => "Balanced",
            _ => "Standard"
        };
    }

    private static string BuildJobRatingSummary(string ratingLabel, IReadOnlyList<string> publicSignals)
    {
        return ratingLabel switch
        {
            "Demanding" => "This role looks like it comes with broader ownership, quicker decision-making, and a heavier workload than a narrowly scoped position.",
            "Balanced" => "This role appears to offer meaningful responsibility without reading like an always-on leadership position.",
            _ => "This role reads like a more straightforward opportunity with a conventional scope for the title."
        };
    }

    private static string BuildPlainLanguageOverview(
        string roleTitle,
        string company,
        string? location,
        IReadOnlyList<string> expectations,
        IReadOnlyList<string> skills,
        string environment)
    {
        var locationPart = string.IsNullOrWhiteSpace(location) ? string.Empty : $" The role is listed in {location}.";
        var expectationPart = expectations.Count == 0 ? string.Empty : $" In practice, the job looks focused on {expectations[0].TrimEnd('.')?.ToLowerInvariant()}.";
        var skillPart = skills.Count == 0 ? string.Empty : $" The strongest themes in the posting are {string.Join(", ", skills.Take(4)).ToLowerInvariant()}.";

        return $"{company} appears to be hiring for a {roleTitle} who can step into meaningful work, communicate well, and contribute reliably with the rest of the team.{locationPart}{expectationPart}{skillPart} {environment}";
    }
}
