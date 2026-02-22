using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace Atlas.Apply.Services.Jobs;

public sealed class ApplyJobDetailApiClient
{
    private readonly HttpClient _httpClient;

    public ApplyJobDetailApiClient(HttpClient httpClient)
    {
        _httpClient = httpClient;
    }

    public async Task<ApiResult<JobDetailDto>> GetJobAsync(string accessToken, Guid jobId, CancellationToken cancellationToken = default)
    {
        using var request = CreateRequest(HttpMethod.Get, $"/api/v1/jobs/{jobId}", accessToken);
        using var response = await _httpClient.SendAsync(request, cancellationToken);
        return await ReadResponseAsync<JobDetailDto>(response, "Failed to load job details", cancellationToken);
    }

    public async Task<ApiResult<JobDetailDto>> UpdateApplicationStatusAsync(
        string accessToken,
        Guid jobId,
        string? applicationStatus,
        string? interviewDate = null,
        string? interviewNotes = null,
        CancellationToken cancellationToken = default)
    {
        var query = BuildQuery(new Dictionary<string, string?>
        {
            ["application_status"] = applicationStatus ?? "",
            ["interview_date"] = interviewDate ?? "",
            ["interview_notes"] = interviewNotes ?? "",
        });

        using var request = CreateRequest(HttpMethod.Patch, $"/api/v1/jobs/{jobId}/application-status{query}", accessToken);
        request.Content = JsonContent.Create(new { });
        using var response = await _httpClient.SendAsync(request, cancellationToken);
        return await ReadResponseAsync<JobDetailDto>(response, "Failed to update application status", cancellationToken);
    }

    public async Task<ApiResult<JobDetailDto>> ExtractRequirementsAsync(
        string accessToken,
        Guid jobId,
        CancellationToken cancellationToken = default)
    {
        using var request = CreateRequest(HttpMethod.Post, $"/api/v1/jobs/{jobId}/extract-requirements", accessToken);
        request.Content = JsonContent.Create(new { });
        using var response = await _httpClient.SendAsync(request, cancellationToken);
        return await ReadResponseAsync<JobDetailDto>(response, "Failed to extract requirements", cancellationToken);
    }

    public async Task<ApiResult<bool>> RetryJobAsync(string accessToken, Guid jobId, CancellationToken cancellationToken = default)
    {
        using var request = CreateRequest(HttpMethod.Post, $"/api/v1/jobs/{jobId}/retry", accessToken);
        request.Content = JsonContent.Create(new { });
        using var response = await _httpClient.SendAsync(request, cancellationToken);
        if (!response.IsSuccessStatusCode)
        {
            var error = await ReadErrorAsync(response, "Failed to retry job", cancellationToken);
            return ApiResult<bool>.Fail(error, response.StatusCode);
        }

        return ApiResult<bool>.Success(true);
    }

    public async Task<ApiResult<JobDetailDto>> SaveManualContentAsync(
        string accessToken,
        Guid jobId,
        string content,
        CancellationToken cancellationToken = default)
    {
        using var request = CreateRequest(HttpMethod.Post, $"/api/v1/jobs/{jobId}/manual-content", accessToken);
        request.Content = JsonContent.Create(new { content });
        using var response = await _httpClient.SendAsync(request, cancellationToken);
        return await ReadResponseAsync<JobDetailDto>(response, "Failed to save manual content", cancellationToken);
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

    private static string BuildQuery(Dictionary<string, string?> values)
    {
        var pairs = values
            .Where(v => v.Value is not null)
            .Select(v => $"{Uri.EscapeDataString(v.Key)}={Uri.EscapeDataString(v.Value ?? string.Empty)}")
            .ToArray();

        return pairs.Length == 0 ? string.Empty : $"?{string.Join("&", pairs)}";
    }
}

public sealed class JobDetailDto
{
    [JsonPropertyName("id")]
    public Guid Id { get; set; }

    [JsonPropertyName("url")]
    public string Url { get; set; } = "";

    [JsonPropertyName("company_name")]
    public string? CompanyName { get; set; }

    [JsonPropertyName("job_title")]
    public string? JobTitle { get; set; }

    [JsonPropertyName("location")]
    public string? Location { get; set; }

    [JsonPropertyName("remote_policy")]
    public string? RemotePolicy { get; set; }

    [JsonPropertyName("salary_range")]
    public string? SalaryRange { get; set; }

    [JsonPropertyName("job_description")]
    public string? JobDescription { get; set; }

    [JsonPropertyName("raw_text")]
    public string? RawText { get; set; }

    [JsonPropertyName("status")]
    public string Status { get; set; } = "";

    [JsonPropertyName("error_message")]
    public string? ErrorMessage { get; set; }

    [JsonPropertyName("application_status")]
    public string? ApplicationStatus { get; set; }

    [JsonPropertyName("applied_at")]
    public DateTime? AppliedAt { get; set; }

    [JsonPropertyName("interview_date")]
    public DateTime? InterviewDate { get; set; }

    [JsonPropertyName("interview_notes")]
    public string? InterviewNotes { get; set; }

    [JsonPropertyName("requirements")]
    public JsonElement Requirements { get; set; }
}

public sealed record ApiResult<T>(bool IsSuccess, T? Value, string? Error, HttpStatusCode? StatusCode)
{
    public static ApiResult<T> Success(T value) => new(true, value, null, null);
    public static ApiResult<T> Fail(string error, HttpStatusCode? statusCode = null) =>
        new(false, default, error, statusCode);
}
