#!/usr/bin/env python3
"""Create a test user for demo purposes."""

import asyncio
from passlib.context import CryptContext
from sqlalchemy import text
from atlasops.db import async_session_maker
from atlasops.models.user import User, UserProfile
from datetime import datetime, timezone

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

async def create_test_user():
    async with async_session_maker() as session:
        # Check if test user exists
        result = await session.execute(text("SELECT id FROM users WHERE email = 'demo@atlasapply.test'"))
        if result.first():
            print('Test user already exists')
            return
        
        # Create test user
        hashed_password = pwd_context.hash('QuickProDemo2026!')
        
        user = User(
            email='demo@atlasapply.test',
            hashed_password=hashed_password,
            is_admin=False,
            subscription_tier='paid',
            subscription_status='active',
        )
        session.add(user)
        await session.flush()
        
        # Create profile
        profile = UserProfile(
            user_id=user.id,
            full_name='Alex Demo',
            headline='Software Engineer | Full-Stack Developer',
            summary='Experienced software engineer with expertise in web development, cloud technologies, and agile methodologies.',
            location='San Francisco, CA',
            phone='+1 (555) 123-4567',
            social_links={'portfolio': 'https://alexdemo.dev', 'github': 'https://github.com/alexdemo', 'linkedin': 'https://linkedin.com/in/alexdemo'},
            skills=['Python', 'JavaScript', 'React', 'Node.js', 'PostgreSQL', 'AWS', 'Docker'],
        )
        session.add(profile)
        await session.commit()
        
        print('Test user created successfully!')
        print('Email: demo@atlasapply.test')
        print('Password: QuickProDemo2026!')

if __name__ == "__main__":
    asyncio.run(create_test_user())
