using Atlas.Core.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Atlas.Infrastructure.Data.Configurations;

public class SecurityEventConfiguration : IEntityTypeConfiguration<SecurityEvent>
{
    public void Configure(EntityTypeBuilder<SecurityEvent> builder)
    {
        builder.ToTable("security_events");

        builder.HasKey(s => s.Id);
        builder.Property(s => s.Id).HasColumnName("id");
        builder.Property(s => s.EventType).HasColumnName("event_type").HasMaxLength(100).IsRequired();
        builder.Property(s => s.Severity).HasColumnName("severity").HasMaxLength(20).IsRequired();
        builder.Property(s => s.UserId).HasColumnName("user_id");
        builder.Property(s => s.IpAddress).HasColumnName("ip_address").HasMaxLength(45);
        builder.Property(s => s.UserAgent).HasColumnName("user_agent").HasColumnType("text");
        builder.Property(s => s.Details).HasColumnName("details").HasColumnType("jsonb");
        builder.Property(s => s.Resolved).HasColumnName("resolved").HasDefaultValue(false);
        builder.Property(s => s.ResolvedAt).HasColumnName("resolved_at");
        builder.Property(s => s.ResolvedBy).HasColumnName("resolved_by");
        builder.Property(s => s.CreatedAt).HasColumnName("created_at");

        builder.HasIndex(s => s.EventType);
        builder.HasIndex(s => s.Severity);
        builder.HasIndex(s => s.UserId);
        builder.HasIndex(s => s.IpAddress);
        builder.HasIndex(s => s.Resolved);
        builder.HasIndex(s => s.CreatedAt);
    }
}
