"""User profile endpoints."""

from fastapi import APIRouter, HTTPException, status
from sqlalchemy import select

from atlasops.api.deps import CurrentUser, DbSession
from atlasops.models.user import UserProfile
from atlasops.schemas.user import UserProfileResponse, UserProfileUpdate

router = APIRouter()


@router.get("", response_model=UserProfileResponse)
async def get_profile(
    current_user: CurrentUser,
    db: DbSession,
) -> UserProfile:
    """Get current user's profile."""
    result = await db.execute(
        select(UserProfile).where(UserProfile.user_id == current_user.id)
    )
    profile = result.scalar_one_or_none()
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Profile not found",
        )
    return profile


@router.patch("", response_model=UserProfileResponse)
async def update_profile(
    profile_in: UserProfileUpdate,
    current_user: CurrentUser,
    db: DbSession,
) -> UserProfile:
    """Update current user's profile."""
    result = await db.execute(
        select(UserProfile).where(UserProfile.user_id == current_user.id)
    )
    profile = result.scalar_one_or_none()
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Profile not found",
        )

    update_data = profile_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(profile, field, value)

    await db.commit()
    await db.refresh(profile)
    return profile


@router.post("/enhance")
async def enhance_profile(
    current_user: CurrentUser,
    db: DbSession,
) -> dict:
    """Use AI to enhance profile content."""
    # TODO: Implement AI enhancement
    return {"message": "Profile enhancement queued"}
