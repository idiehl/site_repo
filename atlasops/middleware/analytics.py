"""Middleware for tracking analytics."""

import asyncio
import time
from typing import Callable

from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware

from atlasops.db import async_session_maker
from atlasops.models.analytics import ApiUsage, SiteVisit


class AnalyticsMiddleware(BaseHTTPMiddleware):
    """Middleware to track site visits and API usage."""

    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        """Process request and track analytics."""
        start_time = time.time()
        
        # Process request
        response = await call_next(request)
        
        # Calculate response time
        response_time_ms = int((time.time() - start_time) * 1000)
        
        # Track analytics in background (don't block response)
        # Use asyncio.create_task to run in background
        asyncio.create_task(
            self._track_analytics(
                request=request,
                response=response,
                response_time_ms=response_time_ms,
            )
        )
        
        return response
    
    async def _track_analytics(
        self,
        request: Request,
        response: Response,
        response_time_ms: int,
    ):
        """Track analytics data."""
        try:
            # Skip tracking for admin endpoints (to avoid recursion)
            if request.url.path.startswith("/api/v1/admin"):
                return
            
            # Skip tracking for health checks and docs
            if request.url.path in ["/health", "/docs", "/openapi.json", "/redoc"]:
                return
            
            # Get user ID from request state if available (set by auth dependency)
            user_id = None
            if hasattr(request.state, "user") and request.state.user:
                user_id = request.state.user.id
            
            # Extract IP address
            ip_address = request.client.host if request.client else None
            
            # Track site visit for non-API routes
            if not request.url.path.startswith("/api/"):
                async with async_session_maker() as db:
                    visit = SiteVisit(
                        user_id=user_id,
                        path=str(request.url.path),
                        method=request.method,
                        ip_address=ip_address,
                        user_agent=request.headers.get("user-agent"),
                        referer=request.headers.get("referer"),
                        session_id=request.cookies.get("session_id"),
                    )
                    db.add(visit)
                    await db.commit()
            
            # Track API usage
            if request.url.path.startswith("/api/"):
                async with async_session_maker() as db:
                    usage = ApiUsage(
                        user_id=user_id,
                        endpoint=str(request.url.path),
                        method=request.method,
                        status_code=response.status_code,
                        response_time_ms=response_time_ms,
                        ip_address=ip_address,
                        error_message=None if response.status_code < 400 else f"HTTP {response.status_code}",
                    )
                    db.add(usage)
                    await db.commit()
        except Exception:
            # Silently fail - don't break the request if analytics fails
            pass
