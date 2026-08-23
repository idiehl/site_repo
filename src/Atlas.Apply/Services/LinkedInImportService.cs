using System.Net;
using System.Text.Json;
using System.Text.RegularExpressions;
using Atlas.Apply.Features.Profile;

namespace Atlas.Apply.Services;

public interface ILinkedInImportService
{
    Task<LinkedInImportResult> ImportAsync(string? linkedInUrl, string? profileText, CancellationToken cancellationToken = default);
}

public sealed record LinkedInImportResult(
    ImportedProfileData Profile,
    string Summary,
    IReadOnlyList<string> Warnings);

public sealed class LinkedInImportService(
    IHttpClientFactory httpClientFactory,
    IResumeTextParsingService textParser) : ILinkedInImportService
{
    private static readonly Regex ScriptRegex = new(@"<script\b[^>]*>.*?</script>", RegexOptions.IgnoreCase | RegexOptions.Singleline | RegexOptions.Compiled);
    private static readonly Regex StyleRegex = new(@"<style\b[^>]*>.*?</style>", RegexOptions.IgnoreCase | RegexOptions.Singleline | RegexOptions.Compiled);
    private static readonly Regex TagRegex = new(@"<[^>]+>", RegexOptions.Compiled);
    private static readonly Regex JsonLdRegex = new(@"<script[^>]*type\s*=\s*[""']application/ld\+json[""'][^>]*>(?<json>.*?)</script>", RegexOptions.IgnoreCase | RegexOptions.Singleline | RegexOptions.Compiled);
    private static readonly Regex MetaTitleRegex = new(@"<meta[^>]*property\s*=\s*[""']og:title[""'][^>]*content\s*=\s*[""'](?<value>[^""']+)[""'][^>]*>", RegexOptions.IgnoreCase | RegexOptions.Compiled);
    private static readonly Regex MetaDescriptionRegex = new(@"<meta[^>]*property\s*=\s*[""']og:description[""'][^>]*content\s*=\s*[""'](?<value>[^""']+)[""'][^>]*>", RegexOptions.IgnoreCase | RegexOptions.Compiled);

    public async Task<LinkedInImportResult> ImportAsync(string? linkedInUrl, string? profileText, CancellationToken cancellationToken = default)
    {
        var warnings = new List<string>();
        string sourceText;
        string? sourceUrl = null;

        if (!string.IsNullOrWhiteSpace(profileText))
        {
            sourceText = NormalizeText(StripHtml(profileText));
            warnings.Add("LinkedIn import used pasted profile content.");
        }
        else
        {
            if (string.IsNullOrWhiteSpace(linkedInUrl))
            {
                throw new InvalidOperationException("Provide a LinkedIn profile URL or paste profile text to import.");
            }

            sourceUrl = ValidateLinkedInUrl(linkedInUrl);
            var httpClient = httpClientFactory.CreateClient();
            using var request = new HttpRequestMessage(HttpMethod.Get, sourceUrl);
            request.Headers.UserAgent.ParseAdd("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0 Safari/537.36");
            request.Headers.AcceptLanguage.ParseAdd("en-US,en;q=0.9");

            using var response = await httpClient.SendAsync(request, cancellationToken);
            if (!response.IsSuccessStatusCode)
            {
                throw new InvalidOperationException($"LinkedIn returned {(int)response.StatusCode} {response.ReasonPhrase}. If the profile isn't public, paste the visible profile text instead.");
            }

            var html = await response.Content.ReadAsStringAsync(cancellationToken);
            sourceText = NormalizeText(StripHtml(html));
            warnings.Add("LinkedIn import used a fetched profile URL.");

            if (LooksLikeLinkedInGate(html, sourceText))
            {
                throw new InvalidOperationException("LinkedIn blocked the profile fetch. Open the profile in your browser, copy the visible page text, and paste it into the importer instead.");
            }

            var parsed = textParser.ParseResumeText(sourceText, warnings);
            var enriched = OverlayLinkedInMetadata(parsed, html, sourceUrl);
            return new LinkedInImportResult(
                enriched,
                "The profile was imported from a LinkedIn URL.",
                warnings);
        }

        var pastedProfile = textParser.ParseResumeText(sourceText, warnings);
        pastedProfile.LinkedInUrl ??= sourceUrl;
        return new LinkedInImportResult(
            pastedProfile,
            "The profile was imported from pasted LinkedIn content.",
            warnings);
    }

    private static string ValidateLinkedInUrl(string raw)
    {
        if (!Uri.TryCreate(raw.Trim(), UriKind.Absolute, out var uri))
        {
            throw new InvalidOperationException("Enter a valid LinkedIn profile URL.");
        }

        if (!uri.Host.Contains("linkedin.com", StringComparison.OrdinalIgnoreCase))
        {
            throw new InvalidOperationException("Enter a LinkedIn profile URL from linkedin.com.");
        }

        return uri.ToString();
    }

    private static bool LooksLikeLinkedInGate(string html, string text)
    {
        var combined = $"{html}\n{text}";
        var signInMentions = Regex.Matches(combined, @"\b(sign in|join now|sign up)\b", RegexOptions.IgnoreCase).Count;
        var sectionMentions = Regex.Matches(combined, @"\b(experience|education|skills|about|projects|certifications)\b", RegexOptions.IgnoreCase).Count;
        return signInMentions >= 2 && sectionMentions == 0;
    }

    private static ImportedProfileData OverlayLinkedInMetadata(ImportedProfileData parsed, string html, string? linkedInUrl)
    {
        var displayName = parsed.DisplayName;
        var headline = parsed.Headline;
        var summary = parsed.Summary;

        if (TryExtractJsonLd(html, out var jsonProfile))
        {
            displayName ??= Clean(jsonProfile.TryGetProperty("name", out var name) ? name.GetString() : null);
            headline ??= Clean(jsonProfile.TryGetProperty("headline", out var headlineProp) ? headlineProp.GetString() : null);
            summary ??= Clean(jsonProfile.TryGetProperty("description", out var desc) ? desc.GetString() : null);
        }

        displayName ??= Clean(MetaTitleRegex.Match(html).Groups["value"].Value.Split('|')[0]);
        headline ??= Clean(MetaDescriptionRegex.Match(html).Groups["value"].Value);

        return new ImportedProfileData
        {
            DisplayName = displayName,
            Headline = headline,
            Summary = summary,
            Location = parsed.Location,
            PhoneNumber = parsed.PhoneNumber,
            LinkedInUrl = linkedInUrl ?? parsed.LinkedInUrl,
            GithubUrl = parsed.GithubUrl,
            PortfolioUrl = parsed.PortfolioUrl,
            Skills = parsed.Skills,
            Experience = parsed.Experience,
            Education = parsed.Education,
            Projects = parsed.Projects,
            Certifications = parsed.Certifications
        };
    }

    private static bool TryExtractJsonLd(string html, out JsonElement profile)
    {
        foreach (Match match in JsonLdRegex.Matches(html))
        {
            var json = WebUtility.HtmlDecode(match.Groups["json"].Value);
            try
            {
                using var doc = JsonDocument.Parse(json);
                if (doc.RootElement.ValueKind == JsonValueKind.Object)
                {
                    if (LooksLikePerson(doc.RootElement))
                    {
                        profile = doc.RootElement.Clone();
                        return true;
                    }

                    if (doc.RootElement.TryGetProperty("@graph", out var graph) && graph.ValueKind == JsonValueKind.Array)
                    {
                        foreach (var item in graph.EnumerateArray())
                        {
                            if (item.ValueKind == JsonValueKind.Object && LooksLikePerson(item))
                            {
                                profile = item.Clone();
                                return true;
                            }
                        }
                    }
                }
            }
            catch
            {
                // Ignore malformed JSON-LD blocks.
            }
        }

        profile = default;
        return false;
    }

    private static bool LooksLikePerson(JsonElement element)
    {
        if (!element.TryGetProperty("@type", out var type))
        {
            return false;
        }

        return type.ValueKind switch
        {
            JsonValueKind.String => type.GetString()?.Contains("Person", StringComparison.OrdinalIgnoreCase) == true,
            JsonValueKind.Array => type.EnumerateArray().Any(x => x.ValueKind == JsonValueKind.String && x.GetString()?.Contains("Person", StringComparison.OrdinalIgnoreCase) == true),
            _ => false
        };
    }

    private static string StripHtml(string html)
    {
        if (string.IsNullOrWhiteSpace(html))
        {
            return string.Empty;
        }

        var cleaned = ScriptRegex.Replace(html, " ");
        cleaned = StyleRegex.Replace(cleaned, " ");
        cleaned = cleaned
            .Replace("</p>", "\n", StringComparison.OrdinalIgnoreCase)
            .Replace("</div>", "\n", StringComparison.OrdinalIgnoreCase)
            .Replace("</li>", "\n", StringComparison.OrdinalIgnoreCase)
            .Replace("</section>", "\n", StringComparison.OrdinalIgnoreCase)
            .Replace("<br>", "\n", StringComparison.OrdinalIgnoreCase)
            .Replace("<br/>", "\n", StringComparison.OrdinalIgnoreCase)
            .Replace("<br />", "\n", StringComparison.OrdinalIgnoreCase);
        cleaned = TagRegex.Replace(cleaned, " ");
        cleaned = WebUtility.HtmlDecode(cleaned);

        var lines = cleaned
            .Split(['\r', '\n'], StringSplitOptions.RemoveEmptyEntries)
            .Select(x => x.Trim())
            .Where(x => !string.IsNullOrWhiteSpace(x))
            .Where(x => !LooksLikeNoiseLine(x));

        return string.Join("\n", lines);
    }

    private static bool LooksLikeNoiseLine(string line)
    {
        var lowered = line.Trim().ToLowerInvariant();
        return lowered is "home"
            or "my network"
            or "jobs"
            or "messaging"
            or "notifications"
            or "me"
            or "sign in"
            or "join now"
            or "sign up"
            or "skip to main content"
            or "linkedin"
            or "premium";
    }

    private static string NormalizeText(string text)
    {
        if (string.IsNullOrWhiteSpace(text))
        {
            return string.Empty;
        }

        var normalized = text
            .Replace("\r\n", "\n", StringComparison.Ordinal)
            .Replace('\r', '\n');
        normalized = Regex.Replace(normalized, @"[ \t]+\n", "\n");
        normalized = Regex.Replace(normalized, @"\n{3,}", "\n\n");
        return normalized.Trim();
    }

    private static string? Clean(string? value)
    {
        return string.IsNullOrWhiteSpace(value) ? null : value.Trim();
    }
}
