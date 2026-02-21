using Atlas.Core.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Atlas.Infrastructure.Data.Configurations;

public class GeneratedResumeConfiguration : IEntityTypeConfiguration<GeneratedResume>
{
    public void Configure(EntityTypeBuilder<GeneratedResume> builder)
    {
        builder.ToTable("generated_resumes");

        builder.HasKey(r => r.Id);
        builder.Property(r => r.Id).HasColumnName("id");
        builder.Property(r => r.JobPostingId).HasColumnName("job_posting_id");
        builder.Property(r => r.TemplateId).HasColumnName("template_id").HasMaxLength(50).HasDefaultValue("default");
        builder.Property(r => r.ContentJson).HasColumnName("content_json").HasColumnType("jsonb");
        builder.Property(r => r.RenderedHtml).HasColumnName("rendered_html").HasColumnType("text");
        builder.Property(r => r.FilePath).HasColumnName("file_path").HasMaxLength(512);
        builder.Property(r => r.MatchScore).HasColumnName("match_score");
        builder.Property(r => r.MatchedKeywords).HasColumnName("matched_keywords").HasColumnType("jsonb");
        builder.Property(r => r.Gaps).HasColumnName("gaps").HasColumnType("jsonb");
        builder.Property(r => r.ModelUsed).HasColumnName("model_used").HasMaxLength(100);
        builder.Property(r => r.PromptVersion).HasColumnName("prompt_version").HasMaxLength(50);
        builder.Property(r => r.CreatedAt).HasColumnName("created_at");
    }
}
