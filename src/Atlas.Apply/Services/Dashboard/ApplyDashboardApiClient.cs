using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace Atlas.Apply.Services.Dashboard;

public sealed class ApplyDashboardApiClient
{
    private readonly HttpClient _httpClient;

    public ApplyDashboardApiClient(HttpClient httpClient)
    {
        _httpClient = httpClient;
    }

    public async Task<ApiResult<DashboardUserDto>> GetCurrentUserAsync(string accessToken, CancellationToken cancellationToken = default)
    {
        using var request = CreateRequest(HttpMethod.Get, "/api/v2/auth/me", accessToken);
        using var response = await _httpClient.SendAsync(request, cancellationToken);
        if (!response.IsSuccessStatusCode)
        {
            var error = await ReadErrorAsync(response, "Failed to load current user", cancellationToken);
            return ApiResult<DashboardUserDto>.Fail(error, response.StatusCode);
        }

        var payload = await response.Content.ReadFromJsonAsync<DashboardUserDto>(cancellationToken: cancellationToken);
        if (payload is null)
        {
            return ApiResult<DashboardUserDto>.Fail("Current user payload was empty.", response.StatusCode);
        }

        return ApiResult<DashboardUserDto>.Success(payload);
    }

    public async Task<ApiResult<List<DashboardJobDto>>> GetJobsAsync(string accessToken, CancellationToken cancellationToken = default)
    {
        using var request = CreateRequest(HttpMethod.Get, "/api/v1/jobs", accessToken);
        using var response = await _httpClient.SendAsync(request, cancellationToken);
        if (!response.IsSuccessStatusCode)
        {
            var error = await ReadErrorAsync(response, "Failed to fetch jobs", cancellationToken);
            return ApiResult<List<DashboardJobDto>>.Fail(error, response.StatusCode);
        }

        var payload = await response.Content.ReadFromJsonAsync<List<DashboardJobDto>>(cancellationToken: cancellationToken) ?? [];
        return ApiResult<List<DashboardJobDto>>.Success(payload);
    }

    public async Task<ApiResult<int>> GetApplicationsCountAsync(string accessToken, CancellationToken cancellationToken = default)
    {
        using var request = CreateRequest(HttpMethod.Get, "/api/v1/applications", accessToken);
        using var response = await _httpClient.SendAsync(request, cancellationToken);
        if (!response.IsSuccessStatusCode)
        {
            var error = await ReadErrorAsync(response, "Failed to fetch applications", cancellationToken);
            return ApiResult<int>.Fail(error, response.StatusCode);
        }

        var payload = await response.Content.ReadFromJsonAsync<List<object>>(cancellationToken: cancellationToken) ?? [];
        return ApiResult<int>.Success(payload.Count);
    }

    public async Task<ApiResult<bool>> RetryAllFailedAsync(string accessToken, CancellationToken cancellationToken = default)
    {
        using var request = CreateRequest(HttpMethod.Post, "/api/v1/jobs/retry-all-failed", accessToken);
        request.Content = JsonContent.Create(new { });

        using var response = await _httpClient.SendAsync(request, cancellationToken);
        if (!response.IsSuccessStatusCode)
        {
            var error = await ReadErrorAsync(response, "Failed to retry failed jobs", cancellationToken);
            return ApiResult<bool>.Fail(error, response.StatusCode);
        }

        return ApiResult<bool>.Success(true);
    }

    public async Task<ApiResult<bool>> IngestJobsAsync(string accessToken, IReadOnlyList<string> urls, CancellationToken cancellationToken = default)
    {
        using var request = CreateRequest(HttpMethod.Post, "/api/v1/jobs/ingest", accessToken);
        request.Content = JsonContent.Create(new { urls });

        using var response = await _httpClient.SendAsync(request, cancellationToken);
        if (!response.IsSuccessStatusCode)
        {
            var error = await ReadErrorAsync(response, "Failed to ingest jobs", cancellationToken);
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

public sealed record ApiResult<T>(bool IsSuccess, T? Value, string? Error, System.Net.HttpStatusCode? StatusCode)
{
    public static ApiResult<T> Success(T value) => new(true, value, null, null);
    public static ApiResult<T> Fail(string error, System.Net.HttpStatusCode? statusCode = null) =>
        new(false, default, error, statusCode);
}

public sealed class DashboardUserDto
{
    [JsonPropertyName("email")]
    public string Email { get; set; } = "";
}

public sealed class DashboardJobDto
{
    [JsonPropertyName("id")]
    public Guid Id { get; set; }

    [JsonPropertyName("company_name")]
    public string? CompanyName { get; set; }

    [JsonPropertyName("job_title")]
    public string? JobTitle { get; set; }

    [JsonPropertyName("location")]
    public string? Location { get; set; }

    [JsonPropertyName("status")]
    public string Status { get; set; } = "";

    [JsonPropertyName("created_at")]
    public DateTime? CreatedAt { get; set; }
}
