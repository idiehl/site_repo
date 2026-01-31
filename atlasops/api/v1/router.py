"""Aggregate router for API v1."""

from fastapi import APIRouter

from atlasops.api.v1 import admin, auth, billing, dev, jobs, playground, profile, applications

router = APIRouter(prefix="/api/v1")

router.include_router(auth.router, prefix="/auth", tags=["auth"])
router.include_router(jobs.router, prefix="/jobs", tags=["jobs"])
router.include_router(profile.router, prefix="/profile", tags=["profile"])
router.include_router(applications.router, prefix="/applications", tags=["applications"])
router.include_router(billing.router, prefix="/billing", tags=["billing"])
router.include_router(admin.router, prefix="/admin", tags=["admin"])
router.include_router(dev.router)
router.include_router(playground.router)
