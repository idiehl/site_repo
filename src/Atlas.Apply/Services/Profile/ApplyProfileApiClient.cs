using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace Atlas.Apply.Services.Profile;

public sealed class ApplyProfileApiClient
{
    private readonly HttpClient _httpClient;

    public ApplyProfileApiClient(HttpClient httpClient)
    {
        _httpClient = httpClient;
    }

    public async Task<ApiResult<ProfileDto>> GetProfileAsync(string accessToken, CancellationToken cancellationToken = default)
    {
        using var request = CreateRequest(HttpMethod.Get, "/api/v1/profile", accessToken);
        using var response = await _httpClient.SendAsync(request, cancellationToken);
        return await ReadResponseAsync<ProfileDto>(response, "Failed to fetch profile", cancellationToken);
    }

    public async Task<ApiResult<ProfileCompletenessDto>> GetCompletenessAsync(string accessToken, CancellationToken cancellationToken = default)
    {
        using var request = CreateRequest(HttpMethod.Get, "/api/v1/profile/completeness", accessToken);
        using var response = await _httpClient.SendAsync(request, cancellationToken);
        return await ReadResponseAsync<ProfileCompletenessDto>(response, "Failed to fetch profile completeness", cancellationToken);
    }

    public async Task<ApiResult<bool>> UpdateProfileAsync(string accessToken, ProfileUpdatePayload payload, CancellationToken cancellationToken = default)
    {
        var body = new Dictionary<string, object?>
        {
            ["full_name"] = payload.FullName,
            ["headline"] = payload.Headline,
            ["summary"] = payload.Summary,
            ["location"] = payload.Location,
            ["phone"] = payload.Phone,
            ["social_links"] = payload.SocialLinks,
            ["skills"] = payload.Skills,
        };

        using var request = CreateRequest(HttpMethod.Patch, "/api/v1/profile", accessToken);
        request.Content = JsonContent.Create(body);
        using var response = await _httpClient.SendAsync(request, cancellationToken);
        if (!response.IsSuccessStatusCode)
        {
            var error = await ReadErrorAsync(response, "Failed to save profile", cancellationToken);
            return ApiResult<bool>.Fail(error, response.StatusCode);
        }

        return ApiResult<bool>.Success(true);
    }

    public async Task<ApiResult<ResumeUploadResultDto>> UploadResumeAsync(
        string accessToken,
        Stream fileStream,
        string fileName,
        string contentType,
        CancellationToken cancellationToken = default)
    {
        using var form = new MultipartFormDataContent();
        using var streamContent = new StreamContent(fileStream);
        if (!string.IsNullOrWhiteSpace(contentType))
        {
            streamContent.Headers.ContentType = new MediaTypeHeaderValue(contentType);
        }

        form.Add(streamContent, "file", fileName);

        using var request = CreateRequest(HttpMethod.Post, "/api/v1/profile/upload-resume", accessToken);
        request.Content = form;
        using var response = await _httpClient.SendAsync(request, cancellationToken);
        return await ReadResponseAsync<ResumeUploadResultDto>(response, "Failed to parse resume", cancellationToken);
    }

    public async Task<ApiResult<PictureUploadResultDto>> UploadPictureAsync(
        string accessToken,
        Stream fileStream,
        string fileName,
        string contentType,
        CancellationToken cancellationToken = default)
    {
        using var form = new MultipartFormDataContent();
        using var streamContent = new StreamContent(fileStream);
        if (!string.IsNullOrWhiteSpace(contentType))
        {
            streamContent.Headers.ContentType = new MediaTypeHeaderValue(contentType);
        }

        form.Add(streamContent, "file", fileName);

        using var request = CreateRequest(HttpMethod.Post, "/api/v1/profile/upload-picture", accessToken);
        request.Content = form;
        using var response = await _httpClient.SendAsync(request, cancellationToken);
        return await ReadResponseAsync<PictureUploadResultDto>(response, "Failed to upload profile picture", cancellationToken);
    }

    public async Task<ApiResult<bool>> DeletePictureAsync(string accessToken, CancellationToken cancellationToken = default)
    {
        using var request = CreateRequest(HttpMethod.Delete, "/api/v1/profile/picture", accessToken);
        using var response = await _httpClient.SendAsync(request, cancellationToken);
        if (!response.IsSuccessStatusCode)
        {
            var error = await ReadErrorAsync(response, "Failed to delete profile picture", cancellationToken);
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

public sealed class ProfileDto
{
    [JsonPropertyName("full_name")]
    public string? FullName { get; set; }

    [JsonPropertyName("headline")]
    public string? Headline { get; set; }

    [JsonPropertyName("summary")]
    public string? Summary { get; set; }

    [JsonPropertyName("profile_picture_url")]
    public string? ProfilePictureUrl { get; set; }

    [JsonPropertyName("location")]
    public string? Location { get; set; }

    [JsonPropertyName("phone")]
    public string? Phone { get; set; }

    [JsonPropertyName("social_links")]
    public JsonElement SocialLinks { get; set; }

    [JsonPropertyName("skills")]
    public JsonElement Skills { get; set; }

    [JsonPropertyName("completeness_score")]
    public int CompletenessScore { get; set; }
}

public sealed class ProfileCompletenessDto
{
    [JsonPropertyName("score")]
    public int Score { get; set; }

    [JsonPropertyName("is_complete")]
    public bool IsComplete { get; set; }

    [JsonPropertyName("missing_fields")]
    public JsonElement MissingFields { get; set; }
}

public sealed class ResumeUploadResultDto
{
    [JsonPropertyName("parsed_fields")]
    public JsonElement ParsedFields { get; set; }
}

public sealed class PictureUploadResultDto
{
    [JsonPropertyName("profile_picture_url")]
    public string? ProfilePictureUrl { get; set; }
}

public sealed class ProfileUpdatePayload
{
    public string FullName { get; set; } = "";
    public string Headline { get; set; } = "";
    public string Summary { get; set; } = "";
    public string Location { get; set; } = "";
    public string Phone { get; set; } = "";
    public Dictionary<string, string> SocialLinks { get; set; } = new(StringComparer.OrdinalIgnoreCase);
    public List<string> Skills { get; set; } = [];
}
