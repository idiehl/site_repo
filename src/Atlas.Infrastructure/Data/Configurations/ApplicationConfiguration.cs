using Atlas.Core.Entities;
using Atlas.Core.Enums;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Atlas.Infrastructure.Data.Configurations;

public class ApplicationConfiguration : IEntityTypeConfiguration<Application>
{
    public void Configure(EntityTypeBuilder<Application> builder)
    {
        builder.ToTable("applications");

        builder.HasKey(a => a.Id);
        builder.Property(a => a.Id).HasColumnName("id");
        builder.Property(a => a.UserId).HasColumnName("user_id");
        builder.Property(a => a.JobPostingId).HasColumnName("job_posting_id");
        builder.Property(a => a.Status).HasColumnName("status")
            .HasConversion<string>()
            .HasMaxLength(50)
            .HasDefaultValue(ApplicationStatus.Pending);
        builder.Property(a => a.AppliedAt).HasColumnName("applied_at");
        builder.Property(a => a.ReminderAt).HasColumnName("reminder_at");
        builder.Property(a => a.Notes).HasColumnName("notes").HasColumnType("text");
        builder.Property(a => a.CreatedAt).HasColumnName("created_at");
        builder.Property(a => a.UpdatedAt).HasColumnName("updated_at");

        builder.HasMany(a => a.Events)
            .WithOne(e => e.Application)
            .HasForeignKey(e => e.ApplicationId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
