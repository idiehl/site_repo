"""Admin dashboard API endpoints."""

from datetime import datetime, timedelta, timezone
from typing import Optional
from uuid import UUID

from fastapi import APIRouter, Depends, Query
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from atlasops.api.deps import AdminUser, DbSession
from atlasops.models.analytics import ApiUsage, SecurityEvent, SiteVisit
from atlasops.models.user import User
from atlasops.models.job import JobPosting
from atlasops.models.application import Application

router = APIRouter()


@router.get("/stats/overview")
async def get_overview_stats(
    db: DbSession,
    admin: AdminUser,
    days: int = Query(default=30, ge=1, le=365),
):
    """Get overview statistics for the admin dashboard."""
    cutoff_date = datetime.now(timezone.utc) - timedelta(days=days)
    
    # User stats
    total_users_result = await db.execute(select(func.count(User.id)))
    total_users = total_users_result.scalar() or 0
    
    new_users_result = await db.execute(
        select(func.count(User.id)).where(User.created_at >= cutoff_date)
    )
    new_users = new_users_result.scalar() or 0
    
    # Job posting stats
    total_jobs_result = await db.execute(select(func.count(JobPosting.id)))
    total_jobs = total_jobs_result.scalar() or 0
    
    recent_jobs_result = await db.execute(
        select(func.count(JobPosting.id)).where(JobPosting.created_at >= cutoff_date)
    )
    recent_jobs = recent_jobs_result.scalar() or 0
    
    # Application stats
    total_apps_result = await db.execute(select(func.count(Application.id)))
    total_apps = total_apps_result.scalar() or 0
    
    recent_apps_result = await db.execute(
        select(func.count(Application.id)).where(Application.created_at >= cutoff_date)
    )
    recent_apps = recent_apps_result.scalar() or 0
    
    # Site visit stats
    total_visits_result = await db.execute(
        select(func.count(SiteVisit.id)).where(SiteVisit.created_at >= cutoff_date)
    )
    total_visits = total_visits_result.scalar() or 0
    
    unique_visitors_result = await db.execute(
        select(func.count(func.distinct(SiteVisit.session_id)))
        .where(SiteVisit.created_at >= cutoff_date)
        .where(SiteVisit.session_id.isnot(None))
    )
    unique_visitors = unique_visitors_result.scalar() or 0
    
    # API usage stats
    total_api_calls_result = await db.execute(
        select(func.count(ApiUsage.id)).where(ApiUsage.created_at >= cutoff_date)
    )
    total_api_calls = total_api_calls_result.scalar() or 0
    
    avg_response_time_result = await db.execute(
        select(func.avg(ApiUsage.response_time_ms))
        .where(ApiUsage.created_at >= cutoff_date)
    )
    avg_response_time = avg_response_time_result.scalar() or 0.0
    
    error_rate_result = await db.execute(
        select(
            func.count(ApiUsage.id).filter(ApiUsage.status_code >= 400),
            func.count(ApiUsage.id),
        )
        .where(ApiUsage.created_at >= cutoff_date)
    )
    error_row = error_rate_result.first()
    error_count = error_row[0] or 0
    total_calls = error_row[1] or 1
    error_rate = (error_count / total_calls * 100) if total_calls > 0 else 0.0
    
    # Security events
    unresolved_security_result = await db.execute(
        select(func.count(SecurityEvent.id))
        .where(SecurityEvent.resolved == False)
    )
    unresolved_security = unresolved_security_result.scalar() or 0
    
    critical_security_result = await db.execute(
        select(func.count(SecurityEvent.id))
        .where(SecurityEvent.severity == "critical")
        .where(SecurityEvent.resolved == False)
    )
    critical_security = critical_security_result.scalar() or 0
    
    return {
        "period_days": days,
        "users": {
            "total": total_users,
            "new": new_users,
        },
        "jobs": {
            "total": total_jobs,
            "recent": recent_jobs,
        },
        "applications": {
            "total": total_apps,
            "recent": recent_apps,
        },
        "traffic": {
            "total_visits": total_visits,
            "unique_visitors": unique_visitors,
        },
        "api": {
            "total_calls": total_api_calls,
            "avg_response_time_ms": round(avg_response_time, 2),
            "error_rate_percent": round(error_rate, 2),
        },
        "security": {
            "unresolved_events": unresolved_security,
            "critical_events": critical_security,
        },
    }


@router.get("/analytics/visits")
async def get_visit_analytics(
    db: DbSession,
    admin: AdminUser,
    days: int = Query(default=7, ge=1, le=90),
    limit: int = Query(default=100, ge=1, le=1000),
):
    """Get site visit analytics."""
    cutoff_date = datetime.now(timezone.utc) - timedelta(days=days)
    
    # Get recent visits
    visits_result = await db.execute(
        select(SiteVisit)
        .where(SiteVisit.created_at >= cutoff_date)
        .order_by(SiteVisit.created_at.desc())
        .limit(limit)
    )
    visits = visits_result.scalars().all()
    
    # Get popular paths
    popular_paths_result = await db.execute(
        select(
            SiteVisit.path,
            func.count(SiteVisit.id).label("count"),
        )
        .where(SiteVisit.created_at >= cutoff_date)
        .group_by(SiteVisit.path)
        .order_by(func.count(SiteVisit.id).desc())
        .limit(20)
    )
    popular_paths = [
        {"path": row[0], "count": row[1]} for row in popular_paths_result.all()
    ]
    
    # Get visits by day
    visits_by_day_result = await db.execute(
        select(
            func.date(SiteVisit.created_at).label("date"),
            func.count(SiteVisit.id).label("count"),
        )
        .where(SiteVisit.created_at >= cutoff_date)
        .group_by(func.date(SiteVisit.created_at))
        .order_by(func.date(SiteVisit.created_at))
    )
    visits_by_day = [
        {"date": row[0].isoformat(), "count": row[1]} for row in visits_by_day_result.all()
    ]
    
    return {
        "recent_visits": [
            {
                "id": str(v.id),
                "path": v.path,
                "method": v.method,
                "ip_address": v.ip_address,
                "user_id": str(v.user_id) if v.user_id else None,
                "created_at": v.created_at.isoformat(),
            }
            for v in visits
        ],
        "popular_paths": popular_paths,
        "visits_by_day": visits_by_day,
    }


