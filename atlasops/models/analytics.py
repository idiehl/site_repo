"""Analytics and tracking models for admin dashboard."""

from datetime import datetime, timezone
from typing import Optional
from uuid import uuid4

from sqlalchemy import DateTime, Integer, String, Text
from sqlalchemy.dialects.postgresql import JSON, UUID
from sqlalchemy.orm import Mapped, mapped_column

from atlasops.db import Base


class SiteVisit(Base):
    """Track page visits and user navigation."""

    __tablename__ = "site_visits"

    id: Mapped[UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid4
    )
    user_id: Mapped[Optional[UUID]] = mapped_column(
        UUID(as_uuid=True), nullable=True, index=True
    )
    path: Mapped[str] = mapped_column(String(500), nullable=False, index=True)
    method: Mapped[str] = mapped_column(String(10), nullable=False)
    ip_address: Mapped[Optional[str]] = mapped_column(String(45), nullable=True)
    user_agent: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    referer: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    session_id: Mapped[Optional[str]] = mapped_column(String(255), nullable=True, index=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
        index=True,
    )


class ApiUsage(Base):
    """Track API endpoint usage and performance."""

    __tablename__ = "api_usage"

    id: Mapped[UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid4
    )
    user_id: Mapped[Optional[UUID]] = mapped_column(
        UUID(as_uuid=True), nullable=True, index=True
    )
    endpoint: Mapped[str] = mapped_column(String(500), nullable=False, index=True)
    method: Mapped[str] = mapped_column(String(10), nullable=False)
    status_code: Mapped[int] = mapped_column(Integer, nullable=False, index=True)
    response_time_ms: Mapped[int] = mapped_column(Integer, nullable=False)
    ip_address: Mapped[Optional[str]] = mapped_column(String(45), nullable=True)
    error_message: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
        index=True,
    )


class SecurityEvent(Base):
    """Track security-related events."""

    __tablename__ = "security_events"

    id: Mapped[UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid4
    )
    event_type: Mapped[str] = mapped_column(String(100), nullable=False, index=True)
    severity: Mapped[str] = mapped_column(String(20), nullable=False, index=True)  # low, medium, high, critical
    user_id: Mapped[Optional[UUID]] = mapped_column(
        UUID(as_uuid=True), nullable=True, index=True
    )
    ip_address: Mapped[Optional[str]] = mapped_column(String(45), nullable=True, index=True)
    user_agent: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    details: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True)
    resolved: Mapped[bool] = mapped_column(default=False, nullable=False, index=True)
    resolved_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
    resolved_by: Mapped[Optional[UUID]] = mapped_column(
        UUID(as_uuid=True), nullable=True
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
        index=True,
    )
