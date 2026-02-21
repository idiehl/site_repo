using Atlas.Core.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Atlas.Infrastructure.Data.Configurations;

public class JobPostingConfiguration : IEntityTypeConfiguration<JobPosting>
{
    public void Configure(EntityTypeBuilder<JobPosting> builder)
    {
        builder.ToTable("job_postings");

        builder.HasKey(j => j.Id);
        builder.Property(j => j.Id).HasColumnName("id");
        builder.Property(j => j.UserId).HasColumnName("user_id");
        builder.Property(j => j.Url).HasColumnName("url").HasMaxLength(2048).IsRequired();
        builder.Property(j => j.UrlHash).HasColumnName("url_hash").HasMaxLength(64);
        builder.Property(j => j.RawText).HasColumnName("raw_text").HasColumnType("text");
        builder.Property(j => j.CompanyName).HasColumnName("company_name").HasMaxLength(255);
        builder.Property(j => j.JobTitle).HasColumnName("job_title").HasMaxLength(255);
        builder.Property(j => j.Location).HasColumnName("location").HasMaxLength(255);
        builder.Property(j => j.RemotePolicy).HasColumnName("remote_policy").HasMaxLength(100);
        builder.Property(j => j.SalaryRange).HasColumnName("salary_range").HasMaxLength(100);
        builder.Property(j => j.JobDescription).HasColumnName("job_description").HasColumnType("text");
        builder.Property(j => j.Requirements).HasColumnName("requirements").HasColumnType("jsonb");
        builder.Property(j => j.Benefits).HasColumnName("benefits").HasColumnType("jsonb");
        builder.Property(j => j.StructuredData).HasColumnName("structured_data").HasColumnType("jsonb");
        builder.Property(j => j.Status).HasColumnName("status").HasMaxLength(50).HasDefaultValue("pending");
        builder.Property(j => j.ExtractionConfidence).HasColumnName("extraction_confidence");
        builder.Property(j => j.ErrorMessage).HasColumnName("error_message").HasColumnType("text");
        builder.Property(j => j.ApplicationStatus).HasColumnName("application_status").HasMaxLength(50);
        builder.Property(j => j.InterviewDate).HasColumnName("interview_date");
        builder.Property(j => j.InterviewNotes).HasColumnName("interview_notes").HasColumnType("text");
        builder.Property(j => j.AppliedAt).HasColumnName("applied_at");
        builder.Property(j => j.CreatedAt).HasColumnName("created_at");
        builder.Property(j => j.UpdatedAt).HasColumnName("updated_at");

        builder.HasIndex(j => j.UrlHash);

        builder.HasMany(j => j.Applications)
            .WithOne(a => a.JobPosting)
            .HasForeignKey(a => a.JobPostingId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasMany(j => j.Resumes)
            .WithOne(r => r.JobPosting)
            .HasForeignKey(r => r.JobPostingId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasMany(j => j.CoverLetters)
            .WithOne(c => c.JobPosting)
            .HasForeignKey(c => c.JobPostingId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(j => j.DeepDive)
            .WithOne(d => d.JobPosting)
            .HasForeignKey<CompanyDeepDive>(d => d.JobPostingId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
