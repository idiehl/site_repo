"""ElectraCast public (no-auth) endpoints for the marketing site."""

from __future__ import annotations

from fastapi import APIRouter, HTTPException
from sqlalchemy import select

from atlasops.api.deps import DbSession
from atlasops.models.electracast import ElectraCastPodcast
from atlasops.schemas.electracast import ElectraCastPublicPodcast

router = APIRouter()


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

