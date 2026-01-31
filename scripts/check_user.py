#!/usr/bin/env python3
"""Check user subscription status."""

import asyncio
import sys
from sqlalchemy import text
from atlasops.db import async_session_maker

async def check_user(email: str):
    async with async_session_maker() as session:
        result = await session.execute(
            text("SELECT id, email, subscription_tier, subscription_status, is_admin FROM users WHERE email = :email"),
            {"email": email}
        )
        row = result.first()
        if row:
            print(f"User found:")
            print(f"  ID: {row[0]}")
            print(f"  Email: {row[1]}")
            print(f"  Subscription Tier: {row[2]}")
            print(f"  Subscription Status: {row[3]}")
            print(f"  Is Admin: {row[4]}")
            
            # Check premium access logic
            is_premium = row[4] or (row[2] == "paid" and row[3] in {"active", "trialing", "past_due"})
            print(f"  Can Access Premium: {is_premium}")
        else:
            print(f"User not found: {email}")

if __name__ == "__main__":
    email = sys.argv[1] if len(sys.argv) > 1 else "iajdiehl@gmail.com"
    asyncio.run(check_user(email))
