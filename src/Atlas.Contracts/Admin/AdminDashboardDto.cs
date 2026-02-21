namespace Atlas.Contracts.Admin;

public sealed record AdminDashboardDto(
    int TotalUsers,
    int TotalJobs,
    int TotalApplications,
    int ActiveUsers,
    int RecentVisits,
    int ApiCallsToday,
    int SecurityEventsUnresolved);
