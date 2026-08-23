using System.Globalization;
using System.Net;
using System.Text.Json;
using System.Xml.Linq;
using Atlas.Apply.Features.Jobs;

namespace Atlas.Apply.Services;

public interface ICompanyIntelligenceService
{
    Task<CompanyReportSnapshot> BuildReportAsync(string companyName, string? postingUrl, CancellationToken cancellationToken = default);
}

public class CompanyIntelligenceService(HttpClient httpClient) : ICompanyIntelligenceService
{
    public async Task<CompanyReportSnapshot> BuildReportAsync(string companyName, string? postingUrl, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(companyName))
        {
            return new CompanyReportSnapshot
            {
                Name = "Unknown Company",
                Summary = "No company information is available yet.",
                GeneratedUtc = DateTime.UtcNow
            };
        }

        var searchEntity = await SearchWikidataEntityAsync(companyName, cancellationToken);
        if (searchEntity is null)
        {
            return new CompanyReportSnapshot
            {
                Name = companyName,
                Summary = $"{companyName} was identified from the job posting, but reliable public company details could not be confirmed yet.",
                CompanyPageUrl = postingUrl,
                Domain = ExtractDomain(postingUrl),
                GeneratedUtc = DateTime.UtcNow,
                RecentNews = await FetchNewsAsync(companyName, cancellationToken)
            };
        }

