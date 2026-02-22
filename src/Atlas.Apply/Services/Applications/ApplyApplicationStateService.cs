namespace Atlas.Apply.Services.Applications;

public sealed class ApplyApplicationStateService
{
    private readonly ApplyApplicationsApiClient _apiClient;

    public ApplyApplicationStateService(ApplyApplicationsApiClient apiClient)
    {
        _apiClient = apiClient;
    }

    public List<ApplicationListItemDto> Applications { get; } = [];
    public ApplicationListItemDto? CurrentApplication { get; private set; }
    public bool IsLoading { get; private set; }
    public string? Error { get; private set; }

    public async Task<ApiResult<List<ApplicationListItemDto>>> FetchApplicationsAsync(string accessToken, CancellationToken cancellationToken = default)
    {
        IsLoading = true;
        Error = null;

        var result = await _apiClient.GetApplicationsAsync(accessToken, cancellationToken);
        IsLoading = false;

        if (!result.IsSuccess || result.Value is null)
        {
            Error = result.Error ?? "Failed to fetch applications.";
            return result;
        }

        Applications.Clear();
        Applications.AddRange(result.Value);
        return result;
    }

    public async Task<ApiResult<ApplicationListItemDto>> UpdateApplicationStatusAsync(
        string accessToken,
        Guid applicationId,
        string status,
        string? notes = null,
        CancellationToken cancellationToken = default)
    {
        IsLoading = true;
        Error = null;

        var result = await _apiClient.UpdateApplicationStatusAsync(accessToken, applicationId, status, notes, cancellationToken);
        IsLoading = false;

        if (!result.IsSuccess || result.Value is null)
        {
            Error = result.Error ?? "Failed to update application.";
            return result;
        }

        var index = Applications.FindIndex(a => a.Id == applicationId);
        if (index >= 0)
        {
            Applications[index] = result.Value;
        }

        if (CurrentApplication?.Id == applicationId)
        {
            CurrentApplication = result.Value;
        }

        return result;
    }

    public ApplicationListItemDto? GetApplicationForJob(Guid jobId)
    {
        return Applications.FirstOrDefault(app => app.JobPostingId == jobId);
    }

    public void SetCurrent(ApplicationListItemDto? application)
    {
        CurrentApplication = application;
    }
}
