namespace Atlas.Apply.Services.Jobs;

public sealed class ApplyJobStateService
{
    private readonly ApplyJobDetailApiClient _apiClient;

    public ApplyJobStateService(ApplyJobDetailApiClient apiClient)
    {
        _apiClient = apiClient;
    }

    public bool IsLoading { get; private set; }
    public string? Error { get; private set; }
    public JobDetailDto? CurrentJob { get; private set; }

    public async Task<ApiResult<JobDetailDto>> GetJobAsync(string accessToken, Guid jobId, CancellationToken cancellationToken = default)
    {
        IsLoading = true;
        Error = null;

        var result = await _apiClient.GetJobAsync(accessToken, jobId, cancellationToken);
        IsLoading = false;

        if (!result.IsSuccess || result.Value is null)
        {
            Error = result.Error ?? "Failed to fetch job details.";
            return result;
        }

        CurrentJob = result.Value;
        return result;
    }

    public async Task<ApiResult<JobDetailDto>> UpdateApplicationStatusAsync(
        string accessToken,
        Guid jobId,
        string? status,
        string? interviewDate = null,
        string? interviewNotes = null,
        CancellationToken cancellationToken = default)
    {
        var result = await _apiClient.UpdateApplicationStatusAsync(
            accessToken,
            jobId,
            status,
            interviewDate,
            interviewNotes,
            cancellationToken);
        if (!result.IsSuccess || result.Value is null)
        {
            Error = result.Error ?? "Failed to update application status.";
            return result;
        }

        CurrentJob = result.Value;
        return result;
    }

    public async Task<ApiResult<JobDetailDto>> ExtractRequirementsAsync(string accessToken, Guid jobId, CancellationToken cancellationToken = default)
    {
        var result = await _apiClient.ExtractRequirementsAsync(accessToken, jobId, cancellationToken);
        if (!result.IsSuccess || result.Value is null)
        {
            Error = result.Error ?? "Failed to extract requirements.";
            return result;
        }

        CurrentJob = result.Value;
        return result;
    }

    public Task<ApiResult<bool>> RetryJobAsync(string accessToken, Guid jobId, CancellationToken cancellationToken = default)
    {
        return _apiClient.RetryJobAsync(accessToken, jobId, cancellationToken);
    }

    public async Task<ApiResult<JobDetailDto>> SaveManualContentAsync(
        string accessToken,
        Guid jobId,
        string manualContent,
        CancellationToken cancellationToken = default)
    {
        var result = await _apiClient.SaveManualContentAsync(accessToken, jobId, manualContent, cancellationToken);
        if (!result.IsSuccess || result.Value is null)
        {
            Error = result.Error ?? "Failed to save manual content.";
            return result;
        }

        CurrentJob = result.Value;
        return result;
    }
}
