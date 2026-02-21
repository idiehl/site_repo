using Atlas.Core.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Atlas.Infrastructure.Data.Configurations;

public class ApplicationEventConfiguration : IEntityTypeConfiguration<ApplicationEvent>
{
    public void Configure(EntityTypeBuilder<ApplicationEvent> builder)
    {
        builder.ToTable("application_events");

        builder.HasKey(e => e.Id);
        builder.Property(e => e.Id).HasColumnName("id");
        builder.Property(e => e.ApplicationId).HasColumnName("application_id");
        builder.Property(e => e.FromStatus).HasColumnName("from_status")
            .HasConversion<string>()
            .HasMaxLength(50);
        builder.Property(e => e.ToStatus).HasColumnName("to_status")
            .HasConversion<string>()
            .HasMaxLength(50);
        builder.Property(e => e.Notes).HasColumnName("notes").HasColumnType("text");
        builder.Property(e => e.CreatedAt).HasColumnName("created_at");
    }
}
