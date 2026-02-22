using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace Atlas.Apply.Services.Applications;

public sealed class ApplyApplicationsApiClient
{
    private readonly HttpClient _httpClient;

    public ApplyApplicationsApiClient(HttpClient httpClient)
    {
        _httpClient = httpClient;
    }

    public async Task<ApiResult<List<ApplicationListItemDto>>> GetApplicationsAsync(string accessToken, CancellationToken cancellationToken = default)
    {
        using var request = CreateRequest(HttpMethod.Get, "/api/v1/applications", accessToken);
        using var response = await _httpClient.SendAsync(request, cancellationToken);
        return await ReadResponseAsync<List<ApplicationListItemDto>>(response, "Failed to fetch applications", cancellationToken);
    }

    public async Task<ApiResult<ApplicationListItemDto>> UpdateApplicationStatusAsync(
        string accessToken,
        Guid applicationId,
        string status,
        string? notes = null,
        CancellationToken cancellationToken = default)
    {
        var payload = new Dictionary<string, object?>
        {
            ["status"] = status,
        };
        if (!string.IsNullOrWhiteSpace(notes))
        {
            payload["notes"] = notes;
        }

        using var request = CreateRequest(HttpMethod.Patch, $"/api/v1/applications/{applicationId}", accessToken);
        request.Content = JsonContent.Create(payload);
        using var response = await _httpClient.SendAsync(request, cancellationToken);
        return await ReadResponseAsync<ApplicationListItemDto>(response, "Failed to update application", cancellationToken);
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

public sealed class ApplicationListItemDto
{
    [JsonPropertyName("id")]
    public Guid Id { get; set; }

    [JsonPropertyName("job_posting_id")]
    public Guid JobPostingId { get; set; }

    [JsonPropertyName("status")]
    public string Status { get; set; } = "";

    [JsonPropertyName("applied_at")]
    public DateTime? AppliedAt { get; set; }

    [JsonPropertyName("notes")]
    public string? Notes { get; set; }

    [JsonPropertyName("created_at")]
    public DateTime CreatedAt { get; set; }
}
