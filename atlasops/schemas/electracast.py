"""ElectraCast profile schemas."""

from datetime import datetime
from typing import Any, Dict, Optional
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
