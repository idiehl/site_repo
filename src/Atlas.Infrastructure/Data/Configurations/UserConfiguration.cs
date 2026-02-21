using Atlas.Core.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Atlas.Infrastructure.Data.Configurations;

public class UserConfiguration : IEntityTypeConfiguration<User>
{
    public void Configure(EntityTypeBuilder<User> builder)
    {
        builder.ToTable("users");

        builder.HasKey(u => u.Id);
        builder.Property(u => u.Id).HasColumnName("id");
        builder.Property(u => u.Email).HasColumnName("email").HasMaxLength(255).IsRequired();
        builder.Property(u => u.HashedPassword).HasColumnName("hashed_password").HasMaxLength(255);
        builder.Property(u => u.PasswordResetTokenHash).HasColumnName("password_reset_token_hash").HasMaxLength(128);
        builder.Property(u => u.PasswordResetRequestedAt).HasColumnName("password_reset_requested_at");
        builder.Property(u => u.PasswordResetExpiresAt).HasColumnName("password_reset_expires_at");
        builder.Property(u => u.OauthProvider).HasColumnName("oauth_provider").HasMaxLength(50);
        builder.Property(u => u.OauthProviderId).HasColumnName("oauth_provider_id").HasMaxLength(255);
        builder.Property(u => u.IsAdmin).HasColumnName("is_admin").HasDefaultValue(false);
        builder.Property(u => u.SubscriptionTier).HasColumnName("subscription_tier").HasMaxLength(50).HasDefaultValue("free");
        builder.Property(u => u.SubscriptionStatus).HasColumnName("subscription_status").HasMaxLength(50).HasDefaultValue("free");
        builder.Property(u => u.StripeCustomerId).HasColumnName("stripe_customer_id").HasMaxLength(255);
        builder.Property(u => u.StripeSubscriptionId).HasColumnName("stripe_subscription_id").HasMaxLength(255);
        builder.Property(u => u.CurrentPeriodEnd).HasColumnName("current_period_end");
        builder.Property(u => u.ResumeGenerationsUsed).HasColumnName("resume_generations_used").HasDefaultValue(0);
        builder.Property(u => u.ResumeGenerationResetAt).HasColumnName("resume_generation_reset_at");
        builder.Property(u => u.CreatedAt).HasColumnName("created_at");
        builder.Property(u => u.UpdatedAt).HasColumnName("updated_at");

        builder.HasIndex(u => u.Email).IsUnique();
        builder.HasIndex(u => u.PasswordResetTokenHash);
        builder.HasIndex(u => new { u.OauthProvider, u.OauthProviderId })
            .IsUnique()
            .HasFilter("oauth_provider IS NOT NULL");

        builder.HasOne(u => u.Profile)
            .WithOne(p => p.User)
            .HasForeignKey<UserProfile>(p => p.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasMany(u => u.JobPostings)
            .WithOne(j => j.User)
            .HasForeignKey(j => j.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasMany(u => u.Applications)
            .WithOne(a => a.User)
            .HasForeignKey(a => a.UserId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
