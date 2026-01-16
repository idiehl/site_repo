"""AtlasOps - FastAPI Application Entrypoint."""

from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from atlasops.api.v1.router import router as api_router
from atlasops.config import get_settings
from atlasops.middleware.analytics import AnalyticsMiddleware

settings = get_settings()

# Ensure uploads directory exists
UPLOADS_DIR = Path(__file__).parent / "uploads"
UPLOADS_DIR.mkdir(exist_ok=True)
(UPLOADS_DIR / "avatars").mkdir(exist_ok=True)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan manager."""
    # Startup
    yield
    # Shutdown


app = FastAPI(
    title="AtlasOps",
    description="AI-powered job application management and resume generation platform",
    version="0.1.0",
    lifespan=lifespan,
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Analytics middleware (track site visits and API usage)
app.add_middleware(AnalyticsMiddleware)

# Include API router
app.include_router(api_router)


# Health check endpoint
@app.get("/health")
async def health_check():
    """Health check endpoint for monitoring."""
    return {"status": "healthy", "version": "0.1.0"}


@app.get("/")
async def root():
    """Root endpoint - redirect to app or show info."""
    return {
        "app": "AtlasOps",
        "version": "0.1.0",
        "docs": "/docs",
        "health": "/health",
    }


# Mount uploads directory for serving user-uploaded files
app.mount("/uploads", StaticFiles(directory=str(UPLOADS_DIR)), name="uploads")

# Mount static files for frontend (after build)
# Uncomment when frontend is built:
# app.mount("/app", StaticFiles(directory="frontend/dist", html=True), name="frontend")


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "app:app",
        host="0.0.0.0",
        port=8000,
        reload=settings.debug,
    )
