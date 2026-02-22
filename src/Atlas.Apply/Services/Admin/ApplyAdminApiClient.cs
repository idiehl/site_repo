using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace Atlas.Apply.Services.Admin;

public sealed class ApplyAdminApiClient
{
    private readonly HttpClient _httpClient;

    public ApplyAdminApiClient(HttpClient httpClient)
    {
        _httpClient = httpClient;
    }

    public async Task<ApiResult<AdminOverviewDto>> GetOverviewAsync(string accessToken, int days = 30, CancellationToken cancellationToken = default)
    {
        var path = $"/api/v1/admin/stats/overview?days={days}";
        using var request = CreateRequest(HttpMethod.Get, path, accessToken);
        using var response = await _httpClient.SendAsync(request, cancellationToken);
        return await ReadResponseAsync<AdminOverviewDto>(response, "Failed to load admin overview", cancellationToken);
    }

    public async Task<ApiResult<AdminVisitAnalyticsDto>> GetVisitAnalyticsAsync(
        string accessToken,
        int days = 7,
        int limit = 100,
        CancellationToken cancellationToken = default)
    {
        var path = $"/api/v1/admin/analytics/visits?days={days}&limit={limit}";
        using var request = CreateRequest(HttpMethod.Get, path, accessToken);
        using var response = await _httpClient.SendAsync(request, cancellationToken);
        return await ReadResponseAsync<AdminVisitAnalyticsDto>(response, "Failed to load visit analytics", cancellationToken);
    }

    public async Task<ApiResult<AdminApiUsageAnalyticsDto>> GetApiUsageAnalyticsAsync(
        string accessToken,
        int days = 7,
        int limit = 100,
        CancellationToken cancellationToken = default)
    {
        var path = $"/api/v1/admin/analytics/api-usage?days={days}&limit={limit}";
        using var request = CreateRequest(HttpMethod.Get, path, accessToken);
        using var response = await _httpClient.SendAsync(request, cancellationToken);
        return await ReadResponseAsync<AdminApiUsageAnalyticsDto>(response, "Failed to load API analytics", cancellationToken);
    }

    public async Task<ApiResult<AdminSecurityEventsResponseDto>> GetSecurityEventsAsync(
        string accessToken,
        bool? resolved = null,
        string? severity = null,
        CancellationToken cancellationToken = default)
    {
        var queryParts = new List<string>();
        if (resolved.HasValue)
        {
            queryParts.Add($"resolved={(resolved.Value ? "true" : "false")}");
        }

        if (!string.IsNullOrWhiteSpace(severity))
        {
            queryParts.Add($"severity={Uri.EscapeDataString(severity)}");
        }

        var path = "/api/v1/admin/security/events";
        if (queryParts.Count > 0)
        {
            path += "?" + string.Join("&", queryParts);
        }

        using var request = CreateRequest(HttpMethod.Get, path, accessToken);
        using var response = await _httpClient.SendAsync(request, cancellationToken);
        return await ReadResponseAsync<AdminSecurityEventsResponseDto>(response, "Failed to load security events", cancellationToken);
    }

    public async Task<ApiResult<bool>> ResolveSecurityEventAsync(
        string accessToken,
        Guid eventId,
        CancellationToken cancellationToken = default)
    {
        using var request = CreateRequest(HttpMethod.Post, $"/api/v1/admin/security/events/{eventId}/resolve", accessToken);
        using var response = await _httpClient.SendAsync(request, cancellationToken);
        if (!response.IsSuccessStatusCode)
        {
            var error = await ReadErrorAsync(response, "Failed to resolve security event", cancellationToken);
            return ApiResult<bool>.Fail(error, response.StatusCode);
        }

        return ApiResult<bool>.Success(true);
    }

    private static HttpRequestMessage CreateRequest(HttpMethod method, string path, string accessToken)
    {
        var request = new HttpRequestMessage(method, path);
        request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", accessToken);
        return request;
    }

    private static async Task<ApiResult<T>> ReadResponseAsync<T>(HttpResponseMessage response, string fallbackError, CancellationToken cancellationToken)
    {
        if (!response.IsSuccessStatusCode)
        {
            var error = await ReadErrorAsync(response, fallbackError, cancellationToken);
            return ApiResult<T>.Fail(error, response.StatusCode);
        }

        var payload = await response.Content.ReadFromJsonAsync<T>(cancellationToken: cancellationToken);
        if (payload is null)
        {
            return ApiResult<T>.Fail("Unexpected empty response payload.", response.StatusCode);
        }

        return ApiResult<T>.Success(payload);
    }

    private static async Task<string> ReadErrorAsync(HttpResponseMessage response, string fallback, CancellationToken cancellationToken)
    {
        try
        {
            var text = await response.Content.ReadAsStringAsync(cancellationToken);
            if (string.IsNullOrWhiteSpace(text))
            {
                return fallback;
            }

            using var document = JsonDocument.Parse(text);
            if (document.RootElement.TryGetProperty("detail", out var detail))
            {
                return detail.ValueKind == JsonValueKind.String
                    ? detail.GetString() ?? fallback
                    : detail.ToString();
            }
        }
        catch
        {
            // fall through
        }

        return fallback;
    }
}

public sealed record ApiResult<T>(bool IsSuccess, T? Value, string? Error, HttpStatusCode? StatusCode)
{
    public static ApiResult<T> Success(T value) => new(true, value, null, null);
    public static ApiResult<T> Fail(string error, HttpStatusCode? statusCode = null) =>
        new(false, default, error, statusCode);
}

