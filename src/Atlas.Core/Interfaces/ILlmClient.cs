using Atlas.Core.Entities;

namespace Atlas.Core.Interfaces;

public interface ILlmClient
{
    Task<GeneratedResume> GenerateResumeAsync(JobPosting job, UserProfile profile, string templateId, CancellationToken ct = default);
    Task<GeneratedCoverLetter> GenerateCoverLetterAsync(JobPosting job, UserProfile profile, CancellationToken ct = default);
    Task<CompanyDeepDive> GenerateDeepDiveAsync(JobPosting job, CancellationToken ct = default);
    Task<object> ExtractRequirementsAsync(JobPosting job, CancellationToken ct = default);
    Task<string> GenerateFollowUpAsync(Application application, JobPosting job, UserProfile profile, CancellationToken ct = default);
    Task<string> GenerateInterviewPrepAsync(Application application, JobPosting job, UserProfile profile, CancellationToken ct = default);
    Task<string> GenerateImprovementAsync(Application application, JobPosting job, UserProfile profile, CancellationToken ct = default);
}
