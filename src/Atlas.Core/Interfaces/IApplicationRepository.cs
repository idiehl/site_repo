using Atlas.Core.Entities;

namespace Atlas.Core.Interfaces;

public interface IApplicationRepository
{
    Task<Application?> GetByIdAsync(Guid id, CancellationToken ct = default);
    Task<IReadOnlyList<Application>> GetByUserIdAsync(Guid userId, CancellationToken ct = default);
    Task<IReadOnlyList<Application>> GetByJobPostingIdAsync(Guid jobPostingId, CancellationToken ct = default);
    Task<Application> CreateAsync(Application application, CancellationToken ct = default);
    Task UpdateAsync(Application application, CancellationToken ct = default);
}
