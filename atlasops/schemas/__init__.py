"""Pydantic schemas for request/response validation."""

from atlasops.schemas.user import (
    PasswordResetConfirm,
    PasswordResetRequest,
    PasswordResetResponse,
    TokenResponse,
    UserCreate,
    UserResponse,
    UserProfileResponse,
    UserProfileUpdate,
)
from atlasops.schemas.job import (
    JobIngestRequest,
    JobIngestResponse,
    JobPostingResponse,
)
from atlasops.schemas.application import (
    ApplicationCreate,
    ApplicationResponse,
    ApplicationUpdate,
)
from atlasops.schemas.resume import (
    ResumeGenerateRequest,
    ResumeResponse,
)
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
from atlasops.schemas.electracast import (
    ElectraCastAccountResponse,
    ElectraCastProfileResponse,
    ElectraCastProfileUpdate,
)

__all__ = [
    "TokenResponse",
    "PasswordResetConfirm",
    "PasswordResetRequest",
    "PasswordResetResponse",
    "UserCreate",
    "UserResponse",
    "UserProfileResponse",
    "UserProfileUpdate",
    "JobIngestRequest",
    "JobIngestResponse",
    "JobPostingResponse",
    "ApplicationCreate",
    "ApplicationResponse",
    "ApplicationUpdate",
    "ResumeGenerateRequest",
    "ResumeResponse",
    "MeridianDocumentPayload",
    "MeridianProjectCreate",
    "MeridianProjectDetail",
    "MeridianProjectSummary",
    "MeridianStatusResponse",
    "MeridianSyncPullRequest",
    "MeridianSyncPullResponse",
    "MeridianSyncPushRequest",
    "MeridianSyncPushResponse",
    "ElectraCastAccountResponse",
    "ElectraCastProfileResponse",
    "ElectraCastProfileUpdate",
]