@router.get("/analytics/api-usage")
async def get_api_usage_analytics(
    db: DbSession,
    admin: AdminUser,
    days: int = Query(default=7, ge=1, le=90),
    limit: int = Query(default=100, ge=1, le=1000),
):
    """Get API usage analytics."""
    cutoff_date = datetime.now(timezone.utc) - timedelta(days=days)
    
    # Get recent API calls
    usage_result = await db.execute(
        select(ApiUsage)
        .where(ApiUsage.created_at >= cutoff_date)
        .order_by(ApiUsage.created_at.desc())
        .limit(limit)
    )
    usage = usage_result.scalars().all()
    
    # Get endpoint statistics
    endpoint_stats_result = await db.execute(
        select(
            ApiUsage.endpoint,
            ApiUsage.method,
            func.count(ApiUsage.id).label("count"),
            func.avg(ApiUsage.response_time_ms).label("avg_time"),
            func.count(ApiUsage.id).filter(ApiUsage.status_code >= 400).label("error_count"),
        )
        .where(ApiUsage.created_at >= cutoff_date)
        .group_by(ApiUsage.endpoint, ApiUsage.method)
        .order_by(func.count(ApiUsage.id).desc())
        .limit(50)
    )
    endpoint_stats = [
        {
            "endpoint": row[0],
            "method": row[1],
            "count": row[2],
            "avg_response_time_ms": round(row[3] or 0, 2),
            "error_count": row[4],
        }
        for row in endpoint_stats_result.all()
    ]
    
    # Get usage by day
    usage_by_day_result = await db.execute(
        select(
            func.date(ApiUsage.created_at).label("date"),
            func.count(ApiUsage.id).label("count"),
            func.avg(ApiUsage.response_time_ms).label("avg_time"),
        )
        .where(ApiUsage.created_at >= cutoff_date)
        .group_by(func.date(ApiUsage.created_at))
        .order_by(func.date(ApiUsage.created_at))
    )
    usage_by_day = [
        {
            "date": row[0].isoformat(),
            "count": row[1],
            "avg_response_time_ms": round(row[2] or 0, 2),
        }
        for row in usage_by_day_result.all()
    ]
    
    return {
        "recent_calls": [
            {
                "id": str(u.id),
                "endpoint": u.endpoint,
                "method": u.method,
                "status_code": u.status_code,
                "response_time_ms": u.response_time_ms,
                "user_id": str(u.user_id) if u.user_id else None,
                "error_message": u.error_message,
                "created_at": u.created_at.isoformat(),
            }
            for u in usage
        ],
        "endpoint_stats": endpoint_stats,
        "usage_by_day": usage_by_day,
    }


@router.get("/security/events")
async def get_security_events(
    db: DbSession,
    admin: AdminUser,
    resolved: Optional[bool] = Query(default=None),
    severity: Optional[str] = Query(default=None),
    limit: int = Query(default=100, ge=1, le=1000),
):
    """Get security events."""
    query = select(SecurityEvent).order_by(SecurityEvent.created_at.desc())
    
    if resolved is not None:
        query = query.where(SecurityEvent.resolved == resolved)
    if severity:
        query = query.where(SecurityEvent.severity == severity)
    
    query = query.limit(limit)
    
    events_result = await db.execute(query)
    events = events_result.scalars().all()
    
    return {
        "events": [
            {
                "id": str(e.id),
                "event_type": e.event_type,
                "severity": e.severity,
                "user_id": str(e.user_id) if e.user_id else None,
                "ip_address": e.ip_address,
                "details": e.details,
                "resolved": e.resolved,
                "resolved_at": e.resolved_at.isoformat() if e.resolved_at else None,
                "created_at": e.created_at.isoformat(),
            }
            for e in events
        ],
    }


@router.post("/security/events/{event_id}/resolve")
async def resolve_security_event(
    event_id: UUID,
    db: DbSession,
    admin: AdminUser,
):
    """Mark a security event as resolved."""
    result = await db.execute(
        select(SecurityEvent).where(SecurityEvent.id == event_id)
    )
    event = result.scalar_one_or_none()
    
    if not event:
        from fastapi import HTTPException, status
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Security event not found",
        )
    
    event.resolved = True
    event.resolved_at = datetime.now(timezone.utc)
    event.resolved_by = admin.id
    
    await db.commit()
    await db.refresh(event)
    
    return {
        "id": str(event.id),
        "resolved": event.resolved,
        "resolved_at": event.resolved_at.isoformat(),
    }
