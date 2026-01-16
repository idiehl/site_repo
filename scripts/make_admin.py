"""Script to make a user an admin.

Usage:
    python scripts/make_admin.py <email>
    
Example:
    python scripts/make_admin.py admin@example.com
"""

import asyncio
import sys
from pathlib import Path

# Add parent directory to path to import atlasops
sys.path.insert(0, str(Path(__file__).parent.parent))

from sqlalchemy import select

from atlasops.db import async_session_maker
from atlasops.models.user import User


async def make_admin(email: str) -> None:
    """Make a user an admin by email."""
    async with async_session_maker() as db:
        # Find user by email
        result = await db.execute(select(User).where(User.email == email))
        user = result.scalar_one_or_none()
        
        if not user:
            print(f"❌ User with email '{email}' not found.")
            print("\nAvailable users:")
            all_users_result = await db.execute(select(User.email))
            all_users = [row[0] for row in all_users_result.all()]
            if all_users:
                for user_email in all_users:
                    print(f"  - {user_email}")
            else:
                print("  (no users found)")
            return
        
        if user.is_admin:
            print(f"✅ User '{email}' is already an admin.")
            return
        
        # Make user an admin
        user.is_admin = True
        await db.commit()
        
        print(f"✅ Successfully made '{email}' an admin!")
        print(f"   User ID: {user.id}")
        print(f"   Email: {user.email}")
        print(f"   Admin status: {user.is_admin}")


async def list_admins() -> None:
    """List all admin users."""
    async with async_session_maker() as db:
        result = await db.execute(
            select(User).where(User.is_admin == True)
        )
        admins = result.scalars().all()
        
        if not admins:
            print("No admin users found.")
        else:
            print(f"Admin users ({len(admins)}):")
            for admin in admins:
                print(f"  - {admin.email} (ID: {admin.id})")


async def main():
    """Main entry point."""
    if len(sys.argv) < 2:
        print("Usage: python scripts/make_admin.py <email>")
        print("   or: python scripts/make_admin.py --list")
        print("\nExamples:")
        print("  python scripts/make_admin.py admin@example.com")
        print("  python scripts/make_admin.py --list")
        sys.exit(1)
    
    if sys.argv[1] == "--list":
        await list_admins()
    else:
        email = sys.argv[1]
        await make_admin(email)


if __name__ == "__main__":
    asyncio.run(main())
