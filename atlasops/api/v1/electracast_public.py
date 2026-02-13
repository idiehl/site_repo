"""ElectraCast public (no-auth) endpoints for the marketing site."""

from __future__ import annotations

import time
from fastapi import APIRouter, HTTPException, Request
import httpx
from sqlalchemy import select

from atlasops.api.deps import DbSession
from atlasops.config import get_settings
from atlasops.models.electracast import ElectraCastPodcast
from atlasops.schemas.electracast import (
    ElectraCastIntakeRequest,
    ElectraCastIntakeResponse,
    ElectraCastPublicEpisode,
    ElectraCastPublicPodcast,
)
from atlasops.services.megaphone import MegaphoneClient

router = APIRouter()
settings = get_settings()

# Very small per-process cache to reduce Megaphone calls.
_episodes_cache: dict[str, tuple[float, list[ElectraCastPublicEpisode]]] = {}
_episodes_ttl_seconds = 300.0


@router.get("/podcasts", response_model=list[ElectraCastPublicPodcast])
async def list_public_podcasts(db: DbSession) -> list[ElectraCastPublicPodcast]:
    """Public directory list (links-only for now)."""

    result = await db.execute(
        select(ElectraCastPodcast)
        .where(ElectraCastPodcast.slug.is_not(None))
        .order_by(ElectraCastPodcast.title.asc())
    )
    podcasts = list(result.scalars().all())
    return [
        ElectraCastPublicPodcast(
            slug=p.slug,
            title=p.title,
            summary=p.summary,
            cover_image_url=p.cover_image_url,
            legacy_url=f"https://electracast.com/podcast/{p.slug}/",
        )
        for p in podcasts
    ]


@router.get("/podcasts/{slug}", response_model=ElectraCastPublicPodcast)
async def get_public_podcast(slug: str, db: DbSession) -> ElectraCastPublicPodcast:
    """Public podcast detail by slug (links-only for now)."""

    result = await db.execute(select(ElectraCastPodcast).where(ElectraCastPodcast.slug == slug))
    podcast = result.scalar_one_or_none()
    if not podcast:
        raise HTTPException(status_code=404, detail="Podcast not found")
    return ElectraCastPublicPodcast(
        slug=podcast.slug,
        title=podcast.title,
        summary=podcast.summary,
        cover_image_url=podcast.cover_image_url,
        legacy_url=f"https://electracast.com/podcast/{podcast.slug}/",
    )


@router.post("/intake", response_model=ElectraCastIntakeResponse)
async def submit_intake(payload: ElectraCastIntakeRequest, request: Request) -> ElectraCastIntakeResponse:
    """Forward ElectraCast form submissions to n8n for email + persistence."""

    if payload.website:
        # Honeypot tripped. Pretend success to avoid giving bots feedback.
        return ElectraCastIntakeResponse(ok=True, message="Received.")

    webhook_url = (settings.electracast_intake_webhook_url or "").strip()
    if not webhook_url:
        raise HTTPException(status_code=503, detail="ElectraCast intake is not configured.")

    forwarded = payload.model_dump(exclude_none=True)
    forwarded["ip"] = request.client.host if request.client else None
    forwarded["user_agent"] = request.headers.get("user-agent")
    forwarded["recipient"] = "jacob.diehl@electracast.com"

    headers = {}
    if settings.electracast_intake_webhook_secret:
        headers["X-Webhook-Secret"] = settings.electracast_intake_webhook_secret

    try:
        async with httpx.AsyncClient(timeout=15) as client:
            resp = await client.post(webhook_url, json=forwarded, headers=headers)
        if resp.status_code >= 400:
            raise HTTPException(status_code=502, detail="Intake delivery failed.")
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(status_code=502, detail="Intake delivery failed.")

    return ElectraCastIntakeResponse(ok=True, message="Thanks! We will follow up soon.")


@router.get("/podcasts/{slug}/episodes", response_model=list[ElectraCastPublicEpisode])
async def list_public_podcast_episodes(slug: str, db: DbSession) -> list[ElectraCastPublicEpisode]:
    """Public episodes list for a podcast slug (Megaphone-backed)."""

    result = await db.execute(select(ElectraCastPodcast).where(ElectraCastPodcast.slug == slug))
    podcast = result.scalar_one_or_none()
    if not podcast:
        raise HTTPException(status_code=404, detail="Podcast not found")
    if not podcast.megaphone_podcast_id:
        return []
    if not settings.megaphone_api_token or not settings.megaphone_network_id:
        return []

    cached = _episodes_cache.get(podcast.megaphone_podcast_id)
    now = time.time()
    if cached and (now - cached[0]) < _episodes_ttl_seconds:
        return cached[1]

    client = MegaphoneClient(
        api_base=settings.megaphone_api_base,
        api_token=settings.megaphone_api_token,
        network_id=settings.megaphone_network_id,
        auth_scheme=settings.megaphone_auth_scheme,
    )

    raw_items = await client.list_episodes(podcast.megaphone_podcast_id)
    episodes: list[ElectraCastPublicEpisode] = []
    for item in raw_items:
        if not isinstance(item, dict):
            continue
        episode_id = str(item.get("id") or item.get("guid") or "")
        title = str(item.get("title") or item.get("name") or "").strip()
        if not episode_id:
            episode_id = title or "episode"
        if not title:
            continue
        audio_url = item.get("audio_url") or item.get("enclosure_url") or item.get("url")
        published_at = item.get("published_at") or item.get("pub_date") or item.get("publishedAt")
        description = item.get("description") or item.get("summary") or None
        duration = item.get("duration") or item.get("duration_seconds") or None
        try:
            duration_int = int(duration) if duration is not None else None
        except Exception:
            duration_int = None

        episodes.append(
            ElectraCastPublicEpisode(
                id=episode_id,
                title=title,
                description=description,
                published_at=str(published_at) if published_at else None,
                audio_url=str(audio_url) if audio_url else None,
                duration_seconds=duration_int,
            )
        )

    # Best-effort chronological sort: newest last.
    episodes = list(reversed(episodes))
    _episodes_cache[podcast.megaphone_podcast_id] = (now, episodes)
    return episodes

