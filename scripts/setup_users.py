"""Script to set up test users for development and testing.

This script creates:
1. Admin user (iajdiehl@gmail.com) with full access
2. Free tier test user for testing limitations

Usage:
    python scripts/setup_users.py
    python scripts/setup_users.py --list
"""

import asyncio
import sys
from datetime import datetime, timezone
from pathlib import Path

# Add parent directory to path to import atlasops
sys.path.insert(0, str(Path(__file__).parent.parent))

from passlib.context import CryptContext
from sqlalchemy import select

from atlasops.db import async_session_maker
from atlasops.models.user import User, UserProfile

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


# User configurations
USERS_CONFIG = [
    {
        "email": "iajdiehl@gmail.com",
        "password": None,  # No password change if user exists, will prompt for new users
        "is_admin": True,
        "subscription_tier": "paid",
        "subscription_status": "active",
        "description": "Admin user with full access",
        "profile": {
            "full_name": "Ian Diehl",
        },
    },
    {
        "email": "testuser.free@atlasops.test",
        "password": "TestFree123!",
        "is_admin": False,
        "subscription_tier": "free",
        "subscription_status": "free",
        "description": "Free tier test user",
        "profile": {
            "full_name": "Test User (Free)",
            "headline": "Job Seeker - Free Tier",
            "summary": "A test user account for testing free tier functionality.",
            "skills": ["Python", "JavaScript", "SQL"],
        },
    },
]


async def get_or_create_user(
    db,
    email: str,
    password: str | None,
    is_admin: bool,
    subscription_tier: str,
    subscription_status: str,
    profile_data: dict | None = None,
) -> tuple[User, bool]:
    """Get existing user or create new one. Returns (user, created)."""
    result = await db.execute(select(User).where(User.email == email))
    user = result.scalar_one_or_none()
    created = False

    if user:
        # Update existing user
        user.is_admin = is_admin
        user.subscription_tier = subscription_tier
        user.subscription_status = subscription_status
        print(f"  Updated existing user: {email}")
    else:
        # Create new user
        if not password:
            # Generate a secure random password for new users without specified password
            import secrets
            password = secrets.token_urlsafe(16)
            print(f"  Generated password for {email}: {password}")
        
        user = User(
            email=email,
            hashed_password=pwd_context.hash(password),
            is_admin=is_admin,
            subscription_tier=subscription_tier,
            subscription_status=subscription_status,
        )
        db.add(user)
        await db.flush()
        created = True
        print(f"  Created new user: {email}")

    # Handle profile
    profile_result = await db.execute(
        select(UserProfile).where(UserProfile.user_id == user.id)
    )
    profile = profile_result.scalar_one_or_none()

    if profile_data:
        if not profile:
            profile = UserProfile(user_id=user.id)
            db.add(profile)

        for key, value in profile_data.items():
            if hasattr(profile, key):
                setattr(profile, key, value)

    return user, created


async def setup_users() -> None:
    """Set up all configured test users."""
    print("\n" + "=" * 60)
    print("AtlasOps User Setup")
    print("=" * 60 + "\n")

    async with async_session_maker() as db:
        created_count = 0
        updated_count = 0

        for config in USERS_CONFIG:
            print(f"\n[{config['description']}]")
            user, created = await get_or_create_user(
                db,
                email=config["email"],
                password=config.get("password"),
                is_admin=config["is_admin"],
                subscription_tier=config["subscription_tier"],
                subscription_status=config["subscription_status"],
                profile_data=config.get("profile"),
            )

            if created:
                created_count += 1
            else:
                updated_count += 1

            # Print user details
            print(f"    ID: {user.id}")
            print(f"    Admin: {'Yes' if user.is_admin else 'No'}")
            print(f"    Tier: {user.subscription_tier}")
            print(f"    Status: {user.subscription_status}")

        await db.commit()

        print("\n" + "-" * 60)
        print(f"Summary: {created_count} created, {updated_count} updated")
        print("-" * 60)

        # Print login credentials for test users
        print("\n📋 Test User Credentials:")
        print("-" * 40)
        for config in USERS_CONFIG:
            if config.get("password"):
                print(f"  Email: {config['email']}")
                print(f"  Password: {config['password']}")
                print(f"  Tier: {config['subscription_tier']}")
                print()

        print("\n✅ Setup complete!")
        print("\nNote: The admin user (iajdiehl@gmail.com) should log in via")
        print("LinkedIn OAuth or set a password manually if needed.")


async def list_users() -> None:
    """List all users with their roles and subscription status."""
    print("\n" + "=" * 60)
    print("AtlasOps Users")
    print("=" * 60 + "\n")

    async with async_session_maker() as db:
        result = await db.execute(
            select(User).order_by(User.is_admin.desc(), User.created_at)
        )
        users = result.scalars().all()

        if not users:
            print("No users found.")
            return

        for user in users:
            role = "ADMIN" if user.is_admin else "USER"
            tier = user.subscription_tier.upper()
            status = user.subscription_status

            print(f"[{role}] {user.email}")
            print(f"    ID: {user.id}")
            print(f"    Tier: {tier} ({status})")
            print(f"    Resumes used: {user.resume_generations_used}")
            print(f"    Created: {user.created_at.strftime('%Y-%m-%d %H:%M')}")
            if user.stripe_customer_id:
                print(f"    Stripe Customer: {user.stripe_customer_id}")
            print()


async def main():
    """Main entry point."""
    if len(sys.argv) > 1 and sys.argv[1] == "--list":
        await list_users()
    else:
        await setup_users()


if __name__ == "__main__":
    asyncio.run(main())
