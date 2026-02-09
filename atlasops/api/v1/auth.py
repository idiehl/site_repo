"""Authentication endpoints."""

import secrets
from datetime import datetime, timedelta, timezone
from typing import Annotated
from urllib.parse import urlencode

import httpx
from fastapi import APIRouter, Depends, HTTPException, Query, status
from fastapi.responses import RedirectResponse
from fastapi.security import OAuth2PasswordRequestForm
from jose import jwt
from passlib.context import CryptContext
from sqlalchemy import select, and_

from atlasops.api.deps import CurrentUser, DbSession
from atlasops.config import get_settings
from atlasops.models.user import User, UserProfile
from atlasops.models.electracast import ElectraCastProfile
from atlasops.schemas.user import (
    CurrentUserResponse,
    TokenResponse,
    UserCreate,
    UserResponse,
)
from atlasops.services.entitlements import (
    can_access_premium_features,
    get_resume_generation_limit,
)

router = APIRouter()
settings = get_settings()
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a password against its hash."""
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
    """Hash a password."""
    return pwd_context.hash(password)


def create_access_token(data: dict, expires_delta: timedelta | None = None) -> str:
    """Create a JWT access token."""
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + (
        expires_delta or timedelta(minutes=settings.access_token_expire_minutes)
    )
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, settings.secret_key, algorithm=settings.algorithm)


def create_refresh_token(data: dict) -> str:
    """Create a JWT refresh token."""
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(days=settings.refresh_token_expire_days)
    to_encode.update({"exp": expire, "type": "refresh"})
    return jwt.encode(to_encode, settings.secret_key, algorithm=settings.algorithm)


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register(user_in: UserCreate, db: DbSession) -> User:
    """Register a new user."""
    # Check if email already exists
    result = await db.execute(select(User).where(User.email == user_in.email))
    if result.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered",
        )

    # Create user
    user = User(
        email=user_in.email,
        hashed_password=get_password_hash(user_in.password),
    )
    db.add(user)
    await db.flush()

    # Create empty profile
    profile = UserProfile(user_id=user.id)
    db.add(profile)
    db.add(ElectraCastProfile(user_id=user.id))

    await db.commit()
    await db.refresh(user)
    return user


@router.post("/login", response_model=TokenResponse)
async def login(
    form_data: Annotated[OAuth2PasswordRequestForm, Depends()],
    db: DbSession,
) -> dict:
    """Authenticate user and return tokens."""
    result = await db.execute(select(User).where(User.email == form_data.username))
    user = result.scalar_one_or_none()

    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    access_token = create_access_token(data={"sub": str(user.id)})
    refresh_token = create_refresh_token(data={"sub": str(user.id)})

    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
    }


@router.get("/me", response_model=CurrentUserResponse)
async def get_current_user_info(current_user: CurrentUser) -> dict:
    """Get current authenticated user."""
    base = UserResponse.model_validate(current_user).model_dump()
    return {
        **base,
        "resume_generation_limit": get_resume_generation_limit(current_user),
        "can_access_premium_features": can_access_premium_features(current_user),
    }


@router.post("/logout")
async def logout() -> dict:
    """Logout user (client should discard tokens)."""
    return {"message": "Successfully logged out"}


# LinkedIn OAuth endpoints
LINKEDIN_AUTH_URL = "https://www.linkedin.com/oauth/v2/authorization"
LINKEDIN_TOKEN_URL = "https://www.linkedin.com/oauth/v2/accessToken"
LINKEDIN_USERINFO_URL = "https://api.linkedin.com/v2/userinfo"

# In-memory state store (for production, use Redis or DB)
oauth_states: dict[str, datetime] = {}


@router.get("/linkedin/authorize")
async def linkedin_authorize() -> dict:
    """Get LinkedIn OAuth authorization URL."""
    if not settings.linkedin_client_id:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="LinkedIn OAuth not configured",
        )
    
    # Generate state for CSRF protection
    state = secrets.token_urlsafe(32)
    oauth_states[state] = datetime.now(timezone.utc)
    
    # Clean up old states (older than 10 minutes)
    cutoff = datetime.now(timezone.utc) - timedelta(minutes=10)
    expired_states = [s for s, t in oauth_states.items() if t < cutoff]
    for s in expired_states:
        oauth_states.pop(s, None)
    
    params = {
        "response_type": "code",
        "client_id": settings.linkedin_client_id,
        "redirect_uri": settings.linkedin_redirect_uri,
        "state": state,
        "scope": "openid profile email",
    }
    
    auth_url = f"{LINKEDIN_AUTH_URL}?{urlencode(params)}"
    return {"url": auth_url, "state": state}


@router.get("/linkedin/callback")
async def linkedin_callback(
    code: str = Query(...),
    state: str = Query(...),
    db: DbSession = None,
) -> RedirectResponse:
    """Handle LinkedIn OAuth callback."""
    # Verify state
    if state not in oauth_states:
        return RedirectResponse(
            url=f"{settings.frontend_url}/login?error=invalid_state"
        )
    
    oauth_states.pop(state, None)
    
    if not settings.linkedin_client_id or not settings.linkedin_client_secret:
        return RedirectResponse(
            url=f"{settings.frontend_url}/login?error=oauth_not_configured"
        )
    
    try:
        # Exchange code for access token
        async with httpx.AsyncClient() as client:
            token_response = await client.post(
                LINKEDIN_TOKEN_URL,
                data={
                    "grant_type": "authorization_code",
                    "code": code,
                    "redirect_uri": settings.linkedin_redirect_uri,
                    "client_id": settings.linkedin_client_id,
                    "client_secret": settings.linkedin_client_secret,
                },
                headers={"Content-Type": "application/x-www-form-urlencoded"},
            )
            
            if token_response.status_code != 200:
                return RedirectResponse(
                    url=f"{settings.frontend_url}/login?error=token_exchange_failed"
                )
            
            token_data = token_response.json()
            access_token = token_data.get("access_token")
            
            if not access_token:
                return RedirectResponse(
                    url=f"{settings.frontend_url}/login?error=no_access_token"
                )
            
            # Fetch user info using OpenID Connect userinfo endpoint
            userinfo_response = await client.get(
                LINKEDIN_USERINFO_URL,
                headers={"Authorization": f"Bearer {access_token}"},
            )
            
            if userinfo_response.status_code != 200:
                return RedirectResponse(
                    url=f"{settings.frontend_url}/login?error=userinfo_failed"
                )
            
            userinfo = userinfo_response.json()
            
        # Extract user data from OpenID Connect response
        linkedin_id = userinfo.get("sub")
        email = userinfo.get("email")
        name = userinfo.get("name")
        picture_url = userinfo.get("picture")  # LinkedIn profile picture
        given_name = userinfo.get("given_name")
        family_name = userinfo.get("family_name")
        
        if not linkedin_id or not email:
            return RedirectResponse(
                url=f"{settings.frontend_url}/login?error=missing_user_data"
            )
        
        # Check if user exists by LinkedIn ID
        result = await db.execute(
            select(User).where(
                and_(
                    User.oauth_provider == "linkedin",
                    User.oauth_provider_id == linkedin_id,
                )
            )
        )
        user = result.scalar_one_or_none()
        is_new_user = False
        
        if not user:
            # Check if email already exists (user has password account)
            result = await db.execute(select(User).where(User.email == email))
            existing_user = result.scalar_one_or_none()
            
            if existing_user:
                # Link LinkedIn to existing account
                existing_user.oauth_provider = "linkedin"
                existing_user.oauth_provider_id = linkedin_id
                user = existing_user
            else:
                # Create new user
                is_new_user = True
                user = User(
                    email=email,
                    hashed_password=None,
                    oauth_provider="linkedin",
                    oauth_provider_id=linkedin_id,
                )
                db.add(user)
                await db.flush()
                
                # Create profile with data from LinkedIn
                profile = UserProfile(
                    user_id=user.id,
                    full_name=name or f"{given_name or ''} {family_name or ''}".strip(),
                    profile_picture_url=picture_url,
                    social_links={"linkedin": f"https://linkedin.com/in/{linkedin_id}"},
                )
                db.add(profile)
            
            await db.commit()
            await db.refresh(user)
        
        # Update profile with latest LinkedIn data for existing users
        if not is_new_user:
            result = await db.execute(
                select(UserProfile).where(UserProfile.user_id == user.id)
            )
            profile = result.scalar_one_or_none()
            
            if profile:
                # Update fields if they're empty or user wants to sync
                if not profile.full_name and name:
                    profile.full_name = name
                
                # Always update LinkedIn profile picture if available
                if picture_url and (not profile.profile_picture_url or profile.profile_picture_url.startswith("http")):
                    profile.profile_picture_url = picture_url
                
                # Add LinkedIn to social links if not present
                if not profile.social_links:
                    profile.social_links = {}
                if "linkedin" not in profile.social_links:
                    profile.social_links["linkedin"] = f"https://linkedin.com/in/{linkedin_id}"
                
                profile.completeness_score = profile.calculate_completeness()
                await db.commit()
        
        # Generate tokens
        access_token = create_access_token(data={"sub": str(user.id)})
        refresh_token = create_refresh_token(data={"sub": str(user.id)})
        
        # Redirect to frontend with tokens in URL fragment
        # The frontend will extract these and store them
        redirect_url = (
            f"{settings.frontend_url}/oauth/callback"
            f"#access_token={access_token}"
            f"&refresh_token={refresh_token}"
            f"&token_type=bearer"
        )
        
        return RedirectResponse(url=redirect_url)
        
    except httpx.RequestError:
        return RedirectResponse(
            url=f"{settings.frontend_url}/login?error=network_error"
        )


# Google OAuth endpoints
GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth"
GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token"
GOOGLE_USERINFO_URL = "https://www.googleapis.com/oauth2/v3/userinfo"


@router.get("/google/authorize")
async def google_authorize() -> dict:
    """Get Google OAuth authorization URL."""
    if not settings.google_client_id:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Google OAuth not configured",
        )
    
    # Generate state for CSRF protection
    state = secrets.token_urlsafe(32)
    oauth_states[state] = datetime.now(timezone.utc)
    
    # Clean up old states (older than 10 minutes)
    cutoff = datetime.now(timezone.utc) - timedelta(minutes=10)
    expired_states = [s for s, t in oauth_states.items() if t < cutoff]
    for s in expired_states:
        oauth_states.pop(s, None)
    
    params = {
        "response_type": "code",
        "client_id": settings.google_client_id,
        "redirect_uri": settings.google_redirect_uri,
        "state": state,
        "scope": "openid email profile",
        "access_type": "offline",
        "prompt": "select_account",
    }
    
    auth_url = f"{GOOGLE_AUTH_URL}?{urlencode(params)}"
    return {"url": auth_url, "state": state}


@router.get("/google/callback")
async def google_callback(
    code: str = Query(...),
    state: str = Query(...),
    db: DbSession = None,
) -> RedirectResponse:
    """Handle Google OAuth callback."""
    # Verify state
    if state not in oauth_states:
        return RedirectResponse(
            url=f"{settings.frontend_url}/login?error=invalid_state"
        )
    
    oauth_states.pop(state, None)
    
    if not settings.google_client_id or not settings.google_client_secret:
        return RedirectResponse(
            url=f"{settings.frontend_url}/login?error=oauth_not_configured"
        )
    
    try:
        # Exchange code for access token
        async with httpx.AsyncClient() as client:
            token_response = await client.post(
                GOOGLE_TOKEN_URL,
                data={
                    "grant_type": "authorization_code",
                    "code": code,
                    "redirect_uri": settings.google_redirect_uri,
                    "client_id": settings.google_client_id,
                    "client_secret": settings.google_client_secret,
                },
                headers={"Content-Type": "application/x-www-form-urlencoded"},
            )
            
            if token_response.status_code != 200:
                return RedirectResponse(
                    url=f"{settings.frontend_url}/login?error=token_exchange_failed"
                )
            
            token_data = token_response.json()
            access_token = token_data.get("access_token")
            
            if not access_token:
                return RedirectResponse(
                    url=f"{settings.frontend_url}/login?error=no_access_token"
                )
            
            # Fetch user info
            userinfo_response = await client.get(
                GOOGLE_USERINFO_URL,
                headers={"Authorization": f"Bearer {access_token}"},
            )
            
            if userinfo_response.status_code != 200:
                return RedirectResponse(
                    url=f"{settings.frontend_url}/login?error=userinfo_failed"
                )
            
            userinfo = userinfo_response.json()
            
        # Extract user data from Google response
        google_id = userinfo.get("sub")
        email = userinfo.get("email")
        name = userinfo.get("name")
        picture_url = userinfo.get("picture")
        given_name = userinfo.get("given_name")
        family_name = userinfo.get("family_name")
        
        if not google_id or not email:
            return RedirectResponse(
                url=f"{settings.frontend_url}/login?error=missing_user_data"
            )
        
        # Check if user exists by Google ID
        result = await db.execute(
            select(User).where(
                and_(
                    User.oauth_provider == "google",
                    User.oauth_provider_id == google_id,
                )
            )
        )
        user = result.scalar_one_or_none()
        is_new_user = False
        
        if not user:
            # Check if email already exists (user has password or other OAuth account)
            result = await db.execute(select(User).where(User.email == email))
            existing_user = result.scalar_one_or_none()
            
            if existing_user:
                # Link Google to existing account (only if no OAuth provider set)
                if not existing_user.oauth_provider:
                    existing_user.oauth_provider = "google"
                    existing_user.oauth_provider_id = google_id
                user = existing_user
            else:
                # Create new user
                is_new_user = True
                user = User(
                    email=email,
                    hashed_password=None,
                    oauth_provider="google",
                    oauth_provider_id=google_id,
                )
                db.add(user)
                await db.flush()
                
                # Create profile with data from Google
                profile = UserProfile(
                    user_id=user.id,
                    full_name=name or f"{given_name or ''} {family_name or ''}".strip(),
                    profile_picture_url=picture_url,
                )
                db.add(profile)
            
            await db.commit()
            await db.refresh(user)
        
        # Update profile with latest Google data for existing users
        if not is_new_user:
            result = await db.execute(
                select(UserProfile).where(UserProfile.user_id == user.id)
            )
            profile = result.scalar_one_or_none()
            
            if profile:
                # Update fields if they're empty
                if not profile.full_name and name:
                    profile.full_name = name
                
                # Update profile picture if available and not already set
                if picture_url and not profile.profile_picture_url:
                    profile.profile_picture_url = picture_url
                
                profile.completeness_score = profile.calculate_completeness()
                await db.commit()
        
        # Generate tokens
        access_token = create_access_token(data={"sub": str(user.id)})
        refresh_token = create_refresh_token(data={"sub": str(user.id)})
        
        # Redirect to frontend with tokens in URL fragment
        redirect_url = (
            f"{settings.frontend_url}/oauth/callback"
            f"#access_token={access_token}"
            f"&refresh_token={refresh_token}"
            f"&token_type=bearer"
        )
        
        return RedirectResponse(url=redirect_url)
        
    except httpx.RequestError:
        return RedirectResponse(
            url=f"{settings.frontend_url}/login?error=network_error"
        )
