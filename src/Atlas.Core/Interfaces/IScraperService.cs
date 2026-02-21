using Atlas.Core.Entities;

namespace Atlas.Core.Interfaces;

public interface IScraperService
{
    Task<JobPosting> ScrapeJobPostingAsync(string url, CancellationToken ct = default);
    Task<JobPosting> ExtractJobFromHtmlAsync(string html, string url, CancellationToken ct = default);
}
