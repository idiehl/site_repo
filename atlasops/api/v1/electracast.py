"""ElectraCast account and profile endpoints."""

from fastapi import APIRouter
from sqlalchemy import select

from atlasops.api.deps import CurrentUser, DbSession
from atlasops.models.electracast import ElectraCastProfile
from atlasops.schemas.electracast import (
    ElectraCastAccountResponse,
    ElectraCastProfileResponse,
    ElectraCastProfileUpdate,
)
from atlasops.schemas.user import UserResponse

router = APIRouter()


async def get_or_create_profile(
    current_user: CurrentUser,
    db: DbSession,
) -> ElectraCastProfile:
    """Fetch the ElectraCast profile or create a blank record."""
    result = await db.execute(
        select(ElectraCastProfile).where(ElectraCastProfile.user_id == current_user.id)
    )
    profile = result.scalar_one_or_none()
    if profile:
        return profile

    profile = ElectraCastProfile(user_id=current_user.id)
    db.add(profile)
    await db.commit()
    await db.refresh(profile)
    return profile


@router.get("/profile", response_model=ElectraCastProfileResponse)
async def get_profile(
    current_user: CurrentUser,
    db: DbSession,
) -> ElectraCastProfile:
    """Get the current user's ElectraCast profile."""
    return await get_or_create_profile(current_user, db)


@router.patch("/profile", response_model=ElectraCastProfileResponse)
async def update_profile(
    profile_in: ElectraCastProfileUpdate,
    current_user: CurrentUser,
    db: DbSession,
) -> ElectraCastProfile:
    """Update the current user's ElectraCast profile."""
    profile = await get_or_create_profile(current_user, db)

    update_data = profile_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(profile, field, value)

    await db.commit()
    await db.refresh(profile)
    return profile


@router.get("/account", response_model=ElectraCastAccountResponse)
async def get_account(
    current_user: CurrentUser,
    db: DbSession,
) -> dict:
    """Return account summary + ElectraCast profile."""
    profile = await get_or_create_profile(current_user, db)
    return {
        "user": UserResponse.model_validate(current_user),
        "profile": profile,
    }
