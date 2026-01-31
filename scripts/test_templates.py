#!/usr/bin/env python3
"""Test templates API response."""

import asyncio
from atlasops.db import async_session_maker
from atlasops.services.resume_generator import get_available_templates
from atlasops.services.entitlements import can_access_premium_features
from atlasops.models.user import User
from sqlalchemy import select

async def test():
    async with async_session_maker() as session:
        result = await session.execute(
            select(User).where(User.email == "iajdiehl@gmail.com")
        )
        user = result.scalar_one_or_none()
        if not user:
            print("User not found")
            return
        
        print(f"User: {user.email}")
        print(f"  is_admin: {user.is_admin}")
        print(f"  subscription_tier: {user.subscription_tier}")
        print(f"  subscription_status: {user.subscription_status}")
        print(f"  can_access_premium_features: {can_access_premium_features(user)}")
        print()
        
        templates = get_available_templates()
        is_premium = can_access_premium_features(user)
        
        print(f"Templates for {'PREMIUM' if is_premium else 'FREE'} user:")
        for t in templates:
            accessible = t["tier"] == "free" or is_premium
            locked = not accessible
            print(f"  {t['id']}: tier={t['tier']}, accessible={accessible}, locked={locked}")

asyncio.run(test())
