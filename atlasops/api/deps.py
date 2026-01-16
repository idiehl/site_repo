"""Shared API dependencies."""

from typing import Annotated

from fastapi import Depends, HTTPException, Request, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from atlasops.config import get_settings
from atlasops.db import get_db
from atlasops.models.user import User
from atlasops.services.entitlements import can_access_premium_features

settings = get_settings()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")


async def get_current_user(
    token: Annotated[str, Depends(oauth2_scheme)],
    db: Annotated[AsyncSession, Depends(get_db)],
    request: Request,
) -> User:
    """Validate JWT token and return current user."""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(
            token,
            settings.secret_key,
            algorithms=[settings.algorithm],
        )
        user_id: str | None = payload.get("sub")
        if user_id is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if user is None:
        raise credentials_exception
    
    # Store user in request state for analytics middleware
    request.state.user = user
    
    return user


CurrentUser = Annotated[User, Depends(get_current_user)]
DbSession = Annotated[AsyncSession, Depends(get_db)]


async def get_admin_user(
    current_user: Annotated[User, Depends(get_current_user)],
) -> User:
    """Require admin privileges."""
    if not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required",
        )
    return current_user


AdminUser = Annotated[User, Depends(get_admin_user)]


async def require_paid_user(
    current_user: Annotated[User, Depends(get_current_user)],
) -> User:
    """Require paid tier access for premium features."""
    if not can_access_premium_features(current_user):
        raise HTTPException(
            status_code=status.HTTP_402_PAYMENT_REQUIRED,
            detail="Upgrade to a paid plan to access this feature.",
        )
    return current_user


PaidUser = Annotated[User, Depends(require_paid_user)]
