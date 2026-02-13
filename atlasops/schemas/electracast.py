"""ElectraCast profile schemas."""

from datetime import datetime
from typing import Any, Dict, List, Optional
from uuid import UUID

from pydantic import BaseModel

from atlasops.schemas.user import UserResponse


class ElectraCastProfileBase(BaseModel):
    """Shared ElectraCast profile fields."""

    display_name: Optional[str] = None
    handle: Optional[str] = None
    role: Optional[str] = None
    bio: Optional[str] = None
    company: Optional[str] = None
    website: Optional[str] = None
    location: Optional[str] = None
    avatar_url: Optional[str] = None
    social_links: Optional[Dict[str, Any]] = None


class ElectraCastProfileUpdate(ElectraCastProfileBase):
    """Profile update payload."""


class ElectraCastProfileResponse(ElectraCastProfileBase):
    """Profile response payload."""

    id: UUID
    user_id: UUID
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class ElectraCastAccountResponse(BaseModel):
    """Account + ElectraCast profile bundle."""

    user: UserResponse
    profile: ElectraCastProfileResponse


class ElectraCastPodcastBase(BaseModel):
    """Shared ElectraCast podcast fields."""

    title: str
    summary: str
    subtitle: Optional[str] = None
    language: str = "en"
    itunes_categories: List[str]
    website: Optional[str] = None
    owner_name: Optional[str] = None
    owner_email: Optional[str] = None
    explicit: Optional[str] = None


class ElectraCastPodcastCreate(ElectraCastPodcastBase):
    """Podcast creation payload."""


class ElectraCastPodcastResponse(ElectraCastPodcastBase):
    """Podcast response payload."""

    id: UUID
    user_id: UUID
    slug: str
    status: str
    cover_image_url: Optional[str] = None
    network_id: Optional[UUID] = None
    megaphone_podcast_id: Optional[str] = None
    sync_error: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class ElectraCastPublicPodcast(BaseModel):
    """Public directory podcast payload (no auth)."""

    slug: str
    title: str
    summary: str
    cover_image_url: Optional[str] = None
    legacy_url: Optional[str] = None


class ElectraCastIntakeRequest(BaseModel):
    """Public intake payload for ElectraCast marketing + dashboard submissions."""

    form: str
    name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    subject: Optional[str] = None
    message: str
    metadata: Optional[Dict[str, Any]] = None

    # Basic honeypot: should remain empty.
    website: Optional[str] = None


class ElectraCastIntakeResponse(BaseModel):
    ok: bool
    message: str


class ElectraCastPublicEpisode(BaseModel):
    """Public episode payload for playlist rendering."""

    id: str
    title: str
    description: Optional[str] = None
    published_at: Optional[str] = None
    audio_url: Optional[str] = None
    duration_seconds: Optional[int] = None

