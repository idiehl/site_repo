"""Resume generation models."""

from datetime import datetime, timezone
from typing import TYPE_CHECKING, Optional
from uuid import uuid4

from sqlalchemy import DateTime, Float, ForeignKey, String, Text
from sqlalchemy.dialects.postgresql import JSON, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from atlasops.db import Base

if TYPE_CHECKING:
    from atlasops.models.job import JobPosting


class GeneratedResume(Base):
    """AI-generated resume tailored to a job posting."""

    __tablename__ = "generated_resumes"

    id: Mapped[UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid4
    )
    job_posting_id: Mapped[UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("job_postings.id", ondelete="CASCADE")
    )

    # Resume content
    template_id: Mapped[str] = mapped_column(String(50), default="default")
    content_json: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True)
    rendered_html: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    file_path: Mapped[Optional[str]] = mapped_column(String(512), nullable=True)

    # Matching analysis
    match_score: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    matched_keywords: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True)
    gaps: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True)

    # Generation metadata
    model_used: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    prompt_version: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )

    # Relationships
    job_posting: Mapped["JobPosting"] = relationship(
        "JobPosting", back_populates="resumes"
    )


class GeneratedCoverLetter(Base):
    """AI-generated cover letter tailored to a job posting."""

    __tablename__ = "generated_cover_letters"

    id: Mapped[UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid4
    )
    job_posting_id: Mapped[UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("job_postings.id", ondelete="CASCADE")
    )

    # Cover letter content
    content_json: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True)
    full_text: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    # Generation metadata
    model_used: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    prompt_version: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )

    # Relationships
    job_posting: Mapped["JobPosting"] = relationship(
        "JobPosting", back_populates="cover_letters"
    )
