"""User and profile models."""

from datetime import datetime, timezone
from typing import TYPE_CHECKING, List, Optional
from uuid import uuid4

from sqlalchemy import DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.dialects.postgresql import JSON, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from atlasops.db import Base

if TYPE_CHECKING:
    from atlasops.models.application import Application
    from atlasops.models.job import JobPosting
    from atlasops.models.electracast import ElectraCastProfile


class User(Base):
    """User account model."""

    __tablename__ = "users"

    id: Mapped[UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid4
    )
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    hashed_password: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    
    # OAuth fields
    oauth_provider: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    oauth_provider_id: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    
    # Admin flag
    is_admin: Mapped[bool] = mapped_column(default=False, nullable=False)

    # Subscription/billing fields
    subscription_tier: Mapped[str] = mapped_column(
        String(50), default="free", nullable=False
    )
    subscription_status: Mapped[str] = mapped_column(
        String(50), default="free", nullable=False
    )
    stripe_customer_id: Mapped[Optional[str]] = mapped_column(
        String(255), nullable=True
    )
    stripe_subscription_id: Mapped[Optional[str]] = mapped_column(
        String(255), nullable=True
    )
    current_period_end: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True), nullable=True
    )

    # Usage tracking
    resume_generations_used: Mapped[int] = mapped_column(default=0, nullable=False)
    resume_generation_reset_at: Mapped[Optional[datetime]] = mapped_column(
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
    profile: Mapped[Optional["UserProfile"]] = relationship(
        "UserProfile", back_populates="user", uselist=False
    )
    job_postings: Mapped[List["JobPosting"]] = relationship(
        "JobPosting", back_populates="user"
    )
    applications: Mapped[List["Application"]] = relationship(
        "Application", back_populates="user"
    )
    electracast_profile: Mapped[Optional["ElectraCastProfile"]] = relationship(
        "ElectraCastProfile", back_populates="user", uselist=False
    )


class UserProfile(Base):
    """User profile with work history, skills, etc."""

    __tablename__ = "user_profiles"

    id: Mapped[UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid4
    )
    user_id: Mapped[UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), unique=True
    )

    # Basic info
    full_name: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    headline: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    summary: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    
    # New fields for enhanced profile
    profile_picture_url: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    location: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    phone: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    
    # Social links stored as JSON: {"linkedin": "...", "github": "...", "twitter": "...", "portfolio": "..."}
    social_links: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True)
    
    # Resume storage
    resume_file_url: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    resume_parsed_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    
    # Profile completeness (0-100)
    completeness_score: Mapped[int] = mapped_column(default=0)
    
    # Structured data stored as JSON for flexibility
    work_history: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True)
    education: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True)
    skills: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True)
    projects: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True)
    certifications: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True)
    contact_info: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

    # Relationships
    user: Mapped["User"] = relationship("User", back_populates="profile")
    
    def calculate_completeness(self) -> int:
        """Calculate profile completeness score (0-100)."""
        score = 0
        weights = {
            "full_name": 10,
            "headline": 10,
            "summary": 10,
            "profile_picture_url": 5,
            "location": 5,
            "phone": 5,
            "work_history": 20,
            "education": 10,
            "skills": 15,
            "projects": 5,
            "certifications": 5,
        }
        
        if self.full_name:
            score += weights["full_name"]
        if self.headline:
            score += weights["headline"]
        if self.summary:
            score += weights["summary"]
        if self.profile_picture_url:
            score += weights["profile_picture_url"]
        if self.location:
            score += weights["location"]
        if self.phone:
            score += weights["phone"]
        if self.work_history and len(self.work_history) > 0:
            score += weights["work_history"]
        if self.education and len(self.education) > 0:
            score += weights["education"]
        if self.skills and len(self.skills) > 0:
            score += weights["skills"]
        if self.projects and len(self.projects) > 0:
            score += weights["projects"]
        if self.certifications and len(self.certifications) > 0:
            score += weights["certifications"]
            
        return min(score, 100)