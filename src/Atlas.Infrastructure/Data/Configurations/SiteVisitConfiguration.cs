using Atlas.Core.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Atlas.Infrastructure.Data.Configurations;

public class SiteVisitConfiguration : IEntityTypeConfiguration<SiteVisit>
{
    public void Configure(EntityTypeBuilder<SiteVisit> builder)
    {
        builder.ToTable("site_visits");

        builder.HasKey(v => v.Id);
        builder.Property(v => v.Id).HasColumnName("id");
        builder.Property(v => v.UserId).HasColumnName("user_id");
        builder.Property(v => v.Path).HasColumnName("path").HasMaxLength(500).IsRequired();
        builder.Property(v => v.Method).HasColumnName("method").HasMaxLength(10).IsRequired();
        builder.Property(v => v.IpAddress).HasColumnName("ip_address").HasMaxLength(45);
        builder.Property(v => v.UserAgent).HasColumnName("user_agent").HasColumnType("text");
        builder.Property(v => v.Referer).HasColumnName("referer").HasMaxLength(500);
        builder.Property(v => v.SessionId).HasColumnName("session_id").HasMaxLength(255);
        builder.Property(v => v.CreatedAt).HasColumnName("created_at");

        builder.HasIndex(v => v.UserId);
        builder.HasIndex(v => v.Path);
        builder.HasIndex(v => v.SessionId);
        builder.HasIndex(v => v.CreatedAt);
    }
}
