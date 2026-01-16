"""Job posting and company models."""

from datetime import datetime, timezone
from typing import TYPE_CHECKING, List, Optional
from uuid import uuid4

from sqlalchemy import DateTime, ForeignKey, String, Text
from sqlalchemy.dialects.postgresql import JSON, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from atlasops.db import Base

if TYPE_CHECKING:
    from atlasops.models.application import Application
    from atlasops.models.resume import GeneratedCoverLetter, GeneratedResume
    from atlasops.models.user import User


class JobPosting(Base):
    """Job posting with raw and structured data."""

    __tablename__ = "job_postings"

    id: Mapped[UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid4
    )
    user_id: Mapped[UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE")
    )

    # Source data
    url: Mapped[str] = mapped_column(String(2048))
    url_hash: Mapped[Optional[str]] = mapped_column(String(64), index=True, nullable=True)
    raw_text: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    # Extracted structured data
    company_name: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    job_title: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    location: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    remote_policy: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    salary_range: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    job_description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    requirements: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True)
    benefits: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True)
    structured_data: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True)

    # Processing status
    status: Mapped[str] = mapped_column(
        String(50), default="pending"
    )  # pending, processing, completed, failed
    extraction_confidence: Mapped[Optional[float]] = mapped_column(nullable=True)
    error_message: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    # Application tracking (built-in status without separate Application entity)
    application_status: Mapped[Optional[str]] = mapped_column(
        String(50), nullable=True
    )  # null, applied, interview_scheduled, followup_sent, second_interview
    interview_date: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
    interview_notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    applied_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True), nullable=True
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

    # Relationships
    user: Mapped["User"] = relationship("User", back_populates="job_postings")
    applications: Mapped[List["Application"]] = relationship(
        "Application", back_populates="job_posting"
    )
    resumes: Mapped[List["GeneratedResume"]] = relationship(
        "GeneratedResume", back_populates="job_posting"
    )
    cover_letters: Mapped[List["GeneratedCoverLetter"]] = relationship(
        "GeneratedCoverLetter", back_populates="job_posting"
    )
    deep_dive: Mapped[Optional["CompanyDeepDive"]] = relationship(
        "CompanyDeepDive", back_populates="job_posting", uselist=False
    )


class CompanyDeepDive(Base):
    """AI-generated company research and insights."""

    __tablename__ = "company_deep_dives"

    id: Mapped[UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid4
    )
    job_posting_id: Mapped[UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("job_postings.id", ondelete="CASCADE"), unique=True
    )

    # Generated content
    company_overview: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    culture_insights: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    role_analysis: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    interview_tips: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    summary_json: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True)
    sources: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True)

    # Generation metadata
    model_used: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    prompt_version: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)

    generated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )

    # Relationships
    job_posting: Mapped["JobPosting"] = relationship(
        "JobPosting", back_populates="deep_dive"
    )