        var report = await LoadWikidataDetailsAsync(searchEntity.Value.Id, searchEntity.Value.Label, searchEntity.Value.Description, cancellationToken);
        return new CompanyReportSnapshot
        {
            Name = report.Name,
            Summary = report.Summary,
            Description = report.Description,
            OfficialWebsiteUrl = report.OfficialWebsiteUrl,
            CompanyPageUrl = report.CompanyPageUrl ?? postingUrl ?? report.OfficialWebsiteUrl,
            Domain = report.Domain ?? ExtractDomain(report.OfficialWebsiteUrl) ?? ExtractDomain(postingUrl),
            Industry = report.Industry,
            SizeBand = report.SizeBand,
            FoundedYear = report.FoundedYear,
            EmployeeCount = report.EmployeeCount,
            RevenueDisplay = report.RevenueDisplay,
            Ticker = report.Ticker,
            Exchange = report.Exchange,
            MarketChartUrl = report.MarketChartUrl,
            RecentNews = await FetchNewsAsync(companyName, cancellationToken),
            GeneratedUtc = DateTime.UtcNow
        };
    }

    private async Task<(string Id, string Label, string? Description)?> SearchWikidataEntityAsync(string companyName, CancellationToken cancellationToken)
    {
        var url =
            $"https://www.wikidata.org/w/api.php?action=wbsearchentities&search={Uri.EscapeDataString(companyName)}&language=en&format=json&limit=1&type=item";
        using var response = await httpClient.GetAsync(url, cancellationToken);
        if (!response.IsSuccessStatusCode)
        {
            return null;
        }

        await using var stream = await response.Content.ReadAsStreamAsync(cancellationToken);
        using var doc = await JsonDocument.ParseAsync(stream, cancellationToken: cancellationToken);
        if (!doc.RootElement.TryGetProperty("search", out var searchResults) || searchResults.GetArrayLength() == 0)
        {
            return null;
        }

        var first = searchResults[0];
        var id = first.TryGetProperty("id", out var idProp) ? idProp.GetString() : null;
        var label = first.TryGetProperty("label", out var labelProp) ? labelProp.GetString() : null;
        var description = first.TryGetProperty("description", out var descProp) ? descProp.GetString() : null;
        if (string.IsNullOrWhiteSpace(id) || string.IsNullOrWhiteSpace(label))
        {
            return null;
        }

        return (id, label, description);
    }

    private async Task<CompanyReportSnapshot> LoadWikidataDetailsAsync(
        string entityId,
        string companyName,
        string? searchDescription,
        CancellationToken cancellationToken)
    {
        var url = $"https://www.wikidata.org/wiki/Special:EntityData/{entityId}.json";
        using var response = await httpClient.GetAsync(url, cancellationToken);
        if (!response.IsSuccessStatusCode)
        {
            return new CompanyReportSnapshot
            {
                Name = companyName,
                Summary = searchDescription,
                GeneratedUtc = DateTime.UtcNow
            };
        }

        await using var stream = await response.Content.ReadAsStreamAsync(cancellationToken);
        using var doc = await JsonDocument.ParseAsync(stream, cancellationToken: cancellationToken);
        if (!doc.RootElement.TryGetProperty("entities", out var entities) ||
            !entities.TryGetProperty(entityId, out var entity))
        {
            return new CompanyReportSnapshot
            {
                Name = companyName,
                Summary = searchDescription,
                GeneratedUtc = DateTime.UtcNow
            };
        }

        entity.TryGetProperty("claims", out var claims);
        var foundedYear = ReadYear(claims, "P571");
        var employeeCount = ReadQuantityLong(claims, "P1128");
        var officialWebsite = ReadStringClaim(claims, "P856");
        var revenueDisplay = ReadRevenueDisplay(claims, "P2139");
        var ticker = ReadStringClaim(claims, "P249");
        var exchange = ReadEntityLabelFromClaim(claims, "P414");

        var description = ReadEnglishLabel(entity, "descriptions") ?? searchDescription;
        var summary = BuildSummary(companyName, description, foundedYear, employeeCount);

        return new CompanyReportSnapshot
        {
            Name = companyName,
            Summary = summary,
            Description = description,
            OfficialWebsiteUrl = officialWebsite,
            CompanyPageUrl = officialWebsite,
            Domain = ExtractDomain(officialWebsite),
            FoundedYear = foundedYear,
            EmployeeCount = employeeCount,
            RevenueDisplay = revenueDisplay,
            Ticker = ticker,
            Exchange = exchange,
            MarketChartUrl = string.IsNullOrWhiteSpace(ticker)
                ? null
                : $"https://finviz.com/chart.ashx?t={Uri.EscapeDataString(ticker)}&ty=c&ta=1&p=d&s=l",
            GeneratedUtc = DateTime.UtcNow
        };
    }

    private async Task<IReadOnlyList<CompanyNewsItem>> FetchNewsAsync(string companyName, CancellationToken cancellationToken)
    {
        var url =
            $"https://news.google.com/rss/search?q=%22{Uri.EscapeDataString(companyName)}%22%20when%3A30d&hl=en-US&gl=US&ceid=US:en";
        using var response = await httpClient.GetAsync(url, cancellationToken);
        if (!response.IsSuccessStatusCode)
        {
            return [];
        }

        await using var stream = await response.Content.ReadAsStreamAsync(cancellationToken);
        var doc = XDocument.Load(stream);
        var items = doc.Descendants("item")
            .Take(6)
            .Select(x => new CompanyNewsItem(
                WebUtility.HtmlDecode(x.Element("title")?.Value ?? string.Empty),
                x.Element("link")?.Value ?? string.Empty,
                null,
                ParseRssDate(x.Element("pubDate")?.Value)))
            .Where(x => !string.IsNullOrWhiteSpace(x.Title) && !string.IsNullOrWhiteSpace(x.Url))
            .ToList();

        return items;
    }

    private static DateTime? ParseRssDate(string? raw)
    {
        if (DateTime.TryParse(raw, CultureInfo.InvariantCulture, DateTimeStyles.AdjustToUniversal, out var value))
        {
            return value;
        }

        return null;
    }

    private static string? ReadEnglishLabel(JsonElement entity, string propertyName)
    {
        if (!entity.TryGetProperty(propertyName, out var labels) || !labels.TryGetProperty("en", out var english))
        {
            return null;
        }

        return english.TryGetProperty("value", out var value) ? value.GetString() : null;
    }

    private static string BuildSummary(string companyName, string? description, int? foundedYear, long? employeeCount)
    {
        var parts = new List<string>();
        if (!string.IsNullOrWhiteSpace(description))
        {
            parts.Add($"{companyName} is a {description.TrimEnd('.')}.");
        }
        else
        {
            parts.Add($"{companyName} is the organization that posted this role.");
        }

        if (foundedYear.HasValue)
        {
            parts.Add($"Founded in {foundedYear.Value}.");
        }

        if (employeeCount.HasValue)
        {
            parts.Add($"Public sources suggest about {employeeCount.Value.ToString("N0", CultureInfo.InvariantCulture)} employees.");
        }

        return string.Join(" ", parts);
    }

    private static int? ReadYear(JsonElement claims, string propertyId)
    {
        if (!claims.TryGetProperty(propertyId, out var claimArray) || claimArray.GetArrayLength() == 0)
        {
            return null;
        }

        foreach (var claim in claimArray.EnumerateArray())
        {
            if (!TryGetDataValue(claim, out var dataValue))
            {
                continue;
            }

            if (dataValue.ValueKind == JsonValueKind.Object &&
                dataValue.TryGetProperty("time", out var timeProp))
            {
                var raw = timeProp.GetString();
                if (string.IsNullOrWhiteSpace(raw))
                {
                    continue;
                }

                raw = raw.TrimStart('+');
                if (raw.Length >= 4 && int.TryParse(raw[..4], out var year))
                {
                    return year;
                }
            }
        }

        return null;
    }

    private static long? ReadQuantityLong(JsonElement claims, string propertyId)
    {
        if (!claims.TryGetProperty(propertyId, out var claimArray) || claimArray.GetArrayLength() == 0)
        {
            return null;
        }

        foreach (var claim in claimArray.EnumerateArray())
        {
            if (!TryGetDataValue(claim, out var dataValue))
            {
                continue;
            }

            if (dataValue.ValueKind == JsonValueKind.Object &&
                dataValue.TryGetProperty("amount", out var amountProp))
            {
                var raw = amountProp.GetString()?.TrimStart('+');
                if (long.TryParse(raw, NumberStyles.Any, CultureInfo.InvariantCulture, out var value))
                {
                    return value;
                }
            }
        }

        return null;
    }

    private static string? ReadRevenueDisplay(JsonElement claims, string propertyId)
    {
        var amount = ReadQuantityLong(claims, propertyId);
        if (!amount.HasValue)
        {
            return null;
        }

        if (amount.Value >= 1_000_000_000)
        {
            return $"Approx. ${(amount.Value / 1_000_000_000d):0.##}B annual revenue";
        }

        if (amount.Value >= 1_000_000)
        {
            return $"Approx. ${(amount.Value / 1_000_000d):0.##}M annual revenue";
        }

        return $"Approx. ${amount.Value.ToString("N0", CultureInfo.InvariantCulture)} annual revenue";
    }

    private static string? ReadStringClaim(JsonElement claims, string propertyId)
    {
        if (!claims.TryGetProperty(propertyId, out var claimArray) || claimArray.GetArrayLength() == 0)
        {
            return null;
        }

        foreach (var claim in claimArray.EnumerateArray())
        {
            if (!TryGetDataValue(claim, out var dataValue))
            {
                continue;
            }

            if (dataValue.ValueKind == JsonValueKind.String)
            {
                return dataValue.GetString();
            }
        }

        return null;
    }

    private static string? ReadEntityLabelFromClaim(JsonElement claims, string propertyId)
    {
        if (!claims.TryGetProperty(propertyId, out var claimArray) || claimArray.GetArrayLength() == 0)
        {
            return null;
        }

        foreach (var claim in claimArray.EnumerateArray())
        {
            if (!TryGetDataValue(claim, out var dataValue))
            {
                continue;
            }

            if (dataValue.ValueKind == JsonValueKind.Object &&
                dataValue.TryGetProperty("id", out var idProp))
            {
                return idProp.GetString();
            }
        }

        return null;
    }

    private static bool TryGetDataValue(JsonElement claim, out JsonElement dataValue)
    {
        dataValue = default;
        if (!claim.TryGetProperty("mainsnak", out var mainSnak))
        {
            return false;
        }

        if (!mainSnak.TryGetProperty("datavalue", out var rawDataValue))
        {
            return false;
        }

        if (!rawDataValue.TryGetProperty("value", out dataValue))
        {
            return false;
        }

        return true;
    }

    private static string? ExtractDomain(string? url)
    {
        if (!Uri.TryCreate(url, UriKind.Absolute, out var uri))
        {
            return null;
        }

        return uri.Host.Replace("www.", string.Empty, StringComparison.OrdinalIgnoreCase);
    }
}
