"""ElectraCast account, profile, and podcast endpoints."""

import re

from fastapi import APIRouter, HTTPException, status
from sqlalchemy import select

from atlasops.api.deps import CurrentUser, DbSession
from atlasops.config import get_settings
from atlasops.models.electracast import ElectraCastPodcast, ElectraCastProfile
from atlasops.schemas.electracast import (
    ElectraCastAccountResponse,
    ElectraCastPodcastCreate,
    ElectraCastPodcastResponse,
    ElectraCastProfileResponse,
    ElectraCastProfileUpdate,
)
from atlasops.schemas.user import UserResponse
from atlasops.services.megaphone import MegaphoneClient, MegaphoneError

router = APIRouter()
settings = get_settings()


def normalize_slug(text: str) -> str:
    text = text.replace("_", "-").lower()
    text = re.sub(r"[^a-z0-9\-]+", "", text)
    text = re.sub(r"\-+", "-", text).strip("-")
    return text


async def generate_unique_podcast_slug(db: DbSession, title: str) -> str:
    base = normalize_slug(title) or "podcast"
    slug = base
    suffix = 2
    while True:
        existing = await db.execute(
            select(ElectraCastPodcast.id).where(ElectraCastPodcast.slug == slug)
        )
        if existing.scalar_one_or_none() is None:
            return slug
        slug = f"{base}-{suffix}"
        suffix += 1


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


@router.get("/podcasts", response_model=list[ElectraCastPodcastResponse])
async def list_podcasts(
    current_user: CurrentUser,
    db: DbSession,
) -> list[ElectraCastPodcast]:
    """List all podcasts owned by the current user."""
    result = await db.execute(
        select(ElectraCastPodcast)
        .where(ElectraCastPodcast.user_id == current_user.id)
        .order_by(ElectraCastPodcast.created_at.desc())
    )
    return list(result.scalars().all())


@router.post(
    "/podcasts",
    response_model=ElectraCastPodcastResponse,
    status_code=status.HTTP_201_CREATED,
)
async def create_podcast(
    payload: ElectraCastPodcastCreate,
    current_user: CurrentUser,
    db: DbSession,
) -> ElectraCastPodcast:
    """Create a new podcast entry for the current user."""
    if not payload.itunes_categories:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="At least one iTunes category is required.",
        )

    title = payload.title.strip()
    summary = payload.summary.strip()
    if not title or not summary:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Podcast title and summary are required.",
        )

    explicit_value = payload.explicit
    if explicit_value:
        normalized = explicit_value.strip().lower()
        allowed = {"clean", "explicit", "yes", "no", "true", "false"}
        if normalized not in allowed:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Explicit must be clean or explicit.",
            )
        if normalized in {"explicit", "true", "yes"}:
            explicit_value = "explicit"
        elif normalized in {"clean", "false", "no"}:
            explicit_value = "clean"

    subtitle = payload.subtitle.strip() if payload.subtitle else None
    if not subtitle:
        subtitle = summary

    slug = await generate_unique_podcast_slug(db, title)
    podcast = ElectraCastPodcast(
        user_id=current_user.id,
        slug=slug,
        title=title,
        summary=summary,
        subtitle=subtitle,
        language=payload.language or "en",
        itunes_categories=payload.itunes_categories,
        website=payload.website,
        owner_name=payload.owner_name,
        owner_email=payload.owner_email or current_user.email,
        explicit=explicit_value,
        status="pending",
    )
    db.add(podcast)
    await db.commit()
    await db.refresh(podcast)

    if not settings.megaphone_api_token or not settings.megaphone_network_id:
        podcast.status = "failed"
        podcast.sync_error = "Megaphone API is not configured."
        await db.commit()
        await db.refresh(podcast)
        return podcast

    megaphone_payload = {
        "title": podcast.title,
        "subtitle": podcast.subtitle,
        "summary": podcast.summary,
        "language": podcast.language,
        "itunesCategories": podcast.itunes_categories,
    }
    if podcast.website:
        megaphone_payload["link"] = podcast.website
    if podcast.owner_name:
        megaphone_payload["ownerName"] = podcast.owner_name
    if podcast.owner_email:
        megaphone_payload["ownerEmail"] = podcast.owner_email
    if podcast.explicit:
        megaphone_payload["explicit"] = podcast.explicit

    client = MegaphoneClient(
        api_base=settings.megaphone_api_base,
        api_token=settings.megaphone_api_token,
        network_id=settings.megaphone_network_id,
        auth_scheme=settings.megaphone_auth_scheme,
    )
    try:
        result = await client.create_podcast(megaphone_payload)
        podcast.megaphone_podcast_id = result.podcast_id
        podcast.status = "synced"
        podcast.sync_error = None
    except MegaphoneError as exc:
        podcast.status = "failed"
        podcast.sync_error = str(exc)
    except Exception:
        podcast.status = "failed"
        podcast.sync_error = "Megaphone sync failed."

    await db.commit()
    await db.refresh(podcast)
    return podcast
