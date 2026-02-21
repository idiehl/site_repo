using Atlas.Core.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Atlas.Infrastructure.Data.Configurations;

public class UserProfileConfiguration : IEntityTypeConfiguration<UserProfile>
{
    public void Configure(EntityTypeBuilder<UserProfile> builder)
    {
        builder.ToTable("user_profiles");

        builder.HasKey(p => p.Id);
        builder.Property(p => p.Id).HasColumnName("id");
        builder.Property(p => p.UserId).HasColumnName("user_id");
        builder.Property(p => p.FullName).HasColumnName("full_name").HasMaxLength(255);
        builder.Property(p => p.Headline).HasColumnName("headline").HasMaxLength(500);
        builder.Property(p => p.Summary).HasColumnName("summary").HasColumnType("text");
        builder.Property(p => p.ProfilePictureUrl).HasColumnName("profile_picture_url").HasMaxLength(500);
        builder.Property(p => p.Location).HasColumnName("location").HasMaxLength(255);
        builder.Property(p => p.Phone).HasColumnName("phone").HasMaxLength(50);
        builder.Property(p => p.SocialLinks).HasColumnName("social_links").HasColumnType("jsonb");
        builder.Property(p => p.ResumeFileUrl).HasColumnName("resume_file_url").HasMaxLength(500);
        builder.Property(p => p.ResumeParsedAt).HasColumnName("resume_parsed_at");
        builder.Property(p => p.CompletenessScore).HasColumnName("completeness_score").HasDefaultValue(0);
        builder.Property(p => p.WorkHistory).HasColumnName("work_history").HasColumnType("jsonb");
        builder.Property(p => p.Education).HasColumnName("education").HasColumnType("jsonb");
        builder.Property(p => p.Skills).HasColumnName("skills").HasColumnType("jsonb");
        builder.Property(p => p.Projects).HasColumnName("projects").HasColumnType("jsonb");
        builder.Property(p => p.Certifications).HasColumnName("certifications").HasColumnType("jsonb");
        builder.Property(p => p.ContactInfo).HasColumnName("contact_info").HasColumnType("jsonb");
        builder.Property(p => p.CreatedAt).HasColumnName("created_at");
        builder.Property(p => p.UpdatedAt).HasColumnName("updated_at");

        builder.HasIndex(p => p.UserId).IsUnique();
    }
}
