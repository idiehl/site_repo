"""Meridian API endpoints (scaffolding)."""

from datetime import datetime, timezone
from uuid import UUID, uuid4

from fastapi import APIRouter

from atlasops.api.deps import CurrentUser
from atlasops.schemas.meridian import (
    MeridianDocumentPayload,
    MeridianProjectCreate,
    MeridianProjectDetail,
    MeridianProjectSummary,
    MeridianStatusResponse,
    MeridianSyncPullRequest,
    MeridianSyncPullResponse,
    MeridianSyncPushRequest,
    MeridianSyncPushResponse,
)

router = APIRouter()


@router.get("/status", response_model=MeridianStatusResponse)
async def get_status(current_user: CurrentUser) -> MeridianStatusResponse:
    """Return Meridian API status for the current user."""
    return MeridianStatusResponse(
        status="ok",
        server_time=datetime.now(timezone.utc),
        user_id=current_user.id,
    )


@router.get("/projects", response_model=list[MeridianProjectSummary])
async def list_projects(current_user: CurrentUser) -> list[MeridianProjectSummary]:
    """List Meridian projects (placeholder)."""
    return []


@router.post("/projects", response_model=MeridianProjectSummary)
async def create_project(
    payload: MeridianProjectCreate,
    current_user: CurrentUser,
) -> MeridianProjectSummary:
    """Create a Meridian project (placeholder)."""
    now = datetime.now(timezone.utc)
    return MeridianProjectSummary(id=uuid4(), name=payload.name, updated_at=now)


@router.get("/projects/{project_id}", response_model=MeridianProjectDetail)
async def get_project(
    project_id: UUID,
    current_user: CurrentUser,
) -> MeridianProjectDetail:
    """Get a Meridian project (placeholder)."""
    now = datetime.now(timezone.utc)
    document = MeridianDocumentPayload(
        id=project_id,
        name="Meridian Project",
        updated_at=now,
        version=1,
    )
    return MeridianProjectDetail(
        id=project_id,
        name="Meridian Project",
        document=document,
    )


@router.post("/sync/pull", response_model=MeridianSyncPullResponse)
async def sync_pull(
    payload: MeridianSyncPullRequest,
    current_user: CurrentUser,
) -> MeridianSyncPullResponse:
    """Pull changes from server (placeholder)."""
    return MeridianSyncPullResponse(
        server_time=datetime.now(timezone.utc),
        changes=[],
    )


@router.post("/sync/push", response_model=MeridianSyncPushResponse)
async def sync_push(
    payload: MeridianSyncPushRequest,
    current_user: CurrentUser,
) -> MeridianSyncPushResponse:
    """Push changes to server (placeholder)."""
    return MeridianSyncPushResponse(
        server_time=datetime.now(timezone.utc),
        accepted=len(payload.changes),
    )
