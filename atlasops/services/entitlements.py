"""Subscription tiers and feature entitlements."""

from datetime import datetime, timezone

from fastapi import HTTPException, status

from atlasops.config import get_settings
from atlasops.models.user import User

PAID_STATUSES = {"active", "trialing", "past_due"}


def can_access_premium_features(user: User) -> bool:
    """Return True if the user can access premium features."""
    if user.is_admin:
        return True
    return (
        user.subscription_tier == "paid"
        and user.subscription_status in PAID_STATUSES
    )


def get_resume_generation_limit(user: User) -> int:
    """Return the resume generation limit for the user."""
    settings = get_settings()
    if can_access_premium_features(user):
        return settings.paid_resume_generation_limit
    return settings.free_resume_generation_limit


def reset_resume_quota_if_needed(user: User) -> bool:
    """Reset the monthly resume quota if the reset date has passed."""
    now = datetime.now(timezone.utc)
    reset_at = user.resume_generation_reset_at

    if not reset_at or reset_at <= now:
        # Reset on the first day of the next month
        year = now.year + (1 if now.month == 12 else 0)
        month = 1 if now.month == 12 else now.month + 1
        user.resume_generations_used = 0
        user.resume_generation_reset_at = datetime(
            year, month, 1, tzinfo=timezone.utc
        )
        return True
    return False


def enforce_resume_quota(user: User) -> None:
    """Raise an error if the user exceeds the resume generation quota."""
    if can_access_premium_features(user):
        return

    limit = get_resume_generation_limit(user)
    if user.resume_generations_used >= limit:
        raise HTTPException(
            status_code=status.HTTP_402_PAYMENT_REQUIRED,
            detail=(
                f"Free plan allows {limit} resume generations per month. "
                "Upgrade to continue."
            ),
        )
