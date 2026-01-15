"""Aggregate router for API v1."""

from fastapi import APIRouter

from atlasops.api.v1 import auth, jobs, profile, applications

router = APIRouter(prefix="/api/v1")

router.include_router(auth.router, prefix="/auth", tags=["auth"])
router.include_router(jobs.router, prefix="/jobs", tags=["jobs"])
router.include_router(profile.router, prefix="/profile", tags=["profile"])
router.include_router(applications.router, prefix="/applications", tags=["applications"])
