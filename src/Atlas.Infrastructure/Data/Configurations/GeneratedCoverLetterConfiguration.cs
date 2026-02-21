using Atlas.Core.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Atlas.Infrastructure.Data.Configurations;

public class GeneratedCoverLetterConfiguration : IEntityTypeConfiguration<GeneratedCoverLetter>
{
    public void Configure(EntityTypeBuilder<GeneratedCoverLetter> builder)
    {
        builder.ToTable("generated_cover_letters");

        builder.HasKey(c => c.Id);
        builder.Property(c => c.Id).HasColumnName("id");
        builder.Property(c => c.JobPostingId).HasColumnName("job_posting_id");
        builder.Property(c => c.ContentJson).HasColumnName("content_json").HasColumnType("jsonb");
        builder.Property(c => c.FullText).HasColumnName("full_text").HasColumnType("text");
        builder.Property(c => c.ModelUsed).HasColumnName("model_used").HasMaxLength(100);
        builder.Property(c => c.PromptVersion).HasColumnName("prompt_version").HasMaxLength(50);
        builder.Property(c => c.CreatedAt).HasColumnName("created_at");
    }
}
