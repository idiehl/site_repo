using Atlas.Core.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Atlas.Infrastructure.Data.Configurations;

public class CompanyDeepDiveConfiguration : IEntityTypeConfiguration<CompanyDeepDive>
{
    public void Configure(EntityTypeBuilder<CompanyDeepDive> builder)
    {
        builder.ToTable("company_deep_dives");

        builder.HasKey(d => d.Id);
        builder.Property(d => d.Id).HasColumnName("id");
        builder.Property(d => d.JobPostingId).HasColumnName("job_posting_id");
        builder.Property(d => d.CompanyOverview).HasColumnName("company_overview").HasColumnType("text");
        builder.Property(d => d.CultureInsights).HasColumnName("culture_insights").HasColumnType("text");
        builder.Property(d => d.RoleAnalysis).HasColumnName("role_analysis").HasColumnType("text");
        builder.Property(d => d.InterviewTips).HasColumnName("interview_tips").HasColumnType("text");
        builder.Property(d => d.SummaryJson).HasColumnName("summary_json").HasColumnType("jsonb");
        builder.Property(d => d.Sources).HasColumnName("sources").HasColumnType("jsonb");
        builder.Property(d => d.ModelUsed).HasColumnName("model_used").HasMaxLength(100);
        builder.Property(d => d.PromptVersion).HasColumnName("prompt_version").HasMaxLength(50);
        builder.Property(d => d.GeneratedAt).HasColumnName("generated_at");

        builder.HasIndex(d => d.JobPostingId).IsUnique();
    }
}
