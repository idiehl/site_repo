using Atlas.Core.Entities;

namespace Atlas.Core.Interfaces;

public interface IJobRepository
{
    Task<JobPosting?> GetByIdAsync(Guid id, CancellationToken ct = default);
    Task<IReadOnlyList<JobPosting>> GetByUserIdAsync(Guid userId, CancellationToken ct = default);
    Task<IReadOnlyList<JobPosting>> GetFailedByUserIdAsync(Guid userId, CancellationToken ct = default);
    Task<JobPosting> CreateAsync(JobPosting jobPosting, CancellationToken ct = default);
    Task UpdateAsync(JobPosting jobPosting, CancellationToken ct = default);
    Task DeleteAsync(Guid id, CancellationToken ct = default);
}
