namespace Atlas.Core.Entities;

public class User
{
    public Guid Id { get; set; }
    public string Email { get; set; } = "";
    public string? HashedPassword { get; set; }

    // Password reset
    public string? PasswordResetTokenHash { get; set; }
    public DateTime? PasswordResetRequestedAt { get; set; }
    public DateTime? PasswordResetExpiresAt { get; set; }

    // OAuth
    public string? OauthProvider { get; set; }
    public string? OauthProviderId { get; set; }

    // Admin
    public bool IsAdmin { get; set; }

    // Subscription / billing
    public string SubscriptionTier { get; set; } = "free";
    public string SubscriptionStatus { get; set; } = "free";
    public string? StripeCustomerId { get; set; }
    public string? StripeSubscriptionId { get; set; }
    public DateTime? CurrentPeriodEnd { get; set; }

    // Usage tracking
    public int ResumeGenerationsUsed { get; set; }
    public DateTime? ResumeGenerationResetAt { get; set; }

    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    // Navigation properties
    public UserProfile? Profile { get; set; }
    public ICollection<JobPosting> JobPostings { get; set; } = [];
    public ICollection<Application> Applications { get; set; } = [];
}
