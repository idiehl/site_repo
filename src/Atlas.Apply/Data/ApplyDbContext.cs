using Atlas.Apply.Domain;
using Microsoft.EntityFrameworkCore;

namespace Atlas.Apply.Data;

public class ApplyDbContext(DbContextOptions<ApplyDbContext> options) : DbContext(options)
{
    public DbSet<UserAccount> Users => Set<UserAccount>();
    public DbSet<UserProfile> Profiles => Set<UserProfile>();
    public DbSet<Opportunity> Opportunities => Set<Opportunity>();
    public DbSet<ApplicationRecord> Applications => Set<ApplicationRecord>();
    public DbSet<WorkflowEvent> WorkflowEvents => Set<WorkflowEvent>();
    public DbSet<ExtensionIngestion> ExtensionIngestions => Set<ExtensionIngestion>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<UserAccount>(entity =>
        {
            entity.HasIndex(x => x.Email).IsUnique();
            entity.Property(x => x.Email).HasMaxLength(256);
            entity.Property(x => x.PasswordHash).HasMaxLength(512);
            entity.Property(x => x.DisplayName).HasMaxLength(128);
        });

        modelBuilder.Entity<UserProfile>(entity =>
        {
            entity.HasIndex(x => x.UserId);
            entity.Property(x => x.Headline).HasMaxLength(256);
            entity.Property(x => x.Location).HasMaxLength(128);
            entity.Property(x => x.PhoneNumber).HasMaxLength(64);
            entity.Property(x => x.LinkedInUrl).HasMaxLength(300);
            entity.Property(x => x.GithubUrl).HasMaxLength(300);
            entity.Property(x => x.PortfolioUrl).HasMaxLength(300);
            entity.Property(x => x.ProfileImagePath).HasMaxLength(300);
            entity.Property(x => x.ProfileImageFileName).HasMaxLength(260);
            entity.Property(x => x.ProfileImageContentType).HasMaxLength(120);
            entity.Property(x => x.ImportedResumeFileName).HasMaxLength(260);
            entity.Property(x => x.ImportedResumeContentType).HasMaxLength(120);
            entity.Property(x => x.SkillsJson).HasColumnType("jsonb");
            entity.Property(x => x.ExperienceJson).HasColumnType("jsonb");
            entity.Property(x => x.EducationJson).HasColumnType("jsonb");
            entity.Property(x => x.ProjectsJson).HasColumnType("jsonb");
            entity.Property(x => x.CertificationsJson).HasColumnType("jsonb");
            entity.Property(x => x.PreferencesJson).HasColumnType("jsonb");
            entity.Property(x => x.SectionDocumentsJson).HasColumnType("jsonb");
        });

        modelBuilder.Entity<Opportunity>(entity =>
        {
            entity.HasIndex(x => x.UserId);
            entity.HasIndex(x => x.CreatedUtc);
            entity.Property(x => x.SourceType).HasMaxLength(24);
            entity.Property(x => x.Company).HasMaxLength(180);
            entity.Property(x => x.RoleTitle).HasMaxLength(180);
            entity.Property(x => x.Location).HasMaxLength(120);
            entity.Property(x => x.PostingUrl).HasMaxLength(500);
            entity.Property(x => x.MetadataJson).HasColumnType("jsonb");
        });

        modelBuilder.Entity<ApplicationRecord>(entity =>
        {
            entity.HasIndex(x => x.UserId);
            entity.HasIndex(x => x.Status);
            entity.HasIndex(x => x.UpdatedUtc);
            entity.Property(x => x.Status).HasMaxLength(24);
            entity.Property(x => x.Priority).HasMaxLength(16);
        });

        modelBuilder.Entity<WorkflowEvent>(entity =>
        {
            entity.HasIndex(x => x.UserId);
            entity.HasIndex(x => x.CreatedUtc);
            entity.Property(x => x.EventType).HasMaxLength(96);
            entity.Property(x => x.PayloadJson).HasColumnType("jsonb");
        });

        modelBuilder.Entity<ExtensionIngestion>(entity =>
        {
            entity.HasIndex(x => x.ProcessingStatus);
            entity.HasIndex(x => x.CreatedUtc);
            entity.Property(x => x.SourceDomain).HasMaxLength(120);
            entity.Property(x => x.PageUrl).HasMaxLength(500);
            entity.Property(x => x.ProcessingStatus).HasMaxLength(24);
            entity.Property(x => x.PayloadJson).HasColumnType("jsonb");
        });

        modelBuilder.Entity<UserProfile>()
            .HasOne<UserAccount>()
            .WithMany()
            .HasForeignKey(x => x.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<Opportunity>()
            .HasOne<UserAccount>()
            .WithMany()
            .HasForeignKey(x => x.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<ApplicationRecord>()
            .HasOne<UserAccount>()
            .WithMany()
            .HasForeignKey(x => x.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<ApplicationRecord>()
            .HasOne<Opportunity>()
            .WithMany()
            .HasForeignKey(x => x.OpportunityId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