public sealed class AdminOverviewDto
{
    [JsonPropertyName("period_days")]
    public int PeriodDays { get; set; }

    [JsonPropertyName("users")]
    public AdminOverviewUsersDto Users { get; set; } = new();

    [JsonPropertyName("jobs")]
    public AdminOverviewJobsDto Jobs { get; set; } = new();

    [JsonPropertyName("applications")]
    public AdminOverviewApplicationsDto Applications { get; set; } = new();

    [JsonPropertyName("traffic")]
    public AdminOverviewTrafficDto Traffic { get; set; } = new();

    [JsonPropertyName("api")]
    public AdminOverviewApiDto Api { get; set; } = new();

    [JsonPropertyName("security")]
    public AdminOverviewSecurityDto Security { get; set; } = new();
}

public sealed class AdminOverviewUsersDto
{
    [JsonPropertyName("total")]
    public int Total { get; set; }

    [JsonPropertyName("new")]
    public int New { get; set; }
}

public sealed class AdminOverviewJobsDto
{
    [JsonPropertyName("total")]
    public int Total { get; set; }

    [JsonPropertyName("recent")]
    public int Recent { get; set; }
}

public sealed class AdminOverviewApplicationsDto
{
    [JsonPropertyName("total")]
    public int Total { get; set; }

    [JsonPropertyName("recent")]
    public int Recent { get; set; }
}

public sealed class AdminOverviewTrafficDto
{
    [JsonPropertyName("total_visits")]
    public int TotalVisits { get; set; }

    [JsonPropertyName("unique_visitors")]
    public int UniqueVisitors { get; set; }
}

public sealed class AdminOverviewApiDto
{
    [JsonPropertyName("total_calls")]
    public int TotalCalls { get; set; }

    [JsonPropertyName("avg_response_time_ms")]
    public double AvgResponseTimeMs { get; set; }

    [JsonPropertyName("error_rate_percent")]
    public double ErrorRatePercent { get; set; }
}

public sealed class AdminOverviewSecurityDto
{
    [JsonPropertyName("unresolved_events")]
    public int UnresolvedEvents { get; set; }

    [JsonPropertyName("critical_events")]
    public int CriticalEvents { get; set; }
}

public sealed class AdminVisitAnalyticsDto
{
    [JsonPropertyName("popular_paths")]
    public List<PopularPathDto> PopularPaths { get; set; } = [];

    [JsonPropertyName("visits_by_day")]
    public List<VisitsByDayDto> VisitsByDay { get; set; } = [];

    [JsonPropertyName("recent_visits")]
    public List<VisitRecordDto> RecentVisits { get; set; } = [];
}

public sealed class PopularPathDto
{
    [JsonPropertyName("path")]
    public string Path { get; set; } = "";

    [JsonPropertyName("count")]
    public int Count { get; set; }
}

public sealed class VisitsByDayDto
{
    [JsonPropertyName("date")]
    public string Date { get; set; } = "";

    [JsonPropertyName("count")]
    public int Count { get; set; }
}

public sealed class VisitRecordDto
{
    [JsonPropertyName("id")]
    public Guid Id { get; set; }

    [JsonPropertyName("path")]
    public string Path { get; set; } = "";

    [JsonPropertyName("method")]
    public string Method { get; set; } = "";

    [JsonPropertyName("ip_address")]
    public string? IpAddress { get; set; }

    [JsonPropertyName("user_id")]
    public string? UserId { get; set; }

    [JsonPropertyName("created_at")]
    public DateTime CreatedAt { get; set; }
}

public sealed class AdminApiUsageAnalyticsDto
{
    [JsonPropertyName("endpoint_stats")]
    public List<EndpointStatDto> EndpointStats { get; set; } = [];

    [JsonPropertyName("usage_by_day")]
    public List<ApiUsageDayDto> UsageByDay { get; set; } = [];
}

public sealed class EndpointStatDto
{
    [JsonPropertyName("endpoint")]
    public string Endpoint { get; set; } = "";

    [JsonPropertyName("method")]
    public string Method { get; set; } = "";

    [JsonPropertyName("count")]
    public int Count { get; set; }

    [JsonPropertyName("avg_response_time_ms")]
    public double AvgResponseTimeMs { get; set; }

    [JsonPropertyName("error_count")]
    public int ErrorCount { get; set; }
}

public sealed class ApiUsageDayDto
{
    [JsonPropertyName("date")]
    public string Date { get; set; } = "";

    [JsonPropertyName("count")]
    public int Count { get; set; }

    [JsonPropertyName("avg_response_time_ms")]
    public double AvgResponseTimeMs { get; set; }
}

public sealed class AdminSecurityEventsResponseDto
{
    [JsonPropertyName("events")]
    public List<AdminSecurityEventDto> Events { get; set; } = [];
}

public sealed class AdminSecurityEventDto
{
    [JsonPropertyName("id")]
    public Guid Id { get; set; }

    [JsonPropertyName("event_type")]
    public string EventType { get; set; } = "";

    [JsonPropertyName("severity")]
    public string Severity { get; set; } = "";

    [JsonPropertyName("ip_address")]
    public string? IpAddress { get; set; }

    [JsonPropertyName("user_id")]
    public string? UserId { get; set; }

    [JsonPropertyName("created_at")]
    public DateTime CreatedAt { get; set; }

    [JsonPropertyName("resolved")]
    public bool Resolved { get; set; }

    [JsonPropertyName("resolved_at")]
    public DateTime? ResolvedAt { get; set; }
}
