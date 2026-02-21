using Atlas.Core.Entities;
using Microsoft.EntityFrameworkCore;

namespace Atlas.Infrastructure.Data;

public class AtlasDbContext : DbContext
{
    public AtlasDbContext(DbContextOptions<AtlasDbContext> options) : base(options) { }

    public DbSet<User> Users => Set<User>();
    public DbSet<UserProfile> UserProfiles => Set<UserProfile>();
    public DbSet<JobPosting> JobPostings => Set<JobPosting>();
    public DbSet<CompanyDeepDive> CompanyDeepDives => Set<CompanyDeepDive>();
    public DbSet<Application> Applications => Set<Application>();
    public DbSet<ApplicationEvent> ApplicationEvents => Set<ApplicationEvent>();
    public DbSet<GeneratedResume> GeneratedResumes => Set<GeneratedResume>();
    public DbSet<GeneratedCoverLetter> GeneratedCoverLetters => Set<GeneratedCoverLetter>();
    public DbSet<SiteVisit> SiteVisits => Set<SiteVisit>();
    public DbSet<ApiUsage> ApiUsage => Set<ApiUsage>();
    public DbSet<SecurityEvent> SecurityEvents => Set<SecurityEvent>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(AtlasDbContext).Assembly);
    }
}
