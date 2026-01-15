"""Application tracking schemas."""

from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel

from atlasops.models.application import ApplicationStatus


class ApplicationCreate(BaseModel):
    """Schema for creating an application."""

    job_posting_id: UUID
    notes: Optional[str] = None


class ApplicationUpdate(BaseModel):
    """Schema for updating an application."""

    status: Optional[ApplicationStatus] = None
    reminder_at: Optional[datetime] = None
    notes: Optional[str] = None


class ApplicationResponse(BaseModel):
    """Schema for application response."""

    id: UUID
    user_id: UUID
    job_posting_id: UUID
    status: ApplicationStatus
    applied_at: Optional[datetime] = None
    reminder_at: Optional[datetime] = None
    notes: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class ApplicationEventResponse(BaseModel):
    """Schema for application event response."""

    id: UUID
    application_id: UUID
    from_status: Optional[ApplicationStatus] = None
    to_status: ApplicationStatus
    notes: Optional[str] = None
    created_at: datetime

    model_config = {"from_attributes": True}
