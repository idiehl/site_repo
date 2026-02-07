"""Meridian API schemas."""

from datetime import datetime
from typing import List, Optional
from uuid import UUID

from pydantic import BaseModel, Field


class MeridianProjectCreate(BaseModel):
    """Create a new Meridian project."""

    name: str = Field(..., min_length=1, max_length=120)


class MeridianProjectSummary(BaseModel):
    """Project summary returned in lists."""

    id: UUID
    name: str
    updated_at: datetime


class MeridianDocumentPayload(BaseModel):
    """Minimal document payload for sync scaffolding."""

    id: UUID
    name: str
    version: int = 1
    updated_at: datetime


class MeridianProjectDetail(BaseModel):
    """Project detail response."""

    id: UUID
    name: str
    document: MeridianDocumentPayload


class MeridianSyncPullRequest(BaseModel):
    """Pull changes since a timestamp."""

    since: Optional[datetime] = None
    device_id: Optional[str] = None


class MeridianSyncPullResponse(BaseModel):
    """Sync pull response."""

    server_time: datetime
    changes: List[MeridianDocumentPayload] = []


class MeridianSyncPushRequest(BaseModel):
    """Push local changes to the server."""

    device_id: Optional[str] = None
    changes: List[MeridianDocumentPayload] = []


class MeridianSyncPushResponse(BaseModel):
    """Sync push acknowledgement."""

    server_time: datetime
    accepted: int


class MeridianStatusResponse(BaseModel):
    """Meridian API status response."""

    status: str
    server_time: datetime
    user_id: UUID
