using Atlas.Core.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Atlas.Infrastructure.Data.Configurations;

public class ApiUsageConfiguration : IEntityTypeConfiguration<ApiUsage>
{
    public void Configure(EntityTypeBuilder<ApiUsage> builder)
    {
        builder.ToTable("api_usage");

        builder.HasKey(a => a.Id);
        builder.Property(a => a.Id).HasColumnName("id");
        builder.Property(a => a.UserId).HasColumnName("user_id");
        builder.Property(a => a.Endpoint).HasColumnName("endpoint").HasMaxLength(500).IsRequired();
        builder.Property(a => a.Method).HasColumnName("method").HasMaxLength(10).IsRequired();
        builder.Property(a => a.StatusCode).HasColumnName("status_code");
        builder.Property(a => a.ResponseTimeMs).HasColumnName("response_time_ms");
        builder.Property(a => a.IpAddress).HasColumnName("ip_address").HasMaxLength(45);
        builder.Property(a => a.ErrorMessage).HasColumnName("error_message").HasColumnType("text");
        builder.Property(a => a.CreatedAt).HasColumnName("created_at");

        builder.HasIndex(a => a.UserId);
        builder.HasIndex(a => a.Endpoint);
        builder.HasIndex(a => a.StatusCode);
        builder.HasIndex(a => a.CreatedAt);
    }
}
