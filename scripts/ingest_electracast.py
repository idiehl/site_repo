"""Ingest ElectraCast content from scraped data."""

import asyncio
import os
import re
import shutil
from pathlib import Path
from urllib.parse import urlparse

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from atlasops.db import async_session_maker
from atlasops.models.electracast import ElectraCastNetwork, ElectraCastPodcast
from atlasops.models.user import User

BASE_DIR = Path("internal/Electracast_Codebase")
NETWORKS_DIR = BASE_DIR / "electracast_networks"
PODCASTS_DIR = BASE_DIR / "electracast_podcasts"
PUBLIC_UPLOADS = Path("electracast/public/uploads")
DIST_UPLOADS = Path("electracast/dist/uploads")

def normalize_slug(text: str) -> str:
    """Convert directory name or title to URL slug format."""
    # Replace underscores with hyphens, lowercase
    text = text.replace("_", "-").lower()
    # Remove non-alphanumeric (except hyphens)
    text = re.sub(r"[^a-z0-9\-]+", "", text)
    # Collapse hyphens
    text = re.sub(r"\-+", "-", text).strip("-")
    return text

def copy_image(src: Path, dest_rel: str, name: str) -> str | None:
    if not src.exists():
        return None
    
    # Public dir (source)
    public_dest = PUBLIC_UPLOADS / dest_rel
    public_dest.mkdir(parents=True, exist_ok=True)
    
    ext = src.suffix
    filename = f"{name}{ext}"
    shutil.copy2(src, public_dest / filename)
    
    # Dist dir (live)
    if DIST_UPLOADS.exists():
        dist_dest = DIST_UPLOADS / dest_rel
        dist_dest.mkdir(parents=True, exist_ok=True)
        shutil.copy2(src, dist_dest / filename)
        
    return f"/uploads/{dest_rel}/{filename}"

async def get_admin_user(session: AsyncSession) -> User:
    # Try to find a user to assign content to
    stmt = select(User).order_by(User.created_at)
    result = await session.execute(stmt)
    user = result.scalars().first()
    if not user:
        raise Exception("No users found in database. Please create a user first.")
    return user

async def ingest_networks(session: AsyncSession) -> dict[str, str]:
    """Ingest networks and return map of podcast_slug -> network_id."""
    print("Ingesting networks...")
    podcast_to_network = {}
    
    if not NETWORKS_DIR.exists():
        print(f"Networks directory not found: {NETWORKS_DIR}")
        return {}

    for entry in NETWORKS_DIR.iterdir():
        if not entry.is_dir():
            continue
            
        # Skip assets folder
        if entry.name.endswith("_files"):
            continue

        slug = normalize_slug(entry.name)
        title = entry.name.replace("_", " ")
        
        # Find cover
        cover_image = None
        for f in entry.iterdir():
            if "Cover" in f.name:
                cover_image = f
                break
        
        image_url = None
        if cover_image:
            image_url = copy_image(cover_image, "networks", slug)
            
        # Description
        description = None
        summary_file = entry / "summary.txt"
        if summary_file.exists():
            description = summary_file.read_text(encoding="utf-8").strip()
            
        # Check if exists
        stmt = select(ElectraCastNetwork).where(ElectraCastNetwork.slug == slug)
        result = await session.execute(stmt)
        network = result.scalar_one_or_none()
        
        if not network:
            network = ElectraCastNetwork(
                title=title,
                slug=slug,
                description=description,
                cover_image_url=image_url
            )
            session.add(network)
            await session.flush() # Get ID
            print(f"Created network: {title}")
        else:
            network.cover_image_url = image_url
            network.description = description
            print(f"Updated network: {title}")
            
        # Parse network_podcasts.txt
        podcasts_file = entry / "network_podcasts.txt"
        if podcasts_file.exists():
            content = podcasts_file.read_text(encoding="utf-8")
            for line in content.splitlines():
                line = line.strip()
                if not line:
                    continue
                # Extract slug from URL: https://electracast.com/podcast/some-slug/
                try:
                    path = urlparse(line).path # /podcast/some-slug/
                    parts = [p for p in path.split("/") if p]
                    if parts and parts[-1]:
                        pod_slug = parts[-1]
                        podcast_to_network[pod_slug] = network.id
                except Exception:
                    pass
                    
    await session.commit()
    return podcast_to_network

async def ingest_podcasts(session: AsyncSession, user: User, podcast_to_network: dict[str, str]):
    print("Ingesting podcasts...")
    
    if not PODCASTS_DIR.exists():
        print(f"Podcasts directory not found: {PODCASTS_DIR}")
        return

    count = 0
    for entry in PODCASTS_DIR.iterdir():
        if not entry.is_dir():
            continue
            
        if entry.name.endswith("_files"):
            continue
            
        slug = normalize_slug(entry.name)
        title = entry.name.replace("_", " ")
        
        # Find cover
        cover_image = None
        for f in entry.iterdir():
            if "Cover" in f.name:
                cover_image = f
                break
        
        image_url = None
        if cover_image:
            image_url = copy_image(cover_image, "podcasts", slug)
            
        # Summary
        summary = ""
        summary_file = entry / "summary.txt"
        if summary_file.exists():
            summary = summary_file.read_text(encoding="utf-8").strip()
            
        # Network
        network_id = podcast_to_network.get(slug)
        
        # Check if exists
        # We don't have a slug field on Podcast, match by title
        stmt = select(ElectraCastPodcast).where(ElectraCastPodcast.title == title)
        result = await session.execute(stmt)
        podcast = result.scalar_one_or_none()
        
        if not podcast:
            podcast = ElectraCastPodcast(
                user_id=user.id,
                title=title,
                summary=summary,
                language="en",
                status="imported",
                itunes_categories=["Arts"], # Default
                owner_email=user.email,
                owner_name=user.full_name or "ElectraCast",
                network_id=network_id,
                cover_image_url=image_url
            )
            session.add(podcast)
            count += 1
        else:
            podcast.summary = summary
            podcast.network_id = network_id
            podcast.cover_image_url = image_url
            
    await session.commit()
    print(f"Processed {count} new podcasts.")

async def main():
    async with async_session_maker() as session:
        try:
            user = await get_admin_user(session)
            print(f"Assigning content to user: {user.email}")
            
            podcast_to_network = await ingest_networks(session)
            await ingest_podcasts(session, user, podcast_to_network)
            
            print("Ingestion complete.")
        except Exception as e:
            print(f"Error: {e}")
            raise

if __name__ == "__main__":
    asyncio.run(main())
